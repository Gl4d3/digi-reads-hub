
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Book } from '@/types/supabase';
import { Link } from 'react-router-dom';
import OptimizedImage from './OptimizedImage';

interface BookCardProps extends Book {
  className?: string;
}

const BookCard: React.FC<BookCardProps> = ({
  id,
  title,
  author,
  price,
  image_url,
  format,
  created_at,
  is_featured,
  ratings,
  ratings_count,
  className,
}) => {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Check if the book is a new release (added in the last 30 days)
  const isNew = new Date(created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Format price
  const formatPrice = (price: number) => {
    return price === 0 ? "FREE" : `KES ${(price / 100).toFixed(2)}`;
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

  // Check if the book is in the user's favorites
  useEffect(() => {
    if (user) {
      const checkIsFavorite = async () => {
        try {
          // Mock favorite status for now
          setIsFavorite(Math.random() > 0.7);
        } catch (error) {
          console.error("Error checking favorite status:", error);
        }
      };
      
      checkIsFavorite();
    } else {
      setIsFavorite(false);
    }
  }, [id, user]);

  // Handle toggling favorite status
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      return;
    }

    setIsLoadingFavorite(true);
    try {
      // Mock toggle favorite
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error toggling favorite status:", error);
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  // Handle adding to cart
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const book: Book = {
      id,
      title,
      author,
      price,
      image_url,
      format,
      created_at,
      updated_at: created_at,
      is_featured,
      ratings,
      ratings_count
    };
    
    addItem(book);
    
    // Show toast notification
    const { toast } = require('@/components/ui/use-toast');
    toast({
      title: "Added to cart",
      description: `${title} has been added to your cart.`,
    });
  };
  
  // Handle image load
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Truncate title if too long
  const truncateTitle = (title: string, maxLength: number = 40) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  const displayTitle = truncateTitle(title);

  // Format ratings as stars
  const displayRating = () => {
    if (!ratings || ratings === 0) return null;
    
    return (
      <div className="flex items-center gap-1 mt-1">
        <Star 
          className="h-3 w-3 fill-yellow-400 text-yellow-400" 
          fill="currentColor"
        />
        <span className="text-xs font-medium">{ratings.toFixed(1)}</span>
        {ratings_count && ratings_count > 0 && (
          <span className="text-xs text-muted-foreground">({ratings_count})</span>
        )}
      </div>
    );
  };

  return (
    <Link to={`/book/${id}`} className={cn("book-card group block", className)}>
      <div className="book-card-hover relative group">
        {/* New badge */}
        {isNew && (
          <div className="absolute top-2 right-2 z-10">
            <span className="inline-flex items-center rounded-full bg-primary/90 px-2 py-0.5 text-xs font-medium text-primary-foreground">
              New
            </span>
          </div>
        )}
        
        {/* Favorite button */}
        {user && (
          <div className="absolute top-2 left-2 z-10">
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "h-7 w-7 rounded-full bg-white/80 backdrop-blur-sm",
                isFavorite ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-foreground"
              )}
              onClick={handleToggleFavorite}
              disabled={isLoadingFavorite}
            >
              <Heart className={cn("h-3.5 w-3.5", isFavorite ? "fill-current" : "")} />
            </Button>
          </div>
        )}
        
        {/* Book image */}
        <div className="relative aspect-[2/3] overflow-hidden rounded-md mb-3 bg-muted">
          <OptimizedImage
            src={image_url || ''}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            fallbackSrc="/assets/digireads-placeholder.jpg"
            onLoad={handleImageLoad}
          />
        </div>
        
        {/* Book info */}
        <div className="space-y-1">
          <div className="flex flex-wrap gap-1">
            <span className={cn("px-2 py-0.5 rounded-full text-xs", formatBadgeColor(format))}>
              {format === 'both' ? 'E-book & Print' : format === 'ebook' ? 'E-book' : 'Print'}
            </span>
          </div>
          
          <h3 className="font-medium text-sm line-clamp-1" title={title}>{displayTitle}</h3>
          <p className="text-xs text-muted-foreground line-clamp-1">{author}</p>
          
          {/* Display ratings */}
          {displayRating()}
          
          <div className="flex items-center justify-between pt-1">
            <span className="font-bold text-sm">{formatPrice(price)}</span>
            <Button 
              size="sm" 
              variant="secondary"
              className="h-8 opacity-90 hover:opacity-100 rounded-full bg-primary text-white hover:bg-primary/90 px-3"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-1 h-3.5 w-3.5" /> Add
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;
