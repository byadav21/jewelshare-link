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
    <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Filter Catalog</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by product type, diamond color, weight, clarity, costs, USD, or any product field..."
            value={filters.searchQuery}
            onChange={(e) => updateFilter("searchQuery", e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={filters.category || undefined} onValueChange={(v) => updateFilter("category", v)}>
            <SelectTrigger id="category">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="metal">Metal Type</Label>
          <Select value={filters.metalType || undefined} onValueChange={(v) => updateFilter("metalType", v)}>
            <SelectTrigger id="metal">
              <SelectValue placeholder="All Metals" />
            </SelectTrigger>
            <SelectContent>
              {metalTypes.map((metal) => (
                <SelectItem key={metal} value={metal}>{metal}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="minPrice">Min Price (₹)</Label>
          <Input
            id="minPrice"
            type="number"
            placeholder="0"
            value={filters.minPrice}
            onChange={(e) => updateFilter("minPrice", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxPrice">Max Price (₹)</Label>
          <Input
            id="maxPrice"
            type="number"
            placeholder="No limit"
            value={filters.maxPrice}
            onChange={(e) => updateFilter("maxPrice", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="diamondColor">Diamond Color</Label>
          <Select value={filters.diamondColor || undefined} onValueChange={(v) => updateFilter("diamondColor", v)}>
            <SelectTrigger id="diamondColor">
              <SelectValue placeholder="All Colors" />
            </SelectTrigger>
            <SelectContent>
              {diamondColors.map((color) => (
                <SelectItem key={color} value={color}>{color}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="diamondClarity">Diamond Clarity</Label>
          <Select value={filters.diamondClarity || undefined} onValueChange={(v) => updateFilter("diamondClarity", v)}>
            <SelectTrigger id="diamondClarity">
              <SelectValue placeholder="All Clarity" />
            </SelectTrigger>
            <SelectContent>
              {diamondClarities.map((clarity) => (
                <SelectItem key={clarity} value={clarity}>{clarity}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
