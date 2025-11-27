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
  };
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
      { id: 'business_address', label: 'Business Address', key: 'businessAddress', visible: true, order: 2 },
      { id: 'business_phone', label: 'Business Phone', key: 'businessPhone', visible: true, order: 3 },
      { id: 'business_email', label: 'Business Email', key: 'businessEmail', visible: true, order: 4 },
      { id: 'invoice_number', label: 'Invoice Number', key: 'invoiceNumber', visible: true, order: 5 },
      { id: 'invoice_date', label: 'Invoice Date', key: 'invoiceDate', visible: true, order: 6 },
    ],
    styling: {
      backgroundColor: 'transparent',
      padding: 20,
    }
  },
  {
    id: 'customer_info',
    type: 'customer_info',
    title: 'Bill To',
    visible: true,
    order: 1,
    fields: [
      { id: 'customer_name', label: 'Customer Name', key: 'customerName', visible: true, order: 0 },
      { id: 'customer_email', label: 'Email', key: 'customerEmail', visible: true, order: 1 },
      { id: 'customer_phone', label: 'Phone', key: 'customerPhone', visible: true, order: 2 },
      { id: 'customer_address', label: 'Address', key: 'customerAddress', visible: true, order: 3 },
    ],
    styling: {
      backgroundColor: 'transparent',
      padding: 16,
    }
  },
  {
    id: 'line_items',
    type: 'custom',
    title: 'Line Items',
    visible: true,
    order: 2,
    fields: [
      { id: 'item_image', label: 'Product Image', key: 'itemImage', visible: true, order: 0 },
      { id: 'item_title', label: 'Item Title', key: 'itemTitle', visible: true, order: 1 },
      { id: 'item_description', label: 'Description', key: 'itemDescription', visible: true, order: 2 },
      { id: 'item_quantity', label: 'Quantity', key: 'itemQuantity', visible: true, order: 3 },
      { id: 'item_price', label: 'Unit Price', key: 'itemPrice', visible: true, order: 4 },
      { id: 'item_total', label: 'Total', key: 'itemTotal', visible: true, order: 5 },
    ],
    styling: {
      backgroundColor: 'transparent',
      padding: 16,
    }
  },
  {
    id: 'cost_breakdown',
    type: 'cost_breakdown',
    title: 'Summary',
    visible: true,
    order: 3,
    fields: [
      { id: 'subtotal', label: 'Subtotal', key: 'subtotal', visible: true, order: 0 },
      { id: 'tax', label: 'Tax', key: 'tax', visible: true, order: 1 },
      { id: 'discount', label: 'Discount', key: 'discount', visible: true, order: 2 },
      { id: 'shipping', label: 'Shipping', key: 'shipping', visible: true, order: 3 },
      { id: 'total', label: 'Total Amount', key: 'finalSellingPrice', visible: true, order: 4 },
    ],
    styling: {
      backgroundColor: 'transparent',
      padding: 16,
    }
  },
  {
    id: 'notes',
    type: 'notes',
    title: 'Notes & Terms',
    visible: true,
    order: 4,
    fields: [
      { id: 'invoice_notes', label: 'Invoice Notes', key: 'invoiceNotes', visible: true, order: 0 },
      { id: 'payment_terms', label: 'Payment Terms', key: 'paymentTerms', visible: true, order: 1 },
      { id: 'payment_due_date', label: 'Payment Due Date', key: 'paymentDueDate', visible: true, order: 2 },
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
