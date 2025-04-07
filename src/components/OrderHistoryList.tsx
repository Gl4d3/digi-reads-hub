
import React from 'react';
import { Order } from '@/types/supabase';
import { 
  Package, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface OrderHistoryListProps {
  orders: Order[];
}

const OrderHistoryList: React.FC<OrderHistoryListProps> = ({ orders }) => {
  // Format price to KES
  const formatPrice = (price: number) => {
    return `KES ${(price / 100).toFixed(2)}`;
  };
  
  // Get status icon based on order status
  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  // Get status label and class
  const getStatusInfo = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return { 
          label: 'Completed', 
          bgClass: 'bg-green-100 text-green-700' 
        };
      case 'processing':
        return { 
          label: 'Processing', 
          bgClass: 'bg-blue-100 text-blue-700' 
        };
      case 'cancelled':
        return { 
          label: 'Cancelled', 
          bgClass: 'bg-red-100 text-red-700' 
        };
      default:
        return { 
          label: 'Pending', 
          bgClass: 'bg-yellow-100 text-yellow-700' 
        };
    }
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed rounded-lg">
        <Package className="mx-auto h-10 w-10 text-muted-foreground/60" />
        <h3 className="mt-4 text-lg font-medium">No orders yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          When you place your first order, it will appear here.
        </p>
        <Button asChild className="mt-4">
          <Link to="/">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const statusInfo = getStatusInfo(order.status);
        const orderDate = new Date(order.created_at);
        const timeAgo = formatDistanceToNow(orderDate, { addSuffix: true });
        
        return (
          <div 
            key={order.id} 
            className="border rounded-lg overflow-hidden bg-card"
          >
            <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium uppercase text-muted-foreground">Order #:</span>
                  <span className="text-sm font-mono">{order.id.slice(0, 8)}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Placed {timeAgo}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgClass}`}>
                  {statusInfo.label}
                </span>
                <span className="font-medium">
                  {formatPrice(order.total_amount)}
                </span>
              </div>
            </div>
            <div className="p-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                {getStatusIcon(order.status)}
                <span className="text-sm">
                  {order.status === 'completed' ? 
                    'Delivered' : 
                    order.status === 'cancelled' ? 
                    'Cancelled' : 
                    'Processing your order'}
                </span>
              </div>
              <Button variant="ghost" size="sm" className="flex items-center" asChild>
                <Link to={`/order/${order.id}`}>
                  View Details
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderHistoryList;
