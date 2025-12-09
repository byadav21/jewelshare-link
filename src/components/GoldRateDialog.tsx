import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface GoldRateDialogProps {
  currentGoldRate: number;
  onUpdate: (newRate: number) => Promise<void>;
  onSkip: () => void;
}

export const GoldRateDialog = ({ currentGoldRate, onUpdate, onSkip }: GoldRateDialogProps) => {
  const [open, setOpen] = useState(false);
  const [goldRate, setGoldRate] = useState(""); // Start with blank input
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    // Check if we should show the dialog
    const lastSkipTimestamp = localStorage.getItem("gold_rate_skip_timestamp");
    const lastPromptDate = localStorage.getItem("gold_rate_last_prompt");
    const now = new Date();
    const today = now.toDateString();

    // If user skipped, check if 24 hours have passed
    if (lastSkipTimestamp) {
      const skipTime = new Date(parseInt(lastSkipTimestamp));
      const hoursSinceSkip = (now.getTime() - skipTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceSkip < 24) {
        // Less than 24 hours since skip, don't show
        return;
      }
    }

    // If user updated today, don't show
    if (lastPromptDate === today) {
      return;
    }

    // Show dialog after a slight delay
    setTimeout(() => setOpen(true), 1000);
  }, []);

  const handleUpdate = async () => {
    const newRate = parseFloat(goldRate);

    if (!goldRate || goldRate.trim() === "") {
      toast.error("Please enter a gold rate");
      return;
    }

    if (isNaN(newRate) || newRate <= 0) {
      toast.error("Please enter a valid positive number");
      return;
    }

    if (newRate < 1000 || newRate > 200000) {
      toast.error("Gold rate must be between ₹1,000 and ₹2,00,000 per gram");
      return;
    }

    setUpdating(true);

    try {
      await onUpdate(newRate);
      const today = new Date().toDateString();
      localStorage.setItem("gold_rate_last_prompt", today);
      // Clear skip timestamp since rate was updated
      localStorage.removeItem("gold_rate_skip_timestamp");
      setOpen(false);
      toast.success("Gold rate updated successfully!");
    } catch (error) {
      console.error("Error updating gold rate:", error);
      toast.error("Failed to update gold rate");
    } finally {
      setUpdating(false);
    }
  };

  const handleSkip = () => {
    const now = new Date();
    // Store timestamp for 24-hour tracking
    localStorage.setItem("gold_rate_skip_timestamp", now.getTime().toString());
    // Also store date to prevent multiple prompts on same day
    localStorage.setItem("gold_rate_last_prompt", now.toDateString());
    setOpen(false);
    onSkip();
    toast.info("Gold rate update skipped. You won't be asked again for 24 hours.");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md border-2 border-primary/20 shadow-2xl">
        <button
          onClick={handleSkip}
          className="absolute right-4 top-4 rounded-full p-1.5 opacity-70 ring-offset-background transition-all hover:opacity-100 hover:bg-accent hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <DialogHeader className="space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/20 border-2 border-amber-500/30 shadow-lg"
          >
            <TrendingUp className="h-8 w-8 text-amber-600" />
          </motion.div>

          <div className="space-y-2 text-center">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
              Update Gold Rate
            </DialogTitle>
            <DialogDescription className="text-base">
              Start your day by updating today's 24K gold rate
            </DialogDescription>
          </div>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-5 pt-4"
        >
          {/* Current Rate Display */}
          <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Current Rate</p>
                <p className="text-xl font-bold text-amber-600">
                  ₹{currentGoldRate.toLocaleString('en-IN')}/g
                </p>
              </div>
              <Sparkles className="h-6 w-6 text-amber-500/50" />
            </div>
          </div>

          {/* New Rate Input */}
          <div className="space-y-2">
            <Label htmlFor="goldRate" className="text-sm font-medium">
              New Gold Rate (per gram)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                ₹
              </span>
              <Input
                id="goldRate"
                type="number"
                value={goldRate}
                onChange={(e) => setGoldRate(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !updating) {
                    handleUpdate();
                  }
                }}
                placeholder="Enter today's rate"
                min="1000"
                max="200000"
                step="100"
                disabled={updating}
                className="pl-8 h-12 text-lg font-semibold border-2 focus:border-amber-500 focus:ring-amber-500"
                autoFocus
              />
            </div>
            <p className="text-xs text-muted-foreground">
              This will automatically recalculate prices for all products with weight
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <Button
              onClick={handleUpdate}
              disabled={updating}
              size="lg"
              className="w-full h-12 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              {updating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    <TrendingUp className="h-5 w-5" />
                  </motion.div>
                  Updating...
                </>
              ) : (
                <>
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Update Gold Rate
                </>
              )}
            </Button>

            <Button
              onClick={handleSkip}
              disabled={updating}
              variant="ghost"
              size="lg"
              className="w-full"
            >
              Skip for Today
            </Button>
          </div>

          {/* Info Note */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
            <p className="text-xs text-center text-muted-foreground leading-relaxed">
              💡 <strong>Pro Tip:</strong> Update your gold rate daily to keep your pricing accurate and competitive
            </p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
