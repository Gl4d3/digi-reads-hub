
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, User, LogOut, Heart, Home, BookOpen, Package, BookMarked } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CartSlideOver from './CartSlideOver';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { getCategories } from '@/services/bookServiceFixed';
import { Category } from '@/types/supabase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getCategories();
      setCategories(data);
    };
    
    fetchCategories();
  }, []);

  useEffect(() => {
    // Close mobile menu when navigating
    setIsMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleCart = () => setIsCartOpen(!isCartOpen);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur-md">
      <div className="container flex h-14 sm:h-16 items-center px-4 sm:px-6">
        <div className="flex flex-1 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <BookMarked className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-primary animate-fade-in hidden sm:inline-block">
              DigiReads
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link to="/" className="px-3 py-2 text-sm font-medium hover:text-primary transition-colors flex items-center">
              <Home className="mr-1.5 h-4 w-4" />
              Home
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="px-3 py-2">
                  <BookOpen className="mr-1.5 h-4 w-4" />
                  Categories
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48">
                {categories.map((category) => (
                  <DropdownMenuItem key={category.id} asChild>
                    <Link to={`/category/${category.slug}`} className="w-full">
                      {category.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Link to="/bundles" className="px-3 py-2 text-sm font-medium hover:text-primary transition-colors flex items-center">
              <Package className="mr-1.5 h-4 w-4" />
              Bundles
            </Link>
          </nav>

          {/* Mobile Navigation Button */}
          <div className="flex md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMenu}
              aria-label="Toggle menu"
              className="h-9 w-9"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Search, Auth and Cart */}
          <div className="flex items-center space-x-2">
            <Link to="/search" className="p-2 hover:text-primary rounded-full" aria-label="Search">
              <Search className="h-5 w-5" />
            </Link>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full h-9 w-9 bg-muted/50"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="text-sm" asChild>
                    <Link to="/favorites" className="flex items-center">
                      <Heart className="h-4 w-4 mr-2" />
                      Favorites
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-sm" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" size="sm" asChild className="hidden sm:flex">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleCart}
              className="relative h-9 w-9"
              aria-label="Open cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && isMobile && (
        <div className="md:hidden animate-fade-in">
          <div className="flex flex-col space-y-0.5 p-3 bg-card">
            <Link 
              to="/" 
              className="flex items-center p-2 text-sm font-medium hover:text-primary hover:bg-muted rounded-md"
            >
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
            
            {categories.map((category) => (
              <Link 
                key={category.id}
                to={`/category/${category.slug}`} 
                className="flex items-center p-2 text-sm font-medium hover:text-primary hover:bg-muted rounded-md"
              >
                {category.name}
              </Link>
            ))}
            
            <Link 
              to="/bundles" 
              className="flex items-center p-2 text-sm font-medium hover:text-primary hover:bg-muted rounded-md"
            >
              <Package className="mr-2 h-4 w-4" />
              Bundles
            </Link>
            
            {!user && (
              <Link 
                to="/auth" 
                className="flex items-center p-2 text-sm font-medium hover:text-primary hover:bg-muted rounded-md mt-2"
              >
                <User className="mr-2 h-4 w-4" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Cart Slide Over */}
      <CartSlideOver isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
};

export default Navbar;
