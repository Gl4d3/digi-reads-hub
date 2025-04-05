
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { CreditCard, ShieldCheck, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const CheckoutPage: React.FC = () => {
  const { items, subtotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Kenya',
    cardHolder: '',
    cardNumber: '',
    expiryDate: '',
    cvc: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [savedAddress, setSavedAddress] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      toast({
        title: "Authentication required",
        description: "Please sign in to proceed with checkout.",
        variant: "destructive",
      });
      navigate('/auth', { state: { returnUrl: '/checkout' } });
    }
  }, [isAuthenticated, isLoading, navigate, toast]);

  useEffect(() => {
    // Load saved address from localStorage or user profile
    if (user) {
      // Here we would fetch the user's address from the database
      const savedAddressData = localStorage.getItem(`address_${user.id}`);
      if (savedAddressData) {
        setSavedAddress(JSON.parse(savedAddressData));
      }
    }

    // Prefill form with user data if available
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        name: user.user_metadata?.full_name || ''
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUseSavedAddress = () => {
    if (savedAddress) {
      setFormData(prev => ({
        ...prev,
        ...savedAddress
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checking out.",
        variant: "destructive",
      });
      return;
    }
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to proceed with checkout.",
        variant: "destructive",
      });
      navigate('/auth', { state: { returnUrl: '/checkout' } });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Prepare the payment request
      const paymentRequest = {
        items: items.map(item => ({
          book_id: item.book.id,
          quantity: item.quantity,
          price: item.book.price
        })),
        shipping_address: {
          name: formData.name,
          address: formData.address,
          city: formData.city,
          postal_code: formData.postalCode,
          country: formData.country
        },
        total_amount: subtotal,
        payment_method: {
          type: 'card',
          card_token: `sim_${Date.now()}` // In a real app, this would be a token from Stripe or similar
        }
      };
      
      // Call the edge function to process payment
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: paymentRequest
      });
      
      if (error) {
        throw new Error(error.message || 'Payment processing failed');
      }
      
      // Save address for future use if user is logged in
      if (user) {
        const addressToSave = {
          name: formData.name,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country
        };
        
        localStorage.setItem(`address_${user.id}`, JSON.stringify(addressToSave));
      }
      
      // Clear cart and redirect to success page
      clearCart();
      
      toast({
        title: "Payment successful!",
        description: "Thank you for your purchase.",
      });
      
      navigate('/order-confirmation', { 
        state: { 
          orderId: data.order_id,
          orderStatus: data.status
        }
      });
      
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment failed",
        description: error.message || "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return `KES ${(price / 100).toFixed(2)}`;
  };

  if (!isAuthenticated) {
    return null; // Don't render anything until redirect happens
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container px-4 py-8 md:px-6 md:py-12">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1 order-2 lg:order-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>
                  {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map(item => (
                  <div key={item.book.id} className="flex justify-between text-sm">
                    <span>{item.book.title} x{item.quantity}</span>
                    <span>{formatPrice(item.book.price * item.quantity)}</span>
                  </div>
                ))}
                
                <Separator />
                
                <div className="flex justify-between font-medium">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Delivery</span>
                  <span>{formatPrice(0)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Payment Form */}
          <div className="lg:col-span-2 order-1 lg:order-1">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Shipping Information</CardTitle>
                    {savedAddress && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleUseSavedAddress}
                        size="sm"
                      >
                        Use Saved Address
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input 
                      id="address" 
                      name="address" 
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city" 
                        name="city" 
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input 
                        id="postalCode" 
                        name="postalCode" 
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input 
                        id="country" 
                        name="country" 
                        value={formData.country}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                  <CardDescription>
                    Your payment information is encrypted and secure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardHolder">Cardholder Name</Label>
                    <Input 
                      id="cardHolder" 
                      name="cardHolder" 
                      value={formData.cardHolder}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <div className="relative">
                      <Input 
                        id="cardNumber" 
                        name="cardNumber" 
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        required
                      />
                      <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input 
                        id="expiryDate" 
                        name="expiryDate" 
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        maxLength={5}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input 
                        id="cvc" 
                        name="cvc" 
                        value={formData.cvc}
                        onChange={handleInputChange}
                        maxLength={3}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center mt-4 text-sm text-muted-foreground">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    <span>Your payment information is securely encrypted</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full py-6"
                    disabled={isLoading || items.length === 0}
                  >
                    {isLoading ? 'Processing...' : 'Complete Payment'}
                    {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
