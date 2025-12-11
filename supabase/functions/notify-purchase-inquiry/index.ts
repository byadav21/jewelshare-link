import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-internal-secret",
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

/**
 * Validates internal API calls using HMAC signature
 * Uses SUPABASE_SERVICE_ROLE_KEY as the shared secret
 */
function validateInternalRequest(req: Request): boolean {
  const internalSecret = req.headers.get("x-internal-secret");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!internalSecret || !serviceRoleKey) {
    return false;
  }
  
  // Constant-time comparison to prevent timing attacks
  if (internalSecret.length !== serviceRoleKey.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < internalSecret.length; i++) {
    result |= internalSecret.charCodeAt(i) ^ serviceRoleKey.charCodeAt(i);
  }
  
  return result === 0;
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface NotificationRequest {
  inquiry_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate internal API request
  if (!validateInternalRequest(req)) {
    console.log("Unauthorized: Invalid or missing internal secret");
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { 
        status: 401, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { inquiry_id }: NotificationRequest = await req.json();

    console.log("Processing purchase inquiry notification for:", inquiry_id);

    // Fetch inquiry details with related product and vendor info
    const { data: inquiry, error: inquiryError } = await supabaseClient
      .from("purchase_inquiries")
      .select(`
        *,
        products (name, retail_price, sku),
        share_links (user_id)
      `)
      .eq("id", inquiry_id)
      .single();

    if (inquiryError || !inquiry) {
      throw new Error("Inquiry not found");
    }

    // Fetch vendor profile to get email
    const { data: vendorProfile, error: vendorError } = await supabaseClient
      .from("vendor_profiles")
      .select("business_name, email")
      .eq("user_id", inquiry.share_links.user_id)
      .single();

    if (vendorError || !vendorProfile || !vendorProfile.email) {
      console.log("No vendor email found, skipping notification");
      return new Response(
        JSON.stringify({ message: "No vendor email configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize all user inputs
    const safeProductName = htmlEncode(inquiry.products?.name);
    const safeProductSku = htmlEncode(inquiry.products?.sku);
    const safeCustomerName = htmlEncode(inquiry.customer_name);
    const safeCustomerEmail = htmlEncode(inquiry.customer_email);
    const safeCustomerPhone = htmlEncode(inquiry.customer_phone);
    const safeMessage = htmlEncode(inquiry.message);

    // Send email notification
    const emailResponse = await resend.emails.send({
      from: "Jewelry Platform <onboarding@resend.dev>",
      to: [vendorProfile.email],
      subject: `New Purchase Inquiry: ${safeProductName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Purchase Inquiry Received</h2>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #555;">Product Details</h3>
            <p><strong>Product:</strong> ${safeProductName}</p>
            ${safeProductSku ? `<p><strong>SKU:</strong> ${safeProductSku}</p>` : ""}
            <p><strong>Quantity:</strong> ${inquiry.quantity}</p>
            <p><strong>Unit Price:</strong> Rs.${inquiry.products?.retail_price?.toLocaleString("en-IN") || 'N/A'}</p>
            <p><strong>Total Value:</strong> Rs.${((inquiry.products?.retail_price || 0) * inquiry.quantity).toLocaleString("en-IN")}</p>
          </div>

          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #555;">Customer Information</h3>
            <p><strong>Name:</strong> ${safeCustomerName}</p>
            <p><strong>Email:</strong> ${safeCustomerEmail}</p>
            ${safeCustomerPhone ? `<p><strong>Phone:</strong> ${safeCustomerPhone}</p>` : ""}
            ${safeMessage ? `<p><strong>Message:</strong><br/>${safeMessage}</p>` : ""}
          </div>

          <p style="color: #666; margin-top: 30px;">
            Please respond to this inquiry as soon as possible to provide excellent customer service.
          </p>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #999; font-size: 12px;">
              This is an automated notification from your Jewelry Platform account.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, email_id: emailResponse.data?.id }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
