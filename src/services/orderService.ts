
import { supabase } from '@/integrations/supabase/client';
import { Order, ShippingAddress } from '@/types/supabase';

/**
 * Get orders for a specific user
 */
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
    
    // Convert shipping_address JSON to ShippingAddress type
    return data?.map(order => ({
      ...order,
      shipping_address: order.shipping_address as unknown as ShippingAddress
    })) || [];
  } catch (error) {
    console.error('Error in getUserOrders:', error);
    return [];
  }
};

/**
 * Get a specific order by ID
 */
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    
    if (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
    
    // Convert shipping_address JSON to ShippingAddress type
    return data ? {
      ...data,
      shipping_address: data.shipping_address as unknown as ShippingAddress
    } : null;
  } catch (error) {
    console.error('Error in getOrderById:', error);
    return null;
  }
};

/**
 * Get order items for a specific order
 */
export const getOrderItems = async (orderId: string) => {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);
    
    if (error) {
      console.error('Error fetching order items:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getOrderItems:', error);
    return [];
  }
};
