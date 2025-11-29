# Manufacturing Cost Estimator - Flow Documentation

## Overview
The Manufacturing Cost Estimator is a comprehensive tool for jewelry vendors to calculate manufacturing costs, manage customer orders, and generate professional invoices.

## User Journey

### Flow Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                    ESTIMATE CREATION FLOW                    │
└─────────────────────────────────────────────────────────────┘

Step 1: Basic Information
├─ Estimate Name
├─ Customer Details (Name, Phone, Email, Address, GSTIN)
└─ Reference Images Upload

Step 2: Jewelry Specifications
├─ Weight Entry (Gross or Net)
│  ├─ Gross Weight → Auto-calculates Net Weight
│  └─ Net Weight → Direct entry
├─ Purity Fraction (default: 0.76)
├─ Gold Rate (auto-populated from vendor profile)
├─ Making Charges (auto-populated from vendor profile)
├─ Diamond Details
│  ├─ Weight, Type, Shape, Color, Clarity
│  ├─ Per Carat Price
│  └─ Certification
└─ Gemstone Details
   ├─ Weight
   └─ Per Carat Price

Step 3: Additional Costs
├─ CAD Design Charges
├─ Camming Charges
├─ Certification Cost
└─ GST Configuration
   ├─ SGST + CGST (Intra-state)
   └─ IGST (Inter-state)

Step 4: Profit & Pricing
├─ Profit Margin Slider (0-200%)
├─ Final Selling Price Calculation
├─ Shipping Charges & Zone
├─ Currency Conversion (USD)
└─ Cost Breakdown Display
   ├─ Gold Cost
   ├─ Diamond Cost
   ├─ Gemstone Cost
   ├─ Making Charges
   ├─ Other Charges
   ├─ GST Amounts
   └─ Grand Total

Step 5: Line Items (Optional)
└─ Add Multiple Jewelry Items with individual pricing

┌─────────────────────────────────────────────────────────────┐
│                    ESTIMATE MANAGEMENT                        │
└─────────────────────────────────────────────────────────────┘

Actions Available:
├─ Save Estimate (Draft status)
├─ Export Estimate PDF
├─ Load Saved Estimate
├─ Reset Form
└─ View Estimate History

Status Workflow:
Draft → Quoted → Approved → In Production → Completed

┌─────────────────────────────────────────────────────────────┐
│                    INVOICE GENERATION FLOW                    │
└─────────────────────────────────────────────────────────────┘

Prerequisites:
├─ Customer name is mandatory
├─ Estimate must be saved first
└─ Invoice number generated automatically

Invoice Creation Steps:
1. Configure invoice details
   ├─ Invoice Number (auto-generated with prefix)
   ├─ Invoice Date
   ├─ Payment Terms (Net 30, Net 60, etc.)
   └─ Payment Due Date

2. Add invoice-specific data
   ├─ Invoice Notes
   ├─ Vendor GSTIN
   └─ Invoice Template Selection

3. Generate Invoice
   ├─ Preview Invoice (Modal)
   ├─ Confirm & Download PDF
   └─ Save to Database (marks as invoice_generated: true)

4. Navigate to Invoice History
   └─ View all generated invoices

┌─────────────────────────────────────────────────────────────┐
│                    KEY DISTINCTIONS                           │
└─────────────────────────────────────────────────────────────┘

ESTIMATE vs INVOICE:
│
├─ ESTIMATE
│  ├─ Purpose: Initial cost calculation & quotation
│  ├─ Status: Draft, Quoted, Approved
│  ├─ Can be modified multiple times
│  ├─ Optional customer details
│  └─ Saved in "Estimate History"
│
└─ INVOICE
   ├─ Purpose: Final billing document
   ├─ Status: Marked as "invoice_generated: true"
   ├─ Requires customer name (mandatory)
   ├─ Includes invoice number & dates
   └─ Saved in "Invoice History"

┌─────────────────────────────────────────────────────────────┐
│                    ACCESS CONTROL                             │
└─────────────────────────────────────────────────────────────┘

Guest Users:
├─ Limited to 5 calculations per IP address
├─ Cannot save estimates
├─ Cannot generate invoices
└─ Backend enforcement via edge function

Authenticated Users:
├─ Unlimited calculations
├─ Save unlimited estimates
├─ Generate invoices
├─ Access history
└─ Vendor branding features

┌─────────────────────────────────────────────────────────────┐
│                    CALCULATION FORMULAS                       │
└─────────────────────────────────────────────────────────────┘

1. Net Weight Calculation (if gross weight mode):
   Net Weight = Gross Weight - (Diamond Weight/5) - (Gemstone Weight/5)

2. Gold Cost:
   Gold Cost = Net Weight × Purity Fraction × Gold Rate (24K)

3. Diamond Cost:
   Diamond Cost = Diamond Weight (carats) × Per Carat Price

4. Gemstone Cost:
   Gemstone Cost = Gemstone Weight (carats) × Per Carat Price

5. Total Manufacturing Cost:
   Total = Gold Cost + Making Charges + CAD + Camming + Certification 
         + Diamond Cost + Gemstone Cost

6. Final Selling Price:
   Selling Price = Total Cost × (1 + Profit Margin %)

7. GST Calculation:
   SGST/CGST Mode: SGST + CGST applied on selling price
   IGST Mode: IGST applied on selling price

8. Grand Total:
   Grand Total = Selling Price + GST Amounts + Shipping Charges

9. USD Conversion:
   USD Total = Grand Total ÷ Exchange Rate

┌─────────────────────────────────────────────────────────────┐
│                    FILE STRUCTURE NEEDED                      │
└─────────────────────────────────────────────────────────────┘

Recommended Refactoring:
│
├─ src/pages/ManufacturingCost.tsx (Main orchestrator - max 400 lines)
├─ src/components/estimate/
│  ├─ EstimateForm.tsx (Steps 1-4)
│  ├─ JewelrySpecsSection.tsx (Step 2)
│  ├─ CostingSection.tsx (Step 3)
│  ├─ PricingSection.tsx (Step 4)
│  ├─ EstimateSummary.tsx (Cost breakdown display)
│  └─ EstimateActions.tsx (Save, Export, Load buttons)
│
├─ src/components/invoice/
│  ├─ InvoiceConfig.tsx (Invoice-specific fields)
│  ├─ InvoicePreview.tsx (Already exists)
│  └─ InvoiceActions.tsx (Generate, Save invoice)
│
└─ src/hooks/
   ├─ useEstimateCalculations.ts (Cost calculation logic)
   ├─ useEstimateStorage.ts (Save/Load operations)
   └─ useInvoiceGeneration.ts (Invoice creation logic)

┌─────────────────────────────────────────────────────────────┐
│                    NAVIGATION PATHS                           │
└─────────────────────────────────────────────────────────────┘

Page Routes:
├─ /manufacturing-cost → Create new estimate/invoice
├─ /estimate-history → View all saved estimates
├─ /invoice-history → View all generated invoices
└─ /order-tracking/:token → Customer order tracking

Link Relationships:
├─ Manufacturing Cost → Save → Estimate History
├─ Manufacturing Cost → Generate Invoice → Invoice History
├─ Estimate History → Load → Manufacturing Cost (pre-filled)
└─ Invoice History → View/Download PDFs
