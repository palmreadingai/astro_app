/// <reference types="https://deno.land/x/types/index.d.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Razorpay from "https://esm.sh/razorpay@2.9.4";
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

if (!razorpayKeyId || !razorpayKeySecret) {
  console.error('❌ Missing Razorpay credentials');
  console.error('❌ Key ID available:', !!razorpayKeyId);
  console.error('❌ Key Secret available:', !!razorpayKeySecret);
} else {
  console.log('✅ Razorpay credentials loaded');
  console.log('🔑 Key ID starts with:', razorpayKeyId.substring(0, 8) + '...');
  console.log('🔑 Key Secret length:', razorpayKeySecret.length);
}

console.log('🔧 Initializing Razorpay instance...');
const razorpay = new Razorpay({
  key_id: razorpayKeyId!,
  key_secret: razorpayKeySecret!,
});

console.log('✅ Razorpay instance created');
console.log('📍 Razorpay orders method available:', typeof razorpay.orders);
console.log('📍 Razorpay orders.create method available:', typeof razorpay.orders?.create);

serve(async (req) => {
  console.log('🚀 Create payment function called', req.method);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    console.error('❌ Invalid method:', req.method);
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    console.log('🔑 Checking authorization...');
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ No authorization header');
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse request body to get user's country/currency preference
    let isIndia = true; // Default to India
    let userCountry = 'IN';
    
    try {
      const requestBody = await req.text();
      if (requestBody) {
        const body = JSON.parse(requestBody);
        if (body.country) {
          userCountry = body.country;
          isIndia = body.country === 'IN';
        }
      }
    } catch (parseError) {
      console.log('⚠️ Could not parse request body, using defaults:', parseError);
      // Use defaults if parsing fails
    }
    
    console.log('🌍 User country:', userCountry, '| Is India:', isIndia);

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('❌ Invalid user:', authError);
      return new Response(JSON.stringify({ error: 'Invalid authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log('✅ User authenticated:', user.email);

    // Check if user already has paid
    console.log('💳 Checking payment status...');
    const { data: profile } = await supabase
      .from('profiles')
      .select('has_paid')
      .eq('id', user.id)
      .single();

    if (profile?.has_paid) {
      console.log('✅ User already has paid access');
      return new Response(JSON.stringify({ error: 'User already has paid access' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log('💰 User needs to pay, proceeding...');

    // Check for existing pending orders
    console.log('🔍 Checking for existing pending orders...');
    const { data: existingOrders } = await supabase
      .from('orders')
      .select('order_id')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .limit(1);

    // If there's a pending Razorpay order, check if it's still valid
    if (existingOrders && existingOrders.length > 0) {
      console.log('📋 Found existing pending order:', existingOrders[0].order_id);
      try {
        const existingOrder = await razorpay.orders.fetch(existingOrders[0].order_id);
        if (existingOrder.status === 'created') {
          console.log('✅ Existing order is still valid, returning it');
          return new Response(JSON.stringify({ 
            orderId: existingOrder.id,
            amount: existingOrder.amount,
            currency: existingOrder.currency,
            keyId: Deno.env.get("RAZORPAY_KEY_ID")
          }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      } catch (error) {
        console.log('❌ Previous order no longer valid, creating new one:', error);
      }
    }
    
    console.log('🆕 Creating new Razorpay order...');

    // Create new Razorpay order
    console.log('📦 Creating Razorpay order...');
    
    // Generate a short receipt ID (max 40 characters)
    const shortUserId = user.id.substring(0, 8); // First 8 chars of UUID
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
    const receipt = `ord_${shortUserId}_${timestamp}`; // Format: ord_12345678_87654321 (23 chars)
    
    console.log('📄 Generated receipt:', receipt, '(length:', receipt.length, ')');
    
    // Set pricing based on user's location
    const amount = isIndia ? 9900 : 199; // ₹99 for India (in paise), $1.99 for global (in cents)
    const currency = isIndia ? "INR" : "USD";
    const priceDisplay = isIndia ? "₹99" : "$1.99";
    
    console.log('💰 Pricing for', userCountry + ':', priceDisplay, '| Amount:', amount, '| Currency:', currency);
    
    const orderData = {
      amount: amount,
      currency: currency,
      receipt: receipt,
      notes: {
        user_id: user.id,
        user_email: user.email || '',
        product: "PalmAI - Lifetime Access",
        country: userCountry,
        price: priceDisplay
      },
    };
    
    console.log('🔧 Order data:', orderData);
    
    let order;
    try {
      console.log('🔄 About to call razorpay.orders.create...');
      console.log('🔑 Razorpay key ID available:', !!razorpayKeyId);
      console.log('🔑 Razorpay key secret available:', !!razorpayKeySecret);
      
      // First, test Razorpay connectivity with a simple API call
      console.log('🧪 Testing Razorpay API connectivity...');
      try {
        const testTimeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Razorpay test API timeout')), 5000);
        });
        
        // Try to fetch existing orders (should work even if none exist)
        const testPromise = razorpay.orders.all({ count: 1 });
        const testResult = await Promise.race([testPromise, testTimeoutPromise]);
        console.log('✅ Razorpay API connectivity test passed:', testResult);
      } catch (testError) {
        console.error('❌ Razorpay API connectivity test failed:', testError);
        console.error('❌ Test error type:', typeof testError);
        console.error('❌ Test error message:', testError.message);
        console.error('❌ Test error stack:', testError.stack);
        
        // Don't fail the whole function for connectivity test, just log and continue
        console.log('⚠️ Continuing with order creation despite connectivity test failure');
      }
      
      // Add timeout to Razorpay API call
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Razorpay API timeout')), 15000); // 15 second timeout
      });
      
      console.log('📞 Calling razorpay.orders.create with data:', orderData);
      const orderPromise = razorpay.orders.create(orderData);
      
      order = await Promise.race([orderPromise, timeoutPromise]);
      console.log('✅ Razorpay order created successfully');
      console.log('📋 Order ID:', order.id);
      console.log('📋 Order amount:', order.amount);
      console.log('📋 Order currency:', order.currency);
      console.log('📋 Order status:', order.status);
    } catch (razorpayError) {
      console.error('❌ Razorpay order creation failed:', razorpayError);
      console.error('❌ Error details:', JSON.stringify(razorpayError, null, 2));
      return new Response(JSON.stringify({ 
        error: 'Failed to create Razorpay order',
        details: razorpayError.message || 'Razorpay API error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Insert order record
    console.log('💾 Inserting order record into database...');
    console.log('💾 Database record data:', {
      user_id: user.id,
      order_id: order.id,
      amount: amount,
      currency: currency,
      status: 'pending',
    });
    
    const { error: insertError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        order_id: order.id,
        amount: amount,
        currency: currency,
        status: 'pending',
      });

    if (insertError) {
      console.error('❌ Failed to insert order:', insertError);
      console.error('❌ Insert error details:', JSON.stringify(insertError, null, 2));
      return new Response(JSON.stringify({ error: 'Failed to create order record' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log('✅ Order record inserted successfully');
    
    const responseData = {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: Deno.env.get("RAZORPAY_KEY_ID")
    };
    
    console.log('📤 Returning response:', responseData);
    
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error creating payment:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});