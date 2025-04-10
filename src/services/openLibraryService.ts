
import { Book, Category, Bundle } from '@/types/supabase';
import { cache } from '@/utils/cacheUtils';
import { cacheConfig } from '@/integrations/supabase/client';
import { fetchWithCache, clearApiCache } from '@/utils/apiUtils';
import { preloadImages, getOptimizedImageUrl } from '@/utils/imageUtils';

// Default fallback image if no image is available
export const DEFAULT_BOOK_IMAGE = '/assets/digireads-placeholder.jpg';
const API_BASE_URL = 'https://openlibrary.org';

// Category search terms mapping for more consistent results
const CATEGORY_SEARCH_TERMS = {
  'self-help': 'self improvement motivation',
  'african-literature': 'african fiction chinua achebe',
  'business': 'business entrepreneurship marketing',
  'health': 'health wellness fitness nutrition',
  'poetry': 'poetry poems verse',
  'history': 'history biography memoir',
  'fiction': 'fiction novel bestseller',
  'non-fiction': 'non-fiction essays journalism',
};

// Define OpenLibrary response types for type safety
interface OpenLibrarySearchResponse {
  docs: OpenLibraryBook[];
  numFound: number;
  start: number;
}

type OpenLibraryBook = {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  publisher?: string[];
  subject?: string[];
};

interface OpenLibraryBookDetails {
  key: string;
  title: string;
  authors?: { author: { key: string } }[];
  covers?: number[];
  description?: string | { value: string };
  subjects?: string[];
}

interface OpenLibraryAuthor {
  key: string;
  name: string;
  bio?: string | { value: string };
}

export async function searchOpenLibrary(query: string, limit = 30): Promise<Book[]> {
  try {
    // Check cache first
    const cacheKey = `search_${query}_${limit}`;
    const cachedResult = cache.search.get<Book[]>(cacheKey);
    if (cachedResult) {
      console.log(`Cache hit for search: ${query}`);
      return cachedResult;
    }

    console.log(`Fetching books from OpenLibrary for query: ${query}`);
    
    // Use enhanced fetch with caching and retries
    const data = await fetchWithCache<OpenLibrarySearchResponse>(
      `${API_BASE_URL}/search.json?q=${encodeURIComponent(query)}&limit=${limit}`,
      {},
      `ol_search_${query}_${limit}`,
      cacheConfig.ttl.search
    );
    
    // Transform OpenLibrary books to our Book format
    const books = data.docs.map((book: OpenLibraryBook) => {
      // Generate a random price between 700 and 1200 KES (for regular books)
      // or between 300 and 500 KES (for poetry collections)
      const isPoetry = book.subject?.some(s => 
        s.toLowerCase().includes('poetry') || 
        s.toLowerCase().includes('poem')
      ) || false;
      
      const minPrice = isPoetry ? 30000 : 70000; // In cents (300 or 700 KES)
      const maxPrice = isPoetry ? 50000 : 120000; // In cents (500 or 1200 KES)
      const price = Math.floor(Math.random() * (maxPrice - minPrice + 1)) + minPrice;
      
      // Random format assignment
      const formats = ['ebook', 'hardcover', 'both'] as const;
      const format = formats[Math.floor(Math.random() * formats.length)];
      
      // Check if it's a single poem (which would be free)
      const isSinglePoem = isPoetry && 
        (book.title.toLowerCase().includes('poem') && !book.title.toLowerCase().includes('poems') || 
         book.title.toLowerCase().includes('poetry') && book.title.length < 30);
      
      // Get higher quality image when available and optimize it
      const imageUrl = book.cover_i 
        ? getOptimizedImageUrl(`https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`) // L is for large
        : DEFAULT_BOOK_IMAGE;

      const categoryAssignments: string[] = [];
      
      // Assign categories based on subjects and title
      if (book.subject) {
        const subjectText = book.subject.join(' ').toLowerCase();
        if (subjectText.includes('africa') || (book.title && book.title.toLowerCase().includes('africa'))) {
          categoryAssignments.push('african-literature');
        }
        if (subjectText.includes('business') || subjectText.includes('marketing') || subjectText.includes('economics')) {
          categoryAssignments.push('business');
        }
        if (subjectText.includes('health') || subjectText.includes('wellness') || subjectText.includes('fitness')) {
          categoryAssignments.push('health');
        }
        if (subjectText.includes('self') || subjectText.includes('help') || subjectText.includes('improvement')) {
          categoryAssignments.push('self-help');
        }
        if (subjectText.includes('poet') || subjectText.includes('poem')) {
          categoryAssignments.push('poetry');
        }
        if (subjectText.includes('history') || subjectText.includes('historical')) {
          categoryAssignments.push('history');
        }
      }
      
      // If no categories were assigned, pick a random one
      if (categoryAssignments.length === 0) {
        const allCategories = ['fiction', 'non-fiction', 'african-literature', 'business', 'health', 'self-help'];
        categoryAssignments.push(allCategories[Math.floor(Math.random() * allCategories.length)]);
      }

      // Make sure the format is one of the allowed values
      const formatValue = format as 'ebook' | 'hardcover' | 'both';

      return {
        id: book.key.replace('/works/', ''),
        title: book.title,
        author: book.author_name?.[0] || 'Unknown Author',
        price: isSinglePoem ? 0 : price, // Free for single poems
        image_url: imageUrl,
        format: formatValue,
        description: `Published ${book.first_publish_year || 'unknown year'} by ${book.publisher?.[0] || 'unknown publisher'}.`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_featured: Math.random() > 0.8, // 20% chance of being featured
        categories: categoryAssignments, // Add categories for better filtering
      };
    });

    // Store in cache
    cache.search.set(cacheKey, books, cacheConfig.ttl.search);
    
    // Preload images in the background
    preloadImages(books.map(book => book.image_url));
    
    return books;
  } catch (error) {
    console.error('Error fetching from OpenLibrary:', error);
    return [];
  }
}

export async function getBookDetails(bookId: string): Promise<Book | null> {
  try {
    // Check cache first
    const cacheKey = `book_details_${bookId}`;
    const cachedResult = cache.books.getWithLocalStorage<Book>(cacheKey);
    if (cachedResult) {
      console.log(`Cache hit for book details: ${bookId}`);
      return cachedResult;
    }

    console.log(`Fetching book details from OpenLibrary: ${bookId}`);
    const data = await fetchWithCache<OpenLibraryBookDetails>(
      `${API_BASE_URL}/works/${bookId}.json`,
      {},
      `ol_book_${bookId}`,
      cacheConfig.ttl.books
    );
    
    // Fetch author info if available
    let authorData: OpenLibraryAuthor | null = null;
    if (data.authors?.[0]?.author?.key) {
      const authorKey = data.authors[0].author.key;
      authorData = await fetchWithCache<OpenLibraryAuthor>(
        `${API_BASE_URL}${authorKey}.json`,
        {},
        `ol_author_${authorKey.split('/').pop()}`,
        cacheConfig.ttl.books
      );
    }
    
    // Determine if it's poetry
    const isPoetry = data.subjects?.some((s: string) => 
      s.toLowerCase().includes('poetry') || 
      s.toLowerCase().includes('poem')
    ) || false;
    
    // Determine if it's a single poem
    const isSinglePoem = isPoetry && 
      (data.title.toLowerCase().includes('poem') && !data.title.toLowerCase().includes('poems') || 
       data.title.toLowerCase().includes('poetry') && data.title.length < 30);
    
    // Price calculation
    const minPrice = isPoetry ? 30000 : 70000; // In cents (300 or 700 KES)
    const maxPrice = isPoetry ? 50000 : 120000; // In cents (500 or 1200 KES)
    const price = isSinglePoem ? 0 : (Math.floor(Math.random() * (maxPrice - minPrice + 1)) + minPrice);
    
    // Random format assignment (weighted towards ebooks for poetry)
    const formats = ['ebook', 'hardcover', 'both'] as const;
    const format = isPoetry 
      ? (Math.random() > 0.7 ? 'ebook' : formats[Math.floor(Math.random() * formats.length)]) 
      : formats[Math.floor(Math.random() * formats.length)];
    
    // Construct description with author bio if available
    let description = '';
    if (typeof data.description === 'string') {
      description = data.description;
    } else if (data.description?.value) {
      description = data.description.value;
    } else {
      description = 'No description available.';
    }
    
    if (authorData?.bio) {
      const authorBio = typeof authorData.bio === 'string' 
        ? authorData.bio 
        : authorData.bio.value || '';
      
      if (authorBio) {
        description += `\n\nAbout the author: ${authorBio}`;
      }
    }
    
    // Get highest quality cover image and optimize it
    let imageUrl = DEFAULT_BOOK_IMAGE;
    if (data.covers && data.covers.length > 0) {
      // Try to get the best cover
      imageUrl = getOptimizedImageUrl(`https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg`);
    }
    
    const book: Book = {
      id: bookId,
      title: data.title,
      author: authorData?.name || (data.authors?.[0]?.author?.key ? 'Unknown Author' : 'Unknown Author'),
      price: price,
      image_url: imageUrl,
      format: format,
      description: description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_featured: Math.random() > 0.8, // 20% chance of being featured
    };

    // Store in both memory and localStorage caches
    cache.books.setWithLocalStorage(cacheKey, book, cacheConfig.ttl.books);
    
    // Preload the book image
    preloadImages([imageUrl]);
    
    return book;
  } catch (error) {
    console.error('Error fetching book details:', error);
    return null;
  }
}

export function generateBundles(): Bundle[] {
  // Create three bundle types: weekly, daily, and special time-limited
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
}

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
 * Helper function to get books for a specific category with improved caching and prefetching
 */
export async function getCategoryBooks(categorySlug: string, limit = 10): Promise<Book[]> {
  try {
    // Use the mapping to get better search terms for this category
    const searchTerm = CATEGORY_SEARCH_TERMS[categorySlug as keyof typeof CATEGORY_SEARCH_TERMS] || categorySlug;
    
    // Check cache first
    const cacheKey = `category_books_${categorySlug}_${limit}`;
    const cachedBooks = cache.books.get<Book[]>(cacheKey);
    
    if (cachedBooks) {
      console.log(`Using cached books for category: ${categorySlug}`);
      // Preload images in the background even for cached results
      preloadImages(cachedBooks.map(book => book.image_url));
      return cachedBooks;
    }
    
    console.log(`Fetching books for category: ${categorySlug} with search term: ${searchTerm}`);
    const books = await searchOpenLibrary(searchTerm, limit);
    
    // Filter to only include books that match this category
    // but if none match (which shouldn't happen with our improved categorization),
    // return all books from the search
    const categoryBooks = books.filter(book => 
      book.categories && book.categories.includes(categorySlug)
    );
    
    const finalBooks = categoryBooks.length > 0 ? categoryBooks : books;
    
    // Cache the result
    cache.books.set(cacheKey, finalBooks, cacheConfig.ttl.books);
    
    return finalBooks;
  } catch (error) {
    console.error(`Error fetching books for category ${categorySlug}:`, error);
    return [];
  }
}

/**
 * Clear all OpenLibrary caches
 */
export function clearOpenLibraryCache(): void {
  clearApiCache('ol_');
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
