import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, Percent, ArrowRight, ChevronLeft, Eye } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface BulkEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updates: Record<string, any>) => Promise<void>;
  selectedCount: number;
  selectedProductIds: string[];
}

interface ProductPreview {
  id: string;
  name: string;
  sku: string;
  changes: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;
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

export function BulkEditDialog({ open, onOpenChange, onUpdate, selectedCount, selectedProductIds }: BulkEditDialogProps) {
  const [updating, setUpdating] = useState(false);
  const [updates, setUpdates] = useState<Record<string, any>>({});
  const [priceAdjustmentType, setPriceAdjustmentType] = useState<'markup' | 'discount'>('markup');
  const [priceAdjustmentPercent, setPriceAdjustmentPercent] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [productPreviews, setProductPreviews] = useState<ProductPreview[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const generatePreview = async () => {
    setLoadingPreview(true);
    try {
      // Validate inputs first
      const validationData: any = { ...updates };
      
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
        setLoadingPreview(false);
        return;
      }

      // Fetch current product data
      const { data: products, error } = await supabase
        .from("products")
        .select("id, name, sku, category, metal_type, delivery_type, dispatches_in_days, status, stock_quantity, description, cost_price, retail_price, weight_grams, diamond_color, clarity, cut, polish, symmetry, gemstone, gemstone_type, certification")
        .in("id", selectedProductIds);

      if (error) throw error;
      if (!products) {
        toast.error("Failed to fetch product data");
        return;
      }

      // Calculate changes for each product
      const previews: ProductPreview[] = products.map(product => {
        const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];

        // Field mapping for display
        const fieldNames: Record<string, string> = {
          category: "Category",
          metal_type: "Metal Type",
          delivery_type: "Delivery Type",
          dispatches_in_days: "Dispatch Days",
          status: "Status",
          stock_quantity: "Stock Quantity",
          description: "Description",
          cost_price: "Cost Price",
          retail_price: "Retail Price",
          weight_grams: "Weight",
          diamond_color: "Diamond Color",
          clarity: "Clarity",
          cut: "Cut",
          polish: "Polish",
          symmetry: "Symmetry",
          gemstone: "Gemstone",
          gemstone_type: "Gemstone Type",
          certification: "Certification"
        };

        // Check each field for changes
        Object.entries(updates).forEach(([key, value]) => {
          if (value !== "" && value !== null && value !== "no-change") {
            const oldValue = product[key as keyof typeof product];
            if (oldValue !== value) {
              changes.push({
                field: fieldNames[key] || key,
                oldValue: oldValue || "—",
                newValue: value
              });
            }
          }
        });

        // Handle pricing adjustments
        if (validationData.pricingAdjustment && validationData.pricingAdjustment.percentage > 0) {
          const multiplier = validationData.pricingAdjustment.type === 'markup'
            ? (1 + validationData.pricingAdjustment.percentage / 100)
            : (1 - validationData.pricingAdjustment.percentage / 100);

          const newCostPrice = Math.max(0, product.cost_price * multiplier);
          const newRetailPrice = Math.max(0, product.retail_price * multiplier);

          // Only add if not overridden by fixed prices
          if (!updates.cost_price) {
            changes.push({
              field: "Cost Price",
              oldValue: `₹${product.cost_price.toFixed(2)}`,
              newValue: `₹${newCostPrice.toFixed(2)}`
            });
          }

          if (!updates.retail_price) {
            changes.push({
              field: "Retail Price",
              oldValue: `₹${product.retail_price.toFixed(2)}`,
              newValue: `₹${newRetailPrice.toFixed(2)}`
            });
          }
        }

        return {
          id: product.id,
          name: product.name,
          sku: product.sku || "N/A",
          changes
        };
      });

      setProductPreviews(previews.filter(p => p.changes.length > 0));
      setShowPreview(true);
    } catch (error: any) {
      console.error("Failed to generate preview:", error);
      toast.error(`Failed to generate preview: ${error.message || 'Unknown error'}`);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const validationData: any = { ...updates };
      
      if (priceAdjustmentPercent && parseFloat(priceAdjustmentPercent) > 0) {
        validationData.pricingAdjustment = {
          type: priceAdjustmentType,
          percentage: parseFloat(priceAdjustmentPercent)
        };
      }

      await onUpdate(validationData);
      setUpdates({});
      setPriceAdjustmentPercent("");
      setShowPreview(false);
      onOpenChange(false);
    } finally {
      setUpdating(false);
    }
  };

  const handleBack = () => {
    setShowPreview(false);
  };

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setShowPreview(false);
      setProductPreviews([]);
      setUpdates({});
      setPriceAdjustmentPercent("");
    }
  }, [open]);

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {showPreview && (
              <Button variant="ghost" size="sm" onClick={handleBack} className="mr-2 -ml-2">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            {showPreview ? "Preview Changes" : "Bulk Edit Products"}
          </DialogTitle>
          <DialogDescription>
            {showPreview 
              ? `Review changes for ${productPreviews.length} product${productPreviews.length !== 1 ? 's' : ''} before applying`
              : `Update ${selectedCount} selected product${selectedCount !== 1 ? 's' : ''}. Leave fields empty to keep existing values.`
            }
          </DialogDescription>
        </DialogHeader>

        {showPreview ? (
          <div className="flex-1 overflow-hidden flex flex-col">
            {productPreviews.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No changes detected for any products.</p>
              </div>
            ) : (
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-6 pb-4">
                  {productPreviews.map((preview, idx) => (
                    <div key={preview.id} className="border rounded-lg p-4 bg-muted/30">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-sm">{preview.name}</h4>
                          <p className="text-xs text-muted-foreground">SKU: {preview.sku}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {preview.changes.length} change{preview.changes.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[30%]">Field</TableHead>
                            <TableHead className="w-[35%]">Current Value</TableHead>
                            <TableHead className="w-[35%]">New Value</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {preview.changes.map((change, changeIdx) => (
                            <TableRow key={changeIdx}>
                              <TableCell className="font-medium text-sm">{change.field}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {typeof change.oldValue === 'number' 
                                  ? change.oldValue.toLocaleString()
                                  : change.oldValue}
                              </TableCell>
                              <TableCell className="text-sm font-medium flex items-center gap-2">
                                <ArrowRight className="h-3 w-3 text-primary" />
                                {typeof change.newValue === 'number'
                                  ? change.newValue.toLocaleString()
                                  : change.newValue}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        ) : (

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
        )}

        <DialogFooter className="mt-4">
          {showPreview ? (
            <>
              <Button variant="outline" onClick={handleBack} disabled={updating}>
                Back to Edit
              </Button>
              <Button 
                onClick={handleUpdate} 
                disabled={updating || productPreviews.length === 0}
                className="bg-primary"
              >
                {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm & Apply Changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loadingPreview}>
                Cancel
              </Button>
              <Button 
                onClick={generatePreview} 
                disabled={loadingPreview || !hasChanges}
              >
                {loadingPreview ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading Preview...
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Preview Changes
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
