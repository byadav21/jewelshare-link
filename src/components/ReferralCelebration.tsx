import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Heart, Gift, Star } from "lucide-react";
import confetti from "canvas-confetti";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { playReferralSound } from "@/utils/celebrationSounds";

interface ReferralCelebrationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referralType: 'team_member' | 'customer';
  referredName?: string;
}

export const ReferralCelebration = ({ 
  open, 
  onOpenChange, 
  referralType,
  referredName 
}: ReferralCelebrationProps) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (open) {
      // Play referral sound
      playReferralSound();
      
      // Trigger confetti with custom colors
      const duration = 2500;
      const animationEnd = Date.now() + duration;
      const colors = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 30 * (timeLeft / duration);
        
        confetti({
          particleCount,
          startVelocity: 25,
          spread: 360,
          ticks: 50,
          zIndex: 9999,
          origin: { x: randomInRange(0.2, 0.8), y: Math.random() - 0.1 },
          colors: colors
        });
      }, 200);

      setTimeout(() => setShowContent(true), 200);

      return () => {
        clearInterval(interval);
        setShowContent(false);
      };
    }
  }, [open]);

  const content = referralType === 'team_member' ? {
    icon: Users,
    title: "Team Member Added! 🎉",
    subtitle: referredName ? `${referredName} joined your team` : "New team member joined",
    message: "Your team is growing! Collaboration makes everything better.",
    color: "text-blue-500"
  } : {
    icon: Heart,
    title: "New Customer! 🎊",
    subtitle: referredName ? `${referredName} joined` : "New customer signed up",
    message: "Your referrals are helping grow the community!",
    color: "text-pink-500"
  };

  const IconComponent = content.icon;

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
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      x: `${Math.random() * 100}%`, 
                      y: "100%", 
                      opacity: 0,
                      rotate: 0
                    }}
                    animate={{ 
                      y: "-10%", 
                      opacity: [0, 1, 1, 0],
                      rotate: 180,
                      x: `${(Math.random() * 100)}%`
                    }}
                    transition={{ 
                      duration: 2.5, 
                      delay: i * 0.15,
                      repeat: Infinity,
                      repeatDelay: 0.5
                    }}
                    className="absolute"
                  >
                    {i % 3 === 0 && <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />}
                    {i % 3 === 1 && <Gift className="h-4 w-4 text-primary" />}
                    {i % 3 === 2 && <Heart className="h-4 w-4 text-pink-500" />}
                  </motion.div>
                ))}
              </div>

              {/* Main Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  bounce: 0.5, 
                  duration: 0.6
                }}
                className="inline-flex items-center justify-center mb-4"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, -5, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    repeatDelay: 0.5
                  }}
                  className={`w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-lg`}
                >
                  <IconComponent className={`h-10 w-10 ${content.color}`} />
                </motion.div>
              </motion.div>

              {/* Success Text */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {content.title}
                </h2>
                
                <p className="text-lg font-semibold text-primary mb-1">
                  {content.subtitle}
                </p>
                
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  {content.message}
                </p>
              </motion.div>

              {/* Bonus badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring", bounce: 0.6 }}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30"
              >
                <Gift className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  Referral Bonus Earned!
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
