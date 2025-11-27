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
    title: 'Header',
    visible: true,
    order: 0,
    fields: [
      { id: 'logo', label: 'Business Logo', key: 'logo', visible: true, order: 0 },
      { id: 'business_name', label: 'Business Name', key: 'businessName', visible: true, order: 1 },
      { id: 'invoice_number', label: 'Invoice Number', key: 'invoiceNumber', visible: true, order: 2 },
      { id: 'invoice_date', label: 'Invoice Date', key: 'invoiceDate', visible: true, order: 3 },
    ],
  },
  {
    id: 'customer_info',
    type: 'customer_info',
    title: 'Customer Information',
    visible: true,
    order: 1,
    fields: [
      { id: 'customer_name', label: 'Customer Name', key: 'customerName', visible: true, order: 0 },
      { id: 'customer_email', label: 'Email', key: 'customerEmail', visible: true, order: 1 },
      { id: 'customer_phone', label: 'Phone', key: 'customerPhone', visible: true, order: 2 },
      { id: 'customer_address', label: 'Address', key: 'customerAddress', visible: true, order: 3 },
    ],
  },
  {
    id: 'cost_breakdown',
    type: 'cost_breakdown',
    title: 'Cost Breakdown',
    visible: true,
    order: 2,
    fields: [
      { id: 'gold_cost', label: 'Gold Cost', key: 'goldCost', visible: true, order: 0 },
      { id: 'making_charges', label: 'Making Charges', key: 'makingCharges', visible: true, order: 1 },
      { id: 'diamond_cost', label: 'Diamond Cost', key: 'diamondCost', visible: true, order: 2 },
      { id: 'gemstone_cost', label: 'Gemstone Cost', key: 'gemstoneCost', visible: true, order: 3 },
      { id: 'cad_design', label: 'CAD Design', key: 'cadDesignCharges', visible: true, order: 4 },
      { id: 'certification', label: 'Certification', key: 'certificationCost', visible: true, order: 5 },
      { id: 'total', label: 'Total Amount', key: 'finalSellingPrice', visible: true, order: 6 },
    ],
  },
  {
    id: 'notes',
    type: 'notes',
    title: 'Notes & Terms',
    visible: true,
    order: 3,
    fields: [
      { id: 'invoice_notes', label: 'Invoice Notes', key: 'invoiceNotes', visible: true, order: 0 },
      { id: 'payment_terms', label: 'Payment Terms', key: 'paymentTerms', visible: true, order: 1 },
      { id: 'payment_due_date', label: 'Payment Due Date', key: 'paymentDueDate', visible: true, order: 2 },
    ],
  },
  {
    id: 'footer',
    type: 'footer',
    title: 'Footer',
    visible: true,
    order: 4,
    fields: [
      { id: 'vendor_contact', label: 'Contact Information', key: 'vendorContact', visible: true, order: 0 },
      { id: 'thank_you', label: 'Thank You Message', key: 'thankYouMessage', visible: true, order: 1 },
    ],
  },
];
