
import { Book, Category, Bundle } from '@/types/supabase';
import { supabase, cacheConfig } from '@/integrations/supabase/client';
import { cache } from '@/utils/cacheUtils';
import { 
  searchGoogleBooks, 
  getBookDetails as getGoogleBookDetails,
  getCategoryBooks as getGoogleCategoryBooks,
  getNewReleases as getGoogleNewReleases,
  getFeaturedBooks as getGoogleFeaturedBooks,
  getCategories as getGoogleCategories,
  clearGoogleBooksCache
} from '@/services/googleBooksService';

// Re-export functions from Google Books service with our wrapper logic

export async function getBooks(): Promise<Book[]> {
  try {
    const cacheKey = 'all_books';
    const cachedBooks = cache.books.get<Book[]>(cacheKey);
    
    if (cachedBooks) {
      return cachedBooks;
    }
    
    // Get books from multiple categories for variety
    const categories = ['fiction', 'non-fiction', 'african-literature', 'business'];
    
    let allBooks: Book[] = [];
    for (const category of categories) {
      const result = await getGoogleCategoryBooks(category, 5);
      allBooks = [...allBooks, ...result.books];
    }
    
    // Shuffle for randomness
    allBooks = allBooks.sort(() => 0.5 - Math.random());
    
    // Cache the result
    cache.books.set(cacheKey, allBooks, cacheConfig.ttl.books);
    
    return allBooks;
  } catch (error) {
    console.error('Error getting books:', error);
    return [];
  }
}

export async function getBooksByCategory(categorySlug: string, limit = 10, startIndex = 0): Promise<Book[]> {
  try {
    const result = await getGoogleCategoryBooks(categorySlug, limit, startIndex);
    return result.books;
  } catch (error) {
    console.error(`Error getting books for category ${categorySlug}:`, error);
    return [];
  }
}

export function getCategories(): Promise<Category[]> {
  return Promise.resolve(getGoogleCategories());
}

export async function getNewReleases(limit = 10): Promise<Book[]> {
  return await getGoogleNewReleases(limit);
}

export async function getFeaturedBooks(limit = 10): Promise<Book[]> {
  return await getGoogleFeaturedBooks(limit);
}

export async function searchBooks(query: string, limit = 20, startIndex = 0): Promise<Book[]> {
  try {
    const result = await searchGoogleBooks(query, limit, startIndex);
    return result.books;
  } catch (error) {
    console.error('Error searching books:', error);
    return [];
  }
}

export async function getBookById(id: string): Promise<Book | null> {
  try {
    return await getGoogleBookDetails(id);
  } catch (error) {
    console.error(`Error getting book ${id}:`, error);
    return null;
  }
}

// Bundle-related functions
export async function getBundles(): Promise<Bundle[]> {
  try {
    // In a real application, we would fetch this from Supabase
    // For now, using static data
    const currentDate = new Date();
    const weekFromNow = new Date(currentDate);
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    
    const bundles: Bundle[] = [
      {
        id: 'weekly-bundle',
        name: 'Weekly Reads Bundle',
        description: 'A collection of 5 curated books to enjoy throughout the week. New selection every Monday!',
        discount_percentage: 25,
        image_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
        is_active: true,
        created_at: currentDate.toISOString(),
        updated_at: currentDate.toISOString(),
      },
      {
        id: 'daily-bundle',
        name: 'Daily Inspiration Bundle',
        description: 'Get your daily dose of inspiration with this collection of short reads, poetry, and motivational content.',
        discount_percentage: 15,
        image_url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b',
        is_active: true,
        created_at: currentDate.toISOString(),
        updated_at: currentDate.toISOString(),
      },
      {
        id: 'flash-sale-bundle',
        name: 'Flash Sale: African Classics',
        description: `Limited time offer! Grab this collection of essential African classics at an incredible discount. Available only until ${weekFromNow.toLocaleDateString()}!`,
        discount_percentage: 40,
        image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
        is_active: true,
        created_at: currentDate.toISOString(),
        updated_at: currentDate.toISOString(),
      }
    ];
    
    return bundles;
  } catch (error) {
    console.error('Error getting bundles:', error);
    return [];
  }
}

export async function getBundleWithBooks(bundleId: string): Promise<{ bundle: Bundle; books: Book[] } | null> {
  try {
    // Get the bundle
    const bundles = await getBundles();
    const bundle = bundles.find(b => b.id === bundleId);
    
    if (!bundle) {
      return null;
    }
    
    // In a real app, we'd query for the books in this bundle
    // For now, fetch some books based on the bundle type
    let query = '';
    switch (bundleId) {
      case 'weekly-bundle':
        query = 'bestseller fiction';
        break;
      case 'daily-bundle':
        query = 'inspiration self-help';
        break;
      case 'flash-sale-bundle':
        query = 'african classics literature';
        break;
      default:
        query = 'popular books';
    }
    
    const result = await searchGoogleBooks(query, 5);
    
    return {
      bundle,
      books: result.books
    };
  } catch (error) {
    console.error(`Error getting bundle ${bundleId} with books:`, error);
    return null;
  }
}

// User-specific functions
export async function toggleFavorite(bookId: string): Promise<boolean> {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      console.error('User not authenticated');
      return false;
    }
    
    const userId = user.user.id;
    
    // Check if already favorited
    const { data: existingFavorite } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .single();
    
    if (existingFavorite) {
      // Remove from favorites
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('book_id', bookId);
      
      return false;
    } else {
      // Add to favorites
      await supabase
        .from('favorites')
        .insert([
          { user_id: userId, book_id: bookId }
        ]);
      
      return true;
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return false;
  }
}

export async function getFavorites(): Promise<Book[]> {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      console.error('User not authenticated');
      return [];
    }
    
    const userId = user.user.id;
    
    // Get favorite book IDs
    const { data: favorites } = await supabase
      .from('favorites')
      .select('book_id')
      .eq('user_id', userId);
    
    if (!favorites || favorites.length === 0) {
      return [];
    }
    
    // Get book details for each favorite
    const bookIds = favorites.map(fav => fav.book_id);
    
    const books: Book[] = [];
    for (const id of bookIds) {
      const book = await getBookById(id);
      if (book) {
        books.push(book);
      }
    }
    
    return books;
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
}

export async function checkIsFavorite(bookId: string): Promise<boolean> {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      return false;
    }
    
    const userId = user.user.id;
    
    const { data: favorite } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .single();
    
    return !!favorite;
  } catch (error) {
    console.error('Error checking if book is favorite:', error);
    return false;
  }
}

// Subscription function
export async function subscribeToMailingList(email: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('mailing_list')
      .insert([{ email }]);
    
    return !error;
  } catch (error) {
    console.error('Error subscribing to mailing list:', error);
    return false;
  }
}

// Cache management
export function clearAllCaches(): void {
  cache.books.clear();
  cache.search.clear();
  clearGoogleBooksCache();
}

/**
 * Prefetch common data like featured books, new releases, etc.
 */
export async function prefetchCommonData(): Promise<void> {
  try {
    const promises = [
      getFeaturedBooks(),
      getNewReleases(),
      getCategories(),
      getBooksByCategory('african-literature', 5),
      getBooksByCategory('fiction', 5),
    ];
    
    await Promise.allSettled(promises);
    console.log('Common data prefetched successfully');
  } catch (error) {
    console.error('Error prefetching common data:', error);
  }
}
