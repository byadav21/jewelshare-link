import { motion } from "framer-motion";
import { Trophy, Star, TrendingUp } from "lucide-react";
import { useRewardsSystem } from "@/hooks/useRewardsSystem";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const getTierColor = (tier: string) => {
  const colors: Record<string, string> = {
    bronze: "text-orange-600 bg-orange-100 dark:bg-orange-900/20",
    silver: "text-gray-600 bg-gray-100 dark:bg-gray-800/20",
    gold: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20",
    platinum: "text-purple-600 bg-purple-100 dark:bg-purple-900/20",
  };
  return colors[tier] || colors.bronze;
};

const getNextTier = (currentTier: string) => {
  const tiers = {
    bronze: { next: 'silver', points: 500 },
    silver: { next: 'gold', points: 2000 },
    gold: { next: 'platinum', points: 5000 },
    platinum: { next: 'legend', points: 10000 }
  };
  return tiers[currentTier as keyof typeof tiers] || { next: 'silver', points: 500 };
};

export const RewardsWidget = () => {
  const { points, loading } = useRewardsSystem();

  if (loading || !points) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-20 bg-muted rounded"></div>
      </Card>
    );
  }

  const nextTierInfo = getNextTier(points.current_tier);
  const progressToNext = (points.total_points / nextTierInfo.points) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="p-5 bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Trophy className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Rewards</h3>
              <p className="text-sm text-muted-foreground">
                {points.total_points.toLocaleString()} points
              </p>
            </div>
          </div>
          <Badge className={getTierColor(points.current_tier)}>
            {points.current_tier.toUpperCase()}
          </Badge>
        </div>

        {points.current_tier !== 'platinum' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Next tier: {nextTierInfo.next}
              </span>
              <span className="font-medium text-foreground">
                {nextTierInfo.points - points.total_points} points
              </span>
            </div>
            <Progress value={Math.min(progressToNext, 100)} className="h-2" />
          </div>
        )}

        {points.current_tier === 'platinum' && (
          <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
            <Star className="h-4 w-4" fill="currentColor" />
            <span className="font-medium">Maximum tier achieved!</span>
          </div>
        )}
      </Card>
    </motion.div>
  );
};
