
import React, { useEffect, useState } from 'react';
import { Book } from '@/types/supabase';
import { getBooksByCategory } from '@/services/bookServiceFixed';
import BookCard from '@/components/BookCard';
import { Skeleton } from '@/components/ui/skeleton';

interface RecommendedBooksProps {
  categorySlug: string;
  currentBookId?: string;
  limit?: number;
  title?: string;
}

const RecommendedBooks: React.FC<RecommendedBooksProps> = ({
  categorySlug,
  currentBookId,
  limit = 4,
  title = "You might also like"
}) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendedBooks = async () => {
      setIsLoading(true);
      try {
        const booksData = await getBooksByCategory(categorySlug);
        
        // Filter out the current book if provided
        let filtered = currentBookId 
          ? booksData.filter(book => book.id !== currentBookId)
          : booksData;
        
        // Shuffle the array to get random recommendations
        filtered = filtered.sort(() => 0.5 - Math.random());
        
        // Limit the number of recommendations
        setBooks(filtered.slice(0, limit));
      } catch (error) {
        console.error('Error fetching recommended books:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendedBooks();
  }, [categorySlug, currentBookId, limit]);

  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array(limit).fill(0).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="aspect-[2/3] w-full rounded-md" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (books.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {books.map((book) => (
          <BookCard key={book.id} {...book} />
        ))}
      </div>
    </div>
  );
};

export default RecommendedBooks;
