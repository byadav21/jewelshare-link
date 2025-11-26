import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calculator, Diamond, Sparkles, TrendingDown, TrendingUp, RotateCcw } from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const DiamondCalculator = () => {
  const [carat, setCarat] = useState<string>("");
  const [shape, setShape] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [clarity, setClarity] = useState<string>("");
  const [cut, setCut] = useState<string>("");
  const [adjustmentType, setAdjustmentType] = useState<"discount" | "markup">("discount");
  const [adjustmentInput, setAdjustmentInput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    pricePerCarat: number;
    totalPrice: number;
    currency: string;
  } | null>(null);

  // Parse adjustment input - supports percentages (50, 50%) and fractions (1/2, 3/4)
  const adjustmentPercentage = useMemo(() => {
    if (!adjustmentInput.trim()) return 0;
    
    const input = adjustmentInput.trim();
    
    // Check if it's a fraction (e.g., "1/2", "3/4")
    if (input.includes('/')) {
      const [numerator, denominator] = input.split('/').map(s => parseFloat(s.trim()));
      if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
        return Math.min(100, Math.max(0, (numerator / denominator) * 100));
      }
      return 0;
    }
    
    // Parse as percentage (remove % if present)
    const numValue = parseFloat(input.replace('%', ''));
    if (!isNaN(numValue)) {
      return Math.min(100, Math.max(0, numValue));
    }
    
    return 0;
  }, [adjustmentInput]);

  const shapes = ["Round", "Princess", "Cushion", "Emerald", "Oval", "Radiant", "Asscher", "Marquise", "Heart", "Pear"];
  const colors = ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N"];
  const clarities = ["IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "SI3", "I1", "I2", "I3"];
  const cuts = ["Excellent", "Very Good", "Good", "Fair", "Poor"];

  const testWithSampleData = () => {
    setCarat("0.20");
    setShape("Round");
    setColor("D");
    setClarity("IF");
    setCut("Excellent");
    toast.info("Sample data loaded - click Calculate to test");
  };

  const calculatePrice = async () => {
    if (!carat || !shape || !color || !clarity || !cut) {
      toast.error("Please fill in all fields");
      return;
    }

    const caratNum = parseFloat(carat);
    if (isNaN(caratNum) || caratNum <= 0) {
      toast.error("Please enter a valid carat weight");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("diamond_prices")
        .select("*")
        .eq("shape", shape)
        .eq("color_grade", color)
        .eq("clarity_grade", clarity)
        .eq("cut_grade", cut)
        .lte("carat_range_min", caratNum)
        .gte("carat_range_max", caratNum)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error("No pricing data found for these specifications. Please contact admin to add pricing data.");
        setResult(null);
        return;
      }

      const pricePerCarat = Number(data.price_per_carat);
      const totalPrice = pricePerCarat * caratNum;

      setResult({
        pricePerCarat,
        totalPrice,
        currency: data.currency,
      });

      toast.success("Price calculated successfully!");
    } catch (error) {
      console.error("Error calculating price:", error);
      toast.error("Failed to calculate price");
    } finally {
      setLoading(false);
    }
  };

  const resetCalculator = () => {
    setCarat("");
    setShape("");
    setColor("");
    setClarity("");
    setCut("");
    setAdjustmentInput("");
    setAdjustmentType("discount");
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
      <div className="container mx-auto px-4 py-12">
        <ScrollReveal>
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="inline-block mb-4"
            >
              <Diamond className="h-16 w-16 text-primary mx-auto" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              Diamond Price Calculator
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get instant estimates based on the 4Cs: Carat, Color, Clarity, and Cut
            </p>
          </div>
        </ScrollReveal>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
          <ScrollReveal delay={0.1} className="lg:col-span-2">
            <Card className="shadow-xl border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 bg-gradient-to-br from-card via-card to-primary/5">
              <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Calculator className="h-6 w-6 text-primary" />
                      Diamond Specifications
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Enter the 4Cs to calculate your diamond's value
                    </CardDescription>
                  </div>
                  <Diamond className="h-12 w-12 text-primary/20" />
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="carat" className="text-sm font-semibold flex items-center gap-2">
                      <Diamond className="h-4 w-4" />
                      Carat Weight
                    </Label>
                    <Input
                      id="carat"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="e.g., 1.50"
                      value={carat}
                      onChange={(e) => setCarat(e.target.value)}
                      className="text-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shape" className="text-sm font-semibold">Shape</Label>
                    <Select value={shape} onValueChange={setShape}>
                      <SelectTrigger id="shape">
                        <SelectValue placeholder="Select shape" />
                      </SelectTrigger>
                      <SelectContent>
                        {shapes.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="color" className="text-sm font-semibold">Color Grade</Label>
                    <Select value={color} onValueChange={setColor}>
                      <SelectTrigger id="color">
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                      <SelectContent>
                        {colors.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clarity" className="text-sm font-semibold">Clarity Grade</Label>
                    <Select value={clarity} onValueChange={setClarity}>
                      <SelectTrigger id="clarity">
                        <SelectValue placeholder="Select clarity" />
                      </SelectTrigger>
                      <SelectContent>
                        {clarities.map((cl) => (
                          <SelectItem key={cl} value={cl}>
                            {cl}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cut" className="text-sm font-semibold">Cut Grade</Label>
                    <Select value={cut} onValueChange={setCut}>
                      <SelectTrigger id="cut">
                        <SelectValue placeholder="Select cut" />
                      </SelectTrigger>
                      <SelectContent>
                        {cuts.map((ct) => (
                          <SelectItem key={ct} value={ct}>
                            {ct}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border-t border-border/50 pt-6">
                  <Tabs value={adjustmentType} onValueChange={(v) => setAdjustmentType(v as "discount" | "markup")}>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-semibold">Price Adjustment</Label>
                      <TabsList className="grid w-[240px] grid-cols-2">
                        <TabsTrigger value="discount" className="flex items-center gap-1">
                          <TrendingDown className="h-3 w-3" />
                          Discount
                        </TabsTrigger>
                        <TabsTrigger value="markup" className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Markup
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="discount" className="mt-0">
                      <div className="space-y-2">
                        <Input
                          placeholder="Enter discount: 50, 50%, 1/2, 3/4"
                          value={adjustmentInput}
                          onChange={(e) => setAdjustmentInput(e.target.value)}
                          className="text-lg"
                        />
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {adjustmentPercentage > 0 ? `${adjustmentPercentage.toFixed(1)}% discount` : 'No discount'}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            Accepts percentages or fractions
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="markup" className="mt-0">
                      <div className="space-y-2">
                        <Input
                          placeholder="Enter markup: 20, 20%, 1/5, 1/4"
                          value={adjustmentInput}
                          onChange={(e) => setAdjustmentInput(e.target.value)}
                          className="text-lg"
                        />
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {adjustmentPercentage > 0 ? `${adjustmentPercentage.toFixed(1)}% markup` : 'No markup'}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            Accepts percentages or fractions
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border/50">
                  <Button
                    onClick={calculatePrice}
                    disabled={loading}
                    size="lg"
                    className="flex-1 text-lg font-semibold shadow-lg"
                  >
                    <Calculator className="h-5 w-5 mr-2" />
                    {loading ? "Calculating..." : "Calculate Price"}
                  </Button>
                  <Button
                    onClick={testWithSampleData}
                    variant="secondary"
                    disabled={loading}
                    size="lg"
                  >
                    <Diamond className="h-4 w-4 mr-2" />
                    Test
                  </Button>
                  <Button
                    onClick={resetCalculator}
                    variant="outline"
                    disabled={loading}
                    size="lg"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <Card className="shadow-xl border-2 border-primary/20 bg-gradient-to-br from-card via-primary/5 to-card sticky top-24">
              <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/10 to-transparent">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Sparkles className="h-6 w-6 text-primary" />
                  Estimated Value
                </CardTitle>
                <CardDescription>
                  Based on current market rates
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {result ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                  >
                    <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-xl p-6 space-y-5 border border-primary/20">
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Price per Carat</p>
                        <p className="text-3xl font-bold flex items-baseline gap-2">
                          <span className="text-lg text-muted-foreground">{result.currency}</span>
                          <AnimatedCounter end={result.pricePerCarat} />
                        </p>
                      </div>
                      
                      <div className="border-t border-primary/20 pt-5">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">Base Total Price</p>
                        <p className="text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent flex items-baseline gap-2">
                          <span className="text-xl opacity-80">{result.currency}</span>
                          <AnimatedCounter end={result.totalPrice} />
                        </p>
                      </div>

                      {adjustmentPercentage > 0 && (
                        <div className="border-t border-primary/20 pt-5 bg-gradient-to-r from-green-500/10 to-blue-500/10 -m-6 mt-5 p-6 rounded-b-xl">
                          <div className="flex items-center gap-2 mb-2">
                            {adjustmentType === "discount" ? (
                              <TrendingDown className="h-5 w-5 text-green-600" />
                            ) : (
                              <TrendingUp className="h-5 w-5 text-blue-600" />
                            )}
                            <p className="text-sm font-semibold uppercase tracking-wide">
                              After {adjustmentPercentage.toFixed(1)}% {adjustmentType}
                            </p>
                          </div>
                          <p className={`text-4xl font-bold ${
                            adjustmentType === "discount" 
                              ? "text-green-600 dark:text-green-400" 
                              : "text-blue-600 dark:text-blue-400"
                          } flex items-baseline gap-2`}>
                            <span className="text-lg">{result.currency}</span>
                            <AnimatedCounter 
                              end={Math.round(
                                adjustmentType === "discount"
                                  ? result.totalPrice * (1 - adjustmentPercentage / 100)
                                  : result.totalPrice * (1 + adjustmentPercentage / 100)
                              )} 
                            />
                          </p>
                          <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                            {adjustmentType === "discount" ? (
                              <>
                                <Badge variant="secondary" className="bg-green-500/20 text-green-700 dark:text-green-300">
                                  Save {result.currency} {Math.round(result.totalPrice * (adjustmentPercentage / 100)).toLocaleString()}
                                </Badge>
                              </>
                            ) : (
                              <>
                                <Badge variant="secondary" className="bg-blue-500/20 text-blue-700 dark:text-blue-300">
                                  +{result.currency} {Math.round(result.totalPrice * (adjustmentPercentage / 100)).toLocaleString()}
                                </Badge>
                              </>
                            )}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                      <p className="font-semibold mb-3 flex items-center gap-2">
                        <Diamond className="h-4 w-4 text-primary" />
                        Diamond Summary
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Weight</p>
                          <p className="font-medium">{carat} Carat</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Shape</p>
                          <p className="font-medium">{shape}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Color</p>
                          <p className="font-medium">{color}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Clarity</p>
                          <p className="font-medium">{clarity}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-muted-foreground text-xs">Cut</p>
                          <p className="font-medium">{cut}</p>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground text-center leading-relaxed bg-muted/20 rounded p-3">
                      <strong>Disclaimer:</strong> This is an estimate based on available market data. Actual prices may vary based on market conditions, certifications, and specific diamond characteristics.
                    </p>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Diamond className="h-28 w-28 text-primary/20 mb-6" />
                    </motion.div>
                    <p className="text-muted-foreground max-w-[200px] text-sm">
                      Enter your diamond specifications to see the estimated value
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={0.3}>
          <div className="mt-12 max-w-6xl mx-auto">
            <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/30 shadow-xl">
              <CardHeader className="text-center border-b border-primary/20 pb-6">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                  Understanding the 4Cs of Diamonds
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Learn what determines a diamond's value and quality
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-8 pt-8">
                <motion.div 
                  className="space-y-3 p-5 rounded-lg bg-card border border-border/50 hover:border-primary/30 transition-all"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Diamond className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg">Carat Weight</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The weight of the diamond, where 1 carat equals 200 milligrams. Larger diamonds are rarer and typically more valuable per carat.
                  </p>
                </motion.div>

                <motion.div 
                  className="space-y-3 p-5 rounded-lg bg-card border border-border/50 hover:border-primary/30 transition-all"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg">Color</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Graded from D (colorless) to Z (light color). D-F grades are considered colorless and most valuable, showing no visible color tint.
                  </p>
                </motion.div>

                <motion.div 
                  className="space-y-3 p-5 rounded-lg bg-card border border-border/50 hover:border-primary/30 transition-all"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Diamond className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg">Clarity</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Measures internal and external imperfections (inclusions and blemishes). FL (Flawless) is the highest grade, with no inclusions visible under 10x magnification.
                  </p>
                </motion.div>

                <motion.div 
                  className="space-y-3 p-5 rounded-lg bg-card border border-border/50 hover:border-primary/30 transition-all"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg">Cut</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Evaluates how well the diamond reflects light and creates brilliance. An Excellent cut grade maximizes the diamond's sparkle and fire.
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
};

export default DiamondCalculator;
