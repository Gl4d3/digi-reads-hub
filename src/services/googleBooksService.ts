
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
    averageRating?: number;
    ratingsCount?: number;
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
  accessInfo?: {
    webReaderLink?: string;
  };
}

// Clean and standardize description text by removing HTML tags and fixing quotes
function cleanDescription(text: string): string {
  if (!text) return '';
  
  // First replace HTML entities
  let cleanText = text
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
  
  // Remove HTML tags
  cleanText = cleanText.replace(/<[^>]*>/g, '');
  
  // Fix multiple spaces
  cleanText = cleanText.replace(/\s+/g, ' ').trim();
  
  // Replace repeated quotes
  cleanText = cleanText.replace(/""+/g, '"');
  
  return cleanText;
}

// Check if the book appears to be a proper book (not a publication, report, etc.)
function isActualBook(book: GoogleBookItem): boolean {
  // Check for common non-book identifiers in the title
  const nonBookKeywords = [
    'bulletin', 'report', 'proceedings', 'publication', 'catalog', 
    'journal', 'technical report', 'newsletter', 'press clips', 
    'vasectomy', 'soil moisture', 'resources in education'
  ];
  
  const title = book.volumeInfo.title?.toLowerCase() || '';
  
  // Filter out items with these keywords in the title
  if (nonBookKeywords.some(keyword => title.includes(keyword))) {
    return false;
  }
  
  // Require at least an author or publisher
  if (!book.volumeInfo.authors?.length && !book.volumeInfo.publisher) {
    return false;
  }
  
  // Prefer items with page counts (more likely to be actual books)
  if (book.volumeInfo.pageCount && book.volumeInfo.pageCount > 50) {
    return true;
  }
  
  // Prefer items with proper cover images
  if (book.volumeInfo.imageLinks && 
      (book.volumeInfo.imageLinks.thumbnail || book.volumeInfo.imageLinks.smallThumbnail)) {
    return true;
  }
  
  return true;
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
    
    // Ensure HTTPS for Google Book API images
    if (imageUrl.startsWith('http:')) {
      imageUrl = imageUrl.replace('http:', 'https:');
    }
    
    // For Google Books API: Replace zoom=1 with zoom=0 to get the full cover without cropping
    if (imageUrl.includes('&zoom=1')) {
      imageUrl = imageUrl.replace('&zoom=1', '&zoom=0');
    }
    
    // Remove edge=curl parameter which can cause image display issues
    if (imageUrl.includes('&edge=curl')) {
      imageUrl = imageUrl.replace('&edge=curl', '');
    }
    
    // Ensure we're using a properly sized image
    if (!imageUrl.includes('&zoom=') && !imageUrl.includes('&edge=')) {
      imageUrl = `${imageUrl}&zoom=0`;
    }
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
  
  // Create and clean description with available info
  let description = book.volumeInfo.description || '';
  if (!description && book.volumeInfo.subtitle) {
    description = book.volumeInfo.subtitle;
  }
  if (!description) {
    description = `Published by ${book.volumeInfo.publisher || 'Unknown'} ${book.volumeInfo.publishedDate ? `in ${book.volumeInfo.publishedDate.substring(0, 4)}` : ''}.`;
  }
  
  // Clean and standardize the description
  description = cleanDescription(description);
  
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
    // Add ratings data if available
    ratings: book.volumeInfo.averageRating || 0,
    ratings_count: book.volumeInfo.ratingsCount || 0
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
    
    // Include proper filtering to get only books
    const url = `${API_BASE_URL}/volumes?q=${encodeURIComponent(query)}&maxResults=${Math.min(limit * 2, 40)}&startIndex=${startIndex}&printType=books&projection=full`;
    
    // Use enhanced fetch with caching, retries, and timeout
    const data = await fetchWithCache<GoogleBooksSearchResponse>(
      url,
      {
        signal: AbortSignal.timeout(10000), // 10 second timeout
      },
      `gb_search_${query}_${limit}_${startIndex}`,
      cacheConfig.ttl.search
    );
    
    let totalItems = data.totalItems || 0;
    
    // Handle case where no results were found
    if (!data.items || data.items.length === 0) {
      const emptyResult = { books: [], totalItems: 0 };
      cache.search.set(cacheKey, emptyResult, cacheConfig.ttl.search);
      return emptyResult;
    }
    
    // Filter to only include actual books, not reports/publications
    const filteredItems = data.items.filter(isActualBook);
    
    // Transform Google Book items to our Book format
    let books = filteredItems.map(transformGoogleBookToBook);
    
    // Limit to requested number
    books = books.slice(0, limit);
    
    const result = { books, totalItems: books.length > 0 ? totalItems : 0 };
    
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
export async function getCategoryBooks(categorySlug: string, limit = 20, startIndex = 0): Promise<{ books: Book[], totalItems: number }> {
  // Map categories to effective search terms for Google Books API
  const CATEGORY_SEARCH_TERMS: Record<string, string> = {
    'african-literature': 'subject:fiction africa OR african literature -report -proceedings',
    'poetry': 'subject:poetry poems verse anthology -report -proceedings',
    'history': 'subject:history biography memoir historical -report -proceedings',
    'fiction': 'subject:fiction novel bestseller -report -proceedings',
    'non-fiction': 'subject:non-fiction essays journalism -report -proceedings',
    'self-help': 'subject:self-improvement motivation personal development -report -proceedings',
    'business': 'subject:business management entrepreneurship leadership -report -proceedings',
    'health': 'subject:health wellness fitness nutrition -report -proceedings'
  };

  try {
    const searchTerm = CATEGORY_SEARCH_TERMS[categorySlug] || `subject:${categorySlug} -report -proceedings`;
    
    // Check cache first
    const cacheKey = `gbooks_category_${categorySlug}_${limit}_${startIndex}`;
    const cachedResult = cache.books.get<{ books: Book[], totalItems: number }>(cacheKey);
    
    if (cachedResult) {
      console.log(`Using cached books for category: ${categorySlug}`);
      return cachedResult;
    }
    
    console.log(`Fetching books for category: ${categorySlug} with search term: ${searchTerm}`);
    const result = await searchGoogleBooks(searchTerm, limit * 2, startIndex);
    
    // Add specific category to all books returned
    result.books = result.books
      .filter(book => book.title && book.author !== 'Unknown Author')
      .map(book => ({
        ...book,
        categories: [...(book.categories || []), categorySlug]
      }))
      .slice(0, limit);
    
    // Sort by ratings if available
    result.books.sort((a, b) => {
      // First by rating (higher first)
      if ((b.ratings || 0) !== (a.ratings || 0)) {
        return (b.ratings || 0) - (a.ratings || 0);
      }
      // Then by number of ratings (higher first)
      return (b.ratings_count || 0) - (a.ratings_count || 0);
    });
    
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
export async function getNewReleases(limit = 20): Promise<Book[]> {
  try {
    const cacheKey = `gbooks_new_releases_${limit}`;
    const cachedResult = cache.books.get<Book[]>(cacheKey);
    
    if (cachedResult) {
      return cachedResult;
    }
    
    // Use publishedDate to find recent books
    const currentYear = new Date().getFullYear();
    const query = `published:${currentYear-1}-${currentYear} -report -proceedings -bulletin`;
    const result = await searchGoogleBooks(query, limit * 2);
    
    // Filter out non-books and sort by rating
    const books = result.books
      .filter(book => book.title && book.author !== 'Unknown Author')
      .sort((a, b) => {
        // Sort by rating (higher first)
        if ((b.ratings || 0) !== (a.ratings || 0)) {
          return (b.ratings || 0) - (a.ratings || 0);
        }
        // Then by number of ratings
        return (b.ratings_count || 0) - (a.ratings_count || 0);
      })
      .slice(0, limit);
    
    // Cache the result
    cache.books.set(cacheKey, books, cacheConfig.ttl.books);
    
    return books;
  } catch (error) {
    console.error('Error fetching new releases:', error);
    return [];
  }
}

/**
 * Get featured books (bestsellers or highly rated)
 */
export async function getFeaturedBooks(limit = 20): Promise<Book[]> {
  try {
    const cacheKey = `gbooks_featured_${limit}`;
    const cachedResult = cache.books.get<Book[]>(cacheKey);
    
    if (cachedResult) {
      return cachedResult;
    }
    
    // Search for bestsellers or award winners
    const query = "subject:bestseller OR award winner -report -proceedings -bulletin";
    const result = await searchGoogleBooks(query, limit * 2);
    
    // Filter and sort by rating
    const featuredBooks = result.books
      .filter(book => book.title && book.author !== 'Unknown Author')
      .sort((a, b) => {
        // Sort by rating (higher first)
        if ((b.ratings || 0) !== (a.ratings || 0)) {
          return (b.ratings || 0) - (a.ratings || 0);
        }
        // Then by number of ratings
        return (b.ratings_count || 0) - (a.ratings_count || 0);
      })
      .slice(0, limit)
      .map(book => ({
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
