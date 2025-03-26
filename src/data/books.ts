
export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  imageUrl: string;
  category: string;
  format: 'ebook' | 'hardcover' | 'both';
  isNew?: boolean;
  description?: string;
}

export const books: Book[] = [
  // African Literature
  {
    id: '1',
    title: 'Things Fall Apart',
    author: 'Chinua Achebe',
    price: 1299,
    imageUrl: 'https://m.media-amazon.com/images/I/71UItA-wOFL._AC_UF1000,1000_QL80_.jpg',
    category: 'African Literature',
    format: 'both',
    isNew: false,
    description: 'A classic of modern African literature, this novel chronicles the colonization of Igbo society.'
  },
  {
    id: '2',
    title: 'Americanah',
    author: 'Chimamanda Ngozi Adichie',
    price: 1899,
    imageUrl: 'https://m.media-amazon.com/images/I/91sMRsFQ84L._AC_UF1000,1000_QL80_.jpg',
    category: 'African Literature',
    format: 'both',
    isNew: true,
    description: 'A powerful, tender story of race and identity that spans three continents and numerous lives.'
  },
  {
    id: '3',
    title: 'Half of a Yellow Sun',
    author: 'Chimamanda Ngozi Adichie',
    price: 1699,
    imageUrl: 'https://m.media-amazon.com/images/I/61irQqsB44L._AC_UF1000,1000_QL80_.jpg',
    category: 'African Literature',
    format: 'ebook',
    isNew: false,
    description: 'With effortless grace, Chimamanda Ngozi Adichie illuminates a seminal moment in modern African history: Biafra\'s impassioned struggle to establish an independent republic in southeastern Nigeria during the late 1960s.'
  },
  {
    id: '4',
    title: 'The Caine Prize for African Writing 2023',
    author: 'Various Authors',
    price: 1499,
    imageUrl: 'https://m.media-amazon.com/images/I/51aPoQmewrL._SX326_BO1,204,203,200_.jpg',
    category: 'African Literature',
    format: 'both',
    isNew: true,
    description: 'The leading African literary award, known as the African Booker, named after the Booker Prize founder, Michael Caine.'
  },
  
  // Self-Help
  {
    id: '5',
    title: 'The African Dream',
    author: 'Sangu Delle',
    price: 1599,
    imageUrl: 'https://m.media-amazon.com/images/I/81fQo3xAO7L._AC_UF1000,1000_QL80_.jpg',
    category: 'Self-Help',
    format: 'ebook',
    isNew: true,
    description: 'Boldly explores pathways to success specifically designed for Africans facing unique challenges in today\'s global economy.'
  },
  {
    id: '6',
    title: 'Mind Platter',
    author: 'Najwa Zebian',
    price: 1299,
    imageUrl: 'https://m.media-amazon.com/images/I/61XlG2DjTkL._SY466_.jpg',
    category: 'Self-Help',
    format: 'both',
    isNew: false,
    description: 'Mind Platter is a compilation of reflections on life as seen through the eyes of an educator, student, and human who experienced her early days in silence.'
  },
  {
    id: '7',
    title: 'The Subtle Art of Not Giving a F*ck',
    author: 'Mark Manson',
    price: 1499,
    imageUrl: 'https://m.media-amazon.com/images/I/71QKQ9mwV7L._AC_UF1000,1000_QL80_.jpg',
    category: 'Self-Help',
    format: 'ebook',
    isNew: false,
    description: 'A generation-defining self-help guide, a superstar blogger cuts through the crap to show us how to stop trying to be "positive" all the time so that we can truly become better, happier people.'
  },
  {
    id: '8',
    title: 'Atomic Habits',
    author: 'James Clear',
    price: 1799,
    imageUrl: 'https://m.media-amazon.com/images/I/51-nXsSRfZL._SX328_BO1,204,203,200_.jpg',
    category: 'Self-Help',
    format: 'both',
    isNew: false,
    description: 'No matter your goals, Atomic Habits offers a proven framework for improving every day.'
  },
  
  // Business
  {
    id: '9',
    title: 'Africa\'s Business Revolution',
    author: 'Acha Leke, Mutsa Chironga, Georges Desvaux',
    price: 2499,
    imageUrl: 'https://m.media-amazon.com/images/I/71zPGAyppuL._AC_UF1000,1000_QL80_.jpg',
    category: 'Business',
    format: 'hardcover',
    isNew: true,
    description: 'The definitive guide to running and growing a successful business across Africa, drawing from interviews with some of the continent\'s most powerful executives.'
  },
  {
    id: '10',
    title: 'The Prosperity Paradox',
    author: 'Clayton M. Christensen',
    price: 1899,
    imageUrl: 'https://m.media-amazon.com/images/I/61RCjXAoMOL._AC_UF1000,1000_QL80_.jpg',
    category: 'Business',
    format: 'ebook',
    isNew: false,
    description: 'Clay Christensen shows how innovation can lift nations from poverty while revealing how a focus on traditional development actually makes poor countries worse off.'
  },
  {
    id: '11',
    title: 'Made in Africa',
    author: 'Carol Pineau',
    price: 1699,
    imageUrl: 'https://m.media-amazon.com/images/I/61ESTyO2r-L._SY466_.jpg',
    category: 'Business',
    format: 'both',
    isNew: true,
    description: 'A fresh perspective on African business and entrepreneurship, showcasing success stories that challenge stereotypes.'
  },
  {
    id: '12',
    title: 'The Entrepreneurial State',
    author: 'Mariana Mazzucato',
    price: 1899,
    imageUrl: 'https://m.media-amazon.com/images/I/616jxKDdryL._AC_UF1000,1000_QL80_.jpg',
    category: 'Business',
    format: 'hardcover',
    isNew: false,
    description: 'Debunks the myth of a dynamic private sector versus a sluggish public sector.'
  },
  
  // Health
  {
    id: '13',
    title: 'The African Cookbook',
    author: 'Portia Mbau',
    price: 1999,
    imageUrl: 'https://m.media-amazon.com/images/I/61B+j4g1e+L._AC_UF1000,1000_QL80_.jpg',
    category: 'Health',
    format: 'both',
    isNew: true,
    description: 'Experience the authentic flavors of Africa with over 100 traditional recipes for optimal health and wellness.'
  },
  {
    id: '14',
    title: 'Traditional Remedies of Africa',
    author: 'Kofi Busia',
    price: 1499,
    imageUrl: 'https://m.media-amazon.com/images/I/61YfUrMxJzL._AC_UF1000,1000_QL80_.jpg',
    category: 'Health',
    format: 'ebook',
    isNew: false,
    description: 'A comprehensive guide to traditional African healing practices and herbal medicines.'
  },
  {
    id: '15',
    title: 'Yoga for Africans',
    author: 'Faith Hunter',
    price: 1399,
    imageUrl: 'https://m.media-amazon.com/images/I/611yfR9GpPL._SX338_BO1,204,203,200_.jpg',
    category: 'Health',
    format: 'both',
    isNew: false,
    description: 'Tailored yoga practices and mindfulness techniques adapted for African contexts and body types.'
  },
  {
    id: '16',
    title: 'African Holistic Health',
    author: 'Llaila Afrika',
    price: 2199,
    imageUrl: 'https://m.media-amazon.com/images/I/51iuCOiCNYL._AC_UF1000,1000_QL80_.jpg',
    category: 'Health',
    format: 'hardcover',
    isNew: true,
    description: 'A comprehensive guide to traditional African approaches to health, wellness, and healing.'
  }
];
