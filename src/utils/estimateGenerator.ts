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

interface EstimateData {
  estimateName: string;
  estimateDate: string;
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
  estimatedCompletionDate?: string;
  notes?: string;
  details?: any;
  vendorBranding?: VendorBranding;
}

export const generateEstimatePDF = (data: EstimateData) => {
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
  
  // Professional gradient header with accent
  doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Accent stripe
  doc.setFillColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
  doc.rect(0, 43, pageWidth, 2, 'F');
  
  // Logo container with professional styling
  if (data.vendorBranding?.logoUrl) {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(15, 8, 28, 28, 3, 3, 'F');
    doc.setDrawColor(230, 230, 235);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, 8, 28, 28, 3, 3, 'S');
    
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 170);
    doc.text('LOGO', 29, 23, { align: 'center' });
  }
  
  // Business name with enhanced typography
  const nameStartX = data.vendorBranding?.logoUrl ? 48 : pageWidth / 2;
  const nameAlign = data.vendorBranding?.logoUrl ? 'left' : 'center';
  
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  
  if (data.vendorBranding?.businessName) {
    doc.text(data.vendorBranding.businessName.toUpperCase(), nameStartX, 20, { align: nameAlign });
    
    if (data.vendorBranding?.tagline) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(240, 245, 250);
      doc.text(data.vendorBranding.tagline, nameStartX, 26, { align: nameAlign });
    }
    
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('MANUFACTURING ESTIMATE', nameStartX, 34, { align: nameAlign });
  } else {
    doc.setFontSize(22);
    doc.text('MANUFACTURING ESTIMATE', pageWidth / 2, 26, { align: 'center' });
  }
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Vendor contact info card (right side)
  let headerY = 53;
  if (data.vendorBranding?.email || data.vendorBranding?.phone || data.vendorBranding?.address) {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(pageWidth - 75, headerY, 61, 28, 2, 2, 'F');
    doc.setDrawColor(220, 225, 230);
    doc.setLineWidth(0.5);
    doc.roundedRect(pageWidth - 75, headerY, 61, 28, 2, 2, 'S');
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(70, 70, 80);
    
    let contactY = headerY + 5;
    if (data.vendorBranding.phone) {
      doc.text(`Tel: ${data.vendorBranding.phone}`, pageWidth - 71, contactY);
      contactY += 4.5;
    }
    if (data.vendorBranding.email) {
      doc.text(`Email: ${data.vendorBranding.email}`, pageWidth - 71, contactY);
      contactY += 4.5;
    }
    if (data.vendorBranding.address && contactY < headerY + 24) {
      const splitAddress = doc.splitTextToSize(data.vendorBranding.address, 56);
      doc.text(splitAddress.slice(0, 2), pageWidth - 71, contactY);
    }
  }
  
  doc.setTextColor(40, 40, 50);
  
  // Estimate info card (left side)
  let estimateInfoY = 53;
  doc.setFillColor(255, 253, 245);
  doc.roundedRect(14, estimateInfoY, 85, 28, 2, 2, 'F');
  doc.setFillColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
  doc.rect(14, estimateInfoY, 2, 28, 'F');
  doc.setDrawColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
  doc.setLineWidth(0.5);
  doc.roundedRect(14, estimateInfoY, 85, 28, 2, 2, 'S');
  
  let infoY = estimateInfoY + 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.text('ESTIMATE NUMBER', 20, infoY);
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 50);
  doc.text(data.estimateName, 20, infoY + 5);
  
  infoY += 11;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(90, 90, 100);
  doc.text('Date:', 20, infoY);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(data.estimateDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }), 33, infoY);
  
  if (data.estimatedCompletionDate) {
    infoY += 4.5;
    doc.setFont('helvetica', 'bold');
    doc.text('Est. Completion:', 20, infoY);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(data.estimatedCompletionDate).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }), 47, infoY);
  }
  
  // Customer details with enhanced design
  let customerSectionY = 89;
  if (data.customerName) {
    doc.setFillColor(250, 252, 255);
    doc.roundedRect(14, customerSectionY, pageWidth - 28, 38, 2, 2, 'F');
    doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.roundedRect(14, customerSectionY, pageWidth - 28, 3, 2, 2, 'F');
    doc.setDrawColor(220, 225, 235);
    doc.setLineWidth(0.5);
    doc.roundedRect(14, customerSectionY, pageWidth - 28, 38, 2, 2, 'S');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.text('CUSTOMER INFORMATION', 20, customerSectionY + 9);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 50);
    let yPos = customerSectionY + 16;
    doc.text(data.customerName, 20, yPos);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(70, 70, 80);
    
    if (data.customerPhone) {
      yPos += 5.5;
      doc.text(`Tel: ${data.customerPhone}`, 20, yPos);
    }
    if (data.customerEmail) {
      yPos += 5;
      doc.text(`Email: ${data.customerEmail}`, 20, yPos);
    }
    if (data.customerAddress) {
      yPos += 5;
      const splitAddress = doc.splitTextToSize(data.customerAddress, pageWidth - 45);
      doc.text(splitAddress, 20, yPos);
    }
  }
  
  // Product Specifications
  const specsStartY = data.customerName ? 128 : 88;
  
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
    ['Gold Cost', `Rs. ${data.goldCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ['Making Charges', `Rs. ${data.makingCharges.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ['CAD Design Charges', `Rs. ${data.cadDesignCharges.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ['Camming Charges', `Rs. ${data.cammingCharges.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ['Certification Cost', `Rs. ${data.certificationCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ['Diamond Cost', `Rs. ${data.diamondCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ['Gemstone Cost', `Rs. ${data.gemstoneCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
  ];
  
  (doc as any).autoTable({
    startY: costStartY + 5,
    head: [['Cost Component', 'Amount (INR)']],
    body: tableData,
    theme: 'grid',
    headStyles: { 
      fillColor: [primaryRgb.r, primaryRgb.g, primaryRgb.b],
      fontSize: 10,
      fontStyle: 'bold',
      textColor: [255, 255, 255],
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [50, 50, 50],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 'auto' },
      1: { halign: 'right', fontStyle: 'bold' },
    },
    alternateRowStyles: { fillColor: [250, 252, 255] },
    margin: { left: 14, right: 14 },
  });
  
  // Summary section with enhanced design
  const finalY = (doc as any).lastAutoTable.finalY + 12;
  
  doc.setFillColor(250, 252, 255);
  doc.roundedRect(14, finalY, pageWidth - 28, 32, 2, 2, 'F');
  doc.setDrawColor(220, 225, 235);
  doc.setLineWidth(0.5);
  doc.roundedRect(14, finalY, pageWidth - 28, 32, 2, 2, 'S');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(70, 70, 80);
  doc.text('Total Manufacturing Cost:', 20, finalY + 8);
  doc.text(`Rs. ${data.totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - 20, finalY + 8, { align: 'right' });
  
  doc.text(`Profit Margin (${data.profitMargin}%):`, 20, finalY + 15);
  doc.text(`Rs. ${((data.finalSellingPrice - data.totalCost)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - 20, finalY + 15, { align: 'right' });
  
  // Separator line
  doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.setLineWidth(1);
  doc.line(20, finalY + 19, pageWidth - 20, finalY + 19);
  
  // Grand total
  doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.rect(14, finalY + 21, pageWidth - 28, 11, 'F');
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('ESTIMATED SELLING PRICE:', 20, finalY + 28);
  doc.text(`Rs. ${data.finalSellingPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - 20, finalY + 28, { align: 'right' });
  doc.setTextColor(40, 40, 50);
  
  // Notes Section
  if (data.notes) {
    const notesY = finalY + 40;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.text('ADDITIONAL NOTES', 14, notesY);
    doc.setTextColor(0, 0, 0);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(data.notes, pageWidth - 28);
    doc.text(splitNotes, 14, notesY + 6);
  }
  
  // Terms & Conditions with better formatting
  const termsY = doc.internal.pageSize.getHeight() - 32;
  doc.setFillColor(248, 250, 252);
  doc.rect(14, termsY - 4, pageWidth - 28, 24, 'F');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.text('TERMS & CONDITIONS', 18, termsY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(70, 70, 80);
  doc.text('- This estimate is valid for 30 days from the date of issue.', 18, termsY + 5);
  doc.text('- Final pricing may vary based on actual materials and labor costs.', 18, termsY + 9);
  doc.text('- Completion time depends on design complexity and material availability.', 18, termsY + 13);
  doc.text('- 50% advance payment required to commence production.', 18, termsY + 17);
  
  // Footer with enhanced design
  const footerY = doc.internal.pageSize.getHeight() - 7;
  doc.setDrawColor(220, 225, 230);
  doc.setLineWidth(0.5);
  doc.line(14, footerY - 2, pageWidth - 14, footerY - 2);
  
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 130);
  doc.text(
    `Generated on ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} at ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );
  
  // Save PDF
  const fileName = `Estimate_${data.estimateName.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf`;
  doc.save(fileName);
};
