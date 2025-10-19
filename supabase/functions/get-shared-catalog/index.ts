import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { shareToken } = await req.json();

    console.log("Fetching shared catalog for token:", shareToken);

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

    if (shareLinkError || !shareLink) {
      console.error("Share link not found:", shareLinkError);
      return new Response(
        JSON.stringify({ error: "Share link not found or expired" }),
        { 
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Check if link is expired
    if (new Date(shareLink.expires_at) < new Date()) {
      console.log("Share link expired");
      return new Response(
        JSON.stringify({ error: "Share link has expired" }),
        { 
          status: 410,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Get products for this user
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", shareLink.user_id);

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

    // Calculate adjusted prices
    const adjustedProducts = products.map(product => {
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

    // Increment view count
    await supabase
      .from("share_links")
      .update({ view_count: shareLink.view_count + 1 })
      .eq("id", shareLink.id);

    console.log(`Returning ${adjustedProducts.length} products`);

    return new Response(
      JSON.stringify({ products: adjustedProducts, shareLink }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
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