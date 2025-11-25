import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ScratchCardProps {
  onClose?: () => void;
}

export function ScratchCard({ onClose }: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchedPercentage, setScratchedPercentage] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [reward, setReward] = useState<string>("");
  const [hasPlayed, setHasPlayed] = useState(false);

  // Generate session ID (or use existing from localStorage)
  const getSessionId = useCallback(() => {
    let sessionId = localStorage.getItem("scratch_session_id");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("scratch_session_id", sessionId);
    }
    return sessionId;
  }, []);

  // Check if user has already played
  useEffect(() => {
    const checkIfPlayed = async () => {
      const sessionId = getSessionId();
      const { data, error } = await supabase
        .from("scratch_rewards")
        .select("*")
        .eq("session_id", sessionId)
        .single();

      if (data && !error) {
        setHasPlayed(true);
        setReward(data.reward_value);
        setIsRevealed(true);
      }
    };

    checkIfPlayed();
  }, [getSessionId]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || hasPlayed) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 300;

    // Create scratch layer gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#8B5CF6");
    gradient.addColorStop(0.5, "#EC4899");
    gradient.addColorStop(1, "#F59E0B");
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add sparkle pattern
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("✨ SCRATCH TO REVEAL ✨", canvas.width / 2, canvas.height / 2);
    ctx.font = "16px Arial";
    ctx.fillText("Your Exclusive Reward", canvas.width / 2, canvas.height / 2 + 30);
  }, [hasPlayed]);

  const scratch = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, 2 * Math.PI);
    ctx.fill();

    // Calculate scratched percentage
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparent++;
    }

    const percentage = (transparent / (pixels.length / 4)) * 100;
    setScratchedPercentage(percentage);

    if (percentage > 60 && !isRevealed) {
      revealReward();
    }
  }, [isRevealed]);

  const revealReward = useCallback(async () => {
    setIsRevealed(true);
    const sessionId = getSessionId();
    
    // Save to database
    const { error } = await supabase
      .from("scratch_rewards")
      .insert({
        session_id: sessionId,
        reward_type: "subscription",
        reward_value: "1 Month Free Professional Plan",
        claimed: false,
      });

    if (error) {
      console.error("Error saving reward:", error);
    }

    setReward("1 Month Free Professional Plan");
    toast.success("🎉 Congratulations! You won 1 Month Free!");
  }, [getSessionId]);

  const handleMouseDown = () => setIsScratching(true);
  const handleMouseUp = () => setIsScratching(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isScratching || hasPlayed) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    scratch(x, y);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isScratching || hasPlayed) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    scratch(x, y);
  };

  const handleClaim = async () => {
    const sessionId = getSessionId();
    
    const { error } = await supabase
      .from("scratch_rewards")
      .update({ claimed: true, claimed_at: new Date().toISOString() })
      .eq("session_id", sessionId);

    if (error) {
      toast.error("Failed to claim reward. Please contact support.");
      return;
    }

    toast.success("Reward claimed! Check your email for details.");
    if (onClose) onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative max-w-lg w-full bg-gradient-to-br from-background via-card to-background rounded-2xl border-2 border-primary/20 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-jewellery-from via-gemstone-from to-diamond-from p-6 text-center">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full bg-white/20 p-2 backdrop-blur-sm transition-colors hover:bg-white/30"
            >
              <X className="h-4 w-4 text-white" />
            </button>
            <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Gift className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Welcome Gift!</h2>
            <p className="text-sm text-white/90">Scratch the card to reveal your exclusive reward</p>
          </div>

          {/* Scratch Card */}
          <div className="p-6">
            <div className="relative mx-auto flex h-[300px] w-full max-w-[400px] items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-jewellery-from/10 via-gemstone-from/10 to-diamond-from/10">
              {/* Reward Content (behind scratch layer) */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
                <Sparkles className="h-16 w-16 text-jewellery-from animate-pulse" />
                <h3 className="text-3xl font-bold bg-gradient-to-r from-jewellery-from via-gemstone-from to-diamond-from bg-clip-text text-transparent">
                  {reward || "1 Month Free"}
                </h3>
                <p className="text-lg font-medium text-muted-foreground">
                  Professional Plan
                </p>
                <p className="text-sm text-muted-foreground">
                  Full access to all premium features
                </p>
              </div>

              {/* Scratch Canvas */}
              {!hasPlayed && (
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 cursor-pointer touch-none"
                  style={{ cursor: isScratching ? "grabbing" : "grab" }}
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleMouseDown}
                  onTouchEnd={handleMouseUp}
                  onTouchMove={handleTouchMove}
                />
              )}
            </div>

            {/* Instructions or Action */}
            <div className="mt-6 text-center">
              {!isRevealed && !hasPlayed && (
                <p className="text-sm text-muted-foreground">
                  {scratchedPercentage > 0 
                    ? `Keep scratching... ${Math.round(scratchedPercentage)}%` 
                    : "Use your mouse or finger to scratch the card"}
                </p>
              )}

              {isRevealed && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-primary">
                    <Sparkles className="h-4 w-4" />
                    <span>Congratulations on your reward!</span>
                  </div>
                  <Button
                    onClick={handleClaim}
                    size="lg"
                    className="w-full bg-gradient-to-r from-jewellery-from via-gemstone-from to-diamond-from hover:opacity-90"
                  >
                    Claim Your Free Month
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Sign up to activate your free professional plan
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
