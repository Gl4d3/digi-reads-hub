
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
  'https://images.unsplash.com/photo-1491841573634-28140fc7ced7?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1623945359665-b7932b08baab?w=400&h=600&fit=crop',
];

/**
 * Process image URL to optimize loading
 * - Handles missing images
 * - Processes API URLs (Google Books, OpenLibrary)
 * - Applies image optimization parameters
 */
export const getOptimizedImageUrl = (url?: string): string => {
  if (!url) return DEFAULT_IMAGE;
  if (url === DEFAULT_IMAGE) return DEFAULT_IMAGE;
  
  // Handle relative URLs
  if (url.startsWith('/')) {
    return url;
  }

  try {
    // Ensure HTTPS for all image URLs
    let processedUrl = url.startsWith('http:') ? url.replace('http:', 'https:') : url;
    
    // Handle Google Books API images
    if (processedUrl.includes('books.google.com')) {
      // Remove problematic params that can cause image loading issues
      processedUrl = processedUrl
        .replace('&edge=curl', '')
        .replace('&zoom=1', '&zoom=0');
      
      // For thumbnail URLs, try to get higher quality version
      if (processedUrl.includes('&img=1')) {
        // If it has img=1 but no zoom, add zoom=0
        if (!processedUrl.includes('&zoom=')) {
          processedUrl += '&zoom=0';
        }
      }
      
      // Add cache-busting to avoid stale images
      if (!processedUrl.includes('?')) {
        processedUrl += `?cb=${Date.now() % 10000}`;
      } else if (!processedUrl.includes('cb=')) {
        processedUrl += `&cb=${Date.now() % 10000}`;
      }
    }
    
    // OpenLibrary specific optimizations
    if (processedUrl.includes('covers.openlibrary.org')) {
      // Always prefer larger size covers for better quality
      if (processedUrl.includes('-S.jpg')) {
        processedUrl = processedUrl.replace('-S.jpg', '-M.jpg');
      } else if (processedUrl.includes('-M.jpg') && Math.random() > 0.7) {
        // 30% chance to try the large version for important images
        processedUrl = processedUrl.replace('-M.jpg', '-L.jpg');
      }
      
      // Add cache-busting parameter
      if (!processedUrl.includes('?')) {
        processedUrl += `?t=${Date.now() % 10000}`;
      }
    }
    
    // Handle Unsplash images - make sure they have proper sizing params
    if (processedUrl.includes('images.unsplash.com') && !processedUrl.includes('w=')) {
      // Add size constraints for better loading
      if (processedUrl.includes('?')) {
        processedUrl += '&w=400&fit=crop';
      } else {
        processedUrl += '?w=400&fit=crop';
      }
    }
    
    return processedUrl;
  } catch (error) {
    console.error('Error optimizing image URL:', error);
    return url;
  }
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
  
  // Handle Google Books images
  if (target.src.includes('books.google.com')) {
    // Try different zoom settings
    if (target.src.includes('&zoom=1')) {
      target.src = target.src.replace('&zoom=1', '&zoom=0');
    } else if (target.src.includes('&zoom=2')) {
      target.src = target.src.replace('&zoom=2', '&zoom=0');
    } else if (!target.src.includes('&zoom=')) {
      target.src = target.src + '&zoom=0';
    }
    
    // Try without edge param
    target.src = target.src
      .replace('&edge=curl', '')
      .replace('http:', 'https:');
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
 * Preload an image in the background with timeout
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
      console.warn(`Failed to preload image: ${src}`);
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
