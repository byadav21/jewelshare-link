import { useState, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Eye, Layers, SplitSquareVertical, Info, Sparkles } from "lucide-react";
import RealisticDiamond3D, { COLOR_GRADES as DIAMOND_COLOR_GRADES } from "./RealisticDiamond3D";

// Color grades with their properties
const COLOR_GRADES = [
  { grade: "D", index: 0, name: "Absolutely Colorless", color: "#E8F4FF", warmth: 0, market: "Exceptional, highest grade", recommendation: "Investment pieces, heirloom jewelry" },
  { grade: "E", index: 1, name: "Colorless", color: "#E6F2FC", warmth: 0.02, market: "Exceptional quality", recommendation: "High-end engagement rings, fine jewelry" },
  { grade: "F", index: 2, name: "Colorless", color: "#E4F0F9", warmth: 0.04, market: "Excellent, often preferred for platinum settings", recommendation: "White gold/platinum settings" },
  { grade: "G", index: 3, name: "Near Colorless", color: "#F0F0E8", warmth: 0.08, market: "Best value in near-colorless range", recommendation: "Most popular for engagement rings" },
  { grade: "H", index: 4, name: "Near Colorless", color: "#F2F0E4", warmth: 0.12, market: "Excellent value, slight warmth", recommendation: "Yellow gold settings enhance beauty" },
  { grade: "I", index: 5, name: "Near Colorless", color: "#F5EFE0", warmth: 0.18, market: "Good value, faint color visible", recommendation: "Budget-friendly, yellow gold preferred" },
  { grade: "J", index: 6, name: "Near Colorless", color: "#F8EEDC", warmth: 0.24, market: "Value range, noticeable warmth", recommendation: "Yellow/rose gold maximizes beauty" },
  { grade: "K", index: 7, name: "Faint Yellow", color: "#F9EAD0", warmth: 0.32, market: "Faint yellow visible face-up", recommendation: "Vintage styles, yellow gold" },
  { grade: "L", index: 8, name: "Faint Yellow", color: "#FAE6C4", warmth: 0.40, market: "Noticeable yellow tint", recommendation: "Antique/vintage settings" },
  { grade: "M", index: 9, name: "Faint Yellow", color: "#FBE2B8", warmth: 0.48, market: "Yellow visible, lower price point", recommendation: "Statement pieces, warm settings" },
  { grade: "N", index: 10, name: "Very Light Yellow", color: "#FCDEA8", warmth: 0.56, market: "Very light yellow", recommendation: "Specialty pieces" },
  { grade: "Z", index: 11, name: "Light Yellow/Brown", color: "#FDD88C", warmth: 0.75, market: "Light colored diamonds", recommendation: "Fancy color settings, artistic jewelry" },
];

const gradeToKey = (grade: string): keyof typeof DIAMOND_COLOR_GRADES => {
  return grade as keyof typeof DIAMOND_COLOR_GRADES;
};

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full">
    <div className="flex items-center gap-2 text-muted-foreground">
      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <span className="text-sm">Loading Diamond...</span>
    </div>
  </div>
);

export const DiamondColorModule = () => {
  const [colorIndex, setColorIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"face-up" | "side">("face-up");
  const [comparisonMode, setComparisonMode] = useState(false);
  const [isRotating, setIsRotating] = useState(true);

  const currentGrade = useMemo(() => {
    // Smooth interpolation between grades
    const lowerIndex = Math.floor(colorIndex);
    const upperIndex = Math.min(lowerIndex + 1, COLOR_GRADES.length - 1);
    const fraction = colorIndex - lowerIndex;
    
    const lowerGrade = COLOR_GRADES[lowerIndex];
    const upperGrade = COLOR_GRADES[upperIndex];
    
    // Interpolate color
    const lowerColor = new THREE.Color(lowerGrade.color);
    const upperColor = new THREE.Color(upperGrade.color);
    const interpolatedColor = lowerColor.lerp(upperColor, fraction);
    
    return {
      ...lowerGrade,
      interpolatedColor: `#${interpolatedColor.getHexString()}`,
      warmth: lowerGrade.warmth + (upperGrade.warmth - lowerGrade.warmth) * fraction,
    };
  }, [colorIndex]);

  const gradeD = COLOR_GRADES[0];
  const gradeG = COLOR_GRADES[3];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">💎</span>
          </div>
          Diamond Color Interactive Chart
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* View Mode Toggle */}
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant={viewMode === "face-up" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("face-up")}
            >
              <Eye className="h-4 w-4 mr-2" />
              Face-Up View
            </Button>
            <Button
              variant={viewMode === "side" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("side")}
            >
              <Layers className="h-4 w-4 mr-2" />
              Side View
            </Button>
          </div>
          <Button
            variant={comparisonMode ? "default" : "outline"}
            size="sm"
            onClick={() => setComparisonMode(!comparisonMode)}
          >
            <SplitSquareVertical className="h-4 w-4 mr-2" />
            Comparison Mode
          </Button>
        </div>

        {/* Diamond Visualization */}
        <div className={`grid ${comparisonMode ? "lg:grid-cols-3 grid-cols-1" : "grid-cols-1"} gap-4`}>
          {comparisonMode && (
            <div className="relative">
              <Suspense fallback={<LoadingFallback />}>
                <div className="h-72 rounded-xl overflow-hidden">
                  <RealisticDiamond3D 
                    colorGrade="D"
                    clarityGrade="VS1"
                    autoRotate={false}
                    viewMode={viewMode === "face-up" ? "faceUp" : "side"}
                  />
                </div>
              </Suspense>
              <Badge className="absolute top-2 left-2 bg-sky-500 shadow-lg">
                <Sparkles className="h-3 w-3 mr-1" />
                D Grade (Reference)
              </Badge>
            </div>
          )}
          
          <motion.div 
            className="relative"
            layout
            transition={{ duration: 0.3 }}
          >
            <Suspense fallback={<LoadingFallback />}>
              <div className="h-72 rounded-xl overflow-hidden">
                <RealisticDiamond3D 
                  colorGrade={gradeToKey(COLOR_GRADES[Math.round(colorIndex)].grade)}
                  clarityGrade="VS1"
                  autoRotate={isRotating}
                  viewMode={viewMode === "face-up" ? "faceUp" : "side"}
                />
              </div>
            </Suspense>
            <Badge className="absolute top-2 left-2 bg-primary shadow-lg">
              <Sparkles className="h-3 w-3 mr-1" />
              {COLOR_GRADES[Math.round(colorIndex)].grade} Grade (Selected)
            </Badge>
            <button
              onClick={() => setIsRotating(!isRotating)}
              className="absolute top-2 right-2 p-2.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-all shadow-lg backdrop-blur-sm"
            >
              {isRotating ? "⏸" : "▶"}
            </button>
          </motion.div>

          {comparisonMode && (
            <div className="relative">
              <Suspense fallback={<LoadingFallback />}>
                <div className="h-72 rounded-xl overflow-hidden">
                  <RealisticDiamond3D 
                    colorGrade="G"
                    clarityGrade="VS1"
                    autoRotate={false}
                    viewMode={viewMode === "face-up" ? "faceUp" : "side"}
                  />
                </div>
              </Suspense>
              <Badge className="absolute top-2 left-2 bg-amber-500 shadow-lg">
                <Sparkles className="h-3 w-3 mr-1" />
                G Grade (Reference)
              </Badge>
            </div>
          )}
        </div>

        {/* Color Slider */}
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs font-medium text-muted-foreground">
            {COLOR_GRADES.map((g, i) => (
              <TooltipProvider key={g.grade}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setColorIndex(i)}
                      className={`px-2 py-1 rounded transition-all ${
                        Math.round(colorIndex) === i 
                          ? "bg-primary text-primary-foreground font-bold scale-110" 
                          : "hover:bg-muted"
                      }`}
                    >
                      {g.grade}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <div className="space-y-1">
                      <p className="font-semibold">{g.grade} - {g.name}</p>
                      <p className="text-xs text-muted-foreground">{g.market}</p>
                      <p className="text-xs"><strong>Recommended:</strong> {g.recommendation}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
          
          <div className="relative">
            <div 
              className="absolute inset-0 h-3 rounded-full mt-2"
              style={{
                background: `linear-gradient(to right, ${COLOR_GRADES.map(g => g.color).join(", ")})`
              }}
            />
            <Slider
              value={[colorIndex]}
              onValueChange={(value) => setColorIndex(value[0])}
              max={COLOR_GRADES.length - 1}
              step={0.01}
              className="relative z-10"
            />
          </div>
          
          <p className="text-center text-sm text-muted-foreground">
            Drag the slider to see how diamond color changes from D (colorless) to Z (light yellow)
          </p>
        </div>

        {/* Grade Information */}
        <AnimatePresence mode="wait">
          <motion.div
            key={Math.round(colorIndex)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-muted/50 space-y-3"
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-full border-4 border-white shadow-lg"
                style={{ backgroundColor: currentGrade.interpolatedColor }}
              />
              <div>
                <h3 className="text-lg font-bold">
                  Grade {COLOR_GRADES[Math.round(colorIndex)].grade}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {COLOR_GRADES[Math.round(colorIndex)].name}
                </p>
              </div>
              <Badge variant="outline" className="ml-auto">
                Warmth: {Math.round(currentGrade.warmth * 100)}%
              </Badge>
            </div>
            
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Market Position</p>
                  <p className="text-muted-foreground">{COLOR_GRADES[Math.round(colorIndex)].market}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Recommendation</p>
                  <p className="text-muted-foreground">{COLOR_GRADES[Math.round(colorIndex)].recommendation}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default DiamondColorModule;
