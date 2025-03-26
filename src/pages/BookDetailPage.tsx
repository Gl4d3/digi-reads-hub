
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { Book } from '@/types/supabase';
import { checkIsFavorite, toggleFavorite } from '@/services/bookService';
import Navbar from '@/components/Navbar';
import { cn } from '@/lib/utils';

const BookDetailPage = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { addItem } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      if (!bookId) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .eq('id', bookId)
          .single();
          
        if (error) {
          throw error;
        }
        
        setBook(data);
        
        // Check if this book is in the user's favorites
        if (user) {
          const favStatus = await checkIsFavorite(bookId, user.id);
          setIsFavorite(favStatus);
        }
      } catch (error) {
        console.error('Error fetching book:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBook();
  }, [bookId, user]);

  // Handle toggling favorite status
  const handleToggleFavorite = async () => {
    if (!user || !book) return;

    setIsLoadingFavorite(true);
    try {
      await toggleFavorite(book.id, user.id);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error toggling favorite status:", error);
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  // Format price
  const formatPrice = (price: number | undefined) => {
    if (price === undefined) return '';
    return `KES ${(price / 100).toFixed(2)}`;
  };

  // Handle adding to cart
  const handleAddToCart = () => {
    if (book) {
      addItem(book);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-4 py-12 md:px-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse">Loading book details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-4 py-12 md:px-6">
          <h1 className="text-3xl font-bold mb-6">Book Not Found</h1>
          <p>The book you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  // Format publication date
  const publicationDate = new Date(book.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container px-4 py-12 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Image */}
          <div>
            <div className="aspect-[2/3] bg-muted rounded-lg overflow-hidden">
              <img 
                src={book.image_url} 
                alt={book.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
              <p className="text-xl text-muted-foreground">{book.author}</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <span className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                book.format === 'ebook' ? "bg-blue-500/20 text-blue-500" :
                book.format === 'hardcover' ? "bg-amber-500/20 text-amber-500" : 
                "bg-violet-500/20 text-violet-500"
              )}>
                {book.format === 'both' ? 'E-book & Print' : book.format === 'ebook' ? 'E-book' : 'Print'}
              </span>
              
              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                Published: {publicationDate}
              </span>
            </div>
            
            <div className="border-t border-border pt-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold">{formatPrice(book.price)}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Button 
                  className="flex-1" 
                  size="lg"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                </Button>
                
                {user && (
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={handleToggleFavorite}
                    disabled={isLoadingFavorite}
                    className={cn(
                      isFavorite ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Heart className={cn("mr-2 h-5 w-5", isFavorite ? "fill-current" : "")} />
                    {isFavorite ? 'Favorited' : 'Add to Favorites'}
                  </Button>
                )}
              </div>
            </div>
            
            <div className="border-t border-border pt-4">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">
                {book.description || "No description available for this book."}
              </p>
            </div>
            
            <div className="border-t border-border pt-4">
              <h3 className="text-lg font-semibold mb-2">Book Details</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Format:</span>
                  <span>{book.format === 'both' ? 'E-book & Print' : book.format === 'ebook' ? 'E-book' : 'Print'}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Author:</span>
                  <span>{book.author}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Published:</span>
                  <span>{publicationDate}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;
