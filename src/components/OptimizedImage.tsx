
import React, { useState, useEffect } from 'react';
import { getOptimizedImageUrl, handleImageError, preloadImage } from '@/utils/imageUtils';
import { cn } from '@/lib/utils';

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
  const [finalSrc, setFinalSrc] = useState<string>(
    priority ? getOptimizedImageUrl(src) : fallbackSrc
  );

  // Handle priority loading
  useEffect(() => {
    if (priority && src) {
      setFinalSrc(getOptimizedImageUrl(src));
    }
  }, [priority, src]);

  // Load image when not priority
  useEffect(() => {
    if (!priority && src) {
      const optimizedSrc = getOptimizedImageUrl(src);
      
      // Preload the image before showing it
      preloadImage(optimizedSrc)
        .then(() => {
          setFinalSrc(optimizedSrc);
        })
        .catch(() => {
          // Fallback to default on error
          setFinalSrc(fallbackSrc);
        });
    }
  }, [priority, src, fallbackSrc]);

  // Handle image load success
  const handleLoad = () => {
    setLoaded(true);
    if (onLoad) {
      onLoad();
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
        onError={handleImageError}
        onLoad={handleLoad}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0"
        )}
        width={width}
        height={height}
      />
      {!loaded && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded-md" />
      )}
    </div>
  );
};

export default OptimizedImage;
