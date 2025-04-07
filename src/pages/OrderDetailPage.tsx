
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Package, 
  Clock, 
  CheckCircle,
  AlertCircle,
  FileText,
  MapPin 
} from 'lucide-react';
import { getOrderById, getOrderItems } from '@/services/orderService';
import { Order, OrderItem, ShippingAddress } from '@/types/supabase';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

const OrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Redirect to login if not authenticated and auth is not loading
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId || !user) return;
      
      setIsLoading(true);
      try {
        const orderData = await getOrderById(orderId);
        
        if (!orderData) {
          toast({
            title: 'Order not found',
            description: 'We couldn\'t find the order you\'re looking for.',
            variant: 'destructive',
          });
          navigate('/profile');
          return;
        }
        
        // Check if order belongs to current user
        if (orderData.user_id !== user.id) {
          toast({
            title: 'Unauthorized',
            description: 'You don\'t have permission to view this order.',
            variant: 'destructive',
          });
          navigate('/profile');
          return;
        }
        
        setOrder(orderData);
        
        // Fetch order items
        const items = await getOrderItems(orderId);
        setOrderItems(items);
      } catch (error) {
        console.error('Error fetching order details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load order details',
          variant: 'destructive',
        });
        navigate('/profile');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchOrderDetails();
    }
  }, [orderId, user, navigate, toast]);

  // Format price to KES
  const formatPrice = (price: number) => {
    return `KES ${(price / 100).toFixed(2)}`;
  };

  // Get status details
  const getStatusDetails = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return { 
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          label: 'Completed',
          description: 'Your order has been delivered',
          class: 'text-green-500'
        };
      case 'processing':
        return { 
          icon: <Clock className="w-5 h-5 text-blue-500" />,
          label: 'Processing',
          description: 'Your order is being processed',
          class: 'text-blue-500'
        };
      case 'cancelled':
        return { 
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
          label: 'Cancelled',
          description: 'This order has been cancelled',
          class: 'text-red-500'
        };
      default:
        return { 
          icon: <Clock className="w-5 h-5 text-yellow-500" />,
          label: 'Pending',
          description: 'Your order is pending',
          class: 'text-yellow-500'
        };
    }
  };

  if (authLoading || (isLoading && user)) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-4 py-12 md:px-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse">Loading order details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to auth page
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-4 py-12 md:px-6">
          <div className="flex items-center justify-center h-64">
            <p>Order not found.</p>
          </div>
        </div>
      </div>
    );
  }

  const statusDetails = getStatusDetails(order.status);
  const orderDate = new Date(order.created_at);
  const formattedDate = format(orderDate, 'PPP');
  const shippingAddress = order.shipping_address as ShippingAddress;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container px-4 py-8 md:px-6 md:py-12 max-w-4xl">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/profile')} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Account
          </Button>
          <h1 className="text-2xl font-bold">Order Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-card border rounded-lg p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-lg">Order #{order.id.slice(0, 8)}</h2>
                  <p className="text-sm text-muted-foreground">Placed on {formattedDate}</p>
                </div>
                <div className="mt-2 md:mt-0 flex items-center">
                  {statusDetails.icon}
                  <span className={`ml-2 font-medium ${statusDetails.class}`}>
                    {statusDetails.label}
                  </span>
                </div>
              </div>
              
              <div className="text-sm mt-2">
                <p>{statusDetails.description}</p>
              </div>
              
              <Separator className="my-4" />
              
              <h3 className="font-semibold text-base mb-4">Order Items</h3>
              
              {orderItems.length === 0 ? (
                <div className="text-sm text-muted-foreground">No items in this order</div>
              ) : (
                <div className="space-y-4">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex items-start space-x-4">
                      <div className="bg-muted h-16 w-12 rounded flex items-center justify-center flex-shrink-0">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          Book ID: {item.book_id}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </div>
                        <div className="text-sm">
                          {formatPrice(item.price)} each
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Order Information */}
          <div className="lg:col-span-1">
            <div className="bg-card border rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-base mb-3">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(order.total_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>KES 0.00</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatPrice(order.total_amount)}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold text-base mb-3">Shipping Information</h3>
              <div className="flex items-start">
                <MapPin className="h-4 w-4 text-muted-foreground mr-2 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">{shippingAddress.name}</p>
                  <p>{shippingAddress.address}</p>
                  <p>{shippingAddress.city}, {shippingAddress.postal_code}</p>
                  <p>{shippingAddress.country}</p>
                </div>
              </div>
              
              <h3 className="font-semibold text-base mt-6 mb-3">Payment Information</h3>
              <div className="text-sm">
                <p>Payment ID: {order.payment_intent_id || 'N/A'}</p>
                <p className="mt-1">Method: Credit Card</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
