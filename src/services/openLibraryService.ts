
import { Book, Category, Bundle } from '@/types/supabase';
import { cache } from '@/utils/cacheUtils';
import { cacheConfig } from '@/integrations/supabase/client';

// Default fallback image if no image is available
export const DEFAULT_BOOK_IMAGE = '/assets/digireads-placeholder.jpg';
const API_BASE_URL = 'https://openlibrary.org';

type OpenLibraryBook = {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  publisher?: string[];
  subject?: string[];
};

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
    const response = await fetch(`${API_BASE_URL}/search.json?q=${encodeURIComponent(query)}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from OpenLibrary: ${response.statusText}`);
    }
    
    const data = await response.json();
    
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
      
      // Get higher quality image when available
      const imageUrl = book.cover_i 
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` // L is for large
        : DEFAULT_BOOK_IMAGE;

      return {
        id: book.key.replace('/works/', ''),
        title: book.title,
        author: book.author_name?.[0] || 'Unknown Author',
        price: isSinglePoem ? 0 : price, // Free for single poems
        image_url: imageUrl,
        format: format,
        description: `Published ${book.first_publish_year || 'unknown year'} by ${book.publisher?.[0] || 'unknown publisher'}.`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_featured: Math.random() > 0.8, // 20% chance of being featured
      };
    });

    // Store in cache
    cache.search.set(cacheKey, books, cacheConfig.ttl.search);
    
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
    const response = await fetch(`${API_BASE_URL}/works/${bookId}.json`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch book details: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Fetch author info if available
    let authorData = null;
    if (data.authors?.[0]?.author) {
      const authorKey = data.authors[0].author.key;
      const authorResponse = await fetch(`${API_BASE_URL}${authorKey}.json`);
      if (authorResponse.ok) {
        authorData = await authorResponse.json();
      }
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
    const formats = ['ebook', 'hardcover', 'both'];
    const format = isPoetry 
      ? (Math.random() > 0.7 ? 'ebook' : formats[Math.floor(Math.random() * formats.length)]) 
      : formats[Math.floor(Math.random() * formats.length)] as 'ebook' | 'hardcover' | 'both';
    
    // Construct description with author bio if available
    let description = data.description?.value || data.description || 'No description available.';
    if (authorData?.bio) {
      const authorBio = typeof authorData.bio === 'string' 
        ? authorData.bio 
        : authorData.bio.value || '';
      
      if (authorBio) {
        description += `\n\nAbout the author: ${authorBio}`;
      }
    }
    
    // Get highest quality cover image
    let imageUrl = DEFAULT_BOOK_IMAGE;
    if (data.covers && data.covers.length > 0) {
      // Try to get the best cover
      imageUrl = `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg`;
    }
    
    const book = {
      id: bookId,
      title: data.title,
      author: authorData?.name || data.authors?.[0]?.name || 'Unknown Author',
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
    }
  ];
}
