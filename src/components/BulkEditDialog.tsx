import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Percent } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";

interface BulkEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updates: Record<string, any>) => Promise<void>;
  selectedCount: number;
}

// Validation schema
const bulkUpdateSchema = z.object({
  category: z.string().max(100).optional(),
  metal_type: z.string().max(50).optional(),
  delivery_type: z.enum(['immediate', 'scheduled']).optional(),
  dispatches_in_days: z.number().int().min(0).max(365).optional(),
  status: z.string().max(50).optional(),
  stock_quantity: z.number().int().min(0).optional(),
  description: z.string().max(1000).optional(),
  cost_price: z.number().min(0).optional(),
  retail_price: z.number().min(0).optional(),
  weight_grams: z.number().min(0).optional(),
  diamond_color: z.string().max(50).optional(),
  clarity: z.string().max(50).optional(),
  gemstone: z.string().max(100).optional(),
  gemstone_type: z.string().max(100).optional(),
  certification: z.string().max(100).optional(),
  cut: z.string().max(50).optional(),
  polish: z.string().max(50).optional(),
  symmetry: z.string().max(50).optional(),
  pricingAdjustment: z.object({
    type: z.enum(['markup', 'discount']),
    percentage: z.number().min(0).max(100)
  }).optional()
});

export function BulkEditDialog({ open, onOpenChange, onUpdate, selectedCount }: BulkEditDialogProps) {
  const [updating, setUpdating] = useState(false);
  const [updates, setUpdates] = useState<Record<string, any>>({});
  const [priceAdjustmentType, setPriceAdjustmentType] = useState<'markup' | 'discount'>('markup');
  const [priceAdjustmentPercent, setPriceAdjustmentPercent] = useState("");

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      // Validate inputs
      const validationData: any = { ...updates };
      
      // Add pricing adjustment if specified
      if (priceAdjustmentPercent && parseFloat(priceAdjustmentPercent) > 0) {
        validationData.pricingAdjustment = {
          type: priceAdjustmentType,
          percentage: parseFloat(priceAdjustmentPercent)
        };
      }

      // Validate with zod
      try {
        bulkUpdateSchema.parse(validationData);
      } catch (validationError: any) {
        toast.error(`Validation error: ${validationError.errors[0]?.message || 'Invalid input'}`);
        setUpdating(false);
        return;
      }

      await onUpdate(validationData);
      setUpdates({});
      setPriceAdjustmentPercent("");
      onOpenChange(false);
    } finally {
      setUpdating(false);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    if (value === "" || value === "no-change") {
      const newUpdates = { ...updates };
      delete newUpdates[field];
      setUpdates(newUpdates);
    } else {
      setUpdates({ ...updates, [field]: value });
    }
  };

  const hasChanges = Object.keys(updates).length > 0 || (priceAdjustmentPercent && parseFloat(priceAdjustmentPercent) > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Edit Products</DialogTitle>
          <DialogDescription>
            Update {selectedCount} selected product{selectedCount !== 1 ? 's' : ''}. Leave fields empty to keep existing values.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="jewelry">Jewelry Details</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="Leave empty to keep current"
                  maxLength={100}
                  value={updates.category || ""}
                  onChange={(e) => handleFieldChange("category", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metal_type">Metal Type</Label>
                <Select
                  value={updates.metal_type || "no-change"}
                  onValueChange={(value) => handleFieldChange("metal_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No change" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-change">No change</SelectItem>
                    <SelectItem value="Gold">Gold</SelectItem>
                    <SelectItem value="Silver">Silver</SelectItem>
                    <SelectItem value="Platinum">Platinum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="delivery_type">Delivery Type</Label>
                <Select
                  value={updates.delivery_type || "no-change"}
                  onValueChange={(value) => handleFieldChange("delivery_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No change" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-change">No change</SelectItem>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dispatches_in_days">Dispatch Days</Label>
                <Input
                  id="dispatches_in_days"
                  type="number"
                  min="0"
                  max="365"
                  placeholder="Leave empty to keep current"
                  value={updates.dispatches_in_days || ""}
                  onChange={(e) => handleFieldChange("dispatches_in_days", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Input
                  id="status"
                  placeholder="Leave empty to keep current"
                  maxLength={50}
                  value={updates.status || ""}
                  onChange={(e) => handleFieldChange("status", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock_quantity">Stock Quantity</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  min="0"
                  placeholder="Leave empty to keep current"
                  value={updates.stock_quantity || ""}
                  onChange={(e) => handleFieldChange("stock_quantity", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Leave empty to keep current"
                maxLength={1000}
                value={updates.description || ""}
                onChange={(e) => handleFieldChange("description", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight_grams">Weight (g)</Label>
              <Input
                id="weight_grams"
                type="number"
                step="0.01"
                min="0"
                placeholder="Leave empty"
                value={updates.weight_grams || ""}
                onChange={(e) => handleFieldChange("weight_grams", e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="jewelry" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="diamond_color">Diamond Color</Label>
                <Input
                  id="diamond_color"
                  placeholder="Leave empty to keep current"
                  maxLength={50}
                  value={updates.diamond_color || ""}
                  onChange={(e) => handleFieldChange("diamond_color", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clarity">Clarity</Label>
                <Input
                  id="clarity"
                  placeholder="Leave empty to keep current"
                  maxLength={50}
                  value={updates.clarity || ""}
                  onChange={(e) => handleFieldChange("clarity", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cut">Cut</Label>
                <Input
                  id="cut"
                  placeholder="Leave empty to keep current"
                  maxLength={50}
                  value={updates.cut || ""}
                  onChange={(e) => handleFieldChange("cut", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="polish">Polish</Label>
                <Input
                  id="polish"
                  placeholder="Leave empty to keep current"
                  maxLength={50}
                  value={updates.polish || ""}
                  onChange={(e) => handleFieldChange("polish", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="symmetry">Symmetry</Label>
              <Input
                id="symmetry"
                placeholder="Leave empty to keep current"
                maxLength={50}
                value={updates.symmetry || ""}
                onChange={(e) => handleFieldChange("symmetry", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gemstone">Gemstone</Label>
              <Input
                id="gemstone"
                placeholder="Leave empty to keep current"
                maxLength={100}
                value={updates.gemstone || ""}
                onChange={(e) => handleFieldChange("gemstone", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gemstone_type">Gemstone Type</Label>
              <Input
                id="gemstone_type"
                placeholder="Leave empty to keep current"
                maxLength={100}
                value={updates.gemstone_type || ""}
                onChange={(e) => handleFieldChange("gemstone_type", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="certification">Certification</Label>
              <Input
                id="certification"
                placeholder="Leave empty to keep current"
                maxLength={100}
                value={updates.certification || ""}
                onChange={(e) => handleFieldChange("certification", e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4 mt-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Percentage-Based Price Adjustment</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Apply a percentage markup or discount to all selected products
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adjustment_type">Adjustment Type</Label>
                  <Select
                    value={priceAdjustmentType}
                    onValueChange={(value: 'markup' | 'discount') => setPriceAdjustmentType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="markup">Markup (Increase Price)</SelectItem>
                      <SelectItem value="discount">Discount (Decrease Price)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adjustment_percent">Percentage (%)</Label>
                  <Input
                    id="adjustment_percent"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="e.g., 10 for 10%"
                    value={priceAdjustmentPercent}
                    onChange={(e) => setPriceAdjustmentPercent(e.target.value)}
                  />
                </div>
              </div>

              {priceAdjustmentPercent && parseFloat(priceAdjustmentPercent) > 0 && (
                <div className="bg-background p-3 rounded border border-border">
                  <p className="text-sm font-medium">
                    {priceAdjustmentType === 'markup' ? '↑' : '↓'} 
                    {' '}{priceAdjustmentType === 'markup' ? 'Increase' : 'Decrease'} prices by {priceAdjustmentPercent}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Example: ₹1,000 → ₹{priceAdjustmentType === 'markup' 
                      ? (1000 * (1 + parseFloat(priceAdjustmentPercent) / 100)).toFixed(0)
                      : (1000 * (1 - parseFloat(priceAdjustmentPercent) / 100)).toFixed(0)}
                  </p>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Or Set Fixed Prices</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cost_price">Cost Price (₹)</Label>
                  <Input
                    id="cost_price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Leave empty"
                    value={updates.cost_price || ""}
                    onChange={(e) => handleFieldChange("cost_price", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="retail_price">Retail Price (₹)</Label>
                  <Input
                    id="retail_price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Leave empty"
                    value={updates.retail_price || ""}
                    onChange={(e) => handleFieldChange("retail_price", e.target.value)}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Note: Fixed prices will override percentage adjustments
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={updating}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={updating || !hasChanges}>
            {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update {selectedCount} Product{selectedCount !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
