import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Find all expired points that haven't been marked as expired yet
    const { data: expiredPoints, error: fetchError } = await supabaseClient
      .from('points_history')
      .select('id, user_id, points')
      .eq('expired', false)
      .not('expires_at', 'is', null)
      .lt('expires_at', new Date().toISOString());

    if (fetchError) {
      throw fetchError;
    }

    if (!expiredPoints || expiredPoints.length === 0) {
      console.log('No points to expire');
      return new Response(
        JSON.stringify({ message: 'No points to expire', expired_count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark points as expired
    const { error: updateError } = await supabaseClient
      .from('points_history')
      .update({ expired: true })
      .in('id', expiredPoints.map(p => p.id));

    if (updateError) {
      throw updateError;
    }

    // Group by user and recalculate their total points
    const userPoints = expiredPoints.reduce((acc, point) => {
      if (!acc[point.user_id]) {
        acc[point.user_id] = 0;
      }
      acc[point.user_id] += point.points;
      return acc;
    }, {} as Record<string, number>);

    // Update vendor_points for each affected user
    for (const [userId, expiredAmount] of Object.entries(userPoints)) {
      const { data: currentPoints } = await supabaseClient
        .from('vendor_points')
        .select('total_points')
        .eq('user_id', userId)
        .single();

      if (currentPoints) {
        await supabaseClient
          .from('vendor_points')
          .update({ 
            total_points: Math.max(0, currentPoints.total_points - expiredAmount)
          })
          .eq('user_id', userId);

        // Log the expiration
        await supabaseClient
          .from('points_history')
          .insert({
            user_id: userId,
            points: -expiredAmount,
            action_type: 'points_expired',
            action_details: { 
              expired_points: expiredAmount,
              reason: 'Points expired after 90 days'
            }
          });
      }
    }

    console.log(`Expired ${expiredPoints.length} point entries for ${Object.keys(userPoints).length} users`);

    return new Response(
      JSON.stringify({ 
        message: 'Points expired successfully',
        expired_count: expiredPoints.length,
        affected_users: Object.keys(userPoints).length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error expiring points:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});