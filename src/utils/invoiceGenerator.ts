import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface InvoiceData {
  estimateName: string;
  estimateDate: string;
  status: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  netWeight: number;
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
  details?: any;
}

export const generateInvoicePDF = (data: InvoiceData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('MANUFACTURING INVOICE', pageWidth / 2, 20, { align: 'center' });
  
  // Invoice Details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, 14, 35);
  doc.text(`Estimate: ${data.estimateName}`, 14, 40);
  doc.text(`Status: ${data.status.replace('_', ' ').toUpperCase()}`, 14, 45);
  
  // Customer Details Section
  if (data.customerName) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CUSTOMER DETAILS', 14, 60);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    let yPos = 68;
    doc.text(`Name: ${data.customerName}`, 14, yPos);
    if (data.customerPhone) {
      yPos += 5;
      doc.text(`Phone: ${data.customerPhone}`, 14, yPos);
    }
    if (data.customerEmail) {
      yPos += 5;
      doc.text(`Email: ${data.customerEmail}`, 14, yPos);
    }
    if (data.customerAddress) {
      yPos += 5;
      doc.text(`Address: ${data.customerAddress}`, 14, yPos);
    }
  }
  
  // Cost Breakdown Table
  const startY = data.customerName ? 95 : 65;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('COST BREAKDOWN', 14, startY);
  
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
    startY: startY + 5,
    head: [['Component', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] },
    margin: { left: 14, right: 14 },
  });
  
  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Manufacturing Cost:`, 14, finalY);
  doc.text(`₹${data.totalCost.toFixed(2)}`, pageWidth - 14, finalY, { align: 'right' });
  
  doc.text(`Profit Margin (${data.profitMargin}%):`, 14, finalY + 7);
  doc.text(`₹${((data.finalSellingPrice - data.totalCost)).toFixed(2)}`, pageWidth - 14, finalY + 7, { align: 'right' });
  
  doc.setFontSize(14);
  doc.setTextColor(79, 70, 229);
  doc.text(`Final Selling Price:`, 14, finalY + 16);
  doc.text(`₹${data.finalSellingPrice.toFixed(2)}`, pageWidth - 14, finalY + 16, { align: 'right' });
  doc.setTextColor(0, 0, 0);
  
  // Product Details
  if (data.details) {
    let detailsY = finalY + 26;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PRODUCT SPECIFICATIONS', 14, detailsY);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    detailsY += 8;
    
    if (data.netWeight) {
      doc.text(`Net Weight: ${data.netWeight} grams`, 14, detailsY);
      detailsY += 5;
    }
    if (data.purityFraction) {
      doc.text(`Purity: ${(data.purityFraction * 100).toFixed(0)}%`, 14, detailsY);
      detailsY += 5;
    }
    if (data.details.diamond_type) {
      doc.text(`Diamond Type: ${data.details.diamond_type}`, 14, detailsY);
      detailsY += 5;
    }
    if (data.details.diamond_shape) {
      doc.text(`Diamond Shape: ${data.details.diamond_shape}`, 14, detailsY);
      detailsY += 5;
    }
    if (data.details.diamond_weight) {
      doc.text(`Diamond Weight: ${data.details.diamond_weight} carats`, 14, detailsY);
      detailsY += 5;
    }
    if (data.details.diamond_certification) {
      doc.text(`Diamond Certification: ${data.details.diamond_certification}`, 14, detailsY);
      detailsY += 5;
    }
    if (data.details.gemstone_weight) {
      doc.text(`Gemstone Weight: ${data.details.gemstone_weight} carats`, 14, detailsY);
      detailsY += 5;
    }
  }
  
  // Notes
  if (data.notes) {
    const notesY = doc.internal.pageSize.getHeight() - 40;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('NOTES', 14, notesY);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(data.notes, pageWidth - 28);
    doc.text(splitNotes, 14, notesY + 6);
  }
  
  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Generated on ${new Date().toLocaleString()}`,
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );
  
  // Save PDF
  const fileName = `Invoice_${data.estimateName.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf`;
  doc.save(fileName);
};
