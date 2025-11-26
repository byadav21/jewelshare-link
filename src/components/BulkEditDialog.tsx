import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface BulkEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updates: Record<string, any>) => Promise<void>;
  selectedCount: number;
}

export function BulkEditDialog({ open, onOpenChange, onUpdate, selectedCount }: BulkEditDialogProps) {
  const [updating, setUpdating] = useState(false);
  const [updates, setUpdates] = useState<Record<string, any>>({});

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await onUpdate(updates);
      setUpdates({});
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Edit Products</DialogTitle>
          <DialogDescription>
            Update {selectedCount} selected product{selectedCount !== 1 ? 's' : ''}. Leave fields empty to keep existing values.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="Leave empty to keep current"
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
                value={updates.status || ""}
                onChange={(e) => handleFieldChange("status", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock_quantity">Stock Quantity</Label>
              <Input
                id="stock_quantity"
                type="number"
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
              value={updates.description || ""}
              onChange={(e) => handleFieldChange("description", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost_price">Cost Price (₹)</Label>
              <Input
                id="cost_price"
                type="number"
                step="0.01"
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
                placeholder="Leave empty"
                value={updates.retail_price || ""}
                onChange={(e) => handleFieldChange("retail_price", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight_grams">Weight (g)</Label>
              <Input
                id="weight_grams"
                type="number"
                step="0.01"
                placeholder="Leave empty"
                value={updates.weight_grams || ""}
                onChange={(e) => handleFieldChange("weight_grams", e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={updating}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={updating || Object.keys(updates).length === 0}>
            {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update {selectedCount} Product{selectedCount !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
