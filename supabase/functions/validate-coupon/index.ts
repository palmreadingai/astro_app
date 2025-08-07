import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ValidationRequest {
  couponCode: string;
  userCountry?: string;
}

interface CouponData {
  id: string;
  code: string;
  type: 'discount' | 'free';
  discount_type?: 'percentage' | 'amount';
  discount_value?: number;
  currency?: string;
}

interface DiscountInfo {
  type: 'percentage' | 'amount' | 'free';
  value: number;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  currency: string;
}

interface ValidationResponse {
  isValid: boolean;
  coupon?: CouponData;
  discount?: DiscountInfo;
  error?: string;
}

// Calculate discount based on coupon and user location
function calculateDiscount(
  coupon: CouponData, 
  userCountry: string = 'IN'
): DiscountInfo | null {
  console.log('🧮 Calculating discount for coupon:', coupon.code, 'Country:', userCountry);
  
  // Determine pricing based on user location
  const isIndia = userCountry === 'IN';
  const originalAmount = isIndia ? 9900 : 199; // ₹99 (paise) or $1.99 (cents)
  const currency = isIndia ? 'INR' : 'USD';
  
  // Handle free coupons
  if (coupon.type === 'free') {
    console.log('✅ Free coupon - no payment required');
    return {
      type: 'free',
      value: 0,
      originalAmount,
      discountAmount: originalAmount,
      finalAmount: 0,
      currency
    };
  }
  
  // Handle discount coupons
  if (coupon.type === 'discount') {
    let discountAmount = 0;
    
    if (coupon.discount_type === 'percentage') {
      // Percentage discount applies to any currency
      discountAmount = Math.round((originalAmount * (coupon.discount_value || 0)) / 100);
      console.log('📊 Percentage discount:', coupon.discount_value + '%', 'Amount:', discountAmount);
    } else if (coupon.discount_type === 'amount') {
      // Amount discount - check currency compatibility
      if (coupon.currency === currency) {
        // Convert to paise/cents for calculation
        discountAmount = Math.round((coupon.discount_value || 0) * (currency === 'INR' ? 100 : 100));
        console.log('💰 Amount discount:', coupon.discount_value, coupon.currency, 'Amount:', discountAmount);
      } else {
        // Currency mismatch
        console.log('❌ Currency mismatch:', coupon.currency, 'vs', currency);
        return null;
      }
    }
    
    // Ensure discount doesn't exceed original amount
    discountAmount = Math.min(discountAmount, originalAmount);
    const finalAmount = Math.max(0, originalAmount - discountAmount);
    
    console.log('💳 Final calculation - Original:', originalAmount, 'Discount:', discountAmount, 'Final:', finalAmount);
    
    return {
      type: coupon.discount_type || 'amount',
      value: coupon.discount_value || 0,
      originalAmount,
      discountAmount,
      finalAmount,
      currency
    };
  }
  
  return null;
}

serve(async (req) => {
  console.log('🎟️ Validate coupon function called', req.method);
  
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

    // Parse request body
    let requestBody: ValidationRequest;
    try {
      const bodyText = await req.text();
      requestBody = JSON.parse(bodyText);
      console.log('📥 Request body:', requestBody);
    } catch (error) {
      console.error('❌ Invalid request body:', error);
      return new Response(JSON.stringify({ 
        error: 'Invalid request body',
        isValid: false 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { couponCode, userCountry = 'IN' } = requestBody;

    if (!couponCode || typeof couponCode !== 'string' || couponCode.trim() === '') {
      console.error('❌ Invalid coupon code:', couponCode);
      return new Response(JSON.stringify({ 
        error: 'Coupon code is required',
        isValid: false 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('🎫 Validating coupon:', couponCode.toUpperCase(), 'for user:', user.id);

    // Use the database function to validate coupon
    const { data: validationResult, error: validationError } = await supabase
      .rpc('validate_coupon_code', {
        p_code: couponCode.toUpperCase().trim(),
        p_user_id: user.id
      });

    if (validationError) {
      console.error('❌ Database validation error:', validationError);
      return new Response(JSON.stringify({ 
        error: 'Validation failed',
        isValid: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!validationResult || validationResult.length === 0) {
      console.log('❌ No validation result');
      return new Response(JSON.stringify({ 
        error: 'Coupon validation failed',
        isValid: false 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const result = validationResult[0];
    console.log('📋 Validation result:', result);

    if (!result.is_valid) {
      console.log('❌ Coupon invalid:', result.error_message);
      return new Response(JSON.stringify({ 
        error: result.error_message,
        isValid: false 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Coupon is valid, calculate discount
    console.log('✅ Coupon is valid, calculating discount...');
    const coupon: CouponData = {
      id: result.coupon_id,
      code: result.code,
      type: result.type,
      discount_type: result.discount_type,
      discount_value: result.discount_value,
      currency: result.currency
    };

    const discount = calculateDiscount(coupon, userCountry);
    if (!discount) {
      console.error('❌ Could not calculate discount');
      return new Response(JSON.stringify({ 
        error: 'Coupon not applicable for your region',
        isValid: false 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const response: ValidationResponse = {
      isValid: true,
      coupon,
      discount
    };

    console.log('✅ Coupon validation successful:', response);
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error validating coupon:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      isValid: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});