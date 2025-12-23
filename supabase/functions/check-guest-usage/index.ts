import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GUEST_USAGE_LIMIT = 5;
const TIME_WINDOW_HOURS = 24;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { calculatorType } = await req.json();

    if (!calculatorType || !["manufacturing", "diamond"].includes(calculatorType)) {
      return new Response(
        JSON.stringify({ error: "Invalid calculator type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract client IP from headers
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
                     req.headers.get("x-real-ip") || 
                     "unknown";

    const userAgent = req.headers.get("user-agent") || "unknown";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch geolocation data for this IP
    let geoData = null;
    try {
      // Using ip-api.com free service (no API key required)
      // Rate limit: 45 requests per minute
      if (clientIP !== "unknown") {
        const geoResponse = await fetch(`http://ip-api.com/json/${clientIP}?fields=status,country,countryCode,region,city,lat,lon`);
        if (geoResponse.ok) {
          const geo = await geoResponse.json();
          if (geo.status === "success") {
            geoData = {
              country: geo.country,
              country_code: geo.countryCode,
              region: geo.region,
              city: geo.city,
              latitude: geo.lat,
              longitude: geo.lon,
            };
          }
        }
      }
    } catch (geoError) {
      console.error("Error fetching geolocation:", geoError);
      // Continue without geo data if fetch fails
    }

    // Calculate time window (last 24 hours)
    const timeWindowStart = new Date();
    timeWindowStart.setHours(timeWindowStart.getHours() - TIME_WINDOW_HOURS);

    // Check current usage count for this IP and calculator type
    const { data: usageRecords, error: fetchError } = await supabase
      .from("guest_calculator_usage")
      .select("id")
      .eq("ip_address", clientIP)
      .eq("calculator_type", calculatorType)
      .gte("used_at", timeWindowStart.toISOString());

    if (fetchError) {
      console.error("Error fetching usage:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to check usage" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const currentUsageCount = usageRecords?.length || 0;
    const usageAllowed = currentUsageCount < GUEST_USAGE_LIMIT;

    // If usage is allowed, record this usage
    if (usageAllowed) {
      const insertData: any = {
        ip_address: clientIP,
        calculator_type: calculatorType,
        user_agent: userAgent,
      };

      // Add geolocation data if available
      if (geoData) {
        insertData.country = geoData.country;
        insertData.country_code = geoData.country_code;
        insertData.region = geoData.region;
        insertData.city = geoData.city;
        insertData.latitude = geoData.latitude;
        insertData.longitude = geoData.longitude;
      }

      const { error: insertError } = await supabase
        .from("guest_calculator_usage")
        .insert(insertData);

      if (insertError) {
        console.error("Error recording usage:", insertError);
        // Don't fail the request if we can't record usage
      }
    }

    return new Response(
      JSON.stringify({
        allowed: usageAllowed,
        usageCount: usageAllowed ? currentUsageCount + 1 : currentUsageCount,
        limit: GUEST_USAGE_LIMIT,
        timeWindowHours: TIME_WINDOW_HOURS,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in check-guest-usage:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
