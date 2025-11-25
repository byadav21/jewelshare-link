import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface NotificationRequest {
  inquiry_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { inquiry_id }: NotificationRequest = await req.json();

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

    // Send email notification
    const emailResponse = await resend.emails.send({
      from: "Jewelry Platform <onboarding@resend.dev>",
      to: [vendorProfile.email],
      subject: `New Purchase Inquiry: ${inquiry.products.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Purchase Inquiry Received</h2>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #555;">Product Details</h3>
            <p><strong>Product:</strong> ${inquiry.products.name}</p>
            ${inquiry.products.sku ? `<p><strong>SKU:</strong> ${inquiry.products.sku}</p>` : ""}
            <p><strong>Quantity:</strong> ${inquiry.quantity}</p>
            <p><strong>Unit Price:</strong> ₹${inquiry.products.retail_price.toLocaleString("en-IN")}</p>
            <p><strong>Total Value:</strong> ₹${(inquiry.products.retail_price * inquiry.quantity).toLocaleString("en-IN")}</p>
          </div>

          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #555;">Customer Information</h3>
            <p><strong>Name:</strong> ${inquiry.customer_name}</p>
            <p><strong>Email:</strong> ${inquiry.customer_email}</p>
            ${inquiry.customer_phone ? `<p><strong>Phone:</strong> ${inquiry.customer_phone}</p>` : ""}
            ${inquiry.message ? `<p><strong>Message:</strong><br/>${inquiry.message}</p>` : ""}
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
