/**
 * Jewelry Pricing Calculation Utilities
 * 
 * @description Comprehensive pricing calculations for jewelry items,
 * including gold value, diamond value, making charges, and total cost.
 * Shared between JewelleryForm and Import page.
 * 
 * @module jewelryCalculations
 */

// ============================================
// Type Definitions
// ============================================

/**
 * Input parameters for jewelry pricing calculations
 */
export interface JewelryPriceInputs {
  /** Total weight of the piece in grams */
  grossWeight: number;
  /** Weight of gemstones in carats */
  gemstoneWeight: number;
  /** Primary diamond weight in carats */
  dWt1: number;
  /** Secondary/pointer diamond weight in carats */
  dWt2: number;
  /** Rate per carat for primary diamonds */
  dRate1: number;
  /** Rate per carat for pointer diamonds */
  pointerDiamond: number;
  /** Gold purity as decimal (0-1) */
  purityFraction: number;
  /** Current 24K gold rate per gram */
  goldRate: number;
  /** Making charges per gram */
  makingChargesPerGram: number;
  /** Certification/hallmark cost */
  certificationCost: number;
  /** Cost of gemstones */
  gemstoneCost: number;
}

/**
 * Output values from jewelry pricing calculations
 */
export interface JewelryPriceOutputs {
  /** Combined weight of all diamonds */
  totalDiamondWeight: number;
  /** Weight of gold after subtracting stones */
  netWeight: number;
  /** Total value of all diamonds */
  dValue: number;
  /** Total making/labor charges */
  makingCharges: number;
  /** Value of gold content */
  goldValue: number;
  /** Final total price */
  totalPrice: number;
  /** Cost price (before markup) */
  costPrice: number;
}

// ============================================
// Number Parsing Utilities
// ============================================

/**
 * Safely parse a number from various input types
 * 
 * @description Handles strings, numbers, and null/undefined values.
 * Strips non-numeric characters from strings for robust parsing.
 * 
 * @param val - The value to parse (string, number, or undefined)
 * @returns Parsed number or 0 if invalid
 * 
 * @example
 * ```ts
 * safeNumber(42);          // 42
 * safeNumber("₹1,234.56"); // 1234.56
 * safeNumber(null);        // 0
 * safeNumber("invalid");   // 0
 * ```
 */
export const safeNumber = (val: any): number => {
  if (typeof val === 'number' && !isNaN(val)) return val;
  if (typeof val === 'string') {
    const cleaned = val.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

// ============================================
// Purity Conversion Utilities
// ============================================

/**
 * Normalize purity value to decimal format (0-1)
 * 
 * @description Handles multiple input formats:
 * - Decimal (0.75) - returned as-is
 * - Karat (18) - converted to decimal (18/24 = 0.75)
 * - Percentage (75 or "75%") - converted to decimal (75/100 = 0.75)
 * 
 * @param value - The purity value in any format
 * @returns Normalized decimal value (0-1), defaults to 18K (0.75) if invalid
 * 
 * @example
 * ```ts
 * normalizePurity(0.75);   // 0.75
 * normalizePurity(18);     // 0.75 (18K)
 * normalizePurity("75%");  // 0.75
 * normalizePurity(null);   // 0.75 (default)
 * ```
 */
export const normalizePurity = (value: any): number => {
  if (!value && value !== 0) return 18 / 24; // Default 18K = 0.75

  // Handle percentage string format
  if (typeof value === 'string' && value.includes('%')) {
    const numValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
    return numValue > 0 ? numValue / 100 : 18 / 24;
  }

  const num = safeNumber(value);
  if (num <= 0) return 18 / 24;
  if (num <= 1) return num; // Already decimal (0.76)
  if (num <= 24) return num / 24; // Karat value (18 = 18/24)
  return num / 100; // Percentage (76 = 0.76)
};

/**
 * Get purity as percentage string for display
 * 
 * @param purityValue - The purity value in any format
 * @returns Formatted percentage string with one decimal place
 * 
 * @example
 * ```ts
 * getPurityPercentage(0.75); // "75.0"
 * getPurityPercentage(18);   // "75.0"
 * ```
 */
export const getPurityPercentage = (purityValue: any): string => {
  const normalized = normalizePurity(purityValue);
  return (normalized * 100).toFixed(1);
};

/**
 * Standard karat options with corresponding decimal values
 */
export const KARAT_OPTIONS = [
  { value: '14', label: '14K', decimal: 14 / 24, percentage: '58.3%' },
  { value: '18', label: '18K', decimal: 18 / 24, percentage: '75%' },
  { value: '22', label: '22K', decimal: 22 / 24, percentage: '91.7%' },
  { value: '24', label: '24K', decimal: 24 / 24, percentage: '100%' },
] as const;

// ============================================
// Core Calculation Functions
// ============================================

/**
 * Calculate total diamond weight from primary and secondary diamonds
 * 
 * @param dWt1 - Primary diamond weight in carats
 * @param dWt2 - Secondary/pointer diamond weight in carats
 * @returns Total diamond weight in carats
 * 
 * @example
 * ```ts
 * calculateDiamondWeight(0.5, 0.3); // 0.8
 * ```
 */
export const calculateDiamondWeight = (dWt1: number, dWt2: number): number => {
  return safeNumber(dWt1) + safeNumber(dWt2);
};

/**
 * Calculate net gold weight
 * 
 * @description Formula: Gross Weight - (Total Diamond Weight + Gemstone Weight) / 5
 * The division by 5 converts carat weight to approximate gram weight
 * 
 * @param grossWeight - Total piece weight in grams
 * @param totalDiamondWeight - Combined diamond weight in carats
 * @param gemstoneWeight - Gemstone weight in carats
 * @returns Net gold weight in grams (minimum 0)
 * 
 * @example
 * ```ts
 * calculateNetWeight(10, 0.8, 0.2); // 9.8 (10 - (0.8 + 0.2) / 5)
 * ```
 */
export const calculateNetWeight = (
  grossWeight: number,
  totalDiamondWeight: number,
  gemstoneWeight: number
): number => {
  const gw = safeNumber(grossWeight);
  const tdw = safeNumber(totalDiamondWeight);
  const gsw = safeNumber(gemstoneWeight);
  return Math.max(0, gw - (tdw + gsw) / 5);
};

/**
 * Calculate total diamond value
 * 
 * @description Formula: (D.WT 1 × D RATE 1) + (D.WT 2 × Pointer diamond rate)
 * 
 * @param dWt1 - Primary diamond weight in carats
 * @param dRate1 - Rate per carat for primary diamonds
 * @param dWt2 - Secondary diamond weight in carats
 * @param pointerDiamond - Rate per carat for pointer diamonds
 * @returns Total diamond value in currency
 * 
 * @example
 * ```ts
 * calculateDValue(0.5, 50000, 0.3, 20000); // 31000
 * ```
 */
export const calculateDValue = (
  dWt1: number,
  dRate1: number,
  dWt2: number,
  pointerDiamond: number
): number => {
  return safeNumber(dWt1) * safeNumber(dRate1) + safeNumber(dWt2) * safeNumber(pointerDiamond);
};

/**
 * Calculate making/labor charges
 * 
 * @description Formula: Gross Weight × Making Charges Per Gram
 * 
 * @param grossWeight - Total piece weight in grams
 * @param makingChargesPerGram - Making charges rate per gram
 * @returns Total making charges in currency
 * 
 * @example
 * ```ts
 * calculateMakingCharges(10, 500); // 5000
 * ```
 */
export const calculateMakingCharges = (
  grossWeight: number,
  makingChargesPerGram: number
): number => {
  return safeNumber(grossWeight) * safeNumber(makingChargesPerGram);
};

/**
 * Calculate gold value
 * 
 * @description Formula: Net Weight × Purity Fraction × Gold Rate
 * 
 * @param netWeight - Net gold weight in grams
 * @param purityFraction - Gold purity as decimal (0-1)
 * @param goldRate - Current 24K gold rate per gram
 * @returns Gold value in currency
 * 
 * @example
 * ```ts
 * calculateGoldValue(9.8, 0.75, 7000); // 51450
 * ```
 */
export const calculateGoldValue = (
  netWeight: number,
  purityFraction: number,
  goldRate: number
): number => {
  return safeNumber(netWeight) * safeNumber(purityFraction) * safeNumber(goldRate);
};

/**
 * Calculate total jewelry price
 * 
 * @description Formula: D VALUE + Making Charges + Gold Value + Certification Cost + Gemstone Cost
 * 
 * @param dValue - Total diamond value
 * @param makingCharges - Total making charges
 * @param goldValue - Gold content value
 * @param certificationCost - Certification/hallmark cost
 * @param gemstoneCost - Gemstone cost
 * @returns Total price in currency
 * 
 * @example
 * ```ts
 * calculateTotalPrice(31000, 5000, 51450, 500, 2000); // 89950
 * ```
 */
export const calculateTotalPrice = (
  dValue: number,
  makingCharges: number,
  goldValue: number,
  certificationCost: number,
  gemstoneCost: number
): number => {
  return (
    safeNumber(dValue) +
    safeNumber(makingCharges) +
    safeNumber(goldValue) +
    safeNumber(certificationCost) +
    safeNumber(gemstoneCost)
  );
};

/**
 * Calculate all jewelry pricing components at once
 * 
 * @description Master calculation function that computes all pricing
 * components in the correct order and returns a complete pricing breakdown.
 * 
 * @param inputs - All input parameters for pricing calculation
 * @returns Complete pricing breakdown with all components
 * 
 * @example
 * ```ts
 * const pricing = calculateJewelryPricing({
 *   grossWeight: 10,
 *   gemstoneWeight: 0.2,
 *   dWt1: 0.5,
 *   dWt2: 0.3,
 *   dRate1: 50000,
 *   pointerDiamond: 20000,
 *   purityFraction: 0.75,
 *   goldRate: 7000,
 *   makingChargesPerGram: 500,
 *   certificationCost: 500,
 *   gemstoneCost: 2000
 * });
 * // Returns: { totalDiamondWeight, netWeight, dValue, makingCharges, goldValue, totalPrice, costPrice }
 * ```
 */
export const calculateJewelryPricing = (inputs: JewelryPriceInputs): JewelryPriceOutputs => {
  const {
    grossWeight,
    gemstoneWeight,
    dWt1,
    dWt2,
    dRate1,
    pointerDiamond,
    purityFraction,
    goldRate,
    makingChargesPerGram,
    certificationCost,
    gemstoneCost,
  } = inputs;

  // Step 1: Calculate total diamond weight
  const totalDiamondWeight = calculateDiamondWeight(dWt1, dWt2);

  // Step 2: Calculate net weight
  const netWeight = calculateNetWeight(grossWeight, totalDiamondWeight, gemstoneWeight);

  // Step 3: Calculate diamond value
  const dValue = calculateDValue(dWt1, dRate1, dWt2, pointerDiamond);

  // Step 4: Calculate making charges
  const makingCharges = calculateMakingCharges(grossWeight, makingChargesPerGram);

  // Step 5: Calculate gold value
  const goldValue = calculateGoldValue(netWeight, purityFraction, goldRate);

  // Step 6: Calculate total price
  const totalPrice = calculateTotalPrice(dValue, makingCharges, goldValue, certificationCost, gemstoneCost);

  // Cost price equals total price (can be adjusted with margin later)
  const costPrice = totalPrice > 0 ? totalPrice : 0.01;

  return {
    totalDiamondWeight,
    netWeight,
    dValue,
    makingCharges,
    goldValue,
    totalPrice,
    costPrice,
  };
};

// ============================================
// Excel Import Utilities
// ============================================

/**
 * Get value from row with multiple possible column names
 * 
 * @description Searches for a value using multiple possible column names,
 * useful for handling various Excel format variations.
 * 
 * @param row - The data row object
 * @param keys - Array of possible column names to try
 * @returns The first found value or null
 */
const getRowValue = (row: Record<string, any>, ...keys: string[]): any => {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
      return row[key];
    }
  }
  return null;
};

/**
 * Process jewelry row data from Excel import
 * 
 * @description Extracts and calculates pricing from Excel import rows.
 * Supports multiple Excel column formats (GEMHUB format and standard format).
 * Uses vendor profile rates for making charges and gold rate calculations.
 * 
 * @param row - The Excel row data as key-value pairs
 * @param goldRate - Current 24K gold rate per gram from vendor profile
 * @param makingChargesPerGram - Making charges rate from vendor profile
 * @returns Calculated pricing outputs plus the normalized purity fraction
 * 
 * @example
 * ```ts
 * const rowData = {
 *   'Gross Weight': 10,
 *   'D.WT 1': 0.5,
 *   'D RATE 1': 50000,
 *   'PURITY': 18
 * };
 * const pricing = processJewelryImportRow(rowData, 7000, 500);
 * ```
 */
export const processJewelryImportRow = (
  row: Record<string, any>,
  goldRate: number,
  makingChargesPerGram: number
): JewelryPriceOutputs & { purityFraction: number } => {
  // Parse input values - support GEMHUB format and other column name formats
  const grossWeight = safeNumber(
    getRowValue(row, 'Gross Weight', 'G WT', 'GWT', 'GROSS_WEIGHT', 'Gross_Weight')
  );
  const gemstoneWeight = safeNumber(
    getRowValue(row, 'GEMSTONE WT', 'Gemstone Weight', 'GS_WT', 'GEMSTONE_WEIGHT')
  );
  const dWt1 = safeNumber(
    getRowValue(row, 'Diamond Weight 1', 'D.WT 1', 'D WT 1', 'DWT1', 'D_WT_1')
  );
  const dWt2 = safeNumber(
    getRowValue(row, 'Diamond Weight 2', 'D.WT 2', 'D WT 2', 'DWT2', 'D_WT_2')
  );
  const dRate1 = safeNumber(
    getRowValue(row, 'Diamond RATE 1', 'D RATE 1', 'D_RATE_1', 'DRATE1')
  );
  const pointerDiamond = safeNumber(
    getRowValue(row, 'Diamond Rate 2', 'Pointer diamond', 'D RATE 2', 'D_RATE_2', 'POINTER_DIAMOND')
  );
  const certificationCost = safeNumber(
    getRowValue(row, 'Certification cost', 'CERTIFICATION_COST', 'Cert Cost', 'CERT_COST')
  );
  const gemstoneCost = safeNumber(
    getRowValue(row, 'Gemstone cost', 'GEMSTONE_COST', 'GS_COST')
  );

  // Normalize purity - support multiple formats
  const purityRaw = getRowValue(row, 'PURITY_FRACTION_USED', 'Purity', 'PURITY', 'Purity Fraction');
  const purityFraction = normalizePurity(purityRaw);

  // Check for pre-calculated values in Excel (GEMHUB format)
  const netWeightFromExcel = safeNumber(
    getRowValue(row, 'NET Weight', 'NET WT', 'Net Weight', 'NET_WEIGHT')
  );
  const dValueFromExcel = safeNumber(
    getRowValue(row, 'D VALUE', 'DVALUE', 'Diamond Value')
  );

  // Calculate values - ALWAYS recalculate using vendor profile values
  // Only use Excel pre-calculated values for NET WT and D VALUE if provided
  const totalDiamondWeight = calculateDiamondWeight(dWt1, dWt2);
  const netWeight = netWeightFromExcel || calculateNetWeight(grossWeight, totalDiamondWeight, gemstoneWeight);
  const dValue = dValueFromExcel || calculateDValue(dWt1, dRate1, dWt2, pointerDiamond);

  // ALWAYS calculate making charges and gold value from vendor profile
  const makingCharges = calculateMakingCharges(grossWeight, makingChargesPerGram);
  const goldValue = calculateGoldValue(netWeight, purityFraction, goldRate);

  // Calculate total price using calculated values
  const totalPrice = calculateTotalPrice(dValue, makingCharges, goldValue, certificationCost, gemstoneCost);
  const costPrice = totalPrice > 0 ? totalPrice : 0.01;

  return {
    totalDiamondWeight,
    netWeight,
    dValue,
    makingCharges,
    goldValue,
    totalPrice,
    costPrice,
    purityFraction,
  };
};

/**
 * Parsed image URLs from Excel import
 */
export interface ParsedImageUrls {
  /** Primary image URL */
  url1: string | null;
  /** Secondary image URL */
  url2: string | null;
  /** Tertiary image URL */
  url3: string | null;
}

/**
 * Parse image URLs from Excel
 * 
 * @description Handles various image URL formats including:
 * - Pipe-separated URLs (url1|url2|url3)
 * - Escaped characters from Excel (backslashes before colons and pipes)
 * - Single URL values
 * 
 * @param imageUrlValue - The image URL value from Excel
 * @returns Object with up to three parsed image URLs
 * 
 * @example
 * ```ts
 * parseImageUrls("https://example.com/1.jpg|https://example.com/2.jpg");
 * // { url1: "https://example.com/1.jpg", url2: "https://example.com/2.jpg", url3: null }
 * 
 * parseImageUrls("https\\://example.com/img.jpg");
 * // { url1: "https://example.com/img.jpg", url2: null, url3: null }
 * ```
 */
export const parseImageUrls = (imageUrlValue: any): ParsedImageUrls => {
  if (!imageUrlValue) return { url1: null, url2: null, url3: null };

  // Clean up escaped characters from Excel (e.g., "https\://..." or "\|")
  let urlString = String(imageUrlValue).trim()
    .replace(/\\:/g, ':')  // Fix escaped colons
    .replace(/\\\|/g, '|') // Fix escaped pipes
    .replace(/\\/g, '');   // Remove remaining backslashes

  // Handle pipe-separated URLs
  if (urlString.includes('|')) {
    const urls = urlString.split('|').map(u => u.trim()).filter(u => u);
    return {
      url1: urls[0] || null,
      url2: urls[1] || null,
      url3: urls[2] || null,
    };
  }

  return { url1: urlString || null, url2: null, url3: null };
};
