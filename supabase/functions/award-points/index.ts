import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AwardPointsRequest {
  action_type: string;
  action_details?: Record<string, any>;
}

const POINT_VALUES: Record<string, number> = {
  'product_added': 10,
  'share_link_created': 20,
  'product_viewed': 1,
  'catalog_shared': 15,
  'first_product': 50,
  'profile_completed': 30,
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      console.error('User auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action_type, action_details }: AwardPointsRequest = await req.json();

    if (!action_type || !POINT_VALUES[action_type]) {
      return new Response(
        JSON.stringify({ error: 'Invalid action type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const points = POINT_VALUES[action_type];

    // Get or create user points record
    const { data: existingPoints } = await supabaseClient
      .from('vendor_points')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!existingPoints) {
      // Create new points record
      await supabaseClient
        .from('vendor_points')
        .insert({
          user_id: user.id,
          total_points: points,
          current_tier: 'bronze'
        });
    } else {
      // Update existing points
      const newTotal = existingPoints.total_points + points;
      let newTier = existingPoints.current_tier;

      // Update tier based on total points
      if (newTotal >= 5000) {
        newTier = 'platinum';
      } else if (newTotal >= 2000) {
        newTier = 'gold';
      } else if (newTotal >= 500) {
        newTier = 'silver';
      } else {
        newTier = 'bronze';
      }

      await supabaseClient
        .from('vendor_points')
        .update({
          total_points: newTotal,
          current_tier: newTier
        })
        .eq('user_id', user.id);
    }

    // Log points transaction with expiration date (90 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90);
    
    await supabaseClient
      .from('points_history')
      .insert({
        user_id: user.id,
        points,
        action_type,
        action_details: action_details || {},
        expires_at: expiresAt.toISOString()
      });

    console.log(`Awarded ${points} points to user ${user.id} for action: ${action_type}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        points_awarded: points,
        action_type 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error awarding points:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
