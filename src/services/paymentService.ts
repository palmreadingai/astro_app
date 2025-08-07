import { supabase } from '../integrations/supabase/client';

interface PaymentResult {
  success: boolean;
  error?: string;
  message?: string;
  orderData?: {
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
    coupon?: CouponInfo;
    pricing?: PricingInfo;
  };
  coupon?: {
    code: string;
    type: string;
  };
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    email?: string;
    contact?: string;
  };
  theme: {
    color: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface OrderData {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

interface RazorpayConstructor {
  new (options: RazorpayOptions): {
    open: () => void;
  };
}

declare global {
  interface Window {
    Razorpay: RazorpayConstructor;
  }
}

interface PaymentStatus {
  hasPaid: boolean;
  paymentDate?: string;
}

interface PaymentStatusResult {
  success: boolean;
  error?: string;
  status?: PaymentStatus;
}

// Coupon related interfaces
interface CouponInfo {
  code: string;
  type: 'discount' | 'free';
  discount_type?: 'percentage' | 'amount';
  discount_value?: number;
  discount_amount?: number;
  original_price?: number;
  final_price?: number;
}

interface PricingInfo {
  original_amount: number;
  discount_amount: number;
  final_amount: number;
  currency: string;
}

interface CouponValidationResult {
  success: boolean;
  error?: string;
  coupon?: {
    id: string;
    code: string;
    type: 'discount' | 'free';
    discount_type?: 'percentage' | 'amount';
    discount_value?: number;
    currency?: string;
  };
  discount?: {
    type: 'percentage' | 'amount' | 'free';
    value: number;
    originalAmount: number;
    discountAmount: number;
    finalAmount: number;
    currency: string;
  };
}

interface AppliedCoupon {
  code: string;
  type: 'discount' | 'free';
  discount?: {
    type: 'percentage' | 'amount' | 'free';
    value: number;
    originalAmount: number;
    discountAmount: number;
    finalAmount: number;
    currency: string;
  };
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      console.error('❌ Failed to load Razorpay script');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const validateCoupon = async (couponCode: string): Promise<CouponValidationResult> => {
  try {
    console.log('🎫 Validating coupon:', couponCode);
    
    // Get current session for authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { success: false, error: 'No active session' };
    }

    // Detect user's country for pricing
    let userCountry = 'IN';
    try {
      const locationResponse = await fetch('https://ipapi.co/json/');
      const locationData = await locationResponse.json();
      userCountry = locationData.country_code || 'IN';
    } catch {
      userCountry = 'IN';
    }

    // Call the validate-coupon edge function
    const { data: result, error } = await supabase.functions.invoke('validate-coupon', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: {
        couponCode: couponCode.trim().toUpperCase(),
        userCountry
      }
    });

    if (error) {
      console.error('❌ Error validating coupon:', error);
      return { success: false, error: error.message || 'Failed to validate coupon' };
    }

    if (!result?.isValid) {
      console.log('❌ Coupon invalid:', result?.error);
      return { success: false, error: result?.error || 'Invalid coupon code' };
    }

    console.log('✅ Coupon validated successfully:', result);
    return {
      success: true,
      coupon: result.coupon,
      discount: result.discount
    };

  } catch (error) {
    console.error('❌ Error in validateCoupon:', error);
    return { success: false, error: 'Network error occurred' };
  }
};

export const initiatePayment = async (couponCode?: string): Promise<PaymentResult> => {
  try {
    // Load Razorpay script
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      console.error('❌ Razorpay script loading failed');
      return { success: false, error: 'Failed to load Razorpay SDK' };
    }

    // Get current session for authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error('❌ No active session found');
      return { success: false, error: 'No active session' };
    }

    // Detect user's country for pricing
    let userCountry = 'IN'; // Default to India
    try {
      const locationResponse = await fetch('https://ipapi.co/json/');
      const locationData = await locationResponse.json();
      userCountry = locationData.country_code || 'IN';
    } catch {
      // Default to India if detection fails
      userCountry = 'IN';
    }

    // Call the create-payment edge function
    const requestBody: any = { country: userCountry };
    if (couponCode) {
      requestBody.couponCode = couponCode.trim().toUpperCase();
      console.log('🎫 Including coupon in payment:', requestBody.couponCode);
    }

    const { data: result, error } = await supabase.functions.invoke('create-payment', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: requestBody
    });

    if (error) {
      console.error('❌ Error creating payment:', error);
      return { success: false, error: error.message || 'Failed to create payment' };
    }

    // Handle free coupon response (no order created)
    if (result?.success && result?.message && !result?.orderId) {
      console.log('✅ Free coupon processed:', result.message);
      return { 
        success: true, 
        message: result.message,
        coupon: result.coupon
      };
    }

    if (!result?.orderId) {
      console.error('❌ No order ID in response:', result);
      return { success: false, error: 'No order data received' };
    }

    return { success: true, orderData: result };

  } catch (error) {
    console.error('❌ Error in initiatePayment:', error);
    return { success: false, error: 'Network error occurred' };
  }
};

export const openRazorpayCheckout = async (orderData: OrderData): Promise<PaymentResult> => {
  return new Promise((resolve) => {
    if (!window.Razorpay) {
      console.error('❌ Razorpay not loaded on window');
      resolve({ success: false, error: 'Razorpay SDK not loaded' });
      return;
    }
    
    const options: RazorpayOptions = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      order_id: orderData.orderId,
      name: 'PalmAI',
      description: orderData.coupon ? 
        `Lifetime Access - ${formatDiscount(orderData.coupon)} Applied` : 
        'Lifetime Access to All Astrology Features',
      handler: async (response: RazorpayResponse) => {
        // Payment successful, refresh payment status
        await refreshPaymentStatus();
        resolve({ success: true });
      },
      prefill: {
        email: '',
        contact: ''
      },
      theme: {
        color: '#7c3aed'
      },
      modal: {
        ondismiss: () => {
          resolve({ success: false, error: 'Payment cancelled by user' });
        }
      }
    };

    try {
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('❌ Error opening Razorpay:', error);
      resolve({ success: false, error: 'Failed to open payment modal' });
    }
  });
};

export const checkPaymentStatus = async (): Promise<PaymentStatusResult> => {
  try {
    // Get current session for authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { success: false, error: 'No active session' };
    }

    // Call the check-payment-status edge function
    const { data: result, error } = await supabase.functions.invoke('check-payment-status', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      console.error('Error checking payment status:', error);
      return { success: false, error: error.message || 'Failed to check payment status' };
    }

    const paymentStatus: PaymentStatus = {
      hasPaid: result.hasPaid || false,
      paymentDate: result.paymentDate || undefined
    };

    return { success: true, status: paymentStatus };

  } catch (error) {
    console.error('Error in checkPaymentStatus:', error);
    return { success: false, error: 'Network error occurred' };
  }
};

export const refreshPaymentStatus = async (): Promise<PaymentStatusResult> => {
  // Simply call checkPaymentStatus since caching is now handled in PaymentContext
  return await checkPaymentStatus();
};

export const processPayment = async (couponCode?: string): Promise<PaymentResult> => {
  try {
    // First, initiate payment to get order data (or handle free coupon)
    const paymentResult = await initiatePayment(couponCode);
    
    if (!paymentResult.success) {
      console.error('❌ Payment initiation failed:', paymentResult.error);
      return paymentResult;
    }

    // If it's a free coupon, return success immediately
    if (paymentResult.message && !paymentResult.orderData) {
      console.log('✅ Free coupon processed successfully');
      return paymentResult;
    }

    // For discount coupons or regular payments, proceed with Razorpay
    if (!paymentResult.orderData) {
      console.error('❌ No order data for payment processing');
      return { success: false, error: 'No order data received' };
    }

    // Open Razorpay checkout
    return await openRazorpayCheckout(paymentResult.orderData);

  } catch (error) {
    console.error('❌ Error in processPayment:', error);
    return { success: false, error: 'Payment process failed' };
  }
};

// Helper function to format discount display
export const formatDiscount = (discount: any): string => {
  if (!discount) return '';
  
  if (discount.type === 'free') {
    return 'FREE ACCESS';
  }
  
  if (discount.type === 'percentage') {
    return `${discount.value}% OFF`;
  }
  
  if (discount.type === 'amount') {
    const symbol = discount.currency === 'INR' ? '₹' : '$';
    return `${symbol}${discount.value} OFF`;
  }
  
  return 'DISCOUNT APPLIED';
};

// Helper function to format price display
export const formatPrice = (amount: number, currency: string): string => {
  const symbol = currency === 'INR' ? '₹' : '$';
  const price = amount / (currency === 'INR' ? 100 : 100);
  return currency === 'INR' ? `${symbol}${price}` : `${symbol}${price.toFixed(2)}`;
};