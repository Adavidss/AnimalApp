import { WikipediaData } from '../types/animal';
import { API_URLS, CACHE_DURATION } from '../utils/constants';
import { getCache, setCache } from '../utils/cache';
import { handleApiErrorSilently } from '../utils/errorHandling';

/**
 * Fetch Wikipedia summary for an animal
 */
export async function fetchWikipediaSummary(animalName: string): Promise<WikipediaData | null> {
  const cacheKey = `wikipedia_${animalName.toLowerCase()}`;
  const cached = getCache<WikipediaData>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    // First, try the exact name
    let searchUrl = `${API_URLS.WIKIPEDIA}/page/summary/${encodeURIComponent(animalName)}`;
    let response = await fetch(searchUrl);

    // If not found, try to extract a simpler name (e.g., "European Peacock Butterfly" -> "Butterfly")
    if (!response.ok && animalName.includes(' ')) {
      const words = animalName.split(' ');
      const lastWord = words[words.length - 1];

      // Try just the last word (often the animal type)
      searchUrl = `${API_URLS.WIKIPEDIA}/page/summary/${encodeURIComponent(lastWord)}`;
      response = await fetch(searchUrl);
    }

    if (!response.ok) {
      return handleApiErrorSilently(
        new Error(`Wikipedia returned ${response.status}`),
        'Wikipedia',
        null
      );
    }

    const data = await response.json();

    const wikipediaData: WikipediaData = {
      title: data.title,
      extract: data.extract,
      thumbnail: data.thumbnail
        ? {
            source: data.thumbnail.source,
            width: data.thumbnail.width,
            height: data.thumbnail.height,
          }
        : undefined,
      pageId: data.pageid,
      url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(animalName)}`,
    };

    setCache(cacheKey, wikipediaData, CACHE_DURATION.ANIMAL_DATA);
    return wikipediaData;
  } catch (error) {
    return handleApiErrorSilently(error, 'Wikipedia', null);
  }
}

/**
 * Fetch full Wikipedia article HTML
 */
export async function fetchWikipediaArticle(animalName: string): Promise<string | null> {
  try {
    const url = `${API_URLS.WIKIPEDIA}/page/html/${encodeURIComponent(animalName)}`;
    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    return html;
  } catch (error) {
    console.error('Error fetching Wikipedia article:', error);
    return null;
  }
}

/**
 * Search Wikipedia for animal-related pages
 */
export async function searchWikipedia(query: string, limit: number = 10): Promise<any[]> {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=${encodeURIComponent(
      query
    )}&limit=${limit}&origin=*`;

    const response = await fetch(searchUrl);

    if (!response.ok) {
      throw new Error('Wikipedia search failed');
    }

    const data = await response.json();

    // OpenSearch returns [query, [titles], [descriptions], [urls]]
    if (data.length < 4) {
      return [];
    }

    const titles = data[1];
    const descriptions = data[2];
    const urls = data[3];

    return titles.map((title: string, index: number) => ({
      title,
      description: descriptions[index],
      url: urls[index],
    }));
  } catch (error) {
    console.error('Error searching Wikipedia:', error);
    return [];
  }
}

/**
 * Get Wikipedia image URL
 */
export async function getWikipediaImage(animalName: string): Promise<string | null> {
  try {
    const summary = await fetchWikipediaSummary(animalName);
    return summary?.thumbnail?.source || null;
  } catch (error) {
    console.error('Error getting Wikipedia image:', error);
    return null;
  }
}

/**
 * Fetch related Wikipedia pages
 */
export async function fetchRelatedPages(animalName: string): Promise<any[]> {
  try {
    // Use MediaWiki API to get related pages
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=links&titles=${encodeURIComponent(
      animalName
    )}&pllimit=10&origin=*`;

    const response = await fetch(url);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const pages = data.query?.pages || {};
    const pageId = Object.keys(pages)[0];

    if (!pageId || pageId === '-1') {
      return [];
    }

    const links = pages[pageId].links || [];
    return links.map((link: any) => ({
      title: link.title,
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(link.title)}`,
    }));
  } catch (error) {
    console.error('Error fetching related pages:', error);
    return [];
  }
}
