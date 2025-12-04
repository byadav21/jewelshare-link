// ============================================
// Jewelry Pricing Calculation Utilities
// Shared between JewelleryForm and Import page
// ============================================

/**
 * Safely parse a number from various input types
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

/**
 * Normalize purity value to decimal format (0-1)
 * Handles: decimal (0.76), karat (18 = 18K), percentage (76 or "76%")
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
 * Get purity percentage for display
 */
export const getPurityPercentage = (purityDecimal: number): string => {
  return (purityDecimal * 100).toFixed(1);
};

/**
 * Standard karat options with decimal values
 */
export const KARAT_OPTIONS = [
  { value: '14', label: '14K', decimal: 14 / 24, percentage: '58.3%' },
  { value: '18', label: '18K', decimal: 18 / 24, percentage: '75%' },
  { value: '22', label: '22K', decimal: 22 / 24, percentage: '91.7%' },
  { value: '24', label: '24K', decimal: 24 / 24, percentage: '100%' },
] as const;

// ============================================
// Jewelry Pricing Calculations
// ============================================

export interface JewelryPriceInputs {
  grossWeight: number;
  gemstoneWeight: number;
  dWt1: number;
  dWt2: number;
  dRate1: number;
  pointerDiamond: number;
  purityFraction: number;
  goldRate: number;
  makingChargesPerGram: number;
  certificationCost: number;
  gemstoneCost: number;
}

export interface JewelryPriceOutputs {
  totalDiamondWeight: number;
  netWeight: number;
  dValue: number;
  makingCharges: number;
  goldValue: number;
  totalPrice: number;
  costPrice: number;
}

/**
 * Calculate total diamond weight
 */
export const calculateDiamondWeight = (dWt1: number, dWt2: number): number => {
  return safeNumber(dWt1) + safeNumber(dWt2);
};

/**
 * Calculate net weight: Gross Weight - (Total Diamond Weight + Gemstone Weight) / 5
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
 * Calculate diamond value: (D.WT 1 × D RATE 1) + (D.WT 2 × Pointer diamond rate)
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
 * Calculate making charges: Gross Weight × Making Charges Per Gram
 */
export const calculateMakingCharges = (
  grossWeight: number,
  makingChargesPerGram: number
): number => {
  return safeNumber(grossWeight) * safeNumber(makingChargesPerGram);
};

/**
 * Calculate gold value: Net Weight × Purity Fraction × Gold Rate
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
 * Formula: D VALUE + Making Charges + Gold Value + Certification Cost + Gemstone Cost
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
  const totalPrice = calculateTotalPrice(
    dValue,
    makingCharges,
    goldValue,
    certificationCost,
    gemstoneCost
  );

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

/**
 * Get value from row with multiple possible column names
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
 * Supports multiple Excel column formats (GEMHUB format and standard format)
 */
export const processJewelryImportRow = (
  row: Record<string, any>,
  goldRate: number,
  makingChargesPerGram: number
): JewelryPriceOutputs & { purityFraction: number } => {
  // Parse input values - support multiple column name formats
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

  // Check for pre-calculated values in Excel
  const netWeightFromExcel = safeNumber(
    getRowValue(row, 'NET Weight', 'NET WT', 'Net Weight', 'NET_WEIGHT')
  );
  const dValueFromExcel = safeNumber(
    getRowValue(row, 'D VALUE', 'DVALUE', 'Diamond Value')
  );
  const mkgFromExcel = safeNumber(
    getRowValue(row, 'Making Charges', 'MKG', 'MAKING_CHARGES')
  );
  const goldFromExcel = safeNumber(
    getRowValue(row, 'GOLD Cost', 'GOLD', 'Gold Value', 'GOLD_COST')
  );
  const totalFromExcel = safeNumber(
    getRowValue(row, 'TOTAL', 'Total', 'TOTAL_PRICE', 'Total Price')
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
 * Parse image URLs from Excel (supports pipe-separated URLs)
 */
export const parseImageUrls = (imageUrlValue: any): { url1: string | null; url2: string | null; url3: string | null } => {
  if (!imageUrlValue) return { url1: null, url2: null, url3: null };
  
  const urlString = String(imageUrlValue).trim();
  
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