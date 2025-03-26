
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Book } from '@/types/supabase';
import { useToast } from '@/components/ui/use-toast';

export type CartItem = {
  book: Book;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (book: Book) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  removeItem: (bookId: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper to calculate the total number of items in cart
const calculateTotalItems = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + item.quantity, 0);
};

// Helper to calculate the subtotal in cents
const calculateSubtotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + (item.book.price * item.quantity), 0);
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const { toast } = useToast();

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
        setTotalItems(calculateTotalItems(parsedCart));
        setSubtotal(calculateSubtotal(parsedCart));
      } catch (error) {
        console.error('Error parsing saved cart:', error);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
    setTotalItems(calculateTotalItems(items));
    setSubtotal(calculateSubtotal(items));
  }, [items]);

  const addItem = (book: Book) => {
    setItems(prevItems => {
      // Check if the book is already in the cart
      const existingItem = prevItems.find(item => item.book.id === book.id);
      
      if (existingItem) {
        // Increment quantity if book already exists
        const updatedItems = prevItems.map(item => 
          item.book.id === book.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
        
        toast({
          title: "Quantity updated",
          description: `${book.title} quantity increased to ${existingItem.quantity + 1}`,
        });
        
        return updatedItems;
      } else {
        // Add new item if book doesn't exist in cart
        toast({
          title: "Added to cart",
          description: `${book.title} has been added to your cart`,
        });
        
        return [...prevItems, { book, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (bookId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(bookId);
      return;
    }
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.book.id === bookId 
          ? { ...item, quantity } 
          : item
      )
    );
  };

  const removeItem = (bookId: string) => {
    setItems(prevItems => {
      const bookToRemove = prevItems.find(item => item.book.id === bookId);
      
      if (bookToRemove) {
        toast({
          title: "Removed from cart",
          description: `${bookToRemove.book.title} has been removed from your cart`,
        });
      }
      
      return prevItems.filter(item => item.book.id !== bookId);
    });
  };

  const clearCart = () => {
    setItems([]);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart",
    });
  };

  const value = {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    totalItems,
    subtotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
