import { useState, lazy, Suspense, useCallback } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { DiamondShapeSVG } from "@/components/diamond/DiamondShapeSVG";
import { DiamondSizePreview } from "@/components/diamond/DiamondSizePreview";
import { DiamondSizeTable } from "@/components/diamond/DiamondSizeTable";
import { RingSizeOverlay } from "@/components/diamond/RingSizeOverlay";
import { MultiShapeOverlay } from "@/components/diamond/MultiShapeOverlay";
import { DIAMOND_SHAPES, ShapeKey } from "@/constants/diamondData";
import { useDiamondComparison } from "@/hooks/useDiamondComparison";
import { cn } from "@/lib/utils";
import { 
  Diamond, Ruler, Scale, Sparkles, Info, ZoomIn, Hand, Search,
  CircleDot, Layers, Box
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Diamond3DViewer = lazy(() => import("@/components/Diamond3DViewer"));

const DiamondSizingChart = () => {
  const [selectedShape, setSelectedShape] = useState<ShapeKey>("round");
  const [selectedCaratIndex, setSelectedCaratIndex] = useState(3);
  const [compareMode, setCompareMode] = useState(false);
  const [compareShape, setCompareShape] = useState<ShapeKey>("princess");
  const [mmInput, setMmInput] = useState("");
  const [mmWidthInput, setMmWidthInput] = useState("");
  const [selectedRingSize, setSelectedRingSize] = useState(6);
  const [showRingOverlay, setShowRingOverlay] = useState(false);
  const [multiOverlayMode, setMultiOverlayMode] = useState(false);
  const [selectedShapesForOverlay, setSelectedShapesForOverlay] = useState<ShapeKey[]>(["round", "oval", "princess"]);
  const [overlayCaratIndex, setOverlayCaratIndex] = useState(3);
  const [autoRotate3D, setAutoRotate3D] = useState(true);

  const { mmToCaratResults } = useDiamondComparison(mmInput, mmWidthInput);

  const shapeData = DIAMOND_SHAPES[selectedShape];
  const compareShapeData = DIAMOND_SHAPES[compareShape];
  const selectedSize = shapeData.sizes[selectedCaratIndex];
  const compareSize = compareShapeData.sizes[selectedCaratIndex];
  const overlayCaratWeight = DIAMOND_SHAPES.round.sizes[overlayCaratIndex]?.carat || 1;

  const toggleShapeForOverlay = useCallback((shape: ShapeKey) => {
    setSelectedShapesForOverlay(prev => {
      if (prev.includes(shape)) {
        if (prev.length <= 2) return prev;
        return prev.filter(s => s !== shape);
      }
      if (prev.length >= 5) return prev;
      return [...prev, shape];
    });
  }, []);

  const shapeKeys = Object.keys(DIAMOND_SHAPES) as ShapeKey[];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16">
        <div className="container mx-auto px-4 relative">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-sm mb-6">
                <Diamond className="h-4 w-4 text-primary" />
                <span className="text-primary font-medium">Interactive Size Guide</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Diamond Sizing Chart</h1>
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
              {shapeKeys.map((shape) => (
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
              <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
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
                <DiamondSizePreview
                  selectedShape={selectedShape}
                  selectedSize={selectedSize}
                  compareMode={compareMode}
                  compareShape={compareShape}
                  compareSize={compareSize}
                />

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
                        {shapeKeys.filter((s) => s !== selectedShape).map((shape) => (
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
                    <span className="text-2xl font-bold text-primary">{selectedSize.carat} ct</span>
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
                <CardDescription>All measurements are approximate and may vary based on cut quality</CardDescription>
              </CardHeader>
              <CardContent>
                <DiamondSizeTable
                  sizes={shapeData.sizes}
                  selectedCaratIndex={selectedCaratIndex}
                  onSelectIndex={setSelectedCaratIndex}
                />

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

        {/* 3D Diamond Viewer */}
        <ScrollReveal delay={0.25}>
          <Card className="mt-8">
            <CardHeader className="bg-gradient-to-r from-muted/50 via-primary/5 to-muted/50">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Box className="h-5 w-5" />
                    3D Diamond Viewer
                  </CardTitle>
                  <CardDescription>Rotate and explore diamond shapes in 3D - click and drag to rotate</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch id="auto-rotate" checked={autoRotate3D} onCheckedChange={setAutoRotate3D} />
                    <Label htmlFor="auto-rotate" className="text-sm">Auto-rotate</Label>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="h-[350px] rounded-xl overflow-hidden">
                  <Suspense fallback={
                    <div className="h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                    </div>
                  }>
                    <Diamond3DViewer shape={selectedShape} autoRotate={autoRotate3D} showFire />
                  </Suspense>
                </div>
                <div className="flex flex-col justify-center space-y-4">
                  <h3 className="text-xl font-semibold">{shapeData.name}</h3>
                  <p className="text-muted-foreground">{shapeData.description}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/30">
                      <p className="text-sm text-muted-foreground">Selected Size</p>
                      <p className="text-2xl font-bold text-primary">{selectedSize.carat} ct</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30">
                      <p className="text-sm text-muted-foreground">Dimensions</p>
                      <p className="text-2xl font-bold">{selectedSize.mm} mm</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use mouse to rotate • Scroll to zoom • The 3D model represents the general shape characteristics
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* MM to Carat Lookup */}
        <ScrollReveal delay={0.3}>
          <Card className="mt-8">
            <CardHeader className="bg-gradient-to-r from-accent/5 to-primary/5">
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                MM to Carat Lookup
              </CardTitle>
              <CardDescription>Enter millimeter dimensions to find approximate carat weights</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mm-length" className="text-sm font-medium">Length (mm)</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="mm-length"
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder="e.g., 6.5"
                          value={mmInput}
                          onChange={(e) => setMmInput(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mm-width" className="text-sm font-medium">
                        Width (mm) <span className="text-muted-foreground text-xs">(optional)</span>
                      </Label>
                      <Input
                        id="mm-width"
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="Same as length"
                        value={mmWidthInput}
                        onChange={(e) => setMmWidthInput(e.target.value)}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter length for round diamonds, or both length and width for fancy shapes
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium">Matching Results</p>
                  {mmToCaratResults.length > 0 ? (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                      {mmToCaratResults.map((result, index) => (
                        <motion.div
                          key={`${result.shape}-${result.carat}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                            result.matchScore < 0.5 ? "bg-primary/10 border-primary/30" : "bg-muted/30 hover:bg-muted/50"
                          )}
                          onClick={() => {
                            setSelectedShape(result.shape);
                            const idx = DIAMOND_SHAPES[result.shape].sizes.findIndex(s => s.carat === result.carat);
                            if (idx !== -1) setSelectedCaratIndex(idx);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <DiamondShapeSVG shape={result.shape} size={24} />
                            <div>
                              <p className="font-medium text-sm">{result.shapeName}</p>
                              <p className="text-xs text-muted-foreground">{result.mm} mm</p>
                            </div>
                          </div>
                          <Badge variant={result.matchScore < 0.5 ? "default" : "secondary"}>~{result.carat} ct</Badge>
                        </motion.div>
                      ))}
                    </div>
                  ) : mmInput ? (
                    <div className="p-4 rounded-lg bg-muted/30 text-center text-muted-foreground">
                      <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No matching sizes found</p>
                      <p className="text-xs mt-1">Try adjusting your measurements</p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-muted/30 text-center text-muted-foreground">
                      <Ruler className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Enter dimensions to search</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Ring Size Overlay */}
        <ScrollReveal delay={0.4}>
          <Card className="mt-8">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CircleDot className="h-5 w-5" />
                    Ring Size Overlay
                  </CardTitle>
                  <CardDescription>See how diamonds look on different finger sizes</CardDescription>
                </div>
                <Button
                  variant={showRingOverlay ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowRingOverlay(!showRingOverlay)}
                >
                  {showRingOverlay ? "Hide Overlay" : "Show Overlay"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <AnimatePresence mode="wait">
                {showRingOverlay ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <RingSizeOverlay
                      selectedShape={selectedShape}
                      selectedSize={selectedSize}
                      selectedRingSize={selectedRingSize}
                      onRingSizeChange={setSelectedRingSize}
                    />
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 text-muted-foreground">
                    <Hand className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Click "Show Overlay" to visualize diamond sizes on different ring sizes</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Multi-Shape Overlay */}
        <ScrollReveal delay={0.45}>
          <Card className="mt-8">
            <CardHeader className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    Multi-Shape Overlay
                  </CardTitle>
                  <CardDescription>Compare multiple diamond shapes at the same carat weight</CardDescription>
                </div>
                <Button
                  variant={multiOverlayMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMultiOverlayMode(!multiOverlayMode)}
                >
                  {multiOverlayMode ? "Hide Overlay" : "Compare Shapes"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <AnimatePresence mode="wait">
                {multiOverlayMode ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <MultiShapeOverlay
                      selectedShapes={selectedShapesForOverlay}
                      overlayCaratIndex={overlayCaratIndex}
                      overlayCaratWeight={overlayCaratWeight}
                      onCaratIndexChange={setOverlayCaratIndex}
                      onToggleShape={toggleShapeForOverlay}
                    />
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 text-muted-foreground">
                    <Layers className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Click "Compare Shapes" to see multiple diamond shapes overlaid at the same carat weight</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Quick Reference Grid */}
        <ScrollReveal delay={0.5}>
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Diamond className="h-6 w-6 text-primary" />
              Quick Reference: 1 Carat Comparison
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {shapeKeys.map((shape) => {
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
                    <h3 className="font-semibold text-center text-sm mb-2">{DIAMOND_SHAPES[shape].name}</h3>
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

      <Footer />
      <ThemeSwitcher />
    </div>
  );
};

export default DiamondSizingChart;
