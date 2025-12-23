import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, Crown, Infinity, Check, PartyPopper } from "lucide-react";

interface UnlimitedUnlockedCelebrationProps {
  show: boolean;
  onClose: () => void;
}

export const UnlimitedUnlockedCelebration = ({
  show,
  onClose,
}: UnlimitedUnlockedCelebrationProps) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (show) {
      // Fire confetti
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ["#FFD700", "#FFA500", "#FF6347", "#9370DB", "#00CED1"],
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ["#FFD700", "#FFA500", "#FF6347", "#9370DB", "#00CED1"],
        });
      }, 250);

      // Progress through steps
      const stepTimer1 = setTimeout(() => setStep(1), 800);
      const stepTimer2 = setTimeout(() => setStep(2), 1600);
      const stepTimer3 = setTimeout(() => setStep(3), 2400);

      return () => {
        clearInterval(interval);
        clearTimeout(stepTimer1);
        clearTimeout(stepTimer2);
        clearTimeout(stepTimer3);
      };
    }
  }, [show]);

  const features = [
    { Icon: Infinity, text: "Unlimited calculations", color: "text-primary" },
    { Icon: Zap, text: "Compare unlimited diamonds", color: "text-orange-500" },
    { Icon: Crown, text: "Save calculation history", color: "text-yellow-500" },
    { Icon: Sparkles, text: "Export all comparisons", color: "text-purple-500" },
  ];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="relative overflow-hidden border-2 border-primary shadow-2xl max-w-md mx-4">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-orange-500/10 animate-pulse" />
              
              {/* Sparkle effects */}
              <motion.div
                className="absolute top-4 left-4"
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: 999999,
                  ease: "easeInOut"
                }}
              >
                <Sparkles className="h-6 w-6 text-yellow-500" />
              </motion.div>
              
              <motion.div
                className="absolute top-4 right-4"
                animate={{ 
                  rotate: [360, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: 999999,
                  ease: "easeInOut",
                  delay: 1
                }}
              >
                <Sparkles className="h-6 w-6 text-purple-500" />
              </motion.div>

              <div className="relative p-8 text-center space-y-6">
                {/* Main icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.2
                  }}
                  className="flex justify-center"
                >
                  <div className="relative">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: 999999,
                        ease: "easeInOut"
                      }}
                      className="w-20 h-20 rounded-full bg-gradient-to-br from-primary via-purple-500 to-orange-500 flex items-center justify-center"
                    >
                      <PartyPopper className="h-10 w-10 text-white" />
                    </motion.div>
                    <motion.div
                      className="absolute -inset-2 rounded-full border-4 border-primary/30"
                      animate={{ 
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 0, 0.5]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: 999999,
                        ease: "easeInOut"
                      }}
                    />
                  </div>
                </motion.div>

                {/* Title */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Badge className="mb-3 bg-gradient-to-r from-primary to-purple-500 text-white">
                    <Crown className="h-3 w-3 mr-1" />
                    Unlimited Access Unlocked!
                  </Badge>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-orange-500 bg-clip-text text-transparent">
                    Welcome Back!
                  </h2>
                  <p className="text-muted-foreground mt-2">
                    You now have unlimited access to all diamond calculator features
                  </p>
                </motion.div>

                {/* Features list */}
                <div className="space-y-3">
                  {features.map((feature, index) => {
                    const IconComponent = feature.Icon;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ 
                          opacity: step > index ? 1 : 0.3,
                          x: step > index ? 0 : -20,
                          scale: step === index + 1 ? [1, 1.05, 1] : 1
                        }}
                        transition={{ 
                          delay: 0.6 + index * 0.1,
                          scale: { duration: 0.3 }
                        }}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 ${
                          step > index 
                            ? "border-primary/50 bg-primary/5" 
                            : "border-muted bg-muted/30"
                        }`}
                      >
                        <div className={`${feature.color}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <span className={`text-sm font-medium ${
                          step > index ? "text-foreground" : "text-muted-foreground"
                        }`}>
                          {feature.text}
                        </span>
                        {step > index && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="ml-auto"
                          >
                            <Check className="h-4 w-4 text-primary" />
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                >
                  <Button
                    onClick={onClose}
                    className="w-full bg-gradient-to-r from-primary via-purple-500 to-orange-500 hover:from-primary/90 hover:via-purple-500/90 hover:to-orange-500/90 text-white font-semibold group"
                  >
                    Start Calculating
                    <Zap className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                  </Button>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
