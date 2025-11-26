import { z } from "zod";

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

// Product import validation
export const productImportSchema = z.object({
  user_id: z.string().uuid(),
  name: z.string().trim().min(1, "Product name is required").max(200, "Name must be less than 200 characters"),
  description: z.string().max(1000, "Description must be less than 1000 characters").nullable(),
  sku: z.string().max(100, "SKU must be less than 100 characters").nullable(),
  category: z.string().max(100, "Category must be less than 100 characters").nullable(),
  metal_type: z.string().max(50, "Metal type must be less than 50 characters").nullable(),
  gemstone: z.string().max(100, "Gemstone must be less than 100 characters").nullable(),
  color: z.string().max(100).nullable(),
  diamond_color: z.string().max(100).nullable(),
  clarity: z.string().max(50).nullable(),
  image_url: z.union([z.string().url("Invalid image URL").max(500, "URL must be less than 500 characters"), z.literal(""), z.null()]),
  image_url_2: z.union([z.string().url().max(500), z.literal(""), z.null()]),
  image_url_3: z.union([z.string().url().max(500), z.literal(""), z.null()]),
  weight_grams: z.number().min(0, "Weight must be positive").max(100000, "Weight seems too high").nullable(),
  net_weight: z.number().min(0).max(100000).nullable(),
  diamond_weight: z.number().min(0).max(100000).nullable(),
  cost_price: z.number().min(0.01, "Cost price must be greater than 0").max(100000000, "Price seems too high"),
  retail_price: z.number().min(0.01, "Retail price must be greater than 0").max(100000000, "Price seems too high"),
  stock_quantity: z.number().int().min(0, "Stock must be non-negative").max(100000, "Stock seems too high"),
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
  price_inr: z.number().min(0.01, "Price must be greater than 0"),
  price_usd: z.number().min(0).nullable(),
  cost_price: z.number().min(0.01, "Cost price must be greater than 0"),
  retail_price: z.number().min(0.01, "Retail price must be greater than 0"),
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
  price_inr: z.number().min(0.01, "Price must be greater than 0"),
  price_usd: z.number().min(0).nullable(),
  cost_price: z.number().min(0.01, "Cost price must be greater than 0"),
  retail_price: z.number().min(0.01, "Retail price must be greater than 0"),
  stock_quantity: z.number().int().min(0).max(100000),
  product_type: z.literal('Loose Diamonds'),
});

export type CustomOrderFormData = z.infer<typeof customOrderSchema>;
export type ContactOwnerFormData = z.infer<typeof contactOwnerSchema>;
export type ProductInterestFormData = z.infer<typeof productInterestSchema>;
export type VideoRequestFormData = z.infer<typeof videoRequestSchema>;
export type ProductImportData = z.infer<typeof productImportSchema>;
export type GemstoneImportData = z.infer<typeof gemstoneImportSchema>;
export type DiamondImportData = z.infer<typeof diamondImportSchema>;
