import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ROUTES } from "@/constants/routes";

interface BackToHomeButtonProps {
  variant?: "default" | "outline" | "ghost";
  showText?: boolean;
  className?: string;
}

export const BackToHomeButton = ({ 
  variant = "outline", 
  showText = true,
  className = ""
}: BackToHomeButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on homepage
  if (location.pathname === ROUTES.HOME) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Button
        variant={variant}
        onClick={() => navigate(ROUTES.HOME)}
        className={`group ${className}`}
      >
        <Home className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
        {showText && (
          <span className="hidden sm:inline">Back to Home</span>
        )}
      </Button>
    </motion.div>
  );
};

interface BackButtonProps {
  variant?: "default" | "outline" | "ghost";
  fallbackRoute?: string;
  className?: string;
}

export const BackButton = ({ 
  variant = "ghost",
  fallbackRoute = ROUTES.HOME,
  className = ""
}: BackButtonProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(fallbackRoute);
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleBack}
      className={`group ${className}`}
    >
      <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
      Back
    </Button>
  );
};
