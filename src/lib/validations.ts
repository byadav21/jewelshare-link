import { z } from "zod";

// Helper for lenient number parsing
const lenientNumber = z.union([z.number(), z.string(), z.null()]).transform(val => {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') return val;
  const parsed = parseFloat(String(val).replace(/[^0-9.-]/g, ''));
  return isNaN(parsed) ? null : parsed;
}).nullable();

// Custom order validation
export const customOrderSchema = z.object({
  customer_name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  customer_email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  customer_phone: z.string().max(20, "Phone must be less than 20 characters").optional().or(z.literal("")),
  metal_type: z.string().max(50, "Metal type must be less than 50 characters").optional().or(z.literal("")),
  gemstone_preference: z.string().max(100, "Gemstone preference must be less than 100 characters").optional().or(z.literal("")),
  design_description: z.string().trim().min(10, "Description must be at least 10 characters").max(2000, "Description must be less than 2000 characters"),
  budget_range: z.string().max(50, "Budget range must be less than 50 characters").optional().or(z.literal("")),
});

// Contact owner validation
export const contactOwnerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().max(20, "Phone must be less than 20 characters").optional().or(z.literal("")),
  message: z.string().trim().min(1, "Message is required").max(1000, "Message must be less than 1000 characters"),
});

// Product interest validation
export const productInterestSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().max(20, "Phone must be less than 20 characters").optional().or(z.literal("")),
  notes: z.string().max(500, "Notes must be less than 500 characters").optional().or(z.literal("")),
});

// Video request validation
export const videoRequestSchema = z.object({
  customer_name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  customer_email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  customer_phone: z.string().max(20, "Phone must be less than 20 characters").optional().or(z.literal("")),
  requested_products: z.string().trim().min(1, "Please describe what you'd like to see").max(1000, "Description must be less than 1000 characters"),
});

// Product import validation (lenient - auto-calculations handle missing fields)
export const productImportSchema = z.object({
  user_id: z.string().uuid(),
  name: z.string().trim().min(1, "Product name is required").max(200, "Name must be less than 200 characters"),
  description: z.string().max(1000).nullable().optional(),
  sku: z.string().max(100).nullable().optional(),
  category: z.string().max(100).nullable().optional(),
  metal_type: z.string().max(50).nullable().optional(),
  gemstone: z.string().max(100).nullable().optional(),
  gemstone_name: z.string().max(100).nullable().optional(),
  gemstone_type: z.string().max(100).nullable().optional(),
  color: z.string().max(100).nullable().optional(),
  diamond_color: z.string().max(100).nullable().optional(),
  clarity: z.string().max(50).nullable().optional(),
  diamond_type: z.string().max(50).nullable().optional(),
  // Image URLs - very lenient to handle various formats
  image_url: z.string().max(500).nullable().optional(),
  image_url_2: z.string().max(500).nullable().optional(),
  image_url_3: z.string().max(500).nullable().optional(),
  // Weights - all optional, auto-calculated
  weight_grams: z.number().min(0).max(100000).nullable().optional(),
  net_weight: z.number().min(0).max(100000).nullable().optional(),
  diamond_weight: z.number().min(0).max(100000).nullable().optional(),
  carat_weight: z.number().min(0).max(100000).nullable().optional(),
  d_wt_1: z.number().min(0).nullable().optional(),
  d_wt_2: z.number().min(0).nullable().optional(),
  d_rate_1: z.number().min(0).nullable().optional(),
  pointer_diamond: z.number().min(0).nullable().optional(),
  d_value: z.number().min(0).nullable().optional(),
  purity_fraction_used: z.number().min(0).max(1).nullable().optional(),
  mkg: z.number().min(0).nullable().optional(),
  gold_per_gram_price: z.number().min(0).nullable().optional(),
  certification_cost: z.number().min(0).nullable().optional(),
  gemstone_cost: z.number().min(0).nullable().optional(),
  total_usd: z.number().min(0).nullable().optional(),
  price_inr: z.number().min(0).nullable().optional(),
  price_usd: z.number().min(0).nullable().optional(),
  // Prices - required but have defaults from calculation
  cost_price: z.number().min(0.01, "Cost price must be greater than 0").max(100000000),
  retail_price: z.number().min(0.01, "Retail price must be greater than 0").max(100000000),
  stock_quantity: z.number().int().min(0).max(100000).optional().default(1),
  delivery_type: z.enum(['immediate', 'scheduled']).optional().default('immediate'),
  dispatches_in_days: z.number().int().nullable().optional(),
  product_type: z.literal('Jewellery').optional(),
});

// Gemstone import validation
export const gemstoneImportSchema = z.object({
  user_id: z.string().uuid(),
  sku: z.string().trim().min(1, "SKU ID is required").max(100),
  name: z.string().trim().min(1, "Product name is required").max(200),
  gemstone_name: z.string().trim().min(1, "Gemstone name is required").max(200),
  gemstone_type: z.string().max(100).nullable(),
  carat_weight: z.number().min(0).nullable(),
  color: z.string().max(100).nullable(),
  clarity: z.string().max(50).nullable(),
  cut: z.string().max(50).nullable(),
  polish: z.string().max(50).nullable(),
  symmetry: z.string().max(50).nullable(),
  measurement: z.string().max(100).nullable(),
  certification: z.string().max(100).nullable(),
  image_url: z.union([z.string().url().max(500), z.literal(""), z.null()]),
  image_url_2: z.union([z.string().url().max(500), z.literal(""), z.null()]),
  image_url_3: z.union([z.string().url().max(500), z.literal(""), z.null()]),
  price_inr: z.number().min(0),
  price_usd: z.number().min(0).nullable(),
  cost_price: z.number().min(0.01),
  retail_price: z.number().min(0.01),
  stock_quantity: z.number().int().min(0).max(100000),
  product_type: z.literal('Gemstones'),
});

// Diamond import validation
export const diamondImportSchema = z.object({
  user_id: z.string().uuid(),
  sku: z.string().trim().min(1, "SKU is required").max(100),
  name: z.string().trim().min(1, "Product name is required").max(200),
  diamond_type: z.union([z.literal('Natural'), z.literal('Lab Grown')]),
  status: z.string().max(50).nullable(),
  shape: z.string().trim().min(1, "Shape is required").max(50),
  carat: z.number().min(0.01, "Carat must be greater than 0"),
  clarity: z.string().trim().min(1, "Clarity is required").max(50),
  color: z.string().trim().min(1, "Color is required").max(50),
  color_shade_amount: z.string().max(100).nullable(),
  cut: z.string().max(50).nullable(),
  polish: z.string().max(50).nullable(),
  symmetry: z.string().max(50).nullable(),
  fluorescence: z.string().max(50).nullable(),
  measurement: z.string().max(100).nullable(),
  ratio: z.string().max(20).nullable(),
  lab: z.string().max(50).nullable(),
  image_url: z.union([z.string().url().max(500), z.literal(""), z.null()]),
  image_url_2: z.union([z.string().url().max(500), z.literal(""), z.null()]),
  image_url_3: z.union([z.string().url().max(500), z.literal(""), z.null()]),
  price_inr: z.number().min(0),
  price_usd: z.number().min(0).nullable(),
  cost_price: z.number().min(0.01),
  retail_price: z.number().min(0.01),
  stock_quantity: z.number().int().min(0).max(100000),
  product_type: z.literal('Loose Diamonds'),
});

// Jewelry product validation (for add product form)
export const jewelleryProductSchema = z.object({
  name: z.string().trim().min(1, "Product name is required").max(200, "Name must be less than 200 characters"),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  sku: z.string().max(100, "SKU must be less than 100 characters").optional(),
  category: z.string().max(100, "Sub-category must be less than 100 characters").optional(),
  metal_type: z.string().min(1, "Metal type is required (e.g., 18k Gold, 22k Gold)").max(50),
  gemstone: z.string().optional(),
  weight_grams: z.number({
    required_error: "Gross weight is required",
    invalid_type_error: "Gross weight must be a number"
  }).min(0.001, "Gross weight must be greater than 0"),
  net_weight: z.number({
    required_error: "Net weight is required (auto-calculated from gross weight)",
    invalid_type_error: "Net weight must be a number"
  }).min(0.001, "Net weight must be greater than 0"),
  gold_per_gram_price: z.number({
    required_error: "Gold rate per gram is required",
    invalid_type_error: "Gold rate must be a number"
  }).min(1, "Gold rate must be greater than 0"),
  purity_fraction_used: z.number({
    required_error: "Purity is required (e.g., 18 for 18K)",
    invalid_type_error: "Purity must be a number"
  }).min(0.01, "Purity must be greater than 0").max(100, "Purity cannot exceed 100"),
  d_wt_1: z.number().min(0).optional().nullable(),
  d_wt_2: z.number().min(0).optional().nullable(),
  diamond_weight: z.number().min(0).optional().nullable(),
  d_rate_1: z.number().min(0).optional().nullable(),
  pointer_diamond: z.number().min(0).optional().nullable(),
  d_value: z.number().min(0).optional().nullable(),
  mkg: z.number({
    required_error: "Making charges (MKG) is required (auto-calculated)",
    invalid_type_error: "Making charges must be a number"
  }).min(0, "Making charges cannot be negative"),
  carat_weight: z.number().min(0).optional().nullable(),
  gemstone_rate: z.number().min(0).optional().nullable(),
  certification_cost: z.number().min(0).optional().nullable(),
  gemstone_cost: z.number().min(0).optional().nullable(),
  cost_price: z.number({
    required_error: "Cost price is required",
    invalid_type_error: "Cost price must be a number"
  }).min(0.01, "Cost price must be greater than 0"),
  retail_price: z.number({
    required_error: "Total retail price is required (auto-calculated)",
    invalid_type_error: "Retail price must be a number"
  }).min(0.01, "Retail price must be greater than 0"),
  stock_quantity: z.number().int().min(0, "Stock must be non-negative"),
  delivery_type: z.enum(['immediate', 'scheduled'], {
    required_error: "Delivery type is required"
  }),
  image_url: z.union([z.string().url().max(500), z.literal(""), z.null()]).optional(),
  image_url_2: z.union([z.string().url().max(500), z.literal(""), z.null()]).optional(),
  image_url_3: z.union([z.string().url().max(500), z.literal(""), z.null()]).optional(),
});

export type CustomOrderFormData = z.infer<typeof customOrderSchema>;
export type ContactOwnerFormData = z.infer<typeof contactOwnerSchema>;
export type ProductInterestFormData = z.infer<typeof productInterestSchema>;
export type VideoRequestFormData = z.infer<typeof videoRequestSchema>;
export type ProductImportData = z.infer<typeof productImportSchema>;
export type GemstoneImportData = z.infer<typeof gemstoneImportSchema>;
export type DiamondImportData = z.infer<typeof diamondImportSchema>;
export type JewelleryProductData = z.infer<typeof jewelleryProductSchema>;
