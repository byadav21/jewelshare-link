import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Benefit {
  title: string;
  description: string;
  icon?: string;
}

interface PlanBenefitsShowcaseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planName: string;
  benefits: Benefit[];
}

export const PlanBenefitsShowcase = ({ 
  open, 
  onOpenChange, 
  planName, 
  benefits 
}: PlanBenefitsShowcaseProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-primary" />
            Welcome to {planName}!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-muted-foreground">
            Here's what you've just unlocked:
          </p>

          <div className="grid gap-3">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="relative group"
              >
                <div className="flex items-start gap-3 p-4 rounded-lg border border-border bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10 transition-all duration-300">
                  {/* Animated check icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: index * 0.1 + 0.2, type: "spring", bounce: 0.5 }}
                    className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center"
                  >
                    <Check className="h-5 w-5 text-primary" />
                  </motion.div>

                  <div className="flex-1 space-y-1">
                    <motion.h4
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                      className="font-semibold text-foreground"
                    >
                      {benefit.title}
                    </motion.h4>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.4 }}
                      className="text-sm text-muted-foreground"
                    >
                      {benefit.description}
                    </motion.p>
                  </div>

                  {/* Sparkle effect on hover */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute top-2 right-2"
                  >
                    <Sparkles className="h-4 w-4 text-primary" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: benefits.length * 0.1 + 0.5 }}
            className="flex justify-center pt-4"
          >
            <Button onClick={() => onOpenChange(false)} size="lg">
              Start Exploring
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
