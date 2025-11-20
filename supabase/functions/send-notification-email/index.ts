import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import React from 'npm:react@18.3.1';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { NewMessageEmail } from './_templates/new-message.tsx';
import { ClaimApprovedEmail } from './_templates/claim-approved.tsx';
import { ClaimRejectedEmail } from './_templates/claim-rejected.tsx';
import { AdStatusUpdateEmail } from './_templates/ad-status-update.tsx';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, to, data } = await req.json();

    let html: string;
    let subject: string;

    switch (type) {
      case 'new_message':
        html = await renderAsync(React.createElement(NewMessageEmail, data));
        subject = `New message from ${data.sender_name}`;
        break;
      
      case 'claim_approved':
        html = await renderAsync(React.createElement(ClaimApprovedEmail, data));
        subject = 'Your business claim has been approved!';
        break;
      
      case 'claim_rejected':
        html = await renderAsync(React.createElement(ClaimRejectedEmail, data));
        subject = 'Update on your business claim';
        break;
      
      case 'ad_status_update':
        html = await renderAsync(React.createElement(AdStatusUpdateEmail, data));
        subject = `Advertisement status updated: ${data.new_status}`;
        break;
      
      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    const { error } = await resend.emails.send({
      from: "Ghana Business Directory <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    });

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
