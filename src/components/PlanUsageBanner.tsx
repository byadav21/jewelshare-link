import { usePlanLimits } from "@/hooks/usePlanLimits";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, TrendingUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const PlanUsageBanner = () => {
  const {
    productUsagePercent,
    shareLinksUsagePercent,
    productsRemaining,
    shareLinksRemaining,
    loading
  } = usePlanLimits();

  if (loading) return null;

  const isProductsUnlimited = productsRemaining === Infinity;
  const isShareLinksUnlimited = shareLinksRemaining === Infinity;
  
  const isAnyLimitHigh = productUsagePercent >= 80 || shareLinksUsagePercent >= 80;
  const isAnyLimitExhausted = productUsagePercent >= 100 || shareLinksUsagePercent >= 100;

  if (!isAnyLimitHigh) return null;

  return (
    <Alert className={`mb-6 ${isAnyLimitExhausted ? 'border-destructive bg-destructive/5' : 'border-warning bg-warning/5'}`}>
      <div className="flex items-start gap-3">
        {isAnyLimitExhausted ? (
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
        ) : (
          <TrendingUp className="h-5 w-5 text-warning mt-0.5" />
        )}
        <div className="flex-1 space-y-3">
          <AlertDescription className="font-medium">
            {isAnyLimitExhausted ? 'Plan Limits Reached' : 'Approaching Plan Limits'}
          </AlertDescription>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Products Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Products</span>
                <span className="font-medium">
                  {isProductsUnlimited ? 'Unlimited' : `${productsRemaining} remaining`}
                </span>
              </div>
              {!isProductsUnlimited && (
                <Progress 
                  value={Math.min(productUsagePercent, 100)} 
                  className={productUsagePercent >= 100 ? '[&>div]:bg-destructive' : productUsagePercent >= 80 ? '[&>div]:bg-warning' : ''}
                />
              )}
            </div>

            {/* Share Links Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Share Links</span>
                <span className="font-medium">
                  {isShareLinksUnlimited ? 'Unlimited' : `${shareLinksRemaining} remaining`}
                </span>
              </div>
              {!isShareLinksUnlimited && (
                <Progress 
                  value={Math.min(shareLinksUsagePercent, 100)} 
                  className={shareLinksUsagePercent >= 100 ? '[&>div]:bg-destructive' : shareLinksUsagePercent >= 80 ? '[&>div]:bg-warning' : ''}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </Alert>
  );
};
