/**
 * User role management hook
 * 
 * SECURITY NOTE: This hook fetches user roles for UI rendering purposes only.
 * Client-side role checks are NOT a security boundary - they only control what
 * UI elements are displayed. All actual authorization is enforced server-side via:
 * - Row Level Security (RLS) policies on database tables
 * - has_role() security definer function for server-side role validation
 * - Edge function role checks for sensitive operations
 * 
 * An attacker manipulating client-side code to bypass these checks would only
 * see UI elements they cannot actually use due to backend protection.
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getCachedUser } from "@/lib/authCache";
import { UserRole, UseUserRoleReturn } from "@/types";

export const useUserRole = (): UseUserRoleReturn => {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    try {
      const user = await getCachedUser();
      
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        setRole(null);
      } else {
        setRole(data?.role as UserRole);
      }
    } catch (error) {
      console.error("Unexpected error in fetchUserRole:", error);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    role,
    loading,
    isAdmin: role === "admin",
    isTeamMember: role === "team_member",
  };
};
