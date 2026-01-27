import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Attendee {
  name: string;
  email: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { event_id, user_id, attendees, payment_reference, amount, is_free } = await req.json();

    console.log("Processing event ticket:", { event_id, user_id, is_free, attendees_count: attendees?.length });

    if (!event_id || !attendees || !Array.isArray(attendees) || attendees.length === 0) {
      throw new Error("Missing required fields: event_id and attendees");
    }

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from("business_events")
      .select("*")
      .eq("id", event_id)
      .single();

    if (eventError || !event) {
      throw new Error("Event not found");
    }

    // Check capacity
    const currentAttendees = event.attendees_count || 0;
    if (event.capacity && currentAttendees + attendees.length > event.capacity) {
      throw new Error("Not enough capacity for this number of tickets");
    }

    // Verify payment for paid events (if not free)
    if (!is_free && event.price && event.price > 0) {
      if (!payment_reference) {
        throw new Error("Payment reference required for paid events");
      }

      if (!paystackSecretKey) {
        throw new Error("Payment processing not configured");
      }

      // Verify with Paystack
      const verifyResponse = await fetch(
        `https://api.paystack.co/transaction/verify/${payment_reference}`,
        {
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`,
          },
        }
      );

      const verifyData = await verifyResponse.json();

      if (!verifyData.status || verifyData.data.status !== "success") {
        throw new Error("Payment verification failed");
      }

      // Verify amount matches
      const expectedAmount = event.price * attendees.length * 100; // Convert to pesewas
      if (verifyData.data.amount < expectedAmount) {
        throw new Error("Payment amount mismatch");
      }
    }

    // Generate tickets for each attendee
    const tickets = [];
    for (const attendee of attendees as Attendee[]) {
      // Generate unique ticket number
      const { data: ticketNumber } = await supabase.rpc("generate_ticket_number");

      // Generate simple QR code data (ticket number + event id)
      const qrData = JSON.stringify({
        ticket: ticketNumber,
        event: event_id,
        attendee: attendee.email,
      });

      // Create ticket record
      const { data: ticket, error: ticketError } = await supabase
        .from("event_tickets")
        .insert({
          event_id,
          user_id: user_id || null,
          ticket_number: ticketNumber,
          ticket_type: "regular",
          price_paid: is_free ? 0 : (event.price || 0),
          payment_reference: payment_reference || null,
          payment_status: "paid",
          qr_code: qrData,
          attendee_name: attendee.name,
          attendee_email: attendee.email,
        })
        .select()
        .single();

      if (ticketError) {
        console.error("Error creating ticket:", ticketError);
        throw new Error(`Failed to create ticket: ${ticketError.message}`);
      }

      tickets.push(ticket);
    }

    // Update event attendees count
    const { error: updateError } = await supabase
      .from("business_events")
      .update({
        attendees_count: currentAttendees + attendees.length,
      })
      .eq("id", event_id);

    if (updateError) {
      console.error("Error updating attendees count:", updateError);
    }

    console.log(`Successfully created ${tickets.length} tickets for event ${event_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        tickets,
        message: `Successfully created ${tickets.length} ticket(s)`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error processing event ticket:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
