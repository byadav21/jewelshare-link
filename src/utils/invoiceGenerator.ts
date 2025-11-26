import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface VendorBranding {
  businessName?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  tagline?: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface InvoiceData {
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
  notes?: string;
  invoiceNotes?: string;
  details?: any;
  vendorBranding?: VendorBranding;
}

export const generateInvoicePDF = (data: InvoiceData) => {
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
  if (data.vendorBranding?.logoUrl) {
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
  doc.setFontSize(data.vendorBranding?.businessName ? 20 : 28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  const titleY = data.vendorBranding?.logoUrl ? 20 : 18;
  if (data.vendorBranding?.businessName) {
    doc.text(data.vendorBranding.businessName.toUpperCase(), pageWidth / 2, titleY, { align: 'center' });
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
  if (data.vendorBranding?.email || data.vendorBranding?.phone || data.vendorBranding?.address) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    
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
  
  // Product Specifications
  const specsStartY = customerSectionY + 5;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.text('PRODUCT SPECIFICATIONS', 14, specsStartY);
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
    (doc as any).autoTable({
      startY: specsStartY + 5,
      body: specsData,
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 'auto' },
      },
      margin: { left: 14, right: 14 },
    });
  }
  
  // Cost Breakdown Table
  const costStartY = specsData.length > 0 ? (doc as any).lastAutoTable.finalY + 15 : specsStartY + 10;
  
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
  
  (doc as any).autoTable({
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
  
  // Total Section
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
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
