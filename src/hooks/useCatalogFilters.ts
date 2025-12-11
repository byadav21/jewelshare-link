/**
 * @fileoverview Custom hook for managing catalog filtering and derived filter options
 * @module hooks/useCatalogFilters
 */

import { useState, useMemo, useEffect } from "react";
import { CatalogProduct } from "./useCatalogProducts";

/**
 * Filter state structure for catalog products
 */
export interface FilterState {
  /** Filter by category name */
  category: string;
  /** Filter by metal type (Gold, Platinum, Silver) */
  metalType: string;
  /** Minimum price filter */
  minPrice: string;
  /** Maximum price filter */
  maxPrice: string;
  /** Filter by diamond color grade */
  diamondColor: string;
  /** Filter by diamond clarity grade */
  diamondClarity: string;
  /** Search query for name/SKU/description */
  searchQuery: string;
  /** Filter by delivery type */
  deliveryType: string;
  /** Minimum diamond weight in carats */
  minDiamondWeight: string;
  /** Maximum diamond weight in carats */
  maxDiamondWeight: string;
  /** Minimum net weight in grams */
  minNetWeight: string;
  /** Maximum net weight in grams */
  maxNetWeight: string;
  /** Filter by gemstone type */
  gemstoneType: string;
  /** Filter by gemstone color */
  color: string;
  /** Filter by clarity */
  clarity: string;
  /** Filter by cut grade */
  cut: string;
  /** Minimum carat weight */
  minCarat: string;
  /** Maximum carat weight */
  maxCarat: string;
  /** Filter by diamond type (Natural/Lab) */
  diamondType: string;
  /** Filter by diamond shape */
  shape: string;
  /** Filter by polish grade */
  polish: string;
  /** Filter by symmetry grade */
  symmetry: string;
  /** Filter by fluorescence */
  fluorescence: string;
  /** Filter by certification lab */
  lab: string;
}

/**
 * Initial filter state with all empty values
 */
export const initialFilterState: FilterState = {
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
 * Return type for useCatalogFilters hook
 */
interface UseCatalogFiltersReturn {
  /** Current filter state */
  filters: FilterState;
  /** Update filter state */
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  /** Filtered products based on current filters */
  filteredProducts: CatalogProduct[];
  /** Products to display (paginated) */
  displayedProducts: CatalogProduct[];
  /** Whether more products are available */
  hasMoreProducts: boolean;
  /** Current display count */
  displayCount: number;
  /** Load more products */
  loadMoreProducts: () => void;
  /** Total value in INR */
  totalINR: number;
  /** Total value in USD */
  totalUSD: number;
  /** Available categories from products */
  categories: string[];
  /** Category counts for badges */
  categoryCounts: Record<string, number>;
  /** Available metal types */
  metalTypes: string[];
  /** Available diamond colors */
  diamondColors: string[];
  /** Available diamond clarities */
  diamondClarities: string[];
  /** Available delivery types */
  deliveryTypes: string[];
}

/**
 * Natural sort comparator for product names
 * Handles names like "Ring 1", "Ring 2", "Ring 10" correctly
 * 
 * @param a - First product
 * @param b - Second product
 * @returns Sort order (-1, 0, or 1)
 */
const naturalSort = (a: CatalogProduct, b: CatalogProduct): number => {
  const matchA = a.name?.match(/^(.+?)\s*(\d+)$/);
  const matchB = b.name?.match(/^(.+?)\s*(\d+)$/);
  if (matchA && matchB && matchA[1] === matchB[1]) {
    return parseInt(matchA[2], 10) - parseInt(matchB[2], 10);
  }
  return (a.name || '').localeCompare(b.name || '');
};

/**
 * Applies filters to a product
 * 
 * @param product - Product to check
 * @param filters - Current filter state
 * @returns Whether product passes all filters
 */
const applyFilters = (product: CatalogProduct, filters: FilterState): boolean => {
  // Search query filter
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase().trim();
    const searchableFields = [
      product.name, product.category, product.sku,
      product.metal_type, product.gemstone, product.color, product.clarity,
      product.diamond_weight?.toString(), product.net_weight?.toString(),
      product.retail_price?.toString()
    ].filter(Boolean);
    if (!searchableFields.some(field => field?.toLowerCase().includes(query))) return false;
  }
  
  // Category filter
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
  if (filters.minPrice && product.retail_price < parseFloat(filters.minPrice)) return false;
  if (filters.maxPrice && product.retail_price > parseFloat(filters.maxPrice)) return false;
  
  // Diamond color filter
  if (filters.diamondColor) {
    const color = product.gemstone?.split(' ')[0];
    if (color?.toUpperCase().trim() !== filters.diamondColor.toUpperCase().trim()) return false;
  }
  
  // Diamond clarity filter
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
};

/**
 * Custom hook for managing catalog filters and derived data
 * 
 * @description Handles filter state, computes filtered products, manages pagination,
 * and derives filter options from available products.
 * 
 * @param products - Array of products to filter
 * @param usdRate - USD to INR exchange rate
 * @returns {UseCatalogFiltersReturn} Filter state and filtered products
 * 
 * @example
 * ```tsx
 * const {
 *   filters,
 *   setFilters,
 *   filteredProducts,
 *   displayedProducts,
 *   loadMoreProducts,
 *   categories,
 *   metalTypes
 * } = useCatalogFilters(products, 87.50);
 * ```
 */
export const useCatalogFilters = (
  products: CatalogProduct[],
  usdRate: number
): UseCatalogFiltersReturn => {
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [displayCount, setDisplayCount] = useState(50);
  const LOAD_MORE_COUNT = 50;

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(50);
  }, [filters]);

  // Derive unique categories from products
  const categories = useMemo(() => {
    const productCategories = products.map(p => p.category).filter(Boolean) as string[];
    return [...new Set(productCategories)].sort();
  }, [products]);

  // Count products per category
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

  // Derive unique metal types
  const metalTypes = useMemo(() => 
    [...new Set(products.map(p => p.metal_type).filter(Boolean))].sort() as string[],
    [products]
  );

  // Derive unique diamond colors
  const diamondColors = useMemo(() => 
    [...new Set(products.map(p => p.gemstone?.split(' ')[0]).filter(Boolean))].sort() as string[],
    [products]
  );

  // Derive unique diamond clarities
  const diamondClarities = useMemo(() => 
    [...new Set(products.map(p => p.gemstone?.split(' ')[1]).filter(Boolean))].sort() as string[],
    [products]
  );

  // Derive unique delivery types
  const deliveryTypes = useMemo(() => 
    [...new Set(products.map(p => p.delivery_type).filter(Boolean))].sort() as string[],
    [products]
  );

  // Apply filters and sort products
  const filteredProducts = useMemo(() => {
    const filtered = products.filter(product => applyFilters(product, filters));
    return filtered.sort(naturalSort);
  }, [products, filters]);

  // Paginate filtered products
  const displayedProducts = useMemo(() => 
    filteredProducts.slice(0, displayCount),
    [filteredProducts, displayCount]
  );

  const hasMoreProducts = filteredProducts.length > displayCount;

  // Calculate totals
  const totalINR = filteredProducts.reduce((sum, p) => sum + (p.retail_price || 0), 0);
  const totalUSD = totalINR / usdRate;

  const loadMoreProducts = () => setDisplayCount(prev => prev + LOAD_MORE_COUNT);

  return {
    filters,
    setFilters,
    filteredProducts,
    displayedProducts,
    hasMoreProducts,
    displayCount,
    loadMoreProducts,
    totalINR,
    totalUSD,
    categories,
    categoryCounts,
    metalTypes,
    diamondColors,
    diamondClarities,
    deliveryTypes,
  };
};
