import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.84.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { reference } = await req.json();

    if (!reference) {
      return new Response(
        JSON.stringify({ error: 'Payment reference is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify payment with Paystack
    const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!PAYSTACK_SECRET_KEY) {
      throw new Error('PAYSTACK_SECRET_KEY not configured');
    }

    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const verifyData = await verifyResponse.json();

    if (!verifyData.status || verifyData.data.status !== 'success') {
      return new Response(
        JSON.stringify({ error: 'Payment verification failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const userId = verifyData.data.metadata.user_id;
    const amount = verifyData.data.amount / 100; // Paystack returns amount in kobo/pesewas

    if (!userId) {
      throw new Error('User ID not found in payment metadata');
    }

    // Calculate subscription end date (30 days from now)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    // Check if subscription already exists
    const { data: existingSubscription } = await supabase
      .from('job_seeker_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    let subscription;

    if (existingSubscription) {
      // Update existing subscription
      const { data: updated, error: updateError } = await supabase
        .from('job_seeker_subscriptions')
        .update({
          status: 'active',
          payment_reference: reference,
          amount,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) throw updateError;
      subscription = updated;
    } else {
      // Create new subscription
      const { data: created, error: createError } = await supabase
        .from('job_seeker_subscriptions')
        .insert({
          user_id: userId,
          status: 'active',
          payment_reference: reference,
          amount,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        })
        .select()
        .single();

      if (createError) throw createError;
      subscription = created;
    }

    // Record payment transaction
    const { error: paymentError } = await supabase
      .from('subscription_payments')
      .insert({
        subscription_id: subscription.id,
        user_id: userId,
        payment_reference: reference,
        amount,
        status: 'success',
        paid_at: new Date().toISOString(),
        metadata: verifyData.data,
      });

    if (paymentError) throw paymentError;

    // Send confirmation email
    await supabase.functions.invoke('send-notification-email', {
      body: {
        type: 'subscription_activated',
        to: verifyData.data.customer.email,
        data: {
          user_name: verifyData.data.customer.email.split('@')[0],
          end_date: endDate.toLocaleDateString('en-GB'),
          amount: amount,
        },
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        subscription,
        message: 'Subscription activated successfully',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error verifying subscription payment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});