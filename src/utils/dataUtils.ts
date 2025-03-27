
import { Book, Category } from '@/types/supabase';
import { 
  getBooks, 
  getBooksByCategory, 
  getCategories, 
  getNewReleases, 
  getFeaturedBooks,
  clearAllCaches
} from '@/services/bookServiceFixed';

// Function to ensure we have data loaded
export async function ensureDataLoaded() {
  try {
    // First check if we already have categories loaded
    const categories = await getCategories();
    
    if (!categories || categories.length === 0) {
      console.error('No categories available');
      return false;
    }
    
    // Check if we have books loaded for popular categories
    const popularCategories = [
      'african-literature',
      'self-help',
      'business',
      'health'
    ];
    
    const loadingPromises = popularCategories.map(async (categorySlug) => {
      const books = await getBooksByCategory(categorySlug);
      return books.length > 0;
    });
    
    const results = await Promise.all(loadingPromises);
    const allCategoriesHaveBooks = results.every(Boolean);
    
    if (!allCategoriesHaveBooks) {
      console.log('Some categories are missing books, refreshing data...');
      // Clear all caches to ensure fresh data
      clearAllCaches();
      
      // Reload critical data
      await Promise.all([
        getNewReleases(),
        getFeaturedBooks(),
        ...popularCategories.map(cat => getBooksByCategory(cat))
      ]);
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring data is loaded:', error);
    return false;
  }
}

// Function to retry loading books for a specific category
export async function retryLoadingCategoryBooks(categorySlug: string): Promise<Book[]> {
  try {
    // Clear category-specific cache
    // Fetch fresh data
    return await getBooksByCategory(categorySlug);
  } catch (error) {
    console.error(`Error retrying data load for category ${categorySlug}:`, error);
    return [];
  }
}

// Get a specific number of books for each category
export async function getBooksForCategories(
  categoryLimit: number = 4
): Promise<Record<string, Book[]>> {
  try {
    const categories = await getCategories();
    const result: Record<string, Book[]> = {};
    
    // Load books for each category in parallel
    await Promise.all(
      categories.map(async (category) => {
        const books = await getBooksByCategory(category.slug);
        result[category.slug] = books.slice(0, categoryLimit);
      })
    );
    
    return result;
  } catch (error) {
    console.error('Error getting books for categories:', error);
    return {};
  }
}
