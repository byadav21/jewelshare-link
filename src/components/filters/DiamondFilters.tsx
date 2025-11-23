import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface DiamondFiltersProps {
  filters: any;
  updateFilter: (key: string, value: string) => void;
  shapes: string[];
  colors: string[];
  clarities: string[];
  cuts: string[];
  polishes: string[];
  symmetries: string[];
  fluorescences: string[];
  labs: string[];
}

export const DiamondFilters = ({
  filters,
  updateFilter,
  shapes,
  colors,
  clarities,
  cuts,
  polishes,
  symmetries,
  fluorescences,
  labs,
}: DiamondFiltersProps) => {
  return (
    <>
      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="diamondType" className="text-xs sm:text-sm">Type</Label>
        <Select value={filters.diamondType || "all"} onValueChange={(v) => updateFilter("diamondType", v === "all" ? "" : v)}>
          <SelectTrigger id="diamondType" className="h-9 sm:h-10 text-xs sm:text-sm">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="all" className="text-xs sm:text-sm">All Types</SelectItem>
            <SelectItem value="Natural" className="text-xs sm:text-sm">Natural</SelectItem>
            <SelectItem value="Lab Grown" className="text-xs sm:text-sm">Lab Grown</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="shape" className="text-xs sm:text-sm">Shape</Label>
        <Select value={filters.shape || "all"} onValueChange={(v) => updateFilter("shape", v === "all" ? "" : v)}>
          <SelectTrigger id="shape" className="h-9 sm:h-10 text-xs sm:text-sm">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px] overflow-y-auto bg-popover z-50">
            <SelectItem value="all" className="text-xs sm:text-sm">All Shapes</SelectItem>
            {shapes.map((shape) => (
              <SelectItem key={shape} value={shape} className="text-xs sm:text-sm">{shape}</SelectItem>
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
        <Label htmlFor="polish" className="text-xs sm:text-sm">Polish</Label>
        <Select value={filters.polish || "all"} onValueChange={(v) => updateFilter("polish", v === "all" ? "" : v)}>
          <SelectTrigger id="polish" className="h-9 sm:h-10 text-xs sm:text-sm">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="all" className="text-xs sm:text-sm">All</SelectItem>
            {polishes.map((polish) => (
              <SelectItem key={polish} value={polish} className="text-xs sm:text-sm">{polish}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="symmetry" className="text-xs sm:text-sm">Symmetry</Label>
        <Select value={filters.symmetry || "all"} onValueChange={(v) => updateFilter("symmetry", v === "all" ? "" : v)}>
          <SelectTrigger id="symmetry" className="h-9 sm:h-10 text-xs sm:text-sm">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="all" className="text-xs sm:text-sm">All</SelectItem>
            {symmetries.map((symmetry) => (
              <SelectItem key={symmetry} value={symmetry} className="text-xs sm:text-sm">{symmetry}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="fluorescence" className="text-xs sm:text-sm">Fluorescence</Label>
        <Select value={filters.fluorescence || "all"} onValueChange={(v) => updateFilter("fluorescence", v === "all" ? "" : v)}>
          <SelectTrigger id="fluorescence" className="h-9 sm:h-10 text-xs sm:text-sm">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="all" className="text-xs sm:text-sm">All</SelectItem>
            {fluorescences.map((flo) => (
              <SelectItem key={flo} value={flo} className="text-xs sm:text-sm">{flo}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="lab" className="text-xs sm:text-sm">Lab</Label>
        <Select value={filters.lab || "all"} onValueChange={(v) => updateFilter("lab", v === "all" ? "" : v)}>
          <SelectTrigger id="lab" className="h-9 sm:h-10 text-xs sm:text-sm">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="all" className="text-xs sm:text-sm">All Labs</SelectItem>
            {labs.map((lab) => (
              <SelectItem key={lab} value={lab} className="text-xs sm:text-sm">{lab}</SelectItem>
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
