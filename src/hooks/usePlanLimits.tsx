import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getCachedUser } from "@/lib/authCache";

interface PlanLimits {
  subscription_plan: 'starter' | 'professional' | 'enterprise' | 'essentials';
  max_products: number;
  max_share_links: number;
  max_team_members: number;
  max_product_images: number;
}

interface Usage {
  products_count: number;
  share_links_count: number;
}

interface PlanLimitStatus {
  canAddProducts: boolean;
  canAddShareLinks: boolean;
  productsRemaining: number;
  shareLinksRemaining: number;
  productUsagePercent: number;
  shareLinksUsagePercent: number;
  loading: boolean;
}

export const usePlanLimits = (): PlanLimitStatus => {
  const [limits, setLimits] = useState<PlanLimits | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLimitsAndUsage();
  }, []);

  const fetchLimitsAndUsage = async () => {
    try {
      const user = await getCachedUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Parallel fetch for all data with count queries for efficiency
      const [permissionsResult, productsResult, shareLinksResult] = await Promise.all([
        supabase
          .from("vendor_permissions")
          .select("subscription_plan, max_products, max_share_links, max_team_members, max_product_images")
          .eq("user_id", user.id)
          .single(),
        supabase
          .from("products")
          .select("id", { count: 'exact', head: true })
          .eq("user_id", user.id)
          .is("deleted_at", null),
        supabase
          .from("share_links")
          .select("id", { count: 'exact', head: true })
          .eq("user_id", user.id)
      ]);

      if (permissionsResult.error) throw permissionsResult.error;

      setLimits(permissionsResult.data);
      setUsage({
        products_count: productsResult.count || 0,
        share_links_count: shareLinksResult.count || 0,
      });
    } catch (error) {
      console.error("Error fetching limits:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!limits || !usage) {
    return {
      canAddProducts: true,
      canAddShareLinks: true,
      productsRemaining: 0,
      shareLinksRemaining: 0,
      productUsagePercent: 0,
      shareLinksUsagePercent: 0,
      loading,
    };
  }

  const productUsagePercent = (usage.products_count / limits.max_products) * 100;
  const shareLinksUsagePercent = (usage.share_links_count / limits.max_share_links) * 100;

  // Check if unlimited (999999 is the unlimited indicator)
  const hasUnlimitedProducts = limits.max_products === 999999;
  const hasUnlimitedShareLinks = limits.max_share_links === 999999;

  return {
    canAddProducts: hasUnlimitedProducts || usage.products_count < limits.max_products,
    canAddShareLinks: hasUnlimitedShareLinks || usage.share_links_count < limits.max_share_links,
    productsRemaining: hasUnlimitedProducts ? Infinity : limits.max_products - usage.products_count,
    shareLinksRemaining: hasUnlimitedShareLinks ? Infinity : limits.max_share_links - usage.share_links_count,
    productUsagePercent,
    shareLinksUsagePercent,
    loading,
  };
};
