import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface JewelleryFiltersProps {
  filters: any;
  updateFilter: (key: string, value: string) => void;
  categories: string[];
  metalTypes: string[];
  diamondColors: string[];
  diamondClarities: string[];
  deliveryTypes: string[];
  categoryCounts?: Record<string, number>;
}

export const JewelleryFilters = ({
  filters,
  updateFilter,
  categories,
  metalTypes,
  diamondColors,
  diamondClarities,
  deliveryTypes,
  categoryCounts = {},
}: JewelleryFiltersProps) => {
  return (
    <>
      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="category" className="text-xs sm:text-sm font-semibold">Category</Label>
        <Select value={filters.category || "all"} onValueChange={(v) => updateFilter("category", v === "all" ? "" : v)}>
          <SelectTrigger id="category" className="h-9 sm:h-10 text-xs sm:text-sm">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px] overflow-y-auto bg-background border border-border shadow-lg z-[100]">
            <SelectItem value="all" className="text-xs sm:text-sm">
              <div className="flex items-center justify-between w-full gap-2">
                <span>All Categories</span>
                {categoryCounts['all'] !== undefined && (
                  <Badge variant="secondary" className="text-xs ml-2">
                    {categoryCounts['all']}
                  </Badge>
                )}
              </div>
            </SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat} className="text-xs sm:text-sm">
                <div className="flex items-center justify-between w-full gap-2">
                  <span>{cat}</span>
                  {categoryCounts[cat.toUpperCase().trim()] !== undefined && (
                    <Badge variant="secondary" className="text-xs ml-2">
                      {categoryCounts[cat.toUpperCase().trim()]}
                    </Badge>
                  )}
                </div>
              </SelectItem>
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
          <SelectContent className="bg-background border border-border shadow-lg z-[100]">
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
        <Label htmlFor="diamondColor" className="text-xs sm:text-sm">Diamond Color</Label>
        <Select value={filters.diamondColor || "all"} onValueChange={(v) => updateFilter("diamondColor", v === "all" ? "" : v)}>
          <SelectTrigger id="diamondColor" className="h-9 sm:h-10 text-xs sm:text-sm">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent className="bg-background border border-border shadow-lg z-[100]">
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
          <SelectContent className="bg-background border border-border shadow-lg z-[100]">
            <SelectItem value="all" className="text-xs sm:text-sm">All Clarities</SelectItem>
            {diamondClarities.map((clarity) => (
              <SelectItem key={clarity} value={clarity} className="text-xs sm:text-sm">{clarity}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="deliveryType" className="text-xs sm:text-sm">Delivery</Label>
        <Select value={filters.deliveryType || "all"} onValueChange={(v) => updateFilter("deliveryType", v === "all" ? "" : v)}>
          <SelectTrigger id="deliveryType" className="h-9 sm:h-10 text-xs sm:text-sm">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent className="bg-background border border-border shadow-lg z-[100]">
            <SelectItem value="all" className="text-xs sm:text-sm">All Types</SelectItem>
            {deliveryTypes.map((type) => (
              <SelectItem key={type} value={type} className="text-xs sm:text-sm">
                {type === 'immediate' ? 'Immediate Dispatch' : 'Scheduled Delivery'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="minDiamondWeight" className="text-xs sm:text-sm">Min D.WT (ct)</Label>
        <Input
          id="minDiamondWeight"
          type="number"
          placeholder="0"
          step="0.01"
          value={filters.minDiamondWeight}
          onChange={(e) => updateFilter("minDiamondWeight", e.target.value)}
          className="h-9 sm:h-10 text-xs sm:text-sm"
        />
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="maxDiamondWeight" className="text-xs sm:text-sm">Max D.WT (ct)</Label>
        <Input
          id="maxDiamondWeight"
          type="number"
          placeholder="No limit"
          step="0.01"
          value={filters.maxDiamondWeight}
          onChange={(e) => updateFilter("maxDiamondWeight", e.target.value)}
          className="h-9 sm:h-10 text-xs sm:text-sm"
        />
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="minNetWeight" className="text-xs sm:text-sm">Min Net WT (g)</Label>
        <Input
          id="minNetWeight"
          type="number"
          placeholder="0"
          step="0.01"
          value={filters.minNetWeight}
          onChange={(e) => updateFilter("minNetWeight", e.target.value)}
          className="h-9 sm:h-10 text-xs sm:text-sm"
        />
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="maxNetWeight" className="text-xs sm:text-sm">Max Net WT (g)</Label>
        <Input
          id="maxNetWeight"
          type="number"
          placeholder="No limit"
          step="0.01"
          value={filters.maxNetWeight}
          onChange={(e) => updateFilter("maxNetWeight", e.target.value)}
          className="h-9 sm:h-10 text-xs sm:text-sm"
        />
      </div>
    </>
  );
};
