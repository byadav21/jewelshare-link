import { useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { cn } from "@/lib/utils";
import { 
  Diamond, 
  Ruler, 
  Scale, 
  Sparkles, 
  Info,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Hand
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Diamond shape data with mm sizes for different carat weights
const DIAMOND_SHAPES = {
  round: {
    name: "Round Brilliant",
    description: "The most popular and brilliant diamond shape",
    icon: "●",
    sizes: [
      { carat: 0.25, mm: "4.1", depth: "2.5" },
      { carat: 0.50, mm: "5.2", depth: "3.1" },
      { carat: 0.75, mm: "5.8", depth: "3.5" },
      { carat: 1.00, mm: "6.5", depth: "3.9" },
      { carat: 1.25, mm: "6.9", depth: "4.2" },
      { carat: 1.50, mm: "7.4", depth: "4.5" },
      { carat: 1.75, mm: "7.8", depth: "4.7" },
      { carat: 2.00, mm: "8.2", depth: "4.9" },
      { carat: 2.50, mm: "8.8", depth: "5.3" },
      { carat: 3.00, mm: "9.3", depth: "5.6" },
      { carat: 4.00, mm: "10.2", depth: "6.1" },
      { carat: 5.00, mm: "11.0", depth: "6.6" },
    ],
  },
  princess: {
    name: "Princess Cut",
    description: "Square shape with brilliant faceting",
    icon: "◆",
    sizes: [
      { carat: 0.25, mm: "3.3 x 3.3", depth: "2.4" },
      { carat: 0.50, mm: "4.2 x 4.2", depth: "3.0" },
      { carat: 0.75, mm: "4.8 x 4.8", depth: "3.4" },
      { carat: 1.00, mm: "5.5 x 5.5", depth: "3.9" },
      { carat: 1.25, mm: "5.9 x 5.9", depth: "4.2" },
      { carat: 1.50, mm: "6.2 x 6.2", depth: "4.5" },
      { carat: 1.75, mm: "6.5 x 6.5", depth: "4.7" },
      { carat: 2.00, mm: "7.0 x 7.0", depth: "5.0" },
      { carat: 2.50, mm: "7.5 x 7.5", depth: "5.4" },
      { carat: 3.00, mm: "8.0 x 8.0", depth: "5.7" },
      { carat: 4.00, mm: "8.8 x 8.8", depth: "6.3" },
      { carat: 5.00, mm: "9.5 x 9.5", depth: "6.8" },
    ],
  },
  oval: {
    name: "Oval",
    description: "Elongated shape with brilliant sparkle",
    icon: "⬭",
    sizes: [
      { carat: 0.25, mm: "5.0 x 3.5", depth: "2.2" },
      { carat: 0.50, mm: "6.0 x 4.0", depth: "2.6" },
      { carat: 0.75, mm: "7.0 x 5.0", depth: "3.0" },
      { carat: 1.00, mm: "8.0 x 5.5", depth: "3.4" },
      { carat: 1.25, mm: "8.5 x 5.8", depth: "3.6" },
      { carat: 1.50, mm: "9.0 x 6.0", depth: "3.8" },
      { carat: 1.75, mm: "9.5 x 6.3", depth: "4.0" },
      { carat: 2.00, mm: "10.0 x 6.5", depth: "4.2" },
      { carat: 2.50, mm: "10.5 x 7.0", depth: "4.5" },
      { carat: 3.00, mm: "11.0 x 7.5", depth: "4.8" },
      { carat: 4.00, mm: "12.0 x 8.0", depth: "5.2" },
      { carat: 5.00, mm: "13.0 x 8.5", depth: "5.6" },
    ],
  },
  cushion: {
    name: "Cushion Cut",
    description: "Soft square with rounded corners",
    icon: "▢",
    sizes: [
      { carat: 0.25, mm: "3.5 x 3.5", depth: "2.3" },
      { carat: 0.50, mm: "4.5 x 4.5", depth: "2.9" },
      { carat: 0.75, mm: "5.0 x 5.0", depth: "3.3" },
      { carat: 1.00, mm: "5.5 x 5.5", depth: "3.6" },
      { carat: 1.25, mm: "6.0 x 6.0", depth: "3.9" },
      { carat: 1.50, mm: "6.5 x 6.5", depth: "4.2" },
      { carat: 1.75, mm: "6.8 x 6.8", depth: "4.5" },
      { carat: 2.00, mm: "7.0 x 7.0", depth: "4.6" },
      { carat: 2.50, mm: "7.5 x 7.5", depth: "5.0" },
      { carat: 3.00, mm: "8.0 x 8.0", depth: "5.3" },
      { carat: 4.00, mm: "8.8 x 8.8", depth: "5.8" },
      { carat: 5.00, mm: "9.5 x 9.5", depth: "6.2" },
    ],
  },
  emerald: {
    name: "Emerald Cut",
    description: "Elegant rectangular step-cut",
    icon: "▭",
    sizes: [
      { carat: 0.25, mm: "4.5 x 3.0", depth: "2.0" },
      { carat: 0.50, mm: "5.5 x 4.0", depth: "2.6" },
      { carat: 0.75, mm: "6.0 x 4.5", depth: "2.9" },
      { carat: 1.00, mm: "7.0 x 5.0", depth: "3.2" },
      { carat: 1.25, mm: "7.5 x 5.3", depth: "3.5" },
      { carat: 1.50, mm: "8.0 x 5.5", depth: "3.7" },
      { carat: 1.75, mm: "8.3 x 5.8", depth: "3.9" },
      { carat: 2.00, mm: "8.5 x 6.0", depth: "4.0" },
      { carat: 2.50, mm: "9.0 x 6.5", depth: "4.3" },
      { carat: 3.00, mm: "9.5 x 7.0", depth: "4.6" },
      { carat: 4.00, mm: "10.5 x 7.5", depth: "5.0" },
      { carat: 5.00, mm: "11.5 x 8.0", depth: "5.4" },
    ],
  },
  pear: {
    name: "Pear Shape",
    description: "Teardrop shape combining round and marquise",
    icon: "◇",
    sizes: [
      { carat: 0.25, mm: "5.0 x 3.5", depth: "2.1" },
      { carat: 0.50, mm: "6.5 x 4.5", depth: "2.7" },
      { carat: 0.75, mm: "7.5 x 5.0", depth: "3.1" },
      { carat: 1.00, mm: "8.5 x 5.5", depth: "3.4" },
      { carat: 1.25, mm: "9.0 x 5.8", depth: "3.6" },
      { carat: 1.50, mm: "9.5 x 6.0", depth: "3.8" },
      { carat: 1.75, mm: "10.0 x 6.3", depth: "4.0" },
      { carat: 2.00, mm: "10.5 x 6.5", depth: "4.2" },
      { carat: 2.50, mm: "11.0 x 7.0", depth: "4.5" },
      { carat: 3.00, mm: "12.0 x 7.5", depth: "4.8" },
      { carat: 4.00, mm: "13.0 x 8.0", depth: "5.2" },
      { carat: 5.00, mm: "14.0 x 8.5", depth: "5.6" },
    ],
  },
  marquise: {
    name: "Marquise",
    description: "Football-shaped with pointed ends",
    icon: "◇",
    sizes: [
      { carat: 0.25, mm: "6.0 x 3.0", depth: "1.9" },
      { carat: 0.50, mm: "8.0 x 4.0", depth: "2.5" },
      { carat: 0.75, mm: "9.0 x 4.5", depth: "2.8" },
      { carat: 1.00, mm: "10.0 x 5.0", depth: "3.1" },
      { carat: 1.25, mm: "10.5 x 5.3", depth: "3.3" },
      { carat: 1.50, mm: "11.0 x 5.5", depth: "3.5" },
      { carat: 1.75, mm: "11.5 x 5.8", depth: "3.7" },
      { carat: 2.00, mm: "12.0 x 6.0", depth: "3.8" },
      { carat: 2.50, mm: "13.0 x 6.5", depth: "4.1" },
      { carat: 3.00, mm: "14.0 x 7.0", depth: "4.4" },
      { carat: 4.00, mm: "15.0 x 7.5", depth: "4.8" },
      { carat: 5.00, mm: "16.0 x 8.0", depth: "5.1" },
    ],
  },
  heart: {
    name: "Heart Shape",
    description: "Romantic symbol of love",
    icon: "♥",
    sizes: [
      { carat: 0.25, mm: "4.0 x 4.0", depth: "2.4" },
      { carat: 0.50, mm: "5.0 x 5.0", depth: "3.0" },
      { carat: 0.75, mm: "5.5 x 5.5", depth: "3.4" },
      { carat: 1.00, mm: "6.5 x 6.5", depth: "3.9" },
      { carat: 1.25, mm: "7.0 x 7.0", depth: "4.2" },
      { carat: 1.50, mm: "7.5 x 7.5", depth: "4.5" },
      { carat: 1.75, mm: "7.8 x 7.8", depth: "4.7" },
      { carat: 2.00, mm: "8.0 x 8.0", depth: "4.8" },
      { carat: 2.50, mm: "8.5 x 8.5", depth: "5.2" },
      { carat: 3.00, mm: "9.0 x 9.0", depth: "5.5" },
      { carat: 4.00, mm: "10.0 x 10.0", depth: "6.0" },
      { carat: 5.00, mm: "11.0 x 11.0", depth: "6.5" },
    ],
  },
  radiant: {
    name: "Radiant Cut",
    description: "Trimmed corners with brilliant facets",
    icon: "◈",
    sizes: [
      { carat: 0.25, mm: "3.5 x 3.0", depth: "2.2" },
      { carat: 0.50, mm: "4.5 x 4.0", depth: "2.8" },
      { carat: 0.75, mm: "5.0 x 4.5", depth: "3.2" },
      { carat: 1.00, mm: "5.5 x 5.0", depth: "3.5" },
      { carat: 1.25, mm: "6.0 x 5.5", depth: "3.8" },
      { carat: 1.50, mm: "6.5 x 5.8", depth: "4.0" },
      { carat: 1.75, mm: "7.0 x 6.0", depth: "4.2" },
      { carat: 2.00, mm: "7.3 x 6.5", depth: "4.5" },
      { carat: 2.50, mm: "7.8 x 7.0", depth: "4.8" },
      { carat: 3.00, mm: "8.3 x 7.5", depth: "5.1" },
      { carat: 4.00, mm: "9.0 x 8.0", depth: "5.5" },
      { carat: 5.00, mm: "9.8 x 8.5", depth: "5.9" },
    ],
  },
  asscher: {
    name: "Asscher Cut",
    description: "Square step-cut with cropped corners",
    icon: "◇",
    sizes: [
      { carat: 0.25, mm: "3.3 x 3.3", depth: "2.3" },
      { carat: 0.50, mm: "4.2 x 4.2", depth: "2.9" },
      { carat: 0.75, mm: "4.8 x 4.8", depth: "3.3" },
      { carat: 1.00, mm: "5.5 x 5.5", depth: "3.8" },
      { carat: 1.25, mm: "5.9 x 5.9", depth: "4.1" },
      { carat: 1.50, mm: "6.2 x 6.2", depth: "4.3" },
      { carat: 1.75, mm: "6.5 x 6.5", depth: "4.5" },
      { carat: 2.00, mm: "7.0 x 7.0", depth: "4.8" },
      { carat: 2.50, mm: "7.5 x 7.5", depth: "5.2" },
      { carat: 3.00, mm: "8.0 x 8.0", depth: "5.5" },
      { carat: 4.00, mm: "8.8 x 8.8", depth: "6.0" },
      { carat: 5.00, mm: "9.5 x 9.5", depth: "6.5" },
    ],
  },
};

type ShapeKey = keyof typeof DIAMOND_SHAPES;

// Diamond shape SVG components
const DiamondShapeSVG = ({ shape, size = 100, className }: { shape: ShapeKey; size?: number; className?: string }) => {
  const shapes: Record<ShapeKey, JSX.Element> = {
    round: (
      <svg viewBox="0 0 100 100" className={className} style={{ width: size, height: size }}>
        <defs>
          <linearGradient id="diamondGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--diamond-from))" />
            <stop offset="100%" stopColor="hsl(var(--diamond-to))" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="45" fill="url(#diamondGradient)" opacity="0.3" />
        <circle cx="50" cy="50" r="45" fill="none" stroke="url(#diamondGradient)" strokeWidth="2" />
        <circle cx="50" cy="50" r="35" fill="none" stroke="url(#diamondGradient)" strokeWidth="1" opacity="0.5" />
      </svg>
    ),
    princess: (
      <svg viewBox="0 0 100 100" className={className} style={{ width: size, height: size }}>
        <rect x="10" y="10" width="80" height="80" fill="url(#diamondGradient)" opacity="0.3" />
        <rect x="10" y="10" width="80" height="80" fill="none" stroke="url(#diamondGradient)" strokeWidth="2" />
        <line x1="10" y1="10" x2="90" y2="90" stroke="url(#diamondGradient)" strokeWidth="1" opacity="0.5" />
        <line x1="90" y1="10" x2="10" y2="90" stroke="url(#diamondGradient)" strokeWidth="1" opacity="0.5" />
      </svg>
    ),
    oval: (
      <svg viewBox="0 0 100 100" className={className} style={{ width: size, height: size }}>
        <ellipse cx="50" cy="50" rx="40" ry="28" fill="url(#diamondGradient)" opacity="0.3" />
        <ellipse cx="50" cy="50" rx="40" ry="28" fill="none" stroke="url(#diamondGradient)" strokeWidth="2" />
        <ellipse cx="50" cy="50" rx="30" ry="20" fill="none" stroke="url(#diamondGradient)" strokeWidth="1" opacity="0.5" />
      </svg>
    ),
    cushion: (
      <svg viewBox="0 0 100 100" className={className} style={{ width: size, height: size }}>
        <rect x="10" y="10" width="80" height="80" rx="15" fill="url(#diamondGradient)" opacity="0.3" />
        <rect x="10" y="10" width="80" height="80" rx="15" fill="none" stroke="url(#diamondGradient)" strokeWidth="2" />
        <rect x="20" y="20" width="60" height="60" rx="10" fill="none" stroke="url(#diamondGradient)" strokeWidth="1" opacity="0.5" />
      </svg>
    ),
    emerald: (
      <svg viewBox="0 0 100 100" className={className} style={{ width: size, height: size }}>
        <polygon points="15,20 85,20 90,80 10,80" fill="url(#diamondGradient)" opacity="0.3" />
        <polygon points="15,20 85,20 90,80 10,80" fill="none" stroke="url(#diamondGradient)" strokeWidth="2" />
        <line x1="25" y1="35" x2="75" y2="35" stroke="url(#diamondGradient)" strokeWidth="1" opacity="0.5" />
        <line x1="20" y1="50" x2="80" y2="50" stroke="url(#diamondGradient)" strokeWidth="1" opacity="0.5" />
        <line x1="18" y1="65" x2="82" y2="65" stroke="url(#diamondGradient)" strokeWidth="1" opacity="0.5" />
      </svg>
    ),
    pear: (
      <svg viewBox="0 0 100 100" className={className} style={{ width: size, height: size }}>
        <path d="M50 10 C20 40, 15 65, 50 95 C85 65, 80 40, 50 10" fill="url(#diamondGradient)" opacity="0.3" />
        <path d="M50 10 C20 40, 15 65, 50 95 C85 65, 80 40, 50 10" fill="none" stroke="url(#diamondGradient)" strokeWidth="2" />
      </svg>
    ),
    marquise: (
      <svg viewBox="0 0 100 100" className={className} style={{ width: size, height: size }}>
        <ellipse cx="50" cy="50" rx="45" ry="25" fill="url(#diamondGradient)" opacity="0.3" />
        <ellipse cx="50" cy="50" rx="45" ry="25" fill="none" stroke="url(#diamondGradient)" strokeWidth="2" />
        <line x1="5" y1="50" x2="95" y2="50" stroke="url(#diamondGradient)" strokeWidth="1" opacity="0.5" />
      </svg>
    ),
    heart: (
      <svg viewBox="0 0 100 100" className={className} style={{ width: size, height: size }}>
        <path d="M50 88 C20 60, 5 40, 25 20 C40 8, 50 20, 50 30 C50 20, 60 8, 75 20 C95 40, 80 60, 50 88" fill="url(#diamondGradient)" opacity="0.3" />
        <path d="M50 88 C20 60, 5 40, 25 20 C40 8, 50 20, 50 30 C50 20, 60 8, 75 20 C95 40, 80 60, 50 88" fill="none" stroke="url(#diamondGradient)" strokeWidth="2" />
      </svg>
    ),
    radiant: (
      <svg viewBox="0 0 100 100" className={className} style={{ width: size, height: size }}>
        <polygon points="20,10 80,10 95,50 80,90 20,90 5,50" fill="url(#diamondGradient)" opacity="0.3" />
        <polygon points="20,10 80,10 95,50 80,90 20,90 5,50" fill="none" stroke="url(#diamondGradient)" strokeWidth="2" />
      </svg>
    ),
    asscher: (
      <svg viewBox="0 0 100 100" className={className} style={{ width: size, height: size }}>
        <polygon points="20,5 80,5 95,20 95,80 80,95 20,95 5,80 5,20" fill="url(#diamondGradient)" opacity="0.3" />
        <polygon points="20,5 80,5 95,20 95,80 80,95 20,95 5,80 5,20" fill="none" stroke="url(#diamondGradient)" strokeWidth="2" />
        <polygon points="30,15 70,15 85,30 85,70 70,85 30,85 15,70 15,30" fill="none" stroke="url(#diamondGradient)" strokeWidth="1" opacity="0.5" />
      </svg>
    ),
  };

  return shapes[shape] || null;
};

const DiamondSizingChart = () => {
  const [selectedShape, setSelectedShape] = useState<ShapeKey>("round");
  const [selectedCaratIndex, setSelectedCaratIndex] = useState(3); // Default to 1.00 carat
  const [compareMode, setCompareMode] = useState(false);
  const [compareShape, setCompareShape] = useState<ShapeKey>("princess");

  const shapeData = DIAMOND_SHAPES[selectedShape];
  const compareShapeData = DIAMOND_SHAPES[compareShape];
  const selectedSize = shapeData.sizes[selectedCaratIndex];
  const compareSize = compareShapeData.sizes[selectedCaratIndex];

  // Calculate visual scale based on carat weight
  const getVisualScale = (carat: number) => {
    const baseScale = 60;
    const scale = baseScale + (carat * 30);
    return Math.min(scale, 200);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-diamond-from/10 via-background to-gemstone-from/10 py-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-diamond-from/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-gemstone-from/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-sm mb-6">
                <Diamond className="h-4 w-4 text-primary" />
                <span className="text-primary font-medium">Interactive Size Guide</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Diamond Sizing Chart
              </h1>
              <p className="text-lg text-muted-foreground">
                Explore diamond dimensions across all shapes. Compare carat weights, 
                millimeter sizes, and visualize how each shape looks at different sizes.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        {/* Shape Selector */}
        <ScrollReveal>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Select Diamond Shape
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3">
              {(Object.keys(DIAMOND_SHAPES) as ShapeKey[]).map((shape) => (
                <motion.button
                  key={shape}
                  onClick={() => setSelectedShape(shape)}
                  className={cn(
                    "relative p-4 rounded-xl border-2 transition-all duration-300",
                    selectedShape === shape
                      ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <DiamondShapeSVG shape={shape} size={40} className="mx-auto mb-2" />
                  <span className="text-xs font-medium block text-center">
                    {DIAMOND_SHAPES[shape].name.split(" ")[0]}
                  </span>
                  {selectedShape === shape && (
                    <motion.div
                      layoutId="shapeIndicator"
                      className="absolute inset-0 border-2 border-primary rounded-xl"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Visual Preview */}
          <ScrollReveal delay={0.1}>
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-diamond-from/10 to-gemstone-from/10">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ZoomIn className="h-5 w-5" />
                      {shapeData.name}
                    </CardTitle>
                    <CardDescription>{shapeData.description}</CardDescription>
                  </div>
                  <Button
                    variant={compareMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCompareMode(!compareMode)}
                  >
                    Compare
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Size Preview */}
                <div className="relative h-64 flex items-center justify-center bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl mb-6">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-px border-t border-dashed border-muted-foreground/30" />
                    <div className="absolute h-full w-px border-l border-dashed border-muted-foreground/30" />
                  </div>
                  
                  <div className={cn("flex items-center gap-8", compareMode && "gap-16")}>
                    <motion.div
                      key={`${selectedShape}-${selectedCaratIndex}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      className="flex flex-col items-center"
                    >
                      <DiamondShapeSVG 
                        shape={selectedShape} 
                        size={getVisualScale(selectedSize.carat)} 
                      />
                      <Badge variant="secondary" className="mt-3">
                        {selectedSize.carat} ct
                      </Badge>
                    </motion.div>

                    <AnimatePresence>
                      {compareMode && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0, x: -20 }}
                          animate={{ scale: 1, opacity: 1, x: 0 }}
                          exit={{ scale: 0, opacity: 0, x: -20 }}
                          className="flex flex-col items-center"
                        >
                          <DiamondShapeSVG 
                            shape={compareShape} 
                            size={getVisualScale(compareSize.carat)} 
                          />
                          <Badge variant="outline" className="mt-3">
                            {compareSize.carat} ct
                          </Badge>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Compare Shape Selector */}
                <AnimatePresence>
                  {compareMode && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mb-6 overflow-hidden"
                    >
                      <p className="text-sm text-muted-foreground mb-3">Compare with:</p>
                      <div className="flex flex-wrap gap-2">
                        {(Object.keys(DIAMOND_SHAPES) as ShapeKey[])
                          .filter((s) => s !== selectedShape)
                          .map((shape) => (
                            <Button
                              key={shape}
                              variant={compareShape === shape ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCompareShape(shape)}
                              className="gap-2"
                            >
                              <DiamondShapeSVG shape={shape} size={16} />
                              {DIAMOND_SHAPES[shape].name.split(" ")[0]}
                            </Button>
                          ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Carat Slider */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Scale className="h-4 w-4" />
                      Carat Weight
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      {selectedSize.carat} ct
                    </span>
                  </div>
                  <Slider
                    value={[selectedCaratIndex]}
                    onValueChange={(value) => setSelectedCaratIndex(value[0])}
                    max={shapeData.sizes.length - 1}
                    step={1}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{shapeData.sizes[0].carat} ct</span>
                    <span>{shapeData.sizes[shapeData.sizes.length - 1].carat} ct</span>
                  </div>
                </div>

                {/* Size Details */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <Ruler className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">Dimensions</p>
                    <p className="text-lg font-semibold">{selectedSize.mm} mm</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <Diamond className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">Depth</p>
                    <p className="text-lg font-semibold">{selectedSize.depth} mm</p>
                  </div>
                </div>

                {/* Finger Reference */}
                <div className="mt-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
                  <div className="flex items-start gap-3">
                    <Hand className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">On-Finger Reference</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        A {selectedSize.carat} carat {shapeData.name.toLowerCase()} measures approximately {selectedSize.mm} mm, 
                        which appears {selectedSize.carat >= 1.5 ? "substantial" : selectedSize.carat >= 1 ? "elegant" : "delicate"} on an average ring finger.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Size Table */}
          <ScrollReveal delay={0.2}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="h-5 w-5" />
                  Complete Size Chart - {shapeData.name}
                </CardTitle>
                <CardDescription>
                  All measurements are approximate and may vary based on cut quality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-4 py-3 text-left text-sm font-semibold">Carat</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Dimensions (mm)</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Depth (mm)</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold">Visual</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shapeData.sizes.map((size, index) => (
                          <motion.tr
                            key={size.carat}
                            className={cn(
                              "border-t transition-colors cursor-pointer",
                              index === selectedCaratIndex
                                ? "bg-primary/10"
                                : "hover:bg-muted/30"
                            )}
                            onClick={() => setSelectedCaratIndex(index)}
                            whileHover={{ backgroundColor: "rgba(var(--primary), 0.05)" }}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={index === selectedCaratIndex ? "default" : "outline"}
                                  className="font-mono"
                                >
                                  {size.carat} ct
                                </Badge>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-medium">{size.mm}</td>
                            <td className="px-4 py-3 text-muted-foreground">{size.depth}</td>
                            <td className="px-4 py-3">
                              <div className="flex justify-center">
                                <div 
                                  className="rounded-full bg-gradient-to-br from-diamond-from to-diamond-to opacity-60"
                                  style={{ 
                                    width: Math.max(8, size.carat * 12),
                                    height: Math.max(8, size.carat * 12)
                                  }}
                                />
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Info Note */}
                <div className="mt-4 p-4 rounded-lg bg-muted/30 border">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground mb-1">Important Notes:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Dimensions vary based on cut depth and proportions</li>
                        <li>Fancy shapes may appear larger than rounds at same carat weight</li>
                        <li>Length-to-width ratios affect perceived size</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>

        {/* Quick Reference Grid */}
        <ScrollReveal delay={0.3}>
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Diamond className="h-6 w-6 text-primary" />
              Quick Reference: 1 Carat Comparison
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {(Object.keys(DIAMOND_SHAPES) as ShapeKey[]).map((shape) => {
                const oneCaratSize = DIAMOND_SHAPES[shape].sizes.find(s => s.carat === 1);
                return (
                  <motion.div
                    key={shape}
                    className="p-4 rounded-xl border bg-card hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer"
                    onClick={() => {
                      setSelectedShape(shape);
                      setSelectedCaratIndex(DIAMOND_SHAPES[shape].sizes.findIndex(s => s.carat === 1));
                    }}
                    whileHover={{ y: -4 }}
                  >
                    <DiamondShapeSVG shape={shape} size={60} className="mx-auto mb-3" />
                    <h3 className="font-semibold text-center text-sm mb-2">
                      {DIAMOND_SHAPES[shape].name}
                    </h3>
                    <div className="text-center text-xs text-muted-foreground space-y-1">
                      <p className="font-medium text-foreground">{oneCaratSize?.mm} mm</p>
                      <p>Depth: {oneCaratSize?.depth} mm</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      </main>

      <ThemeSwitcher />
    </div>
  );
};

export default DiamondSizingChart;
