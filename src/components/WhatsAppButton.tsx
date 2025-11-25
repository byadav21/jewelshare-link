import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useKeyboardHeight } from "@/hooks/useKeyboardHeight";

export const WhatsAppButton = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("1234567890");
  const { keyboardHeight, isKeyboardVisible } = useKeyboardHeight();

  useEffect(() => {
    fetchWhatsAppNumber();
  }, []);

  const fetchWhatsAppNumber = async () => {
    const { data, error } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "whatsapp_number")
      .maybeSingle();

    if (!error && data) {
      // Remove quotes from JSON string value
      const number = String(data.value).replace(/"/g, "");
      setWhatsappNumber(number);
    }
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Hi! I'm interested in learning more about your jewelry catalog platform.");
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // Calculate dynamic bottom positions based on keyboard
  const expandedBottomPosition = isKeyboardVisible 
    ? `${keyboardHeight + 80}px` 
    : '6rem';
  
  const buttonBottomPosition = isKeyboardVisible 
    ? `${keyboardHeight + 16}px` 
    : '1rem';

  return (
    <>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              bottom: expandedBottomPosition
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed right-4 z-50 md:right-6"
          >
            <div className="relative rounded-lg border-2 border-emerald-500/20 bg-background p-4 shadow-2xl">
              <button
                onClick={() => setIsExpanded(false)}
                className="absolute -right-2 -top-2 rounded-full bg-background p-1 shadow-lg transition-colors hover:bg-muted"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
              
              <div className="w-64 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500">
                    <MessageCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Chat with us</p>
                    <p className="text-xs text-muted-foreground">We typically reply instantly</p>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Have questions about our jewelry catalog platform? We're here to help!
                </p>
                
                <Button
                  onClick={handleWhatsAppClick}
                  className="w-full gap-2 bg-emerald-500 hover:bg-emerald-600"
                >
                  <MessageCircle className="h-4 w-4" />
                  Start Chat on WhatsApp
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ 
          scale: 1,
          bottom: buttonBottomPosition
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed right-4 z-50 md:right-6"
      >
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          size="icon"
          className="h-14 w-14 rounded-full bg-emerald-500 shadow-2xl transition-all hover:bg-emerald-600 hover:scale-110"
          aria-label="Open WhatsApp chat"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
        
        {/* Pulse animation */}
        <span className="absolute -inset-1 rounded-full bg-emerald-500 opacity-75 animate-ping pointer-events-none" />
      </motion.div>
    </>
  );
};