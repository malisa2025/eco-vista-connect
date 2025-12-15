import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reference, bookingData } = await req.json();

    if (!reference) {
      return new Response(
        JSON.stringify({ error: "Payment reference is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Verifying hotel booking payment:", reference);

    // Verify payment with Paystack
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      throw new Error("PAYSTACK_SECRET_KEY not configured");
    }

    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        },
      }
    );

    const verifyData = await verifyResponse.json();
    console.log("Paystack verification response:", verifyData.status, verifyData.data?.status);

    if (!verifyData.status || verifyData.data?.status !== "success") {
      return new Response(
        JSON.stringify({ error: "Payment verification failed", details: verifyData }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const paymentData = verifyData.data;
    const amountPaid = paymentData.amount / 100; // Convert from pesewas

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // If bookingData is provided, create the booking
    if (bookingData) {
      // Generate booking reference
      const { data: refData } = await supabase.rpc("generate_booking_reference");
      const bookingReference = refData;

      const { data: booking, error: bookingError } = await supabase
        .from("hotel_bookings")
        .insert({
          ...bookingData,
          booking_reference: bookingReference,
          payment_reference: reference,
          payment_status: bookingData.balance_due > 0 ? "partial" : "paid",
          deposit_paid_at: new Date().toISOString(),
          status: "confirmed",
        })
        .select()
        .single();

      if (bookingError) {
        console.error("Failed to create booking:", bookingError);
        throw new Error(`Failed to create booking: ${bookingError.message}`);
      }

      console.log("Booking created successfully:", booking.id);

      // Send confirmation email
      try {
        await supabase.functions.invoke("send-notification-email", {
          body: {
            type: "hotel_booking_confirmation",
            to: bookingData.guest_email,
            data: {
              guest_name: bookingData.guest_name,
              booking_reference: bookingReference,
              hotel_name: bookingData.hotel_name,
              check_in_date: bookingData.check_in_date,
              check_out_date: bookingData.check_out_date,
              amount_paid: amountPaid,
              balance_due: bookingData.balance_due || 0,
            },
          },
        });
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        // Don't fail the booking for email errors
      }

      return new Response(
        JSON.stringify({
          success: true,
          booking,
          payment: {
            reference,
            amount: amountPaid,
            status: "success",
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If no bookingData, just verify payment
    return new Response(
      JSON.stringify({
        success: true,
        payment: {
          reference,
          amount: amountPaid,
          status: "success",
          customer: paymentData.customer,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in verify-hotel-booking-payment:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
