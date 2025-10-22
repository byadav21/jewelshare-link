import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Search } from "lucide-react";

export interface FilterState {
  category: string;
  metalType: string;
  minPrice: string;
  maxPrice: string;
  diamondColor: string;
  diamondClarity: string;
  searchQuery: string;
}

interface CatalogFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  categories: string[];
  metalTypes: string[];
  diamondColors: string[];
  diamondClarities: string[];
}

export const CatalogFilters = ({
  filters,
  onFilterChange,
  categories,
  metalTypes,
  diamondColors,
  diamondClarities,
}: CatalogFiltersProps) => {
  const updateFilter = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      category: "",
      metalType: "",
      minPrice: "",
      maxPrice: "",
      diamondColor: "",
      diamondClarity: "",
      searchQuery: "",
    });
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

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-4">
        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="category" className="text-xs sm:text-sm">Category</Label>
          <Select value={filters.category || "all"} onValueChange={(v) => updateFilter("category", v === "all" ? "" : v)}>
            <SelectTrigger id="category" className="h-9 sm:h-10 text-xs sm:text-sm">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px] overflow-y-auto bg-popover z-50">
              <SelectItem value="all" className="text-xs sm:text-sm">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat} className="text-xs sm:text-sm">{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="metal" className="text-xs sm:text-sm">Metal</Label>
          <Select value={filters.metalType || "all"} onValueChange={(v) => updateFilter("metalType", v === "all" ? "" : v)}>
            <SelectTrigger id="metal" className="h-9 sm:h-10 text-xs sm:text-sm">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="all" className="text-xs sm:text-sm">All Metals</SelectItem>
              {metalTypes.map((metal) => (
                <SelectItem key={metal} value={metal} className="text-xs sm:text-sm">{metal}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="minPrice" className="text-xs sm:text-sm">Min (₹)</Label>
          <Input
            id="minPrice"
            type="number"
            placeholder="0"
            value={filters.minPrice}
            onChange={(e) => updateFilter("minPrice", e.target.value)}
            className="h-9 sm:h-10 text-xs sm:text-sm"
          />
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="maxPrice" className="text-xs sm:text-sm">Max (₹)</Label>
          <Input
            id="maxPrice"
            type="number"
            placeholder="No limit"
            value={filters.maxPrice}
            onChange={(e) => updateFilter("maxPrice", e.target.value)}
            className="h-9 sm:h-10 text-xs sm:text-sm"
          />
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="diamondColor" className="text-xs sm:text-sm">Color</Label>
          <Select value={filters.diamondColor || "all"} onValueChange={(v) => updateFilter("diamondColor", v === "all" ? "" : v)}>
            <SelectTrigger id="diamondColor" className="h-9 sm:h-10 text-xs sm:text-sm">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="all" className="text-xs sm:text-sm">All Colors</SelectItem>
              {diamondColors.map((color) => (
                <SelectItem key={color} value={color} className="text-xs sm:text-sm">{color}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="diamondClarity" className="text-xs sm:text-sm">Clarity</Label>
          <Select value={filters.diamondClarity || "all"} onValueChange={(v) => updateFilter("diamondClarity", v === "all" ? "" : v)}>
            <SelectTrigger id="diamondClarity" className="h-9 sm:h-10 text-xs sm:text-sm">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="all" className="text-xs sm:text-sm">All Clarities</SelectItem>
              {diamondClarities.map((clarity) => (
                <SelectItem key={clarity} value={clarity} className="text-xs sm:text-sm">{clarity}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
