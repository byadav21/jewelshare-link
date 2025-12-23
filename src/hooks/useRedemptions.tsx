import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Redemption {
  id: string;
  reward_id: string;
  points_spent: number;
  reward_details: any;
  status: string;
  redeemed_at: string;
  expires_at: string | null;
  applied_at: string | null;
}

export const useRedemptions = () => {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRedemptions();
  }, []);

  const fetchRedemptions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("redemptions")
        .select("*")
        .eq("user_id", user.id)
        .order("redeemed_at", { ascending: false });

      if (error) throw error;
      setRedemptions(data || []);
    } catch (error) {
      console.error("Error fetching redemptions:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    redemptions,
    loading,
    refetch: fetchRedemptions
  };
};