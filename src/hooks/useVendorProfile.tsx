import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface VendorProfile {
  business_name: string | null;
}

export const useVendorProfile = () => {
  const [vendorName, setVendorName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendorProfile();
  }, []);

  const fetchVendorProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setVendorName(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("vendor_profiles")
        .select("business_name")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching vendor profile:", error);
        setVendorName(null);
      } else {
        setVendorName(data?.business_name || null);
      }
    } catch (error) {
      console.error("Unexpected error in fetchVendorProfile:", error);
      setVendorName(null);
    } finally {
      setLoading(false);
    }
  };

  return { vendorName, loading };
};
