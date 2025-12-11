/**
 * @fileoverview Diamond calculation utilities for sizing charts and comparison tools
 * @module utils/diamondCalculations
 */

/**
 * Parsed millimeter dimensions
 */
export interface ParsedMM {
  /** Length in millimeters */
  length: number;
  /** Width in millimeters */
  width: number;
}

/**
 * Parse millimeter value from string format
 * 
 * @description Handles both "x.x x x.x" format (e.g., "6.5 x 6.5") 
 * and single value format (e.g., "6.5")
 * 
 * @param mmString - Millimeter string to parse
 * @returns Parsed dimensions or null if invalid
 * 
 * @example
 * ```ts
 * parseMM("6.5 x 4.5") // { length: 6.5, width: 4.5 }
 * parseMM("6.5") // { length: 6.5, width: 6.5 }
 * parseMM("invalid") // null
 * ```
 */
export const parseMM = (mmString: string): ParsedMM | null => {
  const cleaned = mmString.replace(/\s+/g, "");
  if (cleaned.includes("x")) {
    const parts = cleaned.split("x").map(p => parseFloat(p));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return { length: parts[0], width: parts[1] };
    }
  } else {
    const val = parseFloat(cleaned);
    if (!isNaN(val)) {
      return { length: val, width: val };
    }
  }
  return null;
};

/**
 * Calculate visual scale for diamond display based on carat weight
 * 
 * @description Generates a pixel size for visual representation that
 * scales appropriately with carat weight while staying within bounds
 * 
 * @param carat - Diamond carat weight
 * @returns Visual scale in pixels (capped at 200px)
 * 
 * @example
 * ```ts
 * getVisualScale(1.0) // 90
 * getVisualScale(2.0) // 120
 * getVisualScale(5.0) // 200 (capped)
 * ```
 */
export const getVisualScale = (carat: number): number => {
  const baseScale = 60;
  const scale = baseScale + (carat * 30);
  return Math.min(scale, 200);
};

/**
 * Get overlay scale for multi-diamond comparison
 * 
 * @description Provides consistent scaling across all shapes for accurate
 * visual comparison. Uses 10 pixels per millimeter for larger dimension.
 * 
 * @param mmString - Millimeter dimensions string
 * @returns Scale in pixels (default 80 if parsing fails)
 * 
 * @example
 * ```ts
 * getOverlayScale("6.5 x 4.5") // 65
 * getOverlayScale("8.0") // 80
 * ```
 */
export const getOverlayScale = (mmString: string): number => {
  const parsed = parseMM(mmString);
  if (!parsed) return 80;
  const maxDim = Math.max(parsed.length, parsed.width);
  return maxDim * 10;
};

/**
 * Calculate face-up area for a diamond
 * 
 * @description Calculates the visible surface area when viewing the
 * diamond from above (face-up position). Uses ellipse area formula
 * with 0.785 factor (π/4) for approximation.
 * 
 * @param mmString - Millimeter dimensions string
 * @returns Face-up area in square millimeters (formatted to 1 decimal)
 * 
 * @example
 * ```ts
 * calculateFaceUpArea("6.5 x 6.5") // "33.2"
 * calculateFaceUpArea("8.0 x 6.0") // "37.7"
 * calculateFaceUpArea("invalid") // "N/A"
 * ```
 */
export const calculateFaceUpArea = (mmString: string): string => {
  const parsed = parseMM(mmString);
  if (!parsed) return "N/A";
  return (parsed.length * parsed.width * 0.785).toFixed(1);
};

/**
 * Calculate diamond price based on Rapaport pricing
 * 
 * @param pricePerCarat - Rapaport price per carat in USD
 * @param caratWeight - Diamond carat weight
 * @param discountPercent - Discount percentage (positive) or markup (negative)
 * @returns Calculated price in USD
 * 
 * @example
 * ```ts
 * calculateDiamondPrice(5000, 1.5, 10) // 6750 (10% discount)
 * calculateDiamondPrice(5000, 1.5, -5) // 7875 (5% markup)
 * ```
 */
export const calculateDiamondPrice = (
  pricePerCarat: number,
  caratWeight: number,
  discountPercent: number = 0
): number => {
  const basePrice = pricePerCarat * caratWeight;
  const adjustmentFactor = 1 - (discountPercent / 100);
  return Math.round(basePrice * adjustmentFactor * 100) / 100;
};

/**
 * Get approximate carat weight from millimeter dimensions
 * 
 * @description Uses shape-specific formulas to estimate carat weight
 * from physical dimensions. This is an approximation as actual weight
 * depends on cut depth and proportions.
 * 
 * @param length - Length in millimeters
 * @param width - Width in millimeters
 * @param depth - Depth in millimeters
 * @param shape - Diamond shape
 * @returns Estimated carat weight
 */
export const estimateCaratFromDimensions = (
  length: number,
  width: number,
  depth: number,
  shape: "round" | "oval" | "cushion" | "emerald" | "princess" | "pear" | "marquise" | "heart" | "radiant" | "asscher"
): number => {
  // Shape-specific multipliers for weight estimation
  const multipliers: Record<string, number> = {
    round: 0.0061,
    oval: 0.0062,
    cushion: 0.00815,
    emerald: 0.0083,
    princess: 0.0083,
    pear: 0.00575,
    marquise: 0.00565,
    heart: 0.0059,
    radiant: 0.0081,
    asscher: 0.0080,
  };

  const multiplier = multipliers[shape] || 0.0061;
  return Math.round(length * width * depth * multiplier * 100) / 100;
};
