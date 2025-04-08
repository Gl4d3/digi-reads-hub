
import { Book, Category } from '@/types/supabase';
import { cache } from '@/utils/cacheUtils';
import { cacheConfig } from '@/integrations/supabase/client';
import { fetchWithCache, clearApiCache } from '@/utils/apiUtils';
import { preloadImages, getOptimizedImageUrl } from '@/utils/imageUtils';

// Default fallback image if no image is available
export const DEFAULT_BOOK_IMAGE = '/assets/digireads-placeholder.jpg';
const API_BASE_URL = 'https://www.googleapis.com/books/v1';

// Define Google Books API response types
interface GoogleBooksSearchResponse {
  items: GoogleBookItem[];
  totalItems: number;
  kind: string;
}

interface GoogleBookItem {
  id: string;
  volumeInfo: {
    title: string;
    subtitle?: string;
    authors?: string[];
    publishedDate?: string;
    description?: string;
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
    pageCount?: number;
    categories?: string[];
    imageLinks?: {
      smallThumbnail?: string;
      thumbnail?: string;
      small?: string;
      medium?: string;
      large?: string;
      extraLarge?: string;
    };
    language?: string;
    publisher?: string;
  };
  saleInfo?: {
    listPrice?: {
      amount: number;
      currencyCode: string;
    };
    retailPrice?: {
      amount: number;
      currencyCode: string;
    };
  };
}

// Transform Google Books item to our Book type
function transformGoogleBookToBook(book: GoogleBookItem): Book {
  // Generate a realistic price based on page count or randomly if not available
  const pageCount = book.volumeInfo.pageCount || 0;
  
  // Base price calculation - between 700 and 1200 KES (70000-120000 cents)
  // Adjust based on page count if available
  let price = Math.floor(Math.random() * 50000) + 70000; // Default random price
  if (pageCount > 0) {
    // Adjust price based on page count: ~10 KES per page + base price
    price = Math.floor(pageCount * 1000) + 50000;
    // Cap the price at reasonable limits
    price = Math.min(Math.max(price, 30000), 150000);
  }
  
  // Determine book format
  const formats = ['ebook', 'hardcover', 'both'] as const;
  const format = formats[Math.floor(Math.random() * formats.length)];
  
  // Get cover image with fallback chain
  let imageUrl = DEFAULT_BOOK_IMAGE;
  if (book.volumeInfo.imageLinks) {
    // Try to get the best available image, in order of preference
    imageUrl = book.volumeInfo.imageLinks.large || 
               book.volumeInfo.imageLinks.medium || 
               book.volumeInfo.imageLinks.small || 
               book.volumeInfo.imageLinks.thumbnail ||
               DEFAULT_BOOK_IMAGE;
    
    // Ensure HTTPS for Google Book API images and remove zoom parameter
    if (imageUrl.startsWith('http:')) {
      imageUrl = imageUrl.replace('http:', 'https:');
    }
    
    // Remove the zoom parameter which can cause issues
    imageUrl = imageUrl.replace('&zoom=1', '');
  }
  
  // Generate categories based on Google Books categories or assign defaults
  const categoryAssignments: string[] = [];
  if (book.volumeInfo.categories && book.volumeInfo.categories.length > 0) {
    const categoryText = book.volumeInfo.categories.join(' ').toLowerCase();
    
    // Map Google categories to our categories
    if (categoryText.includes('africa') || categoryText.includes('african')) {
      categoryAssignments.push('african-literature');
    }
    if (categoryText.includes('business') || categoryText.includes('marketing') || 
        categoryText.includes('economics') || categoryText.includes('finance')) {
      categoryAssignments.push('business');
    }
    if (categoryText.includes('health') || categoryText.includes('wellness') || 
        categoryText.includes('fitness') || categoryText.includes('medical')) {
      categoryAssignments.push('health');
    }
    if (categoryText.includes('self-help') || categoryText.includes('personal') || 
        categoryText.includes('improvement') || categoryText.includes('development')) {
      categoryAssignments.push('self-help');
    }
    if (categoryText.includes('poet') || categoryText.includes('poem') || 
        categoryText.includes('verse')) {
      categoryAssignments.push('poetry');
    }
    if (categoryText.includes('history') || categoryText.includes('historical') || 
        categoryText.includes('biography') || categoryText.includes('memoir')) {
      categoryAssignments.push('history');
    }
    if (categoryText.includes('fiction') || categoryText.includes('novel') || 
        categoryText.includes('fantasy') || categoryText.includes('sci-fi')) {
      categoryAssignments.push('fiction');
    }
    if (categoryText.includes('non-fiction') || categoryText.includes('essay') || 
        categoryText.includes('reference') || categoryText.includes('academic')) {
      categoryAssignments.push('non-fiction');
    }
  }
  
  // If no categories matched or none provided, assign a default category
  if (categoryAssignments.length === 0) {
    // Try to guess from title or description
    const titleAndDesc = `${book.volumeInfo.title} ${book.volumeInfo.description || ''}`.toLowerCase();
    
    if (titleAndDesc.includes('africa') || titleAndDesc.includes('african')) {
      categoryAssignments.push('african-literature');
    } else if (titleAndDesc.includes('poet') || titleAndDesc.includes('poem')) {
      categoryAssignments.push('poetry');
    } else if (titleAndDesc.includes('history')) {
      categoryAssignments.push('history');
    } else {
      // Default to fiction as fallback
      categoryAssignments.push('fiction');
    }
  }
  
  // Create description with available info
  let description = book.volumeInfo.description || '';
  if (!description && book.volumeInfo.subtitle) {
    description = book.volumeInfo.subtitle;
  }
  if (!description) {
    description = `Published by ${book.volumeInfo.publisher || 'Unknown'} ${book.volumeInfo.publishedDate ? `in ${book.volumeInfo.publishedDate.substring(0, 4)}` : ''}.`;
  }
  
  return {
    id: book.id,
    title: book.volumeInfo.title,
    author: book.volumeInfo.authors?.join(', ') || 'Unknown Author',
    price: price,
    image_url: getOptimizedImageUrl(imageUrl),
    format: format,
    description: description,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_featured: Math.random() > 0.8, // 20% chance of being featured
    categories: categoryAssignments,
  };
}

/**
 * Search books using Google Books API
 * @param query Search query
 * @param limit Maximum number of results to return
 * @param startIndex Starting index for pagination
 */
export async function searchGoogleBooks(
  query: string, 
  limit = 20,
  startIndex = 0
): Promise<{ books: Book[], totalItems: number }> {
  try {
    // Check cache first
    const cacheKey = `gbooks_search_${query}_${limit}_${startIndex}`;
    const cachedResult = cache.search.get<{ books: Book[], totalItems: number }>(cacheKey);
    if (cachedResult) {
      console.log(`Cache hit for Google Books search: ${query}`);
      return cachedResult;
    }

    console.log(`Fetching books from Google Books API for query: ${query}`);
    
    // Build search URL with proper parameters
    const url = `${API_BASE_URL}/volumes?q=${encodeURIComponent(query)}&maxResults=${limit}&startIndex=${startIndex}&printType=books&projection=full`;
    
    // Use enhanced fetch with caching, retries, and timeout
    const data = await fetchWithCache<GoogleBooksSearchResponse>(
      url,
      {
        signal: AbortSignal.timeout(10000), // 10 second timeout
      },
      `gb_search_${query}_${limit}_${startIndex}`,
      cacheConfig.ttl.search
    );
    
    const totalItems = data.totalItems || 0;
    
    // Handle case where no results were found
    if (!data.items || data.items.length === 0) {
      const emptyResult = { books: [], totalItems: 0 };
      cache.search.set(cacheKey, emptyResult, cacheConfig.ttl.search);
      return emptyResult;
    }
    
    // Transform Google Book items to our Book format
    const books = data.items.map(transformGoogleBookToBook);
    
    const result = { books, totalItems };
    
    // Store in cache
    cache.search.set(cacheKey, result, cacheConfig.ttl.search);
    
    // Preload images in the background
    preloadImages(books.map(book => book.image_url));
    
    return result;
  } catch (error) {
    console.error('Error fetching from Google Books API:', error);
    return { books: [], totalItems: 0 };
  }
}

/**
 * Get book details by ID
 */
export async function getBookDetails(bookId: string): Promise<Book | null> {
  try {
    // Check cache first
    const cacheKey = `gbook_details_${bookId}`;
    const cachedResult = cache.books.getWithLocalStorage<Book>(cacheKey);
    if (cachedResult) {
      console.log(`Cache hit for Google Books details: ${bookId}`);
      return cachedResult;
    }

    console.log(`Fetching book details from Google Books API: ${bookId}`);
    const url = `${API_BASE_URL}/volumes/${bookId}`;
    
    const data = await fetchWithCache<GoogleBookItem>(
      url,
      {
        signal: AbortSignal.timeout(8000), // 8 second timeout
      },
      `gb_book_${bookId}`,
      cacheConfig.ttl.books
    );
    
    if (!data || !data.volumeInfo) {
      console.error('Invalid book data returned from Google Books API');
      return null;
    }
    
    const book = transformGoogleBookToBook(data);
    
    // Store in both memory and localStorage caches
    cache.books.setWithLocalStorage(cacheKey, book, cacheConfig.ttl.books);
    
    return book;
  } catch (error) {
    console.error('Error fetching book details from Google Books:', error);
    return null;
  }
}

/**
 * Get books by category using appropriate search terms
 */
export async function getCategoryBooks(categorySlug: string, limit = 10, startIndex = 0): Promise<{ books: Book[], totalItems: number }> {
  // Map categories to effective search terms for Google Books API
  const CATEGORY_SEARCH_TERMS: Record<string, string> = {
    'african-literature': 'african literature fiction chinua achebe',
    'poetry': 'poetry poems verse anthology',
    'history': 'history biography memoir historical',
    'fiction': 'fiction novel bestseller',
    'non-fiction': 'non-fiction essays journalism',
    'self-help': 'self improvement motivation personal development',
    'business': 'business management entrepreneurship leadership',
    'health': 'health wellness fitness nutrition'
  };

  try {
    const searchTerm = CATEGORY_SEARCH_TERMS[categorySlug] || categorySlug;
    
    // Check cache first
    const cacheKey = `gbooks_category_${categorySlug}_${limit}_${startIndex}`;
    const cachedResult = cache.books.get<{ books: Book[], totalItems: number }>(cacheKey);
    
    if (cachedResult) {
      console.log(`Using cached books for category: ${categorySlug}`);
      return cachedResult;
    }
    
    console.log(`Fetching books for category: ${categorySlug} with search term: ${searchTerm}`);
    const result = await searchGoogleBooks(searchTerm, limit, startIndex);
    
    // Add specific category to all books returned
    result.books = result.books.map(book => ({
      ...book,
      categories: [...(book.categories || []), categorySlug]
    }));
    
    // Cache the result
    cache.books.set(cacheKey, result, cacheConfig.ttl.books);
    
    return result;
  } catch (error) {
    console.error(`Error fetching books for category ${categorySlug}:`, error);
    return { books: [], totalItems: 0 };
  }
}

/**
 * Get new releases (recent books)
 */
export async function getNewReleases(limit = 10): Promise<Book[]> {
  try {
    const cacheKey = `gbooks_new_releases_${limit}`;
    const cachedResult = cache.books.get<Book[]>(cacheKey);
    
    if (cachedResult) {
      return cachedResult;
    }
    
    // Use publishedDate to find recent books
    const currentYear = new Date().getFullYear();
    const query = `published:${currentYear-1}-${currentYear}`;
    const result = await searchGoogleBooks(query, limit);
    
    // Cache the result
    cache.books.set(cacheKey, result.books, cacheConfig.ttl.books);
    
    return result.books;
  } catch (error) {
    console.error('Error fetching new releases:', error);
    return [];
  }
}

/**
 * Get featured books (bestsellers or highly rated)
 */
export async function getFeaturedBooks(limit = 10): Promise<Book[]> {
  try {
    const cacheKey = `gbooks_featured_${limit}`;
    const cachedResult = cache.books.get<Book[]>(cacheKey);
    
    if (cachedResult) {
      return cachedResult;
    }
    
    // Search for bestsellers or award winners
    const query = "bestseller OR award winner";
    const result = await searchGoogleBooks(query, limit);
    
    // Mark all as featured
    const featuredBooks = result.books.map(book => ({
      ...book,
      is_featured: true
    }));
    
    // Cache the result
    cache.books.set(cacheKey, featuredBooks, cacheConfig.ttl.books);
    
    return featuredBooks;
  } catch (error) {
    console.error('Error fetching featured books:', error);
    return [];
  }
}

/**
 * Get all categories
 */
export function getCategories(): Category[] {
  return [
    {
      id: 'african-literature',
      name: 'African Literature',
      slug: 'african-literature',
      created_at: new Date().toISOString()
    },
    {
      id: 'poetry',
      name: 'Poetry',
      slug: 'poetry',
      created_at: new Date().toISOString()
    },
    {
      id: 'history',
      name: 'History',
      slug: 'history',
      created_at: new Date().toISOString()
    },
    {
      id: 'fiction',
      name: 'Fiction',
      slug: 'fiction',
      created_at: new Date().toISOString()
    },
    {
      id: 'non-fiction',
      name: 'Non-Fiction',
      slug: 'non-fiction',
      created_at: new Date().toISOString()
    },
    {
      id: 'self-help',
      name: 'Self-Help',
      slug: 'self-help',
      created_at: new Date().toISOString()
    },
    {
      id: 'business',
      name: 'Business',
      slug: 'business',
      created_at: new Date().toISOString()
    },
    {
      id: 'health',
      name: 'Health',
      slug: 'health',
      created_at: new Date().toISOString()
    }
  ];
}

/**
 * Clear all Google Books API caches
 */
export function clearGoogleBooksCache(): void {
  clearApiCache('gb_');
}

/**
 * Prefetch category data for smoother navigation
 */
export function prefetchCategories(categories: string[]): void {
  categories.forEach(category => {
    getCategoryBooks(category, 5).catch(err => 
      console.warn(`Failed to prefetch category ${category}:`, err)
    );
  });
}
