import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('send-lead-notification function invoked');
  console.log('Request method:', req.method);
  
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('Request body:', JSON.stringify(body));
    
    const { leadId } = body;

    if (!leadId) {
      console.error('Lead ID is missing from request');
      throw new Error('Lead ID is required');
    }

    console.log(`Processing notifications for lead ID: ${leadId}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      throw new Error('Server configuration error');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Get lead details
    console.log('Fetching lead details from database...');
    const { data: lead, error: leadError } = await supabaseClient
      .from('business_leads')
      .select('*, businesses(name, logo_url), lead_forms(name, notification_emails, success_message)')
      .eq('id', leadId)
      .single();

    if (leadError) {
      console.error('Failed to fetch lead:', leadError);
      throw leadError;
    }

    if (!lead) {
      console.error('Lead not found with ID:', leadId);
      throw new Error('Lead not found');
    }

    console.log('Lead found:', lead.name, lead.email);
    console.log('Business:', lead.businesses?.name);

    // Get business owner email
    console.log('Fetching business owner...');
    const { data: owner, error: ownerError } = await supabaseClient
      .from('business_owners')
      .select('user_id, profiles!inner(email, full_name)')
      .eq('business_id', lead.business_id)
      .eq('is_primary', true)
      .maybeSingle();

    if (ownerError) {
      console.error('Failed to fetch business owner:', ownerError);
    }

    const ownerProfile = owner?.profiles as any;
    const ownerEmail = ownerProfile?.email;
    const ownerName = ownerProfile?.full_name || 'Business Owner';

    console.log('Business owner:', ownerName, ownerEmail ? '(email found)' : '(no email)');

    // Send notification to business owner
    if (ownerEmail) {
      console.log('Sending notification to business owner...');
      try {
        const notifyResult = await supabaseClient.functions.invoke('send-notification-email', {
          body: {
            type: 'new_lead',
            to: ownerEmail,
            data: {
              owner_name: ownerName,
              business_name: lead.businesses?.name || 'Your Business',
              lead_name: lead.name,
              lead_email: lead.email,
              lead_phone: lead.phone || 'Not provided',
              lead_message: lead.message || 'No message',
              lead_source: lead.source || 'website',
              form_name: lead.lead_forms?.name || 'Contact Form',
              view_lead_url: `https://oxaghzctrjemldcezcqq.supabase.co/leads/${leadId}`
            }
          }
        });
        
        if (notifyResult.error) {
          console.error('Failed to send owner notification:', notifyResult.error);
        } else {
          console.log('Owner notification sent successfully');
        }
      } catch (emailError) {
        console.error('Exception sending owner notification:', emailError);
      }
    } else {
      console.log('No owner email found, skipping owner notification');
    }

    // Send to additional notification emails if configured
    if (lead.lead_forms?.notification_emails && lead.lead_forms.notification_emails.length > 0) {
      console.log('Sending to additional notification emails:', lead.lead_forms.notification_emails);
      for (const email of lead.lead_forms.notification_emails) {
        try {
          const result = await supabaseClient.functions.invoke('send-notification-email', {
            body: {
              type: 'new_lead',
              to: email,
              data: {
                owner_name: 'Team',
                business_name: lead.businesses?.name || 'Your Business',
                lead_name: lead.name,
                lead_email: lead.email,
                lead_phone: lead.phone || 'Not provided',
                lead_message: lead.message || 'No message',
                lead_source: lead.source || 'website',
                form_name: lead.lead_forms?.name || 'Contact Form',
                view_lead_url: `https://oxaghzctrjemldcezcqq.supabase.co/leads/${leadId}`
              }
            }
          });
          
          if (result.error) {
            console.error(`Failed to send notification to ${email}:`, result.error);
          } else {
            console.log(`Notification sent to ${email}`);
          }
        } catch (emailError) {
          console.error(`Exception sending notification to ${email}:`, emailError);
        }
      }
    }

    // Send thank you email to lead
    if (lead.email) {
      console.log('Sending thank you email to lead...');
      try {
        const thankYouResult = await supabaseClient.functions.invoke('send-notification-email', {
          body: {
            type: 'lead_thank_you',
            to: lead.email,
            data: {
              lead_name: lead.name,
              business_name: lead.businesses?.name || 'Our Business',
              success_message: lead.lead_forms?.success_message || 'Thank you for your interest! We will contact you soon.'
            }
          }
        });
        
        if (thankYouResult.error) {
          console.error('Failed to send thank you email:', thankYouResult.error);
        } else {
          console.log('Thank you email sent successfully');
        }
      } catch (emailError) {
        console.error('Exception sending thank you email:', emailError);
      }
    }

    console.log('Lead notification processing completed');

    return new Response(
      JSON.stringify({ success: true, message: 'Notifications processed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in send-lead-notification function:', error);
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
