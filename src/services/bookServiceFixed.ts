
import { supabase, fromSupabase } from '@/integrations/supabase/client';
import { Book, Category, Bundle } from '@/types/supabase';

// Default fallback image if no image is available
const DEFAULT_BOOK_IMAGE = '/assets/digireads-placeholder.jpg';

export async function getBooks(): Promise<Book[]> {
  const { data, error } = await fromSupabase.books()
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
  
  // Ensure all books have an image URL
  return data as unknown as Book[];
}

export async function getBooksByCategory(categorySlug: string): Promise<Book[]> {
  // First get the category ID
  const { data: categoryData, error: categoryError } = await fromSupabase.categories()
    .select('id')
    .eq('slug', categorySlug)
    .single();
    
  if (categoryError) {
    console.error('Error fetching category:', categoryError);
    throw categoryError;
  }

  // Then get all books in that category
  const { data: bookCategoriesData, error: bookCategoriesError } = await fromSupabase.book_categories()
    .select('book_id')
    .eq('category_id', categoryData.id);
    
  if (bookCategoriesError) {
    console.error('Error fetching book categories:', bookCategoriesError);
    throw bookCategoriesError;
  }

  const bookIds = bookCategoriesData.map(bc => bc.book_id);
  
  if (bookIds.length === 0) {
    return [];
  }

  const { data: booksData, error: booksError } = await fromSupabase.books()
    .select('*')
    .in('id', bookIds);
    
  if (booksError) {
    console.error('Error fetching books by ids:', booksError);
    throw booksError;
  }

  return booksData as unknown as Book[];
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await fromSupabase.categories()
    .select('*')
    .order('name');
    
  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
  
  return data as unknown as Category[];
}

export async function getNewReleases(limit = 4): Promise<Book[]> {
  const { data, error } = await fromSupabase.books()
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
    
  if (error) {
    console.error('Error fetching new releases:', error);
    throw error;
  }
  
  return data as unknown as Book[];
}

export async function getFeaturedBooks(limit = 4): Promise<Book[]> {
  const { data, error } = await fromSupabase.books()
    .select('*')
    .eq('is_featured', true)
    .limit(limit);
    
  if (error) {
    console.error('Error fetching featured books:', error);
    throw error;
  }
  
  return data as unknown as Book[];
}

export async function searchBooks(query: string, filters = {}): Promise<Book[]> {
  let supabaseQuery = fromSupabase.books()
    .select('*');
    
  // Apply text search if query is provided
  if (query) {
    supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,author.ilike.%${query}%`);
  }
  
  // Apply any additional filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      supabaseQuery = supabaseQuery.eq(key, value);
    }
  });
  
  const { data, error } = await supabaseQuery;
    
  if (error) {
    console.error('Error searching books:', error);
    throw error;
  }
  
  return data as unknown as Book[];
}

export async function getBundles(): Promise<Bundle[]> {
  const { data, error } = await fromSupabase.bundles()
    .select('*')
    .eq('is_active', true);
    
  if (error) {
    console.error('Error fetching bundles:', error);
    throw error;
  }
  
  return data as unknown as Bundle[];
}

export async function getBundleWithBooks(bundleId: string): Promise<{bundle: Bundle, books: Book[]}> {
  // Get the bundle
  const { data: bundleData, error: bundleError } = await fromSupabase.bundles()
    .select('*')
    .eq('id', bundleId)
    .single();
    
  if (bundleError) {
    console.error('Error fetching bundle:', bundleError);
    throw bundleError;
  }

  // Get the books in the bundle
  const { data: bundleBooksData, error: bundleBooksError } = await fromSupabase.bundle_books()
    .select('book_id')
    .eq('bundle_id', bundleId);
    
  if (bundleBooksError) {
    console.error('Error fetching bundle books:', bundleBooksError);
    throw bundleBooksError;
  }

  const bookIds = bundleBooksData.map(bb => bb.book_id);
  
  if (bookIds.length === 0) {
    return { bundle: bundleData as unknown as Bundle, books: [] };
  }

  const { data: booksData, error: booksError } = await fromSupabase.books()
    .select('*')
    .in('id', bookIds);
    
  if (booksError) {
    console.error('Error fetching books by ids:', booksError);
    throw booksError;
  }

  // Return the bundle and books
  return {
    bundle: bundleData as unknown as Bundle,
    books: booksData as unknown as Book[]
  };
}

export async function toggleFavorite(bookId: string, userId: string): Promise<void> {
  // Check if the book is already a favorite
  const { data, error: checkError } = await fromSupabase.favorites()
    .select('id')
    .eq('book_id', bookId)
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
    const { error: insertError } = await fromSupabase.favorites()
      .insert({
        book_id: bookId,
        user_id: userId
      });
      
    if (insertError) {
      console.error('Error adding favorite:', insertError);
      throw insertError;
    }
  }
}

export async function getFavorites(userId: string): Promise<Book[]> {
  // Get the favorite book IDs
  const { data: favoritesData, error: favoritesError } = await fromSupabase.favorites()
    .select('book_id')
    .eq('user_id', userId);
    
  if (favoritesError) {
    console.error('Error fetching favorites:', favoritesError);
    throw favoritesError;
  }

  const bookIds = favoritesData.map(fav => fav.book_id);
  
  if (bookIds.length === 0) {
    return [];
  }

  const { data: booksData, error: booksError } = await fromSupabase.books()
    .select('*')
    .in('id', bookIds);
    
  if (booksError) {
    console.error('Error fetching favorite books:', booksError);
    throw booksError;
  }

  return booksData as unknown as Book[];
}

export async function checkIsFavorite(bookId: string, userId: string): Promise<boolean> {
  if (!userId) return false;
  
  const { data, error } = await fromSupabase.favorites()
    .select('id')
    .eq('book_id', bookId)
    .eq('user_id', userId)
    .maybeSingle();
    
  if (error) {
    console.error('Error checking favorite status:', error);
    throw error;
  }
  
  return !!data;
}

export async function getBookById(bookId: string): Promise<Book> {
  const { data, error } = await fromSupabase.books()
    .select('*')
    .eq('id', bookId)
    .single();
    
  if (error) {
    console.error('Error fetching book:', error);
    throw error;
  }
  
  return data as unknown as Book;
}

// Helper to add user to mailing list
export async function subscribeToMailingList(email: string, firstName?: string): Promise<void> {
  const { error } = await fromSupabase.mailing_list()
    .insert({
      email,
      first_name: firstName || null
    });
    
  if (error) {
    console.error('Error subscribing to mailing list:', error);
    throw error;
  }
}
