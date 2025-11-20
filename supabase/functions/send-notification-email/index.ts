import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const getEmailContent = (type: string, data: any) => {
  switch (type) {
    case 'new_message':
      return {
        subject: `New message from ${data.sender_name}`,
        html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333;">New Message</h2>
              <p>Hi ${data.recipient_name},</p>
              <p>You have received a new message from <strong>${data.sender_name}</strong> regarding <strong>${data.business_name}</strong>:</p>
              <div style="background: #f4f4f4; padding: 16px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0;">${data.message_preview}</p>
              </div>
              <a href="${Deno.env.get('SUPABASE_URL')}/inbox" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">View Message</a>
              <p style="color: #898989; font-size: 12px; margin-top: 40px;">Ghana Business Directory - Connecting businesses across Ghana</p>
            </body>
          </html>
        `
      };
    
    case 'claim_approved':
      return {
        subject: 'Your business claim has been approved!',
        html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333;">🎉 Claim Approved!</h2>
              <p>Hi ${data.user_name},</p>
              <p>Great news! Your claim for <strong>${data.business_name}</strong> has been approved.</p>
              <p>You can now manage your business listing, respond to reviews, and purchase advertisements.</p>
              ${data.admin_notes ? `<div style="background: #f0f9ff; padding: 16px; border-radius: 5px; margin: 20px 0;"><p style="margin: 0;"><strong>Admin Note:</strong> ${data.admin_notes}</p></div>` : ''}
              <a href="${Deno.env.get('SUPABASE_URL')}/my-businesses" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Manage My Business</a>
              <p style="color: #898989; font-size: 12px; margin-top: 40px;">Ghana Business Directory - Connecting businesses across Ghana</p>
            </body>
          </html>
        `
      };
    
    case 'claim_rejected':
      return {
        subject: 'Update on your business claim',
        html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333;">Business Claim Update</h2>
              <p>Hi ${data.user_name},</p>
              <p>Thank you for your interest in claiming <strong>${data.business_name}</strong>.</p>
              <p>After reviewing your submission, we were unable to approve your claim at this time.</p>
              ${data.admin_notes ? `<div style="background: #fef2f2; padding: 16px; border-radius: 5px; margin: 20px 0;"><p style="margin: 0;"><strong>Reason:</strong> ${data.admin_notes}</p></div>` : ''}
              <p>If you believe this is an error or would like to provide additional information, please contact our support team.</p>
              <p style="color: #898989; font-size: 12px; margin-top: 40px;">Ghana Business Directory - Connecting businesses across Ghana</p>
            </body>
          </html>
        `
      };
    
    case 'ad_status_update':
      return {
        subject: `Advertisement status updated: ${data.new_status}`,
        html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333;">Advertisement Status Update</h2>
              <p>Hi ${data.user_name},</p>
              <p>The status of your advertisement <strong>"${data.ad_title}"</strong> for <strong>${data.business_name}</strong> has been updated.</p>
              <div style="background: #f4f4f4; padding: 16px; border-radius: 5px; margin: 20px 0; text-align: center;">
                <p style="margin: 0; font-size: 16px;">Status changed from <strong>${data.old_status}</strong> to <strong>${data.new_status}</strong></p>
              </div>
              ${data.new_status === 'active' ? '<p>Your advertisement is now live and visible to potential customers!</p>' : ''}
              ${data.new_status === 'expired' ? '<p>Your advertisement campaign has ended. You can create a new campaign to continue promoting your business.</p>' : ''}
              <a href="${Deno.env.get('SUPABASE_URL')}/my-businesses" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">View Advertisement</a>
              <p style="color: #898989; font-size: 12px; margin-top: 40px;">Ghana Business Directory - Connecting businesses across Ghana</p>
            </body>
          </html>
        `
      };
    
    default:
      throw new Error(`Unknown email type: ${type}`);
  }
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, to, data } = await req.json();
    const emailContent = getEmailContent(type, data);

    const { error } = await resend.emails.send({
      from: "Ghana Business Directory <onboarding@resend.dev>",
      to: [to],
      subject: emailContent.subject,
      html: emailContent.html,
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
