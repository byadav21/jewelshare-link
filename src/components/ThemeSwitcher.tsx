import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check if user has manually set a preference
    const hasManualPreference = localStorage.getItem("theme-manual-override");
    
    if (!hasManualPreference) {
      // Auto-set theme based on time of day
      const hour = new Date().getHours();
      const autoTheme = hour >= 6 && hour < 18 ? "light" : "dark";
      setTheme(autoTheme);
    }
  }, [setTheme]);

  if (!mounted) {
    return null;
  }

  const handleThemeToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    // Mark that user has manually overridden the auto theme
    localStorage.setItem("theme-manual-override", "true");
  };

  return (
    <motion.button
      onClick={handleThemeToggle}
      className="fixed top-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary/20 bg-background/80 backdrop-blur-lg shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === "dark" ? (
          <motion.div
            key="sun"
            initial={{ y: -20, opacity: 0, rotate: -90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 20, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.3 }}
          >
            <Sun className="h-5 w-5 text-primary" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ y: -20, opacity: 0, rotate: 90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 20, opacity: 0, rotate: -90 }}
            transition={{ duration: 0.3 }}
          >
            <Moon className="h-5 w-5 text-primary" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};
