import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Gift, Frown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

interface ScratchCardProps {
  onClose?: () => void;
}

const leadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  businessName: z.string().optional(),
  interest: z.string().min(1, "Please select your interest"),
});

type LeadData = z.infer<typeof leadSchema>;

export function ScratchCard({ onClose }: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState<"form" | "scratch">("form");
  const [isScratching, setIsScratching] = useState(false);
  const [scratchedPercentage, setScratchedPercentage] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [leadData, setLeadData] = useState<LeadData>({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    interest: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LeadData, string>>>({});

  // Generate session ID
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
        setIsWinner(data.reward_type === "subscription");
        setIsRevealed(true);
        setStep("scratch");
      }
    };

    checkIfPlayed();
  }, [getSessionId]);

  // Initialize canvas
  useEffect(() => {
    if (step !== "scratch" || hasPlayed) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 300;

    // Gradient scratch layer
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#8B5CF6");
    gradient.addColorStop(0.5, "#EC4899");
    gradient.addColorStop(1, "#F59E0B");
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add overlay pattern
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 3 + 1;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
    }

    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "bold 28px Arial";
    ctx.textAlign = "center";
    ctx.fillText("✨ SCRATCH HERE ✨", canvas.width / 2, canvas.height / 2);
    ctx.font = "18px Arial";
    ctx.fillText("Discover Your Prize", canvas.width / 2, canvas.height / 2 + 35);
  }, [step, hasPlayed]);

  const handleInputChange = (field: keyof LeadData, value: string) => {
    setLeadData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateAndSubmit = async () => {
    try {
      leadSchema.parse(leadData);
      
      const sessionId = getSessionId();
      
      // Save lead to database
      const { error: leadError } = await supabase
        .from("scratch_leads")
        .insert({
          session_id: sessionId,
          name: leadData.name,
          email: leadData.email,
          phone: leadData.phone || null,
          business_name: leadData.businessName || null,
          interest: leadData.interest,
        });

      if (leadError) throw leadError;

      // Determine if winner (30% chance)
      const winner = Math.random() < 0.3;
      setIsWinner(winner);

      // Save reward result
      const { error: rewardError } = await supabase
        .from("scratch_rewards")
        .insert({
          session_id: sessionId,
          reward_type: winner ? "subscription" : "none",
          reward_value: winner ? "1 Month Free Professional Plan" : "Better luck next time",
          claimed: false,
        });

      if (rewardError) throw rewardError;

      toast.success("Welcome! Scratch the card to see your result.");
      setStep("scratch");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof LeadData, string>> = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof LeadData;
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  const scratch = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 35, 0, 2 * Math.PI);
    ctx.fill();

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparent++;
    }

    const percentage = (transparent / (pixels.length / 4)) * 100;
    setScratchedPercentage(percentage);

    if (percentage > 60 && !isRevealed) {
      setIsRevealed(true);
      if (isWinner) {
        toast.success("🎉 Congratulations! You won!");
      }
    }
  }, [isRevealed, isWinner]);

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

    toast.success("🎁 Reward claimed! Sign up to activate your free month.");
    if (onClose) onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          className="relative max-w-lg w-full bg-gradient-to-br from-background via-card to-background rounded-3xl border-2 border-primary/30 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-jewellery-from via-gemstone-from to-diamond-from p-8 text-center">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full bg-white/20 p-2 backdrop-blur-sm transition-all hover:bg-white/30 hover:scale-110"
            >
              <X className="h-5 w-5 text-white" />
            </button>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm shadow-lg"
            >
              <Gift className="h-10 w-10 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2">Exclusive Welcome Offer</h2>
            <p className="text-base text-white/95">Complete your details to reveal your reward</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {step === "form" ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
                  <Input
                    id="name"
                    value={leadData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="John Doe"
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={leadData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="john@example.com"
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={leadData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+1 234 567 890"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessName" className="text-sm font-medium">Business Name</Label>
                  <Input
                    id="businessName"
                    value={leadData.businessName}
                    onChange={(e) => handleInputChange("businessName", e.target.value)}
                    placeholder="Your Jewelry Business"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interest" className="text-sm font-medium">I'm interested in *</Label>
                  <select
                    id="interest"
                    value={leadData.interest}
                    onChange={(e) => handleInputChange("interest", e.target.value)}
                    className={`w-full rounded-md border bg-background px-3 py-2 text-sm ${
                      errors.interest ? "border-destructive" : "border-input"
                    }`}
                  >
                    <option value="">Select your interest</option>
                    <option value="catalog-management">Managing my jewelry catalog</option>
                    <option value="sharing">Sharing catalogs with customers</option>
                    <option value="team-management">Team & vendor management</option>
                    <option value="analytics">Analytics & insights</option>
                    <option value="all">All features</option>
                  </select>
                  {errors.interest && <p className="text-xs text-destructive">{errors.interest}</p>}
                </div>

                <Button
                  onClick={validateAndSubmit}
                  size="lg"
                  className="w-full mt-6 h-12 bg-gradient-to-r from-jewellery-from via-gemstone-from to-diamond-from hover:opacity-90 text-white font-semibold"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Reveal My Reward
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-3">
                  By continuing, you agree to receive updates about our platform
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="relative mx-auto flex h-[300px] w-full max-w-[400px] items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-jewellery-from/10 via-gemstone-from/10 to-diamond-from/10">
                  {/* Reward Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
                    {isWinner ? (
                      <>
                        <Sparkles className="h-20 w-20 text-jewellery-from animate-pulse" />
                        <h3 className="text-4xl font-bold bg-gradient-to-r from-jewellery-from via-gemstone-from to-diamond-from bg-clip-text text-transparent">
                          You Won!
                        </h3>
                        <p className="text-xl font-semibold text-foreground">1 Month Free</p>
                        <p className="text-base text-muted-foreground">Professional Plan Access</p>
                      </>
                    ) : (
                      <>
                        <Frown className="h-20 w-20 text-muted-foreground" />
                        <h3 className="text-3xl font-bold text-foreground">
                          Almost There!
                        </h3>
                        <p className="text-base text-muted-foreground">
                          Try again next time
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Sign up to explore all features
                        </p>
                      </>
                    )}
                  </div>

                  {/* Scratch Canvas */}
                  {!hasPlayed && !isRevealed && (
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

                <div className="mt-6 text-center space-y-4">
                  {!isRevealed && !hasPlayed && (
                    <p className="text-sm text-muted-foreground">
                      {scratchedPercentage > 0 
                        ? `Keep scratching... ${Math.round(scratchedPercentage)}%` 
                        : "Use your finger or mouse to scratch the card"}
                    </p>
                  )}

                  {isRevealed && isWinner && (
                    <>
                      <div className="flex items-center justify-center gap-2 text-sm font-medium text-primary">
                        <Sparkles className="h-4 w-4" />
                        <span>Congratulations! You're a winner!</span>
                      </div>
                      <Button
                        onClick={handleClaim}
                        size="lg"
                        className="w-full bg-gradient-to-r from-jewellery-from via-gemstone-from to-diamond-from hover:opacity-90"
                      >
                        Claim Your Free Month
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Sign up now to activate your professional plan
                      </p>
                    </>
                  )}

                  {isRevealed && !isWinner && (
                    <Button
                      onClick={onClose}
                      size="lg"
                      variant="outline"
                      className="w-full"
                    >
                      Explore Platform
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
