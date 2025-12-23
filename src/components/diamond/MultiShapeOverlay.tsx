import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { DiamondShapeSVG } from "./DiamondShapeSVG";
import { DIAMOND_SHAPES, SHAPE_COLORS, ShapeKey } from "@/constants/diamondData";
import { parseMM, calculateFaceUpArea } from "@/utils/diamondCalculations";
import { Scale, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiShapeOverlayProps {
  selectedShapes: ShapeKey[];
  overlayCaratIndex: number;
  overlayCaratWeight: number;
  onCaratIndexChange: (index: number) => void;
  onToggleShape: (shape: ShapeKey) => void;
}

export const MultiShapeOverlay = ({
  selectedShapes,
  overlayCaratIndex,
  overlayCaratWeight,
  onCaratIndexChange,
  onToggleShape,
}: MultiShapeOverlayProps) => {
  const shapeKeys = Object.keys(DIAMOND_SHAPES) as ShapeKey[];

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Select shapes to compare (2-5)</p>
          <Badge variant="secondary">{selectedShapes.length} selected</Badge>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2">
          {shapeKeys.map((shape) => {
            const isSelected = selectedShapes.includes(shape);
            return (
              <motion.button
                key={shape}
                onClick={() => onToggleShape(shape)}
                className={cn(
                  "relative p-3 rounded-lg border-2 transition-all",
                  isSelected ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <DiamondShapeSVG shape={shape} size={28} className="mx-auto" />
                <span className="text-[10px] block text-center mt-1 font-medium">
                  {DIAMOND_SHAPES[shape].name.split(" ")[0]}
                </span>
                {isSelected && (
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: SHAPE_COLORS[shape] }} />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Carat Weight
          </span>
          <Badge className="text-lg px-3 py-1">{overlayCaratWeight} ct</Badge>
        </div>
        <Slider
          value={[overlayCaratIndex]}
          onValueChange={(value) => onCaratIndexChange(value[0])}
          max={DIAMOND_SHAPES.round.sizes.length - 1}
          step={1}
          className="py-4"
        />
      </div>

      <div className="relative h-80 flex items-center justify-center bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-px border-t border-dashed border-muted-foreground/20" />
          <div className="absolute h-full w-px border-l border-dashed border-muted-foreground/20" />
        </div>

        <div className="relative">
          {selectedShapes.map((shape, index) => {
            const shapeInfo = DIAMOND_SHAPES[shape];
            const sizeData = shapeInfo.sizes[overlayCaratIndex];
            if (!sizeData) return null;
            
            const parsed = parseMM(sizeData.mm);
            if (!parsed) return null;
            
            const width = parsed.length * 12;
            const height = parsed.width * 12;
            
            return (
              <motion.div
                key={shape}
                className="absolute"
                style={{
                  left: "50%", top: "50%", transform: "translate(-50%, -50%)",
                  zIndex: selectedShapes.length - index,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.7 }}
                transition={{ delay: index * 0.1, type: "spring" }}
              >
                <DiamondShapeSVG 
                  shape={shape} 
                  size={Math.max(width, height)} 
                  fillColor={SHAPE_COLORS[shape]} 
                  strokeColor={SHAPE_COLORS[shape]}
                  useGradient={false}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {selectedShapes.map((shape) => {
          const sizeData = DIAMOND_SHAPES[shape].sizes[overlayCaratIndex];
          return (
            <div key={shape} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SHAPE_COLORS[shape] }} />
              <span className="text-sm font-medium">{DIAMOND_SHAPES[shape].name.split(" ")[0]}</span>
              <span className="text-xs text-muted-foreground">{sizeData?.mm} mm</span>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-semibold">Shape</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Dimensions</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Depth</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Face-Up Area</th>
            </tr>
          </thead>
          <tbody>
            {selectedShapes.map((shape, index) => {
              const sizeData = DIAMOND_SHAPES[shape].sizes[overlayCaratIndex];
              return (
                <tr key={shape} className={cn("border-t", index % 2 === 0 && "bg-muted/20")}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SHAPE_COLORS[shape] }} />
                      <span className="font-medium">{DIAMOND_SHAPES[shape].name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{sizeData?.mm} mm</td>
                  <td className="px-4 py-3 text-muted-foreground">{sizeData?.depth} mm</td>
                  <td className="px-4 py-3">~{calculateFaceUpArea(sizeData?.mm || "0")} mm²</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-primary mt-0.5" />
          <div className="text-sm">
            <p className="font-medium mb-1">Size Comparison Insight</p>
            <p className="text-muted-foreground">
              At {overlayCaratWeight} carat, different shapes appear to have different sizes due to varying depth and proportions. 
              Elongated shapes like Marquise and Pear typically look larger face-up, while deeper cuts like Round and Cushion 
              carry more weight in their depth.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
