import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SEOHead } from "@/components/SEOHead";
import { StructuredData } from "@/components/StructuredData";
import { SIEVE_DATA, ALL_SIEVE_DATA, SieveDataItem } from "@/constants/sieveData";
import { cn } from "@/lib/utils";
import { 
  Diamond, Ruler, Search, Scale, Calculator, Layers, 
  ArrowRight, Info, Sparkles, Grid3X3, FileDown, Hash
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

const DiamondSieveChart = () => {
  const [searchMM, setSearchMM] = useState("");
  const [searchSieve, setSearchSieve] = useState("");
  const [searchCarat, setSearchCarat] = useState("");
  const [selectedItem, setSelectedItem] = useState<(SieveDataItem & { range: string }) | null>(null);
  const [activeTab, setActiveTab] = useState("chart");
  
  // Stone calculator state
  const [selectedSieveForCalc, setSelectedSieveForCalc] = useState("");
  const [stoneCount, setStoneCount] = useState("");

  // Calculate total carat weight based on selected sieve and stone count
  const calculatedTotalCarat = useMemo(() => {
    if (!selectedSieveForCalc || !stoneCount) return null;
    const sieveItem = ALL_SIEVE_DATA.find(item => item.sieveSize === selectedSieveForCalc);
    if (!sieveItem) return null;
    const count = parseFloat(stoneCount);
    if (isNaN(count) || count <= 0) return null;
    return {
      totalCarat: count * sieveItem.caratWeight,
      perStoneCarat: sieveItem.caratWeight,
      mmSize: sieveItem.mmSize,
      stonesPerCarat: sieveItem.noOfStones
    };
  }, [selectedSieveForCalc, stoneCount]);

  // PDF Export function
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text("Diamond Sieve Size Chart", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 28);
    
    let yPos = 35;
    
    SIEVE_DATA.forEach((group) => {
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      // Group header
      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);
      doc.text(`Sieve Size Range: ${group.range}`, 14, yPos);
      yPos += 5;
      
      // Table data
      const tableData = group.items.map(item => [
        item.sieveSize,
        `${item.mmSize} mm`,
        item.noOfStones.toString(),
        `${item.caratWeight.toFixed(3)} ct`
      ]);
      
      autoTable(doc, {
        startY: yPos,
        head: [['Sieve Size', 'MM Size', 'No. of Stones', 'Ct. Weight/Piece']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [80, 80, 80] },
        margin: { left: 14 },
        styles: { fontSize: 9 }
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 10;
    });
    
    doc.save("diamond-sieve-chart.pdf");
    toast.success("PDF exported successfully!");
  };

  // Filter results based on search inputs
  const filteredResults = useMemo(() => {
    if (!searchMM && !searchSieve && !searchCarat) return [];
    
    return ALL_SIEVE_DATA.filter(item => {
      const matchesMM = searchMM ? item.mmSize.toString().includes(searchMM) : true;
      const matchesSieve = searchSieve ? item.sieveSize.toLowerCase().includes(searchSieve.toLowerCase()) : true;
      const matchesCarat = searchCarat ? item.caratWeight.toString().includes(searchCarat) : true;
      return matchesMM && matchesSieve && matchesCarat;
    });
  }, [searchMM, searchSieve, searchCarat]);

  // Find closest match for calculator
  const findClosestByMM = (mm: number) => {
    return ALL_SIEVE_DATA.reduce((closest, item) => {
      if (!closest || Math.abs(item.mmSize - mm) < Math.abs(closest.mmSize - mm)) {
        return item;
      }
      return closest;
    }, null as (SieveDataItem & { range: string }) | null);
  };

  const findClosestByCarat = (carat: number) => {
    return ALL_SIEVE_DATA.reduce((closest, item) => {
      if (!closest || Math.abs(item.caratWeight - carat) < Math.abs(closest.caratWeight - carat)) {
        return item;
      }
      return closest;
    }, null as (SieveDataItem & { range: string }) | null);
  };

  const mmResult = searchMM ? findClosestByMM(parseFloat(searchMM)) : null;
  const caratResult = searchCarat ? findClosestByCarat(parseFloat(searchCarat)) : null;

  // Structured data for SEO
  const toolSchema = {
    type: "SoftwareApplication" as const,
    name: "Diamond Sieve Size Chart",
    description: "Comprehensive diamond sieve size reference chart. Look up sieve numbers, mm dimensions, carat weights per stone, and stones per carat. Includes calculator for total carat weight.",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    offers: { price: "0", priceCurrency: "USD" }
  };

  const faqSchema = {
    type: "FAQPage" as const,
    questions: [
      { question: "What is a diamond sieve size?", answer: "Diamond sieve sizes are standardized classifications used to sort melee diamonds by their diameter. Sieves use numbered plates with holes of specific sizes to separate diamonds." },
      { question: "How do I convert sieve size to carat weight?", answer: "Each sieve size corresponds to a specific mm diameter and average carat weight. Our chart shows the relationship between sieve numbers, mm size, stones per carat, and individual stone weights." },
      { question: "How many diamonds are in one carat at a given sieve size?", answer: "The number of stones per carat varies by sieve size. Smaller sieves like +0 have over 200 stones per carat, while larger sieves like +14 have fewer than 5 stones per carat." }
    ]
  };

  const breadcrumbSchema = {
    type: "BreadcrumbList" as const,
    items: [
      { name: "Home", url: "https://cataleon.io/" },
      { name: "Calculators", url: "https://cataleon.io/calculators" },
      { name: "Diamond Sieve Chart", url: "https://cataleon.io/diamond-sieve-chart" }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      {/* SEO Meta Tags */}
      <SEOHead
        title="Diamond Sieve Size Chart - MM to Carat Conversion | Cataleon"
        description="Complete diamond sieve size reference chart. Convert between sieve numbers, mm dimensions, and carat weights. Calculate total carat weight for multiple stones. Essential tool for diamond sorting and pricing."
        keywords="diamond sieve chart, sieve size to carat, mm to carat conversion, melee diamond sizes, stones per carat, diamond sorting, sieve numbers"
        canonicalUrl="/diamond-sieve-chart"
      />
      
      {/* Structured Data */}
      <StructuredData data={[toolSchema, faqSchema, breadcrumbSchema]} />

      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-sm mb-6">
                <Grid3X3 className="h-4 w-4 text-primary" />
                <span className="text-primary font-medium">Sieve Size Reference</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Diamond Sieve Size Chart</h1>
              <p className="text-lg text-muted-foreground mb-6">
                Understand the relationship between sieve sizes, mm dimensions, carat weights, 
                and number of stones per carat. Essential for diamond sorting and pricing.
              </p>
              <Button onClick={exportToPDF} variant="outline" className="gap-2">
                <FileDown className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="chart" className="gap-2">
              <Grid3X3 className="h-4 w-4" />
              <span className="hidden sm:inline">Full Chart</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="gap-2">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
            </TabsTrigger>
            <TabsTrigger value="calculator" className="gap-2">
              <Calculator className="h-4 w-4" />
              <span className="hidden sm:inline">Calculator</span>
            </TabsTrigger>
          </TabsList>

          {/* Full Chart Tab */}
          <TabsContent value="chart" className="space-y-6">
            <ScrollReveal>
              <div className="grid gap-6">
                {SIEVE_DATA.map((group, groupIndex) => (
                  <Card key={group.range} className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent py-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Layers className="h-5 w-5 text-primary" />
                        Sieve Size Range: {group.range}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-muted/50 border-b">
                              <th className="px-4 py-3 text-left text-sm font-semibold">Sieve / Size</th>
                              <th className="px-4 py-3 text-center text-sm font-semibold">MM Size</th>
                              <th className="px-4 py-3 text-center text-sm font-semibold">No. of Stones</th>
                              <th className="px-4 py-3 text-center text-sm font-semibold">Ct. Weight / Piece</th>
                              <th className="px-4 py-3 text-center text-sm font-semibold">Visual</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.items.map((item, index) => (
                              <motion.tr
                                key={item.sieveSize}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.02 }}
                                className={cn(
                                  "border-b last:border-0 transition-colors cursor-pointer hover:bg-primary/5",
                                  selectedItem?.sieveSize === item.sieveSize && "bg-primary/10"
                                )}
                                onClick={() => setSelectedItem({ ...item, range: group.range })}
                              >
                                <td className="px-4 py-3">
                                  <Badge variant="outline" className="font-mono text-xs">
                                    {item.sieveSize}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3 text-center font-medium">{item.mmSize} mm</td>
                                <td className="px-4 py-3 text-center text-muted-foreground">{item.noOfStones}</td>
                                <td className="px-4 py-3 text-center">
                                  <Badge variant="secondary" className="font-mono">
                                    {item.caratWeight.toFixed(3)} ct
                                  </Badge>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex justify-center">
                                    <div 
                                      className="rounded-full bg-gradient-to-br from-primary/60 to-primary/30"
                                      style={{ 
                                        width: Math.max(4, item.mmSize * 4), 
                                        height: Math.max(4, item.mmSize * 4) 
                                      }}
                                    />
                                  </div>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollReveal>
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-6">
            <ScrollReveal>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Search Sieve Data
                  </CardTitle>
                  <CardDescription>
                    Find specific sieve sizes by MM, sieve number, or carat weight
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="search-mm" className="flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        MM Size
                      </Label>
                      <Input
                        id="search-mm"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 2.5"
                        value={searchMM}
                        onChange={(e) => setSearchMM(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="search-sieve" className="flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        Sieve Size
                      </Label>
                      <Input
                        id="search-sieve"
                        placeholder="e.g., +8.0"
                        value={searchSieve}
                        onChange={(e) => setSearchSieve(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="search-carat" className="flex items-center gap-2">
                        <Scale className="h-4 w-4" />
                        Carat Weight
                      </Label>
                      <Input
                        id="search-carat"
                        type="number"
                        step="0.001"
                        placeholder="e.g., 0.05"
                        value={searchCarat}
                        onChange={(e) => setSearchCarat(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Search Results */}
                  <AnimatePresence mode="wait">
                    {filteredResults.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="rounded-lg border overflow-hidden"
                      >
                        <table className="w-full">
                          <thead>
                            <tr className="bg-muted/50 border-b">
                              <th className="px-4 py-3 text-left text-sm font-semibold">Range</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold">Sieve / Size</th>
                              <th className="px-4 py-3 text-center text-sm font-semibold">MM Size</th>
                              <th className="px-4 py-3 text-center text-sm font-semibold">Stones</th>
                              <th className="px-4 py-3 text-center text-sm font-semibold">Ct. Weight</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredResults.map((item) => (
                              <tr key={item.sieveSize} className="border-b last:border-0 hover:bg-muted/30">
                                <td className="px-4 py-3 text-sm text-muted-foreground">{item.range}</td>
                                <td className="px-4 py-3">
                                  <Badge variant="outline" className="font-mono text-xs">
                                    {item.sieveSize}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3 text-center font-medium">{item.mmSize} mm</td>
                                <td className="px-4 py-3 text-center">{item.noOfStones}</td>
                                <td className="px-4 py-3 text-center">
                                  <Badge variant="secondary" className="font-mono">
                                    {item.caratWeight.toFixed(3)} ct
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {(searchMM || searchSieve || searchCarat) && filteredResults.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <p>No exact matches found. Try different search criteria.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </ScrollReveal>
          </TabsContent>

          {/* Calculator Tab */}
          <TabsContent value="calculator" className="space-y-6">
            {/* Stones to Carat Calculator - NEW */}
            <ScrollReveal>
              <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="h-5 w-5 text-primary" />
                    Total Carat Weight Calculator
                  </CardTitle>
                  <CardDescription>
                    Calculate total carat weight for a given number of stones of a specific sieve size
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Select Sieve Size</Label>
                      <Select value={selectedSieveForCalc} onValueChange={setSelectedSieveForCalc}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose sieve size" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {ALL_SIEVE_DATA.map((item) => (
                            <SelectItem key={item.sieveSize} value={item.sieveSize}>
                              {item.sieveSize} ({item.mmSize}mm)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Number of Stones</Label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Enter stone count"
                        value={stoneCount}
                        onChange={(e) => setStoneCount(e.target.value)}
                      />
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {calculatedTotalCarat && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid sm:grid-cols-4 gap-4 p-4 rounded-lg bg-background border"
                      >
                        <div className="text-center p-3 rounded-lg bg-primary/10">
                          <p className="text-sm text-muted-foreground mb-1">Total Carat</p>
                          <p className="text-2xl font-bold text-primary">
                            {calculatedTotalCarat.totalCarat.toFixed(3)}
                          </p>
                          <p className="text-xs text-muted-foreground">ct</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <p className="text-sm text-muted-foreground mb-1">Per Stone</p>
                          <p className="text-lg font-semibold">
                            {calculatedTotalCarat.perStoneCarat.toFixed(3)}
                          </p>
                          <p className="text-xs text-muted-foreground">ct/piece</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <p className="text-sm text-muted-foreground mb-1">MM Size</p>
                          <p className="text-lg font-semibold">{calculatedTotalCarat.mmSize}</p>
                          <p className="text-xs text-muted-foreground">mm</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <p className="text-sm text-muted-foreground mb-1">Stones/Carat</p>
                          <p className="text-lg font-semibold">{calculatedTotalCarat.stonesPerCarat}</p>
                          <p className="text-xs text-muted-foreground">pcs</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </ScrollReveal>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* MM to Sieve Converter */}
              <ScrollReveal>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Ruler className="h-5 w-5" />
                      MM to Sieve Converter
                    </CardTitle>
                    <CardDescription>
                      Enter MM size to find closest matching sieve size
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>MM Size</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Enter MM size (e.g., 2.5)"
                        value={searchMM}
                        onChange={(e) => setSearchMM(e.target.value)}
                      />
                    </div>

                    <AnimatePresence mode="wait">
                      {mmResult && searchMM && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="p-4 rounded-lg bg-primary/5 border border-primary/20"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="font-medium">Closest Match</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Sieve Size</p>
                              <p className="font-semibold">{mmResult.sieveSize}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">MM Size</p>
                              <p className="font-semibold">{mmResult.mmSize} mm</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Carat Weight</p>
                              <p className="font-semibold">{mmResult.caratWeight.toFixed(3)} ct</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Stones per Carat</p>
                              <p className="font-semibold">{mmResult.noOfStones}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </ScrollReveal>

              {/* Carat to Sieve Converter */}
              <ScrollReveal delay={0.1}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Scale className="h-5 w-5" />
                      Carat to Sieve Converter
                    </CardTitle>
                    <CardDescription>
                      Enter carat weight to find closest matching sieve size
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Carat Weight</Label>
                      <Input
                        type="number"
                        step="0.001"
                        placeholder="Enter carat weight (e.g., 0.05)"
                        value={searchCarat}
                        onChange={(e) => setSearchCarat(e.target.value)}
                      />
                    </div>

                    <AnimatePresence mode="wait">
                      {caratResult && searchCarat && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="p-4 rounded-lg bg-primary/5 border border-primary/20"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="font-medium">Closest Match</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Sieve Size</p>
                              <p className="font-semibold">{caratResult.sieveSize}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">MM Size</p>
                              <p className="font-semibold">{caratResult.mmSize} mm</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Carat Weight</p>
                              <p className="font-semibold">{caratResult.caratWeight.toFixed(3)} ct</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Stones per Carat</p>
                              <p className="font-semibold">{caratResult.noOfStones}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </ScrollReveal>
            </div>

            {/* Stone Count Calculator */}
            <ScrollReveal delay={0.2}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Diamond className="h-5 w-5" />
                    Understanding Stones per Carat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { range: "0.8 - 1.3 mm", stones: "100 - 303", desc: "Micro melee" },
                      { range: "1.4 - 2.0 mm", stones: "29 - 83", desc: "Small melee" },
                      { range: "2.1 - 3.2 mm", stones: "7 - 25", desc: "Standard melee" },
                      { range: "3.3+ mm", stones: "1 - 6", desc: "Single stones" },
                    ].map((info) => (
                      <div key={info.range} className="p-4 rounded-lg bg-muted/50 border">
                        <p className="text-sm font-medium text-primary mb-1">{info.range}</p>
                        <p className="text-2xl font-bold mb-1">{info.stones}</p>
                        <p className="text-xs text-muted-foreground">{info.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 rounded-lg bg-muted/30 border">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium text-foreground mb-1">How to Use This Chart:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>"No. of Stones" indicates how many diamonds of that size make up 1 carat</li>
                          <li>Smaller sieve sizes have more stones per carat (higher count)</li>
                          <li>Carat weight per piece = 1 ÷ (No. of Stones)</li>
                          <li>Use sieve sizes for sorting and pricing melee diamonds</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          </TabsContent>
        </Tabs>

        {/* Selected Item Detail Panel */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
            >
              <Card className="shadow-xl border-primary/20">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Selected Size Details</CardTitle>
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ✕
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Sieve Size</span>
                    <Badge variant="default">{selectedItem.sieveSize}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Range</span>
                    <span className="font-medium">{selectedItem.range}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">MM Size</span>
                    <span className="font-medium">{selectedItem.mmSize} mm</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Stones per Carat</span>
                    <span className="font-medium">{selectedItem.noOfStones}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Carat Weight</span>
                    <Badge variant="secondary">{selectedItem.caratWeight.toFixed(3)} ct</Badge>
                  </div>
                  <div className="flex justify-center pt-2">
                    <div 
                      className="rounded-full bg-gradient-to-br from-primary/60 to-primary/30 transition-all"
                      style={{ 
                        width: Math.max(16, selectedItem.mmSize * 10), 
                        height: Math.max(16, selectedItem.mmSize * 10) 
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
};

export default DiamondSieveChart;
