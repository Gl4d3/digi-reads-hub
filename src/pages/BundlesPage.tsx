
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { getBundles } from '@/services/bookService';
import { Bundle } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container px-4 py-8 md:px-6 md:py-12">
        <header className="mb-12">
          <h1 className="text-3xl font-bold mb-4">Book Bundles</h1>
          <p className="text-muted-foreground max-w-2xl">
            Save on our curated collections of books. Each bundle offers a discount compared to buying the books individually.
          </p>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse">Loading bundles...</div>
          </div>
        ) : bundles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No bundles available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bundles.map((bundle) => (
              <div 
                key={bundle.id} 
                className="group bg-card rounded-lg overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-video bg-muted overflow-hidden">
                  <img 
                    src={bundle.image_url || '/assets/digireads-placeholder.jpg'} 
                    alt={bundle.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{bundle.name}</h3>
                  <div className="mb-4">
                    <span className="inline-flex items-center rounded-full bg-green-500/20 text-green-600 px-2.5 py-0.5 text-sm font-medium">
                      Save {bundle.discount_percentage}%
                    </span>
                  </div>
                  <p className="text-muted-foreground line-clamp-2 mb-4">{bundle.description}</p>
                  <Button asChild className="w-full" variant="default">
                    <Link to={`/bundles/${bundle.id}`}>
                      <ShoppingBag className="mr-2 h-4 w-4" /> View Bundle
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BundlesPage;
