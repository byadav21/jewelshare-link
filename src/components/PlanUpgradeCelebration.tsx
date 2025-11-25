import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Trophy, Zap, Star } from "lucide-react";
import confetti from "canvas-confetti";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface PlanUpgradeCelebrationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planName: string;
}

export const PlanUpgradeCelebration = ({ open, onOpenChange, planName }: PlanUpgradeCelebrationProps) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (open) {
      // Trigger confetti
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // Fire confetti from both sides
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      // Show content after brief delay
      setTimeout(() => setShowContent(true), 300);

      return () => {
        clearInterval(interval);
        setShowContent(false);
      };
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 overflow-hidden">
        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
              className="relative py-8 text-center"
            >
              {/* Floating Icons */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      x: `${Math.random() * 100}%`, 
                      y: "100%", 
                      opacity: 0,
                      rotate: 0
                    }}
                    animate={{ 
                      y: "-20%", 
                      opacity: [0, 1, 1, 0],
                      rotate: 360,
                      x: `${Math.random() * 100}%`
                    }}
                    transition={{ 
                      duration: 3, 
                      delay: i * 0.2,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                    className="absolute"
                  >
                    {i % 4 === 0 && <Star className="h-6 w-6 text-primary" />}
                    {i % 4 === 1 && <Sparkles className="h-5 w-5 text-accent" />}
                    {i % 4 === 2 && <Zap className="h-5 w-5 text-primary" />}
                    {i % 4 === 3 && <Star className="h-4 w-4 text-accent" fill="currentColor" />}
                  </motion.div>
                ))}
              </div>

              {/* Main Trophy Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  bounce: 0.6, 
                  duration: 0.8,
                  delay: 0.2
                }}
                className="inline-flex items-center justify-center mb-6"
              >
                <div className="relative">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, -10, 10, -10, 0]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl"
                  >
                    <Trophy className="h-12 w-12 text-primary-foreground" />
                  </motion.div>
                  
                  {/* Pulse rings */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        delay: i * 0.6
                      }}
                      className="absolute inset-0 rounded-full border-4 border-primary"
                    />
                  ))}
                </div>
              </motion.div>

              {/* Success Text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <motion.h2
                  animate={{ 
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    repeatDelay: 0.5
                  }}
                  className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-3"
                >
                  🎉 Congratulations! 🎉
                </motion.h2>
                
                <p className="text-xl font-semibold text-foreground mb-2">
                  Welcome to {planName}!
                </p>
                
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Your account has been upgraded successfully. Enjoy your new features and expanded limits!
                </p>
              </motion.div>

              {/* Sparkle Effects */}
              <div className="absolute top-4 right-4">
                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity 
                  }}
                >
                  <Sparkles className="h-8 w-8 text-primary" />
                </motion.div>
              </div>
              
              <div className="absolute bottom-4 left-4">
                <motion.div
                  animate={{ 
                    rotate: -360,
                    scale: [1, 1.3, 1]
                  }}
                  transition={{ 
                    duration: 2.5, 
                    repeat: Infinity 
                  }}
                >
                  <Zap className="h-8 w-8 text-accent" />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
