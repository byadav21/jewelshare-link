import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { LucideIcon } from "lucide-react";

interface AnimatedIconProps {
  icon: LucideIcon;
  className?: string;
  delay?: number;
  animation?: "bounce" | "rotate" | "scale" | "pulse";
}

export const AnimatedIcon = ({ 
  icon: Icon, 
  className = "", 
  delay = 0,
  animation = "scale" 
}: AnimatedIconProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  const animations = {
    bounce: {
      initial: { y: -20, opacity: 0 },
      animate: isInView ? {
        y: [0, -10, 0],
        opacity: 1,
        transition: {
          duration: 0.6,
          delay,
          y: {
            repeat: Infinity,
            repeatType: "reverse" as const,
            duration: 2,
            ease: "easeInOut"
          }
        }
      } : { y: -20, opacity: 0 }
    },
    rotate: {
      initial: { rotate: -180, opacity: 0 },
      animate: isInView ? {
        rotate: 0,
        opacity: 1,
        transition: {
          duration: 0.8,
          delay,
          ease: "easeOut"
        }
      } : { rotate: -180, opacity: 0 }
    },
    scale: {
      initial: { scale: 0, opacity: 0 },
      animate: isInView ? {
        scale: [1, 1.1, 1],
        opacity: 1,
        transition: {
          duration: 0.6,
          delay,
          scale: {
            repeat: Infinity,
            repeatType: "reverse" as const,
            duration: 2,
            ease: "easeInOut"
          }
        }
      } : { scale: 0, opacity: 0 }
    },
    pulse: {
      initial: { scale: 0.8, opacity: 0 },
      animate: isInView ? {
        scale: [1, 1.05, 1],
        opacity: [1, 0.8, 1],
        transition: {
          duration: 0.6,
          delay,
          scale: {
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut"
          },
          opacity: {
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut"
          }
        }
      } : { scale: 0.8, opacity: 0 }
    }
  };

  return (
    <motion.div
      ref={ref}
      {...animations[animation]}
    >
      <Icon className={className} />
    </motion.div>
  );
};
