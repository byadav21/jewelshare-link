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
  invoiceType?: 'tax' | 'export' | 'proforma';
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
  gstMode?: 'sgst_cgst' | 'igst';
  sgstPercentage?: number;
  cgstPercentage?: number;
  igstPercentage?: number;
  sgstAmount?: number;
  cgstAmount?: number;
  igstAmount?: number;
  shippingCharges?: number;
  shippingZone?: string;
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

// Helper function to get invoice type label
const getInvoiceTypeLabel = (type?: 'tax' | 'export' | 'proforma'): string => {
  switch (type) {
    case 'export': return 'EXPORT INVOICE';
    case 'proforma': return 'PROFORMA INVOICE';
    default: return 'TAX INVOICE';
  }
};

// Helper function for consistent currency formatting (PDF-safe)
const formatCurrency = (amount: number) => {
  const formatted = amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `Rs. ${formatted}`;
};

// Helper function to load image as base64 with CORS handling
const loadImageAsBase64 = async (url: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve(null);
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/jpeg', 0.95);
        resolve(dataURL);
      } catch (error) {
        console.error('Error converting image to base64:', error);
        resolve(null);
      }
    };
    
    img.onerror = () => {
      console.error('Failed to load image:', url);
      resolve(null);
    };
    
    // Add timestamp to prevent caching issues
    const separator = url.includes('?') ? '&' : '?';
    img.src = `${url}${separator}_t=${Date.now()}`;
    
    // Timeout after 3 seconds
    setTimeout(() => resolve(null), 3000);
  });
};

export const generateInvoicePDF = async (data: InvoiceData) => {
  const template = data.template || 'detailed';
  
  switch (template) {
    case 'summary':
      return await generateSummaryInvoice(data);
    case 'minimal':
      return await generateMinimalInvoice(data);
    case 'traditional':
      return await generateTraditionalInvoice(data);
    case 'modern':
      return await generateModernInvoice(data);
    case 'luxury':
      return await generateLuxuryInvoice(data);
    default:
      return await generateDetailedInvoice(data);
  }
};

const generateDetailedInvoice = async (data: InvoiceData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Parse brand colors or use elegant defaults
  const primaryColor = data.vendorBranding?.primaryColor || '#1e40af';
  const secondaryColor = data.vendorBranding?.secondaryColor || '#6366f1';
  const accentColor = '#f59e0b';
  
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 30, g: 64, b: 175 };
  };
  
  const primaryRgb = hexToRgb(primaryColor);
  const secondaryRgb = hexToRgb(secondaryColor);
  const accentRgb = hexToRgb(accentColor);
  
  // Modern gradient header with enhanced design
  doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  // Subtle accent stripe
  doc.setFillColor(accentRgb.r, accentRgb.g, accentRgb.b);
  doc.rect(0, 48, pageWidth, 2, 'F');
  
  // Logo section with professional styling and actual logo embedding
  if (data.vendorBranding?.logo) {
    // Create logo container with shadow effect
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(16, 10, 30, 30, 3, 3, 'F');
    
    // Logo shadow/border
    doc.setDrawColor(230, 230, 235);
    doc.setLineWidth(0.5);
    doc.roundedRect(16, 10, 30, 30, 3, 3, 'S');
    
    try {
      // Load and embed the actual logo
      const logoBase64 = await loadImageAsBase64(data.vendorBranding.logo);
      
      if (logoBase64) {
        // Add the logo image to PDF with proper sizing and centering
        doc.addImage(logoBase64, 'JPEG', 18, 12, 26, 26, undefined, 'FAST');
      } else {
        // Fallback to placeholder text if image loading fails
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text('LOGO', 31, 26.5, { align: 'center' });
      }
    } catch (error) {
      console.error('Error processing logo:', error);
      // Fallback: show placeholder
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text('LOGO', 31, 26.5, { align: 'center' });
    }
  }
  
  // Business name with enhanced typography
  const nameStartX = data.vendorBranding?.logo ? 52 : pageWidth / 2;
  const nameAlign = data.vendorBranding?.logo ? 'left' : 'center';
  
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  
  if (data.vendorBranding?.name) {
    doc.text(data.vendorBranding.name.toUpperCase(), nameStartX, 22, { align: nameAlign });
    
    // Tagline with subtle styling
    if (data.vendorBranding?.tagline) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(240, 240, 245);
      doc.text(data.vendorBranding.tagline, nameStartX, 28, { align: nameAlign });
    }
    
    // INVOICE label with type
    const invoiceLabel = getInvoiceTypeLabel(data.invoiceType);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(invoiceLabel, nameStartX, 36, { align: nameAlign });
  } else {
    const invoiceLabel = getInvoiceTypeLabel(data.invoiceType);
    doc.setFontSize(26);
    doc.text(invoiceLabel, pageWidth / 2, 28, { align: 'center' });
  }
  
  // Reset text color
  doc.setTextColor(50, 50, 50);
  
  // Vendor contact info in professional card format (right side)
  let headerY = 58;
  if (data.vendorBranding?.email || data.vendorBranding?.phone || data.vendorBranding?.address || data.vendorGSTIN) {
    // Contact info card background
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(pageWidth - 80, headerY, 66, 32, 2, 2, 'F');
    doc.setDrawColor(220, 225, 230);
    doc.setLineWidth(0.5);
    doc.roundedRect(pageWidth - 80, headerY, 66, 32, 2, 2, 'S');
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 90);
    
    let contactY = headerY + 6;
    if (data.vendorGSTIN) {
      doc.setFont('helvetica', 'bold');
      doc.text(`GSTIN:`, pageWidth - 76, contactY);
      doc.setFont('helvetica', 'normal');
      doc.text(data.vendorGSTIN, pageWidth - 76, contactY + 3.5);
      contactY += 8;
    }
    if (data.vendorBranding.phone) {
      doc.text(`Tel: ${data.vendorBranding.phone}`, pageWidth - 76, contactY);
      contactY += 4.5;
    }
    if (data.vendorBranding.email) {
      const email = data.vendorBranding.email.length > 25 ? 
        data.vendorBranding.email.substring(0, 22) + '...' : 
        data.vendorBranding.email;
      doc.text(`Email: ${email}`, pageWidth - 76, contactY);
      contactY += 4.5;
    }
    if (data.vendorBranding.address && contactY < headerY + 28) {
      const splitAddress = doc.splitTextToSize(data.vendorBranding.address, 60);
      doc.text(splitAddress.slice(0, 2), pageWidth - 76, contactY);
    }
  }
  
  doc.setTextColor(40, 40, 50);
  
  // Invoice Details in professional card format (left side)
  let invoiceInfoY = 58;
  
  // Invoice info card background
  doc.setFillColor(255, 253, 245);
  doc.roundedRect(14, invoiceInfoY, 90, 32, 2, 2, 'F');
  
  // Accent border on left
  doc.setFillColor(accentRgb.r, accentRgb.g, accentRgb.b);
  doc.rect(14, invoiceInfoY, 2, 32, 'F');
  
  // Border
  doc.setDrawColor(accentRgb.r, accentRgb.g, accentRgb.b);
  doc.setLineWidth(0.5);
  doc.roundedRect(14, invoiceInfoY, 90, 32, 2, 2, 'S');
  
  let infoY = invoiceInfoY + 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.text('INVOICE NUMBER', 20, infoY);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 50);
  doc.text(data.invoiceNumber, 20, infoY + 5);
  
  infoY += 12;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 100, 110);
  doc.text('Date:', 20, infoY);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(data.invoiceDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }), 35, infoY);
  
  if (data.paymentDueDate) {
    infoY += 4.5;
    doc.setFont('helvetica', 'bold');
    doc.text('Due:', 20, infoY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(220, 38, 38);
    doc.text(new Date(data.paymentDueDate).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }), 35, infoY);
    doc.setTextColor(100, 100, 110);
  }
  
  if (data.paymentTerms) {
    infoY += 4.5;
    doc.setFont('helvetica', 'bold');
    doc.text('Terms:', 20, infoY);
    doc.setFont('helvetica', 'normal');
    doc.text(data.paymentTerms, 35, infoY);
  }
  
  // Payment status badge
  if (data.status) {
    const statusColors: Record<string, { bg: [number, number, number]; text: [number, number, number] }> = {
      paid: { bg: [220, 252, 231], text: [22, 163, 74] },
      partial: { bg: [254, 249, 195], text: [202, 138, 4] },
      pending: { bg: [254, 226, 226], text: [220, 38, 38] },
    };
    const statusLabels: Record<string, string> = {
      paid: 'PAID',
      partial: 'PARTIAL',
      pending: 'UNPAID',
    };
    const statusConfig = statusColors[data.status] || statusColors.pending;
    const statusLabel = statusLabels[data.status] || 'UNPAID';
    
    doc.setFillColor(...statusConfig.bg);
    doc.roundedRect(pageWidth - 50, 55, 36, 10, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...statusConfig.text);
    doc.text(statusLabel, pageWidth - 32, 61.5, { align: 'center' });
    doc.setTextColor(40, 40, 50);
  }
  
  // Customer Details Section with enhanced design
  let customerSectionY = 98;
  if (data.customerName) {
    // Customer card with gradient background
    doc.setFillColor(250, 252, 255);
    doc.roundedRect(14, customerSectionY, pageWidth - 28, 42, 2, 2, 'F');
    
    // Decorative top border
    doc.setFillColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
    doc.roundedRect(14, customerSectionY, pageWidth - 28, 3, 2, 2, 'F');
    
    // Border
    doc.setDrawColor(220, 225, 235);
    doc.setLineWidth(0.5);
    doc.roundedRect(14, customerSectionY, pageWidth - 28, 42, 2, 2, 'S');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
    doc.text('BILL TO', 20, customerSectionY + 10);
    doc.setTextColor(40, 40, 50);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    let yPos = customerSectionY + 17;
    doc.text(data.customerName, 20, yPos);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 90);
    
    // Two column layout for customer details
    let leftColY = yPos + 6;
    let rightColY = yPos + 6;
    const midPoint = pageWidth / 2;
    
    if (data.customerGSTIN) {
      doc.setFont('helvetica', 'bold');
      doc.text('GSTIN:', 20, leftColY);
      doc.setFont('helvetica', 'normal');
      doc.text(data.customerGSTIN, 38, leftColY);
      leftColY += 5;
    }
    if (data.customerPhone) {
      doc.text(`Tel: ${data.customerPhone}`, 20, leftColY);
      leftColY += 5;
    }
    if (data.customerEmail) {
      const emailLines = doc.splitTextToSize(`Email: ${data.customerEmail}`, midPoint - 25);
      doc.text(emailLines, 20, leftColY);
      leftColY += (emailLines.length * 4);
    }
    if (data.customerAddress) {
      const addressLines = doc.splitTextToSize(data.customerAddress, pageWidth - 50);
      doc.text(addressLines, 20, leftColY);
    }
    customerSectionY += 47;
  }
  
  // Line Items Section (if provided)
  let currentY = customerSectionY + 5;
  
  if (data.lineItems && data.lineItems.length > 0) {
    // Check if we need a new page
    if (currentY > doc.internal.pageSize.getHeight() - 100) {
      doc.addPage();
      currentY = 20;
    }
    
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
      
      // Item cost breakdown with professional table
      const itemCosts = [
        ['Gold Cost', formatCurrency(item.gold_cost)],
        ['Making Charges', formatCurrency(item.making_charges)],
        ['CAD Design', formatCurrency(item.cad_design_charges)],
        ['Camming', formatCurrency(item.camming_charges)],
        ['Certification', formatCurrency(item.certification_cost)],
        ['Diamond Cost', formatCurrency(item.diamond_cost)],
        ['Gemstone Cost', formatCurrency(item.gemstone_cost)],
      ];
      
      autoTable(doc, {
        startY: currentY,
        body: itemCosts,
        theme: 'plain',
        styles: { 
          fontSize: 9, 
          cellPadding: 2.5,
          textColor: [70, 70, 80]
        },
        columnStyles: {
          0: { 
            cellWidth: 45,
            fontStyle: 'bold',
            textColor: [100, 100, 110]
          },
          1: { 
            cellWidth: 'auto', 
            halign: 'right',
            fontStyle: 'bold'
          },
        },
        margin: { left: 18, right: 14 },
      });
      
      currentY = (doc as any).lastAutoTable.finalY + 3;
      
      // Item subtotal with enhanced styling
      doc.setFillColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
      doc.rect(14, currentY, pageWidth - 28, 10, 'F');
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('Item Subtotal:', 18, currentY + 6.5);
      doc.text(formatCurrency(item.subtotal), pageWidth - 18, currentY + 6.5, { align: 'right' });
      doc.setTextColor(40, 40, 50);
      
      currentY += 18;
    });
  } else {
    // Check if we need a new page
    if (currentY > doc.internal.pageSize.getHeight() - 100) {
      doc.addPage();
      currentY = 20;
    }
    
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
  
  // Cost Breakdown Table (only if no line items) with enhanced styling
  if (!data.lineItems || data.lineItems.length === 0) {
  const costStartY = currentY;
  
  // Check for page break
  if (costStartY > doc.internal.pageSize.getHeight() - 100) {
    doc.addPage();
    currentY = 20;
  }
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.text('COST BREAKDOWN', 14, currentY);
  doc.setTextColor(40, 40, 50);
  
  const tableData = [
    ['Gold Cost', formatCurrency(data.goldCost)],
    ['Making Charges', formatCurrency(data.makingCharges)],
    ['CAD Design Charges', formatCurrency(data.cadDesignCharges)],
    ['Camming Charges', formatCurrency(data.cammingCharges)],
    ['Certification Cost', formatCurrency(data.certificationCost)],
    ['Diamond Cost', formatCurrency(data.diamondCost)],
    ['Gemstone Cost', formatCurrency(data.gemstoneCost)],
  ];
  
  autoTable(doc, {
    startY: currentY + 5,
    head: [['Description', 'Amount']],
    body: tableData,
    theme: 'striped',
    headStyles: { 
      fillColor: [primaryRgb.r, primaryRgb.g, primaryRgb.b],
      fontSize: 11,
      fontStyle: 'bold',
      textColor: [255, 255, 255],
      cellPadding: 4
    },
    bodyStyles: {
      fontSize: 10,
      textColor: [50, 50, 60],
      cellPadding: 3.5
    },
    alternateRowStyles: { 
      fillColor: [250, 252, 255] 
    },
    columnStyles: {
      0: { 
        cellWidth: 110,
        fontStyle: 'normal'
      },
      1: { 
        cellWidth: 'auto',
        halign: 'right',
        fontStyle: 'bold'
      }
    },
    margin: { left: 14, right: 14 },
  });
  
  currentY = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Total Section with GST and Shipping
  const finalY = currentY;
  
  // Calculate height based on content
  const hasGst = (data.gstMode === 'sgst_cgst' && ((data.sgstAmount && data.sgstAmount > 0) || (data.cgstAmount && data.cgstAmount > 0))) || 
                 (data.gstMode === 'igst' && data.igstAmount && data.igstAmount > 0);
  const hasShipping = data.shippingCharges && data.shippingCharges > 0;
  const hasGrandTotal = data.grandTotal !== undefined && data.grandTotal > 0;
  const hasCurrency = data.exchangeRate && data.exchangeRate > 0 && hasGrandTotal;
  
  const baseHeight = 40;
  const gstHeight = hasGst ? (data.gstMode === 'sgst_cgst' ? 12 : 7) : 0;
  const shippingHeight = hasShipping ? 7 : 0;
  const grandTotalHeight = hasGrandTotal ? 12 : 0;
  const currencyHeight = hasCurrency ? 8 : 0;
  const totalSectionHeight = baseHeight + gstHeight + shippingHeight + grandTotalHeight + currencyHeight;
  
  // Check if we need a new page for totals section
  if (finalY + totalSectionHeight > doc.internal.pageSize.getHeight() - 80) {
    doc.addPage();
    currentY = 20;
    const newFinalY = currentY;
    doc.setFillColor(245, 245, 250);
    doc.rect(14, newFinalY, pageWidth - 28, totalSectionHeight, 'F');
    
    renderTotalsSection(doc, newFinalY, data, primaryRgb, pageWidth, hasGst, hasShipping, hasGrandTotal, hasCurrency);
    currentY = newFinalY + totalSectionHeight + 5;
  } else {
    doc.setFillColor(245, 245, 250);
    doc.rect(14, finalY, pageWidth - 28, totalSectionHeight, 'F');
    
    renderTotalsSection(doc, finalY, data, primaryRgb, pageWidth, hasGst, hasShipping, hasGrandTotal, hasCurrency);
    currentY = finalY + totalSectionHeight + 5;
  }
  
  // Invoice Notes Section  
  if (data.invoiceNotes) {
    if (currentY > doc.internal.pageSize.getHeight() - 60) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.text('INVOICE NOTES', 14, currentY);
    doc.setTextColor(0, 0, 0);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(data.invoiceNotes, pageWidth - 28);
    doc.text(splitNotes, 14, currentY + 6);
    currentY += 6 + (splitNotes.length * 5) + 5;
  }
  
  // Payment Instructions with professional card design
  if (currentY > doc.internal.pageSize.getHeight() - 70) {
    doc.addPage();
    currentY = 20;
  }
  
  doc.setFillColor(255, 253, 245);
  doc.roundedRect(14, currentY - 2, pageWidth - 28, 22, 2, 2, 'F');
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(2);
  doc.line(14, currentY - 2, 14, currentY + 20);
  doc.setDrawColor(220, 225, 230);
  doc.setLineWidth(0.5);
  doc.roundedRect(14, currentY - 2, pageWidth - 28, 22, 2, 2, 'S');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.text('PAYMENT INFORMATION', 20, currentY + 4);
  doc.setTextColor(40, 40, 50);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(70, 70, 80);
  doc.text('Please make payment within the specified terms to avoid late fees.', 20, currentY + 10);
  doc.text('For payment inquiries or bank details, contact us at the details above.', 20, currentY + 15);
  currentY += 28;
  
  // Terms & Conditions with professional formatting
  if (currentY > doc.internal.pageSize.getHeight() - 50) {
    doc.addPage();
    currentY = 20;
  }
  
  doc.setFillColor(248, 250, 252);
  doc.rect(14, currentY - 2, pageWidth - 28, 32, 'F');
  doc.setDrawColor(220, 225, 230);
  doc.setLineWidth(0.5);
  doc.rect(14, currentY - 2, pageWidth - 28, 32, 'S');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.text('TERMS & CONDITIONS', 18, currentY + 3);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(70, 70, 80);
  doc.text('- Payment must be received by the due date to avoid late fees.', 18, currentY + 9);
  doc.text('- All prices are final and include applicable taxes unless otherwise stated.', 18, currentY + 13);
  doc.text('- This invoice is valid for the amounts and items listed above.', 18, currentY + 17);
  doc.text('- Goods once sold cannot be returned or exchanged.', 18, currentY + 21);
  doc.text('- Subject to jurisdiction mentioned in the invoice.', 18, currentY + 25);
  
  // Professional footer
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
  const fileName = `Invoice_${data.invoiceNumber.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf`;
  doc.save(fileName);
};

// Helper function to render totals section
const renderTotalsSection = (
  doc: jsPDF,
  startY: number,
  data: InvoiceData,
  primaryRgb: { r: number; g: number; b: number },
  pageWidth: number,
  hasGst: boolean,
  hasShipping: boolean,
  hasGrandTotal: boolean,
  hasCurrency: boolean
) => {
  let lineY = startY + 10;
  
  // Subtotal with better formatting
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 90);
  doc.text('Subtotal:', 20, lineY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 60);
  doc.text(formatCurrency(data.totalCost), pageWidth - 20, lineY, { align: 'right' });
  lineY += 6;
  
  // Amount before tax with subtle separator
  doc.setDrawColor(220, 225, 235);
  doc.setLineWidth(0.3);
  doc.line(20, lineY, pageWidth - 20, lineY);
  lineY += 5;
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 70);
  doc.text('Amount (Before Tax):', 20, lineY);
  doc.setTextColor(50, 50, 60);
  doc.text(formatCurrency(data.finalSellingPrice), pageWidth - 20, lineY, { align: 'right' });
  lineY += 7;
  
  // GST breakdown with enhanced styling
  if (hasGst) {
    doc.setFontSize(9);
    if (data.gstMode === 'sgst_cgst') {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 90);
      doc.text(`SGST (${data.sgstPercentage || 0}%):`, 24, lineY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(50, 50, 60);
      doc.text(formatCurrency(data.sgstAmount || 0), pageWidth - 20, lineY, { align: 'right' });
      lineY += 4.5;
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 90);
      doc.text(`CGST (${data.cgstPercentage || 0}%):`, 24, lineY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(50, 50, 60);
      doc.text(formatCurrency(data.cgstAmount || 0), pageWidth - 20, lineY, { align: 'right' });
      lineY += 5;
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 90);
      doc.text(`IGST (${data.igstPercentage || 0}%):`, 24, lineY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(50, 50, 60);
      doc.text(formatCurrency(data.igstAmount || 0), pageWidth - 20, lineY, { align: 'right' });
      lineY += 5;
    }
    doc.setFontSize(10);
  }
  
  // Shipping charges with professional styling
  if (hasShipping) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 90);
    doc.text(`Shipping${data.shippingZone ? ` (${data.shippingZone})` : ''}:`, 20, lineY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 60);
    doc.text(formatCurrency(data.shippingCharges!), pageWidth - 20, lineY, { align: 'right' });
    lineY += 6;
  }
  
  // Draw prominent line before grand total
  if (hasGrandTotal) {
    doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.setLineWidth(1);
    doc.line(20, lineY, pageWidth - 20, lineY);
    lineY += 7;
    
    // Grand Total with enhanced styling
    doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.roundedRect(18, lineY - 4, pageWidth - 36, 12, 1, 1, 'F');
    
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('GRAND TOTAL (INR):', 22, lineY + 3);
    doc.setFontSize(14);
    doc.text(formatCurrency(data.grandTotal), pageWidth - 22, lineY + 3, { align: 'right' });
    lineY += 10;
    doc.setTextColor(40, 40, 50);
  } else {
    // Draw line before final total
    doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.setLineWidth(1);
    doc.line(20, lineY, pageWidth - 20, lineY);
    lineY += 7;
    
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.text('TOTAL AMOUNT DUE:', 20, lineY);
    doc.text(formatCurrency(data.finalSellingPrice), pageWidth - 20, lineY, { align: 'right' });
    lineY += 7;
    doc.setTextColor(40, 40, 50);
  }
  
  // Currency conversion with enhanced formatting
  if (hasCurrency && data.grandTotal) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 110);
    const usdAmount = (data.grandTotal / (data.exchangeRate || 1)).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    doc.text(`Equivalent: USD $${usdAmount} @ Exchange Rate Rs.${(data.exchangeRate || 0).toFixed(2)}/USD`, 20, lineY);
    doc.setTextColor(40, 40, 50);
  }
};

const generateSummaryInvoice = async (data: InvoiceData) => {
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
  const invoiceLabel = getInvoiceTypeLabel(data.invoiceType);
  doc.text(invoiceLabel, pageWidth / 2, 22, { align: 'center' });
  
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
    ['Gold Cost', `Rs. ${data.goldCost.toFixed(2)}`],
    ['Making & Design', `Rs. ${(data.makingCharges + data.cadDesignCharges + data.cammingCharges).toFixed(2)}`],
    ['Stones & Gems', `Rs. ${(data.diamondCost + data.gemstoneCost).toFixed(2)}`],
    ['Certification', `Rs. ${data.certificationCost.toFixed(2)}`],
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
  doc.text(`TOTAL: Rs. ${data.finalSellingPrice.toFixed(2)}`, pageWidth - 18, finalY + 13, { align: 'right' });
  
  doc.setTextColor(0, 0, 0);
  
  const fileName = `Invoice_${data.invoiceNumber.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf`;
  doc.save(fileName);
};

const generateMinimalInvoice = async (data: InvoiceData) => {
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
  const invoiceLabel = getInvoiceTypeLabel(data.invoiceType);
  doc.text(invoiceLabel, pageWidth / 2, 30, { align: 'center' });
  
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
  doc.text(`Rs. ${data.finalSellingPrice.toFixed(2)}`, pageWidth / 2, yPos, { align: 'center' });
  
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
const generateTraditionalInvoice = async (data: InvoiceData) => {
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
  
  yPos += 12;
  doc.setFontSize(24);
  doc.setFont('times', 'bold');
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  const invoiceLabel = getInvoiceTypeLabel(data.invoiceType);
  doc.text(invoiceLabel, pageWidth / 2, yPos, { align: 'center' });
  
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
    ['Gold Cost', '', `Rs. ${data.goldCost.toFixed(2)}`],
    ['Diamond Cost', '', `Rs. ${data.diamondCost.toFixed(2)}`],
    ['Gemstone Cost', '', `Rs. ${data.gemstoneCost.toFixed(2)}`],
    ['Making Charges', '', `Rs. ${data.makingCharges.toFixed(2)}`],
    ['Design & CAD', '', `Rs. ${data.cadDesignCharges.toFixed(2)}`],
    ['Certification', '', `Rs. ${data.certificationCost.toFixed(2)}`],
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
  doc.text(`Rs. ${data.finalSellingPrice.toFixed(2)}`, pageWidth - 25, totalY + 13, { align: 'right' });
  
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
const generateModernInvoice = async (data: InvoiceData) => {
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
  const invoiceLabel = getInvoiceTypeLabel(data.invoiceType);
  doc.text(invoiceLabel, 20, 50);
  
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
    ['Gold & Metal Work', `Rs. ${data.goldCost.toFixed(2)}`],
    ['Precious Stones', `Rs. ${(data.diamondCost + data.gemstoneCost).toFixed(2)}`],
    ['Craftsmanship', `Rs. ${data.makingCharges.toFixed(2)}`],
    ['Design & Finishing', `Rs. ${(data.cadDesignCharges + data.cammingCharges).toFixed(2)}`],
    ['Certification', `Rs. ${data.certificationCost.toFixed(2)}`],
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
  doc.text(`Rs. ${data.finalSellingPrice.toFixed(2)}`, pageWidth - 20, totalY + 10, { align: 'right' });
  
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
const generateLuxuryInvoice = async (data: InvoiceData) => {
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
  const invoiceLabel = getInvoiceTypeLabel(data.invoiceType);
  doc.text(invoiceLabel, pageWidth / 2, yPos, { align: 'center' });
  
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
    ['Fine Gold Workmanship', `Rs. ${data.goldCost.toFixed(2)}`],
    ['Precious Diamond Selection', `Rs. ${data.diamondCost.toFixed(2)}`],
    ['Gemstone Accents', `Rs. ${data.gemstoneCost.toFixed(2)}`],
    ['Master Craftsmanship', `Rs. ${data.makingCharges.toFixed(2)}`],
    ['Bespoke Design Services', `Rs. ${data.cadDesignCharges.toFixed(2)}`],
    ['Finishing & Polish', `Rs. ${data.cammingCharges.toFixed(2)}`],
    ['Authentication Certificate', `Rs. ${data.certificationCost.toFixed(2)}`],
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
  doc.text(`Rs. ${data.finalSellingPrice.toFixed(2)}`, pageWidth - 105, totalY + 17);
  
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
    if (data.vendorBranding.phone && data.vendorBranding.email) contactText += ' | ';
    if (data.vendorBranding.email) contactText += data.vendorBranding.email;
    doc.text(contactText, pageWidth / 2, footerY + 12, { align: 'center' });
  }
  
  const fileName = `Invoice_${data.invoiceNumber.replace(/[^a-z0-9]/gi, '_')}_Luxury.pdf`;
  doc.save(fileName);
};
