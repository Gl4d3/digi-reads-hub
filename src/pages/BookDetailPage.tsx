import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Book } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/use-toast';
import { getBookById } from '@/services/bookServiceFixed';
import { cn } from '@/lib/utils';

const BookDetailPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const fetchBook = async () => {
      if (!bookId) return;
      
      setIsLoading(true);
      try {
        const bookData = await getBookById(bookId);
        setBook(bookData);
      } catch (error) {
        console.error('Error fetching book details:', error);
        toast({
          title: "Error",
          description: "Failed to load book details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBook();
  }, [bookId, toast]);

  const handleAddToCart = () => {
    if (!book) return;
    addItem(book);
  };

  if (isLoading) {
    return <div className="container py-12">Loading book details...</div>;
  }

  if (!book) {
    return <div className="container py-12">Book not found.</div>;
  }

  const formatPrice = (price: number) => {
    return `KES ${(price / 100).toFixed(2)}`;
  };

  return (
    <div className="container py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img
            src={book.image_url}
            alt={book.title}
            className="w-full rounded-md shadow-md"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{book.title}</h1>
          <p className="text-lg text-muted-foreground mb-6">By {book.author}</p>
          <p className="text-gray-700 mb-6">{book.description}</p>
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl font-semibold">{formatPrice(book.price)}</span>
            <Button onClick={handleAddToCart}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={cn("category-pill", book.format === 'ebook' ? 'bg-blue-500/20 text-blue-500' : book.format === 'hardcover' ? 'bg-amber-500/20 text-amber-500' : 'bg-violet-500/20 text-violet-500')}>
              {book.format === 'both' ? 'E-book & Print' : book.format === 'ebook' ? 'E-book' : 'Print'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;
