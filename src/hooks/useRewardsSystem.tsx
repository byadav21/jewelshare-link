import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface VendorPoints {
  total_points: number;
  current_tier: string;
  created_at: string;
  updated_at: string;
}

interface PointsHistory {
  id: string;
  points: number;
  action_type: string;
  action_details: any;
  created_at: string;
}

export const useRewardsSystem = () => {
  const [points, setPoints] = useState<VendorPoints | null>(null);
  const [history, setHistory] = useState<PointsHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPoints();
    fetchHistory();
    setupRealtimeListener();
  }, []);

  const fetchPoints = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("vendor_points")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (!data) {
        // Initialize points for new user
        const { data: newPoints } = await supabase
          .from("vendor_points")
          .insert({
            user_id: user.id,
            total_points: 0,
            current_tier: 'bronze'
          })
          .select()
          .single();
        
        setPoints(newPoints);
      } else {
        setPoints(data);
      }
    } catch (error) {
      console.error("Error fetching points:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("points_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error("Error fetching points history:", error);
    }
  };

  const setupRealtimeListener = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const channel = supabase
      .channel('points-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'vendor_points',
        },
        (payload: any) => {
          if (payload.new) {
            setPoints(payload.new);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'points_history',
        },
        () => {
          fetchHistory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const awardPoints = async (actionType: string, actionDetails?: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('award-points', {
        body: {
          action_type: actionType,
          action_details: actionDetails
        }
      });

      if (error) throw error;
      
      // Refresh points after awarding
      await fetchPoints();
      
      return data;
    } catch (error) {
      console.error("Error awarding points:", error);
      throw error;
    }
  };

  return {
    points,
    history,
    loading,
    awardPoints,
    refetch: fetchPoints
  };
};
