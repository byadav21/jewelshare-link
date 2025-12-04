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
        'SKU': 'DLR001',
        'Category': 'DIAMOND LADIES RING',
        'Diamond Color': 'GH',
        'Diamond CLARITY': 'VS',
        'Diamond Weight 1': 0.08,
        'Diamond Weight 2': '',
        'Total Diamond Weight': 0.08,
        'Gross Weight': 2.31,
        'Center stone TYPE': 'DIAMOND',
        'NET Weight': 2.294,
        'PURITY_FRACTION_USED': '76%',
        'Diamond RATE 1': 65000,
        'Diamond Rate 2': '',
        'D VALUE': '',
        'GEMSTONE Name': 'NONE',
        'Making Charges': '',
        'GOLD Cost': '',
        'Certification cost': 2000,
        'Gemstone cost': 0,
        'TOTAL': '',
        'TOTAL_USD': '',
        'Prodcut': 'IGI Certified Natural Diamond Jewellery',
        'IMAGE_URL': 'https://example.com/image1.jpg|https://example.com/image2.jpg',
        'STOCK QUANTITY': 1,
      },
      {
        'SKU': 'DPS001',
        'Category': 'DIAMOND PANDENT SET',
        'Diamond Color': 'GH',
        'Diamond CLARITY': 'VS',
        'Diamond Weight 1': 0.12,
        'Diamond Weight 2': 0.14,
        'Total Diamond Weight': 0.26,
        'Gross Weight': 5.16,
        'Center stone TYPE': 'DIAMOND',
        'NET Weight': 5.108,
        'PURITY_FRACTION_USED': '76%',
        'Diamond RATE 1': 65000,
        'Diamond Rate 2': 65000,
        'D VALUE': '',
        'GEMSTONE Name': 'NONE',
        'Making Charges': '',
        'GOLD Cost': '',
        'Certification cost': 2000,
        'Gemstone cost': 0,
        'TOTAL': '',
        'TOTAL_USD': '',
        'Prodcut': 'IGI Certified Natural Diamond Jewellery',
        'IMAGE_URL': 'https://example.com/pendant1.jpg|https://example.com/pendant2.jpg',
        'STOCK QUANTITY': 1,
      }
    ];

    const instructions = [
      ['GEMHUB JEWELLERY IMPORT TEMPLATE'],
      [''],
      ['COLUMNS (in order):'],
      ['1. SKU - Unique product code (e.g., DLR001, DPS001, DT001)'],
      ['2. Category - Product type (DIAMOND LADIES RING, DIAMOND PANDENT SET, DIAMOND TOPS, etc.)'],
      ['3. Diamond Color - Color grade (GH, HI, FGH, DEF, GHI)'],
      ['4. Diamond CLARITY - Clarity (VS, VVS, SI, VS-SI, SI-I1)'],
      ['5. Diamond Weight 1 - Primary diamond weight in carats'],
      ['6. Diamond Weight 2 - Secondary diamond weight (leave blank if none)'],
      ['7. Total Diamond Weight - Sum of diamond weights'],
      ['8. Gross Weight - Total weight in grams'],
      ['9. Center stone TYPE - DIAMOND, LAB DIAMOND, MOISSANITE'],
      ['10. NET Weight - Net gold weight (auto-calculated if blank)'],
      ['11. PURITY_FRACTION_USED - Metal purity (76% for 18K)'],
      ['12. Diamond RATE 1 - Price per carat for primary diamonds'],
      ['13. Diamond Rate 2 - Price per carat for secondary diamonds'],
      ['14. D VALUE - Diamond value (auto-calculated)'],
      ['15. GEMSTONE Name - NONE, Ruby, Sapphire, Emerald, etc.'],
      ['16. Making Charges - AUTO-CALCULATED from vendor profile'],
      ['17. GOLD Cost - AUTO-CALCULATED from vendor profile'],
      ['18. Certification cost - Certificate charges in INR'],
      ['19. Gemstone cost - Total gemstone cost'],
      ['20. TOTAL - AUTO-CALCULATED total price'],
      ['21. TOTAL_USD - AUTO-CALCULATED USD price'],
      ['22. Prodcut - Product description/title'],
      ['23. IMAGE_URL - Image URLs separated by | (pipe)'],
      ['24. STOCK QUANTITY - Number in stock'],
      [''],
      ['AUTO-CALCULATED (Leave Blank):'],
      ['- Making Charges, GOLD Cost, TOTAL, TOTAL_USD, D VALUE'],
      ['- These are calculated using your Vendor Profile rates'],
      [''],
      ['BEFORE IMPORTING:'],
      ['1. Update Vendor Profile with correct Gold Rate and Making Charges'],
      ['2. Delete this Instructions sheet'],
      ['3. Keep header row in Products sheet'],
      ['4. Save as .xlsx format'],
    ];

    const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
    wsInstructions['!cols'] = [{ wch: 80 }];
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

    const wsData = XLSX.utils.json_to_sheet(sampleData);
    wsData['!cols'] = Array(24).fill({ wch: 18 });
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
