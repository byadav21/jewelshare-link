import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp } from "lucide-react";

interface Costs {
  goldCost: number;
  totalCost: number;
  finalSellingPrice: number;
  profitAmount: number;
  grandTotal: number;
}

interface FormData {
  diamondPerCaratPrice: number;
  diamondWeight: number;
  gemstonePerCaratPrice: number;
  gemstoneWeight: number;
  makingCharges: number;
  cadDesignCharges: number;
  cammingCharges: number;
  certificationCost: number;
}

interface PricingSectionProps {
  profitMargin: number;
  onProfitMarginChange: (value: number) => void;
  costs: Costs;
  formData: FormData;
}

export const PricingSection = ({
  profitMargin,
  onProfitMarginChange,
  costs,
  formData,
}: PricingSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Profit Margin & Final Pricing
        </CardTitle>
        <CardDescription>Set profit margin and view final selling price</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profit Margin Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="profit-margin" className="text-sm font-semibold">
              Profit Margin (%)
            </Label>
            <span className="text-lg font-bold text-primary">{profitMargin}%</span>
          </div>
          <Input
            id="profit-margin"
            type="range"
            min={0}
            max={200}
            step={1}
            value={profitMargin}
            onChange={(e) => onProfitMarginChange(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>100%</span>
            <span>200%</span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <p className="text-sm text-muted-foreground">Manufacturing Cost</p>
            <p className="text-2xl font-bold">₹{costs.totalCost.toLocaleString('en-IN')}</p>
          </div>

          <div className="p-4 bg-primary/10 rounded-lg space-y-2">
            <p className="text-sm text-muted-foreground">Final Selling Price (Before Tax)</p>
            <p className="text-2xl font-bold text-primary">
              ₹{costs.finalSellingPrice.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="p-4 bg-accent/10 rounded-lg space-y-2">
            <p className="text-sm text-muted-foreground">Profit Amount</p>
            <p className="text-2xl font-bold text-accent">
              ₹{costs.profitAmount.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="p-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg space-y-2">
            <p className="text-sm text-muted-foreground">Grand Total (After Tax)</p>
            <p className="text-2xl font-bold">₹{costs.grandTotal.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Cost Breakdown Summary */}
        <div className="border-t pt-4 space-y-2">
          <h4 className="font-semibold text-sm">Cost Breakdown</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gold Cost:</span>
              <span className="font-medium">₹{costs.goldCost.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Diamond Cost:</span>
              <span className="font-medium">
                ₹{(formData.diamondPerCaratPrice * formData.diamondWeight).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gemstone Cost:</span>
              <span className="font-medium">
                ₹
                {(formData.gemstonePerCaratPrice * formData.gemstoneWeight).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Making Charges:</span>
              <span className="font-medium">₹{formData.makingCharges.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">CAD Design:</span>
              <span className="font-medium">
                ₹{formData.cadDesignCharges.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Camming:</span>
              <span className="font-medium">
                ₹{formData.cammingCharges.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Certification:</span>
              <span className="font-medium">
                ₹{formData.certificationCost.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};