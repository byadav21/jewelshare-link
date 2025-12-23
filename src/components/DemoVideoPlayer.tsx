import { useState } from "react";
import { Play, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DemoVideoPlayerProps {
  videoUrl?: string;
  thumbnailUrl?: string;
}

export const DemoVideoPlayer = ({ 
  videoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ",
  thumbnailUrl 
}: DemoVideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl border-2 bg-gradient-to-br from-jewellery-from/10 via-gemstone-from/10 to-diamond-from/10 shadow-2xl">
      <AnimatePresence mode="wait">
        {!isPlaying ? (
          <motion.div
            key="thumbnail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex h-full items-center justify-center bg-gradient-to-br from-background/90 via-background/95 to-background/90 backdrop-blur-sm"
          >
            {thumbnailUrl && (
              <img 
                src={thumbnailUrl} 
                alt="Video thumbnail" 
                className="absolute inset-0 h-full w-full object-cover opacity-30"
              />
            )}
            <div className="relative z-10 text-center">
              <motion.button
                onClick={handlePlay}
                className="group mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-jewellery-from to-diamond-from shadow-2xl transition-all hover:shadow-3xl"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Play video"
              >
                <Play className="h-12 w-12 text-white translate-x-1" fill="white" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-jewellery-from to-diamond-from opacity-0 blur-xl transition-opacity group-hover:opacity-50" />
              </motion.button>
              <motion.h3 
                className="mb-2 text-3xl font-bold font-serif bg-gradient-to-r from-jewellery-from via-gemstone-from to-diamond-from bg-clip-text text-transparent"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Interactive Platform Demo
              </motion.h3>
              <motion.p 
                className="text-lg text-muted-foreground"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                3-minute walkthrough of key features
              </motion.p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="video"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 h-full w-full"
          >
            <iframe
              src={`${videoUrl}?autoplay=1&rel=0&modestbranding=1`}
              title="Platform Demo Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
