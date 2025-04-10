
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import BookCard from './BookCard';
import { Link } from 'react-router-dom';
import { Book } from '@/types/supabase';
import { ChevronRight, Star } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';

interface CategorySectionProps {
  title: string;
  description?: string;
  category: string;
  books: Book[];
  className?: string;
  isLoading?: boolean;
  totalBooks?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  limit?: number;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  description,
  category,
  books,
  className,
  isLoading = false,
  totalBooks = 0,
  currentPage = 1,
  onPageChange,
  limit = 5,
}) => {
  // Display pagination if there's more than one page of books
  const totalPages = Math.ceil(totalBooks / limit);
  const showPagination = onPageChange && totalPages > 1;
  
  // Calculate which page numbers to display
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    let pages: (number | string)[] = [1];
    
    if (currentPage > 3) {
      pages.push('...');
    }
    
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (currentPage < totalPages - 2) {
      pages.push('...');
    }
    
    pages.push(totalPages);
    
    return pages;
  };

  return (
    <section className={cn("py-6 md:py-10", className)}>
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-1">{title}</h2>
            {description && (
              <p className="text-sm text-muted-foreground max-w-[800px]">{description}</p>
            )}
          </div>
          <Button 
            variant="ghost" 
            className="mt-2 md:mt-0 self-start md:self-center text-sm"
            asChild
          >
            <Link to={`/category/${category.toLowerCase().replace(' ', '-')}`} className="flex items-center">
              View All
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {[...Array(5)].map((_, i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-8 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">No books available in this category.</p>
            <Button variant="link" asChild className="mt-2">
              <Link to="/search">Search for books</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {books.map((book) => (
                <BookCard key={book.id} {...book} />
              ))}
            </div>
            
            {showPagination && (
              <Pagination className="mt-6">
                <PaginationContent>
                  {getPageNumbers().map((page, i) => (
                    <PaginationItem key={i}>
                      {typeof page === 'string' ? (
                        <span className="flex h-9 w-9 items-center justify-center">
                          ...
                        </span>
                      ) : (
                        <PaginationLink
                          href="#"
                          isActive={page === currentPage}
                          onClick={(e) => {
                            e.preventDefault();
                            onPageChange(page);
                          }}
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>
    </section>
  );
};

const BookCardSkeleton = () => (
  <div className="book-card animate-pulse">
    <div className="aspect-[2/3] bg-muted rounded-md mb-4"></div>
    <div className="space-y-2">
      <div className="h-3 bg-muted rounded w-1/3"></div>
      <div className="h-4 bg-muted rounded w-3/4"></div>
      <div className="h-3 bg-muted rounded w-1/2"></div>
      <div className="h-8 bg-muted rounded w-full mt-2"></div>
    </div>
  </div>
);

export default CategorySection;
