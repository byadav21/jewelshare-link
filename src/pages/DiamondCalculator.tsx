import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calculator, Diamond, Sparkles } from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/ScrollReveal";

const DiamondCalculator = () => {
  const [carat, setCarat] = useState<string>("");
  const [shape, setShape] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [clarity, setClarity] = useState<string>("");
  const [cut, setCut] = useState<string>("");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    pricePerCarat: number;
    totalPrice: number;
    currency: string;
  } | null>(null);

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

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          <ScrollReveal delay={0.1}>
            <Card className="shadow-lg border-2 border-primary/10 hover:border-primary/30 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Diamond Specifications
                </CardTitle>
                <CardDescription>
                  Enter the details of your diamond
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="carat">Carat Weight</Label>
                  <Input
                    id="carat"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="e.g., 1.50"
                    value={carat}
                    onChange={(e) => setCarat(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shape">Shape</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="color">Color Grade</Label>
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
                  <Label htmlFor="clarity">Clarity Grade</Label>
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
                  <Label htmlFor="cut">Cut Grade</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="discount">Discount (%)</Label>
                  <Slider
                    id="discount"
                    min={0}
                    max={100}
                    step={1}
                    value={[discount]}
                    onValueChange={(value) => setDiscount(value[0])}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    {discount}% discount applied
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    onClick={calculatePrice}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? "Calculating..." : "Calculate Price"}
                  </Button>
                  <Button
                    onClick={testWithSampleData}
                    variant="secondary"
                    disabled={loading}
                  >
                    <Diamond className="h-4 w-4 mr-2" />
                    Test Sample
                  </Button>
                  <Button
                    onClick={resetCalculator}
                    variant="outline"
                    disabled={loading}
                  >
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <Card className="shadow-lg border-2 border-primary/10 bg-gradient-to-br from-card via-card to-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Estimated Value
                </CardTitle>
                <CardDescription>
                  Based on current market rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {result ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="bg-primary/5 rounded-lg p-6 space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Price per Carat</p>
                        <p className="text-2xl font-bold">
                          {result.currency} <AnimatedCounter end={result.pricePerCarat} />
                        </p>
                      </div>
                      
                      <div className="border-t border-border pt-4">
                        <p className="text-sm text-muted-foreground mb-1">Total Estimated Price</p>
                        <p className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                          {result.currency} <AnimatedCounter end={result.totalPrice} />
                        </p>
                      </div>

                      {discount > 0 && (
                        <div className="border-t border-border pt-4">
                          <p className="text-sm text-muted-foreground mb-1">
                            After {discount}% Discount
                          </p>
                          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                            {result.currency} <AnimatedCounter end={Math.round(result.totalPrice * (1 - discount / 100))} />
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            You save {result.currency} {Math.round(result.totalPrice * (discount / 100)).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                      <p className="font-medium mb-2">Diamond Details:</p>
                      <ul className="space-y-1">
                        <li>• {carat} Carat {shape}</li>
                        <li>• Color: {color}</li>
                        <li>• Clarity: {clarity}</li>
                        <li>• Cut: {cut}</li>
                      </ul>
                    </div>

                    <p className="text-xs text-muted-foreground text-center">
                      * This is an estimate based on available data. Actual prices may vary based on market conditions and specific diamond characteristics.
                    </p>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Diamond className="h-24 w-24 text-muted-foreground/20 mb-4" />
                    <p className="text-muted-foreground">
                      Enter diamond specifications to see the estimated price
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={0.3}>
          <div className="mt-12 max-w-4xl mx-auto">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle>Understanding the 4Cs</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Carat Weight</h3>
                  <p className="text-sm text-muted-foreground">
                    The weight of the diamond, where 1 carat equals 200 milligrams.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Color</h3>
                  <p className="text-sm text-muted-foreground">
                    Graded from D (colorless) to Z (light color). D-F are considered colorless.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Clarity</h3>
                  <p className="text-sm text-muted-foreground">
                    Measures internal and external imperfections. FL (Flawless) is the highest grade.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Cut</h3>
                  <p className="text-sm text-muted-foreground">
                    Evaluates how well the diamond reflects light. Excellent cut maximizes brilliance.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
};

export default DiamondCalculator;
