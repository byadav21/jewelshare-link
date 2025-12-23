import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Milestone {
  id: string;
  milestone_type: string;
  milestone_value: number;
  achieved_at: string;
  points_awarded: number;
}

export const useMilestones = () => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [latestMilestone, setLatestMilestone] = useState<Milestone | null>(null);

  useEffect(() => {
    fetchMilestones();
    setupRealtimeListener();
  }, []);

  const fetchMilestones = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("vendor_milestones")
        .select("*")
        .eq("user_id", user.id)
        .order("achieved_at", { ascending: false });

      if (error) throw error;
      setMilestones(data || []);
    } catch (error) {
      console.error("Error fetching milestones:", error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeListener = () => {
    const channel = supabase
      .channel('milestone-achievements')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'vendor_milestones',
        },
        (payload: any) => {
          if (payload.new) {
            setLatestMilestone(payload.new);
            setMilestones(prev => [payload.new, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const clearLatestMilestone = () => {
    setLatestMilestone(null);
  };

  return {
    milestones,
    loading,
    latestMilestone,
    clearLatestMilestone,
    refetch: fetchMilestones
  };
};
