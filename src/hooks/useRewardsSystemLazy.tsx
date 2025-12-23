import { supabase } from "@/integrations/supabase/client";

/**
 * Lazy version of rewards system - only provides awardPoints without fetching on mount
 * Use this when you only need to award points without displaying rewards data
 */
export const useRewardsSystemLazy = () => {
  const awardPoints = async (actionType: string, actionDetails?: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('award-points', {
        body: {
          action_type: actionType,
          action_details: actionDetails
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error awarding points:", error);
      throw error;
    }
  };

  return { awardPoints };
};
