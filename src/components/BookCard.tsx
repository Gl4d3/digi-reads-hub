
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  price: number;
  imageUrl: string;
  category: string;
  format: 'ebook' | 'hardcover' | 'both';
  isNew?: boolean;
  className?: string;
}

const BookCard: React.FC<BookCardProps> = ({
  id,
  title,
  author,
  price,
  imageUrl,
  category,
  format,
  isNew = false,
  className,
}) => {
  // Format price
  const formatPrice = (price: number) => {
    return `KES ${(price / 100).toFixed(2)}`;
  };

  // Format badge color based on format
  const formatBadgeColor = (format: string) => {
    switch (format) {
      case 'ebook':
        return 'bg-blue-500/20 text-blue-500';
      case 'hardcover':
        return 'bg-amber-500/20 text-amber-500';
      case 'both':
        return 'bg-violet-500/20 text-violet-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  // Category badge color
  const categoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'self-help':
        return 'bg-green-500/20 text-green-500';
      case 'african literature':
        return 'bg-orange-500/20 text-orange-500';
      case 'business':
        return 'bg-blue-500/20 text-blue-500';
      case 'health':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  return (
    <div className={cn("book-card book-card-hover group", className)}>
      {/* New badge */}
      {isNew && (
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center rounded-full bg-primary/90 px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
            New
          </span>
        </div>
      )}
      
      {/* Book image */}
      <div className="relative aspect-[2/3] overflow-hidden rounded-md mb-4 bg-muted">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      
      {/* Book info */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <span className={cn("category-pill", categoryColor(category))}>
            {category}
          </span>
          <span className={cn("category-pill", formatBadgeColor(format))}>
            {format === 'both' ? 'E-book & Print' : format === 'ebook' ? 'E-book' : 'Print'}
          </span>
        </div>
        
        <h3 className="font-medium line-clamp-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{author}</p>
        
        <div className="flex items-center justify-between pt-2">
          <span className="font-bold">{formatPrice(price)}</span>
          <Button size="sm" className="opacity-90 hover:opacity-100">
            <ShoppingCart className="mr-2 h-4 w-4" /> Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
