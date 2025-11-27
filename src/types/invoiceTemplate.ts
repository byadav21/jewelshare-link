export type SectionType = 
  | 'header' 
  | 'customer_info' 
  | 'cost_breakdown' 
  | 'notes' 
  | 'footer' 
  | 'custom';

export interface TemplateField {
  id: string;
  label: string;
  key: string;
  visible: boolean;
  order: number;
  customLabel?: string;
}

export interface TemplateSection {
  id: string;
  type: SectionType;
  title: string;
  visible: boolean;
  order: number;
  fields: TemplateField[];
  styling?: {
    backgroundColor?: string;
    textColor?: string;
    fontSize?: number;
    fontWeight?: string;
    padding?: number;
    borderColor?: string;
    borderWidth?: number;
  };
}

export interface InvoiceTemplateData {
  sections: TemplateSection[];
  globalStyling?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    pageMargin?: number;
    logoUrl?: string;
  };
  productImages?: Array<{
    id: string;
    url: string;
    name: string;
    isDefault?: boolean;
  }>;
}

export interface InvoiceTemplate {
  id?: string;
  user_id?: string;
  name: string;
  description?: string;
  template_data: InvoiceTemplateData;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export const DEFAULT_SECTIONS: TemplateSection[] = [
  {
    id: 'header',
    type: 'header',
    title: 'Invoice Header',
    visible: true,
    order: 0,
    fields: [
      { id: 'logo', label: 'Business Logo', key: 'logo', visible: true, order: 0 },
      { id: 'business_name', label: 'Business Name', key: 'businessName', visible: true, order: 1 },
      { id: 'business_tagline', label: 'Business Tagline', key: 'businessTagline', visible: true, order: 2 },
      { id: 'business_address', label: 'Business Address', key: 'businessAddress', visible: true, order: 3 },
      { id: 'business_phone', label: 'Business Phone', key: 'businessPhone', visible: true, order: 4 },
      { id: 'business_landline', label: 'Landline', key: 'businessLandline', visible: true, order: 5 },
      { id: 'business_email', label: 'Business Email', key: 'businessEmail', visible: true, order: 6 },
      { id: 'business_gstn', label: 'GSTN', key: 'businessGSTN', visible: true, order: 7 },
      { id: 'invoice_number', label: 'Invoice Number', key: 'invoiceNumber', visible: true, order: 8 },
      { id: 'invoice_date', label: 'Invoice Date', key: 'invoiceDate', visible: true, order: 9 },
      { id: 'gold_rate', label: 'Gold Rate (Per Gram)', key: 'goldRate', visible: true, order: 10 },
      { id: 'silver_rate', label: 'Silver Rate (Per Gram)', key: 'silverRate', visible: true, order: 11 },
    ],
    styling: {
      backgroundColor: 'transparent',
      padding: 20,
    }
  },
  {
    id: 'customer_info',
    type: 'customer_info',
    title: 'Customer Details',
    visible: true,
    order: 1,
    fields: [
      { id: 'customer_name', label: 'Customer Name', key: 'customerName', visible: true, order: 0 },
      { id: 'customer_address', label: 'Address', key: 'customerAddress', visible: true, order: 1 },
      { id: 'customer_state', label: 'State', key: 'customerState', visible: true, order: 2 },
      { id: 'customer_pincode', label: 'Pin Code', key: 'customerPincode', visible: true, order: 3 },
      { id: 'customer_phone', label: 'Cell', key: 'customerPhone', visible: true, order: 4 },
      { id: 'customer_email', label: 'Email', key: 'customerEmail', visible: true, order: 5 },
      { id: 'customer_gst', label: 'GST No.', key: 'customerGST', visible: true, order: 6 },
      { id: 'customer_pan', label: 'PAN No.', key: 'customerPAN', visible: true, order: 7 },
      { id: 'customer_id', label: 'Customer ID', key: 'customerId', visible: true, order: 8 },
    ],
    styling: {
      backgroundColor: 'transparent',
      padding: 16,
    }
  },
  {
    id: 'line_items',
    type: 'custom',
    title: 'Item Details',
    visible: true,
    order: 2,
    fields: [
      { id: 'item_image', label: 'Product Image', key: 'itemImage', visible: true, order: 0 },
      { id: 'item_description', label: 'Description', key: 'itemDescription', visible: true, order: 1 },
      { id: 'item_hsn', label: 'HSN', key: 'itemHSN', visible: true, order: 2 },
      { id: 'gross_weight', label: 'Gross Wt.', key: 'grossWeight', visible: true, order: 3 },
      { id: 'stone_weight', label: 'Stone Wt.', key: 'stoneWeight', visible: true, order: 4 },
      { id: 'net_weight', label: 'Net Wt.', key: 'netWeight', visible: true, order: 5 },
      { id: 'va_percent', label: 'VA %', key: 'vaPercent', visible: true, order: 6 },
      { id: 'wastage', label: 'Wastage', key: 'wastage', visible: true, order: 7 },
      { id: 'final_weight', label: '(NET+VA) Wt.', key: 'finalWeight', visible: true, order: 8 },
      { id: 'rate', label: 'Rate', key: 'rate', visible: true, order: 9 },
      { id: 'making_charges', label: 'MC', key: 'makingCharges', visible: true, order: 10 },
      { id: 'amount', label: 'Amount', key: 'amount', visible: true, order: 11 },
    ],
    styling: {
      backgroundColor: 'transparent',
      padding: 16,
    }
  },
  {
    id: 'cost_breakdown',
    type: 'cost_breakdown',
    title: 'Cost Summary',
    visible: true,
    order: 3,
    fields: [
      { id: 'gold_total_weight', label: 'Gold Total Weight', key: 'goldTotalWeight', visible: true, order: 0 },
      { id: 'silver_total_weight', label: 'Silver Total Weight', key: 'silverTotalWeight', visible: true, order: 1 },
      { id: 'total_mc', label: 'Total MC', key: 'totalMC', visible: true, order: 2 },
      { id: 'old_exchange', label: 'Old/Exchange', key: 'oldExchange', visible: true, order: 3 },
      { id: 'total_amount', label: 'Total Amount', key: 'totalAmount', visible: true, order: 4 },
      { id: 'add_other', label: 'Add: Other', key: 'addOther', visible: true, order: 5 },
      { id: 'less_discount', label: 'Less: Discount', key: 'lessDiscount', visible: true, order: 6 },
      { id: 'taxable_amount', label: 'Taxable Amount', key: 'taxableAmount', visible: true, order: 7 },
      { id: 'gst', label: 'GST', key: 'gst', visible: true, order: 8 },
      { id: 'cgst', label: 'CGST', key: 'cgst', visible: true, order: 9 },
      { id: 'sgst', label: 'SGST', key: 'sgst', visible: true, order: 10 },
      { id: 'igst', label: 'IGST', key: 'igst', visible: true, order: 11 },
      { id: 'gst_total', label: 'GST Total', key: 'gstTotal', visible: true, order: 12 },
      { id: 'after_tax', label: 'After Tax', key: 'afterTax', visible: true, order: 13 },
      { id: 'less_oe_value', label: 'Less: O/E Value', key: 'lessOEValue', visible: true, order: 14 },
      { id: 'grand_total', label: 'Grand Total', key: 'grandTotal', visible: true, order: 15 },
    ],
    styling: {
      backgroundColor: 'transparent',
      padding: 16,
    }
  },
  {
    id: 'notes',
    type: 'notes',
    title: 'Terms & Conditions',
    visible: true,
    order: 4,
    fields: [
      { id: 'terms_conditions', label: 'Terms & Conditions', key: 'termsConditions', visible: true, order: 0 },
      { id: 'declaration', label: 'Declaration', key: 'declaration', visible: true, order: 1 },
      { id: 'payment_mode', label: 'Payment Mode', key: 'paymentMode', visible: true, order: 2 },
      { id: 'payment_amount', label: 'Payment Amount', key: 'paymentAmount', visible: true, order: 3 },
      { id: 'payment_ref', label: 'Payment Reference No.', key: 'paymentRef', visible: true, order: 4 },
    ],
    styling: {
      backgroundColor: 'transparent',
      padding: 12,
    }
  },
  {
    id: 'footer',
    type: 'footer',
    title: 'Footer',
    visible: true,
    order: 5,
    fields: [
      { id: 'thank_you', label: 'Thank You Message', key: 'thankYouMessage', visible: true, order: 0 },
      { id: 'website', label: 'Website', key: 'website', visible: true, order: 1 },
    ],
    styling: {
      backgroundColor: 'transparent',
      padding: 12,
    }
  },
];
