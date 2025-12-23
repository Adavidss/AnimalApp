import { XenoCantoRecording } from '../types/animal';
import { API_URLS, API_KEYS, CACHE_DURATION } from '../utils/constants';
import { getCache, setCache } from '../utils/cache';
import { handleApiErrorSilently } from '../utils/errorHandling';

/**
 * Fetch with CORS proxy as fallback (for API v3)
 */
async function fetchWithProxy(apiUrl: string): Promise<any> {
  const proxyServices = [
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(apiUrl)}`,
    `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`,
    `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`
  ];
  
  for (const proxyUrl of proxyServices) {
    try {
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        mode: 'cors'
      });
      
      if (response.ok) {
        let data = await response.json();
        // Handle different proxy response formats
        if (data.contents) {
          // allorigins.win format
          try {
            data = JSON.parse(data.contents);
          } catch (parseError) {
            // If parsing fails, data might already be an object
            console.warn('Could not parse proxy response contents');
          }
        }
        return data;
      }
    } catch (proxyError) {
      console.warn(`Proxy failed: ${proxyUrl.substring(0, 50)}...`);
      continue;
    }
  }
  return null;
}

/**
 * Normalize URL from xeno-canto API v3 (handles // prefix)
 */
function normalizeUrl(url: string | undefined): string {
  if (!url) return '';
  if (url.startsWith('//')) {
    return `https:${url}`;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return url;
}

/**
 * Build API v3 URL with key and query
 */
function buildXenoCantoUrl(query: string, page: number = 1, perPage: number = 100): string {
  return `${API_URLS.XENO_CANTO}?query=${encodeURIComponent(query)}&key=${API_KEYS.XENO_CANTO}&page=${page}&per_page=${perPage}`;
}

/**
 * Process recordings from API v3 response (normalize URLs)
 */
function processRecordings(recordings: any[]): XenoCantoRecording[] {
  return recordings.map((rec: any) => {
    const processed: XenoCantoRecording = {
      id: rec.id || '',
      gen: rec.gen || '',
      sp: rec.sp || '',
      ssp: rec.ssp,
      en: rec.en || rec['en'] || '',
      rec: rec.rec || '',
      cnt: rec.cnt || '',
      loc: rec.loc || '',
      lat: rec.lat,
      lon: rec.lon,
      lng: rec.lon || rec.lng, // Support both formats
      alt: rec.alt,
      type: rec.type || '',
      file: normalizeUrl(rec.file),
      'file-name': rec['file-name'],
      url: normalizeUrl(rec.url),
      length: rec.length || '',
      time: rec.time,
      date: rec.date,
      q: rec.q || '',
      sex: rec.sex,
      stage: rec.stage,
      method: rec.method,
      lic: normalizeUrl(rec.lic),
      rmk: rec.rmk,
      also: rec.also || [],
    };

    // Process sonogram URLs
    if (rec.sono) {
      processed.sono = {
        small: rec.sono.small ? normalizeUrl(rec.sono.small) : undefined,
        med: rec.sono.med ? normalizeUrl(rec.sono.med) : undefined,
        large: rec.sono.large ? normalizeUrl(rec.sono.large) : undefined,
        full: rec.sono.full ? normalizeUrl(rec.sono.full) : undefined,
      };
    }

    // Fallback: construct file URL from ID if file URL is missing
    if (!processed.file && processed.id) {
      processed.file = `https://xeno-canto.org/${processed.id}/download`;
    }

    return processed;
  });
}

/**
 * Search for animal sound recordings on xeno-canto API v3
 * https://xeno-canto.org/explore/api
 */
export async function fetchAnimalSounds(
  query: string,
  limit: number = 10
): Promise<XenoCantoRecording[]> {
  const cacheKey = `sounds_${query.toLowerCase()}_${limit}`;
  const cached = getCache<XenoCantoRecording[]>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    // Try multiple query formats for better results
    const queries: string[] = [];
    
    // If query looks like scientific name (two words), try gen:sp format
    const parts = query.trim().split(/\s+/);
    if (parts.length === 2) {
      queries.push(`gen:${parts[0]}+sp:${parts[1]}`);
      queries.push(`${parts[0]} ${parts[1]}`); // Also try as regular search
    } else {
      // For common names or single words, try as genus or full search
      queries.push(query);
      queries.push(`gen:${query}`);
    }

    let allRecordings: XenoCantoRecording[] = [];

    for (const searchQuery of queries) {
      try {
        const apiUrl = buildXenoCantoUrl(searchQuery, 1, Math.min(limit * 2, 100));
        
        // Try CORS proxy first
        let data = await fetchWithProxy(apiUrl);
        
        // If proxy fails, try direct fetch
        if (!data) {
          try {
            const response = await fetch(apiUrl, {
              method: 'GET',
              headers: {
                'Accept': 'application/json'
              },
              mode: 'cors'
            });
            
            if (response.ok) {
              data = await response.json();
            } else {
              // Check for API errors
              if (response.status === 400 || response.status === 404) {
                continue; // Try next query format
              }
              throw new Error(`xeno-canto API returned ${response.status}`);
            }
          } catch (directError) {
            continue; // Try next query format
          }
        }

        // Check for API errors in response
        if (data && data.error) {
          // client_error and not_found are expected for animals without sounds - handle silently
          // Don't log these expected errors
          if (data.error === 'client_error' || data.error === 'not_found' || data.error === 'No results') {
            continue; // Try next query format silently
          }
          // Only log unexpected errors in development
          if (import.meta.env.DEV) {
            console.debug('xeno-canto API error:', data.error);
          }
          continue;
        }

        if (data && data.recordings && data.recordings.length > 0) {
          const processed = processRecordings(data.recordings);
          allRecordings.push(...processed);
          
          // If we have enough recordings, break
          if (allRecordings.length >= limit) {
            break;
          }
        }
      } catch (err) {
        console.warn(`Error fetching with query "${searchQuery}":`, err);
        continue;
      }
    }

    // Remove duplicates by ID and filter for quality
    const uniqueRecordings = Array.from(
      new Map(allRecordings.map(rec => [rec.id, rec])).values()
    );

    const filtered = uniqueRecordings
      .filter((rec) => rec.q && ['A', 'B', 'C'].includes(rec.q)) // Only good quality
      .slice(0, limit);

    // Cache results
    if (filtered.length > 0) {
      setCache(cacheKey, filtered, CACHE_DURATION.SOUNDS);
    }

    return filtered;
  } catch (error) {
    return handleApiErrorSilently(error, 'xeno-canto', []);
  }
}

/**
 * Search for bird songs specifically
 */
export async function fetchBirdSongs(
  scientificName: string,
  limit: number = 10
): Promise<XenoCantoRecording[]> {
  const cacheKey = `bird_songs_${scientificName.toLowerCase()}_${limit}`;
  const cached = getCache<XenoCantoRecording[]>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    // Build query for songs specifically
    let query = '';
    const parts = scientificName.trim().split(/\s+/);
    if (parts.length === 2) {
      query = `gen:${parts[0]}+sp:${parts[1]}+type:song`;
    } else {
      query = `${scientificName}+type:song`;
    }

    const apiUrl = buildXenoCantoUrl(query, 1, limit);
    
    // Try CORS proxy first
    let data = await fetchWithProxy(apiUrl);
    
    // If proxy fails, try direct fetch
    if (!data) {
      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          },
          mode: 'cors'
        });
        
        if (response.ok) {
          data = await response.json();
        } else {
          throw new Error(`xeno-canto API error: ${response.statusText}`);
        }
      } catch (directError) {
        throw directError;
      }
    }

    if (data && data.error) {
      throw new Error(data.error.message || 'xeno-canto API error');
    }

    const recordings: XenoCantoRecording[] = data?.recordings 
      ? processRecordings(data.recordings)
      : [];

    // Cache results
    if (recordings.length > 0) {
      setCache(cacheKey, recordings, CACHE_DURATION.SOUNDS);
    }

    return recordings;
  } catch (error) {
    console.error('Error fetching bird songs:', error);
    return [];
  }
}

/**
 * Get recording details by ID
 */
export async function getRecordingById(id: string): Promise<XenoCantoRecording | null> {
  const cacheKey = `recording_${id}`;
  const cached = getCache<XenoCantoRecording>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const query = `nr:${id}`;
    const apiUrl = buildXenoCantoUrl(query);
    
    // Try CORS proxy first
    let data = await fetchWithProxy(apiUrl);
    
    // If proxy fails, try direct fetch
    if (!data) {
      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          },
          mode: 'cors'
        });
        
        if (response.ok) {
          data = await response.json();
        } else {
          throw new Error(`xeno-canto API error: ${response.statusText}`);
        }
      } catch (directError) {
        throw directError;
      }
    }

    if (data && data.error) {
      throw new Error(data.error.message || 'xeno-canto API error');
    }

    const recordings: XenoCantoRecording[] = data?.recordings 
      ? processRecordings(data.recordings)
      : [];

    const recording = recordings.length > 0 ? recordings[0] : null;

    if (recording) {
      setCache(cacheKey, recording, CACHE_DURATION.SOUNDS);
    }

    return recording;
  } catch (error) {
    console.error('Error fetching recording by ID:', error);
    return null;
  }
}

/**
 * Search for recordings by location
 */
export async function fetchSoundsByLocation(
  country: string,
  genus?: string,
  limit: number = 10
): Promise<XenoCantoRecording[]> {
  const cacheKey = `sounds_location_${country}_${genus || 'all'}_${limit}`;
  const cached = getCache<XenoCantoRecording[]>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    let query = `cnt:"${country}"`;
    if (genus) {
      query += `+gen:${genus}`;
    }

    const apiUrl = buildXenoCantoUrl(query, 1, limit);
    
    // Try CORS proxy first
    let data = await fetchWithProxy(apiUrl);
    
    // If proxy fails, try direct fetch
    if (!data) {
      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          },
          mode: 'cors'
        });
        
        if (response.ok) {
          data = await response.json();
        } else {
          throw new Error(`xeno-canto API error: ${response.statusText}`);
        }
      } catch (directError) {
        throw directError;
      }
    }

    if (data && data.error) {
      throw new Error(data.error.message || 'xeno-canto API error');
    }

    const recordings: XenoCantoRecording[] = data?.recordings 
      ? processRecordings(data.recordings)
      : [];

    // Filter for quality
    const filtered = recordings
      .filter((rec) => rec.q && ['A', 'B', 'C'].includes(rec.q))
      .slice(0, limit);

    // Cache results
    if (filtered.length > 0) {
      setCache(cacheKey, filtered, CACHE_DURATION.SOUNDS);
    }

    return filtered;
  } catch (error) {
    console.error('Error fetching sounds by location:', error);
    return [];
  }
}

/**
 * Advanced search with filters (type, quality, sex, year, country, etc.)
 */
export interface XenoCantoSearchFilters {
  query?: string;
  type?: string; // song, call, etc.
  quality?: string; // A, B, C, D, E
  sex?: string; // M, F
  stage?: string; // adult, juvenile, etc.
  year?: string;
  country?: string;
  genus?: string;
  species?: string;
  limit?: number;
}

export async function searchXenoCantoRecordings(
  filters: XenoCantoSearchFilters
): Promise<XenoCantoRecording[]> {
  const { query, type, quality, sex, stage, year, country, genus, species, limit = 10 } = filters;
  
  // Build query parts
  const queryParts: string[] = [];
  
  // If a full query string is provided, use it directly (don't add individual filters to avoid duplication)
  if (query) {
    queryParts.push(query);
  } else {
    // Otherwise, build from individual filter parameters
    if (genus && species) {
      queryParts.push(`gen:${genus}+sp:${species}`);
    } else if (genus) {
      queryParts.push(`gen:${genus}`);
    }
    
    if (type) {
      queryParts.push(`type:${type}`);
    }
    
    if (quality) {
      queryParts.push(`q:${quality}`);
    }
    
    if (sex) {
      queryParts.push(`sex:${sex}`);
    }
    
    if (stage) {
      queryParts.push(`stage:${stage}`);
    }
    
    if (year) {
      queryParts.push(`year:${year}`);
    }
    
    if (country) {
      queryParts.push(`cnt:"${country}"`);
    }
  }
  
  const finalQuery = queryParts.join('+');
  const cacheKey = `xeno_search_${finalQuery}_${limit}`;
  const cached = getCache<XenoCantoRecording[]>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const apiUrl = buildXenoCantoUrl(finalQuery, 1, limit);
    
    // Try CORS proxy first
    let data = await fetchWithProxy(apiUrl);
    
    // If proxy fails, try direct fetch
    if (!data) {
      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          },
          mode: 'cors'
        });
        
        if (response.ok) {
          data = await response.json();
        } else {
          throw new Error(`xeno-canto API error: ${response.statusText}`);
        }
      } catch (directError) {
        throw directError;
      }
    }

    // Check for API errors in response
    if (data && data.error) {
      // Handle expected errors silently (client_error, not_found)
      if (data.error === 'client_error' || data.error === 'not_found' || data.error === 'No results') {
        if (import.meta.env.DEV) {
          console.debug('xeno-canto API returned no results for query:', finalQuery);
        }
        return [];
      }
      // Log unexpected errors
      const errorMsg = typeof data.error === 'string' ? data.error : (data.error.message || 'xeno-canto API error');
      if (import.meta.env.DEV) {
        console.warn('xeno-canto API error:', errorMsg);
      }
      return [];
    }

    const recordings: XenoCantoRecording[] = data?.recordings 
      ? processRecordings(data.recordings)
      : [];

    // Cache results
    if (recordings.length > 0) {
      setCache(cacheKey, recordings, CACHE_DURATION.SOUNDS);
    }

    return recordings;
  } catch (error) {
    // Don't log expected errors (CORS, network issues)
    if (import.meta.env.DEV) {
      console.debug('Error in advanced search:', error);
    }
    return [];
  }
}

/**
 * Get sound types available for a species
 */
export function getSoundTypes(recordings: XenoCantoRecording[]): string[] {
  const types = new Set<string>();
  recordings.forEach((rec) => {
    if (rec.type) {
      // Split by comma for multiple types
      rec.type.split(',').forEach((type) => {
        types.add(type.trim());
      });
    }
  });
  return Array.from(types).sort();
}

/**
 * Filter recordings by sound type (call, song, alarm, etc.)
 */
export function filterByType(
  recordings: XenoCantoRecording[],
  type: string
): XenoCantoRecording[] {
  return recordings.filter((rec) =>
    rec.type?.toLowerCase().includes(type.toLowerCase())
  );
}

/**
 * Get the highest quality recording from a list
 */
export function getBestQualityRecording(
  recordings: XenoCantoRecording[]
): XenoCantoRecording | null {
  if (recordings.length === 0) return null;

  const qualityOrder = { A: 4, B: 3, C: 2, D: 1, E: 0 };

  return recordings.reduce((best, current) => {
    const bestQuality = qualityOrder[best.q as keyof typeof qualityOrder] || 0;
    const currentQuality = qualityOrder[current.q as keyof typeof qualityOrder] || 0;
    return currentQuality > bestQuality ? current : best;
  });
}
