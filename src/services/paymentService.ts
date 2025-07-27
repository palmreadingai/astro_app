import { supabase } from '../integrations/supabase/client';

interface PaymentResult {
  success: boolean;
  error?: string;
  orderData?: {
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
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

export const initiatePayment = async (): Promise<PaymentResult> => {
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
    const { data: result, error } = await supabase.functions.invoke('create-payment', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: {
        country: userCountry
      }
    });

    if (error) {
      console.error('❌ Error creating payment:', error);
      return { success: false, error: error.message || 'Failed to create payment' };
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
      description: 'Lifetime Access to All Astrology Features',
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

export const processPayment = async (): Promise<PaymentResult> => {
  try {
    // First, initiate payment to get order data
    const paymentResult = await initiatePayment();
    
    if (!paymentResult.success || !paymentResult.orderData) {
      console.error('❌ Payment initiation failed:', paymentResult.error);
      return paymentResult;
    }

    // Open Razorpay checkout
    return await openRazorpayCheckout(paymentResult.orderData);

  } catch (error) {
    console.error('❌ Error in processPayment:', error);
    return { success: false, error: 'Payment process failed' };
  }
};