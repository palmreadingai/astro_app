import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Store processed events for idempotency
const processedEvents = new Set<string>();

interface RazorpayPayment {
  id: string;
  order_id: string;
  status: string;
  amount: number;
  currency: string;
}

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

interface RazorpayWebhookEvent {
  event: string;
  id?: string;
  payload: {
    payment?: {
      entity: RazorpayPayment;
    };
    order?: {
      entity: RazorpayOrder;
    };
  };
}

const verifyRazorpaySignature = async (payload: string, signature: string, secret: string): Promise<boolean> => {
  const { createHmac } = await import('node:crypto');
  const expectedSignature = createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return expectedSignature === signature;
};

const handlePaymentCaptured = async (payment: RazorpayPayment) => {
  try {
    console.log('Processing payment captured:', payment.id);
    
    const orderId = payment.order_id;
    if (!orderId) {
      console.error('No order_id in payment data');
      return;
    }

    // Update order status to paid
    const { error: orderError } = await supabase
      .from('orders')
      .update({ 
        status: 'paid',
        payment_id: payment.id,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', orderId);

    if (orderError) {
      console.error('Error updating order status:', orderError);
      return;
    }

    // Get the user_id from the order
    const { data: order } = await supabase
      .from('orders')
      .select('user_id')
      .eq('order_id', orderId)
      .single();

    if (!order?.user_id) {
      console.error('No user_id found for order:', orderId);
      return;
    }

    // Update user profile to mark as paid
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        has_paid: true,
        payment_verified_at: new Date().toISOString()
      })
      .eq('id', order.user_id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
    } else {
      console.log('Successfully processed payment for user:', order.user_id);
    }

  } catch (error) {
    console.error('Error in handlePaymentCaptured:', error);
  }
};

const handlePaymentFailed = async (payment: RazorpayPayment) => {
  try {
    console.log('Processing payment failed:', payment.id);
    
    const orderId = payment.order_id;
    if (!orderId) {
      console.error('No order_id in payment data');
      return;
    }

    // Update order status to failed
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'failed',
        payment_id: payment.id,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', orderId);

    if (error) {
      console.error('Error updating failed payment:', error);
    } else {
      console.log('Successfully marked payment as failed for order:', orderId);
    }

  } catch (error) {
    console.error('Error in handlePaymentFailed:', error);
  }
};

const handleOrderPaid = async (order: RazorpayOrder) => {
  try {
    console.log('Processing order paid:', order.id);
    
    // This is a backup handler in case payment.captured is not received
    // Update order status to paid
    const { error: orderError } = await supabase
      .from('orders')
      .update({ 
        status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('order_id', order.id);

    if (orderError) {
      console.error('Error updating order status:', orderError);
      return;
    }

    // Get the user_id from the order
    const { data: dbOrder } = await supabase
      .from('orders')
      .select('user_id')
      .eq('order_id', order.id)
      .single();

    if (!dbOrder?.user_id) {
      console.error('No user_id found for order:', order.id);
      return;
    }

    // Update user profile to mark as paid
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        has_paid: true,
        payment_verified_at: new Date().toISOString()
      })
      .eq('id', dbOrder.user_id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
    } else {
      console.log('Successfully processed order payment for user:', dbOrder.user_id);
    }

  } catch (error) {
    console.error('Error in handleOrderPaid:', error);
  }
};

serve(async (request) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const signature = request.headers.get("X-Razorpay-Signature");
  if (!signature) {
    return new Response('Missing Razorpay signature', { status: 400 });
  }

  const body = await request.text();
  const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET")!;
  
  // Verify webhook signature
  if (!(await verifyRazorpaySignature(body, signature, webhookSecret))) {
    console.error('Webhook signature verification failed');
    return new Response('Invalid signature', { status: 400 });
  }

  let event: RazorpayWebhookEvent;
  try {
    event = JSON.parse(body);
  } catch (err) {
    console.error('Invalid JSON in webhook payload:', err);
    return new Response('Invalid JSON', { status: 400 });
  }

  // Idempotency check
  const eventId = event.id || `${event.event}_${Date.now()}`;
  if (processedEvents.has(eventId)) {
    console.log('Event already processed:', eventId);
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  console.log('Processing Razorpay event:', event.event, eventId);

  // Process the event
  switch (event.event) {
    case 'payment.captured':
      if (event.payload.payment?.entity) {
        await handlePaymentCaptured(event.payload.payment.entity);
      }
      break;
    
    case 'payment.failed':
      if (event.payload.payment?.entity) {
        await handlePaymentFailed(event.payload.payment.entity);
      }
      break;
    
    case 'order.paid':
      if (event.payload.order?.entity) {
        await handleOrderPaid(event.payload.order.entity);
      }
      break;
    
    default:
      console.log('Unhandled event type:', event.event);
  }

  // Mark event as processed
  processedEvents.add(eventId);

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});