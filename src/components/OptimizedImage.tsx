
import React, { useState, useEffect } from 'react';
import { getOptimizedImageUrl, handleImageError } from '@/utils/imageUtils';
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
  const [finalSrc, setFinalSrc] = useState<string>(
    priority && src ? getOptimizedImageUrl(src) : fallbackSrc
  );

  // Load image immediately if priority
  useEffect(() => {
    if (priority && src) {
      const optimizedSrc = getOptimizedImageUrl(src);
      setFinalSrc(optimizedSrc);
    }
  }, [priority, src]);

  // Handle non-priority images
  useEffect(() => {
    if (!priority && src) {
      // Just set the optimized URL directly without preloading
      setFinalSrc(getOptimizedImageUrl(src));
    }
  }, [priority, src]);

  // Handle image load success
  const handleLoad = () => {
    setLoaded(true);
    if (onLoad) {
      onLoad();
    }
  };

  // Custom error handler
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    setFinalSrc(fallbackSrc);
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
