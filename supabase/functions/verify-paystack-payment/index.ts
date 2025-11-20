import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reference } = await req.json();

    if (!reference) {
      throw new Error('Payment reference is required');
    }

    // Verify payment with Paystack
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        },
      }
    );

    const verifyData = await verifyResponse.json();

    if (!verifyData.status || verifyData.data.status !== 'success') {
      throw new Error('Payment verification failed');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get advertisement ID from metadata
    const advertisementId = verifyData.data.metadata?.advertisement_id;
    if (!advertisementId) {
      throw new Error('Advertisement ID not found in payment metadata');
    }

    // Update advertisement status
    const { error: adError } = await supabaseClient
      .from('advertisements')
      .update({
        payment_reference: reference,
        payment_status: 'paid',
        paid_at: new Date().toISOString(),
        status: 'active',
      })
      .eq('id', advertisementId);

    if (adError) throw adError;

    // Create payment transaction record
    const { error: txError } = await supabaseClient
      .from('payment_transactions')
      .insert({
        advertisement_id: advertisementId,
        payment_reference: reference,
        amount: verifyData.data.amount / 100, // Convert from kobo to naira
        status: 'success',
        paid_at: new Date().toISOString(),
        metadata: verifyData.data,
      });

    if (txError) throw txError;

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Payment verified successfully',
        data: verifyData.data,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
