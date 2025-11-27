import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface VendorBranding {
  name?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  tagline?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface LineItem {
  id: string;
  item_name: string;
  description: string;
  image_url: string;
  diamond_weight: number;
  diamond_per_carat_price: number;
  diamond_color: string;
  diamond_clarity: string;
  diamond_cut: string;
  diamond_certification: string;
  gemstone_weight: number;
  gemstone_type: string;
  gemstone_color: string;
  gemstone_clarity: string;
  net_weight: number;
  gross_weight: number;
  purity_fraction: number;
  diamond_cost: number;
  gemstone_cost: number;
  gold_cost: number;
  making_charges: number;
  certification_cost: number;
  cad_design_charges: number;
  camming_charges: number;
  subtotal: number;
  weight_mode?: 'gross' | 'net';
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  paymentDueDate?: string;
  paymentTerms?: string;
  estimateName: string;
  status: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  customerGSTIN?: string;
  vendorGSTIN?: string;
  netWeight: number;
  grossWeight?: number;
  purityFraction: number;
  goldRate24k: number;
  makingCharges: number;
  cadDesignCharges: number;
  cammingCharges: number;
  certificationCost: number;
  diamondCost: number;
  gemstoneCost: number;
  goldCost: number;
  totalCost: number;
  profitMargin: number;
  finalSellingPrice: number;
  sgstPercentage?: number;
  cgstPercentage?: number;
  sgstAmount?: number;
  cgstAmount?: number;
  shippingCharges?: number;
  exchangeRate?: number;
  grandTotal?: number;
  notes?: string;
  invoiceNotes?: string;
  details?: any;
  vendorBranding?: VendorBranding;
  template?: 'detailed' | 'summary' | 'minimal' | 'traditional' | 'modern' | 'luxury';
  lineItems?: LineItem[];
}

type InvoiceTemplate = 'detailed' | 'summary' | 'minimal' | 'traditional' | 'modern' | 'luxury';

export const generateInvoicePDF = (data: InvoiceData) => {
  const template = data.template || 'detailed';
  
  switch (template) {
    case 'summary':
      return generateSummaryInvoice(data);
    case 'minimal':
      return generateMinimalInvoice(data);
    case 'traditional':
      return generateTraditionalInvoice(data);
    case 'modern':
      return generateModernInvoice(data);
    case 'luxury':
      return generateLuxuryInvoice(data);
    default:
      return generateDetailedInvoice(data);
  }
};

const generateDetailedInvoice = (data: InvoiceData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Parse brand colors or use defaults
  const primaryColor = data.vendorBranding?.primaryColor || '#4F46E5';
  const secondaryColor = data.vendorBranding?.secondaryColor || '#8B5CF6';
  
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 79, g: 70, b: 229 };
  };
  
  const primaryRgb = hexToRgb(primaryColor);
  const secondaryRgb = hexToRgb(secondaryColor);
  
  // Header with brand color
  doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Add logo placeholder
  if (data.vendorBranding?.logo) {
    try {
      doc.setFillColor(255, 255, 255);
      doc.rect(14, 8, 20, 20, 'F');
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('LOGO', 24, 19, { align: 'center' });
    } catch (error) {
      console.error('Error adding logo:', error);
    }
  }
  
  // Business name and INVOICE title
  doc.setFontSize(data.vendorBranding?.name ? 20 : 28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  const titleY = data.vendorBranding?.logo ? 20 : 18;
  if (data.vendorBranding?.name) {
    doc.text(data.vendorBranding.name.toUpperCase(), pageWidth / 2, titleY, { align: 'center' });
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth / 2, titleY + 8, { align: 'center' });
  } else {
    doc.text('INVOICE', pageWidth / 2, titleY, { align: 'center' });
  }
  
  // Tagline
  if (data.vendorBranding?.tagline) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text(data.vendorBranding.tagline, pageWidth / 2, 35, { align: 'center' });
  }
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Vendor contact info (right side)
  let headerY = 50;
  if (data.vendorBranding?.email || data.vendorBranding?.phone || data.vendorBranding?.address || data.vendorGSTIN) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    
    if (data.vendorGSTIN) {
      doc.text(`GSTIN: ${data.vendorGSTIN}`, pageWidth - 14, headerY, { align: 'right' });
      headerY += 4;
    }
    if (data.vendorBranding.phone) {
      doc.text(`📞 ${data.vendorBranding.phone}`, pageWidth - 14, headerY, { align: 'right' });
      headerY += 4;
    }
    if (data.vendorBranding.email) {
      doc.text(`✉ ${data.vendorBranding.email}`, pageWidth - 14, headerY, { align: 'right' });
      headerY += 4;
    }
    if (data.vendorBranding.address) {
      const splitAddress = doc.splitTextToSize(data.vendorBranding.address, 70);
      doc.text(splitAddress, pageWidth - 14, headerY, { align: 'right' });
    }
  }
  
  doc.setTextColor(0, 0, 0);
  
  // Invoice Details (left side)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Invoice No: ${data.invoiceNumber}`, 14, 62);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice Date: ${new Date(data.invoiceDate).toLocaleDateString()}`, 14, 67);
  if (data.paymentDueDate) {
    doc.text(`Due Date: ${new Date(data.paymentDueDate).toLocaleDateString()}`, 14, 72);
  }
  if (data.paymentTerms) {
    doc.text(`Payment Terms: ${data.paymentTerms}`, 14, 77);
  }
  
  // Customer Details Section
  let customerSectionY = 87;
  if (data.customerName) {
    doc.setFillColor(240, 240, 245);
    doc.rect(14, customerSectionY, pageWidth - 28, 35, 'F');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.text('BILL TO', 18, customerSectionY + 8);
    doc.setTextColor(0, 0, 0);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    let yPos = customerSectionY + 16;
    doc.text(`${data.customerName}`, 18, yPos);
    if (data.customerGSTIN) {
      yPos += 5;
      doc.text(`GSTIN: ${data.customerGSTIN}`, 18, yPos);
    }
    if (data.customerPhone) {
      yPos += 5;
      doc.text(`Phone: ${data.customerPhone}`, 18, yPos);
    }
    if (data.customerEmail) {
      yPos += 5;
      doc.text(`Email: ${data.customerEmail}`, 18, yPos);
    }
    if (data.customerAddress) {
      yPos += 5;
      const splitAddress = doc.splitTextToSize(`Address: ${data.customerAddress}`, pageWidth - 40);
      doc.text(splitAddress, 18, yPos);
    }
    customerSectionY += 40;
  }
  
  // Line Items Section (if provided)
  let currentY = customerSectionY + 5;
  
  if (data.lineItems && data.lineItems.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.text('INVOICE LINE ITEMS', 14, currentY);
    doc.setTextColor(0, 0, 0);
    currentY += 5;
    
    // Render each line item
    data.lineItems.forEach((item, index) => {
      // Check if we need a new page
      if (currentY > doc.internal.pageSize.getHeight() - 50) {
        doc.addPage();
        currentY = 20;
      }
      
      // Item header with image
      const itemStartY = currentY;
      
      if (item.image_url) {
        try {
          doc.setFillColor(245, 245, 250);
          doc.rect(14, currentY, 30, 30, 'F');
          doc.setFontSize(7);
          doc.setTextColor(150, 150, 150);
          doc.text('[Image]', 29, currentY + 17, { align: 'center' });
        } catch (error) {
          console.error('Error adding item image:', error);
        }
      }
      
      // Item details
      const detailsX = item.image_url ? 48 : 18;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`${index + 1}. ${item.item_name}`, detailsX, currentY + 5);
      
      if (item.description) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        const descLines = doc.splitTextToSize(item.description, pageWidth - detailsX - 20);
        doc.text(descLines, detailsX, currentY + 11);
      }
      
      currentY = Math.max(currentY + 35, itemStartY + (item.image_url ? 35 : 25));
      
      // Item specifications table
      const itemSpecs: any[] = [
        ['Gross Weight', `${item.gross_weight} g`],
        ['Net Weight', `${item.net_weight} g`],
      ];
      
      // Add diamond details if present
      if (item.diamond_weight > 0) {
        itemSpecs.push(['Diamond Weight', `${item.diamond_weight} ct`]);
        if (item.diamond_color) {
          itemSpecs.push(['Diamond Color', item.diamond_color]);
        }
        if (item.diamond_clarity) {
          itemSpecs.push(['Diamond Clarity', item.diamond_clarity]);
        }
        if (item.diamond_cut) {
          itemSpecs.push(['Diamond Cut', item.diamond_cut]);
        }
        if (item.diamond_certification) {
          itemSpecs.push(['Diamond Certification', item.diamond_certification]);
        }
      }
      
      // Add gemstone details if present
      if (item.gemstone_weight > 0) {
        itemSpecs.push(['Gemstone Weight', `${item.gemstone_weight} ct`]);
        if (item.gemstone_type) {
          itemSpecs.push(['Gemstone Type', item.gemstone_type]);
        }
        if (item.gemstone_color) {
          itemSpecs.push(['Gemstone Color', item.gemstone_color]);
        }
        if (item.gemstone_clarity) {
          itemSpecs.push(['Gemstone Clarity', item.gemstone_clarity]);
        }
      }
      
      autoTable(doc, {
        startY: currentY,
        body: itemSpecs,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 40 },
          1: { cellWidth: 'auto' },
        },
        margin: { left: 18, right: 14 },
      });
      
      currentY = (doc as any).lastAutoTable.finalY + 2;
      
      // Item cost breakdown
      const itemCosts = [
        ['Gold Cost', `₹${item.gold_cost.toFixed(2)}`],
        ['Making Charges', `₹${item.making_charges.toFixed(2)}`],
        ['CAD Design', `₹${item.cad_design_charges.toFixed(2)}`],
        ['Camming', `₹${item.camming_charges.toFixed(2)}`],
        ['Certification', `₹${item.certification_cost.toFixed(2)}`],
        ['Diamond Cost', `₹${item.diamond_cost.toFixed(2)}`],
        ['Gemstone Cost', `₹${item.gemstone_cost.toFixed(2)}`],
      ];
      
      autoTable(doc, {
        startY: currentY,
        body: itemCosts,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 'auto', halign: 'right' },
        },
        margin: { left: 18, right: 14 },
      });
      
      currentY = (doc as any).lastAutoTable.finalY + 3;
      
      // Item subtotal
      doc.setFillColor(245, 245, 250);
      doc.rect(14, currentY, pageWidth - 28, 8, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Item Subtotal:', 18, currentY + 5.5);
      doc.text(`₹${item.subtotal.toFixed(2)}`, pageWidth - 18, currentY + 5.5, { align: 'right' });
      
      currentY += 15;
    });
  } else {
    // Original single-item specifications (fallback)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.text('PRODUCT SPECIFICATIONS', 14, currentY);
    doc.setTextColor(0, 0, 0);
  
  const specsData = [];
  if (data.grossWeight) {
    specsData.push(['Gross Weight', `${data.grossWeight} grams`]);
  }
  if (data.netWeight) {
    specsData.push(['Net Weight', `${data.netWeight} grams`]);
  }
  if (data.purityFraction) {
    specsData.push(['Gold Purity', `${(data.purityFraction * 100).toFixed(0)}%`]);
  }
  if (data.details?.diamond_type) {
    specsData.push(['Diamond Type', data.details.diamond_type]);
  }
  if (data.details?.diamond_shape) {
    specsData.push(['Diamond Shape', data.details.diamond_shape]);
  }
  if (data.details?.diamond_weight) {
    specsData.push(['Diamond Weight', `${data.details.diamond_weight} carats`]);
  }
  if (data.details?.diamond_color) {
    specsData.push(['Diamond Color', data.details.diamond_color]);
  }
  if (data.details?.diamond_clarity) {
    specsData.push(['Diamond Clarity', data.details.diamond_clarity]);
  }
  if (data.details?.diamond_certification && data.details.diamond_certification !== 'none') {
    specsData.push(['Certification', data.details.diamond_certification.toUpperCase()]);
  }
  if (data.details?.gemstone_weight) {
    specsData.push(['Gemstone Weight', `${data.details.gemstone_weight} carats`]);
  }
  
  if (specsData.length > 0) {
    autoTable(doc, {
      startY: currentY + 5,
      body: specsData,
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 'auto' },
      },
      margin: { left: 14, right: 14 },
    });
    currentY = (doc as any).lastAutoTable.finalY + 15;
  } else {
    currentY += 10;
  }
  }
  
  // Cost Breakdown Table (only if no line items)
  if (!data.lineItems || data.lineItems.length === 0) {
  const costStartY = currentY;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.text('COST BREAKDOWN', 14, costStartY);
  doc.setTextColor(0, 0, 0);
  
  const tableData = [
    ['Gold Cost', `₹${data.goldCost.toFixed(2)}`],
    ['Making Charges', `₹${data.makingCharges.toFixed(2)}`],
    ['CAD Design Charges', `₹${data.cadDesignCharges.toFixed(2)}`],
    ['Camming Charges', `₹${data.cammingCharges.toFixed(2)}`],
    ['Certification Cost', `₹${data.certificationCost.toFixed(2)}`],
    ['Diamond Cost', `₹${data.diamondCost.toFixed(2)}`],
    ['Gemstone Cost', `₹${data.gemstoneCost.toFixed(2)}`],
  ];
  
  autoTable(doc, {
    startY: costStartY + 5,
    head: [['Description', 'Amount']],
    body: tableData,
    theme: 'striped',
    headStyles: { 
      fillColor: [primaryRgb.r, primaryRgb.g, primaryRgb.b],
      fontSize: 11,
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: [248, 248, 255] },
    margin: { left: 14, right: 14 },
  });
  
  currentY = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Total Section
  const finalY = currentY;
  
  doc.setFillColor(245, 245, 250);
  doc.rect(14, finalY, pageWidth - 28, 35, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Subtotal:`, 18, finalY + 8);
  doc.text(`₹${data.totalCost.toFixed(2)}`, pageWidth - 18, finalY + 8, { align: 'right' });
  
  doc.text(`Profit Margin (${data.profitMargin}%):`, 18, finalY + 15);
  doc.text(`₹${((data.finalSellingPrice - data.totalCost)).toFixed(2)}`, pageWidth - 18, finalY + 15, { align: 'right' });
  
  // Draw line
  doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.setLineWidth(0.5);
  doc.line(18, finalY + 20, pageWidth - 18, finalY + 20);
  
  doc.setFontSize(14);
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.text(`TOTAL AMOUNT DUE:`, 18, finalY + 28);
  doc.text(`₹${data.finalSellingPrice.toFixed(2)}`, pageWidth - 18, finalY + 28, { align: 'right' });
  doc.setTextColor(0, 0, 0);
  
  // Invoice Notes Section
  if (data.invoiceNotes) {
    const notesY = finalY + 45;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.text('INVOICE NOTES', 14, notesY);
    doc.setTextColor(0, 0, 0);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(data.invoiceNotes, pageWidth - 28);
    doc.text(splitNotes, 14, notesY + 6);
  }
  
  // Payment Instructions
  const paymentY = doc.internal.pageSize.getHeight() - 50;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.text('PAYMENT INFORMATION', 14, paymentY);
  doc.setTextColor(0, 0, 0);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Please make payment within the specified terms.', 14, paymentY + 5);
  doc.text('For payment inquiries, contact us at the details above.', 14, paymentY + 9);
  
  // Terms & Conditions
  const termsY = doc.internal.pageSize.getHeight() - 30;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Terms & Conditions:', 14, termsY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('• Payment must be received by the due date to avoid late fees.', 14, termsY + 4);
  doc.text('• All prices are final and include applicable taxes unless otherwise stated.', 14, termsY + 7);
  doc.text('• This invoice is valid for the amounts and items listed above.', 14, termsY + 10);
  
  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 10;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Invoice generated on ${new Date().toLocaleString()}`,
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );
  
  // Save PDF
  const fileName = `Invoice_${data.invoiceNumber.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf`;
  doc.save(fileName);
};

const generateSummaryInvoice = (data: InvoiceData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  const primaryColor = data.vendorBranding?.primaryColor || '#4F46E5';
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 79, g: 70, b: 229 };
  };
  const primaryRgb = hexToRgb(primaryColor);
  
  // Header
  doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('INVOICE', pageWidth / 2, 22, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  
  // Invoice info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Invoice: ${data.invoiceNumber}`, 14, 50);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${new Date(data.invoiceDate).toLocaleDateString()}`, 14, 56);
  if (data.paymentDueDate) {
    doc.text(`Due: ${new Date(data.paymentDueDate).toLocaleDateString()}`, 14, 62);
  }
  
  // Customer info
  if (data.customerName) {
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 14, 75);
    doc.setFont('helvetica', 'normal');
    doc.text(data.customerName, 14, 81);
    if (data.customerPhone) doc.text(data.customerPhone, 14, 87);
  }
  
  // Summary table
  const summaryData = [
    ['Gold Cost', `₹${data.goldCost.toFixed(2)}`],
    ['Making & Design', `₹${(data.makingCharges + data.cadDesignCharges + data.cammingCharges).toFixed(2)}`],
    ['Stones & Gems', `₹${(data.diamondCost + data.gemstoneCost).toFixed(2)}`],
    ['Certification', `₹${data.certificationCost.toFixed(2)}`],
  ];
  
  autoTable(doc, {
    startY: 100,
    head: [['Item', 'Amount']],
    body: summaryData,
    theme: 'plain',
    headStyles: { fillColor: [primaryRgb.r, primaryRgb.g, primaryRgb.b], textColor: 255 },
    margin: { left: 14, right: 14 },
  });
  
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Total
  doc.setFillColor(245, 245, 250);
  doc.rect(14, finalY, pageWidth - 28, 20, 'F');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.text(`TOTAL: ₹${data.finalSellingPrice.toFixed(2)}`, pageWidth - 18, finalY + 13, { align: 'right' });
  
  doc.setTextColor(0, 0, 0);
  
  const fileName = `Invoice_${data.invoiceNumber.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf`;
  doc.save(fileName);
};

const generateMinimalInvoice = (data: InvoiceData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  const primaryColor = data.vendorBranding?.primaryColor || '#4F46E5';
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 79, g: 70, b: 229 };
  };
  const primaryRgb = hexToRgb(primaryColor);
  
  // Simple header
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.text('INVOICE', pageWidth / 2, 30, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  // Basic info
  let yPos = 50;
  doc.text(`Invoice Number: ${data.invoiceNumber}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;
  doc.text(`Date: ${new Date(data.invoiceDate).toLocaleDateString()}`, pageWidth / 2, yPos, { align: 'center' });
  
  if (data.customerName) {
    yPos += 20;
    doc.setFont('helvetica', 'bold');
    doc.text(`Customer: ${data.customerName}`, pageWidth / 2, yPos, { align: 'center' });
  }
  
  // Total amount - large and centered
  yPos += 40;
  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.text(`₹${data.finalSellingPrice.toFixed(2)}`, pageWidth / 2, yPos, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPos += 10;
  doc.text('Total Amount Due', pageWidth / 2, yPos, { align: 'center' });
  
  if (data.paymentDueDate) {
    yPos += 15;
    doc.setFontSize(11);
    doc.text(`Payment Due: ${new Date(data.paymentDueDate).toLocaleDateString()}`, pageWidth / 2, yPos, { align: 'center' });
  }
  
  const fileName = `Invoice_${data.invoiceNumber.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf`;
  doc.save(fileName);
};

// Traditional Template - Classic serif style with ornate borders
const generateTraditionalInvoice = (data: InvoiceData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  const primaryColor = data.vendorBranding?.primaryColor || '#2C1810';
  const goldAccent = '#8B7355';
  
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 44, g: 24, b: 16 };
  };
  
  const primaryRgb = hexToRgb(primaryColor);
  const goldRgb = hexToRgb(goldAccent);
  
  // Ornate border
  doc.setDrawColor(goldRgb.r, goldRgb.g, goldRgb.b);
  doc.setLineWidth(2);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
  doc.setLineWidth(0.5);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24);
  
  // Decorative corner elements
  doc.setFillColor(goldRgb.r, goldRgb.g, goldRgb.b);
  [
    [15, 15], [pageWidth - 15, 15],
    [15, pageHeight - 15], [pageWidth - 15, pageHeight - 15]
  ].forEach(([x, y]) => {
    doc.circle(x, y, 2, 'F');
  });
  
  // Header with business name
  let yPos = 30;
  doc.setFontSize(32);
  doc.setFont('times', 'bold');
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.text(data.vendorBranding?.name || 'FINE JEWELERS', pageWidth / 2, yPos, { align: 'center' });
  
  // Tagline with decorative line
  if (data.vendorBranding?.tagline) {
    yPos += 8;
    doc.setFontSize(11);
    doc.setFont('times', 'italic');
    doc.setTextColor(goldRgb.r, goldRgb.g, goldRgb.b);
    doc.text(data.vendorBranding.tagline, pageWidth / 2, yPos, { align: 'center' });
  }
  
  // Decorative separator line
  yPos += 10;
  doc.setDrawColor(goldRgb.r, goldRgb.g, goldRgb.b);
  doc.setLineWidth(0.5);
  const lineMargin = 40;
  doc.line(lineMargin, yPos, pageWidth - lineMargin, yPos);
  doc.circle(pageWidth / 2, yPos, 1, 'F');
  
  // INVOICE title
  yPos += 12;
  doc.setFontSize(24);
  doc.setFont('times', 'bold');
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.text('INVOICE', pageWidth / 2, yPos, { align: 'center' });
  
  // Invoice details box
  yPos += 15;
  doc.setFillColor(250, 248, 245);
  doc.rect(20, yPos, (pageWidth - 40) / 2 - 5, 30, 'F');
  
  doc.setFontSize(10);
  doc.setFont('times', 'bold');
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.text('Invoice Number:', 25, yPos + 8);
  doc.setFont('times', 'normal');
  doc.text(data.invoiceNumber, 25, yPos + 14);
  
  doc.setFont('times', 'bold');
  doc.text('Date:', 25, yPos + 20);
  doc.setFont('times', 'normal');
  doc.text(new Date(data.invoiceDate).toLocaleDateString(), 25, yPos + 26);
  
  // Vendor contact box
  doc.setFillColor(250, 248, 245);
  doc.rect(pageWidth / 2 + 5, yPos, (pageWidth - 40) / 2 - 5, 30, 'F');
  
  doc.setFont('times', 'bold');
  let contactY = yPos + 8;
  if (data.vendorBranding?.phone) {
    doc.text('Tel:', pageWidth / 2 + 10, contactY);
    doc.setFont('times', 'normal');
    doc.text(data.vendorBranding.phone, pageWidth / 2 + 25, contactY);
    contactY += 6;
  }
  if (data.vendorBranding?.email) {
    doc.setFont('times', 'bold');
    doc.text('Email:', pageWidth / 2 + 10, contactY);
    doc.setFont('times', 'normal');
    const emailText = doc.splitTextToSize(data.vendorBranding.email, 60);
    doc.text(emailText, pageWidth / 2 + 25, contactY);
  }
  
  // Customer details
  yPos += 40;
  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(goldRgb.r, goldRgb.g, goldRgb.b);
  doc.text('BILL TO', 20, yPos);
  
  yPos += 6;
  doc.setDrawColor(goldRgb.r, goldRgb.g, goldRgb.b);
  doc.line(20, yPos, 80, yPos);
  
  yPos += 8;
  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  if (data.customerName) doc.text(data.customerName, 20, yPos);
  if (data.customerPhone) {
    yPos += 5;
    doc.text(data.customerPhone, 20, yPos);
  }
  if (data.customerEmail) {
    yPos += 5;
    doc.text(data.customerEmail, 20, yPos);
  }
  if (data.customerAddress) {
    yPos += 5;
    const addressLines = doc.splitTextToSize(data.customerAddress, 70);
    doc.text(addressLines, 20, yPos);
  }
  
  // Cost breakdown table
  yPos += 25;
  const tableData = [
    ['Gold Cost', '', `₹${data.goldCost.toFixed(2)}`],
    ['Diamond Cost', '', `₹${data.diamondCost.toFixed(2)}`],
    ['Gemstone Cost', '', `₹${data.gemstoneCost.toFixed(2)}`],
    ['Making Charges', '', `₹${data.makingCharges.toFixed(2)}`],
    ['Design & CAD', '', `₹${data.cadDesignCharges.toFixed(2)}`],
    ['Certification', '', `₹${data.certificationCost.toFixed(2)}`],
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [['Description', '', 'Amount']],
    body: tableData,
    theme: 'plain',
    styles: { 
      font: 'times',
      fontSize: 10,
      textColor: [primaryRgb.r, primaryRgb.g, primaryRgb.b],
    },
    headStyles: { 
      fillColor: [goldRgb.r, goldRgb.g, goldRgb.b],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 40, halign: 'right' },
    },
    margin: { left: 20, right: 20 },
  });
  
  // Total section with decorative box
  const totalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setDrawColor(goldRgb.r, goldRgb.g, goldRgb.b);
  doc.setLineWidth(1.5);
  doc.rect(pageWidth - 90, totalY, 70, 20);
  
  doc.setFontSize(14);
  doc.setFont('times', 'bold');
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.text('TOTAL:', pageWidth - 85, totalY + 13);
  doc.text(`₹${data.finalSellingPrice.toFixed(2)}`, pageWidth - 25, totalY + 13, { align: 'right' });
  
  // Payment terms
  const footerY = pageHeight - 35;
  doc.setFontSize(9);
  doc.setFont('times', 'italic');
  doc.setTextColor(goldRgb.r, goldRgb.g, goldRgb.b);
  doc.text('Payment Terms:', 20, footerY);
  doc.setFont('times', 'normal');
  doc.text(data.paymentTerms || 'Net 30', 20, footerY + 5);
  
  if (data.invoiceNotes) {
    doc.text('Notes:', 20, footerY + 12);
    const notes = doc.splitTextToSize(data.invoiceNotes, pageWidth - 45);
    doc.text(notes, 20, footerY + 17);
  }
  
  const fileName = `Invoice_${data.invoiceNumber.replace(/[^a-z0-9]/gi, '_')}_Traditional.pdf`;
  doc.save(fileName);
};

// Modern Template - Clean minimalist design
const generateModernInvoice = (data: InvoiceData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  const primaryColor = data.vendorBranding?.primaryColor || '#000000';
  const accentColor = data.vendorBranding?.secondaryColor || '#6366F1';
  
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };
  
  const primaryRgb = hexToRgb(primaryColor);
  const accentRgb = hexToRgb(accentColor);
  
  // Minimal header with thin accent line
  doc.setDrawColor(accentRgb.r, accentRgb.g, accentRgb.b);
  doc.setLineWidth(3);
  doc.line(0, 25, pageWidth, 25);
  
  // Business name - ultra minimal
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(data.vendorBranding?.name?.toUpperCase() || 'JEWELERS', 20, 15);
  
  // INVOICE - large and minimal
  doc.setFontSize(48);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.text('INVOICE', 20, 50);
  
  // Invoice details - clean alignment
  let yPos = 65;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('NUMBER', 20, yPos);
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.text(data.invoiceNumber, 55, yPos);
  
  yPos += 6;
  doc.setTextColor(100, 100, 100);
  doc.text('DATE', 20, yPos);
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.text(new Date(data.invoiceDate).toLocaleDateString(), 55, yPos);
  
  if (data.paymentDueDate) {
    yPos += 6;
    doc.setTextColor(100, 100, 100);
    doc.text('DUE', 20, yPos);
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.text(new Date(data.paymentDueDate).toLocaleDateString(), 55, yPos);
  }
  
  // Customer info - right aligned
  yPos = 65;
  if (data.customerName) {
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('BILL TO', pageWidth - 20, yPos, { align: 'right' });
    yPos += 6;
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.text(data.customerName, pageWidth - 20, yPos, { align: 'right' });
    if (data.customerEmail) {
      yPos += 5;
      doc.setFontSize(8);
      doc.text(data.customerEmail, pageWidth - 20, yPos, { align: 'right' });
    }
  }
  
  // Items table - ultra clean
  yPos += 25;
  const tableData = [
    ['Gold & Metal Work', `₹${data.goldCost.toFixed(2)}`],
    ['Precious Stones', `₹${(data.diamondCost + data.gemstoneCost).toFixed(2)}`],
    ['Craftsmanship', `₹${data.makingCharges.toFixed(2)}`],
    ['Design & Finishing', `₹${(data.cadDesignCharges + data.cammingCharges).toFixed(2)}`],
    ['Certification', `₹${data.certificationCost.toFixed(2)}`],
  ];
  
  autoTable(doc, {
    startY: yPos,
    body: tableData,
    theme: 'plain',
    styles: { 
      fontSize: 10,
      textColor: [primaryRgb.r, primaryRgb.g, primaryRgb.b],
      cellPadding: { top: 4, bottom: 4, left: 0, right: 0 },
    },
    columnStyles: {
      0: { cellWidth: 130, fontStyle: 'normal' },
      1: { cellWidth: 50, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: 20, right: 20 },
    didDrawCell: (data: any) => {
      // Draw thin separator lines
      if (data.row.index < tableData.length - 1) {
        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.1);
        doc.line(
          data.cell.x,
          data.cell.y + data.cell.height,
          data.cell.x + data.cell.width,
          data.cell.y + data.cell.height
        );
      }
    },
  });
  
  // Total - bold and clean
  const totalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setDrawColor(accentRgb.r, accentRgb.g, accentRgb.b);
  doc.setLineWidth(2);
  doc.line(20, totalY, pageWidth - 20, totalY);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('TOTAL', 20, totalY + 10);
  
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.text(`₹${data.finalSellingPrice.toFixed(2)}`, pageWidth - 20, totalY + 10, { align: 'right' });
  
  // Footer - minimal
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'normal');
  if (data.vendorBranding?.email) {
    doc.text(data.vendorBranding.email, 20, footerY);
  }
  if (data.vendorBranding?.phone) {
    doc.text(data.vendorBranding.phone, pageWidth - 20, footerY, { align: 'right' });
  }
  
  const fileName = `Invoice_${data.invoiceNumber.replace(/[^a-z0-9]/gi, '_')}_Modern.pdf`;
  doc.save(fileName);
};

// Luxury Template - Premium elegant design with gold accents
const generateLuxuryInvoice = (data: InvoiceData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Luxury color palette
  const deepPurple = { r: 25, g: 20, b: 40 };
  const gold = { r: 212, g: 175, b: 55 };
  const cream = { r: 250, g: 248, b: 240 };
  
  // Elegant background
  doc.setFillColor(cream.r, cream.g, cream.b);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Top gold accent bar
  doc.setFillColor(gold.r, gold.g, gold.b);
  doc.rect(0, 0, pageWidth, 8, 'F');
  
  // Ornamental corners
  doc.setDrawColor(gold.r, gold.g, gold.b);
  doc.setLineWidth(1);
  const cornerSize = 15;
  // Top left
  doc.line(15, 15, 15 + cornerSize, 15);
  doc.line(15, 15, 15, 15 + cornerSize);
  // Top right
  doc.line(pageWidth - 15, 15, pageWidth - 15 - cornerSize, 15);
  doc.line(pageWidth - 15, 15, pageWidth - 15, 15 + cornerSize);
  // Bottom left
  doc.line(15, pageHeight - 15, 15 + cornerSize, pageHeight - 15);
  doc.line(15, pageHeight - 15, 15, pageHeight - 15 - cornerSize);
  // Bottom right
  doc.line(pageWidth - 15, pageHeight - 15, pageWidth - 15 - cornerSize, pageHeight - 15);
  doc.line(pageWidth - 15, pageHeight - 15, pageWidth - 15, pageHeight - 15 - cornerSize);
  
  // Business name with luxury styling
  let yPos = 35;
  doc.setFontSize(28);
  doc.setFont('times', 'bold');
  doc.setTextColor(deepPurple.r, deepPurple.g, deepPurple.b);
  doc.text(data.vendorBranding?.name?.toUpperCase() || 'PRESTIGE JEWELERS', pageWidth / 2, yPos, { align: 'center' });
  
  // Tagline with gold
  if (data.vendorBranding?.tagline) {
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont('times', 'italic');
    doc.setTextColor(gold.r, gold.g, gold.b);
    doc.text(data.vendorBranding.tagline, pageWidth / 2, yPos, { align: 'center' });
  }
  
  // Decorative divider
  yPos += 10;
  doc.setDrawColor(gold.r, gold.g, gold.b);
  doc.setLineWidth(0.5);
  doc.line(60, yPos, pageWidth - 60, yPos);
  // Small diamond shapes
  doc.setFillColor(gold.r, gold.g, gold.b);
  [70, pageWidth / 2, pageWidth - 70].forEach(x => {
    doc.circle(x, yPos, 0.8, 'F');
  });
  
  // INVOICE title
  yPos += 12;
  doc.setFontSize(20);
  doc.setFont('times', 'bold');
  doc.setTextColor(deepPurple.r, deepPurple.g, deepPurple.b);
  doc.text('INVOICE', pageWidth / 2, yPos, { align: 'center' });
  
  // Elegant info boxes
  yPos += 15;
  // Left box - Invoice details
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(gold.r, gold.g, gold.b);
  doc.setLineWidth(0.5);
  doc.rect(25, yPos, 75, 28, 'FD');
  
  doc.setFontSize(9);
  doc.setFont('times', 'bold');
  doc.setTextColor(gold.r, gold.g, gold.b);
  doc.text('INVOICE NO.', 30, yPos + 7);
  doc.setFont('times', 'normal');
  doc.setTextColor(deepPurple.r, deepPurple.g, deepPurple.b);
  doc.text(data.invoiceNumber, 30, yPos + 12);
  
  doc.setFont('times', 'bold');
  doc.setTextColor(gold.r, gold.g, gold.b);
  doc.text('DATE', 30, yPos + 19);
  doc.setFont('times', 'normal');
  doc.setTextColor(deepPurple.r, deepPurple.g, deepPurple.b);
  doc.text(new Date(data.invoiceDate).toLocaleDateString(), 30, yPos + 24);
  
  // Right box - Customer details
  doc.setFillColor(255, 255, 255);
  doc.rect(pageWidth - 100, yPos, 75, 28, 'FD');
  
  doc.setFont('times', 'bold');
  doc.setTextColor(gold.r, gold.g, gold.b);
  doc.text('ESTEEMED CLIENT', pageWidth - 95, yPos + 7);
  doc.setFont('times', 'normal');
  doc.setTextColor(deepPurple.r, deepPurple.g, deepPurple.b);
  if (data.customerName) {
    doc.text(data.customerName, pageWidth - 95, yPos + 13);
  }
  if (data.customerPhone) {
    doc.setFontSize(8);
    doc.text(data.customerPhone, pageWidth - 95, yPos + 18);
  }
  if (data.customerEmail) {
    doc.setFontSize(7);
    const emailText = doc.splitTextToSize(data.customerEmail, 70);
    doc.text(emailText, pageWidth - 95, yPos + 23);
  }
  
  // Itemized costs table
  yPos += 40;
  const tableData = [
    ['Fine Gold Workmanship', `₹${data.goldCost.toFixed(2)}`],
    ['Precious Diamond Selection', `₹${data.diamondCost.toFixed(2)}`],
    ['Gemstone Accents', `₹${data.gemstoneCost.toFixed(2)}`],
    ['Master Craftsmanship', `₹${data.makingCharges.toFixed(2)}`],
    ['Bespoke Design Services', `₹${data.cadDesignCharges.toFixed(2)}`],
    ['Finishing & Polish', `₹${data.cammingCharges.toFixed(2)}`],
    ['Authentication Certificate', `₹${data.certificationCost.toFixed(2)}`],
  ];
  
  autoTable(doc, {
    startY: yPos,
    body: tableData,
    theme: 'plain',
    styles: { 
      font: 'times',
      fontSize: 10,
      textColor: [deepPurple.r, deepPurple.g, deepPurple.b],
      cellPadding: { top: 3, bottom: 3 },
    },
    columnStyles: {
      0: { cellWidth: 130, fontStyle: 'italic' },
      1: { cellWidth: 45, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: 25, right: 25 },
    didDrawCell: (data: any) => {
      doc.setDrawColor(gold.r, gold.g, gold.b);
      doc.setLineWidth(0.1);
      doc.line(
        data.cell.x,
        data.cell.y + data.cell.height,
        data.cell.x + data.cell.width,
        data.cell.y + data.cell.height
      );
    },
  });
  
  // Grand total section with luxury styling
  const totalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFillColor(deepPurple.r, deepPurple.g, deepPurple.b);
  doc.rect(pageWidth - 110, totalY, 85, 22, 'F');
  
  doc.setFontSize(11);
  doc.setFont('times', 'bold');
  doc.setTextColor(gold.r, gold.g, gold.b);
  doc.text('TOTAL INVESTMENT', pageWidth - 105, totalY + 8);
  
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(`₹${data.finalSellingPrice.toFixed(2)}`, pageWidth - 105, totalY + 17);
  
  // Elegant footer
  const footerY = pageHeight - 30;
  doc.setDrawColor(gold.r, gold.g, gold.b);
  doc.setLineWidth(0.3);
  doc.line(25, footerY, pageWidth - 25, footerY);
  
  doc.setFontSize(8);
  doc.setFont('times', 'italic');
  doc.setTextColor(gold.r, gold.g, gold.b);
  doc.text('Thank you for choosing exceptional luxury', pageWidth / 2, footerY + 6, { align: 'center' });
  
  if (data.vendorBranding?.phone || data.vendorBranding?.email) {
    doc.setFontSize(7);
    doc.setTextColor(deepPurple.r, deepPurple.g, deepPurple.b);
    let contactText = '';
    if (data.vendorBranding.phone) contactText += data.vendorBranding.phone;
    if (data.vendorBranding.phone && data.vendorBranding.email) contactText += ' • ';
    if (data.vendorBranding.email) contactText += data.vendorBranding.email;
    doc.text(contactText, pageWidth / 2, footerY + 12, { align: 'center' });
  }
  
  const fileName = `Invoice_${data.invoiceNumber.replace(/[^a-z0-9]/gi, '_')}_Luxury.pdf`;
  doc.save(fileName);
};
