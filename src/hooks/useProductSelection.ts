<<<<<<< HEAD
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
=======
import { useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Product data interface for selection operations
 */
interface ProductData {
  id: string;
  name?: string;
  sku?: string;
}

/**
 * Configuration options for the useProductSelection hook
 */
interface UseProductSelectionOptions {
  /** Callback function to refresh products after operations */
  onRefresh?: () => Promise<void>;
}

/**
 * Custom hook for managing product selection state and bulk operations
 * 
 * @description Provides comprehensive product selection management including
 * toggle selection, select all, bulk delete, and bulk update operations.
 * Handles optimistic updates and error recovery.
 * 
 * @param products - Array of products available for selection
 * @param options - Configuration options including refresh callback
 * @returns Object containing selection state and operations
>>>>>>> f8f5b981de15e2f7f8505da3d51bfb9b99f0dcdf
 * 
 * @example
 * ```tsx
 * const {
 *   selectedProducts,
<<<<<<< HEAD
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
=======
 *   toggleSelection,
 *   selectAll,
 *   clearSelection,
 *   deleteSelected,
 *   bulkUpdate
 * } = useProductSelection(products, { onRefresh: fetchProducts });
 * ```
 */
export const useProductSelection = (
  products: ProductData[],
  options: UseProductSelectionOptions = {}
) => {
  const { onRefresh } = options;
  
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  /**
   * Toggle selection state for a single product
   * @param productId - The ID of the product to toggle
   */
  const toggleSelection = useCallback((productId: string) => {
>>>>>>> f8f5b981de15e2f7f8505da3d51bfb9b99f0dcdf
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
<<<<<<< HEAD
   */
  const toggleSelectAll = useCallback(() => {
    setSelectedProducts(prev => 
      prev.size === products.length ? new Set() : new Set(products.map(p => p.id))
    );
=======
   * If all are selected, deselect all. Otherwise, select all.
   */
  const selectAll = useCallback(() => {
    setSelectedProducts(prev => {
      if (prev.size === products.length) {
        return new Set();
      }
      return new Set(products.map(p => p.id));
    });
>>>>>>> f8f5b981de15e2f7f8505da3d51bfb9b99f0dcdf
  }, [products]);

  /**
   * Clear all selections
   */
  const clearSelection = useCallback(() => {
    setSelectedProducts(new Set());
  }, []);

  /**
<<<<<<< HEAD
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
=======
   * Select specific products by their IDs
   * @param productIds - Array of product IDs to select
   */
  const selectProducts = useCallback((productIds: string[]) => {
    setSelectedProducts(new Set(productIds));
  }, []);

  /**
   * Check if a specific product is selected
   * @param productId - The ID of the product to check
   * @returns Boolean indicating if the product is selected
   */
  const isSelected = useCallback((productId: string) => {
    return selectedProducts.has(productId);
  }, [selectedProducts]);

  /**
   * Soft delete selected products (sets deleted_at timestamp)
   * @returns Promise resolving to success status
   */
  const deleteSelected = useCallback(async (): Promise<boolean> => {
    if (selectedProducts.size === 0) {
      toast.error("No products selected");
      return false;
    }

>>>>>>> f8f5b981de15e2f7f8505da3d51bfb9b99f0dcdf
    setIsDeleting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to delete products");
<<<<<<< HEAD
        return;
      }
      
=======
        return false;
      }

>>>>>>> f8f5b981de15e2f7f8505da3d51bfb9b99f0dcdf
      const { error } = await supabase
        .from("products")
        .update({ deleted_at: new Date().toISOString() })
        .in("id", Array.from(selectedProducts))
        .eq("user_id", user.id);
<<<<<<< HEAD
      
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

=======

      if (error) throw error;

      const count = selectedProducts.size;
      toast.success(`${count} product(s) deleted`);
      setSelectedProducts(new Set());
      
      if (onRefresh) {
        await onRefresh();
      }
      
      return true;
    } catch (error: any) {
      toast.error(`Failed to delete: ${error.message || 'Unknown error'}`);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [selectedProducts, onRefresh]);

  /**
   * Bulk update selected products with provided field values
   * 
   * @param updates - Object containing field updates and optional pricing adjustment
   * @returns Promise resolving to success status
   * 
   * @example
   * ```tsx
   * await bulkUpdate({
   *   category: "Rings",
   *   pricingAdjustment: { type: 'markup', percentage: 10 }
   * });
   * ```
   */
  const bulkUpdate = useCallback(async (
    updates: Record<string, any>
  ): Promise<boolean> => {
    if (selectedProducts.size === 0) {
      toast.error("No products selected");
      return false;
    }

    setIsUpdating(true);
>>>>>>> f8f5b981de15e2f7f8505da3d51bfb9b99f0dcdf
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

<<<<<<< HEAD
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
=======
      // Extract pricing adjustment if present
      const pricingAdjustment = updates.pricingAdjustment;
      delete updates.pricingAdjustment;

      // Format updates, handling special field types
      const formattedUpdates: Record<string, any> = {};
      Object.entries(updates).forEach(([key, value]) => {
        if (value === "" || value === null) return;
        
        // Handle numeric fields
        if (['cost_price', 'retail_price', 'weight_grams', 'stock_quantity', 'dispatches_in_days'].includes(key)) {
          const numValue = parseFloat(value as string);
          if (!isNaN(numValue) && numValue >= 0) {
            formattedUpdates[key] = numValue;
          }
        } else if (key === 'purity_fraction_used') {
          // Handle purity as decimal
>>>>>>> f8f5b981de15e2f7f8505da3d51bfb9b99f0dcdf
          const numValue = parseFloat(value as string);
          if (!isNaN(numValue) && numValue >= 0) {
            formattedUpdates[key] = numValue > 1 ? numValue / 100 : numValue;
          }
        } else {
          formattedUpdates[key] = value;
        }
      });

<<<<<<< HEAD
      // Handle percentage-based pricing adjustments
=======
      // Handle pricing adjustments (markup/markdown)
>>>>>>> f8f5b981de15e2f7f8505da3d51bfb9b99f0dcdf
      if (pricingAdjustment && pricingAdjustment.percentage > 0) {
        const { data: currentProducts, error: fetchError } = await supabase
          .from("products")
          .select("id, cost_price, retail_price")
          .in("id", Array.from(selectedProducts))
          .eq("user_id", user.id);

        if (fetchError) throw fetchError;

        if (currentProducts) {
          const updatePromises = currentProducts.map(async (product) => {
<<<<<<< HEAD
            const multiplier = pricingAdjustment.type === 'markup' 
=======
            const multiplier = pricingAdjustment.type === 'markup'
>>>>>>> f8f5b981de15e2f7f8505da3d51bfb9b99f0dcdf
              ? (1 + pricingAdjustment.percentage / 100)
              : (1 - pricingAdjustment.percentage / 100);

            return supabase.from("products").update({
              ...formattedUpdates,
              cost_price: formattedUpdates.cost_price || Math.max(0, product.cost_price * multiplier),
              retail_price: formattedUpdates.retail_price || Math.max(0, product.retail_price * multiplier),
            }).eq("id", product.id).eq("user_id", user.id);
          });

          await Promise.all(updatePromises);
<<<<<<< HEAD
          toast.success(`${selectedProducts.size} product(s) updated`);
=======
>>>>>>> f8f5b981de15e2f7f8505da3d51bfb9b99f0dcdf
        }
      } else {
        if (Object.keys(formattedUpdates).length === 0) {
          toast.error("No changes to update");
<<<<<<< HEAD
          return;
=======
          return false;
>>>>>>> f8f5b981de15e2f7f8505da3d51bfb9b99f0dcdf
        }

        const { error } = await supabase
          .from("products")
          .update(formattedUpdates)
          .in("id", Array.from(selectedProducts))
          .eq("user_id", user.id);
<<<<<<< HEAD
        
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
=======

        if (error) throw error;
      }

      const count = selectedProducts.size;
      toast.success(`${count} product(s) updated`);
      setSelectedProducts(new Set());
      
      if (onRefresh) {
        await onRefresh();
      }
      
      return true;
    } catch (error: any) {
      toast.error(`Failed to update: ${error.message || 'Unknown error'}`);
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [selectedProducts, onRefresh]);

  /**
   * Get data for selected products (useful for dialogs)
   */
  const selectedProductsData = useMemo(() => {
    return products.filter(p => selectedProducts.has(p.id));
  }, [products, selectedProducts]);

  /**
   * Check if all products are currently selected
   */
  const allSelected = useMemo(() => {
    return products.length > 0 && selectedProducts.size === products.length;
  }, [products.length, selectedProducts.size]);

  /**
   * Check if some (but not all) products are selected
   */
  const someSelected = useMemo(() => {
    return selectedProducts.size > 0 && selectedProducts.size < products.length;
  }, [products.length, selectedProducts.size]);

  return {
    selectedProducts,
    selectedCount: selectedProducts.size,
    selectedProductsData,
    isDeleting,
    isUpdating,
    allSelected,
    someSelected,
    // Operations
    toggleSelection,
    selectAll,
    clearSelection,
    selectProducts,
    isSelected,
    deleteSelected,
    bulkUpdate
>>>>>>> f8f5b981de15e2f7f8505da3d51bfb9b99f0dcdf
  };
};
