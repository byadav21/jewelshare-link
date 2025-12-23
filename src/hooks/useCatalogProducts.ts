/**
 * @fileoverview Custom hook for managing catalog products data fetching and operations
 * @module hooks/useCatalogProducts
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Product data structure from database
 */
export interface CatalogProduct {
  id: string;
  name: string;
  sku: string | null;
  image_url: string | null;
  image_url_2: string | null;
  image_url_3: string | null;
  cost_price: number;
  retail_price: number;
  stock_quantity: number | null;
  category: string | null;
  metal_type: string | null;
  gemstone: string | null;
  color: string | null;
  diamond_color: string | null;
  clarity: string | null;
  delivery_type: string | null;
  product_type: string | null;
  weight_grams: number | null;
  gemstone_type: string | null;
  carat_weight: number | null;
  cut: string | null;
  diamond_type: string | null;
  shape: string | null;
  carat: number | null;
  polish: string | null;
  symmetry: string | null;
  fluorescence: string | null;
  lab: string | null;
  created_at: string | null;
  purity_fraction_used: number | null;
  net_weight: number | null;
  d_value: number | null;
  mkg: number | null;
  certification_cost: number | null;
  gemstone_cost: number | null;
  gold_per_gram_price: number | null;
  d_rate_1: number | null;
  d_wt_1: number | null;
  d_wt_2: number | null;
  pointer_diamond: number | null;
  diamond_weight: number | null;
}

/**
 * Return type for useCatalogProducts hook
 */
interface UseCatalogProductsReturn {
  /** Array of products from database */
  products: CatalogProduct[];
  /** Loading state indicator */
  loading: boolean;
  /** Whether initial data load is complete */
  initialLoadComplete: boolean;
  /** Refetch products from database */
  fetchProducts: () => Promise<void>;
  /** Update gold rate and recalculate prices */
  handleUpdateGoldRate: (newRate: number) => Promise<void>;
}

/**
 * Custom hook for managing catalog products
 * 
 * @description Handles fetching products from Supabase, managing loading states,
 * and providing utilities for product operations like gold rate updates.
 * 
 * @param selectedProductType - The currently selected product type filter
 * @param goldRate - Current gold rate per gram
 * @returns {UseCatalogProductsReturn} Products data and utility functions
 * 
 * @example
 * ```tsx
 * const { products, loading, fetchProducts, handleUpdateGoldRate } = useCatalogProducts(
 *   "Jewellery",
 *   8500
 * );
 * ```
 */
export const useCatalogProducts = (
  selectedProductType: string,
  goldRate: number
): UseCatalogProductsReturn => {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  /**
   * Fetches products from Supabase filtered by product type
   * @async
   */
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      
      let query = supabase
        .from("products")
        .select("id, name, sku, image_url, image_url_2, image_url_3, cost_price, retail_price, stock_quantity, category, metal_type, gemstone, color, diamond_color, clarity, delivery_type, product_type, weight_grams, gemstone_type, carat_weight, cut, diamond_type, shape, carat, polish, symmetry, fluorescence, lab, created_at, purity_fraction_used, net_weight, d_value, mkg, certification_cost, gemstone_cost, gold_per_gram_price, d_rate_1, d_wt_1, d_wt_2, pointer_diamond, diamond_weight")
        .eq("user_id", user.id)
        .is("deleted_at", null);

      if (selectedProductType === 'Jewellery') {
        query = query.or(`product_type.eq.${selectedProductType},product_type.is.null`);
      } else {
        query = query.eq("product_type", selectedProductType);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });
        
      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error("Failed to load products:", error);
      toast.error("Failed to load products. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, [selectedProductType]);

  /**
   * Updates gold rate in vendor profile and recalculates all product prices
   * @param newRate - New gold rate per gram in INR
   */
  const handleUpdateGoldRate = useCallback(async (newRate: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { error: profileError } = await supabase
      .from("vendor_profiles")
      .update({
        gold_rate_24k_per_gram: newRate,
        gold_rate_updated_at: new Date().toISOString()
      })
      .eq("user_id", user.id);
    
    if (profileError) throw profileError;
    
    // Recalculate product prices based on new gold rate
    const updatedProducts = products
      .filter(p => p.net_weight || p.weight_grams)
      .map(product => {
        const purityRaw = product.purity_fraction_used || 18;
        let purity: number;
        if (purityRaw <= 1) {
          purity = purityRaw;
        } else if (purityRaw <= 24) {
          purity = purityRaw / 24;
        } else {
          purity = purityRaw / 100;
        }
        
        const weight = product.net_weight || product.weight_grams || 0;
        const goldValue = weight * purity * newRate;
        const diamondValue = product.d_value || 0;
        const makingCharges = product.mkg || 0;
        const certificationCost = product.certification_cost || 0;
        const gemstoneCost = product.gemstone_cost || 0;
        const totalCost = goldValue + diamondValue + makingCharges + certificationCost + gemstoneCost;
        
        return {
          id: product.id,
          cost_price: Math.round(totalCost * 100) / 100,
          retail_price: Math.round(totalCost * 100) / 100,
          gold_per_gram_price: newRate
        };
      });

    const updatePromises = updatedProducts.map(update => 
      supabase.from("products").update({
        cost_price: update.cost_price,
        retail_price: update.retail_price,
        gold_per_gram_price: update.gold_per_gram_price
      }).eq("id", update.id)
    );
    
    await Promise.all(updatePromises);
    await fetchProducts();
    toast.success(`Gold rate updated to ₹${newRate.toLocaleString('en-IN')}/g`);
  }, [products, fetchProducts]);

  // Fetch products when product type changes
  useEffect(() => {
    if (selectedProductType && initialLoadComplete) {
      fetchProducts();
    }
  }, [selectedProductType, initialLoadComplete, fetchProducts]);

  // Set initial load complete flag
  useEffect(() => {
    setInitialLoadComplete(true);
  }, []);

  return {
    products,
    loading,
    initialLoadComplete,
    fetchProducts,
    handleUpdateGoldRate,
  };
};
