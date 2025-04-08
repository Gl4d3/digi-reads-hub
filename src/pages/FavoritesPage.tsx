
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { getFavorites } from '@/services/bookServiceFixed';
import { Book } from '@/types/supabase';
import BookCard from '@/components/BookCard';

const FavoritesPage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if not authenticated and auth is not loading
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Remove the user.id parameter
        const data = await getFavorites();
        setFavorites(data);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchFavorites();
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-4 py-12 md:px-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to auth page
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container px-4 py-8 md:px-6 md:py-12">
        <header className="mb-12">
          <h1 className="text-3xl font-bold mb-4">Your Favorites</h1>
          <p className="text-muted-foreground max-w-2xl">
            Books you've marked as favorites for easy access.
          </p>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[2/3] bg-muted rounded-md mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-5 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-10 bg-muted rounded w-full mt-2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-6">You haven't added any books to your favorites yet.</p>
            <p className="text-muted-foreground">
              Browse our collection and click the heart icon on any book to add it to your favorites.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favorites.map((book) => (
              <BookCard key={book.id} {...book} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
