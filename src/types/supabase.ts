export type Book = {
  id: string;
  title: string;
  author: string;
  description?: string;
  price: number;
  image_url: string;
  format: 'ebook' | 'hardcover' | 'both';
  created_at: string;
  updated_at: string;
  is_featured?: boolean;
  categories?: string[];
  ratings?: number;
  ratings_count?: number;
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

export type Order = {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  total_amount: number;
  payment_intent_id?: string;
  shipping_address: ShippingAddress;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  book_id: string;
  quantity: number;
  price: number;
  created_at: string;
};

export type ShippingAddress = {
  name: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
};

export type PaymentMethod = {
  id: string;
  user_id: string;
  provider: 'stripe' | 'mpesa' | 'other';
  last_four?: string;
  expiry_date?: string;
  is_default: boolean;
  created_at: string;
};

export type BookReview = {
  id: string;
  user_id: string;
  book_id: string;
  rating: number;
  comment: string;
  created_at: string;
};

export type UserProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  updated_at: string;
};
