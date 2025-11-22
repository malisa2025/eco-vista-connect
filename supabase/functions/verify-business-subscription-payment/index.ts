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

    const businessId = verifyData.data.metadata.business_id;
    const planId = verifyData.data.metadata.plan_id;
    const amount = verifyData.data.amount / 100; // Paystack returns amount in kobo/pesewas

    if (!businessId || !planId) {
      throw new Error('Business ID and Plan ID required in payment metadata');
    }

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError) throw planError;

    // Calculate subscription end date
    const startDate = new Date();
    const endDate = new Date();
    if (plan.billing_period === 'annual') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setDate(endDate.getDate() + 30);
    }

    // Check if subscription already exists
    const { data: existingSubscription } = await supabase
      .from('business_subscriptions')
      .select('*')
      .eq('business_id', businessId)
      .single();

    let subscription;

    if (existingSubscription) {
      // Update existing subscription
      const { data: updated, error: updateError } = await supabase
        .from('business_subscriptions')
        .update({
          plan_id: planId,
          status: 'active',
          payment_reference: reference,
          amount,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('business_id', businessId)
        .select()
        .single();

      if (updateError) throw updateError;
      subscription = updated;
    } else {
      // Create new subscription
      const { data: created, error: createError } = await supabase
        .from('business_subscriptions')
        .insert({
          business_id: businessId,
          plan_id: planId,
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

    // Generate invoice
    const invoiceNumber = `INV-${Date.now()}`;
    await supabase
      .from('subscription_invoices')
      .insert({
        subscription_id: subscription.id,
        subscription_type: 'business',
        invoice_number: invoiceNumber,
        amount,
        status: 'paid',
        due_date: new Date().toISOString().split('T')[0],
        paid_at: new Date().toISOString(),
        payment_reference: reference
      });

    // Send confirmation email
    const { data: business } = await supabase
      .from('businesses')
      .select('name')
      .eq('id', businessId)
      .single();

    const { data: owner } = await supabase
      .from('business_owners')
      .select('user_id, profiles!inner(email, full_name)')
      .eq('business_id', businessId)
      .eq('is_primary', true)
      .single();

    const ownerProfile = owner?.profiles as any;

    if (ownerProfile?.email) {
      await supabase.functions.invoke('send-notification-email', {
        body: {
          type: 'business_subscription_activated',
          to: ownerProfile.email,
          data: {
            owner_name: ownerProfile.full_name || 'Business Owner',
            business_name: business?.name || 'Your Business',
            plan_name: plan.name,
            amount: amount,
            end_date: endDate.toLocaleDateString('en-GB'),
            features: plan.features
          },
        },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        subscription,
        message: 'Business subscription activated successfully',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error verifying business subscription payment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});