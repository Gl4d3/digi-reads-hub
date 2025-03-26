
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import BookCard from './BookCard';
import { Link } from 'react-router-dom';
import { Book } from '@/types/supabase';

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
    <section className={cn("py-8 md:py-12", className)}>
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">{title}</h2>
            {description && (
              <p className="text-muted-foreground max-w-[800px]">{description}</p>
            )}
          </div>
          <Button 
            variant="outline" 
            className="mt-4 md:mt-0 self-start md:self-center"
            asChild
          >
            <Link to={`/category/${category.toLowerCase().replace(' ', '-')}`}>
              View All
            </Link>
          </Button>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No books available in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
      <div className="h-4 bg-muted rounded w-1/3"></div>
      <div className="h-5 bg-muted rounded w-3/4"></div>
      <div className="h-4 bg-muted rounded w-1/2"></div>
      <div className="h-10 bg-muted rounded w-full mt-2"></div>
    </div>
  </div>
);

export default CategorySection;
