import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface GemstoneFiltersProps {
  filters: any;
  updateFilter: (key: string, value: string) => void;
  gemstoneTypes: string[];
  colors: string[];
  clarities: string[];
  cuts: string[];
}

export const GemstoneFilters = ({
  filters,
  updateFilter,
  gemstoneTypes,
  colors,
  clarities,
  cuts,
}: GemstoneFiltersProps) => {
  return (
    <>
      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="gemstoneType" className="text-xs sm:text-sm">Gemstone Type</Label>
        <Select value={filters.gemstoneType || "all"} onValueChange={(v) => updateFilter("gemstoneType", v === "all" ? "" : v)}>
          <SelectTrigger id="gemstoneType" className="h-9 sm:h-10 text-xs sm:text-sm">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px] overflow-y-auto bg-popover z-50">
            <SelectItem value="all" className="text-xs sm:text-sm">All Types</SelectItem>
            {gemstoneTypes.map((type) => (
              <SelectItem key={type} value={type} className="text-xs sm:text-sm">{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="color" className="text-xs sm:text-sm">Color</Label>
        <Select value={filters.color || "all"} onValueChange={(v) => updateFilter("color", v === "all" ? "" : v)}>
          <SelectTrigger id="color" className="h-9 sm:h-10 text-xs sm:text-sm">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="all" className="text-xs sm:text-sm">All Colors</SelectItem>
            {colors.map((color) => (
              <SelectItem key={color} value={color} className="text-xs sm:text-sm">{color}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="clarity" className="text-xs sm:text-sm">Clarity</Label>
        <Select value={filters.clarity || "all"} onValueChange={(v) => updateFilter("clarity", v === "all" ? "" : v)}>
          <SelectTrigger id="clarity" className="h-9 sm:h-10 text-xs sm:text-sm">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="all" className="text-xs sm:text-sm">All Clarities</SelectItem>
            {clarities.map((clarity) => (
              <SelectItem key={clarity} value={clarity} className="text-xs sm:text-sm">{clarity}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="cut" className="text-xs sm:text-sm">Cut</Label>
        <Select value={filters.cut || "all"} onValueChange={(v) => updateFilter("cut", v === "all" ? "" : v)}>
          <SelectTrigger id="cut" className="h-9 sm:h-10 text-xs sm:text-sm">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="all" className="text-xs sm:text-sm">All Cuts</SelectItem>
            {cuts.map((cut) => (
              <SelectItem key={cut} value={cut} className="text-xs sm:text-sm">{cut}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="minCarat" className="text-xs sm:text-sm">Min Carat</Label>
        <Input
          id="minCarat"
          type="number"
          step="0.01"
          placeholder="0"
          value={filters.minCarat}
          onChange={(e) => updateFilter("minCarat", e.target.value)}
          className="h-9 sm:h-10 text-xs sm:text-sm"
        />
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="maxCarat" className="text-xs sm:text-sm">Max Carat</Label>
        <Input
          id="maxCarat"
          type="number"
          step="0.01"
          placeholder="No limit"
          value={filters.maxCarat}
          onChange={(e) => updateFilter("maxCarat", e.target.value)}
          className="h-9 sm:h-10 text-xs sm:text-sm"
        />
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="minPrice" className="text-xs sm:text-sm">Min ($)</Label>
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
        <Label htmlFor="maxPrice" className="text-xs sm:text-sm">Max ($)</Label>
        <Input
          id="maxPrice"
          type="number"
          placeholder="No limit"
          value={filters.maxPrice}
          onChange={(e) => updateFilter("maxPrice", e.target.value)}
          className="h-9 sm:h-10 text-xs sm:text-sm"
        />
      </div>
    </>
  );
};
