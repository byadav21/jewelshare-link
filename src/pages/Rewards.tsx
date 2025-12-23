import { useState, useEffect } from "react";
import { useRewardsSystem } from "@/hooks/useRewardsSystem";
import { useMilestones } from "@/hooks/useMilestones";
import { useRedemptions } from "@/hooks/useRedemptions";
import { ApprovalGuard } from "@/components/ApprovalGuard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Package, Share2, Eye, ArrowLeft, Gift, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RewardCard } from "@/components/RewardCard";

const Rewards = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { points, history, loading: pointsLoading, refetch: refetchPoints } = useRewardsSystem();
  const { milestones, loading: milestonesLoading } = useMilestones();
  const { redemptions, refetch: refetchRedemptions } = useRedemptions();
  const [rewardsCatalog, setRewardsCatalog] = useState<any[]>([]);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  const loading = pointsLoading || milestonesLoading;

  useEffect(() => {
    fetchRewardsCatalog();
  }, []);

  const fetchRewardsCatalog = async () => {
    const { data, error } = await supabase
      .from('rewards_catalog')
      .select('*')
      .eq('is_active', true)
      .order('points_cost', { ascending: true });

    if (!error && data) {
      setRewardsCatalog(data);
    }
  };

  const handleRedeem = async (rewardId: string) => {
    setRedeemingId(rewardId);
    try {
      const { data, error } = await supabase.functions.invoke('redeem-reward', {
        body: { reward_id: rewardId }
      });

      if (error) throw error;

      toast({
        title: "Reward Redeemed!",
        description: "Your reward has been successfully applied to your account.",
      });

      await refetchPoints();
      await refetchRedemptions();
    } catch (error: any) {
      toast({
        title: "Redemption Failed",
        description: error.message || "Unable to redeem reward. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRedeemingId(null);
    }
  };

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      bronze: "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
      silver: "bg-gray-100 text-gray-700 dark:bg-gray-800/20 dark:text-gray-400",
      gold: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
      platinum: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
    };
    return colors[tier] || colors.bronze;
  };

  const getNextTier = (currentTier: string) => {
    const tiers: Record<string, { next: string; points: number }> = {
      bronze: { next: 'Silver', points: 500 },
      silver: { next: 'Gold', points: 2000 },
      gold: { next: 'Platinum', points: 5000 },
      platinum: { next: 'Legend', points: 10000 }
    };
    return tiers[currentTier] || { next: 'Silver', points: 500 };
  };

  const getActionIcon = (actionType: string) => {
    const icons: Record<string, any> = {
      'product_added': Package,
      'share_link_created': Share2,
      'product_viewed': Eye,
      'first_product': Package,
      'profile_completed': Gift
    };
    return icons[actionType] || Star;
  };

  if (loading) {
    return (
      <ApprovalGuard>
        <div className="min-h-screen bg-background p-6">
          <div className="container mx-auto max-w-6xl">
            <div className="animate-pulse space-y-6">
              <div className="h-10 bg-muted rounded w-1/4"></div>
              <div className="h-40 bg-muted rounded"></div>
              <div className="h-60 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </ApprovalGuard>
    );
  }

  const nextTierInfo = points ? getNextTier(points.current_tier) : null;
  const progressToNext = points && nextTierInfo 
    ? (points.total_points / nextTierInfo.points) * 100 
    : 0;

  return (
    <ApprovalGuard>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
        <div className="container mx-auto max-w-6xl p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/catalog")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Rewards & Achievements</h1>
              <p className="text-muted-foreground">Track your progress and earn rewards</p>
            </div>
          </div>

          {/* Points Overview */}
          {points && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="bg-gradient-to-br from-primary/10 via-background to-accent/10 border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <Trophy className="h-8 w-8 text-primary-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">
                          {points.total_points.toLocaleString()} Points
                        </CardTitle>
                        <CardDescription>Your total reward points</CardDescription>
                      </div>
                    </div>
                    <Badge className={getTierColor(points.current_tier)} variant="secondary">
                      {points.current_tier.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                {nextTierInfo && points.current_tier !== 'platinum' && (
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Progress to {nextTierInfo.next}
                        </span>
                        <span className="font-medium">
                          {nextTierInfo.points - points.total_points} points to go
                        </span>
                      </div>
                      <Progress value={Math.min(progressToNext, 100)} className="h-3" />
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Milestones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Achievements
                </CardTitle>
                <CardDescription>Milestones you've unlocked</CardDescription>
              </CardHeader>
              <CardContent>
                {milestones.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No achievements yet. Keep growing!</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {milestones.map((milestone, index) => (
                      <motion.div
                        key={milestone.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <Trophy className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {milestone.milestone_type.replace(/_/g, ' ').toUpperCase()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(milestone.achieved_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <Badge variant="secondary" className="flex-shrink-0">
                          +{milestone.points_awarded} pts
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Points you've earned recently</CardDescription>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Gift className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No activity yet. Start earning points!</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {history.map((item, index) => {
                      const IconComponent = getActionIcon(item.action_type);
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {item.action_type.replace(/_/g, ' ').toUpperCase()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(item.created_at), 'MMM d, yyyy h:mm a')}
                            </p>
                          </div>
                          <Badge 
                            variant={item.points > 0 ? "default" : "secondary"}
                            className="flex-shrink-0"
                          >
                            {item.points > 0 ? '+' : ''}{item.points} pts
                          </Badge>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Redeem Rewards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                Redeem Rewards
              </CardTitle>
              <CardDescription>Exchange your points for exclusive perks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rewardsCatalog.map((reward) => (
                  <RewardCard
                    key={reward.id}
                    reward={reward}
                    userPoints={points?.total_points || 0}
                    onRedeem={handleRedeem}
                    isRedeeming={redeemingId === reward.id}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* How to Earn Points */}
          <Card>
            <CardHeader>
              <CardTitle>How to Earn Points</CardTitle>
              <CardDescription>Actions that reward you with points</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { action: 'Add a product', points: 10, icon: Package },
                  { action: 'Create share link', points: 20, icon: Share2 },
                  { action: 'Complete profile', points: 30, icon: Gift },
                  { action: 'First product', points: 50, icon: Star },
                ].map((item) => (
                  <div
                    key={item.action}
                    className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.action}</p>
                      <p className="text-xs text-muted-foreground">+{item.points} points</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ApprovalGuard>
  );
};

export default Rewards;
