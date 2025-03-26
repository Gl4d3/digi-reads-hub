import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { searchBooks } from '@/services/bookServiceFixed';
import { Book } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, SlidersHorizontal } from 'lucide-react';
import BookCard from '@/components/BookCard';
import Navbar from '@/components/Navbar';
import { books as mockBooks } from '@/data/books';

// Convert the mock data books to the format expected by BookCard
const adaptMockBook = (book: typeof mockBooks[0]): Book => {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    price: book.price,
    image_url: book.imageUrl,
    format: book.format,
    is_featured: book.isNew || false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    description: book.description
  };
};

const SearchPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialSearchTerm = queryParams.get('q') || '';
  
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [searchQuery, setSearchQuery] = useState(initialSearchTerm);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  
  useEffect(() => {
    if (searchQuery) {
      handleSearch();
    }
  }, [searchQuery]);
  
  const handleSearch = async () => {
    setIsLoading(true);
    
    try {
      // Attempt to get books from Supabase
      const searchResults = await searchBooks(searchQuery, 
        selectedFormat ? { format: selectedFormat } : {});
      
      // If we get results, use them
      if (searchResults.length > 0) {
        setBooks(searchResults);
      } else {
        // Otherwise, fall back to mock data
        // Filter mock books based on search term
        const filteredMockBooks = mockBooks.filter(book => 
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          book.author.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        // Apply format filter if selected
        const formatFilteredBooks = selectedFormat 
          ? filteredMockBooks.filter(book => book.format === selectedFormat || 
              (selectedFormat === 'both' && (book.format === 'ebook' || book.format === 'hardcover')))
          : filteredMockBooks;
          
        setBooks(formatFilteredBooks.map(adaptMockBook));
      }
    } catch (error) {
      console.error('Error searching books:', error);
      
      // Fall back to mock data on error
      const filteredMockBooks = mockBooks.filter(book => 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        book.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      const formatFilteredBooks = selectedFormat 
        ? filteredMockBooks.filter(book => book.format === selectedFormat || 
            (selectedFormat === 'both' && (book.format === 'ebook' || book.format === 'hardcover')))
        : filteredMockBooks;
        
      setBooks(formatFilteredBooks.map(adaptMockBook));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchTerm);
    
    // Update URL with search term to make it bookmarkable
    const newUrl = `${window.location.pathname}?q=${encodeURIComponent(searchTerm)}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };
  
  const handleFormatChange = (format: string) => {
    setSelectedFormat(format === selectedFormat ? null : format);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container px-4 py-8 md:px-6 md:py-12">
        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search for books or authors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </form>
          
          {showFilters && (
            <div className="mt-4 p-4 border rounded-md">
              <h3 className="text-sm font-medium mb-2">Format</h3>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={selectedFormat === 'ebook' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => handleFormatChange('ebook')}
                >
                  E-Book
                </Button>
                <Button 
                  variant={selectedFormat === 'hardcover' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => handleFormatChange('hardcover')}
                >
                  Print
                </Button>
                <Button 
                  variant={selectedFormat === 'both' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => handleFormatChange('both')}
                >
                  Both
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">
            {searchQuery ? `Search results for "${searchQuery}"` : 'All Books'}
          </h1>
          <p className="text-muted-foreground">
            {books.length} {books.length === 1 ? 'book' : 'books'} found
          </p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[2/3] bg-muted rounded-md mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-5 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-10 bg-muted rounded w-full mt-2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl font-medium mb-4">No books found</p>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard key={book.id} {...book} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
