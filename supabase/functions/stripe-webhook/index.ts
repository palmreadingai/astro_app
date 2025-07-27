import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from "https://esm.sh/stripe@14.21.0";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2022-11-15",
  httpClient: Stripe.createFetchHttpClient(),
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

// Store processed events for idempotency
const processedEvents = new Set<string>();

const handleCheckoutSessionCompleted = async (session: Stripe.Checkout.Session) => {
  try {
    console.log('Processing checkout session completed:', session.id);
    
    const userId = session.metadata?.user_id;
    if (!userId) {
      console.error('No user_id in session metadata');
      return;
    }

    // Update order status to paid
    const { error: orderError } = await supabase
      .from('orders')
      .update({ 
        status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_session_id', session.id);

    if (orderError) {
      console.error('Error updating order status:', orderError);
      return;
    }

    // Update user profile to mark as paid
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        has_paid: true,
        payment_verified_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (profileError) {
      console.error('Error updating profile:', profileError);
    } else {
      console.log('Successfully processed payment for user:', userId);
    }

  } catch (error) {
    console.error('Error in handleCheckoutSessionCompleted:', error);
  }
};

const handleCheckoutSessionExpired = async (session: Stripe.Checkout.Session) => {
  try {
    console.log('Processing checkout session expired:', session.id);
    
    // Update order status to expired
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'expired',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_session_id', session.id);

    if (error) {
      console.error('Error updating expired order:', error);
    } else {
      console.log('Successfully marked order as expired:', session.id);
    }

  } catch (error) {
    console.error('Error in handleCheckoutSessionExpired:', error);
  }
};

const handlePaymentIntentFailed = async (paymentIntent: Stripe.PaymentIntent) => {
  try {
    console.log('Processing payment intent failed:', paymentIntent.id);
    
    // Find the checkout session that created this payment intent
    const sessions = await stripe.checkout.sessions.list({
      payment_intent: paymentIntent.id,
      limit: 1
    });
    
    if (sessions.data.length === 0) {
      console.error('No checkout session found for failed payment intent:', paymentIntent.id);
      return;
    }
    
    const sessionId = sessions.data[0].id;
    
    // Update order status to failed
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_session_id', sessionId);

    if (error) {
      console.error('Error updating failed payment:', error);
    } else {
      console.log('Successfully marked payment as failed for session:', sessionId);
    }

  } catch (error) {
    console.error('Error in handlePaymentIntentFailed:', error);
  }
};

serve(async (request) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const signature = request.headers.get("Stripe-Signature");
  if (!signature) {
    return new Response('Missing Stripe signature', { status: 400 });
  }

  const body = await request.text();
  let receivedEvent: Stripe.Event;
  
  try {
    receivedEvent = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SIGNING_SECRET")!,
      undefined,
      cryptoProvider
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Idempotency check
  if (processedEvents.has(receivedEvent.id)) {
    console.log('Event already processed:', receivedEvent.id);
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  console.log('Processing event:', receivedEvent.type, receivedEvent.id);

  // Process the event
  switch (receivedEvent.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(receivedEvent.data.object as Stripe.Checkout.Session);
      break;
    
    case 'checkout.session.expired':
      await handleCheckoutSessionExpired(receivedEvent.data.object as Stripe.Checkout.Session);
      break;
    
    case 'checkout.session.async_payment_succeeded':
      await handleCheckoutSessionCompleted(receivedEvent.data.object as Stripe.Checkout.Session);
      break;
    
    case 'payment_intent.succeeded':
      // Additional confirmation - can be handled same as checkout.session.completed
      console.log('Payment intent succeeded:', receivedEvent.data.object.id);
      break;
    
    case 'payment_intent.payment_failed':
      await handlePaymentIntentFailed(receivedEvent.data.object as Stripe.PaymentIntent);
      break;
    
    default:
      console.log('Unhandled event type:', receivedEvent.type);
  }

  // Mark event as processed
  processedEvents.add(receivedEvent.id);

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});