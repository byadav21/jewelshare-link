import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
}

export const generateEstimatePDF = (data: EstimateData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header with decorative styling
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, pageWidth, 30, 'F');
  
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('JEWELRY MANUFACTURING ESTIMATE', pageWidth / 2, 18, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Estimate Details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Estimate No: ${data.estimateName}`, 14, 40);
  doc.text(`Date: ${new Date(data.estimateDate).toLocaleDateString()}`, 14, 45);
  doc.text(`Status: ${data.status.replace('_', ' ').toUpperCase()}`, 14, 50);
  
  if (data.estimatedCompletionDate) {
    doc.text(`Est. Completion: ${new Date(data.estimatedCompletionDate).toLocaleDateString()}`, 14, 55);
  }
  
  // Customer Details Section
  if (data.customerName) {
    doc.setFillColor(240, 240, 245);
    doc.rect(14, 65, pageWidth - 28, 35, 'F');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CUSTOMER INFORMATION', 18, 73);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    let yPos = 81;
    doc.text(`Name: ${data.customerName}`, 18, yPos);
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
  }
  
  // Product Specifications
  const specsStartY = data.customerName ? 110 : 70;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(79, 70, 229);
  doc.setTextColor(79, 70, 229);
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
  doc.setTextColor(79, 70, 229);
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
    head: [['Cost Component', 'Amount']],
    body: tableData,
    theme: 'striped',
    headStyles: { 
      fillColor: [79, 70, 229],
      fontSize: 11,
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: [248, 248, 255] },
    margin: { left: 14, right: 14 },
  });
  
  // Summary Section
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFillColor(245, 245, 250);
  doc.rect(14, finalY, pageWidth - 28, 30, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Manufacturing Cost:`, 18, finalY + 8);
  doc.text(`₹${data.totalCost.toFixed(2)}`, pageWidth - 18, finalY + 8, { align: 'right' });
  
  doc.text(`Profit Margin (${data.profitMargin}%):`, 18, finalY + 15);
  doc.text(`₹${((data.finalSellingPrice - data.totalCost)).toFixed(2)}`, pageWidth - 18, finalY + 15, { align: 'right' });
  
  // Draw line
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(0.5);
  doc.line(18, finalY + 18, pageWidth - 18, finalY + 18);
  
  doc.setFontSize(14);
  doc.setTextColor(79, 70, 229);
  doc.text(`Estimated Price:`, 18, finalY + 25);
  doc.text(`₹${data.finalSellingPrice.toFixed(2)}`, pageWidth - 18, finalY + 25, { align: 'right' });
  doc.setTextColor(0, 0, 0);
  
  // Notes Section
  if (data.notes) {
    const notesY = finalY + 40;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229);
    doc.text('ADDITIONAL NOTES', 14, notesY);
    doc.setTextColor(0, 0, 0);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(data.notes, pageWidth - 28);
    doc.text(splitNotes, 14, notesY + 6);
  }
  
  // Terms & Conditions
  const termsY = doc.internal.pageSize.getHeight() - 35;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Terms & Conditions:', 14, termsY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('• This is an estimate only. Final pricing may vary based on actual materials and labor.', 14, termsY + 5);
  doc.text('• Prices are valid for 30 days from the estimate date.', 14, termsY + 9);
  doc.text('• Completion time may vary depending on design complexity and material availability.', 14, termsY + 13);
  
  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 10;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Estimate generated on ${new Date().toLocaleString()}`,
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );
  
  // Save PDF
  const fileName = `Estimate_${data.estimateName.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf`;
  doc.save(fileName);
};
