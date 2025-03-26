
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { corsHeaders } from '../_shared/cors.ts';

const PLACEHOLDER_BOOKS = [
  {
    title: "Things Fall Apart",
    author: "Chinua Achebe",
    price: 1599,
    description: "A classic of African literature, this novel chronicles the life of Okonkwo, a leader and wrestling champion in a fictional Nigerian village.",
    image_url: "https://m.media-amazon.com/images/I/71UItA-wOFL._AC_UF1000,1000_QL80_.jpg",
    format: "both",
    is_featured: true,
    categories: ["african-literature"]
  },
  {
    title: "Born a Crime",
    author: "Trevor Noah",
    price: 1899,
    description: "Trevor Noah's unlikely path from apartheid South Africa to the desk of The Daily Show began with a criminal act: his birth.",
    image_url: "https://m.media-amazon.com/images/I/81iqH8dpjuL._AC_UF1000,1000_QL80_.jpg",
    format: "both",
    is_featured: true,
    categories: ["self-help"]
  },
  {
    title: "Americanah",
    author: "Chimamanda Ngozi Adichie",
    price: 1699,
    description: "A powerful, tender story of race and identity following Ifemelu and Obinze, who fall in love as teenagers in a Lagos secondary school.",
    image_url: "https://m.media-amazon.com/images/I/91sMRsFQ84L._AC_UF1000,1000_QL80_.jpg",
    format: "ebook",
    is_featured: false,
    categories: ["african-literature"]
  },
  {
    title: "Half of a Yellow Sun",
    author: "Chimamanda Ngozi Adichie",
    price: 1599,
    description: "A masterful story of love and war set during the Nigerian Civil War of the late 1960s.",
    image_url: "https://m.media-amazon.com/images/I/81bqZkO2RZL._AC_UF1000,1000_QL80_.jpg",
    format: "hardcover",
    is_featured: true,
    categories: ["african-literature"]
  },
  {
    title: "Long Walk to Freedom",
    author: "Nelson Mandela",
    price: 2099,
    description: "The autobiography of one of the great moral and political leaders of our time.",
    image_url: "https://m.media-amazon.com/images/I/71SsXyDhJCL._AC_UF1000,1000_QL80_.jpg",
    format: "both",
    is_featured: true,
    categories: ["self-help"]
  },
  {
    title: "Africa's Business Revolution",
    author: "Acha Leke, Mutsa Chironga, Georges Desvaux",
    price: 2499,
    description: "Strategic insights for entrepreneurs and investors into the economic potential of Africa.",
    image_url: "https://m.media-amazon.com/images/I/91O9S6CVEYL._AC_UF1000,1000_QL80_.jpg",
    format: "both",
    is_featured: false,
    categories: ["business"]
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    price: 1799,
    description: "An easy and proven way to build good habits and break bad ones.",
    image_url: "https://m.media-amazon.com/images/I/81wgcld4wxL._AC_UF1000,1000_QL80_.jpg",
    format: "ebook",
    is_featured: false,
    categories: ["self-help"]
  },
  {
    title: "Eat, Live, Thrive Diet",
    author: "Danna Demetre & Robyn Thomson",
    price: 1599,
    description: "A holistic approach to health and wellness with a focus on African dietary traditions.",
    image_url: "https://m.media-amazon.com/images/I/71mIcMRQdvL._AC_UF1000,1000_QL80_.jpg",
    format: "hardcover",
    is_featured: false,
    categories: ["health"]
  },
  {
    title: "Traditional Medicine in Africa",
    author: "Kofi Appiah-Kubi",
    price: 1999,
    description: "An exploration of traditional African healing practices and their modern applications.",
    image_url: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?q=80&w=500&auto=format&fit=crop",
    format: "ebook",
    is_featured: false,
    categories: ["health"]
  },
  {
    title: "African Economic Development",
    author: "Emmanuel Nnadozie",
    price: 2499,
    description: "A comprehensive analysis of economic development strategies for African nations.",
    image_url: "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?q=80&w=500&auto=format&fit=crop",
    format: "both",
    is_featured: false,
    categories: ["business"]
  },
  {
    title: "Mindset: The New Psychology of Success",
    author: "Carol S. Dweck",
    price: 1599,
    description: "How we can learn to fulfill our potential by changing our mindset.",
    image_url: "https://m.media-amazon.com/images/I/61bDwfLudLL._AC_UF1000,1000_QL80_.jpg",
    format: "both",
    is_featured: false,
    categories: ["self-help"]
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    price: 1399,
    description: "A fable about following your dream, widely read across Africa.",
    image_url: "https://m.media-amazon.com/images/I/51Z0nLAfLmL.jpg",
    format: "both",
    is_featured: false,
    categories: ["self-help"]
  },
  {
    title: "The Lean Startup",
    author: "Eric Ries",
    price: 1899,
    description: "How today's entrepreneurs use continuous innovation to create radically successful businesses.",
    image_url: "https://m.media-amazon.com/images/I/81-QB7nDh4L._AC_UF1000,1000_QL80_.jpg",
    format: "ebook",
    is_featured: false,
    categories: ["business"]
  },
  {
    title: "The Modern Health Handbook",
    author: "Dr. Elizabeth Mwangi",
    price: 1799,
    description: "A comprehensive guide to health and wellness with a focus on African communities.",
    image_url: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=500&auto=format&fit=crop",
    format: "hardcover",
    is_featured: false,
    categories: ["health"]
  },
  {
    title: "Homegoing",
    author: "Yaa Gyasi",
    price: 1599,
    description: "A novel of breathtaking sweep and emotional power that traces three hundred years in Ghana.",
    image_url: "https://m.media-amazon.com/images/I/A1VC4vhWEXL._AC_UF1000,1000_QL80_.jpg",
    format: "both",
    is_featured: true,
    categories: ["african-literature"]
  },
  {
    title: "Purple Hibiscus",
    author: "Chimamanda Ngozi Adichie",
    price: 1499,
    description: "A haunting tale of an adolescent's first stirrings of independence, set in Nigeria.",
    image_url: "https://m.media-amazon.com/images/I/71iEv9F3NFL._AC_UF1000,1000_QL80_.jpg",
    format: "ebook",
    is_featured: false,
    categories: ["african-literature"]
  }
];

const SAMPLE_BUNDLES = [
  {
    name: "African Literature Collection",
    description: "Discover the rich tapestry of African storytelling with this essential collection of contemporary classics.",
    discount_percentage: 25,
    image_url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=500&auto=format&fit=crop",
    is_active: true,
    books: ["Things Fall Apart", "Americanah", "Half of a Yellow Sun", "Homegoing", "Purple Hibiscus"]
  },
  {
    name: "Personal Growth Bundle",
    description: "Transform your mindset and habits with this curated selection of life-changing self-help books.",
    discount_percentage: 20,
    image_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=500&auto=format&fit=crop",
    is_active: true,
    books: ["Born a Crime", "Long Walk to Freedom", "Atomic Habits", "Mindset: The New Psychology of Success", "The Alchemist"]
  },
  {
    name: "Business & Economics Pack",
    description: "Gain insights into African markets and entrepreneurship with these essential business titles.",
    discount_percentage: 15,
    image_url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=500&auto=format&fit=crop",
    is_active: true,
    books: ["Africa's Business Revolution", "African Economic Development", "The Lean Startup"]
  },
  {
    name: "Health & Wellness Collection",
    description: "Improve your health with traditional and modern approaches to wellness from an African perspective.",
    discount_percentage: 20,
    image_url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=500&auto=format&fit=crop",
    is_active: true,
    books: ["Eat, Live, Thrive Diet", "Traditional Medicine in Africa", "The Modern Health Handbook"]
  }
];

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // First, check if books already exist
    const { data: existingBooks, error: booksError } = await supabaseClient
      .from('books')
      .select('id')
      .limit(1);

    if (booksError) {
      throw booksError;
    }

    // If books exist, don't repopulate
    if (existingBooks && existingBooks.length > 0) {
      return new Response(
        JSON.stringify({ message: 'Books already exist. No action taken.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get categories
    const { data: categories, error: categoriesError } = await supabaseClient
      .from('categories')
      .select('id, slug');

    if (categoriesError) {
      throw categoriesError;
    }

    // Create category mapping
    const categoryMap = new Map();
    categories.forEach((category: any) => {
      categoryMap.set(category.slug, category.id);
    });

    // Insert books
    const { data: booksData, error: insertBooksError } = await supabaseClient
      .from('books')
      .insert(PLACEHOLDER_BOOKS.map(book => ({
        title: book.title,
        author: book.author,
        price: book.price,
        description: book.description,
        image_url: book.image_url,
        format: book.format,
        is_featured: book.is_featured
      })))
      .select();

    if (insertBooksError) {
      throw insertBooksError;
    }

    // Create mapping of book titles to IDs
    const bookIdMap = new Map();
    booksData.forEach((book: any) => {
      bookIdMap.set(book.title, book.id);
    });

    // Insert book-category relationships
    const bookCategoryRecords = [];
    PLACEHOLDER_BOOKS.forEach((book, index) => {
      const bookId = booksData[index].id;
      book.categories.forEach(categorySlug => {
        const categoryId = categoryMap.get(categorySlug);
        if (categoryId) {
          bookCategoryRecords.push({
            book_id: bookId,
            category_id: categoryId
          });
        }
      });
    });

    const { error: bookCategoryError } = await supabaseClient
      .from('book_categories')
      .insert(bookCategoryRecords);

    if (bookCategoryError) {
      throw bookCategoryError;
    }

    // Create bundles
    const { data: bundlesData, error: bundlesError } = await supabaseClient
      .from('bundles')
      .insert(SAMPLE_BUNDLES.map(bundle => ({
        name: bundle.name,
        description: bundle.description,
        discount_percentage: bundle.discount_percentage,
        image_url: bundle.image_url,
        is_active: bundle.is_active
      })))
      .select();

    if (bundlesError) {
      throw bundlesError;
    }

    // Insert bundle-book relationships
    const bundleBookRecords = [];
    SAMPLE_BUNDLES.forEach((bundle, index) => {
      const bundleId = bundlesData[index].id;
      bundle.books.forEach(bookTitle => {
        const bookId = bookIdMap.get(bookTitle);
        if (bookId) {
          bundleBookRecords.push({
            bundle_id: bundleId,
            book_id: bookId
          });
        }
      });
    });

    const { error: bundleBookError } = await supabaseClient
      .from('bundle_books')
      .insert(bundleBookRecords);

    if (bundleBookError) {
      throw bundleBookError;
    }

    return new Response(
      JSON.stringify({ 
        message: 'Database populated successfully',
        books: booksData.length,
        bookCategories: bookCategoryRecords.length,
        bundles: bundlesData.length,
        bundleBooks: bundleBookRecords.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
