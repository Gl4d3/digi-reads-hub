
import React from 'react';
import Navbar from '@/components/Navbar';
import Banner from '@/components/Banner';
import CategorySection from '@/components/CategorySection';
import { books } from '@/data/books';

const Index = () => {
  // Filter books by category
  const selfHelpBooks = books
    .filter(book => book.category === 'Self-Help')
    .slice(0, 4);
    
  const africanLitBooks = books
    .filter(book => book.category === 'African Literature')
    .slice(0, 4);
    
  const businessBooks = books
    .filter(book => book.category === 'Business')
    .slice(0, 4);
    
  const healthBooks = books
    .filter(book => book.category === 'Health')
    .slice(0, 4);
    
  // Get new releases
  const newReleases = books
    .filter(book => book.isNew)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Banner */}
        <section className="pt-6 md:pt-8 px-4 md:px-6">
          <div className="container">
            <Banner 
              title="Top African Poetry Collections"
              subtitle="Discover the rich tapestry of African voices through our curated selection of contemporary poetry collections."
              imageUrl="https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000&auto=format&fit=crop"
              ctaText="Explore Collection"
              ctaLink="/category/african-literature"
            />
          </div>
        </section>
        
        {/* New Releases */}
        <CategorySection 
          title="New Releases"
          description="The latest additions to our growing collection of African literature and more."
          category="new-releases"
          books={newReleases}
        />
        
        {/* African Literature */}
        <CategorySection 
          title="African Literature"
          description="Explore the rich cultural tapestry of Africa through these compelling literary works."
          category="african-literature"
          books={africanLitBooks}
          className="bg-digireads-dark/50"
        />
        
        {/* Self-Help */}
        <CategorySection 
          title="Self-Help"
          description="Books to inspire personal growth and development."
          category="self-help"
          books={selfHelpBooks}
        />
        
        {/* Special Offer Banner */}
        <section className="py-8 md:py-12 px-4 md:px-6">
          <div className="container">
            <Banner 
              title="Bundle & Save"
              subtitle="Get both digital and print versions of selected titles at a special price. Perfect for those who enjoy reading in multiple formats."
              imageUrl="https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=1000&auto=format&fit=crop"
              ctaText="View Bundles"
              ctaLink="/bundles"
              className="min-h-[250px]"
            />
          </div>
        </section>
        
        {/* Business */}
        <CategorySection 
          title="Business"
          description="Essential reading for entrepreneurs and business professionals in the African context."
          category="business"
          books={businessBooks}
        />
        
        {/* Health */}
        <CategorySection 
          title="Health & Wellness"
          description="Holistic approaches to health inspired by African traditions and modern science."
          category="health"
          books={healthBooks}
          className="bg-digireads-dark/50"
        />
      </main>
      
      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="container px-4 py-8 md:px-6 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">DigiReads</h3>
              <p className="text-muted-foreground">
                Your premier destination for African literature, self-help, business, and health books in both digital and print formats.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Categories</h3>
              <ul className="space-y-2">
                <li><a href="/category/self-help" className="text-muted-foreground hover:text-primary">Self-Help</a></li>
                <li><a href="/category/african-literature" className="text-muted-foreground hover:text-primary">African Literature</a></li>
                <li><a href="/category/business" className="text-muted-foreground hover:text-primary">Business</a></li>
                <li><a href="/category/health" className="text-muted-foreground hover:text-primary">Health</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
              <ul className="space-y-2">
                <li><a href="/contact" className="text-muted-foreground hover:text-primary">Contact Us</a></li>
                <li><a href="/faq" className="text-muted-foreground hover:text-primary">FAQ</a></li>
                <li><a href="/shipping" className="text-muted-foreground hover:text-primary">Shipping Policy</a></li>
                <li><a href="/returns" className="text-muted-foreground hover:text-primary">Returns & Refunds</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary">Twitter</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Instagram</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Facebook</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Newsletter</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">© 2023 DigiReads. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="/privacy" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</a>
              <a href="/terms" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
