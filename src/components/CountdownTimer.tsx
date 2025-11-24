import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CountdownTimerProps {
  expiresAt: string;
}

export const CountdownTimer = ({ expiresAt }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(expiresAt).getTime() - new Date().getTime();
      
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return null;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  if (!timeLeft) {
    return (
      <Alert variant="destructive" className="border-red-500/50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>This catalog has expired</AlertDescription>
      </Alert>
    );
  }

  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 6;
  const showDays = timeLeft.days > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`inline-flex items-center gap-3 px-4 py-3 rounded-xl border-2 ${
        isUrgent
          ? "bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/30"
          : "bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30"
      }`}
    >
      <div className="flex items-center gap-2">
        <Clock className={`h-4 w-4 ${isUrgent ? "text-red-600 dark:text-red-400" : "text-primary"}`} />
        <span className={`text-sm font-semibold ${isUrgent ? "text-red-700 dark:text-red-400" : "text-foreground"}`}>
          {isUrgent ? "⚡ Expiring Soon:" : "Available for:"}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <AnimatePresence mode="wait">
          {showDays && (
            <TimeUnit
              key="days"
              value={timeLeft.days}
              label="d"
              isUrgent={isUrgent}
            />
          )}
          <TimeUnit
            key="hours"
            value={timeLeft.hours}
            label="h"
            isUrgent={isUrgent}
          />
          <TimeUnit
            key="minutes"
            value={timeLeft.minutes}
            label="m"
            isUrgent={isUrgent}
          />
          {isUrgent && (
            <TimeUnit
              key="seconds"
              value={timeLeft.seconds}
              label="s"
              isUrgent={isUrgent}
              animate
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

interface TimeUnitProps {
  value: number;
  label: string;
  isUrgent: boolean;
  animate?: boolean;
}

const TimeUnit = ({ value, label, isUrgent, animate }: TimeUnitProps) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        ...(animate && {
          scale: [1, 1.1, 1],
        })
      }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ 
        duration: animate ? 1 : 0.2,
        repeat: animate ? Infinity : 0,
      }}
      className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
        isUrgent
          ? "bg-red-500/20 text-red-700 dark:text-red-300"
          : "bg-primary/20 text-primary"
      }`}
    >
      <span className="text-base font-bold tabular-nums min-w-[1.5ch]">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-xs font-medium opacity-80">{label}</span>
    </motion.div>
  );
};
