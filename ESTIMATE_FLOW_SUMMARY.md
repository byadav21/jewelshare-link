# Manufacturing Estimator - Flow Summary

## 🎯 Purpose
Create jewelry cost estimates and convert them into professional invoices.

## 📋 Two Main Workflows

### 1️⃣ ESTIMATE Workflow
**Purpose**: Calculate costs and create quotations

```
Create Estimate → Calculate Costs → Save Draft → Export PDF (Optional)
```

**Key Points**:
- ✅ Used for quotations and cost planning
- ✅ Can be modified multiple times
- ✅ Optional customer details
- ✅ Status: Draft → Quoted → Approved
- ✅ Saved in "Estimate History"

### 2️⃣ INVOICE Workflow  
**Purpose**: Generate final billing documents

```
Load Estimate → Add Invoice Details → Generate Invoice → Save & Download PDF
```

**Key Points**:
- ✅ Final billing document
- ✅ Auto-generated invoice number
- ✅ Requires customer name (mandatory)
- ✅ Includes payment terms & due dates
- ✅ Saved in "Invoice History"
- ✅ Marks estimate as `invoice_generated: true`

## 🔢 5-Step Process

| Step | Section | Purpose |
|------|---------|---------|
| 1 | Basic Info | Estimate name, customer details, reference images |
| 2 | Specifications | Weights, gold rate, making charges, diamond/gemstone details |
| 3 | Additional Costs | CAD, camming, certification, GST configuration |
| 4 | Pricing | Profit margin, shipping, final price calculation |
| 5 | Review & Action | Save estimate, export PDF, or generate invoice |

## 💡 Key Distinctions

| Feature | Estimate | Invoice |
|---------|----------|---------|
| **Purpose** | Quotation / Cost planning | Final billing |
| **Customer Name** | Optional | Mandatory |
| **Invoice Number** | Not required | Auto-generated |
| **Status** | Draft, Quoted, Approved | Marked as generated |
| **Can be modified** | Yes, anytime | No (final document) |
| **Saved in** | Estimate History | Invoice History |

## 🔐 Access Control

- **Guest Users**: 5 calculations per IP, no save/invoice features
- **Authenticated Users**: Unlimited access, full features

## 🧮 Cost Calculation Formula

```
Total Cost = Gold Cost + Making + CAD + Camming + Certification 
           + Diamond Cost + Gemstone Cost

Selling Price = Total Cost × (1 + Profit Margin %)

Grand Total = Selling Price + GST + Shipping
```

## 📁 File Organization

Current: `src/pages/ManufacturingCost.tsx` (1871 lines - TOO LARGE!)

Recommended Structure:
```
src/
├── pages/
│   └── ManufacturingCost.tsx (Main orchestrator - 400 lines max)
├── components/
│   ├── estimate/
│   │   ├── EstimateWorkflowSteps.tsx ✅ (Created)
│   │   ├── EstimateFlowGuide.tsx ✅ (Created)
│   │   ├── JewelrySpecsSection.tsx (TODO)
│   │   ├── CostingSection.tsx (TODO)
│   │   └── PricingSection.tsx (TODO)
│   └── invoice/
│       ├── InvoiceConfig.tsx (TODO)
│       └── InvoicePreview.tsx (Exists)
└── hooks/
    ├── useEstimateWorkflow.ts ✅ (Created)
    ├── useEstimateCalculations.ts (TODO)
    └── useInvoiceGeneration.ts (TODO)
```

## 🚀 Next Steps for Implementation

1. ✅ Create flow documentation (DONE)
2. ✅ Create workflow step indicator (DONE)
3. ✅ Create workflow management hook (DONE)
4. ✅ Create flow guide component (DONE)
5. ⏳ Integrate workflow steps into ManufacturingCost page
6. ⏳ Extract sections into focused components
7. ⏳ Add step validation
8. ⏳ Add progress persistence

## 📝 Notes
- See `MANUFACTURING_ESTIMATOR_FLOW.md` for complete detailed documentation
- Current implementation is functional but needs refactoring for maintainability
- Focus on user experience clarity between estimate and invoice concepts
