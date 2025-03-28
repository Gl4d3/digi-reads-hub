
export type Book = {
  id: string;
  title: string;
  author: string;
  price: number;
  description?: string;
  image_url?: string;
  format: 'ebook' | 'hardcover' | 'both';
  created_at: string;
  updated_at: string;
  is_featured: boolean;
  categories?: string[]; // Add categories property to Book type
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export type BookCategory = {
  id: string;
  book_id: string;
  category_id: string;
  created_at: string;
};

export type Bundle = {
  id: string;
  name: string;
  description?: string;
  discount_percentage: number;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type BundleBook = {
  id: string;
  bundle_id: string;
  book_id: string;
  created_at: string;
};

export type Favorite = {
  id: string;
  user_id: string;
  book_id: string;
  created_at: string;
};
