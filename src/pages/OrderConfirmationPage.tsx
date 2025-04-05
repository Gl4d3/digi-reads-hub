
import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';

const OrderConfirmationPage: React.FC = () => {
  // Generate a random order number for demo purposes
  const orderNumber = `DR-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container px-4 py-12 md:px-6 md:py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-3">Thank You For Your Order!</h1>
          <p className="text-muted-foreground mb-8">
            Your order has been received and is now being processed. 
            You'll receive an email confirmation shortly.
          </p>
          
          <div className="bg-muted p-6 rounded-lg mb-8">
            <div className="text-sm text-muted-foreground mb-2">Order number</div>
            <div className="text-xl font-bold">{orderNumber}</div>
          </div>
          
          <div className="space-y-4">
            <Button asChild className="w-full">
              <Link to="/">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Continue Shopping
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full">
              <Link to="/account/orders">
                View Order History
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
