/**
 * @fileoverview Products grid component for displaying catalog products
 * @module components/catalog/ProductsGrid
 */

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductCard } from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";
import { Plus } from "lucide-react";
import { CatalogProduct } from "@/hooks/useCatalogProducts";

/**
 * Props for ProductsGrid component
 */
interface ProductsGridProps {
  /** Products to display */
  products: CatalogProduct[];
  /** All products for pagination info */
  allFilteredCount: number;
  /** Whether data is loading */
  loading: boolean;
  /** Set of selected product IDs */
  selectedProducts: Set<string>;
  /** Callback for toggling product selection */
  onToggleSelection: (productId: string) => void;
  /** Callback for toggling all selections */
  onToggleSelectAll: () => void;
  /** Total product count for select all */
  totalCount: number;
  /** USD to INR exchange rate */
  usdRate: number;
  /** Whether user can add products */
  canAddProducts: boolean;
  /** Whether user can delete products */
  canDeleteProducts: boolean;
  /** Whether more products are available to load */
  hasMore: boolean;
  /** Callback for loading more products */
  onLoadMore: () => void;
  /** Current display count */
  displayCount: number;
}

/**
 * Products grid component with selection and pagination
 * 
 * @description Displays products in a responsive grid layout with
 * selection checkboxes, skeleton loading states, and load more functionality.
 * 
 * @param props - Component props
 * @returns React component
 * 
 * @example
 * ```tsx
 * <ProductsGrid
 *   products={displayedProducts}
 *   allFilteredCount={filteredProducts.length}
 *   loading={loading}
 *   selectedProducts={selectedProducts}
 *   onToggleSelection={toggleProductSelection}
 *   onToggleSelectAll={toggleSelectAll}
 *   totalCount={products.length}
 *   usdRate={87.50}
 *   canAddProducts={true}
 *   canDeleteProducts={true}
 *   hasMore={hasMoreProducts}
 *   onLoadMore={loadMoreProducts}
 *   displayCount={50}
 * />
 * ```
 */
export const ProductsGrid = ({
  products,
  allFilteredCount,
  loading,
  selectedProducts,
  onToggleSelection,
  onToggleSelectAll,
  totalCount,
  usdRate,
  canAddProducts,
  canDeleteProducts,
  hasMore,
  onLoadMore,
  displayCount,
}: ProductsGridProps) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">💎</div>
        <h3 className="text-xl font-semibold mb-2">No products found</h3>
        <p className="text-muted-foreground mb-4">Add your first product to get started</p>
        {canAddProducts && (
          <Button onClick={() => navigate("/add-product")}>
            <Plus className="h-4 w-4 mr-2" />Add Product
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Select All Checkbox */}
      {canDeleteProducts && totalCount > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <Checkbox
            checked={selectedProducts.size === totalCount && totalCount > 0}
            onCheckedChange={onToggleSelectAll}
            id="select-all"
          />
          <label htmlFor="select-all" className="text-sm text-muted-foreground cursor-pointer">
            Select All ({selectedProducts.size}/{totalCount})
          </label>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isSelected={selectedProducts.has(product.id)}
            onToggleSelection={onToggleSelection}
            usdRate={usdRate}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <Button variant="outline" size="lg" onClick={onLoadMore}>
            Load More ({allFilteredCount - displayCount} remaining)
          </Button>
        </div>
      )}

      {/* Results Summary */}
      <div className="mt-6 text-center text-sm text-muted-foreground">
        Showing {products.length} of {allFilteredCount} products
      </div>
    </div>
  );
};
