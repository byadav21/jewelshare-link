/**
 * Hook for managing real-time notification counts
 * Handles fetching and subscribing to pending comments and approvals
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { NotificationCounts } from "@/types";

export const useNotificationCounts = () => {
  const [counts, setCounts] = useState<NotificationCounts>({
    comments: 0,
    approvals: 0,
  });

  useEffect(() => {
    fetchCounts();
    const channels = subscribeToChanges();
    
    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, []);

  const fetchCounts = async () => {
    try {
      const [commentsResult, approvalsResult] = await Promise.all([
        supabase
          .from("blog_comments")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("user_approval_status")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
      ]);

      setCounts({
        comments: commentsResult.count || 0,
        approvals: approvalsResult.count || 0,
      });
    } catch (error) {
      console.error("Error fetching notification counts:", error);
    }
  };

  const subscribeToChanges = () => {
    const commentsChannel = supabase
      .channel("notifications-comments")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "blog_comments",
          filter: "status=eq.pending",
        },
        () => fetchCounts()
      )
      .subscribe();

    const approvalsChannel = supabase
      .channel("notifications-approvals")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_approval_status",
          filter: "status=eq.pending",
        },
        () => fetchCounts()
      )
      .subscribe();

    return [commentsChannel, approvalsChannel];
  };

  return { counts, refetch: fetchCounts };
};
