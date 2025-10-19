import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ApprovalStatus = "pending" | "approved" | "rejected" | null;

export const useApprovalStatus = () => {
  const [status, setStatus] = useState<ApprovalStatus>(null);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  useEffect(() => {
    const fetchApprovalStatus = async () => {
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
      
      setLoading(false);
    };

    fetchApprovalStatus();
  }, []);

  return { status, loading, rejectionReason, isApproved: status === "approved" };
};
