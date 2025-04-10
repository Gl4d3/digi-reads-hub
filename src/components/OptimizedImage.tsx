
import React, { useState, useEffect } from 'react';
import { getOptimizedImageUrl, handleImageError, getRandomFallbackImage } from '@/utils/imageUtils';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  fallbackSrc?: string;
  onLoad?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  fallbackSrc = '/assets/digireads-placeholder.jpg',
  onLoad,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [finalSrc, setFinalSrc] = useState<string>(
    getOptimizedImageUrl(src || fallbackSrc)
  );

  // Load image when component mounts or src changes
  useEffect(() => {
    if (!src) {
      setFinalSrc(getOptimizedImageUrl(fallbackSrc));
      return;
    }
    
    const optimizedSrc = getOptimizedImageUrl(src);
    setFinalSrc(optimizedSrc);

    // If previous attempts failed, try a fallback immediately
    if (retryCount > 1) {
      setFinalSrc(getRandomFallbackImage());
    }
  }, [src, retryCount, fallbackSrc]);

  // Handle image load success
  const handleLoad = () => {
    setLoaded(true);
    setHasError(false);
    if (onLoad) {
      onLoad();
    }
  };

  // Custom error handler with retry logic
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.log(`Image loading error for: ${finalSrc}`);
    
    if (retryCount < 2) {
      // For Google Books images, try replacing zoom parameters
      if (finalSrc.includes('books.google')) {
        let newSrc = finalSrc;
        
        // Try different zoom values for Google Books API images
        if (newSrc.includes('&zoom=1')) {
          newSrc = newSrc.replace('&zoom=1', '&zoom=0');
        } else if (newSrc.includes('&zoom=2')) {
          newSrc = newSrc.replace('&zoom=2', '&zoom=0');
        } else if (!newSrc.includes('&zoom=')) {
          // Add zoom=0 if no zoom parameter exists
          newSrc = `${newSrc}&zoom=0`;
        }
        
        // Remove edge parameter if present
        newSrc = newSrc.replace('&edge=curl', '');
        
        // Ensure HTTPS
        newSrc = newSrc.replace('http://', 'https://');
        
        console.log(`Retrying with modified URL: ${newSrc}`);
        setFinalSrc(newSrc);
      } else {
        // Try with our custom error handler
        handleImageError(e);
      }
      
      setRetryCount(prev => prev + 1);
    } else {
      // After multiple failures, use a completely different image
      const fallbackImage = getRandomFallbackImage();
      console.log(`Using random fallback image: ${fallbackImage}`);
      setFinalSrc(fallbackImage);
      setHasError(true);
    }
  };

  return (
    <div
      className={cn(
        "relative",
        className
      )}
      style={{ width, height }}
    >
      {!loaded && !hasError && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}
      <img
        src={finalSrc}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        className={cn(
          "w-full h-full object-cover",
          loaded ? "opacity-100" : "opacity-0",
          "transition-opacity duration-300"
        )}
        width={width}
        height={height}
      />
    </div>
  );
};

export default OptimizedImage;
