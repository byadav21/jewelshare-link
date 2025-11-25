import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per minute per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitMap.entries()) {
    if (data.resetTime < now) {
      rateLimitMap.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW_MS);

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const rateLimitData = rateLimitMap.get(ip);

  if (!rateLimitData || rateLimitData.resetTime < now) {
    // New window or expired window
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  if (rateLimitData.count >= MAX_REQUESTS_PER_WINDOW) {
    return false; // Rate limit exceeded
  }

  rateLimitData.count++;
  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
                     req.headers.get("x-real-ip") || 
                     "unknown";

    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Retry-After": "60"
          }
        }
      );
    }

    const { shareToken } = await req.json();

    // Log request without exposing sensitive token
    console.log(`Catalog request from IP: ${clientIP}`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get share link details
    const { data: shareLink, error: shareLinkError } = await supabase
      .from("share_links")
      .select("*")
      .eq("share_token", shareToken)
      .eq("is_active", true)
      .single();

    // Use generic error message to avoid information leakage
    if (shareLinkError || !shareLink) {
      console.error("Invalid share link attempt");
      return new Response(
        JSON.stringify({ error: "Invalid or expired share link" }),
        { 
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Check if link is expired - use same generic message
    if (new Date(shareLink.expires_at) < new Date()) {
      console.log("Expired share link attempt");
      return new Response(
        JSON.stringify({ error: "Invalid or expired share link" }),
        { 
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Always use the share link creator's products
    const productOwnerId = shareLink.user_id;

    // Fetch vendor profile and products in parallel for better performance
    const [vendorProfileResult, productsResult] = await Promise.all([
      supabase
        .from("vendor_profiles")
        .select("*")
        .eq("user_id", productOwnerId)
        .maybeSingle(),
      supabase
        .from("products")
        .select("*")
        .eq("user_id", productOwnerId)
        .is("deleted_at", null)
    ]);

    const { data: vendorProfile } = vendorProfileResult;
    const { data: products, error: productsError } = productsResult;

    if (productsError) {
      console.error("Error fetching products:", productsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch products" }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Filter products by selected categories
    const filteredProducts = products.filter(product => 
      shareLink.shared_categories?.includes(product.product_type)
    );

    // Calculate adjusted prices
    const adjustedProducts = filteredProducts.map(product => {
      let adjustedPrice = product.retail_price;
      
      if (shareLink.markup_percentage > 0) {
        adjustedPrice = product.retail_price * (1 + shareLink.markup_percentage / 100);
      } else if (shareLink.markdown_percentage > 0) {
        adjustedPrice = product.retail_price * (1 - shareLink.markdown_percentage / 100);
      }

      return {
        ...product,
        displayed_price: Math.round(adjustedPrice * 100) / 100,
        user_id: undefined, // Remove sensitive data
        cost_price: undefined, // Hide cost from shared view
      };
    });

    // Increment view count asynchronously (fire and forget for better performance)
    supabase
      .from("share_links")
      .update({ view_count: shareLink.view_count + 1 })
      .eq("id", shareLink.id)
      .then(({ error }) => {
        if (error) console.error("Failed to update view count:", error);
        else console.log("View count updated");
      });

    console.log(`Returning catalog with ${adjustedProducts.length} products to ${clientIP}`);

    return new Response(
      JSON.stringify({ 
        products: adjustedProducts, 
        shareLinkId: shareLink.id,
        shareLink: {
          id: shareLink.id,
          show_vendor_details: shareLink.show_vendor_details,
          markup_percentage: shareLink.markup_percentage,
          markdown_percentage: shareLink.markdown_percentage,
          expires_at: shareLink.expires_at,
          view_count: shareLink.view_count,
          shared_categories: shareLink.shared_categories,
        },
        vendorProfile 
      }),
      {
        status: 200,
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=60, stale-while-revalidate=300"
        }
      }
    );
  } catch (error) {
    console.error("Error in get-shared-catalog:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});