import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Product data structure returned from the database
 */
export interface CatalogProduct {
  id: string;
  name: string;
  sku?: string;
  image_url?: string;
  image_url_2?: string;
  image_url_3?: string;
  cost_price: number;
  retail_price: number;
  stock_quantity?: number;
  category?: string;
  metal_type?: string;
  gemstone?: string;
  color?: string;
  diamond_color?: string;
  clarity?: string;
  delivery_type?: string;
  product_type?: string;
  weight_grams?: number;
  gemstone_type?: string;
  carat_weight?: number;
  cut?: string;
  diamond_type?: string;
  shape?: string;
  carat?: number;
  polish?: string;
  symmetry?: string;
  fluorescence?: string;
  lab?: string;
  created_at?: string;
  purity_fraction_used?: number;
  net_weight?: number;
  d_value?: number;
  mkg?: number;
  certification_cost?: number;
  gemstone_cost?: number;
  gold_per_gram_price?: number;
  d_rate_1?: number;
  d_wt_1?: number;
  d_wt_2?: number;
  pointer_diamond?: number;
  diamond_weight?: number;
  description?: string;
}

/**
 * Vendor profile data structure
 */
export interface VendorProfile {
  id: string;
  user_id: string;
  business_name?: string;
  brand_tagline?: string;
  logo_url?: string;
  gold_rate_24k_per_gram?: number;
  silver_rate_per_gram?: number;
  platinum_rate_per_gram?: number;
  making_charges_per_gram?: number;
  instagram_qr_url?: string;
  whatsapp_qr_url?: string;
  whatsapp_number?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
}

/**
 * Metal rates configuration
 */
export interface MetalRates {
  goldRate: number;
  silverRate: number;
  platinumRate: number;
}

/**
 * Custom hook for fetching and managing catalog data
 * 
 * @description Handles parallel fetching of products, vendor profile, approved categories,
 * and USD exchange rate. Provides methods for updating gold rate and refreshing products.
 * 
 * @param selectedProductType - The product type filter to apply (e.g., "Jewellery", "Loose Diamonds")
 * @returns Object containing products, vendor data, rates, and management functions
 * 
 * @example
 * ```tsx
 * const {
 *   products,
 *   vendorProfile,
 *   metalRates,
 *   loading,
 *   fetchProducts,
 *   updateGoldRate
 * } = useCatalogData(selectedProductType);
 * ```
 */
export const useCatalogData = (selectedProductType: string) => {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [approvedCategories, setApprovedCategories] = useState<string[]>(["Jewellery"]);
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Metal rates state
  const [goldRate, setGoldRate] = useState(0);
  const [silverRate, setSilverRate] = useState(95);
  const [platinumRate, setPlatinumRate] = useState(3200);
  const [usdRate, setUsdRate] = useState(87.67);

  /**
   * Fetch approved categories for the current user
   */
  const fetchApprovedCategories = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_approval_status")
        .select("approved_categories")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      const approved = data?.approved_categories || ["Jewellery"];
      setApprovedCategories(approved);
    } catch (error) {
      console.error("Failed to fetch approved categories:", error);
    }
  }, []);

  /**
   * Fetch USD to INR exchange rate with caching
   */
  const fetchUSDRate = useCallback(async () => {
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      if (data.rates?.INR) {
        setUsdRate(data.rates.INR);
        sessionStorage.setItem('usd_rate', data.rates.INR.toString());
        sessionStorage.setItem('usd_rate_time', Date.now().toString());
      }
    } catch (error) {
      console.error("Failed to fetch USD rate:", error);
    }
  }, []);

  /**
   * Fetch vendor profile and extract metal rates
   */
  const fetchVendorProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("vendor_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching vendor profile:", error);
      } else if (data) {
        setVendorProfile(data);
        if (data.gold_rate_24k_per_gram) {
          setGoldRate(data.gold_rate_24k_per_gram);
        }
        if (data.silver_rate_per_gram) {
          setSilverRate(data.silver_rate_per_gram);
        }
        if (data.platinum_rate_per_gram) {
          setPlatinumRate(data.platinum_rate_per_gram);
        }
      }
    } catch (error) {
      console.error("Failed to fetch vendor profile:", error);
    }
  }, []);

  /**
   * Fetch products for the current user filtered by product type
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
        .select(`
          id, name, sku, image_url, image_url_2, image_url_3, 
          cost_price, retail_price, stock_quantity, category, 
          metal_type, gemstone, color, diamond_color, clarity, 
          delivery_type, product_type, weight_grams, gemstone_type, 
          carat_weight, cut, diamond_type, shape, carat, polish, 
          symmetry, fluorescence, lab, created_at, purity_fraction_used, 
          net_weight, d_value, mkg, certification_cost, gemstone_cost, 
          gold_per_gram_price, d_rate_1, d_wt_1, d_wt_2, pointer_diamond, 
          diamond_weight
        `)
        .eq("user_id", user.id)
        .is("deleted_at", null);

      // Apply product type filter
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
   * Update gold rate and recalculate all jewelry product prices
   * 
   * @param newRate - The new gold rate per gram (24K)
   * @throws Error if user is not authenticated or database update fails
   */
  const updateGoldRate = useCallback(async (newRate: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Update vendor profile with new gold rate
    const { error: profileError } = await supabase
      .from("vendor_profiles")
      .update({
        gold_rate_24k_per_gram: newRate,
        gold_rate_updated_at: new Date().toISOString()
      })
      .eq("user_id", user.id);

    if (profileError) throw profileError;

    // Recalculate prices for products with weight data
    const updatedProducts = products
      .filter(p => p.net_weight || p.weight_grams)
      .map(product => {
        // Normalize purity value
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

    // Batch update all products
    const updatePromises = updatedProducts.map(update =>
      supabase.from("products").update({
        cost_price: update.cost_price,
        retail_price: update.retail_price,
        gold_per_gram_price: update.gold_per_gram_price
      }).eq("id", update.id)
    );

    await Promise.all(updatePromises);
    setGoldRate(newRate);
    await fetchProducts();
    toast.success(`Gold rate updated to ₹${newRate.toLocaleString('en-IN')}/g`);
  }, [products, fetchProducts]);

  /**
   * Initialize all data on mount with parallel fetching
   */
  useEffect(() => {
    const initializeData = async () => {
      // Check cached USD rate first
      const cachedRate = sessionStorage.getItem('usd_rate');
      const cachedTime = sessionStorage.getItem('usd_rate_time');
      if (cachedRate && cachedTime && Date.now() - parseInt(cachedTime) < 3600000) {
        setUsdRate(parseFloat(cachedRate));
      }

      // Parallel fetch for faster load
      await Promise.all([
        fetchVendorProfile(),
        fetchApprovedCategories(),
        !cachedRate ? fetchUSDRate() : Promise.resolve()
      ]);

      setInitialLoadComplete(true);
    };

    initializeData();
  }, [fetchVendorProfile, fetchApprovedCategories, fetchUSDRate]);

  /**
   * Fetch products when product type changes (after initial load)
   */
  useEffect(() => {
    if (selectedProductType && initialLoadComplete) {
      fetchProducts();
    }
  }, [selectedProductType, initialLoadComplete, fetchProducts]);

  /**
   * Get product count for a specific category
   * @param category - The category to count
   * @returns Number of products in the category
   */
  const getCategoryCount = useCallback((category: string) => {
    if (category === 'Jewellery') {
      return products.filter(p => p.product_type === 'Jewellery' || p.product_type === null).length;
    }
    return products.filter(p => p.product_type === category).length;
  }, [products]);

  /**
   * Calculate total value in INR
   */
  const totalINR = products.reduce((sum, p) => sum + (p.retail_price || 0), 0);

  /**
   * Calculate total value in USD
   */
  const totalUSD = totalINR / usdRate;

  return {
    products,
    vendorProfile,
    approvedCategories,
    loading,
    initialLoadComplete,
    // Metal rates
    metalRates: { goldRate, silverRate, platinumRate },
    usdRate,
    // Totals
    totalINR,
    totalUSD,
    // Operations
    fetchProducts,
    updateGoldRate,
    getCategoryCount
  };
};
