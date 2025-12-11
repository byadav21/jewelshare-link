import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { DiamondShapeSVG } from "./DiamondShapeSVG";
import { ShapeKey } from "@/constants/diamondData";
import { getVisualScale } from "@/utils/diamondCalculations";
import { cn } from "@/lib/utils";

interface DiamondSizePreviewProps {
  selectedShape: ShapeKey;
  selectedSize: { carat: number; mm: string; depth: string };
  compareMode: boolean;
  compareShape: ShapeKey;
  compareSize: { carat: number; mm: string; depth: string };
}

export const DiamondSizePreview = ({
  selectedShape,
  selectedSize,
  compareMode,
  compareShape,
  compareSize,
}: DiamondSizePreviewProps) => {
  return (
    <div className="relative h-64 flex items-center justify-center bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl mb-6">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-px border-t border-dashed border-muted-foreground/30" />
        <div className="absolute h-full w-px border-l border-dashed border-muted-foreground/30" />
      </div>
      
      <div className={cn("flex items-center gap-8", compareMode && "gap-16")}>
        <motion.div
          key={`${selectedShape}-${selectedSize.carat}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="flex flex-col items-center"
        >
          <DiamondShapeSVG shape={selectedShape} size={getVisualScale(selectedSize.carat)} />
          <Badge variant="secondary" className="mt-3">{selectedSize.carat} ct</Badge>
        </motion.div>

        <AnimatePresence>
          {compareMode && (
            <motion.div
              initial={{ scale: 0, opacity: 0, x: -20 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              exit={{ scale: 0, opacity: 0, x: -20 }}
              className="flex flex-col items-center"
            >
              <DiamondShapeSVG shape={compareShape} size={getVisualScale(compareSize.carat)} />
              <Badge variant="outline" className="mt-3">{compareSize.carat} ct</Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
