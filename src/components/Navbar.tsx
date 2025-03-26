
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, User, LogOut, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CartSlideOver from './CartSlideOver';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleCart = () => setIsCartOpen(!isCartOpen);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center px-4 sm:px-6">
        <div className="flex flex-1 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary animate-fade-in">
              DigiReads
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className={cn(
            "hidden md:flex items-center space-x-6",
            isMenuOpen && isMobile ? "flex flex-col items-start absolute top-16 left-0 right-0 bg-background border-b border-border p-4 space-y-4" : ""
          )}>
            <Link to="/category/self-help" className="text-sm font-medium hover:text-primary transition-colors">
              Self-Help
            </Link>
            <Link to="/category/african-literature" className="text-sm font-medium hover:text-primary transition-colors">
              African Literature
            </Link>
            <Link to="/category/business" className="text-sm font-medium hover:text-primary transition-colors">
              Business
            </Link>
            <Link to="/category/health" className="text-sm font-medium hover:text-primary transition-colors">
              Health
            </Link>
            <Link to="/bundles" className="text-sm font-medium hover:text-primary transition-colors">
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
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Search, Auth and Cart */}
          <div className="flex items-center space-x-4">
            <Link to="/search" className="p-2 hover:text-primary" aria-label="Search">
              <Search className="h-5 w-5" />
            </Link>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full bg-muted/80"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="text-sm" asChild>
                    <Link to="/favorites">
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
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleCart}
              className="relative"
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
          <div className="flex flex-col space-y-4 px-4 py-6 bg-muted/50">
            <Link 
              to="/category/self-help" 
              className="flex items-center p-2 text-sm font-medium hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Self-Help
            </Link>
            <Link 
              to="/category/african-literature" 
              className="flex items-center p-2 text-sm font-medium hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              African Literature
            </Link>
            <Link 
              to="/category/business" 
              className="flex items-center p-2 text-sm font-medium hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Business
            </Link>
            <Link 
              to="/category/health" 
              className="flex items-center p-2 text-sm font-medium hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Health
            </Link>
            <Link 
              to="/bundles" 
              className="flex items-center p-2 text-sm font-medium hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Bundles
            </Link>
          </div>
        </div>
      )}

      {/* Cart Slide Over */}
      <CartSlideOver isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
};

export default Navbar;
