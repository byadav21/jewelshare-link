import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Calculate timestamp for 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    console.log("Checking for pending inquiries older than:", twentyFourHoursAgo.toISOString());

    // Find all pending inquiries older than 24 hours
    const { data: pendingInquiries, error: inquiriesError } = await supabaseClient
      .from("purchase_inquiries")
      .select(`
        *,
        products (name, retail_price, sku),
        share_links (user_id)
      `)
      .eq("status", "pending")
      .lt("created_at", twentyFourHoursAgo.toISOString());

    if (inquiriesError) {
      throw inquiriesError;
    }

    if (!pendingInquiries || pendingInquiries.length === 0) {
      console.log("No pending inquiries found older than 24 hours");
      return new Response(
        JSON.stringify({ message: "No pending inquiries to process", count: 0 }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Found ${pendingInquiries.length} pending inquiries to process`);

    // Group inquiries by vendor
    const inquiriesByVendor = new Map<string, typeof pendingInquiries>();
    for (const inquiry of pendingInquiries) {
      const vendorId = inquiry.share_links.user_id;
      if (!inquiriesByVendor.has(vendorId)) {
        inquiriesByVendor.set(vendorId, []);
      }
      inquiriesByVendor.get(vendorId)?.push(inquiry);
    }

    const emailResults = [];

    // Send reminder email for each vendor
    for (const [vendorId, inquiries] of inquiriesByVendor.entries()) {
      try {
        // Fetch vendor profile
        const { data: vendorProfile, error: vendorError } = await supabaseClient
          .from("vendor_profiles")
          .select("business_name, email")
          .eq("user_id", vendorId)
          .single();

        if (vendorError || !vendorProfile || !vendorProfile.email) {
          console.log(`No email found for vendor ${vendorId}, skipping`);
          continue;
        }

        // Build inquiry list HTML
        const inquiryListHtml = inquiries
          .map(
            (inquiry) => `
          <div style="background: #f9f9f9; padding: 15px; border-radius: 6px; margin-bottom: 15px; border-left: 4px solid #ff6b6b;">
            <p style="margin: 0 0 8px 0;"><strong>Product:</strong> ${inquiry.products.name}</p>
            ${inquiry.products.sku ? `<p style="margin: 0 0 8px 0;"><strong>SKU:</strong> ${inquiry.products.sku}</p>` : ""}
            <p style="margin: 0 0 8px 0;"><strong>Customer:</strong> ${inquiry.customer_name} (${inquiry.customer_email})</p>
            <p style="margin: 0 0 8px 0;"><strong>Quantity:</strong> ${inquiry.quantity}</p>
            <p style="margin: 0 0 8px 0;"><strong>Value:</strong> ₹${(inquiry.products.retail_price * inquiry.quantity).toLocaleString("en-IN")}</p>
            <p style="margin: 0; color: #666; font-size: 13px;"><strong>Submitted:</strong> ${new Date(inquiry.created_at).toLocaleString()}</p>
          </div>
        `
          )
          .join("");

        const totalValue = inquiries.reduce(
          (sum, inquiry) => sum + inquiry.products.retail_price * inquiry.quantity,
          0
        );

        // Send reminder email
        const emailResponse = await resend.emails.send({
          from: "Jewelry Platform <onboarding@resend.dev>",
          to: [vendorProfile.email],
          subject: `⏰ Reminder: ${inquiries.length} Pending Purchase ${inquiries.length === 1 ? "Inquiry" : "Inquiries"}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px 8px 0 0;">
                <h2 style="color: white; margin: 0;">⏰ Pending Purchase Inquiries Reminder</h2>
              </div>

              <div style="padding: 30px; background: white; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
                <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                  Hi ${vendorProfile.business_name || "there"},
                </p>

                <p style="color: #666; margin-bottom: 20px;">
                  You have <strong>${inquiries.length}</strong> purchase ${inquiries.length === 1 ? "inquiry" : "inquiries"} that ${inquiries.length === 1 ? "has" : "have"} been pending for more than 24 hours. 
                  These customers are waiting for your response!
                </p>

                <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 25px; border-radius: 4px;">
                  <p style="margin: 0; color: #856404;">
                    <strong>⚡ Quick Stats:</strong><br/>
                    Total Inquiries: ${inquiries.length}<br/>
                    Total Potential Value: ₹${totalValue.toLocaleString("en-IN")}
                  </p>
                </div>

                <h3 style="color: #333; margin-top: 30px; margin-bottom: 15px;">Pending Inquiries:</h3>
                ${inquiryListHtml}

                <div style="margin-top: 30px; padding: 20px; background: #f5f5f5; border-radius: 8px; text-align: center;">
                  <p style="margin: 0 0 15px 0; color: #666;">
                    Please log in to your dashboard to respond to these inquiries and provide excellent customer service.
                  </p>
                </div>

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                  <p style="color: #999; font-size: 12px; margin: 0;">
                    This is an automated reminder from your Jewelry Platform account. You're receiving this because you have pending purchase inquiries that need attention.
                  </p>
                </div>
              </div>
            </div>
          `,
        });

        emailResults.push({
          vendor_id: vendorId,
          email: vendorProfile.email,
          inquiries_count: inquiries.length,
          email_id: emailResponse.data?.id,
          success: true,
        });

        console.log(`Reminder sent to ${vendorProfile.email} for ${inquiries.length} inquiries`);
      } catch (error: any) {
        console.error(`Error sending reminder to vendor ${vendorId}:`, error);
        emailResults.push({
          vendor_id: vendorId,
          success: false,
          error: error.message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: "Reminders processed",
        total_inquiries: pendingInquiries.length,
        vendors_notified: emailResults.filter((r) => r.success).length,
        results: emailResults,
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
    console.error("Error in check-pending-inquiries:", error);
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
