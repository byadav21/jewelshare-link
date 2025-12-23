import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/useWishlist";
import { motion } from "framer-motion";

interface WishlistButtonProps {
  productId: string;
  shareLinkId?: string;
  variant?: "default" | "icon";
  className?: string;
}

export const WishlistButton = ({ 
  productId, 
  shareLinkId,
  variant = "icon",
  className 
}: WishlistButtonProps) => {
  const { addToWishlist, removeFromWishlist, isInWishlist, loading } = useWishlist();
  const [isAnimating, setIsAnimating] = useState(false);
  const inWishlist = isInWishlist(productId);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);

    if (inWishlist) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId, shareLinkId);
    }
  };

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        disabled={loading}
        className={`h-8 w-8 hover:bg-background/80 ${className}`}
      >
        <motion.div
          animate={isAnimating ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <Heart 
            className={`h-4 w-4 transition-colors ${
              inWishlist 
                ? 'fill-red-500 text-red-500' 
                : 'text-muted-foreground hover:text-red-500'
            }`}
          />
        </motion.div>
      </Button>
    );
  }

  return (
    <Button
      variant={inWishlist ? "default" : "outline"}
      size="sm"
      onClick={handleClick}
      disabled={loading}
      className={`gap-2 ${
        inWishlist 
          ? 'bg-red-500 hover:bg-red-600 text-white' 
          : 'hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500'
      } ${className}`}
    >
      <motion.div
        animate={isAnimating ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Heart 
          className={`h-4 w-4 ${inWishlist ? 'fill-current' : ''}`}
        />
      </motion.div>
      {inWishlist ? 'Saved' : 'Save'}
    </Button>
  );
};
