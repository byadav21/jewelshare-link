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
 * Calculate net weight: Gross Weight - (Total Diamond Weight + Gemstone Weight / 5)
 */
export const calculateNetWeight = (
  grossWeight: number,
  totalDiamondWeight: number,
  gemstoneWeight: number
): number => {
  const gw = safeNumber(grossWeight);
  const tdw = safeNumber(totalDiamondWeight);
  const gsw = safeNumber(gemstoneWeight);
  return Math.max(0, gw - (tdw + gsw / 5));
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
 * Process jewelry row data from Excel import
 */
export const processJewelryImportRow = (
  row: Record<string, any>,
  goldRate: number,
  makingChargesPerGram: number
): JewelryPriceOutputs & { purityFraction: number } => {
  // Parse input values
  const grossWeight = safeNumber(row['G WT']);
  const gemstoneWeight = safeNumber(row['GEMSTONE WT']);
  const dWt1 = safeNumber(row['D.WT 1'] || row['D WT 1']);
  const dWt2 = safeNumber(row['D.WT 2'] || row['D WT 2']);
  const dRate1 = safeNumber(row['D RATE 1']);
  const pointerDiamond = safeNumber(row['Pointer diamond']);
  const certificationCost = safeNumber(row['Certification cost']);
  const gemstoneCost = safeNumber(row['Gemstone cost']);
  
  // Normalize purity
  const purityFraction = normalizePurity(row.PURITY_FRACTION_USED);

  // Check for pre-calculated values in Excel
  const netWeightFromExcel = safeNumber(row['NET WT']);
  const dValueFromExcel = safeNumber(row['D VALUE']);
  const mkgFromExcel = safeNumber(row.MKG);
  const goldFromExcel = safeNumber(row.GOLD);
  const totalFromExcel = safeNumber(row.TOTAL);

  // Calculate values (use Excel values if provided, otherwise calculate)
  const totalDiamondWeight = calculateDiamondWeight(dWt1, dWt2);
  const netWeight = netWeightFromExcel || calculateNetWeight(grossWeight, totalDiamondWeight, gemstoneWeight);
  const dValue = dValueFromExcel || calculateDValue(dWt1, dRate1, dWt2, pointerDiamond);
  const makingCharges = mkgFromExcel || calculateMakingCharges(grossWeight, makingChargesPerGram);
  const goldValue = goldFromExcel || calculateGoldValue(netWeight, purityFraction, goldRate);
  const totalPrice = totalFromExcel || calculateTotalPrice(dValue, makingCharges, goldValue, certificationCost, gemstoneCost);
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
