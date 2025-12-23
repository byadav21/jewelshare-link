import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, Package, Link2, Headphones, Check } from "lucide-react";

interface RewardCardProps {
  reward: {
    id: string;
    name: string;
    description: string;
    points_cost: number;
    reward_type: string;
    reward_value: any;
  };
  userPoints: number;
  onRedeem: (rewardId: string) => void;
  isRedeeming: boolean;
}

const getRewardIcon = (type: string) => {
  const icons: Record<string, any> = {
    extra_products: Package,
    extra_share_links: Link2,
    premium_support: Headphones,
  };
  return icons[type] || Gift;
};

export const RewardCard = ({ reward, userPoints, onRedeem, isRedeeming }: RewardCardProps) => {
  const canAfford = userPoints >= reward.points_cost;
  const IconComponent = getRewardIcon(reward.reward_type);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`relative overflow-hidden ${!canAfford ? 'opacity-60' : ''}`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl" />
        
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <IconComponent className="h-6 w-6 text-primary" />
            </div>
            <Badge variant={canAfford ? "default" : "secondary"}>
              {reward.points_cost} points
            </Badge>
          </div>
          <CardTitle className="text-lg">{reward.name}</CardTitle>
          {reward.description && (
            <CardDescription>{reward.description}</CardDescription>
          )}
        </CardHeader>
        
        <CardContent>
          <Button
            onClick={() => onRedeem(reward.id)}
            disabled={!canAfford || isRedeeming}
            className="w-full"
            variant={canAfford ? "default" : "outline"}
          >
            {isRedeeming ? (
              "Redeeming..."
            ) : canAfford ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Redeem Now
              </>
            ) : (
              "Not Enough Points"
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};