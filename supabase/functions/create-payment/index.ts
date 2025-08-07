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

    // Parse request body to get user's country/currency preference and coupon
    let isIndia = true; // Default to India
    let userCountry = 'IN';
    let couponCode = null;
    let appliedCoupon = null;
    
    try {
      const requestBody = await req.text();
      if (requestBody) {
        const body = JSON.parse(requestBody);
        if (body.country) {
          userCountry = body.country;
          isIndia = body.country === 'IN';
        }
        if (body.couponCode) {
          couponCode = body.couponCode.trim().toUpperCase();
          console.log('🎫 Coupon code provided:', couponCode);
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

    // Handle coupon validation if provided
    if (couponCode) {
      console.log('🎟️ Validating coupon:', couponCode);
      
      // Use the database function to validate coupon
      const { data: validationResult, error: validationError } = await supabase
        .rpc('validate_coupon_code', {
          p_code: couponCode,
          p_user_id: user.id
        });

      if (validationError) {
        console.error('❌ Coupon validation error:', validationError);
        return new Response(JSON.stringify({ error: 'Coupon validation failed' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (!validationResult || validationResult.length === 0 || !validationResult[0].is_valid) {
        const errorMessage = validationResult?.[0]?.error_message || 'Invalid coupon code';
        console.log('❌ Coupon invalid:', errorMessage);
        return new Response(JSON.stringify({ error: errorMessage }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const couponData = validationResult[0];
      appliedCoupon = couponData;
      console.log('✅ Coupon validated successfully:', appliedCoupon);
      console.log('🔍 Coupon details - Type:', appliedCoupon.type, 'Discount Type:', appliedCoupon.discount_type, 'Value:', appliedCoupon.discount_value, 'Currency:', appliedCoupon.currency);
      
      // Handle free coupons - bypass payment entirely
      if (appliedCoupon.type === 'free') {
        console.log('🆓 Free coupon detected - bypassing payment...');
        
        // Create usage record
        const { error: usageError } = await supabase
          .from('coupon_usages')
          .insert({
            coupon_id: appliedCoupon.coupon_id,
            user_id: user.id,
            order_id: null, // No order for free coupons
            discount_applied: isIndia ? 99.00 : 1.99, // Full amount as discount
            original_amount: isIndia ? 9900 : 199,
            final_amount: 0,
            currency: isIndia ? 'INR' : 'USD',
            ip_address: req.headers.get('x-forwarded-for'),
            user_agent: req.headers.get('user-agent')
          });

        if (usageError) {
          console.error('❌ Error creating coupon usage record:', usageError);
          return new Response(JSON.stringify({ error: 'Failed to apply coupon' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Increment coupon usage count
        const { data: incrementResult, error: incrementError } = await supabase
          .rpc('increment_coupon_usage', { coupon_id: appliedCoupon.coupon_id });

        if (incrementError || !incrementResult) {
          console.error('❌ Error incrementing coupon usage:', incrementError);
          // Continue anyway, usage record is created
        }

        // Update user profile to mark as paid
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            has_paid: true,
            payment_verified_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (profileError) {
          console.error('❌ Error updating profile:', profileError);
          return new Response(JSON.stringify({ error: 'Failed to activate premium access' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        console.log('✅ Free coupon processed successfully - user has premium access');
        return new Response(JSON.stringify({ 
          success: true,
          message: 'Premium access activated with coupon!',
          coupon: {
            code: appliedCoupon.code,
            type: 'free'
          }
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
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
    
    // Set pricing based on user's location and apply coupon discount
    let originalAmount = isIndia ? 9900 : 199; // ₹99 for India (in paise), $1.99 for global (in cents)
    let finalAmount = originalAmount;
    let discountAmount = 0;
    const currency = isIndia ? "INR" : "USD";
    let priceDisplay = isIndia ? "₹99" : "$1.99";
    let couponInfo = null;

    // Apply coupon discount if valid discount coupon
    if (appliedCoupon && appliedCoupon.type === 'discount') {
      console.log('💸 Applying discount coupon...');
      console.log('🔍 Before discount - Original Amount:', originalAmount, 'paise');
      
      if (appliedCoupon.discount_type === 'percentage') {
        // Percentage discount applies to any currency
        discountAmount = Math.round((originalAmount * appliedCoupon.discount_value) / 100);
        console.log('📊 Percentage discount:', appliedCoupon.discount_value + '%', 'Amount:', discountAmount);
      } else if (appliedCoupon.discount_type === 'amount') {
        // Amount discount - check currency compatibility
        if (appliedCoupon.currency === currency) {
          // Convert to paise/cents for calculation
          discountAmount = Math.round(appliedCoupon.discount_value * (currency === 'INR' ? 100 : 100));
          console.log('💰 Amount discount:', appliedCoupon.discount_value, appliedCoupon.currency, 'Amount:', discountAmount);
        } else {
          console.log('❌ Currency mismatch:', appliedCoupon.currency, 'vs', currency);
          return new Response(JSON.stringify({ error: 'Coupon not applicable for your region' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }
      
      // Ensure discount doesn't exceed original amount
      discountAmount = Math.min(discountAmount, originalAmount);
      finalAmount = Math.max(0, originalAmount - discountAmount);
      
      // Update price display
      const finalPrice = finalAmount / (currency === 'INR' ? 100 : 100);
      priceDisplay = currency === 'INR' ? `₹${finalPrice}` : `$${finalPrice.toFixed(2)}`;
      
      couponInfo = {
        code: appliedCoupon.code,
        type: 'discount',
        discount_type: appliedCoupon.discount_type,
        discount_value: appliedCoupon.discount_value,
        discount_amount: discountAmount / (currency === 'INR' ? 100 : 100),
        original_price: originalAmount / (currency === 'INR' ? 100 : 100),
        final_price: finalPrice
      };
      
      console.log('💳 Final pricing - Original:', originalAmount, 'Discount:', discountAmount, 'Final:', finalAmount);
    }
    
    console.log('💰 Pricing for', userCountry + ':', priceDisplay, '| Amount:', finalAmount, '| Currency:', currency);
    
    const orderData = {
      amount: finalAmount,
      currency: currency,
      receipt: receipt,
      notes: {
        user_id: user.id,
        user_email: user.email || '',
        product: "PalmAI - Lifetime Access",
        country: userCountry,
        price: priceDisplay,
        original_amount: originalAmount,
        discount_amount: discountAmount,
        coupon_code: couponCode || '',
        coupon_applied: !!appliedCoupon
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
      amount: finalAmount,
      currency: currency,
      status: 'pending',
    });
    
    const { data: newOrder, error: insertError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        order_id: order.id,
        amount: finalAmount,
        currency: currency,
        status: 'pending',
      })
      .select()
      .single();

    if (!insertError && appliedCoupon && appliedCoupon.type === 'discount') {
      // Create coupon usage record for discount coupon
      console.log('📝 Creating coupon usage record...');
      const { error: usageError } = await supabase
        .from('coupon_usages')
        .insert({
          coupon_id: appliedCoupon.coupon_id,
          user_id: user.id,
          order_id: newOrder.id,
          discount_applied: discountAmount / (currency === 'INR' ? 100 : 100),
          original_amount: originalAmount,
          final_amount: finalAmount,
          currency: currency,
          ip_address: req.headers.get('x-forwarded-for'),
          user_agent: req.headers.get('user-agent')
        });

      if (usageError) {
        console.error('❌ Error creating coupon usage record:', usageError);
        // Don't fail the payment creation, just log the error
      } else {
        // Increment coupon usage count
        const { data: incrementResult, error: incrementError } = await supabase
          .rpc('increment_coupon_usage', { coupon_id: appliedCoupon.coupon_id });

        if (incrementError || !incrementResult) {
          console.error('❌ Error incrementing coupon usage:', incrementError);
        } else {
          console.log('✅ Coupon usage recorded and incremented');
        }
      }
    }

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
      keyId: Deno.env.get("RAZORPAY_KEY_ID"),
      coupon: couponInfo,
      pricing: {
        original_amount: originalAmount,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        currency: currency
      }
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