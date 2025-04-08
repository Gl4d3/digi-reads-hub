/**
 * Image loading and optimization utilities
 */

// Default image to use when loading fails
const DEFAULT_IMAGE = '/assets/digireads-placeholder.jpg';

// Keep track of preloaded images
const preloadedImages = new Set<string>();

/**
 * Preload an image in the background
 */
export const preloadImage = (src: string): Promise<void> => {
  if (!src || src === DEFAULT_IMAGE || preloadedImages.has(src)) {
    return Promise.resolve();
  }
  
  return new Promise((resolve) => {
    const img = new Image();
    
    img.onload = () => {
      preloadedImages.add(src);
      resolve();
    };
    
    img.onerror = () => {
      // Still resolve the promise even if the image fails to load
      resolve();
    };
    
    img.src = src;
  });
};

/**
 * Preload multiple images
 */
export const preloadImages = (srcs: string[]): void => {
  srcs.forEach(src => {
    if (src) {
      preloadImage(src).catch(() => {
        // Silent catch - we don't want preloading to cause issues
      });
    }
  });
};

/**
 * Process image URL to optimize loading
 * - Handles missing images
 * - Processes OpenLibrary URLs
 * - Applies image optimization parameters
 */
export const getOptimizedImageUrl = (url?: string): string => {
  if (!url) return DEFAULT_IMAGE;
  
  // OpenLibrary specific optimizations
  if (url.includes('covers.openlibrary.org')) {
    // Replace -S, -M, -L with size needed for the context
    if (url.includes('-S.jpg')) {
      return url.replace('-S.jpg', '-M.jpg');
    }
    return url;
  }
  
  // For Unsplash images, add optimization parameters
  if (url.includes('images.unsplash.com')) {
    // Add quality and format parameters for better loading
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}q=80&fm=webp`;
  }
  
  return url;
};

/**
 * Image component props for the optimized image component
 */
export interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  onLoad?: () => void;
  fallback?: string;
}

/**
 * Handle image error and replace with default image
 */
export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.target as HTMLImageElement;
  if (target.src !== DEFAULT_IMAGE) {
    target.src = DEFAULT_IMAGE;
  }
};
