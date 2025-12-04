import * as XLSX from 'xlsx';

type ProductType = 'Jewellery' | 'Gemstones' | 'Loose Diamonds';

export const generateProductTemplate = (productType: ProductType = 'Jewellery') => {
  const wb = XLSX.utils.book_new();

  if (productType === 'Gemstones') {
    const sampleData = [
      {
        'SKU ID': 'GEM-001',
        'GEMSTONE NAME': 'Ruby',
        'GEMSTONE TYPE': 'Natural Ruby',
        'CARAT WEIGHT': 2.5,
        'COLOR': 'Pigeon Blood Red',
        'CLARITY': 'VVS',
        'CUT': 'Oval',
        'POLISH': 'Excellent',
        'SYMMETRY': 'Excellent',
        'MEASUREMENT': '8.5 x 6.5 x 4.2 mm',
        'CERTIFICATION': 'GRS',
        'IMAGE URL': 'https://example.com/ruby1.jpg',
        'PRICE INR': 250000,
        'COST PRICE': 200000,
        'RETAIL PRICE': 250000,
        'STOCK QUANTITY': 1,
      }
    ];

    const instructions = [
      ['GEMSTONE IMPORT TEMPLATE - INSTRUCTIONS'],
      [''],
      ['REQUIRED FIELDS:'],
      ['- SKU ID: Unique product identifier'],
      ['- GEMSTONE NAME: Name of the gemstone (e.g., Ruby, Sapphire, Emerald)'],
      ['- PRICE INR: Total price in Indian Rupees (will auto-convert to USD)'],
      ['- STOCK QUANTITY: Number of items in stock'],
      [''],
      ['OPTIONAL FIELDS:'],
      ['- GEMSTONE TYPE: Specific type (e.g., Natural Ruby, Heated Sapphire)'],
      ['- CARAT WEIGHT: Weight in carats'],
      ['- COLOR: Color description'],
      ['- CLARITY: Clarity grade (e.g., VVS, VS, SI)'],
      ['- CUT: Cut type (e.g., Oval, Round, Cushion)'],
      ['- POLISH: Polish quality (e.g., Excellent, Very Good, Good)'],
      ['- SYMMETRY: Symmetry grade (e.g., Excellent, Very Good, Good)'],
      ['- MEASUREMENT: Dimensions (e.g., 8.5 x 6.5 x 4.2 mm)'],
      ['- CERTIFICATION: Lab certification (e.g., GRS, GIA, IGI)'],
      ['- IMAGE URL: Image URL (can use | separator for multiple images)'],
      ['- COST PRICE: Your cost price in INR (optional, defaults to PRICE INR)'],
      ['- RETAIL PRICE: Retail/selling price in INR (optional, defaults to PRICE INR)'],
      [''],
      ['NOTES:'],
      ['- Price will be automatically converted from INR to USD'],
      ['- If COST PRICE or RETAIL PRICE not provided, PRICE INR will be used'],
      ['- Delete instruction rows before importing'],
      ['- Keep the header row'],
      ['- Save as .xlsx format'],
    ];

    const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
    wsInstructions['!cols'] = [{ wch: 80 }];
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

    const wsData = XLSX.utils.json_to_sheet(sampleData);
    wsData['!cols'] = Array(15).fill({ wch: 15 });
    XLSX.utils.book_append_sheet(wb, wsData, 'Gemstones');

    XLSX.writeFile(wb, 'gemstone_import_template.xlsx');
  } else if (productType === 'Loose Diamonds') {
    const sampleData = [
      {
        'SKU NO': 'DIA-001',
        'DIAMOND TYPE': 'Natural',
        'STATUS': 'Available',
        'SHAPE': 'Round',
        'CARAT': 1.5,
        'CLARITY': 'VS1',
        'COLOR': 'F',
        'COLOR SHADE AMOUNT': 'None',
        'CUT': 'Excellent',
        'POLISH': 'Excellent',
        'SYMMETRY': 'Excellent',
        'FLO': 'None',
        'MEASUREMENT': '7.4 x 7.4 x 4.5 mm',
        'RATIO': '1.00',
        'LAB': 'GIA',
        'IMAGE URL': 'https://example.com/diamond1.jpg',
        'PRICE INR': 850000,
        'COST PRICE': 750000,
        'RETAIL PRICE': 850000,
        'STOCK QUANTITY': 1,
      }
    ];

    const instructions = [
      ['LOOSE DIAMOND IMPORT TEMPLATE - INSTRUCTIONS'],
      [''],
      ['REQUIRED FIELDS:'],
      ['- SKU NO: Unique diamond identifier'],
      ['- DIAMOND TYPE: Natural or Lab Grown'],
      ['- SHAPE: Diamond shape (e.g., Round, Princess, Cushion)'],
      ['- CARAT: Carat weight'],
      ['- COLOR: Color grade (D-Z)'],
      ['- CLARITY: Clarity grade (e.g., IF, VVS1, VS1, SI1)'],
      ['- PRICE INR: Total price in Indian Rupees (will auto-convert to USD)'],
      ['- STOCK QUANTITY: Number of items in stock'],
      [''],
      ['OPTIONAL FIELDS:'],
      ['- STATUS: Availability status (e.g., Available, Reserved)'],
      ['- COLOR SHADE AMOUNT: Color shade description'],
      ['- CUT: Cut grade (e.g., Excellent, Very Good, Good)'],
      ['- POLISH: Polish grade (e.g., Excellent, Very Good, Good)'],
      ['- SYMMETRY: Symmetry grade (e.g., Excellent, Very Good, Good)'],
      ['- FLO: Fluorescence (e.g., None, Faint, Medium, Strong)'],
      ['- MEASUREMENT: Dimensions (e.g., 7.4 x 7.4 x 4.5 mm)'],
      ['- RATIO: Length to width ratio'],
      ['- LAB: Certification lab (e.g., GIA, IGI, HRD)'],
      ['- IMAGE URL: Image URL (can use | separator for multiple images)'],
      ['- COST PRICE: Your cost price in INR (optional, defaults to PRICE INR)'],
      ['- RETAIL PRICE: Retail/selling price in INR (optional, defaults to PRICE INR)'],
      [''],
      ['NOTES:'],
      ['- Price will be automatically converted from INR to USD'],
      ['- If COST PRICE or RETAIL PRICE not provided, PRICE INR will be used'],
      ['- Delete instruction rows before importing'],
      ['- Keep the header row'],
      ['- Save as .xlsx format'],
    ];

    const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
    wsInstructions['!cols'] = [{ wch: 80 }];
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

    const wsData = XLSX.utils.json_to_sheet(sampleData);
    wsData['!cols'] = Array(20).fill({ wch: 15 });
    XLSX.utils.book_append_sheet(wb, wsData, 'Diamonds');

    XLSX.writeFile(wb, 'diamond_import_template.xlsx');
  } else {
    // Jewellery template - GEMHUB format with auto-calculated fields
    const sampleData = [
      {
        'CERT': 'CLR001',
        'PRODUCT': 'CVD LADIES RING',
        'Diamond Color': 'FGH',
        'CLARITY': 'VS',
        'D.WT 1': 0.08,
        'D.WT 2': 0,
        'GEMSTONE WT': 0,
        'T DWT': 0.08,
        'G WT': 2.47,
        'CS TYPE': 'Lab Grown Diamond',
        'NET WT': 2.438,
        'PURITY_FRACTION_USED': 18,
        'D RATE 1': 18000,
        'Pointer diamond': '',
        'GEMSTONE RATE': '',
        'D VALUE': 1440,
        'GEMSTONE TYPE': 'NONE',
        'MKG': '',
        'GOLD': '',
        'Certification cost': 2000,
        'Gemstone cost': 0,
        'TOTAL': '',
        'TOTAL_USD': '',
        'Product Type': 'LAB GROWN DIAMOND JEWELLERY',
        'IMAGE_URL': 'https://example.com/image1.jpg|https://example.com/image2.jpg',
        'STOCK QUANTITY': 1,
        'DELIVERY TYPE': 'immediate'
      }
    ];

    const instructions = [
      ['JEWELLERY IMPORT TEMPLATE - INSTRUCTIONS (GEMHUB FORMAT)'],
      [''],
      ['REQUIRED FIELDS:'],
      ['- CERT: Unique SKU/Certificate (Format: C + Product Type + R/B + Number)'],
      ['  Examples: CLR001 (Ladies Ring), CBR001 (Bracelet), CGR001 (Gents Ring), CBG001 (Bangle)'],
      ['- PRODUCT: Product name (e.g., CVD LADIES RING, DIAMOND BRACELET, MOISSANITE RING)'],
      ['- G WT: Gross weight in grams (required for pricing calculation)'],
      ['- STOCK QUANTITY: Number of items in stock'],
      [''],
      ['AUTO-CALCULATED FIELDS (Leave Blank):'],
      ['- MKG: Making charges (auto-calculated from vendor profile)'],
      ['- GOLD: Gold value (auto-calculated from vendor profile gold rate)'],
      ['- TOTAL: Total price in INR (auto-calculated)'],
      ['- TOTAL_USD: Price in USD (auto-converted)'],
      ['- NET WT: Net weight (auto-calculated if not provided)'],
      [''],
      ['DIAMOND DETAILS (Optional):'],
      ['- Diamond Color: Color grade (e.g., FGH, DEF)'],
      ['- CLARITY: Clarity grade (e.g., VS, VVS, SI)'],
      ['- D.WT 1: Primary diamond weight in carats'],
      ['- D.WT 2: Secondary diamond weight in carats'],
      ['- T DWT: Total diamond weight in carats'],
      ['- CS TYPE: Diamond type (Lab Grown Diamond, Natural Diamond, Moissanite)'],
      ['- D RATE 1: Diamond rate per carat'],
      ['- Pointer diamond: Pointer diamond rate (for D.WT 2 calculation)'],
      ['- D VALUE: Total diamond value (D.WT 1 × D RATE 1 + D.WT 2 × Pointer diamond)'],
      [''],
      ['GEMSTONE DETAILS (Optional):'],
      ['- GEMSTONE WT: Gemstone weight in carats'],
      ['- GEMSTONE RATE: Gemstone rate per carat'],
      ['- GEMSTONE TYPE: Type of gemstone (Ruby, Sapphire, Emerald, NONE, etc.)'],
      ['- Gemstone cost: Total gemstone cost (GEMSTONE WT × GEMSTONE RATE)'],
      [''],
      ['METAL & WEIGHT DETAILS:'],
      ['- NET WT: Net weight in grams (formula: G WT - T DWT + GEMSTONE WT/5)'],
      ['- PURITY_FRACTION_USED: Metal purity - enter as karat (18 for 18K = 75%), percentage (76 for 76%), or decimal (0.76)'],
      ['  Common values: 18 = 18K (75%), 22 = 22K (91.6%), 24 = 24K (100%)'],
      ['- PURITY_FRACTION_USED: Metal purity (76% for 18K, 91.6% for 22K, 100% for 24K)'],
      [''],
      ['OTHER DETAILS (Optional):'],
      ['- Certification cost: Certification charges in INR'],
      ['- Product Type: Product category (LAB GROWN DIAMOND JEWELLERY, NATURAL DIAMOND JEWELLERY, etc.)'],
      ['- IMAGE_URL: Image URLs separated by | (up to 3 images)'],
      ['- DELIVERY TYPE: immediate or scheduled'],
      [''],
      ['PRICING FORMULA:'],
      ['TOTAL = D VALUE + MKG + GOLD + Certification cost + Gemstone cost'],
      ['- D VALUE = (D.WT 1 × D RATE 1) + (D.WT 2 × Pointer diamond)'],
      ['- MKG = G WT × vendor making_charges_per_gram (from profile)'],
      ['- GOLD = NET WT × vendor gold_rate × PURITY_FRACTION_USED (from profile)'],
      [''],
      ['IMPORTANT NOTES:'],
      ['- Gold rate and making charges come from YOUR vendor profile settings'],
      ['- USD conversion rate also comes from vendor profile'],
      ['- Leave MKG, GOLD, TOTAL, TOTAL_USD, NET WT blank - system calculates these'],
      ['- PURITY_FRACTION_USED: Enter karat (18), percentage (76), or decimal (0.76)'],
      ['- Delete instruction rows before importing'],
      ['- Keep the header row exactly as shown'],
      ['- Save as .xlsx format'],
      ['- This format matches GEMHUB Diamond Inventory exports'],
    ];

    const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
    wsInstructions['!cols'] = [{ wch: 80 }];
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

    const wsData = XLSX.utils.json_to_sheet(sampleData);
    wsData['!cols'] = Array(25).fill({ wch: 15 });
    XLSX.utils.book_append_sheet(wb, wsData, 'Products');

    XLSX.writeFile(wb, 'jewellery_import_template.xlsx');
  }
};

// Invoice Template Presets
import { InvoiceTemplateData, DEFAULT_SECTIONS } from "@/types/invoiceTemplate";

export const PRE_DESIGNED_TEMPLATES = {
  modern: {
    name: "Modern Professional",
    description: "Clean, contemporary design with bold accents and minimal styling",
    template_data: {
      sections: DEFAULT_SECTIONS.map(section => ({
        ...section,
        styling: {
          ...section.styling,
          backgroundColor: section.type === 'header' ? 'hsl(var(--primary) / 0.05)' : 'transparent',
          borderColor: 'hsl(var(--border))',
          borderWidth: section.type === 'header' ? 0 : 1,
          padding: 20,
        }
      })),
      globalStyling: {
        primaryColor: "hsl(221, 83%, 53%)",
        secondaryColor: "hsl(262, 83%, 58%)",
        fontFamily: "Inter, sans-serif",
        pageMargin: 24,
        logoUrl: "",
      },
      productImages: [],
    } as InvoiceTemplateData,
  },
  traditional: {
    name: "Traditional Classic",
    description: "Timeless, formal layout with structured sections and elegant borders",
    template_data: {
      sections: DEFAULT_SECTIONS.map(section => ({
        ...section,
        styling: {
          ...section.styling,
          backgroundColor: 'transparent',
          borderColor: 'hsl(var(--foreground) / 0.2)',
          borderWidth: 2,
          padding: 16,
        }
      })),
      globalStyling: {
        primaryColor: "hsl(220, 13%, 18%)",
        secondaryColor: "hsl(215, 16%, 47%)",
        fontFamily: "Georgia, serif",
        pageMargin: 32,
        logoUrl: "",
      },
      productImages: [],
    } as InvoiceTemplateData,
  },
  luxury: {
    name: "Luxury Premium",
    description: "Elegant, high-end design with gold accents and sophisticated styling",
    template_data: {
      sections: DEFAULT_SECTIONS.map(section => ({
        ...section,
        styling: {
          ...section.styling,
          backgroundColor: section.type === 'header' 
            ? 'hsl(43, 74%, 49% / 0.08)' 
            : section.type === 'cost_breakdown'
            ? 'hsl(43, 74%, 49% / 0.03)'
            : 'transparent',
          borderColor: 'hsl(43, 74%, 49% / 0.3)',
          borderWidth: section.type === 'header' || section.type === 'cost_breakdown' ? 2 : 1,
          padding: 24,
        }
      })),
      globalStyling: {
        primaryColor: "hsl(43, 74%, 49%)",
        secondaryColor: "hsl(220, 13%, 18%)",
        fontFamily: "Playfair Display, serif",
        pageMargin: 28,
        logoUrl: "",
      },
      productImages: [],
    } as InvoiceTemplateData,
  },
};

export type TemplateTheme = keyof typeof PRE_DESIGNED_TEMPLATES;
