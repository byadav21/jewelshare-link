import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Search } from "lucide-react";
import { JewelleryFilters } from "./filters/JewelleryFilters";
import { GemstoneFilters } from "./filters/GemstoneFilters";
import { DiamondFilters } from "./filters/DiamondFilters";

export interface FilterState {
  // Common
  searchQuery: string;
  minPrice: string;
  maxPrice: string;
  // Jewellery specific
  category: string;
  metalType: string;
  diamondColor: string;
  diamondClarity: string;
  deliveryType: string;
  // Gemstone specific
  gemstoneType: string;
  color: string;
  clarity: string;
  cut: string;
  minCarat: string;
  maxCarat: string;
  // Diamond specific
  diamondType: string;
  shape: string;
  polish: string;
  symmetry: string;
  fluorescence: string;
  lab: string;
}

interface CatalogFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  productType: string;
  // Jewellery filters
  categories: string[];
  metalTypes: string[];
  diamondColors: string[];
  diamondClarities: string[];
  deliveryTypes: string[];
  categoryCounts?: Record<string, number>;
  // Gemstone filters
  gemstoneTypes: string[];
  colors: string[];
  clarities: string[];
  cuts: string[];
  // Diamond filters
  shapes: string[];
  polishes: string[];
  symmetries: string[];
  fluorescences: string[];
  labs: string[];
}

export const CatalogFilters = ({
  filters,
  onFilterChange,
  productType,
  categories,
  metalTypes,
  diamondColors,
  diamondClarities,
  deliveryTypes,
  categoryCounts = {},
  gemstoneTypes = [],
  colors = [],
  clarities = [],
  cuts = [],
  shapes = [],
  polishes = [],
  symmetries = [],
  fluorescences = [],
  labs = [],
}: CatalogFiltersProps) => {
  const updateFilter = (key: string, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    const baseFilters: FilterState = {
      searchQuery: "",
      minPrice: "",
      maxPrice: "",
      category: "",
      metalType: "",
      diamondColor: "",
      diamondClarity: "",
      deliveryType: "",
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
      lab: "",
    };
    onFilterChange(baseFilters);
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== "");

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-foreground">Filter Catalog</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm">
            <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-3 sm:mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search products..."
            value={filters.searchQuery}
            onChange={(e) => updateFilter("searchQuery", e.target.value)}
            className="pl-9 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base"
          />
        </div>
      </div>

      <div className={`grid grid-cols-1 gap-2 sm:gap-4`}>
        {productType === 'Jewellery' && (
          <JewelleryFilters
            filters={filters}
            updateFilter={updateFilter}
            categories={categories}
            metalTypes={metalTypes}
            diamondColors={diamondColors}
            diamondClarities={diamondClarities}
            deliveryTypes={deliveryTypes}
            categoryCounts={categoryCounts}
          />
        )}
        {productType === 'Gemstones' && (
          <GemstoneFilters
            filters={filters}
            updateFilter={updateFilter}
            gemstoneTypes={gemstoneTypes}
            colors={colors}
            clarities={clarities}
            cuts={cuts}
          />
        )}
        {productType === 'Loose Diamonds' && (
          <DiamondFilters
            filters={filters}
            updateFilter={updateFilter}
            shapes={shapes}
            colors={colors}
            clarities={clarities}
            cuts={cuts}
            polishes={polishes}
            symmetries={symmetries}
            fluorescences={fluorescences}
            labs={labs}
          />
        )}
      </div>
    </div>
  );
};
