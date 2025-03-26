
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import BookCard from '@/components/BookCard';
import { Search } from 'lucide-react';

// Sample book data
import { books } from '@/data/books';

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 5000]); // in KES cents (0-5000)
  const [selectedFormat, setSelectedFormat] = useState('all');

  // Filter books
  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || book.category.toLowerCase() === selectedCategory;
    const matchesPrice = book.price >= priceRange[0] && book.price <= priceRange[1];
    const matchesFormat = selectedFormat === 'all' || book.format === selectedFormat || 
                         (selectedFormat === 'both' && book.format === 'both');
    
    return matchesSearch && matchesCategory && matchesPrice && matchesFormat;
  });

  // Format price for display
  const formatPrice = (price: number) => `KES ${(price / 100).toFixed(2)}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8 md:px-6 md:py-12">
        <h1 className="text-3xl font-bold mb-8">Search Books</h1>
        
        {/* Search filters */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          {/* Search input */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by title or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category filter */}
          <div>
            <Select 
              value={selectedCategory} 
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="self-help">Self-Help</SelectItem>
                <SelectItem value="african literature">African Literature</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="health">Health</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Format filter */}
          <div>
            <Select 
              value={selectedFormat} 
              onValueChange={setSelectedFormat}
            >
              <SelectTrigger>
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Formats</SelectItem>
                <SelectItem value="ebook">E-book</SelectItem>
                <SelectItem value="hardcover">Hardcover</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Price range filter */}
        <div className="mb-12">
          <h3 className="font-medium mb-3">Price Range</h3>
          <div className="space-y-6">
            <Slider
              defaultValue={[0, 5000]}
              max={5000}
              step={100}
              value={priceRange}
              onValueChange={setPriceRange}
              className="w-full"
            />
            <div className="flex justify-between text-sm">
              <span>{formatPrice(priceRange[0])}</span>
              <span>{formatPrice(priceRange[1])}</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            {filteredBooks.length} {filteredBooks.length === 1 ? 'Result' : 'Results'}
          </h2>
          
          {filteredBooks.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">No books found matching your search criteria.</p>
              <Button onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setPriceRange([0, 5000]);
                setSelectedFormat('all');
              }}>
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredBooks.map((book) => (
                <BookCard key={book.id} {...book} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
