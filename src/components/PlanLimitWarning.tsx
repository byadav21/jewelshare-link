import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

export const PlanLimitWarning = () => {
  const navigate = useNavigate();
  const [limits, setLimits] = useState<PlanLimits | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLimitsAndUsage();
  }, []);

  const fetchLimitsAndUsage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Parallel fetch for all data
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

  if (loading || !limits || !usage) return null;

  // Calculate usage percentages
  const productUsagePercent = (usage.products_count / limits.max_products) * 100;
  const shareLinksUsagePercent = (usage.share_links_count / limits.max_share_links) * 100;

  // Check if limits are exhausted (>= 100%)
  const productExhausted = productUsagePercent >= 100 && limits.max_products !== 999999;
  const shareLinksExhausted = shareLinksUsagePercent >= 100 && limits.max_share_links !== 999999;
  
  // Check if approaching limits (>= 80% but < 100%)
  const productApproaching = productUsagePercent >= 80 && productUsagePercent < 100 && limits.max_products !== 999999;
  const shareLinksApproaching = shareLinksUsagePercent >= 80 && shareLinksUsagePercent < 100 && limits.max_share_links !== 999999;

  const isExhausted = productExhausted || shareLinksExhausted;
  const isApproaching = productApproaching || shareLinksApproaching;

  if (!isExhausted && !isApproaching) return null;

  return (
    <Alert className={isExhausted 
      ? "border-destructive bg-destructive/10 dark:bg-destructive/20" 
      : "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
    }>
      <AlertTriangle className={isExhausted ? "h-4 w-4 text-destructive" : "h-4 w-4 text-orange-600"} />
      <AlertTitle className={isExhausted 
        ? "text-destructive dark:text-destructive" 
        : "text-orange-900 dark:text-orange-100"
      }>
        {isExhausted ? "Plan Limits Exhausted" : "Approaching Plan Limits"}
      </AlertTitle>
      <AlertDescription className={isExhausted 
        ? "text-destructive/90 dark:text-destructive/90 space-y-2" 
        : "text-orange-800 dark:text-orange-200 space-y-2"
      }>
        {(productExhausted || productApproaching) && (
          <p>
            📦 Products: <strong>{usage.products_count}/{limits.max_products}</strong> used 
            ({Math.round(productUsagePercent)}%)
            {productExhausted && <span className="ml-2 font-semibold">- Limit Reached!</span>}
          </p>
        )}
        {(shareLinksExhausted || shareLinksApproaching) && (
          <p>
            🔗 Share Links: <strong>{usage.share_links_count}/{limits.max_share_links}</strong> used 
            ({Math.round(shareLinksUsagePercent)}%)
            {shareLinksExhausted && <span className="ml-2 font-semibold">- Limit Reached!</span>}
          </p>
        )}
        {isExhausted && (
          <p className="font-medium mt-2">
            You've reached your plan limit. Upgrade now to continue using this feature.
          </p>
        )}
        <div className="flex gap-2 mt-3">
          <Button 
            size="sm" 
            onClick={() => navigate("/pricing")}
            className={isExhausted 
              ? "bg-destructive hover:bg-destructive/90" 
              : "bg-orange-600 hover:bg-orange-700"
            }
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Upgrade to {limits.subscription_plan === 'starter' ? 'Professional' : 'Enterprise'}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
