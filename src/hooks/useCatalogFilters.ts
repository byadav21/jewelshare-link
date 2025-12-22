import { useState, useMemo, useCallback } from "react";
import { FilterState } from "@/components/CatalogFilters";

/**
 * Product interface for catalog filtering operations
 */
interface Product {
  id: string;
  name: string;
  sku?: string;
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
  polish?: string;
  symmetry?: string;
  fluorescence?: string;
  lab?: string;
  retail_price?: number;
  diamond_weight?: number;
  net_weight?: number;
  description?: string;
}

/**
 * Initial filter state with all empty values
 */
const initialFilterState: FilterState = {
  category: "",
  metalType: "",
  minPrice: "",
  maxPrice: "",
  diamondColor: "",
  diamondClarity: "",
  searchQuery: "",
  deliveryType: "",
  minDiamondWeight: "",
  maxDiamondWeight: "",
  minNetWeight: "",
  maxNetWeight: "",
  gemstoneType: "",
  color: "",
  clarity: "",
  cut: "",
  minCarat: "",
  maxCarat: "",
  diamondType: "",
  shape: "",
  polish: "",
  symmetry: "",
  fluorescence: "",
  lab: ""
};

/**
 * Custom hook for managing catalog product filtering logic
 * 
 * @description Provides comprehensive filtering capabilities for product catalogs,
 * including search, category filtering, price ranges, and various product attributes.
 * Automatically derives filter options from the provided products array.
 * 
 * @param products - Array of products to filter
 * @returns Object containing filter state, setters, filtered products, and derived filter options
 * 
 * @example
 * ```tsx
 * const { filters, setFilters, filteredProducts, categories } = useCatalogFilters(products);
 * ```
 */
export const useCatalogFilters = (products: Product[]) => {
  const [filters, setFilters] = useState<FilterState>(initialFilterState);

  /**
   * Reset all filters to their initial state
   */
  const resetFilters = useCallback(() => {
    setFilters(initialFilterState);
  }, []);

  /**
   * Update a single filter value
   * @param key - The filter key to update
   * @param value - The new value for the filter
   */
  const updateFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  /**
   * Derive unique categories from products with natural sorting
   */
  const categories = useMemo(() => {
    const productCategories = products.map(p => p.category).filter(Boolean) as string[];
    return [...new Set(productCategories)].sort();
  }, [products]);

  /**
   * Calculate product counts per category for display
   */
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    products.forEach(p => {
      if (p.category) {
        const cat = p.category.toUpperCase().trim();
        counts[cat] = (counts[cat] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  /**
   * Derive unique metal types from products
   */
  const metalTypes = useMemo(() => 
    [...new Set(products.map(p => p.metal_type).filter(Boolean))].sort(), 
    [products]
  );

  /**
   * Derive unique diamond colors from gemstone field
   */
  const diamondColors = useMemo(() => 
    [...new Set(products.map(p => p.gemstone?.split(' ')[0]).filter(Boolean))].sort(), 
    [products]
  );

  /**
   * Derive unique diamond clarities from gemstone field
   */
  const diamondClarities = useMemo(() => 
    [...new Set(products.map(p => p.gemstone?.split(' ')[1]).filter(Boolean))].sort(), 
    [products]
  );

  /**
   * Derive unique delivery types from products
   */
  const deliveryTypes = useMemo(() => 
    [...new Set(products.map(p => p.delivery_type).filter(Boolean))].sort(), 
    [products]
  );

  /**
   * Apply all active filters to the products array
   * Includes natural sorting by product name
   */
  const filteredProducts = useMemo(() => {
    const filtered = products.filter(product => {
      // Search query filter - searches across multiple fields
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase().trim();
        const searchableFields = [
          product.name, product.category, product.sku, product.description,
          product.metal_type, product.gemstone, product.color, product.clarity,
          product.diamond_weight?.toString(), product.net_weight?.toString(),
          product.retail_price?.toString()
        ].filter(Boolean);
        if (!searchableFields.some(field => field?.toLowerCase().includes(query))) return false;
      }

      // Category filter with fallback to name matching
      if (filters.category) {
        const categoryMatch = product.category?.toUpperCase().trim() === filters.category.toUpperCase().trim();
        const nameMatch = product.name?.toUpperCase().trim().includes(filters.category.toUpperCase().trim());
        if (!categoryMatch && !nameMatch) return false;
      }

      // Metal type filter
      if (filters.metalType && product.metal_type?.toUpperCase().trim() !== filters.metalType.toUpperCase().trim()) {
        return false;
      }

      // Price range filters
      if (filters.minPrice && (product.retail_price ?? 0) < parseFloat(filters.minPrice)) return false;
      if (filters.maxPrice && (product.retail_price ?? 0) > parseFloat(filters.maxPrice)) return false;

      // Diamond color filter (from gemstone field)
      if (filters.diamondColor) {
        const color = product.gemstone?.split(' ')[0];
        if (color?.toUpperCase().trim() !== filters.diamondColor.toUpperCase().trim()) return false;
      }

      // Diamond clarity filter (from gemstone field)
      if (filters.diamondClarity) {
        const clarity = product.gemstone?.split(' ')[1];
        if (clarity?.toUpperCase().trim() !== filters.diamondClarity.toUpperCase().trim()) return false;
      }

      // Delivery type filter
      if (filters.deliveryType && product.delivery_type !== filters.deliveryType) return false;

      // Diamond weight range filters
      if (filters.minDiamondWeight) {
        const minDW = parseFloat(filters.minDiamondWeight);
        if (!product.diamond_weight || product.diamond_weight < minDW) return false;
      }
      if (filters.maxDiamondWeight) {
        const maxDW = parseFloat(filters.maxDiamondWeight);
        if (!product.diamond_weight || product.diamond_weight > maxDW) return false;
      }

      // Net weight range filters
      if (filters.minNetWeight) {
        const minNW = parseFloat(filters.minNetWeight);
        if (!product.net_weight || product.net_weight < minNW) return false;
      }
      if (filters.maxNetWeight) {
        const maxNW = parseFloat(filters.maxNetWeight);
        if (!product.net_weight || product.net_weight > maxNW) return false;
      }

      return true;
    });

    // Natural sort by name (handles numbered suffixes correctly)
    return filtered.sort((a, b) => {
      const matchA = a.name?.match(/^(.+?)\s*(\d+)$/);
      const matchB = b.name?.match(/^(.+?)\s*(\d+)$/);
      if (matchA && matchB && matchA[1] === matchB[1]) {
        return parseInt(matchA[2], 10) - parseInt(matchB[2], 10);
      }
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [products, filters]);

  /**
   * Check if any filters are currently active
   */
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value => value !== "");
  }, [filters]);

  return {
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    filteredProducts,
    hasActiveFilters,
    // Derived filter options
    categories,
    categoryCounts,
    metalTypes,
    diamondColors,
    diamondClarities,
    deliveryTypes
  };
};
