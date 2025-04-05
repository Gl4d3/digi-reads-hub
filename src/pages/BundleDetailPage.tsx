
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Clock, BookOpen, Bookmark, PercentSquare, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { getBundleWithBooks } from '@/services/bookServiceFixed';
import { Book, Bundle } from '@/types/supabase';
import BookCard from '@/components/BookCard';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';

const BundleDetailPage = () => {
  const { bundleId } = useParams<{ bundleId: string }>();
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem } = useCart();
  const { toast } = useToast();

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
        toast({
          title: "Error",
          description: "Failed to load bundle details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBundleDetails();
  }, [bundleId, toast]);

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
    
    toast({
      title: "Bundle Added",
      description: `${bundle?.name} has been added to your cart.`,
    });
  };

  // Get style based on bundle type with improved contrast
  const getBundleStyle = () => {
    if (!bundleId) return {};
    
    if (bundleId === 'weekly-bundle') {
      return {
        gradientBg: 'bg-gradient-to-r from-primary/10 to-primary/20',
        accentColor: 'text-primary',
        buttonVariant: 'default'
      };
    } else if (bundleId === 'daily-bundle') {
      return {
        gradientBg: 'bg-gradient-to-r from-primary/10 to-primary/20',
        accentColor: 'text-primary',
        buttonVariant: 'default'
      };
    } else {
      return {
        gradientBg: 'bg-gradient-to-r from-primary/10 to-primary/20',
        accentColor: 'text-primary',
        buttonVariant: 'default'
      };
    }
  };

  const style = getBundleStyle();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-4 py-12 md:px-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse">Loading bundle details...</div>
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
          <Button asChild className="mt-6">
            <Link to="/bundles">View All Bundles</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero section with bundle details */}
      <div className={`${style.gradientBg} py-16 text-foreground`}>
        <div className="container px-4 md:px-6">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">{bundle.name}</h1>
            <p className="text-xl text-foreground mb-8">{bundle.description}</p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <div className="flex items-center font-medium">
                <Clock className={`${style.accentColor} mr-2 h-5 w-5`} />
                <span>Limited Time Offer</span>
              </div>
              <div className="flex items-center font-medium">
                <BookOpen className={`${style.accentColor} mr-2 h-5 w-5`} />
                <span>{books.length} Books Included</span>
              </div>
              <div className="flex items-center font-medium">
                <PercentSquare className={`${style.accentColor} mr-2 h-5 w-5`} />
                <span>{bundle.discount_percentage}% Discount</span>
              </div>
            </div>
            
            <div className="bg-card dark:bg-gray-800 rounded-lg shadow-lg p-6 inline-block border border-border">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-sm">Regular Price</p>
                  <p className="text-lg line-through text-muted-foreground">{formatPrice(originalTotal)}</p>
                </div>
                <div className="hidden sm:block">
                  <ArrowRight className="h-5 w-5" />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-sm">Bundle Price</p>
                  <p className="text-3xl font-bold text-foreground">{formatPrice(discountedTotal)}</p>
                </div>
                <div className="sm:ml-4">
                  <Button 
                    onClick={handleAddBundleToCart}
                    size="lg"
                    className="px-8"
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" /> Add Bundle to Cart
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Books in bundle */}
      <div className="container px-4 py-12 md:px-6">
        <h2 className="text-3xl font-bold mb-8">Books Included in This Bundle</h2>
        
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {books.map((book) => (
            <motion.div key={book.id} variants={itemVariants}>
              <BookCard {...book} />
            </motion.div>
          ))}
        </motion.div>
        
        <Separator className="my-12" />
        
        <div className="bg-card rounded-lg p-6 md:p-8 mt-12 border border-border">
          <h3 className="text-xl font-semibold mb-4">Bundle Details</h3>
          <ul className="space-y-2">
            <li className="flex">
              <Bookmark className="h-5 w-5 mr-2 text-primary shrink-0" />
              <span>Instant access to all {books.length} titles in this bundle</span>
            </li>
            <li className="flex">
              <Bookmark className="h-5 w-5 mr-2 text-primary shrink-0" />
              <span>Available in all supported formats (e-book and print where applicable)</span>
            </li>
            <li className="flex">
              <Bookmark className="h-5 w-5 mr-2 text-primary shrink-0" />
              <span>Save {bundle.discount_percentage}% compared to individual purchases</span>
            </li>
            {bundleId === 'weekly-bundle' && (
              <li className="flex">
                <Bookmark className="h-5 w-5 mr-2 text-primary shrink-0" />
                <span>New selection released every Monday - get them while they're available!</span>
              </li>
            )}
            {bundleId === 'daily-bundle' && (
              <li className="flex">
                <Bookmark className="h-5 w-5 mr-2 text-primary shrink-0" />
                <span>Perfect for daily reading and inspiration</span>
              </li>
            )}
            {bundleId === 'flash-sale-bundle' && (
              <li className="flex">
                <Bookmark className="h-5 w-5 mr-2 text-primary shrink-0" />
                <span>Limited time offer - get this bundle before it's gone!</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BundleDetailPage;
