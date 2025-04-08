
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchBooks } from '@/services/bookServiceFixed';
import BookCard from '@/components/BookCard';
import { Book } from '@/types/supabase';
import Navbar from '@/components/Navbar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { clearApiCache } from '@/utils/apiUtils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('query') || '';
  const [searchQuery, setSearchQuery] = useState(query);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ query: searchQuery.trim() });
      
      // Log search to history if user is logged in
      if (user) {
        try {
          // Fix: Use Promise.then() with success and error callbacks
          supabase
            .from('search_history')
            .insert([
              { user_id: user.id, query: searchQuery.trim() }
            ])
            .then(
              () => console.log('Search logged to history'),
              (err) => console.error('Failed to log search', err)
            );
        } catch (error) {
          console.error('Error logging search:', error);
        }
      }
    }
  };

  // Clear search button handler
  const handleClearSearch = () => {
    setSearchQuery('');
    if (query) {
      setSearchParams({});
    }
  };

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setBooks([]);
        return;
      }

      setIsLoading(true);
      setHasError(false);
      
      try {
        // Set a controller for request timeout
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => {
          abortController.abort();
        }, 20000); // 20 second timeout
        
        const results = await searchBooks(query);
        clearTimeout(timeoutId);
        
        setBooks(results || []);
      } catch (error) {
        console.error('Error searching books:', error);
        setHasError(true);
        toast({
          title: "Search Error",
          description: "Failed to search books. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, toast]);

  // Handle retry for failed searches
  const handleRetry = () => {
    // Clear the search cache for this query to force a fresh fetch
    clearApiCache(`ol_search_${query}`);
    
    // Re-trigger search by updating search params
    setSearchParams({ query: query });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container px-4 py-8 md:px-6 md:py-12">
        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search for books by title or author"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              >
                <span className="sr-only">Clear</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
          <Button type="submit">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </form>

        {query && (
          <p className="mb-6 text-muted-foreground">
            Showing results for "{query}"
          </p>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col">
                <Skeleton className="aspect-[2/3] w-full mb-3" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-2" />
                <Skeleton className="h-8 w-full mt-3" />
              </div>
            ))}
          </div>
        ) : hasError ? (
          <div className="text-center py-12 border border-dashed border-muted-foreground/30 rounded-lg">
            <p className="text-muted-foreground mb-4">Failed to load search results</p>
            <Button onClick={handleRetry} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        ) : books.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {books.map((book) => (
              <BookCard key={book.id} {...book} />
            ))}
          </div>
        ) : query ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No books found for "{query}"</p>
            <p className="text-sm text-muted-foreground mt-2">Try using different keywords or check your spelling</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SearchPage;
