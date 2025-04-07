// This file contains the implementation of the book service
// Replace with proper Supabase calls and fetch data from actual tables

import { supabase } from '@/integrations/supabase/client';
import { books } from '@/data/books';
import { Book, Category, Favorite } from '@/types/supabase';
import { fromSupabase, cacheConfig } from '@/integrations/supabase/client';

// Mock data for now - In a real app this would come from Supabase
const categories = [
  { id: '1', name: 'African Literature', slug: 'african-literature', created_at: new Date().toISOString() },
  { id: '2', name: 'Self-Help', slug: 'self-help', created_at: new Date().toISOString() },
  { id: '3', name: 'Business', slug: 'business', created_at: new Date().toISOString() },
  { id: '4', name: 'Health', slug: 'health', created_at: new Date().toISOString() },
];

export const getBooks = async (): Promise<Book[]> => {
  // Return mock data for now
  return books.map(book => ({
    id: book.id,
    title: book.title,
    author: book.author,
    price: book.price,
    description: book.description,
    image_url: book.imageUrl,
    format: book.format,
    is_featured: !!book.isNew,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: [book.category.toLowerCase().replace(' ', '-')]
  }));
};

export const getBooksByCategory = async (categorySlug: string): Promise<Book[]> => {
  const allBooks = await getBooks();
  return allBooks.filter(book => 
    book.categories?.includes(categorySlug) || 
    book.categories?.some(cat => cat.toLowerCase() === categorySlug.toLowerCase())
  );
};

export const getFeaturedBooks = async (limit: number = 10): Promise<Book[]> => {
  const allBooks = await getBooks();
  return allBooks
    .filter(book => book.is_featured)
    .slice(0, limit);
};

export const getNewReleases = async (limit: number = 10): Promise<Book[]> => {
  const allBooks = await getBooks();
  return allBooks
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
};

export const getBookById = async (id: string): Promise<Book | null> => {
  const allBooks = await getBooks();
  return allBooks.find(book => book.id === id) || null;
};

export const searchBooks = async (query: string): Promise<Book[]> => {
  const allBooks = await getBooks();
  const lowercaseQuery = query.toLowerCase();
  
  return allBooks.filter(book => 
    book.title.toLowerCase().includes(lowercaseQuery) || 
    book.author.toLowerCase().includes(lowercaseQuery) ||
    book.description?.toLowerCase().includes(lowercaseQuery) ||
    book.categories?.some(cat => cat.toLowerCase().includes(lowercaseQuery))
  );
};

export const getCategories = async (): Promise<Category[]> => {
  // In a real app, this would fetch from Supabase
  return categories;
};

export const getFavorites = async (userId: string): Promise<Book[]> => {
  try {
    // In a real implementation, this would fetch from Supabase
    // For now, return some mock data
    const randomBooks = await getBooks();
    return randomBooks.slice(0, 3); // Return first 3 books as "favorites"
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
};

export const addToFavorites = async (userId: string, bookId: string): Promise<boolean> => {
  try {
    // In a real implementation, this would add to Supabase
    console.log(`Adding book ${bookId} to favorites for user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return false;
  }
};

export const removeFromFavorites = async (userId: string, bookId: string): Promise<boolean> => {
  try {
    // In a real implementation, this would remove from Supabase
    console.log(`Removing book ${bookId} from favorites for user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return false;
  }
};

export const checkIsFavorite = async (userId: string, bookId: string): Promise<boolean> => {
  try {
    // In a real implementation, this would check Supabase
    return Math.random() > 0.5; // Randomly return true or false for demo purposes
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};

export const getRecommendedBooks = async (bookId: string, limit: number = 4): Promise<Book[]> => {
  try {
    const currentBook = await getBookById(bookId);
    if (!currentBook || !currentBook.categories || currentBook.categories.length === 0) {
      // If no categories, return random books
      const allBooks = await getBooks();
      return allBooks
        .filter(book => book.id !== bookId)
        .sort(() => 0.5 - Math.random())
        .slice(0, limit);
    }
    
    // Get books from the same category
    const categoryBooks = await getBooksByCategory(currentBook.categories[0]);
    const recommendations = categoryBooks
      .filter(book => book.id !== bookId)
      .sort(() => 0.5 - Math.random()) // Shuffle
      .slice(0, limit);
      
    return recommendations;
  } catch (error) {
    console.error('Error getting recommended books:', error);
    return [];
  }
};
