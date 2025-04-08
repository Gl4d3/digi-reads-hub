
import { cache } from '@/utils/cacheUtils';
import { cacheConfig } from '@/integrations/supabase/client';

/**
 * Enhanced fetch utility with built-in caching, retries, and error handling
 */
export async function fetchWithCache<T>(
  url: string,
  options: RequestInit = {},
  cacheKey: string,
  cacheDuration: number = cacheConfig.ttl.books, // Default to books TTL
  retries: number = 2
): Promise<T> {
  // Check in-memory cache first
  const cachedData = cache.books.get<T>(cacheKey);
  if (cachedData) {
    console.log(`Cache hit for: ${cacheKey}`);
    return cachedData;
  }

  // Try localStorage for frequently accessed data
  const localData = localStorage.getItem(`dr_api_${cacheKey}`);
  if (localData) {
    try {
      const parsedData = JSON.parse(localData);
      const expiryTime = parsedData.expiry || 0;
      
      // Check if the data is still valid
      if (expiryTime > Date.now()) {
        console.log(`LocalStorage cache hit for: ${cacheKey}`);
        // Also update memory cache
        cache.books.set(cacheKey, parsedData.data, expiryTime - Date.now());
        return parsedData.data;
      }
    } catch (e) {
      console.warn(`Error parsing cached data for ${cacheKey}`, e);
      localStorage.removeItem(`dr_api_${cacheKey}`);
    }
  }

  // Fetch with retries
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`Retry attempt ${attempt} for ${url}`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
      
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Store in memory cache
      cache.books.set(cacheKey, data, cacheDuration);
      
      // Store in localStorage for persistence across refreshes
      // Only store if data is small enough (<500KB)
      const jsonData = JSON.stringify(data);
      if (jsonData.length < 500000) {
        localStorage.setItem(`dr_api_${cacheKey}`, JSON.stringify({
          data,
          expiry: Date.now() + cacheDuration
        }));
      }
      
      return data as T;
    } catch (error) {
      console.error(`Fetch error (attempt ${attempt})`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // If we've exhausted all retries, throw the error
      if (attempt === retries) {
        throw lastError;
      }
    }
  }
  
  // This should never happen due to the throw in the loop, but TypeScript needs it
  throw lastError || new Error(`Failed to fetch ${url}`);
}

/**
 * Clear API cache by key pattern
 */
export function clearApiCache(pattern?: string): void {
  // Clear memory cache for books
  if (typeof cache.books.clear === 'function') {
    cache.books.clear();
  } else {
    // Fallback if clear method isn't available
    console.warn('Cache clear method not available, removing individual entries');
  }
  
  // Clear localStorage cache
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('dr_api_') && (!pattern || key.includes(pattern))) {
      localStorage.removeItem(key);
    }
  });
}

/**
 * Prefetch API data in the background
 */
export function prefetchApiData(urls: string[], cacheKeyPrefix: string): Promise<void[]> {
  return Promise.allSettled(
    urls.map((url, index) => 
      fetchWithCache(
        url, 
        {}, 
        `${cacheKeyPrefix}_${index}`, 
        cacheConfig.ttl.books
      ).catch(err => console.warn(`Prefetch failed for ${url}`, err))
    )
  ).then(() => {
    console.log(`Prefetched ${urls.length} URLs with prefix ${cacheKeyPrefix}`);
    return [];
  });
}
