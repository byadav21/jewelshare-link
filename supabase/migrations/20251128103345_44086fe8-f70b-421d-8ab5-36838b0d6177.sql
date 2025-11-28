-- Add invoice payment status tracking fields
ALTER TABLE manufacturing_cost_estimates 
ADD COLUMN IF NOT EXISTS invoice_status text CHECK (invoice_status IN ('pending', 'paid', 'overdue', 'cancelled')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS last_reminder_sent_at timestamp with time zone;

-- Create index for finding overdue invoices
CREATE INDEX IF NOT EXISTS idx_invoice_status_due_date 
ON manufacturing_cost_estimates(invoice_status, payment_due_date) 
WHERE is_invoice_generated = true;

-- Update existing invoices to have pending status
UPDATE manufacturing_cost_estimates 
SET invoice_status = 'pending' 
WHERE is_invoice_generated = true 
AND invoice_status IS NULL;