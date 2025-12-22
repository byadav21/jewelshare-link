import { useState, useMemo, Suspense, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RotateCcw, Search, Eye, Info, Sparkles } from "lucide-react";
import RealisticDiamond3D, { CLARITY_GRADES as DIAMOND_CLARITY_GRADES } from "./RealisticDiamond3D";

const CLARITY_GRADES = [
  { grade: "FL", index: 0, name: "Flawless", inclusions: 0, size: 0, visibility: 0, description: "No inclusions or blemishes visible under 10x magnification", rarity: "Extremely Rare (<1%)" },
  { grade: "IF", index: 1, name: "Internally Flawless", inclusions: 0, size: 0, visibility: 0.05, description: "No inclusions visible under 10x magnification", rarity: "Very Rare (~3%)" },
  { grade: "VVS1", index: 2, name: "Very Very Slightly Included 1", inclusions: 1, size: 0.1, visibility: 0.15, description: "Minute inclusions very difficult to see under 10x", rarity: "Rare" },
  { grade: "VVS2", index: 3, name: "Very Very Slightly Included 2", inclusions: 2, size: 0.15, visibility: 0.2, description: "Minute inclusions difficult to see under 10x", rarity: "Uncommon" },
  { grade: "VS1", index: 4, name: "Very Slightly Included 1", inclusions: 3, size: 0.2, visibility: 0.35, description: "Minor inclusions somewhat difficult to see under 10x", rarity: "Common" },
  { grade: "VS2", index: 5, name: "Very Slightly Included 2", inclusions: 4, size: 0.25, visibility: 0.45, description: "Minor inclusions easily visible under 10x", rarity: "Common" },
  { grade: "SI1", index: 6, name: "Slightly Included 1", inclusions: 5, size: 0.35, visibility: 0.6, description: "Noticeable inclusions under 10x, may be eye-visible", rarity: "Common" },
  { grade: "SI2", index: 7, name: "Slightly Included 2", inclusions: 7, size: 0.45, visibility: 0.75, description: "Noticeable inclusions, often eye-visible", rarity: "Common" },
  { grade: "I1", index: 8, name: "Included 1", inclusions: 9, size: 0.55, visibility: 0.85, description: "Obvious inclusions, visible to naked eye", rarity: "Abundant" },
  { grade: "I2", index: 9, name: "Included 2", inclusions: 12, size: 0.7, visibility: 0.95, description: "Many obvious inclusions affecting transparency", rarity: "Abundant" },
  { grade: "I3", index: 10, name: "Included 3", inclusions: 15, size: 0.85, visibility: 1, description: "Many large inclusions severely affecting beauty", rarity: "Abundant" },
];

const gradeToKey = (grade: string): keyof typeof DIAMOND_CLARITY_GRADES => {
  return grade as keyof typeof DIAMOND_CLARITY_GRADES;
};

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full">
    <div className="flex items-center gap-2 text-muted-foreground">
      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <span className="text-sm">Loading Diamond...</span>
    </div>
  </div>
);

export const DiamondClarityModule = () => {
  const [clarityIndex, setClarityIndex] = useState(4);
  const [autoRotate, setAutoRotate] = useState(true);
  const [microscopeMode, setMicroscopeMode] = useState(false);
  const [seed, setSeed] = useState(1);

  const currentGrade = useMemo(() => CLARITY_GRADES[Math.round(clarityIndex)], [clarityIndex]);
  const regenerateInclusions = useCallback(() => setSeed(prev => prev + 1), []);
  const isEyeClean = useMemo(() => clarityIndex <= 6, [clarityIndex]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center">
            <Search className="h-4 w-4 text-white" />
          </div>
          Diamond Clarity Interactive Chart
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch id="rotate" checked={autoRotate} onCheckedChange={setAutoRotate} />
              <Label htmlFor="rotate" className="flex items-center gap-1"><RotateCcw className="h-4 w-4" />360° Rotation</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="microscope" checked={microscopeMode} onCheckedChange={setMicroscopeMode} />
              <Label htmlFor="microscope" className="flex items-center gap-1"><Search className="h-4 w-4" />10× Loupe View</Label>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={regenerateInclusions}><Sparkles className="h-4 w-4 mr-2" />Randomize</Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">FL - Flawless</span>
            <div className="relative h-64 w-12 flex items-center justify-center">
              <div className="absolute w-3 h-full rounded-full" style={{ background: `linear-gradient(to bottom, hsl(210, 100%, 95%), hsl(210, 40%, 70%), hsl(0, 0%, 50%))` }} />
              <input type="range" min="0" max={CLARITY_GRADES.length - 1} step="0.1" value={clarityIndex} onChange={(e) => setClarityIndex(parseFloat(e.target.value))} className="absolute h-full w-8 cursor-pointer opacity-0" style={{ writingMode: "vertical-lr", direction: "rtl" }} />
              <div className="absolute w-6 h-6 rounded-full bg-primary border-2 border-white shadow-lg pointer-events-none" style={{ top: `${(clarityIndex / (CLARITY_GRADES.length - 1)) * 100}%`, transform: "translateY(-50%)" }} />
            </div>
            <span className="text-xs font-medium text-muted-foreground">I3 - Included</span>
            <div className="mt-4 space-y-1 text-center">
              {CLARITY_GRADES.map((g, i) => (
                <TooltipProvider key={g.grade}><Tooltip><TooltipTrigger asChild>
                  <button onClick={() => setClarityIndex(i)} className={`block w-full text-xs px-2 py-0.5 rounded transition-all ${Math.round(clarityIndex) === i ? "bg-primary text-primary-foreground font-bold" : "hover:bg-muted text-muted-foreground"}`}>{g.grade}</button>
                </TooltipTrigger><TooltipContent side="right"><p className="font-medium">{g.name}</p><p className="text-xs">{g.description}</p></TooltipContent></Tooltip></TooltipProvider>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 relative">
            <Suspense fallback={<LoadingFallback />}>
              <motion.div className="h-80 rounded-xl overflow-hidden" animate={{ scale: microscopeMode ? 1.02 : 1 }} transition={{ duration: 0.3 }}>
                <RealisticDiamond3D colorGrade="G" clarityGrade={gradeToKey(currentGrade.grade)} autoRotate={autoRotate} microscopeMode={microscopeMode} viewMode="faceUp" seed={seed} />
              </motion.div>
            </Suspense>
            <div className="absolute top-2 left-2 flex gap-2">
              <Badge className="bg-primary shadow-lg"><Sparkles className="h-3 w-3 mr-1" />{currentGrade.grade}</Badge>
              {microscopeMode && <Badge variant="outline" className="bg-black/60 text-white border-white/30 backdrop-blur-sm"><Search className="h-3 w-3 mr-1" />10× Magnification</Badge>}
            </div>
            <div className="absolute top-2 right-2">
              <Badge variant="outline" className={`shadow-lg backdrop-blur-sm ${isEyeClean ? "bg-green-500/20 text-green-400 border-green-400/30" : "bg-orange-500/20 text-orange-400 border-orange-400/30"}`}><Eye className="h-3 w-3 mr-1" />{isEyeClean ? "Eye-Clean" : "Visible Inclusions"}</Badge>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={currentGrade.grade} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4 rounded-xl bg-muted/50 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">{currentGrade.grade}</div>
                <div><h3 className="text-lg font-bold">{currentGrade.name}</h3><p className="text-sm text-muted-foreground">{currentGrade.rarity}</p></div>
              </div>
              <div className="flex gap-2"><Badge variant="outline">Inclusions: {currentGrade.inclusions}</Badge><Badge variant="outline">Visibility: {Math.round(currentGrade.visibility * 100)}%</Badge></div>
            </div>
            <p className="text-sm text-muted-foreground flex items-start gap-2"><Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />{currentGrade.description}</p>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default DiamondClarityModule;
