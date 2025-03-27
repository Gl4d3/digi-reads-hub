
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import BookCard from '@/components/BookCard';
import { getBooksByCategory, getCategories } from '@/services/bookServiceFixed';
import { Book, Category } from '@/types/supabase';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, SearchX, RefreshCw } from 'lucide-react';

type CategoryParams = {
  categoryId?: string;
};

const CategoryPage = () => {
  const { categoryId } = useParams<CategoryParams>();
  const [books, setBooks] = useState<Book[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  
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
        const data = await getBooksByCategory(categoryId);
        setBooks(data);
      } catch (error) {
        console.error('Error fetching books by category:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [categoryId]);

  const handleRefresh = () => {
    if (categoryId) {
      setIsLoading(true);
      getBooksByCategory(categoryId)
        .then(data => {
          setBooks(data);
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
            {[...Array(10)].map((_, index) => (
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
            {books.map((book) => (
              <BookCard key={book.id} {...book} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
