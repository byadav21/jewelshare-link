/**
 * Diamond Calculation Utilities
 * 
 * @description Provides functions for parsing diamond measurements,
 * calculating visual scales, and computing face-up areas for diamond
 * sizing and comparison features.
 * 
 * @module diamondCalculations
 */

/**
 * Parsed millimeter dimensions
 */
export interface ParsedDimensions {
  /** Length dimension in millimeters */
  length: number;
  /** Width dimension in millimeters */
  width: number;
}

/**
 * Parse millimeter value from string format
 * 
 * @description Handles various mm string formats including:
 * - "x.x x x.x" format (with spaces)
 * - "lengthxwidth" format
 * - Single value (creates square dimensions)
 * 
 * @param mmString - The measurement string to parse (e.g., "5.5x4.2" or "6.0")
 * @returns Parsed dimensions object or null if parsing fails
 * 
 * @example
 * ```ts
 * parseMM("5.5x4.2"); // { length: 5.5, width: 4.2 }
 * parseMM("6.0");     // { length: 6.0, width: 6.0 }
 * parseMM("invalid"); // null
 * ```
 */
export const parseMM = (mmString: string): ParsedDimensions | null => {
  // Remove all whitespace for consistent parsing
  const cleaned = mmString.replace(/\s+/g, "");
  
  // Handle "lengthxwidth" format
  if (cleaned.includes("x")) {
    const parts = cleaned.split("x").map(p => parseFloat(p));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return { length: parts[0], width: parts[1] };
    }
  } else {
    // Handle single value (square dimensions)
    const val = parseFloat(cleaned);
    if (!isNaN(val)) {
      return { length: val, width: val };
    }
  }
  
  return null;
};

/**
 * Calculate visual scale factor based on carat weight
 * 
 * @description Converts carat weight to a pixel scale value for
 * rendering diamond visualizations. Uses a linear scale with
 * capping to prevent oversized renders.
 * 
 * @param carat - The diamond's carat weight
 * @returns Scale value in pixels (60-200 range)
 * 
 * @example
 * ```ts
 * getVisualScale(0.5);  // 75
 * getVisualScale(1.0);  // 90
 * getVisualScale(5.0);  // 200 (capped)
 * ```
 */
export const getVisualScale = (carat: number): number => {
  const baseScale = 60;
  const scale = baseScale + (carat * 30);
  return Math.min(scale, 200);
};

/**
 * Get overlay scale for diamond comparison views
 * 
 * @description Calculates a consistent scale factor for overlaying
 * multiple diamonds in comparison mode. Uses the larger dimension
 * to ensure proper fit.
 * 
 * @param mmString - The measurement string to parse
 * @returns Scale value in pixels (10 pixels per mm, default 80 if parse fails)
 * 
 * @example
 * ```ts
 * getOverlayScale("5.5x4.2"); // 55 (5.5 * 10)
 * getOverlayScale("8.0");     // 80 (8.0 * 10)
 * getOverlayScale("invalid"); // 80 (default)
 * ```
 */
export const getOverlayScale = (mmString: string): number => {
  const parsed = parseMM(mmString);
  if (!parsed) return 80;
  
  // Use larger dimension for scaling
  const maxDim = Math.max(parsed.length, parsed.width);
  return maxDim * 10;
};

/**
 * Calculate face-up area for a diamond
 * 
 * @description Computes the approximate visible area when viewing
 * a diamond from above. Uses the ellipse area formula with a
 * correction factor (0.785) for typical diamond shapes.
 * 
 * Formula: length × width × 0.785 (approximates circular/oval area)
 * 
 * @param mmString - The measurement string to parse
 * @returns Formatted area string with one decimal place, or "N/A" if parse fails
 * 
 * @example
 * ```ts
 * calculateFaceUpArea("5.5x4.2"); // "18.1"
 * calculateFaceUpArea("6.0");     // "28.3"
 * calculateFaceUpArea("invalid"); // "N/A"
 * ```
 */
export const calculateFaceUpArea = (mmString: string): string => {
  const parsed = parseMM(mmString);
  if (!parsed) return "N/A";
  
  // Area calculation with correction factor for diamond shapes
  const area = parsed.length * parsed.width * 0.785;
  return area.toFixed(1);
};

/**
 * Convert carat weight to approximate millimeter dimensions
 * 
 * @description Estimates diamond dimensions based on carat weight
 * using industry-standard conversion factors. Useful for initial
 * sizing estimates when exact measurements aren't available.
 * 
 * @param carat - The diamond's carat weight
 * @param shape - The diamond shape (affects conversion ratio)
 * @returns Estimated dimensions in mm format "lengthxwidth"
 * 
 * @example
 * ```ts
 * caratToMM(1.0, "round");   // "6.5x6.5"
 * caratToMM(1.0, "oval");    // "7.7x5.2"
 * caratToMM(1.0, "cushion"); // "6.0x6.0"
 * ```
 */
export const caratToMM = (carat: number, shape: string = "round"): string => {
  // Base conversion factors (approximate, varies by cut quality)
  const conversionFactors: Record<string, { lengthRatio: number; widthRatio: number }> = {
    round: { lengthRatio: 6.5, widthRatio: 6.5 },
    oval: { lengthRatio: 7.7, widthRatio: 5.2 },
    princess: { lengthRatio: 5.5, widthRatio: 5.5 },
    cushion: { lengthRatio: 6.0, widthRatio: 6.0 },
    emerald: { lengthRatio: 7.0, widthRatio: 5.0 },
    pear: { lengthRatio: 9.0, widthRatio: 5.5 },
    marquise: { lengthRatio: 11.0, widthRatio: 5.0 },
    radiant: { lengthRatio: 5.8, widthRatio: 5.8 },
    asscher: { lengthRatio: 5.5, widthRatio: 5.5 },
    heart: { lengthRatio: 6.5, widthRatio: 6.5 }
  };

  const factors = conversionFactors[shape.toLowerCase()] || conversionFactors.round;
  
  // Scale dimensions by cube root of carat (volume to linear dimension)
  const scaleFactor = Math.pow(carat, 1 / 3);
  const length = (factors.lengthRatio * scaleFactor).toFixed(1);
  const width = (factors.widthRatio * scaleFactor).toFixed(1);
  
  return `${length}x${width}`;
};

/**
 * Calculate price per carat
 * 
 * @description Computes the price per carat for a diamond,
 * which is a standard industry metric for comparing diamond values.
 * 
 * @param totalPrice - The total price of the diamond
 * @param carat - The diamond's carat weight
 * @returns Price per carat, or 0 if carat is 0 or invalid
 * 
 * @example
 * ```ts
 * calculatePricePerCarat(5000, 1.0);  // 5000
 * calculatePricePerCarat(7500, 1.5);  // 5000
 * calculatePricePerCarat(1000, 0);    // 0
 * ```
 */
export const calculatePricePerCarat = (totalPrice: number, carat: number): number => {
  if (!carat || carat <= 0) return 0;
  return Math.round(totalPrice / carat);
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
