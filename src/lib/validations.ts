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

// Product import validation
export const productImportSchema = z.object({
  user_id: z.string().uuid(),
  name: z.string().trim().min(1, "Product name is required").max(200, "Name must be less than 200 characters"),
  description: z.string().max(1000, "Description must be less than 1000 characters").nullable(),
  sku: z.string().max(100, "SKU must be less than 100 characters").nullable(),
  category: z.string().max(100, "Category must be less than 100 characters").nullable(),
  metal_type: z.string().max(50, "Metal type must be less than 50 characters").nullable(),
  gemstone: z.string().max(100, "Gemstone must be less than 100 characters").nullable(),
  image_url: z.string().url("Invalid image URL").max(500, "URL must be less than 500 characters").nullable().or(z.literal(null)),
  image_url_2: z.string().url("Invalid image URL").max(500, "URL must be less than 500 characters").nullable().or(z.literal(null)),
  weight_grams: z.number().min(0, "Weight must be positive").max(100000, "Weight seems too high").nullable(),
  cost_price: z.number().min(0.01, "Cost price must be greater than 0").max(100000000, "Price seems too high"),
  retail_price: z.number().min(0.01, "Retail price must be greater than 0").max(100000000, "Price seems too high"),
  stock_quantity: z.number().int().min(0, "Stock must be non-negative").max(100000, "Stock seems too high"),
});

export type CustomOrderFormData = z.infer<typeof customOrderSchema>;
export type ContactOwnerFormData = z.infer<typeof contactOwnerSchema>;
export type ProductInterestFormData = z.infer<typeof productInterestSchema>;
export type ProductImportData = z.infer<typeof productImportSchema>;
