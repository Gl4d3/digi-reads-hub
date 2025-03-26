
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BannerProps {
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  className?: string;
}

const Banner: React.FC<BannerProps> = ({
  title,
  subtitle,
  imageUrl,
  ctaText,
  ctaLink,
  className,
}) => {
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-lg glass",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-digireads-dark/90 to-digireads-dark/60 z-10" />
      
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      
      <div className="relative z-20 flex flex-col justify-center p-6 md:p-10 h-full min-h-[300px]">
        <div className="max-w-2xl animate-fade-in">
          <div className="inline-block rounded-full bg-primary/20 px-3 py-1 text-sm font-medium text-primary mb-4">
            Featured Collection
          </div>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl mb-3">
            {title}
          </h2>
          <p className="text-muted-foreground max-w-xl mb-6">
            {subtitle}
          </p>
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            asChild
          >
            <a href={ctaLink}>{ctaText}</a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Banner;
