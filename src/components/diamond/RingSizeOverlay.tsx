import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { DiamondShapeSVG } from "./DiamondShapeSVG";
import { RING_SIZES, ShapeKey, DIAMOND_SHAPES } from "@/constants/diamondData";
import { Hand } from "lucide-react";
import { cn } from "@/lib/utils";

interface RingSizeOverlayProps {
  selectedShape: ShapeKey;
  selectedSize: { carat: number; mm: string; depth: string };
  selectedRingSize: number;
  onRingSizeChange: (size: number) => void;
}

const getRingDiameter = (ringSize: number) => {
  const ring = RING_SIZES.find(r => r.size === ringSize);
  return ring?.diameterMM || 16.5;
};

export const RingSizeOverlay = ({
  selectedShape,
  selectedSize,
  selectedRingSize,
  onRingSizeChange,
}: RingSizeOverlayProps) => {
  const ringScale = 8;
  const shapeData = DIAMOND_SHAPES[selectedShape];
  const ringDiameter = getRingDiameter(selectedRingSize);
  const diamondSize = parseFloat(selectedSize.mm.split("x")[0] || selectedSize.mm);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 justify-center">
        {RING_SIZES.map((ring) => (
          <Button
            key={ring.size}
            variant={selectedRingSize === ring.size ? "default" : "outline"}
            size="sm"
            onClick={() => onRingSizeChange(ring.size)}
            className="min-w-[60px]"
          >
            Size {ring.size}
          </Button>
        ))}
      </div>

      <div className="relative flex items-center justify-center py-8">
        <div className="relative">
          <motion.div
            className="relative bg-gradient-to-b from-amber-200/60 to-amber-300/60 dark:from-amber-800/40 dark:to-amber-900/40 rounded-t-full"
            style={{ width: ringDiameter * ringScale + 20, height: 200 }}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
          >
            <div 
              className="absolute top-8 left-1/2 -translate-x-1/2 rounded-full border-4 border-yellow-500/80 dark:border-yellow-400/60"
              style={{ width: ringDiameter * ringScale + 16, height: 24 }}
            />
            <motion.div
              className="absolute left-1/2 -translate-x-1/2"
              style={{ top: -10 }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <DiamondShapeSVG 
                shape={selectedShape} 
                size={diamondSize * ringScale}
              />
            </motion.div>
          </motion.div>

          <div className="absolute -right-32 top-1/2 -translate-y-1/2 text-sm space-y-1 hidden md:block">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary/60" />
              <span className="text-muted-foreground">Ring Size {selectedRingSize}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <span className="text-muted-foreground">{ringDiameter} mm</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
        {RING_SIZES.map((ring) => (
          <div
            key={ring.size}
            className={cn(
              "p-3 rounded-lg text-center border transition-all cursor-pointer",
              selectedRingSize === ring.size ? "bg-primary/10 border-primary" : "bg-muted/30 hover:bg-muted/50"
            )}
            onClick={() => onRingSizeChange(ring.size)}
          >
            <p className="font-semibold">Size {ring.size}</p>
            <p className="text-xs text-muted-foreground">{ring.diameterMM} mm</p>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-lg bg-muted/30 border">
        <div className="flex items-start gap-3">
          <Hand className="h-5 w-5 text-primary mt-0.5" />
          <div className="text-sm">
            <p className="font-medium mb-1">
              {selectedSize.carat} ct {shapeData.name} on Size {selectedRingSize} Finger
            </p>
            <p className="text-muted-foreground">
              Diamond measures {selectedSize.mm} mm on a finger with {ringDiameter} mm diameter.
              {" "}
              {diamondSize / ringDiameter > 0.45
                ? "The diamond will appear substantial and eye-catching."
                : diamondSize / ringDiameter > 0.35
                ? "The diamond will have a balanced, elegant appearance."
                : "The diamond will appear delicate and subtle."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
