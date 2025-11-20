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
              <p>The status of your advertisement "<strong>${data.ad_title}</strong>" for <strong>${data.business_name}</strong> has been updated.</p>
              <div style="background: #f4f4f4; padding: 16px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 8px 0;"><strong>Previous Status:</strong> ${data.old_status}</p>
                <p style="margin: 8px 0;"><strong>New Status:</strong> ${data.new_status}</p>
              </div>
              <a href="${Deno.env.get('SUPABASE_URL')}/my-businesses" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">View Details</a>
              <p style="color: #898989; font-size: 12px; margin-top: 40px;">Ghana Business Directory - Connecting businesses across Ghana</p>
            </body>
          </html>
        `
      };
    
    case 'expiring_soon':
      return {
        subject: `Your ad expires soon: ${data.ad_title}`,
        html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333;">⏰ Advertisement Expiring Soon</h2>
              <p>Hi ${data.user_name},</p>
              <p>Your advertisement "<strong>${data.ad_title}</strong>" will expire in <strong>${data.days_remaining} days</strong>.</p>
              <div style="background: #f4f4f4; padding: 16px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 8px 0; font-weight: bold;">Current Performance:</p>
                <p style="margin: 4px 0;">Impressions: ${data.impressions}</p>
                <p style="margin: 4px 0;">Clicks: ${data.clicks}</p>
                <p style="margin: 4px 0;">CTR: ${data.ctr}%</p>
              </div>
              <p>Would you like to extend your campaign?</p>
              <a href="${Deno.env.get('SUPABASE_URL')}/my-businesses" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Manage Ad</a>
              <p style="color: #898989; font-size: 12px; margin-top: 40px;">Ghana Business Directory - Connecting businesses across Ghana</p>
            </body>
          </html>
        `
      };
    
    case 'low_performance':
      return {
        subject: `Performance tip for your ad: ${data.ad_title}`,
        html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333;">💡 Ad Performance Tips</h2>
              <p>Hi ${data.user_name},</p>
              <p>We noticed your advertisement "<strong>${data.ad_title}</strong>" has a CTR of ${data.ctr}%.</p>
              <div style="background: #fef3c7; padding: 16px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 8px 0; font-weight: bold;">Tips to improve performance:</p>
                <ul style="margin: 8px 0;">
                  <li>Try a more compelling headline</li>
                  <li>Use a high-quality, eye-catching image</li>
                  <li>Ensure your target audience matches the ad placement</li>
                  <li>Test different call-to-action text</li>
                </ul>
              </div>
              <a href="${Deno.env.get('SUPABASE_URL')}/my-businesses" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Edit Ad</a>
              <p style="color: #898989; font-size: 12px; margin-top: 40px;">Ghana Business Directory - Connecting businesses across Ghana</p>
            </body>
          </html>
        `
      };

    case 'job_application_received':
      return {
        subject: `New application for ${data.job_title}`,
        html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333;">📝 New Job Application</h2>
              <p>Hi ${data.employer_name},</p>
              <p>You have received a new application for <strong>${data.job_title}</strong>.</p>
              <div style="background: #f4f4f4; padding: 16px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 4px 0;"><strong>Applicant:</strong> ${data.applicant_name}</p>
                <p style="margin: 4px 0;"><strong>Applied:</strong> ${data.applied_date}</p>
                ${data.has_video ? '<p style="margin: 4px 0;">📹 This applicant included a video submission.</p>' : ''}
              </div>
              <a href="${Deno.env.get('SUPABASE_URL')}/jobs/applications/${data.job_id}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">View Application</a>
              <p style="color: #898989; font-size: 12px; margin-top: 40px;">Ghana Business Directory - Connecting businesses across Ghana</p>
            </body>
          </html>
        `
      };

    case 'application_status_update':
      return {
        subject: `Update on your application for ${data.job_title}`,
        html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333;">Application Status Update</h2>
              <p>Hi ${data.applicant_name},</p>
              <p>There's an update on your application for <strong>${data.job_title}</strong> at <strong>${data.company_name}</strong>.</p>
              <div style="background: ${data.status === 'shortlisted' ? '#d1fae5' : '#f4f4f4'}; padding: 16px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 8px 0;"><strong>Status:</strong> ${data.status.toUpperCase()}</p>
                ${data.notes ? `<p style="margin: 8px 0;"><strong>Notes from employer:</strong> ${data.notes}</p>` : ''}
                ${data.status === 'shortlisted' ? '<p style="margin: 8px 0;">🎉 Congratulations! The employer is interested in your profile.</p>' : ''}
              </div>
              <a href="${Deno.env.get('SUPABASE_URL')}/my-applications" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">View Application</a>
              <p style="color: #898989; font-size: 12px; margin-top: 40px;">Ghana Business Directory - Connecting businesses across Ghana</p>
            </body>
          </html>
        `
      };

    case 'job_expires_soon':
      return {
        subject: `Your job posting expires in ${data.days_remaining} days`,
        html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333;">⏰ Job Posting Expiring Soon</h2>
              <p>Hi ${data.employer_name},</p>
              <p>Your job posting for <strong>${data.job_title}</strong> will expire in <strong>${data.days_remaining} days</strong>.</p>
              <div style="background: #f4f4f4; padding: 16px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 4px 0;"><strong>Current applications:</strong> ${data.applications_count}</p>
              </div>
              <p>Would you like to extend the posting to reach more candidates?</p>
              <a href="${Deno.env.get('SUPABASE_URL')}/jobs/edit/${data.job_id}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Extend Posting</a>
              <p style="color: #898989; font-size: 12px; margin-top: 40px;">Ghana Business Directory - Connecting businesses across Ghana</p>
            </body>
          </html>
        `
      };

    case 'subscription_expiring':
      return {
        subject: 'Your Job Seeker subscription expires soon',
        html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333;">⏰ Subscription Expiring Soon</h2>
              <p>Hi ${data.user_name},</p>
              <p>Your Job Seeker subscription will expire in <strong>${data.days_remaining} days</strong> (on ${data.expiry_date}).</p>
              <div style="background: #fef2f2; padding: 16px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 8px 0; font-weight: bold;">Benefits you'll lose:</p>
                <ul style="margin: 8px 0;">
                  <li>Apply to unlimited jobs</li>
                  <li>Profile visibility to employers</li>
                  <li>Application tracking</li>
                  <li>Email notifications</li>
                </ul>
              </div>
              <p>Renew now for only GHS 10/month</p>
              <a href="${Deno.env.get('SUPABASE_URL')}/subscribe" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Renew Subscription</a>
              <p style="color: #898989; font-size: 12px; margin-top: 40px;">Ghana Business Directory - Connecting businesses across Ghana</p>
            </body>
          </html>
        `
      };

    case 'subscription_activated':
      return {
        subject: 'Welcome to Job Seeker! Your subscription is active',
        html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333;">🎉 Welcome to Job Seeker!</h2>
              <p>Hi ${data.user_name},</p>
              <p>Your Job Seeker subscription has been successfully activated.</p>
              <div style="background: #d1fae5; padding: 16px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 8px 0; font-weight: bold;">Subscription details:</p>
                <p style="margin: 4px 0;">Amount: GHS ${data.amount}</p>
                <p style="margin: 4px 0;">Valid until: ${data.end_date}</p>
                <p style="margin: 4px 0;">Auto-renewal: Enabled</p>
              </div>
              <div style="background: #f4f4f4; padding: 16px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 8px 0; font-weight: bold;">What you can do now:</p>
                <ul style="margin: 8px 0;">
                  <li>✅ Apply to unlimited jobs</li>
                  <li>✅ Your profile is visible to employers</li>
                  <li>✅ Track all your applications</li>
                  <li>✅ Receive email notifications</li>
                </ul>
              </div>
              <a href="${Deno.env.get('SUPABASE_URL')}/jobs" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Browse Jobs</a>
              <p style="color: #898989; font-size: 12px; margin-top: 40px;">Ghana Business Directory - Connecting businesses across Ghana</p>
            </body>
          </html>
        `
      };

    case 'job_alert_digest':
      return {
        subject: `${data.jobs_count} new jobs match your alert: ${data.alert_name}`,
        html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333;">📬 New Jobs Matching Your Alert</h2>
              <p>Hi ${data.user_name},</p>
              <p>We found <strong>${data.jobs_count} new job${data.jobs_count > 1 ? 's' : ''}</strong> matching your alert "<strong>${data.alert_name}</strong>":</p>
              ${data.jobs.map((job: any) => `
                <div style="background: #f4f4f4; padding: 16px; border-radius: 5px; margin: 16px 0;">
                  <h3 style="margin: 0 0 8px 0; color: #333;">${job.title}</h3>
                  <p style="margin: 4px 0; color: #666;"><strong>${job.company}</strong></p>
                  <p style="margin: 4px 0; color: #666;">📍 ${job.location} • ${job.job_type}</p>
                  ${job.salary ? `<p style="margin: 4px 0; color: #666;">💰 ${job.salary}</p>` : ''}
                  <a href="${job.url}" style="background: #000; color: #fff; padding: 8px 16px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 8px;">View Job</a>
                </div>
              `).join('')}
              <p style="margin-top: 24px;">Keep your profile updated to stand out to employers!</p>
              <a href="${Deno.env.get('SUPABASE_URL')}/job-alerts" style="color: #2754C5; text-decoration: underline;">Manage your job alerts</a>
              <p style="color: #898989; font-size: 12px; margin-top: 40px;">Ghana Business Directory - Connecting businesses across Ghana</p>
            </body>
          </html>
        `
      };

    case 'interview_reminder':
      return {
        subject: `Interview Reminder: ${data.job_title} ${data.user_type === 'applicant' ? 'tomorrow' : 'with ' + data.applicant_name}`,
        html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333;">📅 Interview Reminder</h2>
              <p>Hi ${data.user_name},</p>
              <p>${data.user_type === 'applicant' ? 'Your interview is coming up!' : `You have an interview scheduled with ${data.applicant_name}.`}</p>
              <div style="background: #fef3c7; padding: 16px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 4px 0;"><strong>Position:</strong> ${data.job_title}</p>
                <p style="margin: 4px 0;"><strong>Company:</strong> ${data.company_name}</p>
                <p style="margin: 4px 0;"><strong>When:</strong> ${data.scheduled_time}</p>
                <p style="margin: 4px 0;"><strong>Duration:</strong> ${data.duration} minutes</p>
                <p style="margin: 4px 0;"><strong>Location:</strong> ${data.location}</p>
                ${data.meeting_link ? `<p style="margin: 4px 0;"><strong>Meeting Link:</strong> <a href="${data.meeting_link}">${data.meeting_link}</a></p>` : ''}
              </div>
              ${data.notes ? `<div style="background: #f4f4f4; padding: 16px; border-radius: 5px; margin: 20px 0;"><p style="margin: 0;"><strong>Notes:</strong> ${data.notes}</p></div>` : ''}
              ${data.user_type === 'applicant' ? `
                <div style="background: #d1fae5; padding: 16px; border-radius: 5px; margin: 20px 0;">
                  <p style="margin: 8px 0; font-weight: bold;">Preparation Tips:</p>
                  <ul style="margin: 8px 0;">
                    <li>Review the job description</li>
                    <li>Prepare examples of your work</li>
                    <li>Have questions ready for the interviewer</li>
                    <li>Test your tech setup if it's a video interview</li>
                  </ul>
                </div>
              ` : ''}
              <p style="color: #898989; font-size: 12px; margin-top: 40px;">Ghana Business Directory - Connecting businesses across Ghana</p>
            </body>
          </html>
        `
      };

    case 'hiring_digest':
      return {
        subject: `Weekly Hiring Digest for ${data.business_name}`,
        html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333;">📊 Your Weekly Hiring Summary</h2>
              <p>Hi ${data.employer_name},</p>
              <p>Here's what happened with your job postings at <strong>${data.business_name}</strong> this week:</p>
              
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 20px 0;">
                <div style="background: #d1fae5; padding: 16px; border-radius: 5px; text-align: center;">
                  <div style="font-size: 32px; font-weight: bold; color: #059669;">${data.new_applications}</div>
                  <div style="color: #666;">New Applications</div>
                </div>
                <div style="background: #fef3c7; padding: 16px; border-radius: 5px; text-align: center;">
                  <div style="font-size: 32px; font-weight: bold; color: #d97706;">${data.pending_review}</div>
                  <div style="color: #666;">Pending Review</div>
                </div>
                <div style="background: #dbeafe; padding: 16px; border-radius: 5px; text-align: center;">
                  <div style="font-size: 32px; font-weight: bold; color: #2563eb;">${data.shortlisted}</div>
                  <div style="color: #666;">Shortlisted</div>
                </div>
                <div style="background: #f3e8ff; padding: 16px; border-radius: 5px; text-align: center;">
                  <div style="font-size: 32px; font-weight: bold; color: #9333ea;">${data.quality_applicants}</div>
                  <div style="color: #666;">Quality Applicants</div>
                </div>
              </div>

              ${data.upcoming_interviews > 0 ? `
                <div style="background: #fef2f2; padding: 16px; border-radius: 5px; margin: 20px 0;">
                  <p style="margin: 0;"><strong>📅 ${data.upcoming_interviews} upcoming interview${data.upcoming_interviews > 1 ? 's' : ''}</strong></p>
                </div>
              ` : ''}

              <h3 style="color: #333; margin-top: 24px;">Jobs Performance</h3>
              ${data.jobs.map((job: any) => `
                <div style="background: #f4f4f4; padding: 12px; border-radius: 5px; margin: 12px 0;">
                  <p style="margin: 4px 0; font-weight: bold;">${job.title}</p>
                  <p style="margin: 4px 0; color: #666; font-size: 14px;">${job.new_applications} new • ${job.pending} pending review</p>
                </div>
              `).join('')}

              <a href="${Deno.env.get('SUPABASE_URL')}/hiring-pipeline" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">View Hiring Pipeline</a>
              <p style="color: #898989; font-size: 12px; margin-top: 40px;">Ghana Business Directory - Connecting businesses across Ghana</p>
            </body>
          </html>
        `
      };
    
    default:
      return {
        subject: 'Notification from Ghana Business Directory',
        html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333;">Notification</h2>
              <p>You have a new notification from Ghana Business Directory.</p>
              <p style="color: #898989; font-size: 12px; margin-top: 40px;">Ghana Business Directory - Connecting businesses across Ghana</p>
            </body>
          </html>
        `
      };
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
