-- Add invoice-specific fields to manufacturing_cost_estimates
ALTER TABLE manufacturing_cost_estimates
ADD COLUMN IF NOT EXISTS invoice_number TEXT,
ADD COLUMN IF NOT EXISTS invoice_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_terms TEXT DEFAULT 'Net 30',
ADD COLUMN IF NOT EXISTS payment_due_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS invoice_notes TEXT,
ADD COLUMN IF NOT EXISTS is_invoice_generated BOOLEAN DEFAULT false;

-- Create index for invoice lookups
CREATE INDEX IF NOT EXISTS idx_manufacturing_estimates_invoice_number 
ON manufacturing_cost_estimates(invoice_number) 
WHERE invoice_number IS NOT NULL;