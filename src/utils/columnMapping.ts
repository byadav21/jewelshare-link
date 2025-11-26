type ProductType = 'Jewellery' | 'Gemstones' | 'Loose Diamonds';

interface ExpectedColumns {
  required: string[];
  optional: string[];
}

export const getExpectedColumns = (productType: ProductType): ExpectedColumns => {
  switch (productType) {
    case 'Gemstones':
      return {
        required: [
          'SKU ID',
          'GEMSTONE NAME',
          'PRICE INR',
          'STOCK QUANTITY'
        ],
        optional: [
          'GEMSTONE TYPE',
          'CARAT WEIGHT',
          'COLOR',
          'CLARITY',
          'CUT',
          'POLISH',
          'SYMMETRY',
          'MEASUREMENT',
          'CERTIFICATION',
          'IMAGE URL',
          'COST PRICE',
          'RETAIL PRICE'
        ]
      };
    
    case 'Loose Diamonds':
      return {
        required: [
          'SKU NO',
          'DIAMOND TYPE',
          'SHAPE',
          'CARAT',
          'COLOR',
          'CLARITY',
          'PRICE INR',
          'STOCK QUANTITY'
        ],
        optional: [
          'STATUS',
          'COLOR SHADE AMOUNT',
          'CUT',
          'POLISH',
          'SYMMETRY',
          'FLO',
          'MEASUREMENT',
          'RATIO',
          'LAB',
          'IMAGE URL',
          'COST PRICE',
          'RETAIL PRICE'
        ]
      };
    
    case 'Jewellery':
    default:
      return {
        required: [
          'PRODUCT',
          'COST PRICE',
          'RETAIL PRICE',
          'STOCK QUANTITY'
        ],
        optional: [
          'CERT',
          'CATEGORY',
          'DESCRIPTION',
          'METAL TYPE',
          'GEMSTONE',
          'WEIGHT (grams)',
          'IMAGE URL',
          'DELIVERY TYPE'
        ]
      };
  }
};

export const normalizeColumnName = (columnName: string): string => {
  return columnName
    .toLowerCase()
    .replace(/[_\s-]/g, '')
    .trim();
};

export const findBestMatch = (
  detectedColumn: string,
  expectedColumns: string[]
): string | null => {
  const normalized = normalizeColumnName(detectedColumn);
  
  for (const expected of expectedColumns) {
    const expectedNorm = normalizeColumnName(expected);
    
    // Exact match after normalization
    if (normalized === expectedNorm) {
      return expected;
    }
    
    // Contains match
    if (normalized.includes(expectedNorm) || expectedNorm.includes(normalized)) {
      return expected;
    }
  }
  
  return null;
};
