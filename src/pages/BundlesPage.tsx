
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { getBundles } from '@/services/bookServiceFixed';
import { Bundle } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Clock, Calendar, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const BundlesPage = () => {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBundles = async () => {
      setIsLoading(true);
      try {
        const data = await getBundles();
        setBundles(data);
      } catch (error) {
        console.error('Error fetching bundles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBundles();
  }, []);

  // Function to get gradient based on bundle type
  const getBundleStyles = (bundleId: string) => {
    if (bundleId === 'weekly-bundle') {
      return {
        gradient: 'bg-gradient-to-br from-amber-100 to-amber-300',
        icon: <Calendar className="h-6 w-6" />,
        iconColor: 'text-amber-600',
        textColor: 'text-amber-900'
      };
    } else if (bundleId === 'daily-bundle') {
      return {
        gradient: 'bg-gradient-to-br from-blue-100 to-blue-300',
        icon: <Clock className="h-6 w-6" />,
        iconColor: 'text-blue-600',
        textColor: 'text-blue-900'
      };
    } else {
      return {
        gradient: 'bg-gradient-to-br from-purple-100 to-purple-300',
        icon: <Sparkles className="h-6 w-6" />,
        iconColor: 'text-purple-600',
        textColor: 'text-purple-900'
      };
    }
  };

  // Animation variants for motion components
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.3 
      }
    }
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container px-4 py-12 md:px-6 md:py-20">
        <header className="mb-20 text-center">
          <h1 className="text-5xl font-bold mb-4 tracking-tight">Book Bundles</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our carefully curated collections offer the best value for book lovers. 
            Each bundle is designed to provide an enriching reading experience at a special price.
          </p>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse">Loading our exciting bundles...</div>
          </div>
        ) : bundles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No bundles available at the moment.</p>
          </div>
        ) : (
          <motion.div 
            className="space-y-16"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {bundles.map((bundle) => {
              const styles = getBundleStyles(bundle.id);
              
              return (
                <motion.div 
                  key={bundle.id} 
                  className={`rounded-2xl overflow-hidden shadow-lg ${styles.gradient} p-1`}
                  variants={cardVariants}
                >
                  <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Image Column */}
                      <div className="aspect-square md:aspect-auto md:col-span-1 overflow-hidden">
                        <img 
                          src={bundle.image_url || '/assets/digireads-placeholder.jpg'} 
                          alt={bundle.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Content Column */}
                      <div className="p-8 md:col-span-1 lg:col-span-2 flex flex-col justify-between">
                        <div>
                          <div className={`inline-flex items-center ${styles.iconColor} ${styles.textColor} mb-4`}>
                            {styles.icon}
                            <span className="ml-2 font-semibold">
                              {bundle.id === 'weekly-bundle' ? 'Weekly Bundle' : 
                               bundle.id === 'daily-bundle' ? 'Daily Bundle' : 'Limited Time Offer'}
                            </span>
                          </div>
                          
                          <h2 className="text-3xl md:text-4xl font-bold mb-4">{bundle.name}</h2>
                          
                          <p className="text-lg text-muted-foreground mb-6">
                            {bundle.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-3 mb-8">
                            <div className="rounded-full bg-green-100 text-green-800 px-4 py-1 text-sm font-medium">
                              Save {bundle.discount_percentage}%
                            </div>
                            
                            {bundle.id === 'flash-sale-bundle' && (
                              <div className="rounded-full bg-red-100 text-red-800 px-4 py-1 text-sm font-medium animate-pulse">
                                Limited Time Offer!
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <Button asChild className="text-lg py-6 group" size="lg">
                          <Link to={`/bundles/${bundle.id}`}>
                            <ShoppingBag className="mr-2 h-5 w-5" /> 
                            Explore This Bundle
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BundlesPage;
