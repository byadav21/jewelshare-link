import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NewsletterEmailRequest {
  blogPostTitle: string;
  blogPostExcerpt: string;
  blogPostSlug: string;
  blogPostImage: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { blogPostTitle, blogPostExcerpt, blogPostSlug, blogPostImage }: NewsletterEmailRequest = await req.json();

    // Get all active subscribers
    const { data: subscribers, error: fetchError } = await (globalThis as any).supabase
      .from("newsletter_subscribers")
      .select("email")
      .eq("is_active", true);

    if (fetchError) {
      throw new Error(`Failed to fetch subscribers: ${fetchError.message}`);
    }

    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active subscribers found" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const emails = subscribers.map((sub: { email: string }) => sub.email);
    const blogUrl = `${Deno.env.get("SUPABASE_URL")}/blog/${blogPostSlug}`;

    // Send email to all subscribers
    const emailResponse = await resend.emails.send({
      from: "JewelCatalog Pro <onboarding@resend.dev>",
      to: emails,
      subject: `New Article: ${blogPostTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%);
                color: white;
                padding: 30px 20px;
                text-align: center;
                border-radius: 8px 8px 0 0;
              }
              .content {
                background: #fff;
                padding: 30px 20px;
                border: 1px solid #e0e0e0;
                border-top: none;
              }
              .blog-image {
                width: 100%;
                height: auto;
                border-radius: 8px;
                margin: 20px 0;
              }
              .button {
                display: inline-block;
                padding: 12px 30px;
                background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%);
                color: white;
                text-decoration: none;
                border-radius: 6px;
                margin: 20px 0;
                font-weight: 600;
              }
              .footer {
                background: #f5f5f5;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #666;
                border-radius: 0 0 8px 8px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0;">📰 New Blog Post</h1>
            </div>
            <div class="content">
              <h2>${blogPostTitle}</h2>
              ${blogPostImage ? `<img src="${blogPostImage}" alt="${blogPostTitle}" class="blog-image" />` : ''}
              <p>${blogPostExcerpt}</p>
              <a href="${blogUrl}" class="button">Read Full Article →</a>
            </div>
            <div class="footer">
              <p>You're receiving this email because you subscribed to JewelCatalog Pro updates.</p>
              <p>
                <a href="${Deno.env.get("SUPABASE_URL")}" style="color: #666;">Visit Website</a> | 
                <a href="#" style="color: #666;">Unsubscribe</a>
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Newsletter sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        message: "Newsletter sent successfully",
        subscriberCount: emails.length,
        emailResponse 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-newsletter function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);