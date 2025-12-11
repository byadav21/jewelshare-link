import { useMemo } from "react";
import { DIAMOND_SHAPES, ShapeKey } from "@/constants/diamondData";
import { parseMM } from "@/utils/diamondCalculations";

interface MMToCaratResult {
  shape: ShapeKey;
  shapeName: string;
  carat: number;
  mm: string;
  matchScore: number;
}

export const useDiamondComparison = (mmInput: string, mmWidthInput?: string) => {
  const mmToCaratResults = useMemo((): MMToCaratResult[] => {
    const searchLength = parseFloat(mmInput);
    const searchWidth = mmWidthInput ? parseFloat(mmWidthInput) : searchLength;
    
    if (isNaN(searchLength) || searchLength <= 0) return [];
    
    const results: MMToCaratResult[] = [];
    
    (Object.keys(DIAMOND_SHAPES) as ShapeKey[]).forEach(shape => {
      const shapeInfo = DIAMOND_SHAPES[shape];
      
      shapeInfo.sizes.forEach(size => {
        const parsed = parseMM(size.mm);
        if (!parsed) return;
        
        // Calculate match score (lower is better)
        const lengthDiff = Math.abs(parsed.length - searchLength);
        const widthDiff = Math.abs(parsed.width - searchWidth);
        const matchScore = lengthDiff + widthDiff;
        
        // Only include if reasonably close (within 2mm)
        if (matchScore <= 4) {
          results.push({
            shape,
            shapeName: shapeInfo.name,
            carat: size.carat,
            mm: size.mm,
            matchScore
          });
        }
      });
    });
    
    // Sort by match score
    return results.sort((a, b) => a.matchScore - b.matchScore).slice(0, 10);
  }, [mmInput, mmWidthInput]);

  return { mmToCaratResults };
};
