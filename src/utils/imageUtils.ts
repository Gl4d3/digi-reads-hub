
/**
 * Image loading and optimization utilities
 */

// Default image to use when loading fails
const DEFAULT_IMAGE = '/assets/digireads-placeholder.jpg';
// Fallback images (Unsplash photos) to use for variety when covers fail to load
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=600&fit=crop',
];

/**
 * Process image URL to optimize loading
 * - Handles missing images
 * - Processes OpenLibrary URLs
 * - Applies image optimization parameters
 */
export const getOptimizedImageUrl = (url?: string): string => {
  if (!url) return DEFAULT_IMAGE;
  if (url === DEFAULT_IMAGE) return DEFAULT_IMAGE;
  
  // Handle relative URLs
  if (url.startsWith('/')) {
    return url;
  }
  
  // OpenLibrary specific optimizations
  if (url.includes('covers.openlibrary.org')) {
    // Always prefer larger size covers for better quality
    if (url.includes('-S.jpg')) {
      return url.replace('-S.jpg', '-M.jpg');
    } else if (url.includes('-M.jpg') && Math.random() > 0.7) {
      // 30% chance to try the large version for important images
      return url.replace('-M.jpg', '-L.jpg');
    }
    
    // Add cache-busting parameter to avoid browser cache issues
    const cacheBuster = `?t=${Date.now() % 100000}`;
    return url + cacheBuster;
  }
  
  return url;
};

/**
 * Get a random fallback image when default fails
 */
export const getRandomFallbackImage = (): string => {
  const randomIndex = Math.floor(Math.random() * FALLBACK_IMAGES.length);
  return FALLBACK_IMAGES[randomIndex];
};

/**
 * Handle image error and replace with fallback images
 */
export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.target as HTMLImageElement;
  
  // If already showing default, try one of our fallback images
  if (target.src.includes(DEFAULT_IMAGE) || target.src.includes('digireads-placeholder')) {
    target.src = getRandomFallbackImage();
    return;
  }
  
  // If it's an OpenLibrary image that failed, try a different size
  if (target.src.includes('covers.openlibrary.org')) {
    if (target.src.includes('-M.jpg')) {
      target.src = target.src.replace('-M.jpg', '-L.jpg');
      return;
    } else if (target.src.includes('-L.jpg')) {
      target.src = target.src.replace('-L.jpg', '-M.jpg');
      return;
    }
  }
  
  // As last resort, use default image
  target.src = DEFAULT_IMAGE;
};

/**
 * Preload an image in the background
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve) => {
    if (!src) {
      resolve();
      return;
    }
    
    const img = new Image();
    const timeoutId = setTimeout(() => {
      // If image takes too long to load, resolve anyway
      resolve();
    }, 3000);
    
    img.onload = () => {
      clearTimeout(timeoutId);
      resolve();
    };
    
    img.onerror = () => {
      clearTimeout(timeoutId);
      resolve();
    };
    
    img.src = getOptimizedImageUrl(src);
  });
};

/**
 * Preload multiple images with a delay to prevent too many simultaneous requests
 */
export const preloadImages = (srcs: string[] = []): void => {
  if (!srcs || srcs.length === 0) return;
  
  // Only preload a few images to avoid overloading the browser
  const imagesToPreload = srcs.slice(0, 8);
  
  imagesToPreload.forEach((src, index) => {
    if (src) {
      // Stagger the preloading to prevent too many simultaneous requests
      setTimeout(() => {
        preloadImage(src).catch(() => {
          // Silent catch
        });
      }, index * 200);
    }
  });
};
