import { useState, useMemo, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calculator, Diamond, Sparkles, TrendingDown, TrendingUp, RotateCcw, Plus, X, Scale, Download, Ruler, Volume2, VolumeX } from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DiamondCalculatorUpgradeBanner } from "@/components/DiamondCalculatorUpgradeBanner";
import { UnlimitedUnlockedCelebration } from "@/components/UnlimitedUnlockedCelebration";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { SEOHead } from "@/components/SEOHead";
import { StructuredData } from "@/components/StructuredData";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { playSparkleSound } from "@/utils/celebrationSounds";

interface ComparisonItem {
  id: string;
  specs: {
    carat: string;
    shape: string;
    color: string;
    clarity: string;
    cut: string;
  };
  result: {
    pricePerCarat: number;
    totalPrice: number;
    currency: string;
  };
  adjustmentType: "discount" | "markup";
  adjustmentPercentage: number;
  finalPrice: number;
}

const DiamondCalculator = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [guestUsageCount, setGuestUsageCount] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
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
  const [comparisonList, setComparisonList] = useState<ComparisonItem[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Confetti celebration effect
  const fireConfetti = useCallback(() => {
    const colors = ["#60a5fa", "#a78bfa", "#f472b6", "#fbbf24", "#ffffff"];
    
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6, x: 0.5 },
      colors,
      shapes: ["star", "circle"],
      scalar: 1.2,
    });

    setTimeout(() => {
      confetti({
        particleCount: 40,
        angle: 60,
        spread: 55,
        origin: { x: 0.3, y: 0.65 },
        colors,
        shapes: ["star"],
      });
      confetti({
        particleCount: 40,
        angle: 120,
        spread: 55,
        origin: { x: 0.7, y: 0.65 },
        colors,
        shapes: ["star"],
      });
    }, 150);
  }, []);

  // Check authentication status and show celebration on sign in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const wasGuest = !isAuthenticated;
      setIsAuthenticated(!!session);
      
      // Show celebration if user just signed in and was previously a guest
      if (event === 'SIGNED_IN' && session && wasGuest) {
        setTimeout(() => setShowCelebration(true), 500);
      }
    });

    return () => subscription.unsubscribe();
  }, [isAuthenticated]);

  // Track guest usage with daily reset
  useEffect(() => {
    if (!isAuthenticated) {
      const today = new Date().toDateString();
      const stored = localStorage.getItem('diamond_calculator_usage');
      
      if (stored) {
        const { date, count } = JSON.parse(stored);
        if (date === today) {
          setGuestUsageCount(count);
        } else {
          localStorage.setItem('diamond_calculator_usage', JSON.stringify({ date: today, count: 0 }));
          setGuestUsageCount(0);
        }
      } else {
        localStorage.setItem('diamond_calculator_usage', JSON.stringify({ date: today, count: 0 }));
        setGuestUsageCount(0);
      }
    }
  }, [isAuthenticated]);

  const incrementGuestUsage = () => {
    if (!isAuthenticated) {
      const today = new Date().toDateString();
      const newCount = guestUsageCount + 1;
      localStorage.setItem('diamond_calculator_usage', JSON.stringify({ date: today, count: newCount }));
      setGuestUsageCount(newCount);
    }
  };

  const checkUsageLimit = (): boolean => {
    if (isAuthenticated) return true;
    
    if (guestUsageCount >= 5) {
      toast.error("Daily limit reached. Please sign in for unlimited calculations.", {
        action: {
          label: "Sign In",
          onClick: () => window.location.href = "/auth"
        }
      });
      return false;
    }
    return true;
  };

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
  const cuts = ["Excellent"];

  const testWithSampleData = () => {
    setCarat("0.20");
    setShape("Round");
    setColor("D");
    setClarity("IF");
    setCut("Excellent");
    toast.info("Sample data loaded - click Calculate to test");
  };

  const calculatePrice = async () => {
    if (!checkUsageLimit()) return;
    
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
      // Dual pricing strategy: Round uses Round pricing, all fancy shapes use Pear pricing
      const lookupShape = shape === "Round" ? "Round" : "Pear";
      
      const { data, error } = await supabase
        .from("diamond_prices")
        .select("*")
        .eq("shape", lookupShape)
        .eq("color_grade", color)
        .eq("clarity_grade", clarity)
        .eq("cut_grade", "Excellent") // Always use Excellent grade for pricing
        .lte("carat_range_min", caratNum)
        .gte("carat_range_max", caratNum)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error(
          `No pricing data found for ${lookupShape} diamonds with these specifications (${color}/${clarity}, ${caratNum}ct). Please contact admin to add pricing data.`,
          { duration: 5000 }
        );
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

      // Celebration effects
      fireConfetti();
      if (soundEnabled) {
        playSparkleSound();
      }

      incrementGuestUsage();
      toast.success("Price calculated successfully!");
    } catch (error) {
      console.error("Error calculating price:", error);
      toast.error("Failed to calculate price");
    } finally {
      setLoading(false);
    }
  };

  const addToComparison = () => {
    if (!checkUsageLimit()) return;
    
    if (!result) {
      toast.error("Calculate a price first before adding to comparison");
      return;
    }

    if (comparisonList.length >= 4) {
      toast.error("Maximum 4 diamonds can be compared at once");
      return;
    }

    const finalPrice = adjustmentPercentage > 0
      ? adjustmentType === "discount"
        ? result.totalPrice * (1 - adjustmentPercentage / 100)
        : result.totalPrice * (1 + adjustmentPercentage / 100)
      : result.totalPrice;

    const newItem: ComparisonItem = {
      id: Date.now().toString(),
      specs: { carat, shape, color, clarity, cut },
      result,
      adjustmentType,
      adjustmentPercentage,
      finalPrice: Math.round(finalPrice),
    };

    setComparisonList([...comparisonList, newItem]);
    toast.success("Added to comparison");
  };

  const removeFromComparison = (id: string) => {
    setComparisonList(comparisonList.filter(item => item.id !== id));
    toast.success("Removed from comparison");
  };

  const clearComparison = () => {
    setComparisonList([]);
    toast.success("Comparison cleared");
  };

  const exportComparisonToPDF = () => {
    if (comparisonList.length === 0) {
      toast.error("No diamonds to export");
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text("Diamond Comparison Report", pageWidth / 2, 20, { align: "center" });
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 28, { align: "center" });
      
      // Prepare table data
      const tableHeaders = [
        "Specification",
        ...comparisonList.map((_, idx) => `Option ${idx + 1}`)
      ];
      
      const tableData = [
        ["Carat Weight", ...comparisonList.map(item => item.specs.carat)],
        ["Shape", ...comparisonList.map(item => item.specs.shape)],
        ["Color Grade", ...comparisonList.map(item => item.specs.color)],
        ["Clarity Grade", ...comparisonList.map(item => item.specs.clarity)],
        ["Cut Grade", ...comparisonList.map(item => item.specs.cut)],
        ["", ...Array(comparisonList.length).fill("")], // Empty row for spacing
        ["Price/Carat", ...comparisonList.map(item => 
          `${item.result.currency} ${item.result.pricePerCarat.toLocaleString()}`
        )],
        ["Base Price", ...comparisonList.map(item => 
          `${item.result.currency} ${item.result.totalPrice.toLocaleString()}`
        )],
        ["Adjustment", ...comparisonList.map(item => 
          item.adjustmentPercentage > 0 
            ? `${item.adjustmentPercentage.toFixed(1)}% ${item.adjustmentType}`
            : "None"
        )],
        ["Final Price", ...comparisonList.map(item => 
          `${item.result.currency} ${item.finalPrice.toLocaleString()}`
        )],
      ];
      
      // Add table
      autoTable(doc, {
        startY: 35,
        head: [tableHeaders],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [66, 66, 66],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
        },
        bodyStyles: {
          halign: "center",
        },
        columnStyles: {
          0: { halign: "left", fontStyle: "bold" },
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
      });
      
      // Summary section
      if (comparisonList.length > 1) {
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        
        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        doc.text("Quick Summary", 14, finalY);
        
        const lowestPrice = Math.min(...comparisonList.map(item => item.finalPrice));
        const highestPrice = Math.max(...comparisonList.map(item => item.finalPrice));
        const priceDiff = highestPrice - lowestPrice;
        const currency = comparisonList[0].result.currency;
        
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.text(`Lowest Price: ${currency} ${lowestPrice.toLocaleString()}`, 14, finalY + 8);
        doc.text(`Highest Price: ${currency} ${highestPrice.toLocaleString()}`, 14, finalY + 14);
        doc.text(`Price Difference: ${currency} ${priceDiff.toLocaleString()}`, 14, finalY + 20);
      }
      
      // Footer
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        );
      }
      
      // Save PDF
      doc.save(`diamond-comparison-${new Date().getTime()}.pdf`);
      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF");
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

  // Software application schema for calculator
  const calculatorSchema = {
    type: "SoftwareApplication" as const,
    name: "Cataleon Diamond Price Calculator",
    description: "Free online diamond price calculator using Rapaport-based pricing. Calculate diamond values based on the 4Cs: Carat, Cut, Color, and Clarity. Compare up to 4 diamonds side-by-side and export PDF reports.",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web Browser",
    offers: {
      price: "0",
      priceCurrency: "USD"
    },
    aggregateRating: {
      ratingValue: "4.9",
      ratingCount: "500"
    }
  };

  // FAQ schema for diamond calculator
  const faqSchema = {
    type: "FAQPage" as const,
    questions: [
      {
        question: "How does the diamond price calculator work?",
        answer: "Our diamond calculator uses Rapaport-based pricing to estimate diamond values. Enter the 4Cs (Carat, Cut, Color, Clarity) and shape to get instant price estimates. You can also apply discounts or markups and compare up to 4 diamonds."
      },
      {
        question: "Is the diamond calculator free to use?",
        answer: "Yes! Guest users get 5 free calculations per day. Sign up for a free account to get unlimited calculations, comparison features, and PDF export capabilities."
      },
      {
        question: "What diamond shapes are supported?",
        answer: "We support all major diamond shapes: Round, Princess, Cushion, Emerald, Oval, Radiant, Asscher, Marquise, Heart, and Pear."
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
      {/* SEO Meta Tags */}
      <SEOHead
        title="Free Diamond Price Calculator - Rapaport Based Pricing | Cataleon"
        description="Calculate diamond prices instantly with our free Rapaport-based calculator. Enter the 4Cs (Carat, Cut, Color, Clarity) to get accurate price estimates. Compare diamonds and export PDF reports. 5 free calculations daily for guests."
        keywords="diamond price calculator, diamond value calculator, Rapaport diamond prices, 4Cs calculator, diamond cost estimator, loose diamond pricing, diamond comparison tool, free diamond calculator"
        canonicalUrl="/diamond-calculator"
      />
      
      {/* Structured Data */}
      <StructuredData data={[calculatorSchema, faqSchema]} />
      
      <Header />
      <UnlimitedUnlockedCelebration 
        show={showCelebration} 
        onClose={() => setShowCelebration(false)} 
      />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-4">
          <BackToHomeButton />
        </div>
        
        <ScrollReveal>
          <div className="text-center mb-8 md:mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="inline-block mb-3 md:mb-4"
            >
              <Diamond className="h-12 w-12 md:h-16 md:w-16 text-primary mx-auto" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent px-4">
              Diamond Price Calculator
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Get instant estimates based on the 4Cs
            </p>
            <Button
              variant="outline"
              className="mt-4 gap-2"
              onClick={() => navigate("/diamond-sizing-chart")}
            >
              <Ruler className="h-4 w-4" />
              View Diamond Sizing Chart
            </Button>
          </div>
        </ScrollReveal>

        {!isAuthenticated && (
          <ScrollReveal delay={0.05}>
            <div className="max-w-6xl mx-auto mb-6">
              <DiamondCalculatorUpgradeBanner
                remainingCalculations={5 - guestUsageCount}
                totalLimit={5}
              />
            </div>
          </ScrollReveal>
        )}

        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-4 md:gap-6">
          <ScrollReveal delay={0.1} className="lg:col-span-2">
            <Card className="shadow-xl border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 bg-gradient-to-br from-card via-card to-primary/5">
              <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg md:text-2xl">
                      <Calculator className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                      Diamond Specs
                    </CardTitle>
                    <CardDescription className="mt-1 md:mt-2 text-sm">
                      Enter the 4Cs to calculate value
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Diamond className="h-8 w-8 md:h-12 md:w-12 text-primary/20" />
                    {!isAuthenticated && (
                      <Badge variant={guestUsageCount >= 5 ? "destructive" : guestUsageCount >= 3 ? "secondary" : "outline"} className="text-xs">
                        {guestUsageCount}/5
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
                <div className="grid gap-4">
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

                <div className="border-t border-border/50 pt-4 md:pt-6">
                  <Tabs value={adjustmentType} onValueChange={(v) => setAdjustmentType(v as "discount" | "markup")}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                      <Label className="text-sm font-semibold">Price Adjustment</Label>
                      <TabsList className="grid w-full sm:w-[200px] grid-cols-2">
                        <TabsTrigger value="discount" className="flex items-center gap-1 text-xs sm:text-sm">
                          <TrendingDown className="h-3 w-3" />
                          <span className="hidden sm:inline">Discount</span>
                          <span className="sm:hidden">-</span>
                        </TabsTrigger>
                        <TabsTrigger value="markup" className="flex items-center gap-1 text-xs sm:text-sm">
                          <TrendingUp className="h-3 w-3" />
                          <span className="hidden sm:inline">Markup</span>
                          <span className="sm:hidden">+</span>
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
                  <Button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    variant="outline"
                    size="lg"
                    title={soundEnabled ? "Mute celebration sound" : "Enable celebration sound"}
                  >
                    {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
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

                    <Button
                      onClick={addToComparison}
                      variant="outline"
                      size="lg"
                      className="w-full mt-4"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Comparison ({comparisonList.length}/4)
                    </Button>
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

        {/* Comparison Section */}
        <AnimatePresence>
          {comparisonList.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-12 max-w-6xl mx-auto"
            >
              <Card className="shadow-xl border-2 border-primary/30 bg-gradient-to-br from-card via-primary/5 to-card">
                <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/10 to-transparent">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-2xl">
                        <Scale className="h-6 w-6 text-primary" />
                        Diamond Comparison
                      </CardTitle>
                      <CardDescription className="mt-2">
                        Compare up to 4 diamond specifications side-by-side
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={exportComparisonToPDF}
                        variant="default"
                        size="sm"
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Export PDF
                      </Button>
                      <Button
                        onClick={clearComparison}
                        variant="outline"
                        size="sm"
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {comparisonList.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative"
                      >
                        <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all bg-gradient-to-br from-card to-primary/5">
                          <Button
                            onClick={() => removeFromComparison(item.id)}
                            variant="ghost"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 z-10"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                Option {index + 1}
                              </Badge>
                              <Diamond className="h-4 w-4 text-primary" />
                            </div>
                          </CardHeader>
                          
                          <CardContent className="space-y-4">
                            {/* Specs */}
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Carat:</span>
                                <span className="font-semibold">{item.specs.carat}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Shape:</span>
                                <span className="font-semibold">{item.specs.shape}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Color:</span>
                                <span className="font-semibold">{item.specs.color}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Clarity:</span>
                                <span className="font-semibold">{item.specs.clarity}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Cut:</span>
                                <span className="font-semibold">{item.specs.cut}</span>
                              </div>
                            </div>

                            <Separator />

                            {/* Pricing */}
                            <div className="space-y-3">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Price/Carat</p>
                                <p className="text-lg font-bold">
                                  {item.result.currency} {item.result.pricePerCarat.toLocaleString()}
                                </p>
                              </div>
                              
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Base Price</p>
                                <p className="text-xl font-bold">
                                  {item.result.currency} {item.result.totalPrice.toLocaleString()}
                                </p>
                              </div>

                              {item.adjustmentPercentage > 0 && (
                                <div className="bg-primary/5 rounded-lg p-3 -mx-3">
                                  <div className="flex items-center gap-1 mb-1">
                                    {item.adjustmentType === "discount" ? (
                                      <TrendingDown className="h-3 w-3 text-green-600" />
                                    ) : (
                                      <TrendingUp className="h-3 w-3 text-blue-600" />
                                    )}
                                    <p className="text-xs font-medium">
                                      {item.adjustmentPercentage.toFixed(1)}% {item.adjustmentType}
                                    </p>
                                  </div>
                                  <p className={`text-2xl font-bold ${
                                    item.adjustmentType === "discount"
                                      ? "text-green-600 dark:text-green-400"
                                      : "text-blue-600 dark:text-blue-400"
                                  }`}>
                                    {item.result.currency} {item.finalPrice.toLocaleString()}
                                  </p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  {/* Comparison Summary */}
                  {comparisonList.length > 1 && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-transparent rounded-lg border border-primary/20">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Quick Comparison
                      </h4>
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Lowest Price:</p>
                          <p className="font-bold text-green-600 dark:text-green-400">
                            {comparisonList[0].result.currency}{" "}
                            {Math.min(...comparisonList.map(item => item.finalPrice)).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Highest Price:</p>
                          <p className="font-bold text-red-600 dark:text-red-400">
                            {comparisonList[0].result.currency}{" "}
                            {Math.max(...comparisonList.map(item => item.finalPrice)).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Price Difference:</p>
                          <p className="font-bold text-primary">
                            {comparisonList[0].result.currency}{" "}
                            {(Math.max(...comparisonList.map(item => item.finalPrice)) - 
                              Math.min(...comparisonList.map(item => item.finalPrice))).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Footer />
      <ThemeSwitcher />
    </div>
  );
};

export default DiamondCalculator;
