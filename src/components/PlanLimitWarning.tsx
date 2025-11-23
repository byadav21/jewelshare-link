import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PlanLimits {
  subscription_plan: 'starter' | 'professional' | 'enterprise';
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
      if (!user) return;

      // Fetch vendor permissions (includes limits)
      const { data: permissions, error: permError } = await supabase
        .from("vendor_permissions")
        .select("subscription_plan, max_products, max_share_links, max_team_members, max_product_images")
        .eq("user_id", user.id)
        .single();

      if (permError) throw permError;

      // Fetch current usage
      const { data: products, error: prodError } = await supabase
        .from("products")
        .select("id")
        .eq("user_id", user.id)
        .is("deleted_at", null);

      if (prodError) throw prodError;

      const { data: shareLinks, error: shareError } = await supabase
        .from("share_links")
        .select("id")
        .eq("user_id", user.id);

      if (shareError) throw shareError;

      setLimits(permissions);
      setUsage({
        products_count: products?.length || 0,
        share_links_count: shareLinks?.length || 0,
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

  // Only show warning if approaching limits (>80%)
  const showProductWarning = productUsagePercent >= 80 && limits.max_products !== 999999;
  const showShareLinkWarning = shareLinksUsagePercent >= 80 && limits.max_share_links !== 999999;

  if (!showProductWarning && !showShareLinkWarning) return null;

  return (
    <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-900 dark:text-orange-100">
        Approaching Plan Limits
      </AlertTitle>
      <AlertDescription className="text-orange-800 dark:text-orange-200 space-y-2">
        {showProductWarning && (
          <p>
            📦 Products: <strong>{usage.products_count}/{limits.max_products}</strong> used 
            ({Math.round(productUsagePercent)}%)
          </p>
        )}
        {showShareLinkWarning && (
          <p>
            🔗 Share Links: <strong>{usage.share_links_count}/{limits.max_share_links}</strong> used 
            ({Math.round(shareLinksUsagePercent)}%)
          </p>
        )}
        <div className="flex gap-2 mt-3">
          <Button 
            size="sm" 
            onClick={() => navigate("/pricing")}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Upgrade to {limits.subscription_plan === 'starter' ? 'Professional' : 'Enterprise'}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
