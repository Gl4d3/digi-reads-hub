import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Book } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart, Clock, BookOpen, Calendar, Award } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/use-toast';
import { getBookById, getBundles } from '@/services/bookServiceFixed';
import { cn } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const BookDetailPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedBundles, setRelatedBundles] = useState<any[]>([]);
  const { addItem } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!bookId) return;
      
      setIsLoading(true);
      try {
        // Fetch book details
        const bookData = await getBookById(bookId);
        setBook(bookData);
        
        // Fetch bundles that might be relevant
        const allBundles = await getBundles();
        setRelatedBundles(allBundles.slice(0, 2)); // Just using the first 2 bundles for demo
      } catch (error) {
        console.error('Error fetching book details:', error);
        toast({
          title: "Error",
          description: "Failed to load book details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [bookId, toast]);

  const handleAddToCart = () => {
    if (!book) return;
    addItem(book);
    toast({
      title: "Added to cart",
      description: `${book.title} has been added to your cart.`,
    });
  };

  const handleViewBundle = (bundleId: string) => {
    navigate(`/bundles/${bundleId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-12 flex items-center justify-center">
          <div className="animate-pulse text-lg">Loading book details...</div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-12">
          <h1 className="text-2xl font-bold">Book not found.</h1>
          <p className="mt-4">The book you're looking for doesn't exist or has been removed.</p>
          <Button asChild className="mt-6">
            <Link to="/">Go Back Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return price === 0 ? "FREE" : `KES ${(price / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const renderAvailability = () => {
    const availableText = book.format === 'both' 
      ? 'Available in e-book and print formats'
      : book.format === 'ebook'
        ? 'Available as e-book only'
        : 'Available in print only';
        
    return (
      <div className="flex items-center mt-1 text-sm text-muted-foreground">
        <BookOpen className="mr-1 h-4 w-4" />
        {availableText}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container px-4 py-8 md:px-6 md:py-12">
        {/* Hero section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Book cover */}
          <div className="rounded-lg overflow-hidden shadow-lg bg-white">
            <div className="aspect-[3/4] relative">
              <img
                src={book.image_url}
                alt={book.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/assets/digireads-placeholder.jpg';
                }}
              />
              {book.price === 0 && (
                <div className="absolute top-4 right-4 bg-green-500 text-white font-bold py-2 px-4 rounded-full transform rotate-12">
                  FREE
                </div>
              )}
            </div>
          </div>

          {/* Book details */}
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{book.title}</h1>
            <p className="text-xl text-muted-foreground mt-2">by {book.author}</p>
            
            <div className="mt-4 space-y-2">
              {renderAvailability()}
              
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-1 h-4 w-4" />
                Added on {formatDate(book.created_at)}
              </div>
              
              {book.is_featured && (
                <div className="flex items-center text-amber-600">
                  <Award className="mr-1 h-4 w-4" />
                  <span className="text-sm font-medium">Featured Book</span>
                </div>
              )}
            </div>
            
            <div className="mt-8 mb-6">
              <span className="text-3xl font-bold">
                {formatPrice(book.price)}
              </span>
              {book.price > 0 && (
                <span className="ml-2 text-muted-foreground">
                  (Approx. ${(book.price / 100 / 130).toFixed(2)} USD)
                </span>
              )}
            </div>
            
            <div className="flex gap-3 mt-2">
              <Button 
                onClick={handleAddToCart} 
                className="px-8"
                disabled={isLoading}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
              <Button variant="outline">
                <Heart className="mr-2 h-4 w-4" />
                Add to Wishlist
              </Button>
            </div>
            
            <Separator className="my-8" />
            
            <div className="prose prose-stone dark:prose-invert">
              <h3 className="text-xl font-semibold mb-4">About this book</h3>
              <div className="whitespace-pre-line">
                {book.description || 'No description available for this book.'}
              </div>
            </div>
          </div>
        </div>

        {/* Related bundles */}
        {relatedBundles.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">This book is available in these bundles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedBundles.map((bundle) => (
                <Card key={bundle.id} className="overflow-hidden border-2 hover:border-primary transition-all duration-200">
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={bundle.image_url || '/assets/digireads-placeholder.jpg'} 
                      alt={bundle.name}
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{bundle.name}</CardTitle>
                    <CardDescription>{bundle.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center mb-4">
                      <div className="inline-flex items-center justify-center rounded-full bg-green-100 px-2.5 py-0.5 text-green-700">
                        <Clock className="mr-1 h-4 w-4" />
                        <span className="text-sm font-semibold">Save {bundle.discount_percentage}%</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={() => handleViewBundle(bundle.id)} 
                      className="w-full"
                    >
                      View Bundle
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetailPage;
