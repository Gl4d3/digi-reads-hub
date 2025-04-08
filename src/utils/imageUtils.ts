
/**
 * Image loading and optimization utilities
 */

// Default image to use when loading fails
const DEFAULT_IMAGE = '/assets/digireads-placeholder.jpg';

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
    // Replace -S, -M, -L with size needed for the context
    if (url.includes('-S.jpg')) {
      return url.replace('-S.jpg', '-M.jpg');
    }
    return url;
  }
  
  return url;
};

/**
 * Handle image error and replace with default image
 */
export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.target as HTMLImageElement;
  if (target.src !== DEFAULT_IMAGE) {
    target.src = DEFAULT_IMAGE;
  }
};

/**
 * Preload an image in the background (simplified)
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve) => {
    if (!src || src === DEFAULT_IMAGE) {
      resolve();
      return;
    }
    
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
};

/**
 * Preload multiple images with a delay to prevent too many simultaneous requests
 */
export const preloadImages = (srcs: string[]): void => {
  if (!srcs || srcs.length === 0) return;
  
  // Only preload a few images to avoid overloading the browser
  const imagesToPreload = srcs.slice(0, 5);
  
  imagesToPreload.forEach((src, index) => {
    if (src) {
      // Stagger the preloading to prevent too many simultaneous requests
      setTimeout(() => {
        preloadImage(src).catch(() => {
          // Silent catch
        });
      }, index * 100);
    }
  });
};
