
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
    getOptimizedImageUrl(priority ? src : fallbackSrc)
  );

  // Load image when component mounts or src changes
  useEffect(() => {
    if (!src) return;
    
    const optimizedSrc = getOptimizedImageUrl(src);
    setFinalSrc(optimizedSrc);

    // If previous attempts failed, try a fallback immediately
    if (retryCount > 1) {
      setFinalSrc(getRandomFallbackImage());
    }
  }, [src, retryCount]);

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
    if (retryCount < 2) {
      // Try to recover with our custom error handler
      handleImageError(e);
      setRetryCount(prev => prev + 1);
    } else {
      // After multiple failures, use a completely different image
      setFinalSrc(getRandomFallbackImage());
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
      <img
        src={finalSrc}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        className={cn(
          "w-full h-full object-cover",
          loaded ? "opacity-100" : "opacity-0"
        )}
        width={width}
        height={height}
      />
      {!loaded && !hasError && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}
    </div>
  );
};

export default OptimizedImage;
