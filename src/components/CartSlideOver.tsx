
import React from 'react';
import { X, Trash2, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart, CartItem } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface CartSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSlideOver: React.FC<CartSlideOverProps> = ({ isOpen, onClose }) => {
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  const { toast } = useToast();
  
  // Format price to KES
  const formatPrice = (price: number) => {
    return `KES ${(price / 100).toFixed(2)}`;
  };

  const handleCheckout = () => {
    toast({
      title: "Checkout Initiated",
      description: "Your order is being processed.",
    });
    // Navigate to the checkout page
    window.location.href = '/checkout';
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
          "fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-background shadow-lg border-l border-border transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-card">
            <h2 className="text-lg font-semibold">Your Cart ({items.length})</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              aria-label="Close cart"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Cart Items - Improved visibility */}
          <div className="flex-1 overflow-y-auto p-4 bg-background">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-muted-foreground mb-4">Your cart is empty</p>
                <Button onClick={onClose}>Continue Shopping</Button>
              </div>
            ) : (
              <ul className="space-y-4 mb-4">
                {items.map((item) => (
                  <CartItemComponent 
                    key={item.book.id} 
                    item={item} 
                    onRemove={removeItem} 
                    onUpdateQuantity={updateQuantity} 
                  />
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-border p-6 space-y-4 bg-card shadow-inner sticky bottom-0">
              <div className="flex justify-between text-lg">
                <span>Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex flex-col space-y-3">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-lg py-6"
                  onClick={handleCheckout}
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

interface CartItemComponentProps {
  item: CartItem;
  onRemove: (bookId: string) => void;
  onUpdateQuantity: (bookId: string, quantity: number) => void;
}

const CartItemComponent: React.FC<CartItemComponentProps> = ({ 
  item, 
  onRemove, 
  onUpdateQuantity 
}) => {
  const { book, quantity } = item;
  
  const formatPrice = (price: number) => {
    return `KES ${(price / 100).toFixed(2)}`;
  };
  
  return (
    <li className="flex gap-3 p-3 rounded-lg bg-card border border-border shadow-sm">
      <div className="w-16 h-20 overflow-hidden rounded bg-muted flex-shrink-0">
        <img 
          src={book.image_url}
          alt={book.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/assets/digireads-placeholder.jpg';
          }}
        />
      </div>
      <div className="flex flex-col flex-1">
        <div className="flex justify-between">
          <h3 className="font-medium line-clamp-2 text-sm">{book.title}</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            aria-label="Remove item"
            onClick={() => onRemove(book.id)}
          >
            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">{book.author}</p>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-xs inline-flex items-center rounded-full bg-secondary/40 px-2 py-0.5 text-primary-foreground font-medium">
            {book.format}
          </span>
          <span className="font-medium text-sm">{formatPrice(book.price)}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center border border-border rounded-md bg-background">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 p-0" 
              onClick={() => onUpdateQuantity(book.id, quantity - 1)}
              disabled={quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-6 text-center text-sm">{quantity}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 p-0" 
              onClick={() => onUpdateQuantity(book.id, quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <span className="font-medium text-sm">{formatPrice(book.price * quantity)}</span>
        </div>
      </div>
    </li>
  );
};

export default CartSlideOver;
