
import React from 'react';
import { useParams } from 'react-router-dom';
import BookCard from '@/components/BookCard';
import { books } from '@/data/books'; // Sample data

// The correct way to type params with useParams
type CategoryParams = {
  categoryId?: string;
};

const CategoryPage = () => {
  // Use the correct typing for useParams
  const { categoryId } = useParams<CategoryParams>();
  
  // Convert URL parameter to display format
  const formatCategoryName = (categoryId: string | undefined) => {
    if (!categoryId) return '';
    return categoryId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const categoryName = formatCategoryName(categoryId);
  
  // Filter books by category
  const categoryBooks = books.filter(
    book => book.category.toLowerCase() === categoryName.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8 md:px-6 md:py-12">
        <header className="mb-12">
          <h1 className="text-3xl font-bold mb-4">{categoryName}</h1>
          <p className="text-muted-foreground max-w-2xl">
            Explore our collection of {categoryName.toLowerCase()} books, featuring both digital and print editions from renowned authors.
          </p>
        </header>

        {categoryBooks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No books found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categoryBooks.map((book) => (
              <BookCard key={book.id} {...book} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
