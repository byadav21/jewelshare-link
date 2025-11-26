import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

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
  const getCategoryIcon = (category: string) => {
    return <Sparkles className="h-3.5 w-3.5 text-primary" />;
  };

  return (
    <>
      {/* Enhanced Category Filter - Full Width */}
      <div className="col-span-2 lg:col-span-3 xl:col-span-7 mb-2">
        <Label htmlFor="category" className="text-xs sm:text-sm font-semibold mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Product Category
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 mt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => updateFilter("category", "")}
            className={`
              relative overflow-hidden rounded-lg border-2 p-3 transition-all duration-200
              ${!filters.category 
                ? 'border-primary bg-primary/10 shadow-md shadow-primary/20' 
                : 'border-border bg-card hover:border-primary/50 hover:bg-accent/50'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${!filters.category ? 'text-primary' : 'text-foreground'}`}>
                All
              </span>
              {categoryCounts['all'] && (
                <Badge variant={!filters.category ? "default" : "secondary"} className="ml-2 text-xs">
                  {categoryCounts['all']}
                </Badge>
              )}
            </div>
          </motion.button>

          {categories.map((cat) => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => updateFilter("category", cat)}
              className={`
                relative overflow-hidden rounded-lg border-2 p-3 transition-all duration-200
                ${filters.category === cat 
                  ? 'border-primary bg-primary/10 shadow-md shadow-primary/20' 
                  : 'border-border bg-card hover:border-primary/50 hover:bg-accent/50'
                }
              `}
            >
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-1.5">
                  {getCategoryIcon(cat)}
                  <span className={`text-sm font-medium ${filters.category === cat ? 'text-primary' : 'text-foreground'}`}>
                    {cat}
                  </span>
                </div>
                {categoryCounts[cat] !== undefined && (
                  <Badge variant={filters.category === cat ? "default" : "secondary"} className="text-xs">
                    {categoryCounts[cat]} items
                  </Badge>
                )}
              </div>
            </motion.button>
          ))}
        </div>
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
    </>
  );
};
