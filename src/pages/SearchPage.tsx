
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchBooks } from '@/services/bookService';
import BookCard from '@/components/BookCard';
import { Book } from '@/types/supabase';
import Navbar from '@/components/Navbar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { clearApiCache } from '@/utils/apiUtils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

const BOOKS_PER_PAGE = 20;

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('query') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  
  const [searchQuery, setSearchQuery] = useState(query);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ query: searchQuery.trim(), page: '1' });
      
      // Log search to history if user is logged in
      if (user) {
        try {
          // Use Promise.then() with success and error callbacks
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

  // Calculate total pages based on results
  const totalPages = Math.ceil(totalItems / BOOKS_PER_PAGE);

  // Clear search button handler
  const handleClearSearch = () => {
    setSearchQuery('');
    if (query) {
      setSearchParams({});
    }
  };

  // Navigate to a specific page
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    
    setSearchParams({
      query: query,
      page: page.toString()
    });
    
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setBooks([]);
        setTotalItems(0);
        return;
      }

      setIsLoading(true);
      setHasError(false);
      
      try {
        // Set a controller for request timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, 15000); // 15 second timeout
        
        // Calculate startIndex based on current page (0-based for API)
        const startIndex = (currentPage - 1) * BOOKS_PER_PAGE;
        
        // Use the imported searchGoogleBooks function
        const { searchGoogleBooks } = await import('@/services/googleBooksService');
        const result = await searchGoogleBooks(query, BOOKS_PER_PAGE, startIndex);
        
        clearTimeout(timeoutId);
        
        setBooks(result.books || []);
        setTotalItems(result.totalItems || 0);
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
  }, [query, currentPage, toast]);

  // Handle retry for failed searches
  const handleRetry = () => {
    // Clear the search cache for this query to force a fresh fetch
    clearApiCache(`gb_search_${query}`);
    
    // Re-trigger search by updating search params
    setSearchParams({ query: query, page: currentPage.toString() });
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesShown = 5; // Show at most 5 page numbers
  
    if (totalPages <= maxPagesShown) {
      // Show all pages if there are few of them
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page
      pageNumbers.push(1);
      
      // Calculate start and end of middle range
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(currentPage + 1, totalPages - 1);
      
      // Adjust if we're near the beginning
      if (currentPage <= 3) {
        endPage = Math.min(maxPagesShown - 1, totalPages - 1);
      }
      
      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - maxPagesShown + 2);
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push('ellipsis-start');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push('ellipsis-end');
      }
      
      // Always include last page
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
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
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            Search
          </Button>
        </form>

        {query && (
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
            <p className="text-muted-foreground">
              {totalItems > 0 ? (
                <>
                  Showing {(currentPage - 1) * BOOKS_PER_PAGE + 1}-
                  {Math.min(currentPage * BOOKS_PER_PAGE, totalItems)} of {totalItems} results for "{query}"
                </>
              ) : (
                <>Searching for "{query}"</>
              )}
            </p>
          </div>
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
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {books.map((book) => (
                <BookCard key={book.id} {...book} />
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination className="my-8">
                <PaginationContent>
                  {currentPage > 1 && (
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(currentPage - 1);
                        }} 
                      />
                    </PaginationItem>
                  )}
                  
                  {/* Page numbers */}
                  {getPageNumbers().map((page, i) => (
                    <PaginationItem key={i}>
                      {page === 'ellipsis-start' || page === 'ellipsis-end' ? (
                        <span className="flex h-9 w-9 items-center justify-center">
                          ...
                        </span>
                      ) : (
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(page as number);
                          }}
                          isActive={page === currentPage}
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}
                  
                  {currentPage < totalPages && (
                    <PaginationItem>
                      <PaginationNext 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(currentPage + 1);
                        }} 
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            )}
          </>
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
