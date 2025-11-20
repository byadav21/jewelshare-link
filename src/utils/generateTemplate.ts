import * as XLSX from 'xlsx';

export const generateProductTemplate = () => {
  // Create sample data with all required and optional columns
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
      'PRODUCT TYPE': 'Jewelry',
      'IMAGE_URL': 'https://example.com/image1.jpg|https://example.com/image2.jpg',
      'THUMBNAIL': 'https://example.com/thumbnail.jpg',
      'DELIVERY TYPE': 'immediate delivery',
      'DISPATCHES IN DAYS': ''
    },
    {
      'PRODUCT': 'Sample Necklace',
      'CERT': 'SKU-002',
      'CATEGORY': 'Necklace',
      'DESCRIPTION': 'Elegant diamond necklace',
      'METAL TYPE': 'Platinum',
      'GEMSTONE': 'Diamond',
      'WEIGHT (grams)': 15.0,
      'NET WEIGHT': 14.5,
      'DIAMOND WEIGHT': 0.5,
      'D WT 1': 0.3,
      'D WT 2': 0.2,
      'DIAMOND COLOR': 'D',
      'COLOR': 'White',
      'CLARITY': 'VVS1',
      'POINTER DIAMOND': 50,
      'PER CARAT PRICE': 80000,
      'D RATE 1': 75000,
      'D VALUE': 40000,
      'GOLD PER GRAM PRICE': 0,
      'PURITY FRACTION USED': 0.95,
      'MKG': 2500,
      'CERTIFICATION COST': 1000,
      'GEMSTONE COST': 5000,
      'COST PRICE': 120000,
      'RETAIL PRICE': 150000,
      'TOTAL': 150000,
      'TOTAL USD': 1800,
      'STOCK QUANTITY': 5,
      'PRODUCT TYPE': 'Jewelry',
      'IMAGE_URL': 'https://example.com/necklace1.jpg',
      'THUMBNAIL': 'https://example.com/necklace-thumb.jpg',
      'DELIVERY TYPE': 'Despatches in 5 working days',
      'DISPATCHES IN DAYS': 5
    }
  ];

  // Create instruction sheet
  const instructions = [
    ['PRODUCT IMPORT TEMPLATE - INSTRUCTIONS'],
    [''],
    ['REQUIRED FIELDS (must be filled):'],
    ['- PRODUCT: Product name (e.g., "Diamond Ring")'],
    ['- COST PRICE: Cost price in your currency'],
    ['- RETAIL PRICE: Selling price in your currency'],
    ['- STOCK QUANTITY: Number of items in stock (use 0 for out of stock)'],
    [''],
    ['OPTIONAL FIELDS:'],
    ['- CERT/SKU: Unique product identifier or certificate number'],
    ['- CATEGORY: Product category (e.g., Ring, Necklace, Bracelet)'],
    ['- DESCRIPTION: Detailed product description'],
    ['- METAL TYPE: Type of metal (e.g., Gold, Silver, Platinum)'],
    ['- GEMSTONE: Type of gemstone (e.g., Diamond, Ruby, Sapphire)'],
    ['- WEIGHT (grams): Total weight in grams'],
    ['- NET WEIGHT: Net weight after deductions'],
    ['- DIAMOND WEIGHT: Total diamond weight in carats'],
    ['- D WT 1, D WT 2: Diamond weight breakdowns'],
    ['- DIAMOND COLOR: Diamond color grade (e.g., D, E, F)'],
    ['- COLOR: Product color (e.g., Yellow, White)'],
    ['- CLARITY: Diamond clarity (e.g., VS1, VVS1, IF)'],
    ['- POINTER DIAMOND: Diamond pointer size'],
    ['- PER CARAT PRICE: Price per carat for diamonds'],
    ['- D RATE 1: Diamond rate 1'],
    ['- D VALUE: Total diamond value'],
    ['- GOLD PER GRAM PRICE: Gold price per gram'],
    ['- PURITY FRACTION USED: Metal purity (e.g., 0.916 for 22K, 0.75 for 18K)'],
    ['- MKG: Making charges per gram'],
    ['- CERTIFICATION COST: Cost of certification'],
    ['- GEMSTONE COST: Additional gemstone costs'],
    ['- TOTAL USD: Price in USD'],
    ['- PRODUCT TYPE: Type of product'],
    [''],
    ['IMAGE HANDLING:'],
    ['- IMAGE_URL: Can contain up to 3 URLs separated by | (pipe)'],
    ['  Example: https://example.com/img1.jpg|https://example.com/img2.jpg|https://example.com/img3.jpg'],
    ['- THUMBNAIL: Separate thumbnail URL (optional)'],
    ['- All image URLs must start with http:// or https://'],
    [''],
    ['DELIVERY INFORMATION:'],
    ['- DELIVERY TYPE: Either "immediate delivery" or "Despatches in X working days"'],
    ['  Examples: "immediate delivery", "Despatches in 3 working days", "Despatches in 10 working days"'],
    ['- DISPATCHES IN DAYS: Number of working days (leave empty for immediate delivery)'],
    ['  Examples: Leave empty for immediate, or enter 3, 5, 7, 10, etc.'],
    [''],
    ['NOTES:'],
    ['- Delete these instruction rows before importing'],
    ['- Keep the header row (row with column names)'],
    ['- Fill in your product data starting from row 2'],
    ['- You can add multiple products (one per row)'],
    ['- Save as .xlsx or .xls format'],
    ['- If a product with the same SKU exists, it will be updated'],
    ['- New products will be created automatically']
  ];

  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Add instructions sheet
  const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
  
  // Set column widths for instructions
  wsInstructions['!cols'] = [{ wch: 80 }];
  
  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

  // Add sample data sheet
  const wsData = XLSX.utils.json_to_sheet(sampleData);
  
  // Set column widths for data sheet
  wsData['!cols'] = [
    { wch: 20 }, // PRODUCT
    { wch: 12 }, // CERT
    { wch: 15 }, // CATEGORY
    { wch: 30 }, // DESCRIPTION
    { wch: 12 }, // METAL TYPE
    { wch: 12 }, // GEMSTONE
    { wch: 12 }, // WEIGHT
    { wch: 12 }, // NET WEIGHT
    { wch: 15 }, // DIAMOND WEIGHT
    { wch: 10 }, // D WT 1
    { wch: 10 }, // D WT 2
    { wch: 15 }, // DIAMOND COLOR
    { wch: 12 }, // COLOR
    { wch: 12 }, // CLARITY
    { wch: 15 }, // POINTER DIAMOND
    { wch: 15 }, // PER CARAT PRICE
    { wch: 12 }, // D RATE 1
    { wch: 12 }, // D VALUE
    { wch: 18 }, // GOLD PER GRAM PRICE
    { wch: 18 }, // PURITY FRACTION USED
    { wch: 10 }, // MKG
    { wch: 18 }, // CERTIFICATION COST
    { wch: 15 }, // GEMSTONE COST
    { wch: 12 }, // COST PRICE
    { wch: 12 }, // RETAIL PRICE
    { wch: 12 }, // TOTAL
    { wch: 12 }, // TOTAL USD
    { wch: 15 }, // STOCK QUANTITY
    { wch: 15 }, // PRODUCT TYPE
    { wch: 50 }, // IMAGE_URL
    { wch: 50 }, // THUMBNAIL
    { wch: 15 }, // DELIVERY TYPE
    { wch: 15 }  // DELIVERY DATE
  ];
  
  XLSX.utils.book_append_sheet(wb, wsData, 'Products');

  // Generate and download
  XLSX.writeFile(wb, 'product_import_template.xlsx');
};
