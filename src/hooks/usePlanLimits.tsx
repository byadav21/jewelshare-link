import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getCachedUser } from "@/lib/authCache";

/**
 * Subscription plan tier types
 */
export type SubscriptionPlan = 'starter' | 'professional' | 'enterprise' | 'essentials';

/**
 * Plan limits configuration from database
 */
interface PlanLimits {
  /** Current subscription plan */
  subscription_plan: SubscriptionPlan;
  /** Maximum number of products allowed */
  max_products: number;
  /** Maximum number of share links allowed */
  max_share_links: number;
  /** Maximum number of team members allowed */
  max_team_members: number;
  /** Maximum number of images per product */
  max_product_images: number;
}

/**
 * Current usage counts
 */
interface Usage {
  /** Current number of active products */
  products_count: number;
  /** Current number of share links */
  share_links_count: number;
}

/**
 * Plan limit status return type
 */
interface PlanLimitStatus {
  /** Whether user can add more products */
  canAddProducts: boolean;
  /** Whether user can create more share links */
  canAddShareLinks: boolean;
  /** Number of products remaining in quota */
  productsRemaining: number;
  /** Number of share links remaining in quota */
  shareLinksRemaining: number;
  /** Current product usage as percentage (0-100) */
  productUsagePercent: number;
  /** Current share links usage as percentage (0-100) */
  shareLinksUsagePercent: number;
  /** Current subscription plan */
  plan: SubscriptionPlan | null;
  /** Raw limits data */
  limits: PlanLimits | null;
  /** Raw usage data */
  usage: Usage | null;
  /** Whether data is still loading */
  loading: boolean;
  /** Refresh function to re-fetch data */
  refresh: () => Promise<void>;
}

/** Value used to indicate unlimited quota */
const UNLIMITED_VALUE = 999999;

/**
 * Custom hook for managing subscription plan limits and usage
 * 
 * @description Fetches and tracks the user's subscription plan limits
 * and current usage. Provides helper functions to check if actions
 * are allowed based on plan quotas.
 * 
 * @returns Object containing plan limit status and helper functions
 * 
 * @example
 * ```tsx
 * function AddProductButton() {
 *   const { canAddProducts, productsRemaining, loading } = usePlanLimits();
 *   
 *   if (loading) return <Skeleton />;
 *   
 *   return (
 *     <Button 
 *       onClick={handleAddProduct} 
 *       disabled={!canAddProducts}
 *     >
 *       Add Product
 *       {productsRemaining !== Infinity && (
 *         <span className="text-muted-foreground">
 *           ({productsRemaining} left)
 *         </span>
 *       )}
 *     </Button>
 *   );
 * }
 * ```
 * 
 * @example
 * ```tsx
 * // Check if approaching limit
 * function UsageWarning() {
 *   const { productUsagePercent } = usePlanLimits();
 *   
 *   if (productUsagePercent > 90) {
 *     return <Alert>You're approaching your product limit!</Alert>;
 *   }
 *   return null;
 * }
 * ```
 */
export const usePlanLimits = (): PlanLimitStatus => {
  const [limits, setLimits] = useState<PlanLimits | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch plan limits and current usage from database
   */
  const fetchLimitsAndUsage = useCallback(async () => {
    try {
      setLoading(true);
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
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchLimitsAndUsage();
  }, [fetchLimitsAndUsage]);

  // Return default values if data not loaded
  if (!limits || !usage) {
    return {
      canAddProducts: true,
      canAddShareLinks: true,
      productsRemaining: 0,
      shareLinksRemaining: 0,
      productUsagePercent: 0,
      shareLinksUsagePercent: 0,
      plan: null,
      limits: null,
      usage: null,
      loading,
      refresh: fetchLimitsAndUsage,
    };
  }

  // Calculate usage percentages
  const productUsagePercent = (usage.products_count / limits.max_products) * 100;
  const shareLinksUsagePercent = (usage.share_links_count / limits.max_share_links) * 100;

  // Check if unlimited (999999 is the unlimited indicator)
  const hasUnlimitedProducts = limits.max_products === UNLIMITED_VALUE;
  const hasUnlimitedShareLinks = limits.max_share_links === UNLIMITED_VALUE;

  return {
    canAddProducts: hasUnlimitedProducts || usage.products_count < limits.max_products,
    canAddShareLinks: hasUnlimitedShareLinks || usage.share_links_count < limits.max_share_links,
    productsRemaining: hasUnlimitedProducts ? Infinity : limits.max_products - usage.products_count,
    shareLinksRemaining: hasUnlimitedShareLinks ? Infinity : limits.max_share_links - usage.share_links_count,
    productUsagePercent,
    shareLinksUsagePercent,
    plan: limits.subscription_plan,
    limits,
    usage,
    loading,
    refresh: fetchLimitsAndUsage,
  };
};

/**
 * Get plan display name
 * 
 * @description Converts plan key to user-friendly display name
 * 
 * @param plan - The subscription plan key
 * @returns Human-readable plan name
 * 
 * @example
 * ```ts
 * getPlanDisplayName('professional'); // "Professional"
 * getPlanDisplayName('enterprise');   // "Enterprise"
 * ```
 */
export const getPlanDisplayName = (plan: SubscriptionPlan): string => {
  const names: Record<SubscriptionPlan, string> = {
    starter: 'Starter',
    essentials: 'Essentials',
    professional: 'Professional',
    enterprise: 'Enterprise'
  };
  return names[plan] || plan;
};

/**
 * Check if a plan is higher tier than another
 * 
 * @description Compares two plans to determine upgrade path
 * 
 * @param currentPlan - The current subscription plan
 * @param comparePlan - The plan to compare against
 * @returns True if comparePlan is higher tier
 */
export const isHigherTierPlan = (
  currentPlan: SubscriptionPlan,
  comparePlan: SubscriptionPlan
): boolean => {
  const tierOrder: SubscriptionPlan[] = ['starter', 'essentials', 'professional', 'enterprise'];
  return tierOrder.indexOf(comparePlan) > tierOrder.indexOf(currentPlan);
};
