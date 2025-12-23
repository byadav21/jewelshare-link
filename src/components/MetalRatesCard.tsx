import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Sparkles, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface MetalRatesCardProps {
  goldRate: number;
  silverRate: number;
  platinumRate: number;
  onRatesUpdated: (rates: { goldRate: number; silverRate: number; platinumRate: number }) => void;
}

export const MetalRatesCard = ({ 
  goldRate, 
  silverRate, 
  platinumRate, 
  onRatesUpdated 
}: MetalRatesCardProps) => {
  const [newGoldRate, setNewGoldRate] = useState(goldRate.toString());
  const [newSilverRate, setNewSilverRate] = useState(silverRate.toString());
  const [newPlatinumRate, setNewPlatinumRate] = useState(platinumRate.toString());
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    const gold = parseFloat(newGoldRate);
    const silver = parseFloat(newSilverRate);
    const platinum = parseFloat(newPlatinumRate);

    if (isNaN(gold) || gold <= 0 || isNaN(silver) || silver <= 0 || isNaN(platinum) || platinum <= 0) {
      toast.error("Please enter valid positive rates");
      return;
    }

    setUpdating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to update rates");
        return;
      }

      const { error } = await supabase
        .from("vendor_profiles")
        .update({
          gold_rate_24k_per_gram: gold,
          silver_rate_per_gram: silver,
          platinum_rate_per_gram: platinum,
          gold_rate_updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id);

      if (error) throw error;

      onRatesUpdated({ goldRate: gold, silverRate: silver, platinumRate: platinum });
      toast.success("Metal rates updated successfully!");
    } catch (error) {
      console.error("Error updating rates:", error);
      toast.error("Failed to update metal rates");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Card className="border-2 border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30"
          >
            <TrendingUp className="h-4 w-4 text-amber-600" />
          </motion.div>
          <span className="bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent font-semibold">
            Today's Metal Rates
          </span>
          <Sparkles className="h-4 w-4 text-amber-500/50 ml-auto" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="goldRate" className="text-xs font-medium text-amber-700">
              Gold (24K/g)
            </Label>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₹</span>
              <Input
                id="goldRate"
                type="number"
                value={newGoldRate}
                onChange={(e) => setNewGoldRate(e.target.value)}
                className="pl-5 h-9 text-sm border-amber-500/30 focus:border-amber-500"
                placeholder="Gold"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="silverRate" className="text-xs font-medium text-slate-600">
              Silver (/g)
            </Label>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₹</span>
              <Input
                id="silverRate"
                type="number"
                value={newSilverRate}
                onChange={(e) => setNewSilverRate(e.target.value)}
                className="pl-5 h-9 text-sm border-slate-400/30 focus:border-slate-500"
                placeholder="Silver"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="platinumRate" className="text-xs font-medium text-slate-500">
              Platinum (/g)
            </Label>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₹</span>
              <Input
                id="platinumRate"
                type="number"
                value={newPlatinumRate}
                onChange={(e) => setNewPlatinumRate(e.target.value)}
                className="pl-5 h-9 text-sm border-slate-400/30 focus:border-slate-500"
                placeholder="Platinum"
              />
            </div>
          </div>
        </div>
        <Button
          onClick={handleUpdate}
          disabled={updating}
          size="sm"
          className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white"
        >
          {updating ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="mr-2"
              >
                <TrendingUp className="h-4 w-4" />
              </motion.div>
              Updating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Update Rates
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
