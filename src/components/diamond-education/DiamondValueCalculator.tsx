import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign, TrendingUp, TrendingDown, Info, Gem, Scale, Sparkles, Palette, Search } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Market base prices per carat for round brilliant (USD) - based on Rapaport-style pricing
const BASE_PRICES_PER_CARAT: Record<string, Record<string, number>> = {
  // Color -> Clarity -> Price per carat for 1ct stone
  'D': { 'FL': 21000, 'IF': 18500, 'VVS1': 15000, 'VVS2': 13500, 'VS1': 11000, 'VS2': 9500, 'SI1': 7500, 'SI2': 5800, 'I1': 3500, 'I2': 2200 },
  'E': { 'FL': 18000, 'IF': 16000, 'VVS1': 13500, 'VVS2': 12000, 'VS1': 10000, 'VS2': 8500, 'SI1': 6800, 'SI2': 5200, 'I1': 3200, 'I2': 2000 },
  'F': { 'FL': 15500, 'IF': 14000, 'VVS1': 12000, 'VVS2': 10500, 'VS1': 9000, 'VS2': 7800, 'SI1': 6200, 'SI2': 4800, 'I1': 2900, 'I2': 1800 },
  'G': { 'FL': 12500, 'IF': 11500, 'VVS1': 10000, 'VVS2': 8800, 'VS1': 7500, 'VS2': 6500, 'SI1': 5200, 'SI2': 4000, 'I1': 2500, 'I2': 1600 },
  'H': { 'FL': 10500, 'IF': 9500, 'VVS1': 8500, 'VVS2': 7500, 'VS1': 6500, 'VS2': 5500, 'SI1': 4500, 'SI2': 3500, 'I1': 2200, 'I2': 1400 },
  'I': { 'FL': 8500, 'IF': 7800, 'VVS1': 7000, 'VVS2': 6200, 'VS1': 5400, 'VS2': 4600, 'SI1': 3800, 'SI2': 3000, 'I1': 1900, 'I2': 1200 },
  'J': { 'FL': 7000, 'IF': 6400, 'VVS1': 5800, 'VVS2': 5200, 'VS1': 4500, 'VS2': 3900, 'SI1': 3200, 'SI2': 2600, 'I1': 1700, 'I2': 1100 },
  'K': { 'FL': 5500, 'IF': 5000, 'VVS1': 4500, 'VVS2': 4000, 'VS1': 3500, 'VS2': 3000, 'SI1': 2500, 'SI2': 2000, 'I1': 1400, 'I2': 900 },
  'L': { 'FL': 4500, 'IF': 4100, 'VVS1': 3700, 'VVS2': 3300, 'VS1': 2900, 'VS2': 2500, 'SI1': 2100, 'SI2': 1700, 'I1': 1200, 'I2': 800 },
  'M': { 'FL': 3800, 'IF': 3400, 'VVS1': 3100, 'VVS2': 2800, 'VS1': 2500, 'VS2': 2100, 'SI1': 1800, 'SI2': 1500, 'I1': 1000, 'I2': 700 },
};

// Carat weight multipliers (price increases exponentially)
const getCaratMultiplier = (carat: number): number => {
  if (carat < 0.30) return 0.25;
  if (carat < 0.50) return 0.45;
  if (carat < 0.70) return 0.65;
  if (carat < 0.90) return 0.85;
  if (carat < 1.00) return 0.95;
  if (carat < 1.50) return 1.35;
  if (carat < 2.00) return 1.85;
  if (carat < 3.00) return 2.50;
  if (carat < 4.00) return 3.20;
  if (carat < 5.00) return 4.00;
  return 5.00;
};

// Cut quality adjustments
const CUT_ADJUSTMENTS: Record<string, number> = {
  'Excellent': 1.0,
  'Very Good': 0.92,
  'Good': 0.82,
  'Fair': 0.70,
  'Poor': 0.55,
};

// Shape adjustments (relative to round)
const SHAPE_ADJUSTMENTS: Record<string, number> = {
  'Round': 1.0,
  'Princess': 0.75,
  'Oval': 0.78,
  'Cushion': 0.72,
  'Emerald': 0.70,
  'Pear': 0.73,
  'Marquise': 0.68,
  'Radiant': 0.71,
  'Asscher': 0.69,
  'Heart': 0.74,
};

// Fluorescence adjustments
const FLUOR_ADJUSTMENTS: Record<string, number> = {
  'None': 1.0,
  'Faint': 0.98,
  'Medium': 0.94,
  'Strong': 0.88,
  'Very Strong': 0.80,
};

const COLOR_GRADES = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
const CLARITY_GRADES = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2'];
const CUT_GRADES = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];
const SHAPES = ['Round', 'Princess', 'Oval', 'Cushion', 'Emerald', 'Pear', 'Marquise', 'Radiant', 'Asscher', 'Heart'];
const FLUORESCENCE = ['None', 'Faint', 'Medium', 'Strong', 'Very Strong'];

interface PriceBreakdown {
  basePrice: number;
  caratAdjusted: number;
  cutAdjusted: number;
  shapeAdjusted: number;
  fluorAdjusted: number;
  finalPrice: number;
  pricePerCarat: number;
}

const calculatePrice = (
  carat: number,
  color: string,
  clarity: string,
  cut: string,
  shape: string,
  fluorescence: string
): PriceBreakdown => {
  const basePerCarat = BASE_PRICES_PER_CARAT[color]?.[clarity] || 5000;
  const basePrice = basePerCarat * carat;
  
  const caratMultiplier = getCaratMultiplier(carat);
  const caratAdjusted = basePrice * caratMultiplier;
  
  const cutMultiplier = CUT_ADJUSTMENTS[cut] || 1.0;
  const cutAdjusted = caratAdjusted * cutMultiplier;
  
  const shapeMultiplier = SHAPE_ADJUSTMENTS[shape] || 1.0;
  const shapeAdjusted = cutAdjusted * shapeMultiplier;
  
  const fluorMultiplier = FLUOR_ADJUSTMENTS[fluorescence] || 1.0;
  const fluorAdjusted = shapeAdjusted * fluorMultiplier;
  
  return {
    basePrice,
    caratAdjusted,
    cutAdjusted,
    shapeAdjusted,
    fluorAdjusted,
    finalPrice: Math.round(fluorAdjusted),
    pricePerCarat: Math.round(fluorAdjusted / carat),
  };
};

const PriceFactorBar = ({ label, value, maxValue, impact, icon: Icon }: { 
  label: string; 
  value: string; 
  maxValue: number;
  impact: 'positive' | 'negative' | 'neutral';
  icon: React.ElementType;
}) => {
  const percentage = (parseFloat(value.replace(/[^0-9.-]/g, '')) / maxValue) * 100;
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <Icon className="h-4 w-4" />
          {label}
        </span>
        <span className={`font-medium flex items-center gap-1 ${
          impact === 'positive' ? 'text-emerald-400' : 
          impact === 'negative' ? 'text-red-400' : 'text-foreground'
        }`}>
          {value}
          {impact === 'positive' && <TrendingUp className="h-3 w-3" />}
          {impact === 'negative' && <TrendingDown className="h-3 w-3" />}
        </span>
      </div>
    </div>
  );
};

export const DiamondValueCalculator = () => {
  const [carat, setCarat] = useState(1.0);
  const [color, setColor] = useState('G');
  const [clarity, setClarity] = useState('VS1');
  const [cut, setCut] = useState('Excellent');
  const [shape, setShape] = useState('Round');
  const [fluorescence, setFluorescence] = useState('None');

  const priceBreakdown = useMemo(() => 
    calculatePrice(carat, color, clarity, cut, shape, fluorescence),
    [carat, color, clarity, cut, shape, fluorescence]
  );

  // Calculate comparison prices
  const idealPrice = useMemo(() => 
    calculatePrice(carat, 'D', 'FL', 'Excellent', 'Round', 'None').finalPrice,
    [carat]
  );

  const budgetPrice = useMemo(() => 
    calculatePrice(carat, 'J', 'SI1', 'Very Good', 'Round', 'None').finalPrice,
    [carat]
  );

  const savingsVsIdeal = idealPrice - priceBreakdown.finalPrice;
  const savingsPercent = ((savingsVsIdeal / idealPrice) * 100).toFixed(0);

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-background via-background to-emerald-500/5">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          Diamond Value Calculator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Estimate diamond prices based on the 4Cs using current market data
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Price Display */}
        <motion.div
          key={priceBreakdown.finalPrice}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center p-6 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30"
        >
          <div className="text-sm text-muted-foreground mb-1">Estimated Value</div>
          <div className="text-4xl md:text-5xl font-bold text-emerald-400">
            ${priceBreakdown.finalPrice.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            ${priceBreakdown.pricePerCarat.toLocaleString()} per carat
          </div>
          {savingsVsIdeal > 0 && (
            <Badge variant="outline" className="mt-3 bg-amber-500/20 text-amber-400 border-amber-500/30">
              {savingsPercent}% below D/FL equivalent
            </Badge>
          )}
        </motion.div>

        {/* 4Cs Selection Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Carat Weight */}
          <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <Scale className="h-4 w-4 text-amber-400" />
                Carat Weight
              </span>
              <span className="text-lg font-bold text-amber-400">{carat.toFixed(2)} ct</span>
            </div>
            <Slider
              value={[carat]}
              onValueChange={([v]) => setCarat(Number(v.toFixed(2)))}
              min={0.2}
              max={5.0}
              step={0.05}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.2ct</span>
              <span>5.0ct</span>
            </div>
          </div>

          {/* Color Grade */}
          <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border/50">
            <span className="text-sm font-medium flex items-center gap-2">
              <Palette className="h-4 w-4 text-sky-400" />
              Color Grade
            </span>
            <Select value={color} onValueChange={setColor}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COLOR_GRADES.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g} - {g <= 'F' ? 'Colorless' : g <= 'J' ? 'Near Colorless' : 'Faint'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clarity Grade */}
          <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border/50">
            <span className="text-sm font-medium flex items-center gap-2">
              <Search className="h-4 w-4 text-purple-400" />
              Clarity Grade
            </span>
            <Select value={clarity} onValueChange={setClarity}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CLARITY_GRADES.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cut Grade */}
          <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border/50">
            <span className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              Cut Grade
            </span>
            <Select value={cut} onValueChange={setCut}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CUT_GRADES.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Shape */}
          <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border/50">
            <span className="text-sm font-medium flex items-center gap-2">
              <Gem className="h-4 w-4 text-pink-400" />
              Shape
            </span>
            <Select value={shape} onValueChange={setShape}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SHAPES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fluorescence */}
          <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border/50">
            <span className="text-sm font-medium flex items-center gap-2">
              <Info className="h-4 w-4 text-violet-400" />
              Fluorescence
            </span>
            <Select value={fluorescence} onValueChange={setFluorescence}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FLUORESCENCE.map((f) => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Price Factors */}
        <div className="p-4 rounded-lg bg-muted/30 border border-border/50 space-y-4">
          <h4 className="font-semibold text-sm">Price Impact Factors</h4>
          <TooltipProvider>
            <div className="space-y-3">
              <Tooltip>
                <TooltipTrigger className="w-full">
                  <PriceFactorBar
                    label="Carat Weight"
                    value={`×${getCaratMultiplier(carat).toFixed(2)}`}
                    maxValue={5}
                    impact={carat >= 1 ? 'positive' : 'neutral'}
                    icon={Scale}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Larger diamonds are exponentially rarer and more valuable</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger className="w-full">
                  <PriceFactorBar
                    label="Cut Quality"
                    value={`${(CUT_ADJUSTMENTS[cut] * 100).toFixed(0)}%`}
                    maxValue={100}
                    impact={cut === 'Excellent' ? 'positive' : cut === 'Poor' || cut === 'Fair' ? 'negative' : 'neutral'}
                    icon={Sparkles}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cut quality directly affects brilliance and value</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger className="w-full">
                  <PriceFactorBar
                    label="Shape"
                    value={`${(SHAPE_ADJUSTMENTS[shape] * 100).toFixed(0)}%`}
                    maxValue={100}
                    impact={shape === 'Round' ? 'positive' : 'neutral'}
                    icon={Gem}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Round brilliant commands premium; fancy shapes offer value</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger className="w-full">
                  <PriceFactorBar
                    label="Fluorescence"
                    value={`${(FLUOR_ADJUSTMENTS[fluorescence] * 100).toFixed(0)}%`}
                    maxValue={100}
                    impact={fluorescence === 'None' ? 'neutral' : 'negative'}
                    icon={Info}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Strong fluorescence can reduce value, especially in D-F colors</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>

        {/* Price Comparison */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
            <div className="text-xs text-muted-foreground mb-1">Budget (J/SI1)</div>
            <div className="text-lg font-bold text-amber-400">
              ${budgetPrice.toLocaleString()}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-center ring-2 ring-emerald-500/50">
            <div className="text-xs text-muted-foreground mb-1">Your Selection</div>
            <div className="text-lg font-bold text-emerald-400">
              ${priceBreakdown.finalPrice.toLocaleString()}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-violet-500/10 border border-violet-500/20 text-center">
            <div className="text-xs text-muted-foreground mb-1">Premium (D/FL)</div>
            <div className="text-lg font-bold text-violet-400">
              ${idealPrice.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center">
          * Prices are estimates based on market averages. Actual prices vary by retailer, certification (GIA, AGS), and market conditions.
        </p>
      </CardContent>
    </Card>
  );
};
