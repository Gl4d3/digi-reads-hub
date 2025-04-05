
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  items: {
    book_id: string;
    quantity: number;
    price: number;
  }[];
  shipping_address: {
    name: string;
    address: string;
    city: string;
    postal_code: string;
    country: string;
  };
  total_amount: number;
  payment_method: {
    type: string;
    card_token?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth token from request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
      }
    );
    
    // Get user from token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid user token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get payment data from request
    const { items, shipping_address, total_amount, payment_method }: PaymentRequest = await req.json();
    
    if (!items || !items.length || !shipping_address || !total_amount || !payment_method) {
      return new Response(
        JSON.stringify({ error: "Invalid payment request data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Here we would process the payment with Stripe or other payment gateway
    // For now, we'll just simulate a successful payment
    
    // Create the order in the database
    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .insert({
        user_id: user.id,
        status: "processing",
        total_amount,
        shipping_address,
        // In a real implementation, we would include the payment_intent_id from Stripe
        payment_intent_id: `sim_${Math.random().toString(36).substring(2, 15)}`,
      })
      .select()
      .single();
    
    if (orderError) {
      console.error("Error creating order:", orderError);
      return new Response(
        JSON.stringify({ error: "Failed to create order" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Add order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      book_id: item.book_id,
      quantity: item.quantity,
      price: item.price,
    }));
    
    const { error: itemsError } = await supabaseClient
      .from("order_items")
      .insert(orderItems);
    
    if (itemsError) {
      console.error("Error adding order items:", itemsError);
      // We should handle this better in production, perhaps by rolling back the order
      return new Response(
        JSON.stringify({ error: "Failed to add order items" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Success!
    return new Response(
      JSON.stringify({
        success: true,
        order_id: order.id,
        status: "processing",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Processing error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
