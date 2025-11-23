/**
 * Authentication guard component
 * Protects routes by ensuring user is authenticated
 * Redirects to auth page if not logged in
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { ROUTES } from "@/constants/routes";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (!session) {
        navigate(ROUTES.AUTH);
      }
    });

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate(ROUTES.AUTH);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  return session ? <>{children}</> : null;
};
