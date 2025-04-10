
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import BookCard from '@/components/BookCard';
import { getCategories } from '@/services/bookServiceFixed';
import { getCategoryBooks } from '@/services/googleBooksService';
import { Book, Category } from '@/types/supabase';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, SearchX, RefreshCw } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

type CategoryParams = {
  categoryId?: string;
};

const BOOKS_PER_PAGE = 20;

const CategoryPage = () => {
  const { categoryId } = useParams<CategoryParams>();
  const [books, setBooks] = useState<Book[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  useEffect(() => {
    const fetchCategoryInfo = async () => {
      if (!categoryId) return;
      
      try {
        const categoriesData = await getCategories();
        const matchingCategory = categoriesData.find(cat => cat.slug === categoryId);
        
        if (matchingCategory) {
          setCategory(matchingCategory);
        }
      } catch (error) {
        console.error('Error fetching category info:', error);
      }
    };
    
    fetchCategoryInfo();
  }, [categoryId]);
  
  useEffect(() => {
    const fetchBooks = async () => {
      if (!categoryId) return;
      
      setIsLoading(true);
      setIsError(false);
      
      try {
        // Calculate start index for pagination (0-based)
        const startIndex = (currentPage - 1) * BOOKS_PER_PAGE;
        
        // Use Google Books API directly for pagination
        const result = await getCategoryBooks(categoryId, BOOKS_PER_PAGE, startIndex);
        setBooks(result.books);
        setTotalItems(result.totalItems);
      } catch (error) {
        console.error('Error fetching books by category:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
        // Scroll to top when changing pages
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    fetchBooks();
  }, [categoryId, currentPage]);

  const handleRefresh = () => {
    if (categoryId) {
      setIsLoading(true);
      const startIndex = (currentPage - 1) * BOOKS_PER_PAGE;
      getCategoryBooks(categoryId, BOOKS_PER_PAGE, startIndex)
        .then(result => {
          setBooks(result.books);
          setTotalItems(result.totalItems);
          setIsError(false);
        })
        .catch(err => {
          console.error('Error refreshing books:', err);
          setIsError(true);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  // Calculate total pages
  const totalPages = Math.min(Math.ceil(totalItems / BOOKS_PER_PAGE), 10); // Limit to 10 pages max (Google Books API limitation)

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
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

  const categoryName = category?.name || categoryId
    ?.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') || '';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container px-4 py-6 md:px-6 md:py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link to="/" className="flex items-center">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Home
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{categoryName}</h1>
        </div>
        
        <p className="text-muted-foreground max-w-2xl mb-6">
          Explore our collection of {categoryName.toLowerCase()} books, featuring both digital and print editions from renowned authors.
        </p>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
            {[...Array(BOOKS_PER_PAGE)].map((_, index) => (
              <div key={index} className="book-card animate-pulse">
                <div className="aspect-[2/3] bg-muted rounded-md mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-1/3"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded w-full mt-2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <SearchX className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Error loading books. Please try again.</p>
            <Button onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <SearchX className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No books found in this category.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button onClick={handleRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button variant="outline" asChild>
                <Link to="/">Browse Other Categories</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
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
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
