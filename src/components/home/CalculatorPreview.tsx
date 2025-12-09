import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Calculator, Sparkles, ArrowRight, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DEMO_SHAPES = ["Round", "Princess", "Oval", "Cushion"];
const DEMO_COLORS = ["D", "E", "F", "G", "H"];
const DEMO_CLARITIES = ["IF", "VVS1", "VVS2", "VS1", "VS2"];

// Simplified price calculation for demo
const calculateDemoPrice = (carat: number, colorIndex: number, clarityIndex: number) => {
  const basePrice = 5000; // Base price per carat
  const colorMultiplier = 1 - (colorIndex * 0.08);
  const clarityMultiplier = 1 - (clarityIndex * 0.06);
  const caratMultiplier = Math.pow(carat, 1.5);
  return Math.round(basePrice * colorMultiplier * clarityMultiplier * caratMultiplier);
};

export const CalculatorPreview = () => {
  const navigate = useNavigate();
  const [carat, setCarat] = useState(1.0);
  const [selectedShape, setSelectedShape] = useState(0);
  const [selectedColor, setSelectedColor] = useState(1);
  const [selectedClarity, setSelectedClarity] = useState(2);
  const [showResult, setShowResult] = useState(false);

  const estimatedPrice = calculateDemoPrice(carat, selectedColor, selectedClarity);

  const handleCalculate = () => {
    setShowResult(true);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gemstone-from/5 via-background to-jewellery-from/5">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-gemstone-from/30 bg-gemstone-from/5 px-4 py-2 text-sm mb-6">
              <Calculator className="h-4 w-4 text-gemstone-from" />
              <span className="font-medium text-gemstone-from">Try Our Calculator</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold font-serif mb-4">
              Diamond Price
              <span className="block mt-2 bg-gradient-to-r from-gemstone-from to-gemstone-to bg-clip-text text-transparent">
                Estimator
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get instant price estimates based on the 4Cs
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-primary/10 overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Controls */}
                  <div className="space-y-6">
                    {/* Shape Selection */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Shape</Label>
                      <div className="flex flex-wrap gap-2">
                        {DEMO_SHAPES.map((shape, index) => (
                          <motion.button
                            key={shape}
                            onClick={() => setSelectedShape(index)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                              selectedShape === index
                                ? "bg-gradient-to-r from-gemstone-from to-gemstone-to text-white"
                                : "bg-muted hover:bg-muted/80"
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {shape}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Carat Slider */}
                    <div>
                      <div className="flex justify-between mb-3">
                        <Label className="text-sm font-medium">Carat Weight</Label>
                        <span className="text-sm font-bold text-primary">{carat.toFixed(2)} ct</span>
                      </div>
                      <Slider
                        value={[carat]}
                        onValueChange={([value]) => setCarat(value)}
                        min={0.3}
                        max={3}
                        step={0.1}
                        className="py-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>0.30 ct</span>
                        <span>3.00 ct</span>
                      </div>
                    </div>

                    {/* Color Selection */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Color</Label>
                      <div className="flex gap-2">
                        {DEMO_COLORS.map((color, index) => (
                          <motion.button
                            key={color}
                            onClick={() => setSelectedColor(index)}
                            className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                              selectedColor === index
                                ? "bg-gradient-to-r from-gemstone-from to-gemstone-to text-white shadow-lg"
                                : "bg-muted hover:bg-muted/80"
                            }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {color}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Clarity Selection */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Clarity</Label>
                      <div className="flex flex-wrap gap-2">
                        {DEMO_CLARITIES.map((clarity, index) => (
                          <motion.button
                            key={clarity}
                            onClick={() => setSelectedClarity(index)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              selectedClarity === index
                                ? "bg-gradient-to-r from-gemstone-from to-gemstone-to text-white"
                                : "bg-muted hover:bg-muted/80"
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {clarity}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-gemstone-from to-gemstone-to hover:opacity-90"
                      size="lg"
                      onClick={handleCalculate}
                    >
                      <Sparkles className="h-5 w-5 mr-2" />
                      Calculate Estimate
                    </Button>
                  </div>

                  {/* Result Display */}
                  <div className="flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                      {showResult ? (
                        <motion.div
                          key="result"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="text-center p-6 rounded-2xl bg-gradient-to-br from-gemstone-from/10 to-gemstone-to/10 border border-gemstone-from/20"
                        >
                          <Badge className="mb-4 bg-gemstone-from/20 text-gemstone-from hover:bg-gemstone-from/30">
                            Demo Estimate
                          </Badge>
                          <div className="mb-2">
                            <span className="text-sm text-muted-foreground">
                              {DEMO_SHAPES[selectedShape]} • {carat.toFixed(2)}ct • {DEMO_COLORS[selectedColor]} • {DEMO_CLARITIES[selectedClarity]}
                            </span>
                          </div>
                          <motion.div
                            className="text-5xl md:text-6xl font-bold font-serif bg-gradient-to-r from-gemstone-from to-gemstone-to bg-clip-text text-transparent mb-4"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                          >
                            ${estimatedPrice.toLocaleString()}
                          </motion.div>
                          <p className="text-sm text-muted-foreground mb-6">
                            *Demo estimate only. Full calculator includes Rapaport pricing, cut grades & more.
                          </p>
                          <Button
                            variant="outline"
                            className="border-gemstone-from/30 hover:bg-gemstone-from/10"
                            onClick={() => navigate("/diamond-calculator")}
                          >
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Get Accurate Pricing
                          </Button>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="placeholder"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-center p-6 rounded-2xl border-2 border-dashed border-muted-foreground/20"
                        >
                          <Calculator className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                          <p className="text-muted-foreground">
                            Select diamond specifications and click calculate to see an estimate
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="text-center mt-10">
            <Button
              size="lg"
              variant="outline"
              className="group gap-2 border-2"
              onClick={() => navigate("/diamond-calculator")}
            >
              <Calculator className="h-5 w-5" />
              Open Full Calculator
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">
              Rapaport-based pricing • Compare up to 4 diamonds • Export reports
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
