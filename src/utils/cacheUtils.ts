
// Simple memory cache implementation
type CacheItem<T> = {
  data: T;
  timestamp: number;
};

class MemoryCache {
  private cache: Record<string, CacheItem<any>> = {};
  private maxItems: number;

  constructor(maxItems = 100) {
    this.maxItems = maxItems;
  }

  set<T>(key: string, data: T, ttl: number): void {
    // If cache is at capacity, remove oldest item
    const keys = Object.keys(this.cache);
    if (keys.length >= this.maxItems) {
      let oldest = keys[0];
      let oldestTime = this.cache[oldest].timestamp;
      
      keys.forEach(k => {
        if (this.cache[k].timestamp < oldestTime) {
          oldest = k;
          oldestTime = this.cache[k].timestamp;
        }
      });
      
      delete this.cache[oldest];
    }
    
    this.cache[key] = {
      data,
      timestamp: Date.now() + ttl
    };
  }

  get<T>(key: string): T | null {
    const item = this.cache[key];
    if (!item) return null;

    // Check if the item has expired
    if (item.timestamp < Date.now()) {
      delete this.cache[key];
      return null;
    }

    return item.data as T;
  }

  remove(key: string): void {
    delete this.cache[key];
  }

  clear(): void {
    this.cache = {};
  }
}

// Create cache instances for different data types
const booksCache = new MemoryCache(200);
const categoriesCache = new MemoryCache(20);
const bundlesCache = new MemoryCache(10);
const searchCache = new MemoryCache(50);

// LocalStorage cache utilities
export const localStorageCache = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(`dr_cache_${key}`);
      if (!item) return null;
      
      const parsedItem = JSON.parse(item);
      
      // Check if the item has expired
      if (parsedItem.timestamp < Date.now()) {
        localStorage.removeItem(`dr_cache_${key}`);
        return null;
      }
      
      return parsedItem.data as T;
    } catch (error) {
      console.error('Error retrieving from localStorage cache:', error);
      return null;
    }
  },
  
  set: <T>(key: string, data: T, ttl: number): void => {
    try {
      const item = {
        data,
        timestamp: Date.now() + ttl
      };
      
      localStorage.setItem(`dr_cache_${key}`, JSON.stringify(item));
    } catch (error) {
      console.error('Error setting localStorage cache:', error);
    }
  },
  
  remove: (key: string): void => {
    localStorage.removeItem(`dr_cache_${key}`);
  }
};

// Exported cache utility functions
export const cache = {
  books: {
    get: <T>(key: string): T | null => booksCache.get<T>(key),
    set: <T>(key: string, data: T, ttl: number): void => booksCache.set<T>(key, data, ttl),
    remove: (key: string): void => booksCache.remove(key),
    clear: () => booksCache.clear(),
    getWithLocalStorage: <T>(key: string): T | null => {
      // Try memory cache first
      const memoryResult = booksCache.get<T>(key);
      if (memoryResult) return memoryResult;
      
      // Try localStorage cache
      const storageResult = localStorageCache.get<T>(key);
      if (storageResult) {
        // Populate memory cache with localStorage result
        booksCache.set(key, storageResult, 30 * 60 * 1000); // 30 minutes
        return storageResult;
      }
      
      return null;
    },
    setWithLocalStorage: <T>(key: string, data: T, ttl: number): void => {
      booksCache.set(key, data, ttl);
      localStorageCache.set(key, data, ttl);
    }
  },
  categories: {
    get: <T>(key: string): T | null => categoriesCache.get<T>(key),
    set: <T>(key: string, data: T, ttl: number): void => categoriesCache.set<T>(key, data, ttl),
    remove: (key: string): void => categoriesCache.remove(key),
    clear: () => categoriesCache.clear()
  },
  bundles: {
    get: <T>(key: string): T | null => bundlesCache.get<T>(key),
    set: <T>(key: string, data: T, ttl: number): void => bundlesCache.set<T>(key, data, ttl),
    remove: (key: string): void => bundlesCache.remove(key),
    clear: () => bundlesCache.clear()
  },
  search: {
    get: <T>(key: string): T | null => searchCache.get<T>(key),
    set: <T>(key: string, data: T, ttl: number): void => searchCache.set<T>(key, data, ttl),
    remove: (key: string): void => searchCache.remove(key),
    clear: () => searchCache.clear()
  },
  clearAll: (): void => {
    booksCache.clear();
    categoriesCache.clear();
    bundlesCache.clear();
    searchCache.clear();
    
    // Clear localStorage cache
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('dr_cache_')) {
        localStorage.removeItem(key);
      }
    });
  }
};

export default cache;
