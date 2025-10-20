import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_DEVICES = 5;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, sessionId, deviceInfo, ipAddress } = await req.json();
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Invalid authentication token");
    }

    if (action === "register") {
      // Check current active sessions
      const { data: existingSessions, error: fetchError } = await supabase
        .from("user_sessions")
        .select("*")
        .eq("user_id", user.id)
        .gte("last_activity", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order("last_activity", { ascending: false });

      if (fetchError) {
        console.error("Error fetching sessions:", fetchError);
        throw new Error("Failed to fetch sessions");
      }

      // Check if this session already exists
      const existingSession = existingSessions?.find(s => s.session_id === sessionId);
      
      if (existingSession) {
        // Update existing session
        const { error: updateError } = await supabase
          .from("user_sessions")
          .update({
            last_activity: new Date().toISOString(),
            device_info: deviceInfo,
            ip_address: ipAddress,
          })
          .eq("id", existingSession.id);

        if (updateError) {
          console.error("Error updating session:", updateError);
        }

        return new Response(
          JSON.stringify({ success: true, message: "Session updated" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      // Check device limit for new sessions
      if (existingSessions && existingSessions.length >= MAX_DEVICES) {
        // Remove oldest session
        const oldestSession = existingSessions[existingSessions.length - 1];
        await supabase
          .from("user_sessions")
          .delete()
          .eq("id", oldestSession.id);

        console.log(`Removed oldest session for user ${user.id} due to device limit`);
      }

      // Register new session
      const { error: insertError } = await supabase
        .from("user_sessions")
        .insert({
          user_id: user.id,
          session_id: sessionId,
          device_info: deviceInfo,
          ip_address: ipAddress,
        });

      if (insertError) {
        console.error("Error inserting session:", insertError);
        throw new Error("Failed to register session");
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Session registered successfully",
          activeDevices: Math.min((existingSessions?.length || 0) + 1, MAX_DEVICES)
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else if (action === "update") {
      // Update session activity
      const { error: updateError } = await supabase
        .from("user_sessions")
        .update({
          last_activity: new Date().toISOString(),
        })
        .eq("session_id", sessionId)
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Error updating session:", updateError);
      }

      return new Response(
        JSON.stringify({ success: true, message: "Session updated" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else if (action === "remove") {
      // Remove session
      const { error: deleteError } = await supabase
        .from("user_sessions")
        .delete()
        .eq("session_id", sessionId)
        .eq("user_id", user.id);

      if (deleteError) {
        console.error("Error deleting session:", deleteError);
        throw new Error("Failed to remove session");
      }

      return new Response(
        JSON.stringify({ success: true, message: "Session removed" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else if (action === "list") {
      // List active sessions
      const { data: sessions, error: listError } = await supabase
        .from("user_sessions")
        .select("*")
        .eq("user_id", user.id)
        .gte("last_activity", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order("last_activity", { ascending: false });

      if (listError) {
        console.error("Error listing sessions:", listError);
        throw new Error("Failed to list sessions");
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          sessions: sessions || [],
          maxDevices: MAX_DEVICES
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    throw new Error("Invalid action");
  } catch (error) {
    console.error("Error in manage-session:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
