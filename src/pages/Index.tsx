
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Banner from '@/components/Banner';
import CategorySection from '@/components/CategorySection';
import MailingListSignup from '@/components/MailingListSignup';
import { getNewReleases, getFeaturedBooks, getBooksByCategory } from '@/services/bookServiceFixed';
import { Book } from '@/types/supabase';
import { ensureDataLoaded } from '@/utils/dataUtils';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const [newReleases, setNewReleases] = useState<Book[]>([]);
  const [africanLitBooks, setAfricanLitBooks] = useState<Book[]>([]);
  const [selfHelpBooks, setSelfHelpBooks] = useState<Book[]>([]);
  const [businessBooks, setBusinessBooks] = useState<Book[]>([]);
  const [healthBooks, setHealthBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      
      try {
        // Ensure data is loaded properly
        await ensureDataLoaded();
        
        // Fetch books by category
        const [newReleasesData, africanLit, selfHelp, business, health] = await Promise.all([
          getNewReleases(5),
          getBooksByCategory('african-literature'),
          getBooksByCategory('self-help'),
          getBooksByCategory('business'),
          getBooksByCategory('health')
        ]);

        setNewReleases(newReleasesData);
        setAfricanLitBooks(africanLit.slice(0, 5));
        setSelfHelpBooks(selfHelp.slice(0, 5));
        setBusinessBooks(business.slice(0, 5));
        setHealthBooks(health.slice(0, 5));
      } catch (error) {
        console.error('Error fetching books:', error);
        toast({
          title: 'Error Loading Books',
          description: 'Could not load book data. Please try refreshing the page.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [toast]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Banner */}
        <section className="pt-4 md:pt-6 px-4 md:px-6">
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
          isLoading={isLoading}
        />
        
        {/* African Literature */}
        <CategorySection 
          title="African Literature"
          description="Explore the rich cultural tapestry of Africa through these compelling literary works."
          category="african-literature"
          books={africanLitBooks}
          className="bg-digireads-dark/50"
          isLoading={isLoading}
        />
        
        {/* Self-Help */}
        <CategorySection 
          title="Self-Help"
          description="Books to inspire personal growth and development."
          category="self-help"
          books={selfHelpBooks}
          isLoading={isLoading}
        />
        
        {/* Special Offer Banner */}
        <section className="py-6 md:py-8 px-4 md:px-6">
          <div className="container">
            <Banner 
              title="Bundle & Save"
              subtitle="Get both digital and print versions of selected titles at a special price. Perfect for those who enjoy reading in multiple formats."
              imageUrl="https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=1000&auto=format&fit=crop"
              ctaText="View Bundles"
              ctaLink="/bundles"
              className="min-h-[200px] sm:min-h-[250px]"
            />
          </div>
        </section>
        
        {/* Business */}
        <CategorySection 
          title="Business"
          description="Essential reading for entrepreneurs and business professionals in the African context."
          category="business"
          books={businessBooks}
          isLoading={isLoading}
        />
        
        {/* Health */}
        <CategorySection 
          title="Health & Wellness"
          description="Holistic approaches to health inspired by African traditions and modern science."
          category="health"
          books={healthBooks}
          className="bg-digireads-dark/50"
          isLoading={isLoading}
        />
        
        {/* Mailing List Signup */}
        <section className="py-8 md:py-12 px-4 md:px-6">
          <div className="container max-w-screen-md">
            <MailingListSignup />
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-border mt-6">
        <div className="container px-4 py-6 md:px-6 md:py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <h3 className="text-base font-semibold mb-3">DigiReads</h3>
              <p className="text-sm text-muted-foreground">
                Your premier destination for African literature, self-help, business, and health books in both digital and print formats.
              </p>
            </div>
            
            <div>
              <h3 className="text-base font-semibold mb-3">Categories</h3>
              <ul className="space-y-1.5 text-sm">
                <li><FooterLink to="/category/self-help">Self-Help</FooterLink></li>
                <li><FooterLink to="/category/african-literature">African Literature</FooterLink></li>
                <li><FooterLink to="/category/business">Business</FooterLink></li>
                <li><FooterLink to="/category/health">Health</FooterLink></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-base font-semibold mb-3">Customer Service</h3>
              <ul className="space-y-1.5 text-sm">
                <li><FooterLink to="/contact">Contact Us</FooterLink></li>
                <li><FooterLink to="/faq">FAQ</FooterLink></li>
                <li><FooterLink to="/shipping">Shipping Policy</FooterLink></li>
                <li><FooterLink to="/returns">Returns & Refunds</FooterLink></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-base font-semibold mb-3">Connect</h3>
              <ul className="space-y-1.5 text-sm">
                <li><FooterLink to="#">Twitter</FooterLink></li>
                <li><FooterLink to="#">Instagram</FooterLink></li>
                <li><FooterLink to="#">Facebook</FooterLink></li>
                <li><FooterLink to="#">Newsletter</FooterLink></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-6 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">© 2023 DigiReads. All rights reserved.</p>
            <div className="flex space-x-4 mt-3 md:mt-0 text-sm">
              <FooterLink to="/privacy">Privacy Policy</FooterLink>
              <FooterLink to="/terms">Terms of Service</FooterLink>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FooterLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <Link to={to} className="text-muted-foreground hover:text-primary transition-colors">
    {children}
  </Link>
);

export default Index;

// Helper component
const Link = ({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) => (
  <a href={to} className={className}>
    {children}
  </a>
);
