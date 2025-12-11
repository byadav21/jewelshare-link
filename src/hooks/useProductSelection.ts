/**
 * @fileoverview Custom hook for managing product selection state and bulk operations
 * @module hooks/useProductSelection
 */

import { useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CatalogProduct } from "./useCatalogProducts";

/**
 * Selected product data for display purposes
 */
export interface SelectedProductData {
  id: string;
  name: string;
  sku: string | null;
}

/**
 * Return type for useProductSelection hook
 */
interface UseProductSelectionReturn {
  /** Set of selected product IDs */
  selectedProducts: Set<string>;
  /** Toggle selection for a single product */
  toggleProductSelection: (productId: string) => void;
  /** Toggle selection for all products */
  toggleSelectAll: () => void;
  /** Clear all selections */
  clearSelection: () => void;
  /** Data for selected products */
  selectedProductsData: SelectedProductData[];
  /** Delete selected products (soft delete) */
  handleDeleteSelected: () => Promise<void>;
  /** Bulk update selected products */
  handleBulkUpdate: (updates: Record<string, any>) => Promise<void>;
  /** Whether delete operation is in progress */
  isDeleting: boolean;
  /** Delete confirmation dialog state */
  deleteDialogOpen: boolean;
  /** Set delete dialog open state */
  setDeleteDialogOpen: (open: boolean) => void;
  /** Bulk edit dialog state */
  bulkEditOpen: boolean;
  /** Set bulk edit dialog open state */
  setBulkEditOpen: (open: boolean) => void;
}

/**
 * Custom hook for managing product selection and bulk operations
 * 
 * @description Handles multi-select functionality for products including
 * selection state, bulk delete, and bulk update operations.
 * 
 * @param products - Array of all products
 * @param fetchProducts - Function to refetch products after operations
 * @returns {UseProductSelectionReturn} Selection state and operation handlers
 * 
 * @example
 * ```tsx
 * const {
 *   selectedProducts,
 *   toggleProductSelection,
 *   handleDeleteSelected,
 *   handleBulkUpdate
 * } = useProductSelection(products, fetchProducts);
 * ```
 */
export const useProductSelection = (
  products: CatalogProduct[],
  fetchProducts: () => Promise<void>
): UseProductSelectionReturn => {
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);

  /**
   * Toggle selection for a single product
   * @param productId - ID of product to toggle
   */
  const toggleProductSelection = useCallback((productId: string) => {
    setSelectedProducts(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(productId)) {
        newSelected.delete(productId);
      } else {
        newSelected.add(productId);
      }
      return newSelected;
    });
  }, []);

  /**
   * Toggle selection for all products
   */
  const toggleSelectAll = useCallback(() => {
    setSelectedProducts(prev => 
      prev.size === products.length ? new Set() : new Set(products.map(p => p.id))
    );
  }, [products]);

  /**
   * Clear all selections
   */
  const clearSelection = useCallback(() => {
    setSelectedProducts(new Set());
  }, []);

  /**
   * Get data for selected products
   */
  const selectedProductsData = useMemo(() => {
    return products
      .filter(p => selectedProducts.has(p.id))
      .map(p => ({ id: p.id, name: p.name, sku: p.sku }));
  }, [products, selectedProducts]);

  /**
   * Soft delete selected products
   * Sets deleted_at timestamp instead of permanent deletion
   */
  const handleDeleteSelected = useCallback(async () => {
    setIsDeleting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to delete products");
        return;
      }
      
      const { error } = await supabase
        .from("products")
        .update({ deleted_at: new Date().toISOString() })
        .in("id", Array.from(selectedProducts))
        .eq("user_id", user.id);
      
      if (error) throw error;
      
      toast.success(`${selectedProducts.size} product(s) deleted`);
      setSelectedProducts(new Set());
      setDeleteDialogOpen(false);
      await fetchProducts();
    } catch (error: any) {
      toast.error(`Failed to delete: ${error.message || 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  }, [selectedProducts, fetchProducts]);

  /**
   * Bulk update selected products with given values
   * 
   * @param updates - Object containing field updates and optional pricingAdjustment
   */
  const handleBulkUpdate = useCallback(async (updates: Record<string, any>) => {
    if (selectedProducts.size === 0) {
      toast.error("No products selected");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const pricingAdjustment = updates.pricingAdjustment;
      delete updates.pricingAdjustment;

      // Format numeric fields
      const formattedUpdates: Record<string, any> = {};
      Object.entries(updates).forEach(([key, value]) => {
        if (value === "" || value === null) return;
        if (['cost_price', 'retail_price', 'weight_grams', 'stock_quantity', 'dispatches_in_days'].includes(key)) {
          const numValue = parseFloat(value as string);
          if (!isNaN(numValue) && numValue >= 0) formattedUpdates[key] = numValue;
        } else if (key === 'purity_fraction_used') {
          const numValue = parseFloat(value as string);
          if (!isNaN(numValue) && numValue >= 0) {
            formattedUpdates[key] = numValue > 1 ? numValue / 100 : numValue;
          }
        } else {
          formattedUpdates[key] = value;
        }
      });

      // Handle percentage-based pricing adjustments
      if (pricingAdjustment && pricingAdjustment.percentage > 0) {
        const { data: currentProducts, error: fetchError } = await supabase
          .from("products")
          .select("id, cost_price, retail_price")
          .in("id", Array.from(selectedProducts))
          .eq("user_id", user.id);

        if (fetchError) throw fetchError;

        if (currentProducts) {
          const updatePromises = currentProducts.map(async (product) => {
            const multiplier = pricingAdjustment.type === 'markup' 
              ? (1 + pricingAdjustment.percentage / 100)
              : (1 - pricingAdjustment.percentage / 100);

            return supabase.from("products").update({
              ...formattedUpdates,
              cost_price: formattedUpdates.cost_price || Math.max(0, product.cost_price * multiplier),
              retail_price: formattedUpdates.retail_price || Math.max(0, product.retail_price * multiplier),
            }).eq("id", product.id).eq("user_id", user.id);
          });

          await Promise.all(updatePromises);
          toast.success(`${selectedProducts.size} product(s) updated`);
        }
      } else {
        if (Object.keys(formattedUpdates).length === 0) {
          toast.error("No changes to update");
          return;
        }

        const { error } = await supabase
          .from("products")
          .update(formattedUpdates)
          .in("id", Array.from(selectedProducts))
          .eq("user_id", user.id);
        
        if (error) throw error;
        toast.success(`${selectedProducts.size} product(s) updated`);
      }
      
      setSelectedProducts(new Set());
      await fetchProducts();
    } catch (error: any) {
      toast.error(`Failed to update: ${error.message || 'Unknown error'}`);
    }
  }, [selectedProducts, fetchProducts]);

  return {
    selectedProducts,
    toggleProductSelection,
    toggleSelectAll,
    clearSelection,
    selectedProductsData,
    handleDeleteSelected,
    handleBulkUpdate,
    isDeleting,
    deleteDialogOpen,
    setDeleteDialogOpen,
    bulkEditOpen,
    setBulkEditOpen,
  };
};
