import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Heart, ShoppingCart, ChevronLeft, Check } from 'lucide-react';
import { getBookById } from '@/services/bookServiceFixed';
import { Book } from '@/types/supabase';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import RecommendedBooks from '@/components/RecommendedBooks';
import BookReviews from '@/components/BookReviews';
import OptimizedImage from '@/components/OptimizedImage';
import { preloadImages } from '@/utils/imageUtils';

const BookDetailPage = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!bookId) return;
      
      setIsLoading(true);
      try {
        const bookData = await getBookById(bookId);
        if (!bookData) {
          navigate('/');
          return;
        }
        setBook(bookData);
        
        // Prefetch related books in the background
        if (bookData.categories?.[0]) {
          // Prefetch recommended books for better UX
          fetch(`/api/books/category/${bookData.categories[0]}?limit=4`)
            .catch(() => {/* Silently fail - this is just prefetching */});
        }
      } catch (error) {
        console.error('Error fetching book details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load book details',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookDetails();
  }, [bookId, navigate, toast]);

  const handleAddToCart = () => {
    if (!book) return;
    
    setIsAddingToCart(true);
    
    // Simulate a delay for UI feedback
    setTimeout(() => {
      addItem(book);
      setIsAddingToCart(false);
    }, 600);
  };

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please login to add books to your favorites',
        variant: 'destructive',
      });
      return;
    }
    
    setIsFavorited(!isFavorited);
    
    toast({
      title: isFavorited ? 'Removed from Favorites' : 'Added to Favorites',
      description: isFavorited 
        ? 'This book has been removed from your favorites' 
        : 'This book has been added to your favorites',
    });
  };

  const formatPrice = (price: number) => {
    return `KES ${(price / 100).toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-4 py-8 md:px-6 animate-pulse">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-6"
            disabled
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="aspect-[3/4] bg-muted rounded-lg"></div>
            
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-6 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-24 bg-muted rounded w-full"></div>
              <div className="h-8 bg-muted rounded w-1/3"></div>
              
              <div className="flex space-x-3 pt-4">
                <div className="h-10 bg-muted rounded w-36"></div>
                <div className="h-10 bg-muted rounded w-10"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-4 py-8 md:px-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Book Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The book you are looking for does not exist or has been removed.
            </p>
            <Button onClick={() => navigate('/')}>
              Return to Homepage
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container px-4 py-8 md:px-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Book Cover */}
          <div className="flex justify-center lg:justify-end">
            <div className="aspect-[3/4] max-w-md w-full overflow-hidden rounded-lg shadow-lg border border-border bg-muted/30">
              <OptimizedImage
                src={book.image_url || '/assets/digireads-placeholder.jpg'}
                alt={book.title}
                className="object-contain w-full h-full"
                priority={true}
              />
            </div>
          </div>
          
          {/* Book Details */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
            <p className="text-xl text-muted-foreground mb-4">by {book.author}</p>
            
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground mb-6">
              {book.format}
            </div>
            
            {book.description && (
              <p className="text-muted-foreground mb-6">{book.description}</p>
            )}
            
            <div className="text-2xl font-bold mb-6">
              {formatPrice(book.price)}
            </div>
            
            <div className="flex space-x-3">
              <Button 
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="flex items-center px-8"
              >
                {isAddingToCart ? (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Added
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={handleToggleFavorite}
              >
                <Heart className={`h-5 w-5 ${isFavorited ? 'fill-primary text-primary' : ''}`} />
              </Button>
            </div>
            
            <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium block">Format</span>
                <span className="text-muted-foreground">{book.format}</span>
              </div>
              
              <div>
                <span className="font-medium block">Categories</span>
                <span className="text-muted-foreground">
                  {book.categories?.join(', ') || 'General'}
                </span>
              </div>
              
              <div className="col-span-2">
                <span className="font-medium block">Delivery</span>
                <span className="text-muted-foreground">
                  {book.format === 'ebook' 
                    ? 'Instant download after purchase' 
                    : 'Standard shipping (3-5 business days)'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <BookReviews bookId={book.id} />
        
        <div className="mt-16">
          <RecommendedBooks 
            categorySlug={book.categories?.[0] || 'african-literature'}
            currentBookId={book.id} 
          />
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;
