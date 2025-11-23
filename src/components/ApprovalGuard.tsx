import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { useApprovalStatus } from "@/hooks/useApprovalStatus";
import { LoadingSkeleton } from "./LoadingSkeleton";

export const ApprovalGuard = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { status, loading: approvalLoading } = useApprovalStatus();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
      if (!session) {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!authLoading && !approvalLoading && session) {
      if (status === "pending") {
        navigate("/pending-approval");
      } else if (status === "rejected") {
        navigate("/pending-approval");
      } else if (status !== "approved") {
        navigate("/pending-approval");
      }
    }
  }, [session, status, authLoading, approvalLoading, navigate]);

  if (authLoading || approvalLoading) {
    return <LoadingSkeleton />;
  }

  return session && status === "approved" ? <>{children}</> : null;
};
