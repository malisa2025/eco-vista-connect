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
    const { leadId } = await req.json();

    if (!leadId) {
      throw new Error('Lead ID is required');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`Sending notifications for lead ${leadId}`);

    // Get lead details
    const { data: lead, error: leadError } = await supabaseClient
      .from('business_leads')
      .select('*, businesses(name, logo_url), lead_forms(name, notification_emails)')
      .eq('id', leadId)
      .single();

    if (leadError) throw leadError;

    // Get business owner email
    const { data: owner } = await supabaseClient
      .from('business_owners')
      .select('user_id, profiles!inner(email, full_name)')
      .eq('business_id', lead.business_id)
      .eq('is_primary', true)
      .single();

    const ownerProfile = owner?.profiles as any;
    const ownerEmail = ownerProfile?.email;
    const ownerName = ownerProfile?.full_name || 'Business Owner';

    // Send notification to business owner
    if (ownerEmail) {
      await supabaseClient.functions.invoke('send-notification-email', {
        body: {
          type: 'new_lead',
          to: ownerEmail,
          data: {
            owner_name: ownerName,
            business_name: lead.businesses.name,
            lead_name: lead.name,
            lead_email: lead.email,
            lead_phone: lead.phone || 'Not provided',
            lead_message: lead.message || 'No message',
            lead_source: lead.source,
            form_name: lead.lead_forms?.name || 'Contact Form',
            view_lead_url: `https://oxaghzctrjemldcezcqq.supabase.co/leads/${leadId}`
          }
        }
      });
    }

    // Send to additional notification emails if configured
    if (lead.lead_forms?.notification_emails) {
      for (const email of lead.lead_forms.notification_emails) {
        await supabaseClient.functions.invoke('send-notification-email', {
          body: {
            type: 'new_lead',
            to: email,
            data: {
              owner_name: 'Team',
              business_name: lead.businesses.name,
              lead_name: lead.name,
              lead_email: lead.email,
              lead_phone: lead.phone || 'Not provided',
              lead_message: lead.message || 'No message',
              lead_source: lead.source,
              form_name: lead.lead_forms?.name || 'Contact Form',
              view_lead_url: `https://oxaghzctrjemldcezcqq.supabase.co/leads/${leadId}`
            }
          }
        });
      }
    }

    // Send thank you email to lead
    await supabaseClient.functions.invoke('send-notification-email', {
      body: {
        type: 'lead_thank_you',
        to: lead.email,
        data: {
          lead_name: lead.name,
          business_name: lead.businesses.name,
          success_message: lead.lead_forms?.success_message || 'Thank you for your interest! We will contact you soon.'
        }
      }
    });

    console.log('Lead notifications sent successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'Notifications sent' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error sending lead notifications:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});