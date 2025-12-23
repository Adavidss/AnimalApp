import { API_URLS, CACHE_DURATION } from '../utils/constants';
import { getCache, setCache } from '../utils/cache';
import type { UnsplashImage } from '../types/animal';

export interface INatObservation {
  id: number;
  taxon: {
    id: number;
    name: string;
    rank: string;
    preferred_common_name?: string;
    iconic_taxon_name: string;
    wikipedia_url?: string;
  };
  photos: Array<{
    id?: number;
    url: string;
    attribution?: string;
    license_code?: string;
    square_url?: string;
    medium_url?: string;
    large_url?: string;
  }>;
  location?: [number, number];
  observed_on: string;
  description?: string;
}

export interface INatTaxon {
  id: number;
  name: string;
  rank: string;
  preferred_common_name?: string;
  wikipedia_url?: string;
  default_photo?: {
    medium_url: string;
    attribution: string;
  };
  iconic_taxon_name: string;
  conservation_status?: {
    status: string;
    status_name: string;
  };
  wikipedia_summary?: string;
}

/**
 * Search for species on iNaturalist (ANIMALS ONLY - no plants!)
 * Supports both text search (q parameter) and taxon filtering (taxon_id parameter)
 */
export async function searchINatSpecies(
  query: string,
  page: number = 1,
  perPage: number = 30
): Promise<INatTaxon[]> {
  // v2: Added taxon_id mapping for better results
  const cacheKey = `inat_species_v2_${query.toLowerCase()}_p${page}_pp${perPage}`;
  const cached = getCache<INatTaxon[]>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    // Map common taxonomy names to taxon IDs for better results
    const taxonIdMap: Record<string, number> = {
      'actinopterygii': 47178,  // Ray-finned fish
      'mammalia': 40151,        // Mammals
      'aves': 3,                // Birds
      'reptilia': 26036,        // Reptiles
      'amphibia': 20978,        // Amphibians
      'animalia': 1,            // All animals
    };

    const lowerQuery = query.toLowerCase();
    let url = `${API_URLS.INATURALIST}/taxa?`;

    // If query matches a known taxon, use taxon_id; otherwise use text search
    if (taxonIdMap[lowerQuery]) {
      url += `taxon_id=${taxonIdMap[lowerQuery]}&rank=species&per_page=${perPage}&page=${page}`;
    } else {
      url += `q=${encodeURIComponent(query)}&iconic_taxa=Animalia&rank=species&per_page=${perPage}&page=${page}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      console.warn('iNaturalist species search failed');
      return [];
    }

    const data = await response.json();
    const results = data.results || [];

    setCache(cacheKey, results, CACHE_DURATION.ANIMAL_DATA);
    return results;
  } catch (error) {
    console.error('Error searching iNaturalist species:', error);
    return [];
  }
}

/**
 * Get observations for a species (ANIMALS ONLY)
 */
export async function getINatObservations(
  taxonName: string,
  perPage: number = 30
): Promise<INatObservation[]> {
  const cacheKey = `inat_obs_v3_${taxonName.toLowerCase()}`;
  const cached = getCache<INatObservation[]>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    // Use AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    try {
      // Try research-grade first (highest quality)
      let response = await fetch(
        `${API_URLS.INATURALIST}/observations?taxon_name=${encodeURIComponent(taxonName)}&iconic_taxa=Animalia&quality_grade=research&photos=true&per_page=${Math.min(perPage, 10)}`, // Limit to 10 max
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        return [];
      }

      let data = await response.json();
      let results = data.results || [];

      // If no research-grade results, try without quality filter (but still require photos)
      if (results.length === 0) {
        const controller2 = new AbortController();
        const timeoutId2 = setTimeout(() => controller2.abort(), 2000); // 2 second timeout for fallback
        
        try {
          response = await fetch(
            `${API_URLS.INATURALIST}/observations?taxon_name=${encodeURIComponent(taxonName)}&iconic_taxa=Animalia&photos=true&per_page=${Math.min(perPage, 10)}`,
            { signal: controller2.signal }
          );

          clearTimeout(timeoutId2);

          if (response.ok) {
            data = await response.json();
            results = data.results || [];
          }
        } catch (err) {
          clearTimeout(timeoutId2);
          // Timeout or abort - return empty
          return [];
        }
      }

      setCache(cacheKey, results, CACHE_DURATION.ANIMAL_DATA);
      return results;
    } catch (err) {
      clearTimeout(timeoutId);
      // Timeout or network error - return empty
      return [];
    }

    setCache(cacheKey, results, CACHE_DURATION.ANIMAL_DATA);
    return results;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.debug('Error fetching iNaturalist observations:', error);
    }
    return [];
  }
}

/**
 * Get taxon details by ID
 */
export async function getINatTaxonDetails(taxonId: number): Promise<INatTaxon | null> {
  const cacheKey = `inat_taxon_v2_${taxonId}`;
  const cached = getCache<INatTaxon>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(`${API_URLS.INATURALIST}/taxa/${taxonId}`);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const taxon = data.results?.[0] || null;

    if (taxon) {
      setCache(cacheKey, taxon, CACHE_DURATION.ANIMAL_DATA);
    }

    return taxon;
  } catch (error) {
    console.error('Error fetching iNaturalist taxon details:', error);
    return null;
  }
}

/**
 * Get photos for a species from iNaturalist
 * Uses research-grade observations for better quality
 */
export async function getINatPhotos(taxonName: string, count: number = 10): Promise<UnsplashImage[]> {
  const cacheKey = `inat_photos_${taxonName.toLowerCase()}_${count}`;
  const cached = getCache<UnsplashImage[]>(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    // Request fewer observations for faster loading - we only need a few photos
    const observations = await getINatObservations(taxonName, Math.min(count * 2, 10));

    if (import.meta.env.DEV) {
      console.log(`[iNaturalist] Found ${observations.length} observations for ${taxonName}`);
    }

    const photos: UnsplashImage[] = observations
      .filter((obs) => obs.photos && obs.photos.length > 0)
      .slice(0, count) // Limit to requested count
      .map((obs) => {
        // Get the best quality photo from the observation
        const photo = obs.photos[0];
        const photoUrl = photo.url || '';
        
        // iNaturalist photo URLs are typically like:
        // https://inaturalist-open-data.s3.amazonaws.com/photos/{id}/square.jpg
        // or https://static.inaturalist.org/photos/{id}/square.jpg
        // Extract photo ID and build URLs for all sizes
        
        let baseUrl: string;
        let photoId: string | null = null;
        const photoIdMatch = photoUrl.match(/photos\/(\d+)\//);
        
        if (photoIdMatch) {
          photoId = photoIdMatch[1];
          // Use static.inaturalist.org for all sizes (more reliable)
          baseUrl = `https://static.inaturalist.org/photos/${photoId}`;
          if (import.meta.env.DEV) {
            console.log(`[iNaturalist] Extracted photo ID: ${photoId}, baseUrl: ${baseUrl}`);
          }
        } else {
          // Fallback: try to extract from any URL pattern
          const cleanUrl = photoUrl.split('?')[0];
          baseUrl = cleanUrl.replace(/\/square\.jpg$/i, '')
                           .replace(/\/medium\.jpg$/i, '')
                           .replace(/\/large\.jpg$/i, '')
                           .replace(/\/small\.jpg$/i, '')
                           .replace(/\/original\.jpg$/i, '');
          
          if (!baseUrl || baseUrl === cleanUrl) {
            if (import.meta.env.DEV) {
              console.warn(`[iNaturalist] Could not extract photo ID from URL: ${photoUrl}`);
            }
            // Last resort: use the URL as-is but remove size suffix
            baseUrl = cleanUrl.replace(/\.(jpg|jpeg|png)$/i, '');
          }
        }
        
        const imageUrls = {
          raw: `${baseUrl}/original.jpg`,
          full: `${baseUrl}/large.jpg`,
          regular: `${baseUrl}/medium.jpg`,
          small: `${baseUrl}/small.jpg`,
          thumb: `${baseUrl}/square.jpg`,
        };

        if (import.meta.env.DEV) {
          console.log(`[iNaturalist] Built image URLs for photo ${photo.id || 'unknown'}:`, imageUrls);
        }

        return {
          id: `inat-${obs.id}-${photo.id || Date.now()}`,
          urls: imageUrls,
          alt_description: obs.taxon.preferred_common_name || obs.taxon.name,
          user: {
            name: photo.attribution || 'iNaturalist Community',
            username: 'inaturalist',
          },
          links: {
            html: `https://www.inaturalist.org/observations/${obs.id}`,
          },
        };
      });

    if (import.meta.env.DEV) {
      console.log(`[iNaturalist] Returning ${photos.length} photos for ${taxonName}`);
    }

    if (photos.length > 0) {
      setCache(cacheKey, photos, CACHE_DURATION.IMAGES);
    }
    
    return photos;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.debug('Error fetching iNaturalist photos:', error);
    }
    return [];
  }
}

/**
 * Get species information by common name
 */
export async function getINatSpeciesByName(commonName: string): Promise<INatTaxon | null> {
  try {
    const species = await searchINatSpecies(commonName);

    if (species.length === 0) {
      return null;
    }

    // Return the first match
    return species[0];
  } catch (error) {
    console.error('Error getting iNaturalist species by name:', error);
    return null;
  }
}

/**
 * Get geographic distribution data
 */
export async function getINatDistribution(taxonName: string): Promise<Array<{ lat: number; lng: number }>> {
  try {
    const observations = await getINatObservations(taxonName, 100);

    return observations
      .filter((obs) => obs.location && obs.location.length === 2)
      .map((obs) => ({
        lat: obs.location![1],
        lng: obs.location![0],
      }));
  } catch (error) {
    console.error('Error fetching iNaturalist distribution:', error);
    return [];
  }
}

/**
 * Search for iNaturalist projects related to a taxon
 */
export async function searchINatProjects(
  query: string,
  limit: number = 10
): Promise<Array<{
  id: number;
  title: string;
  description?: string;
  icon?: string;
  location?: string;
  taxa_count?: number;
  observations_count?: number;
}>> {
  try {
    const response = await fetch(
      `${API_URLS.INATURALIST}/projects?q=${encodeURIComponent(query)}&per_page=${limit}`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const results = data.results || [];

    return results.map((project: any) => ({
      id: project.id,
      title: project.title,
      description: project.description,
      icon: project.icon,
      location: project.location,
      taxa_count: project.taxa_count,
      observations_count: project.observations_count,
    }));
  } catch (error) {
    console.error('Error searching iNaturalist projects:', error);
    return [];
  }
}

/**
 * Search for places (locations) in iNaturalist
 */
export async function searchINatPlaces(
  query: string,
  limit: number = 10
): Promise<Array<{
  id: number;
  name: string;
  display_name: string;
  location?: [number, number];
  bounding_box?: {
    sw: [number, number];
    ne: [number, number];
  };
  place_type?: number;
}>> {
  try {
    const response = await fetch(
      `${API_URLS.INATURALIST}/places?q=${encodeURIComponent(query)}&per_page=${limit}`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const results = data.results || [];

    return results.map((place: any) => ({
      id: place.id,
      name: place.name,
      display_name: place.display_name,
      location: place.location,
      bounding_box: place.bounding_box_geojson
        ? {
            sw: place.bounding_box_geojson.coordinates[0][0],
            ne: place.bounding_box_geojson.coordinates[0][2],
          }
        : undefined,
      place_type: place.place_type,
    }));
  } catch (error) {
    console.error('Error searching iNaturalist places:', error);
    return [];
  }
}

/**
 * Get identifications for a taxon (who identified it)
 */
export async function getINatIdentifications(
  taxonId: number,
  limit: number = 20
): Promise<Array<{
  id: number;
  user: {
    id: number;
    login: string;
  };
  created_at: string;
  body?: string;
  current: boolean;
}>> {
  try {
    const response = await fetch(
      `${API_URLS.INATURALIST}/identifications?taxon_id=${taxonId}&per_page=${limit}&current=true`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const results = data.results || [];

    return results.map((id: any) => ({
      id: id.id,
      user: {
        id: id.user.id,
        login: id.user.login,
      },
      created_at: id.created_at,
      body: id.body,
      current: id.current,
    }));
  } catch (error) {
    console.error('Error fetching identifications:', error);
    return [];
  }
}
