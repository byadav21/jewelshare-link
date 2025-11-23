import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { useApprovalStatus } from "@/hooks/useApprovalStatus";
import { useUserRole } from "@/hooks/useUserRole";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldX } from "lucide-react";

export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { status, loading: approvalLoading } = useApprovalStatus();
  const { isAdmin, loading: roleLoading } = useUserRole();
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
      if (status === "pending" || status === "rejected" || status !== "approved") {
        navigate("/pending-approval");
      }
    }
  }, [session, status, authLoading, approvalLoading, navigate]);

  useEffect(() => {
    if (!authLoading && !roleLoading && !approvalLoading && session && status === "approved") {
      if (!isAdmin) {
        // Redirect non-admin users to catalog
        navigate("/catalog");
      }
    }
  }, [session, isAdmin, status, authLoading, roleLoading, approvalLoading, navigate]);

  if (authLoading || approvalLoading || roleLoading) {
    return <LoadingSkeleton />;
  }

  // Show access denied if not admin
  if (session && status === "approved" && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <ShieldX className="h-16 w-16 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this page. This area is restricted to administrators only.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => navigate("/catalog")} className="w-full">
              Go to Catalog
            </Button>
            <Button onClick={() => navigate("/")} variant="outline" className="w-full">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return session && status === "approved" && isAdmin ? <>{children}</> : null;
};
