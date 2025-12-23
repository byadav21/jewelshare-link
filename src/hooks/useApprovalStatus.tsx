/**
 * User approval status management hook
 * Fetches and tracks user approval status for access control
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ApprovalStatus, UseApprovalStatusReturn } from "@/types";

export const useApprovalStatus = (): UseApprovalStatusReturn => {
  const [status, setStatus] = useState<ApprovalStatus>(null);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  useEffect(() => {
    fetchApprovalStatus();
  }, []);

  const fetchApprovalStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setStatus(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_approval_status")
        .select("status, rejection_reason")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching approval status:", error);
        setStatus(null);
      } else {
        setStatus(data?.status as ApprovalStatus);
        setRejectionReason(data?.rejection_reason || null);
      }
    } catch (error) {
      console.error("Unexpected error in fetchApprovalStatus:", error);
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    status,
    loading,
    rejectionReason,
    isApproved: status === "approved",
  };
};
