import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Share2, FileDown, Zap, X, ShoppingCart, Trophy, Sparkles, FileText, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useKeyboardHeight } from "@/hooks/useKeyboardHeight";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { UpgradePromptDialog } from "@/components/UpgradePromptDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
interface QuickActionsMenuProps {
  onExportPDF: () => void;
  onAutoCategorize?: () => void;
}
export const QuickActionsMenu = ({
  onExportPDF,
  onAutoCategorize
}: QuickActionsMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [upgradeLimitType, setUpgradeLimitType] = useState<'products' | 'share_links' | undefined>();
  const {
    keyboardHeight,
    isKeyboardVisible
  } = useKeyboardHeight();
  const { canAddProducts, canAddShareLinks, productsRemaining, shareLinksRemaining } = usePlanLimits();
  const handleAddProduct = () => {
    if (!canAddProducts) {
      setUpgradeLimitType('products');
      setIsUpgradeDialogOpen(true);
      setIsOpen(false);
      return;
    }
    navigate("/add-product");
    setIsOpen(false);
  };

  const handleShareCatalog = () => {
    if (!canAddShareLinks) {
      setUpgradeLimitType('share_links');
      setIsUpgradeDialogOpen(true);
      setIsOpen(false);
      return;
    }
    navigate("/share");
    setIsOpen(false);
  };

  const getProductLabel = () => {
    if (!canAddProducts) return "Add Product (Limit reached)";
    if (productsRemaining !== Infinity && productsRemaining < 100) {
      return `Add Product (${productsRemaining} left)`;
    }
    return "Add Product";
  };

  const getShareLabel = () => {
    if (!canAddShareLinks) return "Share Catalog (Limit reached)";
    if (shareLinksRemaining !== Infinity && shareLinksRemaining < 100) {
      return `Share Catalog (${shareLinksRemaining} left)`;
    }
    return "Share Catalog";
  };

  const actions = [{
    icon: Plus,
    label: getProductLabel(),
    onClick: handleAddProduct,
    gradient: "from-primary/20 to-primary/5",
    iconColor: "text-primary",
    disabled: !canAddProducts,
    tooltip: !canAddProducts ? "Product limit reached" : undefined
  }, {
    icon: Share2,
    label: getShareLabel(),
    onClick: handleShareCatalog,
    gradient: "from-blue-500/20 to-blue-500/5",
    iconColor: "text-blue-500",
    disabled: !canAddShareLinks,
    tooltip: !canAddShareLinks ? "Share link limit reached" : undefined
  }, ...(onAutoCategorize ? [{
    icon: Sparkles,
    label: "Auto-Categorize",
    onClick: () => {
      onAutoCategorize();
      setIsOpen(false);
    },
    gradient: "from-violet-500/20 to-violet-500/5",
    iconColor: "text-violet-500",
    disabled: false,
    tooltip: "Automatically categorize products"
  }] : []), {
    icon: ShoppingCart,
    label: "Purchase Inquiries",
    onClick: () => {
      navigate("/purchase-inquiries");
      setIsOpen(false);
    },
    gradient: "from-purple-500/20 to-purple-500/5",
    iconColor: "text-purple-500",
    disabled: false
  }, {
    icon: Trophy,
    label: "Rewards",
    onClick: () => {
      navigate("/rewards");
      setIsOpen(false);
    },
    gradient: "from-yellow-500/20 to-yellow-500/5",
    iconColor: "text-yellow-500",
    disabled: false
  }, {
    icon: FileText,
    label: "Invoices",
    onClick: () => {
      navigate("/invoice-history");
      setIsOpen(false);
    },
    gradient: "from-orange-500/20 to-orange-500/5",
    iconColor: "text-orange-500",
    disabled: false
  }, {
    icon: History,
    label: "Estimates",
    onClick: () => {
      navigate("/estimate-history");
      setIsOpen(false);
    },
    gradient: "from-cyan-500/20 to-cyan-500/5",
    iconColor: "text-cyan-500",
    disabled: false
  }, {
    icon: FileDown,
    label: "Export PDF",
    onClick: () => {
      onExportPDF();
      setIsOpen(false);
    },
    gradient: "from-green-500/20 to-green-500/5",
    iconColor: "text-green-500",
    disabled: false
  }];

  // Calculate dynamic bottom position based on keyboard
  const bottomPosition = isKeyboardVisible ? `${keyboardHeight + 16}px` : '2rem';
  return (
    <>
      <motion.div className="fixed right-8 z-50" animate={{
    bottom: bottomPosition
  }} transition={{
    duration: 0.3,
    ease: "easeOut"
  }}>
      <AnimatePresence>
        {isOpen && <motion.div initial={{
        opacity: 0,
        scale: 0.8,
        y: 20
      }} animate={{
        opacity: 1,
        scale: 1,
        y: 0
      }} exit={{
        opacity: 0,
        scale: 0.8,
        y: 20
      }} transition={{
        duration: 0.2
      }} className="absolute bottom-20 right-0 flex flex-col gap-3 mb-2">
            {actions.map((action, index) => {
              const buttonContent = (
                <motion.button 
                  key={action.label} 
                  initial={{
                    opacity: 0,
                    x: 20
                  }} 
                  animate={{
                    opacity: 1,
                    x: 0
                  }} 
                  exit={{
                    opacity: 0,
                    x: 20
                  }} 
                  transition={{
                    delay: index * 0.05
                  }} 
                  onClick={() => {
                    if (!action.disabled) {
                      action.onClick();
                      setIsOpen(false);
                    }
                  }} 
                  disabled={action.disabled}
                  className={`
                    group relative flex items-center gap-3 px-4 py-3 rounded-xl
                    bg-gradient-to-br ${action.gradient} backdrop-blur-sm
                    border border-border/50 shadow-lg hover:shadow-xl
                    transition-all duration-300 hover:scale-105
                    ${action.disabled ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''}
                  `}
                >
                  <div className={`
                    w-10 h-10 rounded-lg bg-background/50 flex items-center justify-center
                    ${action.iconColor} group-hover:scale-110 transition-transform duration-300
                    ${action.disabled ? 'group-hover:scale-100' : ''}
                  `}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-foreground pr-2 whitespace-nowrap">
                    {action.label}
                  </span>
                </motion.button>
              );

              return action.tooltip ? (
                <TooltipProvider key={action.label}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {buttonContent}
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>{action.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : buttonContent;
            })}
          </motion.div>}
      </AnimatePresence>

      {/* Main toggle button */}
      <motion.button whileHover={{
      scale: 1.1
    }} whileTap={{
      scale: 0.95
    }} onClick={() => setIsOpen(!isOpen)} className={`
          relative w-16 h-16 rounded-full
          bg-gradient-to-br from-primary to-primary/80
          text-primary-foreground shadow-xl hover:shadow-2xl
          transition-all duration-300
          ${isOpen ? "rotate-45" : ""}
        `}>
        {/* Pulse animation when closed */}
        {!isOpen && <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />}
        
        
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {!isOpen && <motion.div initial={{
        opacity: 0,
        x: 10
      }} animate={{
        opacity: 1,
        x: 0
      }} exit={{
        opacity: 0,
        x: 10
      }} className="absolute right-full mr-4 top-1/2 -translate-y-1/2 whitespace-nowrap
              px-3 py-2 rounded-lg bg-background/95 backdrop-blur-sm
              border border-border/50 shadow-lg text-sm font-medium
              pointer-events-none">
            Quick Actions
          </motion.div>}
      </AnimatePresence>
    </motion.div>
    
    <UpgradePromptDialog
      open={isUpgradeDialogOpen}
      onOpenChange={setIsUpgradeDialogOpen}
      limitType={upgradeLimitType}
    />
  </>
  );
};