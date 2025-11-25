import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Package, Share2, Eye, Star, TrendingUp } from "lucide-react";
import confetti from "canvas-confetti";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { playSuccessChime } from "@/utils/celebrationSounds";

interface MilestoneCelebrationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestoneType: string;
  milestoneValue: number;
  pointsAwarded: number;
}

const getMilestoneDetails = (type: string, value: number) => {
  const details: Record<string, any> = {
    'products_added': {
      icon: Package,
      title: `${value} Products Milestone! 🎉`,
      message: `You've added ${value} products to your catalog!`,
      color: "text-blue-500",
      gradient: "from-blue-500/20 to-blue-500/5"
    },
    'first_share_link': {
      icon: Share2,
      title: "First Share Link! 🚀",
      message: "You've created your first shareable catalog link!",
      color: "text-green-500",
      gradient: "from-green-500/20 to-green-500/5"
    },
    'share_links_created': {
      icon: Share2,
      title: `${value} Share Links! 📈`,
      message: `You've created ${value} share links!`,
      color: "text-green-500",
      gradient: "from-green-500/20 to-green-500/5"
    },
    'total_views': {
      icon: Eye,
      title: `${value} Views Milestone! 👀`,
      message: `Your catalogs have reached ${value} views!`,
      color: "text-purple-500",
      gradient: "from-purple-500/20 to-purple-500/5"
    },
    'first_sale': {
      icon: TrendingUp,
      title: "First Sale! 💰",
      message: "Congratulations on your first sale!",
      color: "text-yellow-500",
      gradient: "from-yellow-500/20 to-yellow-500/5"
    }
  };

  return details[type] || {
    icon: Star,
    title: "Milestone Achieved! ⭐",
    message: "You've reached a new milestone!",
    color: "text-primary",
    gradient: "from-primary/20 to-primary/5"
  };
};

export const MilestoneCelebration = ({ 
  open, 
  onOpenChange, 
  milestoneType,
  milestoneValue,
  pointsAwarded
}: MilestoneCelebrationProps) => {
  const [showContent, setShowContent] = useState(false);
  const details = getMilestoneDetails(milestoneType, milestoneValue);
  const IconComponent = details.icon;

  useEffect(() => {
    if (open) {
      // Play success sound
      playSuccessChime();
      
      // Trigger confetti
      const duration = 2000;
      const animationEnd = Date.now() + duration;

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 40 * (timeLeft / duration);
        
        confetti({
          particleCount,
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          zIndex: 9999,
          origin: { x: randomInRange(0.3, 0.7), y: Math.random() - 0.1 }
        });
      }, 250);

      setTimeout(() => setShowContent(true), 200);

      return () => {
        clearInterval(interval);
        setShowContent(false);
      };
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-0 bg-gradient-to-br from-background via-primary/5 to-accent/5 overflow-hidden">
        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
              className="relative py-6 text-center"
            >
              {/* Floating stars */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      x: `${Math.random() * 100}%`, 
                      y: "100%", 
                      opacity: 0,
                      scale: 0
                    }}
                    animate={{ 
                      y: "-10%", 
                      opacity: [0, 1, 1, 0],
                      scale: [0, 1, 1, 0],
                      rotate: 360
                    }}
                    transition={{ 
                      duration: 2, 
                      delay: i * 0.1,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                    className="absolute"
                  >
                    <Star className="h-6 w-6 text-primary" fill="currentColor" />
                  </motion.div>
                ))}
              </div>

              {/* Trophy Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  bounce: 0.6, 
                  duration: 0.7
                }}
                className="inline-flex items-center justify-center mb-5"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, -5, 5, 0]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    repeatDelay: 0.5
                  }}
                  className={`w-20 h-20 rounded-full bg-gradient-to-br ${details.gradient} flex items-center justify-center shadow-lg border border-border/50`}
                >
                  <IconComponent className={`h-10 w-10 ${details.color}`} />
                </motion.div>
              </motion.div>

              {/* Milestone Text */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {details.title}
                </h2>
                
                <p className="text-muted-foreground mb-4">
                  {details.message}
                </p>
              </motion.div>

              {/* Points Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring", bounce: 0.6 }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30"
              >
                <Trophy className="h-5 w-5 text-primary" />
                <span className="text-lg font-bold text-foreground">
                  +{pointsAwarded} Points
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
