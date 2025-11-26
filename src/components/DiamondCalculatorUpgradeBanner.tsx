import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Sparkles, 
  Zap, 
  TrendingUp, 
  Shield, 
  Check, 
  X,
  ArrowRight,
  Crown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface DiamondCalculatorUpgradeBannerProps {
  remainingCalculations: number;
  totalLimit: number;
}

export const DiamondCalculatorUpgradeBanner = ({
  remainingCalculations,
  totalLimit,
}: DiamondCalculatorUpgradeBannerProps) => {
  const [showComparison, setShowComparison] = useState(false);
  const navigate = useNavigate();
  const usagePercentage = ((totalLimit - remainingCalculations) / totalLimit) * 100;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Alert className={`relative overflow-hidden border-2 ${
            remainingCalculations === 0 
              ? "border-destructive/50 bg-destructive/5" 
              : remainingCalculations <= 2
              ? "border-orange-500/50 bg-orange-500/5"
              : "border-primary/50 bg-primary/5"
          }`}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse" />
            
            <div className="relative flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                <motion.div
                  animate={{ 
                    rotate: remainingCalculations <= 2 ? [0, -10, 10, -10, 0] : 0 
                  }}
                  transition={{ 
                    duration: 0.5,
                    repeat: remainingCalculations <= 2 ? Infinity : 0,
                    repeatDelay: 2
                  }}
                >
                  {remainingCalculations === 0 ? (
                    <X className="h-5 w-5 text-destructive" />
                  ) : (
                    <Sparkles className="h-5 w-5 text-primary" />
                  )}
                </motion.div>
                
                <AlertDescription className="m-0">
                  <div className="flex flex-col gap-1">
                    <div className="font-semibold">
                      {remainingCalculations === 0 ? (
                        <span className="text-destructive">Daily Limit Reached!</span>
                      ) : (
                        <span>
                          {remainingCalculations} calculation{remainingCalculations !== 1 ? 's' : ''} remaining today
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${
                            remainingCalculations === 0
                              ? "bg-destructive"
                              : remainingCalculations <= 2
                              ? "bg-orange-500"
                              : "bg-primary"
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${usagePercentage}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {totalLimit - remainingCalculations}/{totalLimit} used
                      </span>
                    </div>
                  </div>
                </AlertDescription>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowComparison(true)}
                  className="group"
                >
                  Compare Plans
                  <TrendingUp className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/auth")}
                  className="group bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  <Crown className="mr-1 h-4 w-4" />
                  Sign In for Unlimited
                  <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </Alert>
        </motion.div>
      </AnimatePresence>

      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Zap className="h-6 w-6 text-primary" />
              Choose Your Diamond Calculator Experience
            </DialogTitle>
            <DialogDescription>
              Compare features and choose what works best for you
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-4 mt-6">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 h-full border-2 border-muted hover:border-muted-foreground/20 transition-colors">
                <div className="flex flex-col h-full">
                  <div className="mb-4">
                    <Badge variant="outline" className="mb-3">
                      Guest Access
                    </Badge>
                    <h3 className="text-2xl font-bold mb-2">Free</h3>
                    <p className="text-muted-foreground text-sm">
                      Try before you commit
                    </p>
                  </div>

                  <div className="space-y-4 flex-1">
                    <div className="text-3xl font-bold">
                      5<span className="text-lg text-muted-foreground">/day</span>
                    </div>

                    <div className="space-y-3">
                      <FeatureItem
                        included={true}
                        text="Basic diamond price calculations"
                      />
                      <FeatureItem
                        included={true}
                        text="4Cs specifications (Carat, Color, Clarity, Cut)"
                      />
                      <FeatureItem
                        included={true}
                        text="Price adjustments (discount/markup)"
                      />
                      <FeatureItem
                        included={true}
                        text="Compare up to 4 diamonds"
                      />
                      <FeatureItem
                        included={false}
                        text="Unlimited calculations"
                      />
                      <FeatureItem
                        included={false}
                        text="Save calculation history"
                      />
                      <FeatureItem
                        included={false}
                        text="Export unlimited comparisons"
                      />
                      <FeatureItem
                        included={false}
                        text="Priority support"
                      />
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-6"
                    disabled
                  >
                    Current Plan
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Authenticated Plan */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 h-full border-2 border-primary bg-gradient-to-br from-primary/5 via-transparent to-primary/5 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0">
                  <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Recommended
                  </Badge>
                </div>

                <div className="flex flex-col h-full">
                  <div className="mb-4 mt-6">
                    <Badge variant="default" className="mb-3 bg-gradient-to-r from-primary to-primary/80">
                      <Crown className="h-3 w-3 mr-1" />
                      Full Access
                    </Badge>
                    <h3 className="text-2xl font-bold mb-2">Unlimited</h3>
                    <p className="text-muted-foreground text-sm">
                      Professional diamond pricing tools
                    </p>
                  </div>

                  <div className="space-y-4 flex-1">
                    <div className="text-3xl font-bold flex items-baseline gap-2">
                      <span className="text-primary">∞</span>
                      <span className="text-lg text-muted-foreground">unlimited</span>
                    </div>

                    <div className="space-y-3">
                      <FeatureItem
                        included={true}
                        text="Unlimited diamond calculations"
                        highlight
                      />
                      <FeatureItem
                        included={true}
                        text="All 4Cs specifications"
                        highlight
                      />
                      <FeatureItem
                        included={true}
                        text="Advanced price adjustments"
                        highlight
                      />
                      <FeatureItem
                        included={true}
                        text="Compare unlimited diamonds"
                        highlight
                      />
                      <FeatureItem
                        included={true}
                        text="Save calculation history"
                        highlight
                      />
                      <FeatureItem
                        included={true}
                        text="Export all comparisons as PDF"
                        highlight
                      />
                      <FeatureItem
                        included={true}
                        text="Access to all platform features"
                        highlight
                      />
                      <FeatureItem
                        included={true}
                        text="Priority support"
                        highlight
                      />
                    </div>
                  </div>

                  <Button
                    className="w-full mt-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 group"
                    onClick={() => {
                      setShowComparison(false);
                      navigate("/auth");
                    }}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Sign In Now
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    Free to sign up • No credit card required
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

interface FeatureItemProps {
  included: boolean;
  text: string;
  highlight?: boolean;
}

const FeatureItem = ({ included, text, highlight }: FeatureItemProps) => (
  <div className="flex items-start gap-2">
    <div className={`mt-0.5 ${included ? "text-primary" : "text-muted-foreground"}`}>
      {included ? (
        <Check className="h-4 w-4" />
      ) : (
        <X className="h-4 w-4" />
      )}
    </div>
    <span className={`text-sm ${
      !included 
        ? "text-muted-foreground line-through" 
        : highlight 
        ? "font-medium" 
        : ""
    }`}>
      {text}
    </span>
  </div>
);
