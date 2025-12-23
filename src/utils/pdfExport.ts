import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface VendorProfile {
  business_name?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  email?: string;
  phone?: string;
  whatsapp_number?: string;
}

interface Product {
  sku?: string;
  name: string;
  diamond_color?: string;
  clarity?: string;
  d_wt_1?: number;
  d_wt_2?: number;
  diamond_weight?: number;
  weight_grams?: number;
  net_weight?: number;
  purity_fraction_used?: number;
  d_rate_1?: number;
  pointer_diamond?: number;
  d_value?: number;
  gemstone?: string;
  mkg?: number;
  certification_cost?: number;
  gemstone_cost?: number;
  retail_price: number;
  total_usd?: number;
}

export const exportCatalogToPDF = (
  products: Product[],
  vendorProfile: VendorProfile | null,
  usdRate: number,
  goldRate: number,
  totalINR: number,
  totalUSD: number
) => {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Add vendor header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(vendorProfile?.business_name || "Product Catalog", pageWidth / 2, 20, { align: "center" });
  
  // Add vendor details
  if (vendorProfile) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    let yPos = 30;
    
    if (vendorProfile.address_line1) {
      doc.text(
        `${vendorProfile.address_line1}${vendorProfile.address_line2 ? ', ' + vendorProfile.address_line2 : ''}`,
        pageWidth / 2,
        yPos,
        { align: "center" }
      );
      yPos += 5;
    }
    
    if (vendorProfile.city) {
      doc.text(
        `${vendorProfile.city}, ${vendorProfile.state} ${vendorProfile.pincode}`,
        pageWidth / 2,
        yPos,
        { align: "center" }
      );
      yPos += 5;
    }
    
    const contactInfo = [];
    if (vendorProfile.email) contactInfo.push(`Email: ${vendorProfile.email}`);
    if (vendorProfile.phone) contactInfo.push(`Phone: ${vendorProfile.phone}`);
    if (vendorProfile.whatsapp_number) contactInfo.push(`WhatsApp: ${vendorProfile.whatsapp_number}`);
    
    if (contactInfo.length > 0) {
      doc.text(contactInfo.join(' | '), pageWidth / 2, yPos, { align: "center" });
    }
  }
  
  // Add date, exchange rate, and gold rate with professional styling
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 45, pageWidth, 8, 'F');
  
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(70, 70, 80);
  doc.text(
    `Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} | Exchange Rate: 1 USD = Rs.${usdRate.toFixed(2)} | Gold Rate (24K): Rs.${goldRate.toLocaleString('en-IN')}/g`,
    pageWidth / 2,
    49,
    { align: 'center' }
  );
  
  // Prepare table data
  const tableData = products.map((product, index) => [
    product.sku || `${index + 1}`,
    product.name,
    product.diamond_color || '-',
    product.clarity || '-',
    product.d_wt_1 ? `${product.d_wt_1}` : '-',
    product.d_wt_2 ? `${product.d_wt_2}` : '-',
    product.diamond_weight ? `${product.diamond_weight}` : '-',
    product.weight_grams ? `${product.weight_grams}` : '-',
    product.net_weight ? `${product.net_weight}` : '-',
    product.purity_fraction_used ? `${product.purity_fraction_used > 1 ? product.purity_fraction_used : (product.purity_fraction_used * 100).toFixed(0)}%` : '-',
    product.d_rate_1 ? `${product.d_rate_1.toLocaleString('en-IN')}` : '-',
    product.pointer_diamond ? `${product.pointer_diamond.toLocaleString('en-IN')}` : '-',
    product.d_value ? `${product.d_value.toLocaleString('en-IN')}` : '-',
    product.gemstone || 'NONE',
    product.mkg ? `${product.mkg.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : '-',
    product.certification_cost ? `${product.certification_cost.toLocaleString('en-IN')}` : '-',
    product.gemstone_cost ? `${product.gemstone_cost.toLocaleString('en-IN')}` : '-',
    product.retail_price.toLocaleString('en-IN', { maximumFractionDigits: 0 }),
    product.total_usd ? product.total_usd.toFixed(2) : (product.retail_price / usdRate).toFixed(2)
  ]);
  
  // Add table with enhanced professional styling
  autoTable(doc, {
    head: [[
      'SKU', 
      'PRODUCT NAME', 
      'DIAMOND\nCOLOR',
      'CLARITY', 
      'D.WT 1\n(ct)', 
      'D.WT 2\n(ct)', 
      'TOTAL\nD.WT (ct)', 
      'GROSS\nWT (g)', 
      'NET\nWT (g)', 
      'PURITY\n%', 
      'D RATE 1\n(Rs/ct)', 
      'POINTER\nDIAMOND', 
      'D VALUE\n(Rs)',
      'GEMSTONE\nTYPE',
      'MKG\n(Rs)',
      'CERT\nCOST (Rs)',
      'GEM\nCOST (Rs)',
      'TOTAL\n(Rs)',
      'TOTAL\n(USD)'
    ]],
    body: tableData,
    startY: 53,
    styles: { 
      fontSize: 8, 
      cellPadding: 3, 
      lineColor: [220, 220, 220], 
      lineWidth: 0.15,
      overflow: 'linebreak',
      halign: 'left',
      valign: 'middle',
      textColor: [50, 50, 50]
    },
    headStyles: { 
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255], 
      fontStyle: 'bold', 
      halign: 'center',
      fontSize: 7.5,
      minCellHeight: 14,
      valign: 'middle',
      cellPadding: 3
    },
    alternateRowStyles: { fillColor: [250, 252, 255] },
    columnStyles: {
      0: { cellWidth: 15, halign: 'left' },
      1: { cellWidth: 32, halign: 'left' },
      2: { cellWidth: 12, halign: 'center' },
      3: { cellWidth: 12, halign: 'center' },
      4: { cellWidth: 12, halign: 'right' },
      5: { cellWidth: 12, halign: 'right' },
      6: { cellWidth: 14, halign: 'right' },
      7: { cellWidth: 12, halign: 'right' },
      8: { cellWidth: 12, halign: 'right' },
      9: { cellWidth: 12, halign: 'right' },
      10: { cellWidth: 14, halign: 'right' },
      11: { cellWidth: 14, halign: 'right' },
      12: { cellWidth: 14, halign: 'right' },
      13: { cellWidth: 16, halign: 'center' },
      14: { cellWidth: 14, halign: 'right' },
      15: { cellWidth: 13, halign: 'right' },
      16: { cellWidth: 13, halign: 'right' },
      17: { cellWidth: 22, halign: 'right', fontStyle: 'bold', textColor: [30, 64, 175] },
      18: { cellWidth: 18, halign: 'right', fontStyle: 'bold', textColor: [30, 64, 175] }
    },
    margin: { top: 53, left: 5, right: 5 },
    tableWidth: 'auto',
    didParseCell: function(data: any) {
      if (data.column.index === 17 && data.section === 'body') {
        data.cell.text = [`Rs. ${data.cell.text[0]}`];
      }
      if (data.column.index === 18 && data.section === 'body') {
        data.cell.text = [`$ ${data.cell.text[0]}`];
      }
    }
  });
  
  // Add totals with enhanced design
  const finalY = (doc as any).lastAutoTable.finalY || 50;
  
  doc.setFillColor(250, 252, 255);
  doc.roundedRect(14, finalY + 6, pageWidth - 28, 20, 2, 2, 'F');
  doc.setDrawColor(41, 128, 185);
  doc.setLineWidth(0.5);
  doc.roundedRect(14, finalY + 6, pageWidth - 28, 20, 2, 2, 'S');
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(41, 128, 185);
  doc.text(
    `Total: Rs.${totalINR.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | USD $${totalUSD.toFixed(2)}`,
    pageWidth / 2,
    finalY + 13,
    { align: "center" }
  );
  doc.setTextColor(50, 50, 60);
  doc.setFontSize(9);
  doc.text(
    `Total Products: ${products.length}`,
    pageWidth / 2,
    finalY + 20,
    { align: "center" }
  );
  
  // Save PDF
  const fileName = `catalog_${vendorProfile?.business_name?.replace(/\s+/g, '_') || 'products'}_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
};
