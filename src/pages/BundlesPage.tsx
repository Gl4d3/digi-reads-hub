
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { getBundles } from '@/services/bookServiceFixed';
import { Bundle } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Clock, Calendar, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

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
        gradient: 'bg-gradient-to-br from-blue-100 to-blue-300 dark:from-blue-950 dark:to-blue-800',
        icon: <Calendar className="h-6 w-6" />,
        iconColor: 'text-blue-600 dark:text-blue-400',
        textColor: 'text-blue-900 dark:text-blue-100',
        accentColor: 'bg-blue-600 text-white',
        accent2: 'border-blue-300 dark:border-blue-700'
      };
    } else if (bundleId === 'daily-bundle') {
      return {
        gradient: 'bg-gradient-to-br from-emerald-100 to-emerald-300 dark:from-emerald-950 dark:to-emerald-800',
        icon: <Clock className="h-6 w-6" />,
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        textColor: 'text-emerald-900 dark:text-emerald-100',
        accentColor: 'bg-emerald-600 text-white',
        accent2: 'border-emerald-300 dark:border-emerald-700'
      };
    } else {
      return {
        gradient: 'bg-gradient-to-br from-violet-100 to-violet-300 dark:from-violet-950 dark:to-violet-800',
        icon: <Sparkles className="h-6 w-6" />,
        iconColor: 'text-violet-600 dark:text-violet-400',
        textColor: 'text-violet-900 dark:text-violet-100',
        accentColor: 'bg-violet-600 text-white',
        accent2: 'border-violet-300 dark:border-violet-700'
      };
    }
  };

  // Animation variants for motion components
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
        duration: 0.4
      }
    }
  };

  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 80,
        damping: 15
      }
    }
  };

  const SkeletonBundle = () => (
    <div className="rounded-2xl overflow-hidden shadow-lg bg-muted p-1">
      <div className="bg-card rounded-xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="aspect-square md:aspect-auto md:col-span-1 overflow-hidden bg-muted/50">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="p-8 md:col-span-2 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-10 w-4/5" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex flex-wrap gap-3 pt-4">
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-12 w-48" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container px-4 py-12 md:px-6 md:py-16">
        <header className="mb-16 text-center">
          <motion.h1 
            className="text-5xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Book Bundles
          </motion.h1>
          <motion.p 
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Our carefully curated collections offer the best value for book lovers. 
            Each bundle is designed to provide an enriching reading experience at a special price.
          </motion.p>
        </header>

        {isLoading ? (
          <div className="space-y-10">
            {[1, 2, 3].map(i => (
              <SkeletonBundle key={i} />
            ))}
          </div>
        ) : bundles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No bundles available at the moment.</p>
          </div>
        ) : (
          <motion.div 
            className="space-y-12"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {bundles.map((bundle) => {
              const styles = getBundleStyles(bundle.id);
              
              return (
                <motion.div 
                  key={bundle.id} 
                  className={`rounded-2xl overflow-hidden shadow-lg ${styles.gradient} p-1 transition-all duration-300 hover:shadow-xl`}
                  variants={cardVariants}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="bg-background rounded-xl overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                      {/* Image Column */}
                      <div className="aspect-square md:aspect-auto md:col-span-1 overflow-hidden relative">
                        <img 
                          src={bundle.image_url || '/assets/digireads-placeholder.jpg'} 
                          alt={bundle.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className={`absolute top-4 left-4 ${styles.accentColor} px-3 py-1 rounded-full text-xs font-semibold shadow-md`}>
                          {bundle.id === 'weekly-bundle' ? 'Weekly Bundle' : 
                           bundle.id === 'daily-bundle' ? 'Daily Bundle' : 'Limited Time'}
                        </div>
                      </div>
                      
                      {/* Content Column */}
                      <div className={`p-8 md:col-span-2 flex flex-col justify-between border-l ${styles.accent2}`}>
                        <div>
                          <div className={`inline-flex items-center ${styles.iconColor} mb-6`}>
                            {styles.icon}
                            <span className={`ml-2 font-semibold ${styles.textColor}`}>
                              {bundle.discount_percentage}% OFF
                            </span>
                          </div>
                          
                          <h2 className="text-3xl md:text-4xl font-bold mb-4">{bundle.name}</h2>
                          
                          <p className="text-lg text-muted-foreground mb-6">
                            {bundle.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-3 mb-8">
                            {bundle.id === 'weekly-bundle' && (
                              <div className="rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-4 py-1 text-sm font-medium">
                                Weekly Refresh
                              </div>
                            )}
                            
                            {bundle.id === 'daily-bundle' && (
                              <div className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 px-4 py-1 text-sm font-medium">
                                Daily Inspiration
                              </div>
                            )}
                            
                            {bundle.id === 'flash-sale-bundle' && (
                              <div className="rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-4 py-1 text-sm font-medium animate-pulse">
                                Limited Time Offer!
                              </div>
                            )}
                            
                            <div className="rounded-full bg-primary/10 text-primary px-4 py-1 text-sm font-medium">
                              Save {bundle.discount_percentage}%
                            </div>
                          </div>
                        </div>
                        
                        <Button asChild className="group w-fit text-lg py-6 mt-4" size="lg">
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
