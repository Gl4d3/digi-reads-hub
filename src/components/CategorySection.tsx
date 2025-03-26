
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import BookCard from './BookCard';
import { Link } from 'react-router-dom';

interface CategorySectionProps {
  title: string;
  description?: string;
  category: string;
  books: any[];
  className?: string;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  description,
  category,
  books,
  className,
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookCard key={book.id} {...book} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
