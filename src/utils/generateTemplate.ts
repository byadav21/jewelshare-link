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
        'IMAGE_URL': 'https://example.com/ruby1.jpg',
        'PRICE_INR': 250000,
        'STOCK QUANTITY': 1,
      }
    ];

    const instructions = [
      ['GEMSTONE IMPORT TEMPLATE - INSTRUCTIONS'],
      [''],
      ['REQUIRED FIELDS:'],
      ['- SKU ID: Unique product identifier'],
      ['- GEMSTONE NAME: Name of the gemstone (e.g., Ruby, Sapphire, Emerald)'],
      ['- PRICE_INR: Total price in Indian Rupees (will auto-convert to USD)'],
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
      ['- IMAGE_URL: Image URL (can use | separator for multiple images)'],
      [''],
      ['NOTES:'],
      ['- Price will be automatically converted from INR to USD'],
      ['- Delete instruction rows before importing'],
      ['- Keep the header row'],
      ['- Save as .xlsx format'],
    ];

    const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
    wsInstructions['!cols'] = [{ wch: 80 }];
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

    const wsData = XLSX.utils.json_to_sheet(sampleData);
    wsData['!cols'] = Array(13).fill({ wch: 15 });
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
        'IMAGE_URL': 'https://example.com/diamond1.jpg',
        'PRICE_INR': 850000,
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
      ['- PRICE_INR: Total price in Indian Rupees (will auto-convert to USD)'],
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
      ['- IMAGE_URL: Image URL (can use | separator for multiple images)'],
      [''],
      ['NOTES:'],
      ['- Price will be automatically converted from INR to USD'],
      ['- Delete instruction rows before importing'],
      ['- Keep the header row'],
      ['- Save as .xlsx format'],
    ];

    const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
    wsInstructions['!cols'] = [{ wch: 80 }];
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

    const wsData = XLSX.utils.json_to_sheet(sampleData);
    wsData['!cols'] = Array(18).fill({ wch: 15 });
    XLSX.utils.book_append_sheet(wb, wsData, 'Diamonds');

    XLSX.writeFile(wb, 'diamond_import_template.xlsx');
  } else {
    // Jewellery template (existing)
    const sampleData = [
      {
        'PRODUCT': 'Sample Ring',
        'CERT': 'SKU-001',
        'CATEGORY': 'Ring',
        'DESCRIPTION': 'Beautiful gold ring with diamond',
        'METAL TYPE': 'Gold',
        'GEMSTONE': 'Diamond',
        'WEIGHT (grams)': 5.5,
        'NET WEIGHT': 5.2,
        'DIAMOND WEIGHT': 0.3,
        'D WT 1': 0.2,
        'D WT 2': 0.1,
        'DIAMOND COLOR': 'F',
        'COLOR': 'Yellow',
        'CLARITY': 'VS1',
        'POINTER DIAMOND': 30,
        'PER CARAT PRICE': 50000,
        'D RATE 1': 45000,
        'D VALUE': 15000,
        'GOLD PER GRAM PRICE': 6500,
        'PURITY FRACTION USED': 0.916,
        'MKG': 1200,
        'CERTIFICATION COST': 500,
        'GEMSTONE COST': 2000,
        'COST PRICE': 45000,
        'RETAIL PRICE': 55000,
        'TOTAL': 55000,
        'TOTAL USD': 660,
        'STOCK QUANTITY': 10,
        'IMAGE_URL': 'https://example.com/image1.jpg|https://example.com/image2.jpg',
        'THUMBNAIL': 'https://example.com/thumbnail.jpg',
        'DELIVERY TYPE': 'immediate delivery',
        'DISPATCHES IN DAYS': ''
      }
    ];

    const instructions = [
      ['JEWELLERY IMPORT TEMPLATE - INSTRUCTIONS'],
      [''],
      ['REQUIRED FIELDS (must be filled):'],
      ['- PRODUCT: Product name'],
      ['- COST PRICE: Cost price in your currency'],
      ['- RETAIL PRICE: Selling price in your currency'],
      ['- STOCK QUANTITY: Number of items in stock'],
      [''],
      ['OPTIONAL FIELDS:'],
      ['- CERT/SKU: Unique product identifier'],
      ['- CATEGORY: Product category (e.g., Ring, Necklace)'],
      ['- DESCRIPTION: Detailed description'],
      ['- METAL TYPE: Type of metal (e.g., Gold, Silver, Platinum)'],
      ['- GEMSTONE: Type of gemstone'],
      ['- WEIGHT (grams): Total weight'],
      ['- IMAGE_URL: Can contain up to 3 URLs separated by |'],
      ['- DELIVERY TYPE: immediate delivery or Despatches in X working days'],
      [''],
      ['NOTES:'],
      ['- Delete these instruction rows before importing'],
      ['- Keep the header row'],
      ['- Save as .xlsx format'],
    ];

    const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
    wsInstructions['!cols'] = [{ wch: 80 }];
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

    const wsData = XLSX.utils.json_to_sheet(sampleData);
    wsData['!cols'] = Array(30).fill({ wch: 15 });
    XLSX.utils.book_append_sheet(wb, wsData, 'Products');

    XLSX.writeFile(wb, 'jewellery_import_template.xlsx');
  }
};
