import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, X, ChevronRight, Instagram, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FloatingQRCodesProps {
  instagramQrUrl?: string | null;
  whatsappQrUrl?: string | null;
}

export const FloatingQRCodes = ({ instagramQrUrl, whatsappQrUrl }: FloatingQRCodesProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Don't render if no QR codes available
  if (!instagramQrUrl && !whatsappQrUrl) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            // Collapsed state - Floating button
            <motion.div
              key="collapsed"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setIsExpanded(true)}
                    size="lg"
                    className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary hover:scale-110 transition-all duration-300 relative overflow-hidden group"
                  >
                    {/* Animated pulse ring */}
                    <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
                    
                    <QrCode className="h-7 w-7 text-primary-foreground relative z-10 group-hover:rotate-12 transition-transform" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" className="font-medium">
                  <p>Connect with us</p>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          ) : (
            // Expanded state - QR codes display
            <motion.div
              key="expanded"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <Card className="p-4 shadow-2xl border-2 border-primary/20 bg-card/95 backdrop-blur-xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Connect With Us</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(false)}
                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* QR Codes */}
                <div className="flex gap-4">
                  {instagramQrUrl && (
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="group cursor-pointer"
                    >
                      <div className="relative">
                        {/* QR Code Image */}
                        <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-primary/30 shadow-lg group-hover:border-primary/60 transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
                          <img
                            src={instagramQrUrl}
                            alt="Instagram QR Code"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Label */}
                        <div className="mt-2 flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                          <Instagram className="h-4 w-4" />
                          <span>Instagram</span>
                        </div>

                        {/* Scan indicator */}
                        <motion.div
                          className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-pink-500 shadow-lg"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [1, 0.8, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                      </div>
                    </motion.div>
                  )}

                  {whatsappQrUrl && (
                    <motion.div
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="group cursor-pointer"
                    >
                      <div className="relative">
                        {/* QR Code Image */}
                        <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-primary/30 shadow-lg group-hover:border-primary/60 transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
                          <img
                            src={whatsappQrUrl}
                            alt="WhatsApp QR Code"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Label */}
                        <div className="mt-2 flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                          <MessageCircle className="h-4 w-4" />
                          <span>WhatsApp</span>
                        </div>

                        {/* Scan indicator */}
                        <motion.div
                          className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 shadow-lg"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [1, 0.8, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.5,
                          }}
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Footer hint */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-xs text-center text-muted-foreground mt-4 pt-3 border-t border-border"
                >
                  Scan to connect instantly
                </motion.p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};
