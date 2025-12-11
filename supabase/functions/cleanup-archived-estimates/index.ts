import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

/**
 * Validates cron job requests using the service role key as the secret
 * This prevents unauthorized access to the cleanup function
 */
function validateCronRequest(req: Request): boolean {
  const cronSecret = req.headers.get("x-cron-secret");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!cronSecret || !serviceRoleKey) {
    return false;
  }
  
  // Constant-time comparison to prevent timing attacks
  if (cronSecret.length !== serviceRoleKey.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < cronSecret.length; i++) {
    result |= cronSecret.charCodeAt(i) ^ serviceRoleKey.charCodeAt(i);
  }
  
  return result === 0;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate cron secret header
  if (!validateCronRequest(req)) {
    console.log("Unauthorized: Invalid or missing cron secret");
    return new Response(
      JSON.stringify({
        success: false,
        error: "Unauthorized",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      }
    );
  }

  try {
    console.log("Starting cleanup of archived estimates older than 30 days...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate the date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString();

    console.log(`Deleting archived estimates older than: ${cutoffDate}`);

    // Delete archived estimates where archived_at is older than 30 days
    const { data, error, count } = await supabase
      .from("manufacturing_cost_estimates")
      .delete()
      .eq("is_archived", true)
      .lt("archived_at", cutoffDate)
      .select("id");

    if (error) {
      console.error("Error deleting archived estimates:", error);
      throw error;
    }

    const deletedCount = data?.length || 0;
    console.log(`Successfully deleted ${deletedCount} archived estimates`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Deleted ${deletedCount} archived estimates older than 30 days`,
        deletedCount,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Cleanup job failed:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
