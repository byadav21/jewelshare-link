import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // 10 emails per minute per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  record.count++;
  return true;
}

// HTML encode user inputs to prevent injection
function htmlEncode(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

interface OrderStatusNotification {
  estimateId: string;
  customerName: string;
  customerEmail: string;
  status: string;
  estimatedCompletionDate?: string;
  shareToken: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting
  const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                   req.headers.get("x-real-ip") || 
                   "unknown";
  
  if (!checkRateLimit(clientIP)) {
    console.log(`Rate limit exceeded for IP: ${clientIP}`);
    return new Response(
      JSON.stringify({ error: "Too many requests. Please try again later." }),
      { 
        status: 429, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }

  try {
    const { estimateId, customerName, customerEmail, status, estimatedCompletionDate, shareToken }: OrderStatusNotification = await req.json();
    
    console.log('Sending order status notification:', { estimateId, customerEmail, status });

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    // Sanitize user inputs
    const safeCustomerName = htmlEncode(customerName);
    const safeShareToken = encodeURIComponent(shareToken || '');

    // Generate tracking URL
    const trackingUrl = `${req.headers.get('origin') || 'https://your-domain.com'}/order-tracking/${safeShareToken}`;

    // Status-specific email content
    const statusMessages: Record<string, { subject: string; message: string; color: string }> = {
      'draft': {
        subject: 'Order Draft Created',
        message: 'Your jewelry manufacturing order draft has been created. We are preparing your quote.',
        color: '#6B7280'
      },
      'quoted': {
        subject: 'Quote Ready for Your Jewelry Order',
        message: 'Your jewelry manufacturing quote is ready for review. Please check the details and let us know if you approve.',
        color: '#3B82F6'
      },
      'approved': {
        subject: 'Order Approved - Production Starting Soon',
        message: 'Thank you for approving your jewelry order! We will begin production shortly.',
        color: '#10B981'
      },
      'in_production': {
        subject: 'Your Jewelry is Being Crafted',
        message: 'Exciting news! Your jewelry is now in production. Our artisans are carefully crafting your piece.',
        color: '#F59E0B'
      },
      'completed': {
        subject: 'Your Jewelry Order is Complete',
        message: 'Great news! Your jewelry order has been completed and is ready for delivery.',
        color: '#059669'
      }
    };

    const statusInfo = statusMessages[status.toLowerCase()] || statusMessages['draft'];
    
    const completionDateText = estimatedCompletionDate 
      ? `<p style="margin: 16px 0; color: #4B5563;"><strong>Estimated Completion:</strong> ${new Date(estimatedCompletionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>`
      : '';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F3F4F6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F3F4F6; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; border-radius: 8px 8px 0 0; text-align: center;">
                      <h1 style="margin: 0; color: #FFFFFF; font-size: 28px; font-weight: 600;">Order Status Update</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px 0; color: #111827; font-size: 16px;">Hello ${safeCustomerName},</p>
                      
                      <div style="background-color: ${statusInfo.color}15; border-left: 4px solid ${statusInfo.color}; padding: 16px; margin: 20px 0; border-radius: 4px;">
                        <p style="margin: 0; color: #111827; font-size: 16px; font-weight: 600;">${statusInfo.message}</p>
                      </div>
                      
                      <p style="margin: 20px 0; color: #4B5563; font-size: 14px;">
                        <strong>Current Status:</strong> 
                        <span style="background-color: ${statusInfo.color}; color: #FFFFFF; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 500; display: inline-block; margin-left: 8px;">
                          ${status.toUpperCase().replace('_', ' ')}
                        </span>
                      </p>
                      
                      ${completionDateText}
                      
                      <div style="margin: 30px 0; text-align: center;">
                        <a href="${trackingUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #FFFFFF; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                          Track Your Order
                        </a>
                      </div>
                      
                      <p style="margin: 20px 0 0 0; color: #6B7280; font-size: 14px; line-height: 1.6;">
                        You can track your order status anytime by clicking the button above or visiting your tracking page.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #F9FAFB; padding: 30px; border-radius: 0 0 8px 8px; border-top: 1px solid #E5E7EB;">
                      <p style="margin: 0; color: #6B7280; font-size: 13px; text-align: center; line-height: 1.6;">
                        Thank you for choosing us for your jewelry manufacturing needs.<br>
                        If you have any questions, please don't hesitate to contact us.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Order Updates <onboarding@resend.dev>',
        to: [customerEmail],
        subject: statusInfo.subject,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend API error:', error);
      throw new Error(`Failed to send email: ${error}`);
    }

    const data = await response.json();
    console.log('Email sent successfully:', data);

    return new Response(
      JSON.stringify({ success: true, emailId: data.id }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error sending order status notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

serve(handler);
