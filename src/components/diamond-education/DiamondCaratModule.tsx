import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scale, Ruler, CircleDot, Hand, Coins } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Diamond dimensions for round brilliant cut (in mm)
// Based on standard proportions
const getCaratDimensions = (carat: number, shape: string) => {
  // Round brilliant cut diameter formula
  const roundDiameter = 6.5 * Math.pow(carat, 1 / 3);
  const roundDepth = roundDiameter * 0.615; // Ideal depth percentage

  switch (shape) {
    case 'round':
      return { width: roundDiameter, height: roundDiameter, depth: roundDepth };
    case 'princess':
      const princessSide = roundDiameter * 0.9;
      return { width: princessSide, height: princessSide, depth: princessSide * 0.7 };
    case 'oval':
      return { width: roundDiameter * 0.75, height: roundDiameter * 1.1, depth: roundDepth * 0.9 };
    case 'cushion':
      return { width: roundDiameter * 0.92, height: roundDiameter * 1.05, depth: roundDepth };
    case 'emerald':
      return { width: roundDiameter * 0.8, height: roundDiameter * 1.15, depth: roundDepth * 0.95 };
    case 'pear':
      return { width: roundDiameter * 0.72, height: roundDiameter * 1.2, depth: roundDepth * 0.9 };
    case 'marquise':
      return { width: roundDiameter * 0.55, height: roundDiameter * 1.35, depth: roundDepth * 0.85 };
    case 'radiant':
      return { width: roundDiameter * 0.85, height: roundDiameter * 1.1, depth: roundDepth };
    default:
      return { width: roundDiameter, height: roundDiameter, depth: roundDepth };
  }
};

// Price multipliers (approximate market values)
const getPriceMultiplier = (carat: number): number => {
  if (carat <= 0.3) return 1500;
  if (carat <= 0.5) return 2500;
  if (carat <= 0.75) return 3500;
  if (carat <= 1.0) return 5500;
  if (carat <= 1.5) return 8000;
  if (carat <= 2.0) return 12000;
  if (carat <= 3.0) return 18000;
  return 25000;
};

const SHAPES = [
  { value: 'round', label: 'Round Brilliant' },
  { value: 'princess', label: 'Princess' },
  { value: 'oval', label: 'Oval' },
  { value: 'cushion', label: 'Cushion' },
  { value: 'emerald', label: 'Emerald' },
  { value: 'pear', label: 'Pear' },
  { value: 'marquise', label: 'Marquise' },
  { value: 'radiant', label: 'Radiant' },
];

const CARAT_PRESETS = [0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0, 5.0];

// Finger ring visualization component
const FingerComparison = ({ carat, shape }: { carat: number; shape: string }) => {
  const dims = getCaratDimensions(carat, shape);
  const scale = 8; // mm to pixels
  
  return (
    <div className="relative flex items-center justify-center h-48 bg-gradient-to-b from-muted/50 to-muted/20 rounded-xl overflow-hidden">
      {/* Finger representation */}
      <div className="relative">
        <div className="w-16 h-32 bg-gradient-to-b from-amber-200 to-amber-300 rounded-t-full rounded-b-lg relative">
          {/* Finger nail */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-6 bg-pink-100 rounded-t-lg" />
          {/* Ring band */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[70px] h-4 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 rounded-sm shadow-md" />
          {/* Diamond on ring */}
          <motion.div
            key={`${carat}-${shape}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="absolute top-16 left-1/2 -translate-x-1/2"
            style={{
              width: dims.width * scale,
              height: dims.height * scale,
            }}
          >
            <div 
              className="w-full h-full bg-gradient-to-br from-white via-sky-100 to-blue-200 shadow-lg"
              style={{
                clipPath: shape === 'round' ? 'circle(50%)' :
                          shape === 'princess' || shape === 'cushion' || shape === 'radiant' ? 'polygon(5% 0%, 95% 0%, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0% 95%, 0% 5%)' :
                          shape === 'oval' ? 'ellipse(50% 50%)' :
                          shape === 'emerald' ? 'polygon(10% 0%, 90% 0%, 100% 15%, 100% 85%, 90% 100%, 10% 100%, 0% 85%, 0% 15%)' :
                          shape === 'pear' ? 'polygon(50% 0%, 100% 60%, 85% 100%, 15% 100%, 0% 60%)' :
                          shape === 'marquise' ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' :
                          'circle(50%)',
                boxShadow: '0 4px 20px rgba(135, 206, 250, 0.5)',
              }}
            />
          </motion.div>
        </div>
      </div>
      
      {/* Size indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
        {dims.width.toFixed(1)}mm × {dims.height.toFixed(1)}mm
      </div>
    </div>
  );
};

// Size comparison grid
const SizeComparisonGrid = ({ currentCarat, shape }: { currentCarat: number; shape: string }) => {
  const carats = [0.5, 1.0, 1.5, 2.0, 3.0];
  const baseScale = 12;
  
  return (
    <div className="grid grid-cols-5 gap-4 p-4 bg-muted/30 rounded-xl">
      {carats.map((carat) => {
        const dims = getCaratDimensions(carat, shape);
        const isSelected = Math.abs(carat - currentCarat) < 0.1;
        
        return (
          <motion.div
            key={carat}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: carat * 0.1 }}
            className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${
              isSelected ? 'bg-primary/20 ring-2 ring-primary' : 'bg-background/50'
            }`}
          >
            <div 
              className="flex items-center justify-center"
              style={{ height: 50 }}
            >
              <motion.div
                animate={{ scale: isSelected ? 1.1 : 1 }}
                className="bg-gradient-to-br from-white via-sky-100 to-blue-200 shadow-md"
                style={{
                  width: Math.min(dims.width * baseScale / 2, 45),
                  height: Math.min(dims.height * baseScale / 2, 45),
                  borderRadius: shape === 'round' ? '50%' : shape === 'princess' ? '2px' : '30%',
                }}
              />
            </div>
            <div className="text-center">
              <div className={`text-sm font-bold ${isSelected ? 'text-primary' : ''}`}>
                {carat}ct
              </div>
              <div className="text-xs text-muted-foreground">
                {dims.width.toFixed(1)}mm
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// Coin comparison
const CoinComparison = ({ carat, shape }: { carat: number; shape: string }) => {
  const dims = getCaratDimensions(carat, shape);
  const diamondSize = Math.max(dims.width, dims.height);
  
  const coins = [
    { name: 'US Dime', diameter: 17.91, color: 'from-gray-300 to-gray-400' },
    { name: 'US Penny', diameter: 19.05, color: 'from-orange-400 to-orange-600' },
    { name: 'US Quarter', diameter: 24.26, color: 'from-gray-300 to-gray-400' },
  ];
  
  const scale = 5;
  
  return (
    <div className="flex items-end justify-center gap-6 h-32 p-4 bg-muted/30 rounded-xl">
      {coins.map((coin) => (
        <div key={coin.name} className="flex flex-col items-center gap-1">
          <div
            className={`rounded-full bg-gradient-to-br ${coin.color} shadow-md border-2 border-white/20`}
            style={{
              width: coin.diameter * scale / 3,
              height: coin.diameter * scale / 3,
            }}
          />
          <span className="text-xs text-muted-foreground">{coin.name}</span>
          <span className="text-xs text-muted-foreground">{coin.diameter}mm</span>
        </div>
      ))}
      
      <div className="flex flex-col items-center gap-1">
        <motion.div
          key={`${carat}-${shape}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-gradient-to-br from-white via-sky-100 to-blue-300 shadow-lg border border-sky-200"
          style={{
            width: diamondSize * scale / 3,
            height: diamondSize * scale / 3,
            borderRadius: shape === 'round' ? '50%' : '20%',
          }}
        />
        <span className="text-xs font-semibold text-primary">{carat}ct Diamond</span>
        <span className="text-xs text-muted-foreground">{diamondSize.toFixed(1)}mm</span>
      </div>
    </div>
  );
};

export const DiamondCaratModule = () => {
  const [carat, setCarat] = useState(1.0);
  const [shape, setShape] = useState('round');
  const [viewMode, setViewMode] = useState<'finger' | 'comparison' | 'coins'>('finger');

  const handleSliderChange = useCallback((value: number[]) => {
    setCarat(Number(value[0].toFixed(2)));
  }, []);

  const dimensions = useMemo(() => getCaratDimensions(carat, shape), [carat, shape]);
  const estimatedPrice = useMemo(() => {
    const multiplier = getPriceMultiplier(carat);
    return Math.round(carat * multiplier);
  }, [carat]);

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-background via-background to-amber-500/5">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Scale className="h-5 w-5 text-white" />
            </div>
            Diamond Carat Weight
          </CardTitle>
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={shape} onValueChange={setShape}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Shape" />
              </SelectTrigger>
              <SelectContent>
                {SHAPES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
              <TabsList className="bg-muted/50">
                <TabsTrigger value="finger" className="text-xs">
                  <Hand className="h-3 w-3 mr-1" />
                  On Finger
                </TabsTrigger>
                <TabsTrigger value="comparison" className="text-xs">
                  <CircleDot className="h-3 w-3 mr-1" />
                  Sizes
                </TabsTrigger>
                <TabsTrigger value="coins" className="text-xs">
                  <Coins className="h-3 w-3 mr-1" />
                  vs Coins
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Visualization */}
        <div className="relative">
          <div className="absolute top-2 left-2 z-10">
            <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
              {carat.toFixed(2)} Carat {SHAPES.find(s => s.value === shape)?.label}
            </Badge>
          </div>
          
          {viewMode === 'finger' && <FingerComparison carat={carat} shape={shape} />}
          {viewMode === 'comparison' && <SizeComparisonGrid currentCarat={carat} shape={shape} />}
          {viewMode === 'coins' && <CoinComparison carat={carat} shape={shape} />}
        </div>

        {/* Carat Slider */}
        <div className="space-y-4 bg-muted/30 p-4 rounded-xl">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Carat Weight</span>
            <div className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              {carat.toFixed(2)} ct
            </div>
          </div>
          
          <Slider
            value={[carat]}
            onValueChange={handleSliderChange}
            min={0.1}
            max={5.0}
            step={0.05}
            className="w-full"
          />
          
          {/* Quick presets */}
          <div className="flex flex-wrap gap-2 justify-center">
            {CARAT_PRESETS.map((preset) => (
              <Button
                key={preset}
                variant={Math.abs(carat - preset) < 0.05 ? "default" : "outline"}
                size="sm"
                onClick={() => setCarat(preset)}
                className="text-xs"
              >
                {preset}ct
              </Button>
            ))}
          </div>
        </div>

        {/* Dimensions Display */}
        <motion.div
          key={`${carat}-${shape}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="p-4 rounded-lg bg-muted/50 border border-border/50 text-center">
            <Ruler className="h-5 w-5 mx-auto mb-2 text-amber-500" />
            <div className="text-xs text-muted-foreground">Width</div>
            <div className="text-lg font-bold">{dimensions.width.toFixed(2)}mm</div>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/50 border border-border/50 text-center">
            <Ruler className="h-5 w-5 mx-auto mb-2 text-amber-500 rotate-90" />
            <div className="text-xs text-muted-foreground">Length</div>
            <div className="text-lg font-bold">{dimensions.height.toFixed(2)}mm</div>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/50 border border-border/50 text-center">
            <Scale className="h-5 w-5 mx-auto mb-2 text-amber-500" />
            <div className="text-xs text-muted-foreground">Depth</div>
            <div className="text-lg font-bold">{dimensions.depth.toFixed(2)}mm</div>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/50 border border-border/50 text-center">
            <Coins className="h-5 w-5 mx-auto mb-2 text-emerald-500" />
            <div className="text-xs text-muted-foreground">Est. Price (G/VS2)</div>
            <div className="text-lg font-bold text-emerald-500">${estimatedPrice.toLocaleString()}</div>
          </div>
        </motion.div>

        {/* Educational Info */}
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <h4 className="font-semibold mb-2 text-amber-400">Understanding Carat Weight</h4>
            <ul className="text-muted-foreground space-y-1">
              <li>• 1 carat = 200 milligrams (0.2 grams)</li>
              <li>• "Points" = carat × 100 (e.g., 0.50ct = 50 points)</li>
              <li>• Price increases exponentially with carat weight</li>
              <li>• Visual size depends on cut quality and shape</li>
            </ul>
          </div>
          
          <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <h4 className="font-semibold mb-2 text-orange-400">Size vs. Weight</h4>
            <ul className="text-muted-foreground space-y-1">
              <li>• A 2ct diamond is NOT 2× larger than 1ct</li>
              <li>• Elongated shapes appear larger face-up</li>
              <li>• Deep cuts hide weight, look smaller</li>
              <li>• Shallow cuts spread weight, may lack brilliance</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
