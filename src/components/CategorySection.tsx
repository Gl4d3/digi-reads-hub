
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import BookCard from './BookCard';
import { Link } from 'react-router-dom';
import { Book } from '@/types/supabase';
import { ChevronRight } from 'lucide-react';

interface CategorySectionProps {
  title: string;
  description?: string;
  category: string;
  books: Book[];
  className?: string;
  isLoading?: boolean;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  description,
  category,
  books,
  className,
  isLoading = false,
}) => {
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {books.map((book) => (
              <BookCard key={book.id} {...book} />
            ))}
          </div>
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
