
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { getBundleWithBooks } from '@/services/bookServiceFixed';
import { Book, Bundle } from '@/types/supabase';
import BookCard from '@/components/BookCard';
import Navbar from '@/components/Navbar';

const BundleDetailPage = () => {
  const { bundleId } = useParams<{ bundleId: string }>();
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchBundleDetails = async () => {
      if (!bundleId) return;
      
      setIsLoading(true);
      try {
        const { bundle, books } = await getBundleWithBooks(bundleId);
        setBundle(bundle);
        setBooks(books);
      } catch (error) {
        console.error('Error fetching bundle details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBundleDetails();
  }, [bundleId]);

  // Calculate original total price
  const originalTotal = books.reduce((sum, book) => sum + book.price, 0);
  
  // Calculate discounted price
  const discountedTotal = bundle ? Math.round(originalTotal * (1 - bundle.discount_percentage / 100)) : 0;
  
  // Format price
  const formatPrice = (price: number) => {
    return `KES ${(price / 100).toFixed(2)}`;
  };

  // Add all books in bundle to cart
  const handleAddBundleToCart = () => {
    books.forEach(book => {
      addItem(book);
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-4 py-12 md:px-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse">Loading bundle...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-4 py-12 md:px-6">
          <h1 className="text-3xl font-bold mb-6">Bundle Not Found</h1>
          <p>The bundle you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container px-4 py-12 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Image */}
          <div className="md:col-span-1">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              <img 
                src={bundle.image_url || '/assets/digireads-placeholder.jpg'} 
                alt={bundle.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Details */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{bundle.name}</h1>
              <p className="text-muted-foreground">{bundle.description}</p>
            </div>
            
            <div className="border-t border-border pt-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg text-muted-foreground line-through">{formatPrice(originalTotal)}</span>
                <span className="text-2xl font-bold">{formatPrice(discountedTotal)}</span>
                <span className="inline-flex items-center rounded-full bg-green-500/20 text-green-600 px-2.5 py-0.5 text-sm font-medium">
                  Save {bundle.discount_percentage}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                This bundle includes {books.length} book{books.length !== 1 ? 's' : ''} for the price of {Math.ceil(books.length * (1 - bundle.discount_percentage / 100))}.
              </p>
              
              <Button 
                className="w-full sm:w-auto" 
                size="lg"
                onClick={handleAddBundleToCart}
              >
                <ShoppingCart className="mr-2 h-5 w-5" /> Add Bundle to Cart
              </Button>
            </div>
            
            <div className="border-t border-border pt-4">
              <h3 className="font-semibold mb-2">Bundle Details:</h3>
              <ul className="list-disc ml-5 space-y-1 text-muted-foreground">
                <li>Instant access to all titles in this bundle</li>
                <li>Available in all supported formats</li>
                <li>Save {bundle.discount_percentage}% compared to individual purchases</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Books in bundle */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Books in this Bundle</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard key={book.id} {...book} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BundleDetailPage;
