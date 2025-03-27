import { supabase, fromSupabase, cacheConfig } from '@/integrations/supabase/client';
import { Book, Category, Bundle } from '@/types/supabase';
import { cache } from '@/utils/cacheUtils';
import { 
  searchOpenLibrary, 
  getBookDetails, 
  generateBundles, 
  getCategories as getOpenLibraryCategories, 
  DEFAULT_BOOK_IMAGE 
} from './openLibraryService';

// Cache for books, categories, and bundles
let booksCache: Book[] | null = null;
let categoriesCache: Category[] | null = null;
let bundlesCache: Bundle[] | null = null;
let bundleBooksMap: Record<string, string[]> = {};

// Initialize bundle books mapping for our predefined bundles
async function initializeBundlesData() {
  // Check our memory cache first
  const cacheKey = 'all_bundles';
  const cachedBundles = cache.bundles.get<Bundle[]>(cacheKey);
  if (cachedBundles && bundlesCache !== null) {
    return cachedBundles;
  }
  
  if (bundlesCache) return bundlesCache;
  
  console.log('Initializing bundles data');
  
  // Generate our predefined bundles
  bundlesCache = generateBundles();
  
  // Initialize books for each bundle
  await Promise.all(bundlesCache.map(async (bundle) => {
    // Fetch books based on bundle theme
    let query = '';
    let limit = 5;
    
    if (bundle.id === 'weekly-bundle') {
      query = 'african fiction bestseller';
    } else if (bundle.id === 'daily-bundle') {
      query = 'inspirational poetry';
      limit = 3;
    } else if (bundle.id === 'flash-sale-bundle') {
      query = 'african classics chinua achebe';
    }
    
    // Use cached books if available
    const bundleCacheKey = `bundle_books_${bundle.id}`;
    const cachedBooks = cache.books.get<Book[]>(bundleCacheKey);
    
    let books: Book[];
    if (cachedBooks) {
      books = cachedBooks;
      console.log(`Using cached books for bundle: ${bundle.id}`);
    } else {
      console.log(`Fetching books for bundle: ${bundle.id}`);
      books = await searchOpenLibrary(query, limit);
      // Cache bundle books
      cache.books.set(bundleCacheKey, books, cacheConfig.ttl.books);
    }
    
    bundleBooksMap[bundle.id] = books.map(book => book.id);
    
    // Add books to the cache
    if (booksCache) {
      booksCache = [...booksCache, ...books];
    } else {
      booksCache = books;
    }
  }));
  
  // Cache the bundles
  cache.bundles.set(cacheKey, bundlesCache, cacheConfig.ttl.bundles);
  
  return bundlesCache;
}

// Initialize categories
function initializeCategories() {
  // Check cache first
  const cacheKey = 'all_categories';
  const cachedCategories = cache.categories.get<Category[]>(cacheKey);
  if (cachedCategories) {
    return cachedCategories;
  }
  
  if (categoriesCache) return categoriesCache;
  
  console.log('Initializing categories');
  categoriesCache = getOpenLibraryCategories();
  
  // Cache categories
  cache.categories.set(cacheKey, categoriesCache, cacheConfig.ttl.categories);
  
  return categoriesCache;
}

export async function getBooks(): Promise<Book[]> {
  try {
    // Check cache first
    const cacheKey = 'all_books';
    const cachedBooks = cache.books.getWithLocalStorage<Book[]>(cacheKey);
    if (cachedBooks && cachedBooks.length > 0) {
      console.log('Using cached books');
      return cachedBooks;
    }
    
    if (booksCache && booksCache.length > 0) {
      // Cache in our persistent store
      cache.books.setWithLocalStorage(cacheKey, booksCache, cacheConfig.ttl.books);
      return booksCache;
    }
    
    console.log('Fetching all books');
    
    // Fetch and cache books from different categories
    const categories = ['african literature', 'poetry', 'history'];
    const booksPromises = categories.map(category => 
      searchOpenLibrary(category, 15)
    );
    
    const booksArrays = await Promise.all(booksPromises);
    booksCache = booksArrays.flat();
    
    // Cache the books
    cache.books.setWithLocalStorage(cacheKey, booksCache, cacheConfig.ttl.books);
    
    return booksCache;
  } catch (error) {
    console.error('Error fetching books:', error);
    return [];
  }
}

export async function getBooksByCategory(categorySlug: string): Promise<Book[]> {
  try {
    // Initialize categories
    const categories = initializeCategories();
    const category = categories.find(c => c.slug === categorySlug);
    
    if (!category) {
      console.error(`Category not found: ${categorySlug}`);
      return [];
    }

    // If we have cached books, filter them
    if (booksCache) {
      // For simplicity, we'll do a naive match based on category name in the title or description
      // In a real app, you'd have proper categorization
      return booksCache.filter(book => 
        book.title.toLowerCase().includes(category.name.toLowerCase()) || 
        (book.description && book.description.toLowerCase().includes(category.name.toLowerCase()))
      );
    }

    // Otherwise fetch books for this category
    return await searchOpenLibrary(category.name, 20);
  } catch (error) {
    console.error('Error in getBooksByCategory:', error);
    return [];
  }
}

export async function getCategories(): Promise<Category[]> {
  return initializeCategories();
}

export async function getNewReleases(limit = 4): Promise<Book[]> {
  try {
    const allBooks = await getBooks();
    
    // Sort by created_at date and limit
    return allBooks
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching new releases:', error);
    return [];
  }
}

export async function getFeaturedBooks(limit = 4): Promise<Book[]> {
  try {
    const allBooks = await getBooks();
    
    // Filter featured books and limit
    return allBooks
      .filter(book => book.is_featured)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching featured books:', error);
    return [];
  }
}

export async function searchBooks(query: string, filters = {}): Promise<Book[]> {
  try {
    // If we have cached books, filter them
    if (booksCache && query) {
      const lowercaseQuery = query.toLowerCase();
      return booksCache.filter(book => 
        book.title.toLowerCase().includes(lowercaseQuery) || 
        book.author.toLowerCase().includes(lowercaseQuery)
      );
    }
    
    // Otherwise, search directly
    return await searchOpenLibrary(query, 20);
  } catch (error) {
    console.error('Error in searchBooks:', error);
    return [];
  }
}

export async function getBundles(): Promise<Bundle[]> {
  try {
    // Initialize bundles if not already done
    return await initializeBundlesData();
  } catch (error) {
    console.error('Error fetching bundles:', error);
    return [];
  }
}

export async function getBundleWithBooks(bundleId: string): Promise<{bundle: Bundle, books: Book[]}> {
  try {
    // Check cache first
    const cacheKey = `bundle_with_books_${bundleId}`;
    const cachedData = cache.bundles.get<{bundle: Bundle, books: Book[]}>(cacheKey);
    if (cachedData) {
      console.log(`Using cached bundle with books: ${bundleId}`);
      return cachedData;
    }
    
    // Initialize bundles if not already done
    const bundles = await initializeBundlesData();
    const bundle = bundles.find(b => b.id === bundleId);
    
    if (!bundle) {
      throw new Error(`Bundle not found: ${bundleId}`);
    }

    // Get books for this bundle
    const bookIds = bundleBooksMap[bundleId] || [];
    let books: Book[] = [];
    
    if (booksCache) {
      // Find books from cache
      books = booksCache.filter(book => bookIds.includes(book.id));
    }
    
    // If we couldn't find all books in the cache, fetch them individually
    if (books.length < bookIds.length) {
      const missingBookIds = bookIds.filter(id => !books.some(book => book.id === id));
      const missingBooksPromises = missingBookIds.map(id => getBookDetails(id));
      const missingBooks = await Promise.all(missingBooksPromises);
      
      // Add valid books to the result and cache
      missingBooks.forEach(book => {
        if (book) {
          books.push(book);
          if (booksCache) {
            booksCache.push(book);
          } else {
            booksCache = [book];
          }
        }
      });
    }

    const result = {
      bundle,
      books
    };
    
    // Cache the result
    cache.bundles.set(cacheKey, result, cacheConfig.ttl.bundles);

    return result;
  } catch (error) {
    console.error('Error in getBundleWithBooks:', error);
    return { bundle: {} as Bundle, books: [] };
  }
}

export async function toggleFavorite(bookId: string, userId: string): Promise<void> {
  try {
    // Check if the book is already a favorite
    const { data, error: checkError } = await fromSupabase.favorites()
      .select('id')
      .eq('restaurant_id', bookId)  // Using restaurant_id instead of book_id
      .eq('user_id', userId);
      
    if (checkError) {
      console.error('Error checking favorite status:', checkError);
      throw checkError;
    }
    
    if (data && data.length > 0) {
      // Book is already a favorite, so remove it
      const { error: deleteError } = await fromSupabase.favorites()
        .delete()
        .eq('id', data[0].id);
        
      if (deleteError) {
        console.error('Error removing favorite:', deleteError);
        throw deleteError;
      }
    } else {
      // Book is not a favorite, so add it
      // Since we can't directly use book_id due to the type definition,
      // we'll customize the object to match the favorites schema
      const { error: insertError } = await supabase
        .from('favorites')
        .insert({
          restaurant_id: bookId, // Using restaurant_id field for book_id
          user_id: userId,
          restaurant_data: {} // Required field in the schema
        });
        
      if (insertError) {
        console.error('Error adding favorite:', insertError);
        throw insertError;
      }
    }
  } catch (error) {
    console.error('Error in toggleFavorite:', error);
  }
}

export async function getFavorites(userId: string): Promise<Book[]> {
  try {
    // Get the favorite book IDs
    const { data: favoritesData, error: favoritesError } = await fromSupabase.favorites()
      .select('restaurant_id') // Using restaurant_id instead of book_id
      .eq('user_id', userId);
      
    if (favoritesError) {
      console.error('Error fetching favorites:', favoritesError);
      throw favoritesError;
    }

    const bookIds = favoritesData.map(fav => fav.restaurant_id);
    
    if (bookIds.length === 0) {
      return [];
    }

    // If we have books in cache, find them there
    if (booksCache) {
      return booksCache.filter(book => bookIds.includes(book.id));
    }

    // Otherwise, fetch each book individually
    const booksPromises = bookIds.map(id => getBookDetails(id));
    const books = await Promise.all(booksPromises);
    
    // Filter out null values (failed fetches)
    return books.filter(book => book !== null) as Book[];
  } catch (error) {
    console.error('Error in getFavorites:', error);
    return [];
  }
}

export async function checkIsFavorite(bookId: string, userId: string): Promise<boolean> {
  if (!userId) return false;
  
  try {
    const { data, error } = await fromSupabase.favorites()
      .select('id')
      .eq('restaurant_id', bookId) // Using restaurant_id instead of book_id
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) {
      console.error('Error checking favorite status:', error);
      throw error;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error in checkIsFavorite:', error);
    return false;
  }
}

export async function getBookById(bookId: string): Promise<Book> {
  try {
    // First, check if book exists in cache
    if (booksCache) {
      const cachedBook = booksCache.find(book => book.id === bookId);
      if (cachedBook) return cachedBook;
    }
    
    // If not in cache, fetch from OpenLibrary
    const book = await getBookDetails(bookId);
    
    if (!book) {
      throw new Error(`Book not found: ${bookId}`);
    }
    
    // Add to cache
    if (booksCache) {
      booksCache.push(book);
    } else {
      booksCache = [book];
    }
    
    return book;
  } catch (error) {
    console.error('Error fetching book:', error);
    throw error;
  }
}

// Helper to add user to mailing list
export async function subscribeToMailingList(email: string, firstName?: string): Promise<void> {
  try {
    // Since mailing_list table doesn't exist yet, we'll log this functionality
    console.log(`Subscribing ${email} (${firstName || 'no name'}) to mailing list`);
    
    // For testing purposes, we'll mock a successful API call
    console.log('Subscription successful (mock)');
  } catch (error) {
    console.error('Error subscribing to mailing list:', error);
    throw error;
  }
}

// Helper to clear all caches
export function clearAllCaches(): void {
  booksCache = null;
  categoriesCache = null;
  bundlesCache = null;
  bundleBooksMap = {};
  cache.clearAll();
}

// Helper to prefetch common data
export async function prefetchCommonData(): Promise<void> {
  try {
    console.log('Prefetching common data');
    // Prefetch popular categories
    await getCategories();
    
    // Prefetch featured books and new releases
    await getFeaturedBooks();
    await getNewReleases();
    
    // Prefetch bundles
    await getBundles();
    
    console.log('Prefetching complete');
  } catch (error) {
    console.error('Error prefetching common data:', error);
  }
}
