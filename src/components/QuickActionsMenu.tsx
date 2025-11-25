import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Share2, FileDown, Zap, X, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useKeyboardHeight } from "@/hooks/useKeyboardHeight";

interface QuickActionsMenuProps {
  onExportPDF: () => void;
}

export const QuickActionsMenu = ({ onExportPDF }: QuickActionsMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { keyboardHeight, isKeyboardVisible } = useKeyboardHeight();

  const actions = [
    {
      icon: Plus,
      label: "Add Product",
      onClick: () => navigate("/add-product"),
      gradient: "from-primary/20 to-primary/5",
      iconColor: "text-primary",
    },
    {
      icon: Share2,
      label: "Share Catalog",
      onClick: () => navigate("/share"),
      gradient: "from-blue-500/20 to-blue-500/5",
      iconColor: "text-blue-500",
    },
    {
      icon: ShoppingCart,
      label: "Purchase Inquiries",
      onClick: () => navigate("/purchase-inquiries"),
      gradient: "from-purple-500/20 to-purple-500/5",
      iconColor: "text-purple-500",
    },
    {
      icon: FileDown,
      label: "Export PDF",
      onClick: onExportPDF,
      gradient: "from-green-500/20 to-green-500/5",
      iconColor: "text-green-500",
    },
  ];

  // Calculate dynamic bottom position based on keyboard
  const bottomPosition = isKeyboardVisible 
    ? `${keyboardHeight + 16}px` 
    : '2rem';

  return (
    <motion.div 
      className="fixed right-8 z-50"
      animate={{ bottom: bottomPosition }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-20 right-0 flex flex-col gap-3 mb-2"
          >
            {actions.map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                className={`
                  group relative flex items-center gap-3 px-4 py-3 rounded-xl
                  bg-gradient-to-br ${action.gradient} backdrop-blur-sm
                  border border-border/50 shadow-lg hover:shadow-xl
                  transition-all duration-300 hover:scale-105
                `}
              >
                <div className={`
                  w-10 h-10 rounded-lg bg-background/50 flex items-center justify-center
                  ${action.iconColor} group-hover:scale-110 transition-transform duration-300
                `}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="font-medium text-foreground pr-2 whitespace-nowrap">
                  {action.label}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main toggle button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative w-16 h-16 rounded-full
          bg-gradient-to-br from-primary to-primary/80
          text-primary-foreground shadow-xl hover:shadow-2xl
          transition-all duration-300
          ${isOpen ? "rotate-45" : ""}
        `}
      >
        {/* Pulse animation when closed */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
        )}
        
        <div className="relative z-10 flex items-center justify-center">
          {isOpen ? (
            <X className="w-7 h-7" />
          ) : (
            <Zap className="w-7 h-7" />
          )}
        </div>
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="absolute right-full mr-4 top-1/2 -translate-y-1/2 whitespace-nowrap
              px-3 py-2 rounded-lg bg-background/95 backdrop-blur-sm
              border border-border/50 shadow-lg text-sm font-medium
              pointer-events-none"
          >
            Quick Actions
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
