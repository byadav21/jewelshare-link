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
    // Jewellery template - comprehensive format
    const sampleData = [
      {
        'CERT': 'SKU-001',
        'PRODUCT': 'Sample Diamond Ring',
        'Diamond Color': 'FGH',
        'CLARITY': 'VS',
        'D.WT 1': 0.25,
        'D.WT 2': 0.15,
        'T DWT': 0.40,
        'G WT': 5.50,
        'CS TYPE': 'Lab Grown Diamond',
        'NET WT': 5.20,
        'PURITY_FRACTION_USED': 0.76,
        'D RATE 1': 18000,
        'Pointer diamond': 40,
        'D VALUE': 7200,
        'GEMSTONE TYPE': 'NONE',
        'MKG': 1200,
        'GOLD': 6500,
        'Certification cost': 2000,
        'Gemstone cost': 0,
        'TOTAL': 55000,
        'TOTAL_USD': 650,
        'Prodcut Type': 'IGI Certified Lab Grown Diamond Jewellery',
        'IMAGE_URL': 'https://example.com/image1.jpg|https://example.com/image2.jpg',
        'STOCK QUANTITY': 1,
        'DELIVERY TYPE': 'immediate delivery'
      }
    ];

    const instructions = [
      ['JEWELLERY IMPORT TEMPLATE - INSTRUCTIONS'],
      [''],
      ['REQUIRED FIELDS:'],
      ['- CERT: Unique SKU/Certificate number'],
      ['- PRODUCT: Product name/description'],
      ['- TOTAL: Total/Retail price in INR'],
      ['- STOCK QUANTITY: Number of items in stock'],
      [''],
      ['DIAMOND DETAILS (Optional):'],
      ['- Diamond Color: Color grade (e.g., FGH, DEF)'],
      ['- CLARITY: Clarity grade (e.g., VS, VVS, SI)'],
      ['- D.WT 1: Primary diamond weight in carats'],
      ['- D.WT 2: Secondary diamond weight in carats'],
      ['- T DWT: Total diamond weight in carats'],
      ['- CS TYPE: Diamond type (e.g., Lab Grown Diamond, Natural Diamond)'],
      ['- D RATE 1: Diamond rate per carat'],
      ['- Pointer diamond: Diamond pointer/size'],
      ['- D VALUE: Total diamond value'],
      [''],
      ['METAL & WEIGHT DETAILS (Optional):'],
      ['- G WT: Gross weight in grams'],
      ['- NET WT: Net weight in grams'],
      ['- PURITY_FRACTION_USED: Metal purity fraction (e.g., 0.76 for 18K, 0.916 for 22K)'],
      ['- GOLD: Gold rate per gram'],
      ['- MKG: Making charges'],
      [''],
      ['OTHER DETAILS (Optional):'],
      ['- GEMSTONE TYPE: Type of gemstone if any (e.g., Ruby, Sapphire, NONE)'],
      ['- Certification cost: Certification charges'],
      ['- Gemstone cost: Additional gemstone cost'],
      ['- TOTAL_USD: Price in USD (optional, will auto-convert)'],
      ['- Prodcut Type: Product type/category description'],
      ['- IMAGE_URL: Image URLs separated by | (up to 3 images)'],
      ['- DELIVERY TYPE: immediate delivery or Despatches in X working days'],
      [''],
      ['NOTES:'],
      ['- All price/cost fields should be in INR'],
      ['- Delete instruction rows before importing'],
      ['- Keep the header row exactly as shown'],
      ['- Save as .xlsx format'],
      ['- This format matches GEMHUB inventory exports'],
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
