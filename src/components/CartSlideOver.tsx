
import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type CartItem = {
  id: string;
  title: string;
  author: string;
  price: number;
  quantity: number;
  format: 'ebook' | 'hardcover';
  imageUrl: string;
};

interface CartSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSlideOver: React.FC<CartSlideOverProps> = ({ isOpen, onClose }) => {
  // Sample cart items (this would come from your cart context/state)
  const cartItems: CartItem[] = [
    {
      id: '1',
      title: 'Things Fall Apart',
      author: 'Chinua Achebe',
      price: 1299,
      quantity: 1,
      format: 'hardcover',
      imageUrl: 'https://m.media-amazon.com/images/I/71UItA-wOFL._AC_UF1000,1000_QL80_.jpg'
    },
    {
      id: '2',
      title: 'Born a Crime',
      author: 'Trevor Noah',
      price: 1499,
      quantity: 1,
      format: 'ebook',
      imageUrl: 'https://m.media-amazon.com/images/I/81iqH8dpjuL._AC_UF1000,1000_QL80_.jpg'
    },
    {
      id: '3',
      title: 'Americanah',
      author: 'Chimamanda Ngozi Adichie',
      price: 1899,
      quantity: 1,
      format: 'hardcover',
      imageUrl: 'https://m.media-amazon.com/images/I/91sMRsFQ84L._AC_UF1000,1000_QL80_.jpg'
    },
  ];

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  // Format price to KES
  const formatPrice = (price: number) => {
    return `KES ${(price / 100).toFixed(2)}`;
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-all duration-300",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <div 
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-card shadow-lg border-l border-border transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Your Cart ({cartItems.length})</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              aria-label="Close cart"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-muted-foreground mb-4">Your cart is empty</p>
                <Button onClick={onClose}>Continue Shopping</Button>
              </div>
            ) : (
              <ul className="space-y-4">
                {cartItems.map((item) => (
                  <li key={item.id} className="flex gap-4 p-2 border-b border-border/50">
                    <div className="w-16 h-20 overflow-hidden rounded bg-muted flex-shrink-0">
                      <img 
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium line-clamp-1">{item.title}</h3>
                        <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Remove item">
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.author}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-xs inline-flex items-center rounded-full bg-secondary/30 px-2 py-0.5 text-secondary-foreground">
                          {item.format}
                        </span>
                        <span className="font-medium">{formatPrice(item.price)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-border p-4 space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex flex-col space-y-2">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  Checkout
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={onClose}
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartSlideOver;
