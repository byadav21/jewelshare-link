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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { reward_id } = await req.json();

    // Get reward details
    const { data: reward, error: rewardError } = await supabaseClient
      .from('rewards_catalog')
      .select('*')
      .eq('id', reward_id)
      .single();

    if (rewardError || !reward) {
      throw new Error('Reward not found');
    }

    // Get user's current points
    const { data: userPoints, error: pointsError } = await supabaseClient
      .from('vendor_points')
      .select('total_points')
      .eq('user_id', user.id)
      .single();

    if (pointsError || !userPoints) {
      throw new Error('User points not found');
    }

    // Check if user has enough points
    if (userPoints.total_points < reward.points_cost) {
      return new Response(
        JSON.stringify({ error: 'Insufficient points' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Deduct points
    const { error: deductError } = await supabaseClient
      .from('vendor_points')
      .update({ total_points: userPoints.total_points - reward.points_cost })
      .eq('user_id', user.id);

    if (deductError) {
      throw deductError;
    }

    // Record points deduction in history
    await supabaseClient
      .from('points_history')
      .insert({
        user_id: user.id,
        points: -reward.points_cost,
        action_type: 'reward_redemption',
        action_details: { reward_id, reward_name: reward.name }
      });

    // Create redemption record
    const expiresAt = reward.reward_type === 'premium_support' 
      ? new Date(Date.now() + (reward.reward_value.duration_days * 24 * 60 * 60 * 1000)).toISOString()
      : null;

    const { data: redemption, error: redemptionError } = await supabaseClient
      .from('redemptions')
      .insert({
        user_id: user.id,
        reward_id: reward.id,
        points_spent: reward.points_cost,
        reward_details: reward.reward_value,
        status: 'pending',
        expires_at: expiresAt
      })
      .select()
      .single();

    if (redemptionError) {
      throw redemptionError;
    }

    // Apply reward based on type
    if (reward.reward_type === 'extra_products' || reward.reward_type === 'extra_share_links') {
      const { data: permissions } = await supabaseClient
        .from('vendor_permissions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (permissions) {
        const updates: any = {};
        if (reward.reward_type === 'extra_products') {
          updates.max_products = (permissions.max_products || 100) + reward.reward_value.amount;
        } else if (reward.reward_type === 'extra_share_links') {
          updates.max_share_links = (permissions.max_share_links || 1) + reward.reward_value.amount;
        }

        await supabaseClient
          .from('vendor_permissions')
          .update(updates)
          .eq('user_id', user.id);

        // Mark as applied
        await supabaseClient
          .from('redemptions')
          .update({ status: 'applied', applied_at: new Date().toISOString() })
          .eq('id', redemption.id);
      }
    }

    console.log(`Reward redeemed: ${reward.name} for user ${user.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        redemption,
        remaining_points: userPoints.total_points - reward.points_cost
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error redeeming reward:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});