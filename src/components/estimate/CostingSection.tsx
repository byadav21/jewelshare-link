import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Percent, IndianRupee } from "lucide-react";

interface CostingSectionProps {
  gstMode: 'sgst_cgst' | 'igst';
  onGstModeChange: (mode: 'sgst_cgst' | 'igst') => void;
  sgstPercentage: number;
  cgstPercentage: number;
  igstPercentage: number;
  onSgstChange: (value: number) => void;
  onCgstChange: (value: number) => void;
  onIgstChange: (value: number) => void;
  shippingCharges: number;
  onShippingChargesChange: (value: number) => void;
  shippingZone: string;
  onShippingZoneChange: (value: string) => void;
  exchangeRate: number;
  onExchangeRateChange: (value: number) => void;
  costs: {
    finalSellingPrice: number;
    sgstAmount: number;
    cgstAmount: number;
    igstAmount: number;
    grandTotal: number;
    totalInUSD: number;
  };
}

export const CostingSection = ({
  gstMode,
  onGstModeChange,
  sgstPercentage,
  cgstPercentage,
  igstPercentage,
  onSgstChange,
  onCgstChange,
  onIgstChange,
  shippingCharges,
  onShippingChargesChange,
  shippingZone,
  exchangeRate,
  onExchangeRateChange,
  costs,
}: CostingSectionProps) => {
  const applyQuickGSTRate = (rate: number) => {
    if (gstMode === 'sgst_cgst') {
      onSgstChange(rate / 2);
      onCgstChange(rate / 2);
    } else {
      onIgstChange(rate);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Percent className="h-5 w-5 text-primary" />
          Tax, Shipping & Currency
        </CardTitle>
        <CardDescription>Configure GST, shipping charges, and currency conversion</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* GST Mode Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">GST Type</Label>
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="sgst-cgst-mode"
                checked={gstMode === 'sgst_cgst'}
                onChange={() => onGstModeChange('sgst_cgst')}
                className="h-4 w-4"
              />
              <Label htmlFor="sgst-cgst-mode" className="text-sm cursor-pointer">
                SGST + CGST (Intra-State)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="igst-mode"
                checked={gstMode === 'igst'}
                onChange={() => onGstModeChange('igst')}
                className="h-4 w-4"
              />
              <Label htmlFor="igst-mode" className="text-sm cursor-pointer">
                IGST (Inter-State)
              </Label>
            </div>
          </div>
        </div>

        {/* GST Rate Presets */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Quick GST Rate Selection</Label>
          <div className="flex flex-wrap gap-2">
            {[0, 3, 5, 12, 18, 28].map((rate) => (
              <Button
                key={rate}
                type="button"
                variant={
                  (gstMode === 'sgst_cgst' && sgstPercentage === rate / 2) ||
                  (gstMode === 'igst' && igstPercentage === rate)
                    ? 'default'
                    : 'outline'
                }
                size="sm"
                onClick={() => applyQuickGSTRate(rate)}
              >
                {rate}%
              </Button>
            ))}
          </div>
        </div>

        {/* GST Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {gstMode === 'sgst_cgst' ? (
            <>
              <div className="space-y-1">
                <Label htmlFor="sgst" className="text-sm">
                  SGST (%)
                </Label>
                <Input
                  id="sgst"
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={sgstPercentage}
                  onChange={(e) => onSgstChange(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="cgst" className="text-sm">
                  CGST (%)
                </Label>
                <Input
                  id="cgst"
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={cgstPercentage}
                  onChange={(e) => onCgstChange(parseFloat(e.target.value) || 0)}
                />
              </div>
            </>
          ) : (
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="igst" className="text-sm">
                IGST (%)
              </Label>
              <Input
                id="igst"
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={igstPercentage}
                onChange={(e) => onIgstChange(parseFloat(e.target.value) || 0)}
              />
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="exchange-rate" className="text-sm">
              Exchange Rate (USD to INR)
            </Label>
            <Input
              id="exchange-rate"
              type="number"
              min={0}
              step={0.01}
              value={exchangeRate}
              onChange={(e) => onExchangeRateChange(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Manual Shipping Charges Override */}
        <div className="space-y-1">
          <Label htmlFor="shipping" className="text-sm">
            Shipping Charges (₹) - Manual Override
          </Label>
          <div className="relative">
            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="shipping"
              type="number"
              min={0}
              step={0.01}
              value={shippingCharges}
              onChange={(e) => onShippingChargesChange(parseFloat(e.target.value) || 0)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Cost Breakdown Display */}
        <div className="border-t pt-4 space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground">Cost Breakdown</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
              <span className="text-muted-foreground">Subtotal (Before Tax):</span>
              <span className="font-semibold">₹{costs.finalSellingPrice.toLocaleString('en-IN')}</span>
            </div>

            {gstMode === 'sgst_cgst' ? (
              <>
                <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                  <span className="text-muted-foreground">SGST ({sgstPercentage}%):</span>
                  <span className="font-semibold">₹{costs.sgstAmount.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                  <span className="text-muted-foreground">CGST ({cgstPercentage}%):</span>
                  <span className="font-semibold">₹{costs.cgstAmount.toLocaleString('en-IN')}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                <span className="text-muted-foreground">IGST ({igstPercentage}%):</span>
                <span className="font-semibold">₹{costs.igstAmount.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
              <span className="text-muted-foreground">Shipping ({shippingZone}):</span>
              <span className="font-semibold">₹{shippingCharges.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="border-t pt-3 mt-3">
            <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
              <span className="font-bold text-lg">Grand Total (INR):</span>
              <span className="font-bold text-xl text-primary">
                ₹{costs.grandTotal.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-accent/10 rounded-lg mt-2">
              <span className="font-semibold">Equivalent (USD):</span>
              <span className="font-semibold text-lg text-accent">
                ${costs.totalInUSD.toLocaleString('en-US')}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};