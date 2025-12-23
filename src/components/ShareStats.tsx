import { motion } from "framer-motion";
import { Eye, TrendingUp, Zap, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ShareStatsProps {
  viewCount?: number;
  isExpiringSoon?: boolean;
  showTrending?: boolean;
}

export const ShareStats = ({ viewCount = 0, isExpiringSoon, showTrending }: ShareStatsProps) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* View Count Badge */}
      {viewCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <Badge
            variant="secondary"
            className="gap-1.5 bg-gradient-to-r from-primary/20 to-primary/10 border-primary/30 text-primary hover:from-primary/30 hover:to-primary/20"
          >
            <Eye className="h-3 w-3" />
            <span className="font-semibold">{viewCount.toLocaleString()}</span>
            <span className="text-xs">views</span>
          </Badge>
        </motion.div>
      )}

      {/* Trending Badge */}
      {showTrending && viewCount > 10 && (
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        >
          <Badge
            variant="secondary"
            className="gap-1.5 bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30 text-orange-700 dark:text-orange-400 hover:from-orange-500/30 hover:to-red-500/30"
          >
            <TrendingUp className="h-3 w-3 animate-pulse" />
            <span className="font-semibold">Trending</span>
          </Badge>
        </motion.div>
      )}

      {/* Expiring Soon Badge */}
      {isExpiringSoon && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          <Badge
            variant="secondary"
            className="gap-1.5 bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-500/30 text-red-700 dark:text-red-400 hover:from-red-500/30 hover:to-pink-500/30"
          >
            <Zap className="h-3 w-3" />
            <span className="font-semibold">Limited Time</span>
          </Badge>
        </motion.div>
      )}

      {/* Hot Badge for high engagement */}
      {viewCount > 50 && (
        <motion.div
          initial={{ scale: 0, rotate: 10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        >
          <Badge
            variant="secondary"
            className="gap-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-700 dark:text-purple-400 hover:from-purple-500/30 hover:to-pink-500/30"
          >
            <Users className="h-3 w-3" />
            <span className="font-semibold">🔥 Hot</span>
          </Badge>
        </motion.div>
      )}
    </div>
  );
};
