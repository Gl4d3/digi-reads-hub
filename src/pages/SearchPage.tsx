
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchBooks } from '@/services/bookServiceFixed';
import BookCard from '@/components/BookCard';
import { Book } from '@/types/supabase';
import Navbar from '@/components/Navbar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('query') || '';
  const [searchQuery, setSearchQuery] = useState(query);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ query: searchQuery.trim() });
    }
  };

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setBooks([]);
        return;
      }

      setIsLoading(true);
      try {
        // Fix: Only pass one argument to searchBooks
        const results = await searchBooks(query);
        setBooks(results);
      } catch (error) {
        console.error('Error searching books:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container px-4 py-8 md:px-6 md:py-12">
        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <Input
            type="text"
            placeholder="Search for books by title or author"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
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
              <div key={i} className="animate-pulse">
                <div className="aspect-[2/3] bg-muted rounded-md mb-3"></div>
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-full mt-3"></div>
              </div>
            ))}
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
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SearchPage;
