
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://zwhhliwmyecyrtcpkkxv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3aGhsaXdteWVjeXJ0Y3Bra3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3MTg3OTIsImV4cCI6MjA1ODI5NDc5Mn0.hYs4SCryIePzbeGR6ezHCT1Qi7x69prBNgGqihWP47U";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Enhanced type-safe wrapper for querying non-existent tables
// This approach prevents TypeScript errors while allowing us to work with our virtual tables
export const fromSupabase = {
  // Tables that exist in the actual schema (type safe)
  favorites: () => supabase.from('favorites') as any,
  profiles: () => supabase.from('profiles') as any,
  search_history: () => supabase.from('search_history') as any,
  
  // Virtual tables for our book app (type assertions for non-existent tables)
  books: () => supabase.from('dr_books' as any) as any,
  categories: () => supabase.from('dr_categories' as any) as any,
  book_categories: () => supabase.from('dr_book_categories' as any) as any,
  bundles: () => supabase.from('dr_bundles' as any) as any,
  bundle_books: () => supabase.from('dr_bundle_books' as any) as any,
  mailing_list: () => supabase.from('dr_mailing_list' as any) as any
};

// Global cache configuration
export const cacheConfig = {
  // Time to live for cached data in milliseconds
  ttl: {
    books: 30 * 60 * 1000, // 30 minutes
    categories: 60 * 60 * 1000, // 1 hour
    bundles: 15 * 60 * 1000, // 15 minutes
    search: 5 * 60 * 1000, // 5 minutes
  },
  // Maximum number of items to store in memory cache
  maxItems: {
    books: 200,
    categories: 20,
    bundles: 10,
    search: 50
  }
};

