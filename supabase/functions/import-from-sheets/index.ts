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
    const { spreadsheetId, range } = await req.json();
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Auth error:", userError);
      throw new Error("Unauthorized");
    }

    const apiKey = Deno.env.get("GOOGLE_SHEETS_API_KEY");
    if (!apiKey) {
      throw new Error("Google Sheets API key not configured");
    }

    console.log("Fetching data from Google Sheets:", spreadsheetId, range);

    // Fetch data from Google Sheets API
    const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
    const response = await fetch(sheetsUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Sheets API error:", response.status, errorText);
      throw new Error(`Failed to fetch sheet data: ${response.statusText}`);
    }

    const data = await response.json();
    const rows = data.values;

    if (!rows || rows.length === 0) {
      return new Response(
        JSON.stringify({ error: "No data found in sheet" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Assuming first row is headers
    const headers = rows[0];
    const products = [];

    // Parse rows into product objects
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const product: any = { user_id: user.id };

      // Map columns to product fields
      headers.forEach((header: string, index: number) => {
        const value = row[index];
        const lowerHeader = header.toLowerCase().trim();

        if (lowerHeader.includes('name') || lowerHeader === 'product') {
          product.name = value;
        } else if (lowerHeader.includes('description')) {
          product.description = value;
        } else if (lowerHeader.includes('sku')) {
          product.sku = value;
        } else if (lowerHeader.includes('category')) {
          product.category = value;
        } else if (lowerHeader.includes('metal')) {
          product.metal_type = value;
        } else if (lowerHeader.includes('gemstone') || lowerHeader.includes('stone')) {
          product.gemstone = value;
        } else if (lowerHeader.includes('image') || lowerHeader.includes('url')) {
          product.image_url = value;
        } else if (lowerHeader.includes('weight')) {
          product.weight_grams = parseFloat(value) || null;
        } else if (lowerHeader.includes('cost')) {
          product.cost_price = parseFloat(value) || 0;
        } else if (lowerHeader.includes('retail') || lowerHeader.includes('price')) {
          product.retail_price = parseFloat(value) || 0;
        } else if (lowerHeader.includes('stock') || lowerHeader.includes('quantity')) {
          product.stock_quantity = parseInt(value) || 0;
        }
      });

      // Validate required fields
      if (product.name && product.cost_price !== undefined && product.retail_price !== undefined) {
        products.push(product);
      }
    }

    console.log(`Parsed ${products.length} products from sheet`);

    // Insert products into database
    const { data: insertedProducts, error: insertError } = await supabase
      .from("products")
      .insert(products)
      .select();

    if (insertError) {
      console.error("Error inserting products:", insertError);
      throw new Error(`Failed to import products: ${insertError.message}`);
    }

    console.log(`Successfully imported ${insertedProducts.length} products`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: insertedProducts.length,
        products: insertedProducts 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error in import-from-sheets:", error);
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
