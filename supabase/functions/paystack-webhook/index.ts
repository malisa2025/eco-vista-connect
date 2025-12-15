import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-paystack-signature",
};

// Verify webhook signature using Web Crypto API
async function verifySignature(body: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const hash = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
  return hash === signature;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      throw new Error("PAYSTACK_SECRET_KEY not configured");
    }

    // Get the raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    // Verify webhook signature
    if (signature) {
      const isValid = await verifySignature(body, signature, paystackSecretKey);
      if (!isValid) {
        console.error("Invalid webhook signature");
        return new Response(
          JSON.stringify({ error: "Invalid signature" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const event = JSON.parse(body);
    console.log("Paystack webhook event:", event.event);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    switch (event.event) {
      case "charge.success": {
        const data = event.data;
        const reference = data.reference;
        const metadata = data.metadata || {};
        const paymentType = metadata.payment_type;

        console.log(`Processing successful charge: ${reference}, type: ${paymentType}`);

        // Handle different payment types
        if (paymentType === "hotel_booking" && metadata.booking_id) {
          const { error } = await supabase
            .from("hotel_bookings")
            .update({
              payment_status: metadata.is_balance ? "paid" : "partial",
              payment_reference: reference,
              ...(metadata.is_balance 
                ? { balance_paid_at: new Date().toISOString(), balance_payment_reference: reference } 
                : { deposit_paid_at: new Date().toISOString() }
              ),
            })
            .eq("id", metadata.booking_id);
            
          if (error) {
            console.error("Failed to update hotel booking:", error);
          }
        }

        if (paymentType === "advertisement" && metadata.advertisement_id) {
          const { error } = await supabase
            .from("advertisements")
            .update({
              status: "active",
              payment_status: "paid",
              payment_reference: reference,
              paid_at: new Date().toISOString(),
            })
            .eq("id", metadata.advertisement_id);
            
          if (error) {
            console.error("Failed to update advertisement:", error);
          }
        }

        break;
      }

      case "charge.failed": {
        const data = event.data;
        console.log(`Payment failed: ${data.reference}`);
        break;
      }

      case "refund.processed": {
        const data = event.data;
        console.log(`Refund processed: ${data.transaction_reference}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.event}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
