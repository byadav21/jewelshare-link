import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;
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

interface ContactEmailRequest {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  inquiryType: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting check
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("x-real-ip") || 
                     "unknown";
    
    if (!checkRateLimit(clientIP)) {
      console.log(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { name, email, phone, subject, message, inquiryType }: ContactEmailRequest = await req.json();

    console.log("Processing contact form submission:", { name, email, subject, inquiryType });

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return new Response(
        JSON.stringify({ 
          error: "Email service not configured. Please contact support directly." 
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Sanitize all user inputs
    const safeName = htmlEncode(name);
    const safeEmail = htmlEncode(email);
    const safePhone = htmlEncode(phone);
    const safeSubject = htmlEncode(subject);
    const safeMessage = htmlEncode(message);
    const safeInquiryType = htmlEncode(inquiryType);

    // Send confirmation email to customer using Resend API
    const customerEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Jewelry Catalog <onboarding@resend.dev>",
        to: [email],
        subject: "We received your message!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a1a2e;">Thank you for contacting us, ${safeName}!</h1>
            <p style="color: #666; font-size: 16px;">We have received your message and will get back to you within 24 hours.</p>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #1a1a2e; margin-top: 0;">Your Message Details:</h2>
              <p><strong>Subject:</strong> ${safeSubject}</p>
              <p><strong>Inquiry Type:</strong> ${safeInquiryType}</p>
              ${safePhone ? `<p><strong>Phone:</strong> ${safePhone}</p>` : ''}
              <p><strong>Message:</strong></p>
              <p style="white-space: pre-wrap;">${safeMessage}</p>
            </div>
            
            <p style="color: #666;">If you have any urgent questions, please don't hesitate to call us at +1 (234) 567-890.</p>
            
            <p style="color: #666;">Best regards,<br>The Jewelry Catalog Team</p>
          </div>
        `,
      }),
    });

    if (!customerEmailResponse.ok) {
      const error = await customerEmailResponse.text();
      console.error("Failed to send customer email:", error);
      throw new Error("Failed to send confirmation email");
    }

    // Send notification email to support team
    const supportEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Jewelry Catalog <onboarding@resend.dev>",
        to: ["support@jewelrycatalog.com"],
        subject: `New Contact Form: ${safeInquiryType} - ${safeSubject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a1a2e;">New Contact Form Submission</h1>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #1a1a2e; margin-top: 0;">Contact Details:</h2>
              <p><strong>Name:</strong> ${safeName}</p>
              <p><strong>Email:</strong> ${safeEmail}</p>
              ${safePhone ? `<p><strong>Phone:</strong> ${safePhone}</p>` : ''}
              <p><strong>Inquiry Type:</strong> ${safeInquiryType}</p>
              <p><strong>Subject:</strong> ${safeSubject}</p>
            </div>
            
            <div style="background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
              <h3 style="color: #1a1a2e; margin-top: 0;">Message:</h3>
              <p style="white-space: pre-wrap;">${safeMessage}</p>
            </div>
          </div>
        `,
      }),
    });

    console.log("Emails sent successfully");

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Contact form submitted successfully. Confirmation email sent." 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Failed to send email. Please try again or contact support directly."
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
