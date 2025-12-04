import { useEffect, useState, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { 
  safeNumber, 
  normalizePurity, 
  getPurityPercentage,
  KARAT_OPTIONS,
  calculateDiamondWeight,
  calculateDValue,
  calculateNetWeight,
  calculateMakingCharges,
  calculateGoldValue,
  calculateTotalPrice
} from "@/utils/jewelryCalculations";

interface JewelleryFormProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  setFormData: (data: any) => void;
}

// Standard karat options
const STANDARD_KARATS = KARAT_OPTIONS.map(k => k.value);

export const JewelleryForm = ({ formData, handleChange, setFormData }: JewelleryFormProps) => {
  const [vendorMakingCharges, setVendorMakingCharges] = useState(0);
  const [isCustomPurity, setIsCustomPurity] = useState(false);

  // Check if current purity is a standard karat value
  const currentPurityIsStandard = STANDARD_KARATS.includes(formData.purity_fraction_used?.toString());

  // Fetch vendor's making charges on mount
  useEffect(() => {
    const fetchVendorProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("vendor_profiles")
        .select("making_charges_per_gram")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data?.making_charges_per_gram) {
        const charges = Number(data.making_charges_per_gram);
        if (!isNaN(charges)) setVendorMakingCharges(charges);
      }
    };
    fetchVendorProfile();
  }, []);

  // Memoized calculations using shared utilities
  const calculations = useMemo(() => {
    const dWt1 = safeNumber(formData.d_wt_1);
    const dWt2 = safeNumber(formData.d_wt_2);
    const dRate1 = safeNumber(formData.d_rate_1);
    const pointerDiamond = safeNumber(formData.pointer_diamond);
    const grossWeight = safeNumber(formData.weight_grams);
    const gemstoneWeight = safeNumber(formData.carat_weight);
    const gemstoneRate = safeNumber(formData.gemstone_rate);
    const goldPerGram = safeNumber(formData.gold_per_gram_price);
    const certificationCost = safeNumber(formData.certification_cost);
    const purityFraction = normalizePurity(formData.purity_fraction_used);

    // Use shared calculation functions
    const totalDiamondWeight = calculateDiamondWeight(dWt1, dWt2);
    const dValue = calculateDValue(dWt1, dRate1, dWt2, pointerDiamond);
    const netWeight = calculateNetWeight(grossWeight, totalDiamondWeight, gemstoneWeight);
    const makingCharges = calculateMakingCharges(grossWeight, vendorMakingCharges);
    const gemstoneCost = gemstoneWeight * gemstoneRate;
    const goldValue = calculateGoldValue(netWeight, purityFraction, goldPerGram);
    const totalPrice = calculateTotalPrice(dValue, makingCharges, goldValue, certificationCost, gemstoneCost);

    return {
      totalDiamondWeight: totalDiamondWeight > 0 ? totalDiamondWeight.toFixed(2) : '',
      dValue: dValue > 0 ? dValue.toFixed(2) : '',
      netWeight: netWeight > 0 ? netWeight.toFixed(3) : '',
      makingCharges: makingCharges > 0 ? makingCharges.toFixed(2) : '',
      gemstoneCost: gemstoneCost > 0 ? gemstoneCost.toFixed(2) : '',
      goldValue,
      totalPrice: totalPrice > 0 ? totalPrice.toFixed(2) : '',
      costPrice: totalPrice > 0 ? (totalPrice * 0.85).toFixed(2) : '',
    };
  }, [
    formData.d_wt_1, formData.d_wt_2, formData.d_rate_1, formData.pointer_diamond,
    formData.weight_grams, formData.carat_weight, formData.gemstone_rate,
    formData.gold_per_gram_price, formData.certification_cost, formData.purity_fraction_used,
    vendorMakingCharges
  ]);

  // Update form data when calculations change
  useEffect(() => {
    const updates: Record<string, string> = {};

    if (calculations.totalDiamondWeight && calculations.totalDiamondWeight !== formData.diamond_weight) {
      updates.diamond_weight = calculations.totalDiamondWeight;
    }
    if (calculations.dValue && calculations.dValue !== formData.d_value) {
      updates.d_value = calculations.dValue;
    }
    if (calculations.netWeight && calculations.netWeight !== formData.net_weight) {
      updates.net_weight = calculations.netWeight;
    }
    if (calculations.makingCharges && calculations.makingCharges !== formData.mkg) {
      updates.mkg = calculations.makingCharges;
    }
    if (calculations.gemstoneCost && calculations.gemstoneCost !== formData.gemstone_cost) {
      updates.gemstone_cost = calculations.gemstoneCost;
    }
    if (calculations.totalPrice && calculations.totalPrice !== formData.retail_price) {
      updates.retail_price = calculations.totalPrice;
      updates.cost_price = calculations.costPrice;
    }

    if (Object.keys(updates).length > 0) {
      setFormData((prev: any) => ({ ...prev, ...updates }));
    }
  }, [calculations, formData, setFormData]);

  // Handle purity selection
  const handlePurityChange = useCallback((value: string) => {
    if (value === "custom") {
      setIsCustomPurity(true);
      setFormData((prev: any) => ({ ...prev, purity_fraction_used: "" }));
    } else {
      setIsCustomPurity(false);
      setFormData((prev: any) => ({ ...prev, purity_fraction_used: value }));
    }
  }, [setFormData]);

  const resetToStandardPurity = useCallback(() => {
    setIsCustomPurity(false);
    setFormData((prev: any) => ({ ...prev, purity_fraction_used: "18" }));
  }, [setFormData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        Jewellery Details
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
      </h3>

      {/* Metal & Gemstone Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="metal_type">Metal Type</Label>
          <Input
            id="metal_type"
            name="metal_type"
            value={formData.metal_type || ''}
            onChange={handleChange}
            placeholder="18K Gold"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gemstone">Gemstone</Label>
          <Input
            id="gemstone"
            name="gemstone"
            value={formData.gemstone || ''}
            onChange={handleChange}
            placeholder="GH VS (Color Clarity)"
          />
        </div>
      </div>

      {/* Weight Section */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="weight_grams">Gross Weight (g)</Label>
          <Input
            id="weight_grams"
            name="weight_grams"
            type="number"
            step="0.001"
            value={formData.weight_grams || ''}
            onChange={handleChange}
            placeholder="4.37"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="carat_weight">Gemstone Weight (ct)</Label>
          <Input
            id="carat_weight"
            name="carat_weight"
            type="number"
            step="0.01"
            value={formData.carat_weight || ''}
            onChange={handleChange}
            placeholder="0.50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="net_weight">Net Weight (g)</Label>
          <Input
            id="net_weight"
            name="net_weight"
            type="number"
            step="0.001"
            value={formData.net_weight || ''}
            onChange={handleChange}
            placeholder="4.252"
            className="bg-muted/30"
            readOnly
          />
        </div>
      </div>

      {/* Diamond Weight Section */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="d_wt_1">D.WT 1 (ct)</Label>
          <Input
            id="d_wt_1"
            name="d_wt_1"
            type="number"
            step="0.01"
            value={formData.d_wt_1 || ''}
            onChange={handleChange}
            placeholder="0.23"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="d_wt_2">D.WT 2 (ct)</Label>
          <Input
            id="d_wt_2"
            name="d_wt_2"
            type="number"
            step="0.01"
            value={formData.d_wt_2 || ''}
            onChange={handleChange}
            placeholder="0.36"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="diamond_weight">Total D.WT (ct)</Label>
          <Input
            id="diamond_weight"
            name="diamond_weight"
            type="number"
            step="0.01"
            value={formData.diamond_weight || ''}
            className="bg-muted/30"
            readOnly
          />
          <p className="text-xs text-muted-foreground">D.WT 1 + D.WT 2</p>
        </div>
      </div>

      {/* Diamond Rate Section */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="d_rate_1">D Rate 1 (₹/ct)</Label>
          <Input
            id="d_rate_1"
            name="d_rate_1"
            type="number"
            step="0.01"
            value={formData.d_rate_1 || ''}
            onChange={handleChange}
            placeholder="15000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pointer_diamond">Pointer Diamond (₹/ct)</Label>
          <Input
            id="pointer_diamond"
            name="pointer_diamond"
            type="number"
            step="0.01"
            value={formData.pointer_diamond || ''}
            onChange={handleChange}
            placeholder="12000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="d_value">D Value (₹)</Label>
          <Input
            id="d_value"
            name="d_value"
            type="number"
            step="0.01"
            value={formData.d_value || ''}
            className="bg-muted/30"
            readOnly
          />
        </div>
      </div>

      {/* Purity & Gold Rate Section */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="purity_fraction_used">Purity (Karat)</Label>
          {isCustomPurity || (!currentPurityIsStandard && formData.purity_fraction_used) ? (
            <div className="flex gap-2">
              <Input
                id="purity_fraction_used"
                name="purity_fraction_used"
                type="number"
                step="0.01"
                value={formData.purity_fraction_used || ''}
                onChange={handleChange}
                placeholder="18 or 75 or 0.75"
                className="flex-1"
              />
              <button
                type="button"
                onClick={resetToStandardPurity}
                className="px-3 py-2 text-xs bg-muted hover:bg-muted/80 rounded-md transition-colors"
              >
                Reset
              </button>
            </div>
          ) : (
            <Select
              value={formData.purity_fraction_used?.toString() || "18"}
              onValueChange={handlePurityChange}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select purity" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="14">14K (58.3%)</SelectItem>
                <SelectItem value="18">18K (75%)</SelectItem>
                <SelectItem value="22">22K (91.7%)</SelectItem>
                <SelectItem value="24">24K (100%)</SelectItem>
                <SelectItem value="custom">Custom...</SelectItem>
              </SelectContent>
            </Select>
          )}
          <p className="text-xs text-muted-foreground">
            {getPurityPercentage(formData.purity_fraction_used)}% gold purity
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="gold_per_gram_price">Gold Rate (₹/g)</Label>
          <Input
            id="gold_per_gram_price"
            name="gold_per_gram_price"
            type="number"
            step="0.01"
            value={formData.gold_per_gram_price || ''}
            onChange={handleChange}
            placeholder="7500"
          />
        </div>
      </div>

      {/* Making & Total Section */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="mkg">Making Charges (₹)</Label>
          <Input
            id="mkg"
            name="mkg"
            type="number"
            step="0.01"
            value={formData.mkg || ''}
            className="bg-muted/30"
            readOnly
          />
          <p className="text-xs text-muted-foreground">
            Gross × ₹{vendorMakingCharges}/g
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="retail_price">Total Price (₹)</Label>
          <Input
            id="retail_price"
            name="retail_price"
            type="number"
            step="0.01"
            value={formData.retail_price || ''}
            className="bg-muted/30 font-semibold"
            readOnly
          />
        </div>
      </div>

      {/* Gemstone & Certification Section */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="gemstone_rate">Gemstone Rate (₹/ct)</Label>
          <Input
            id="gemstone_rate"
            name="gemstone_rate"
            type="number"
            step="0.01"
            value={formData.gemstone_rate || ''}
            onChange={handleChange}
            placeholder="5000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gemstone_cost">Gemstone Cost (₹)</Label>
          <Input
            id="gemstone_cost"
            name="gemstone_cost"
            type="number"
            step="0.01"
            value={formData.gemstone_cost || ''}
            className="bg-muted/30"
            readOnly
          />
          <p className="text-xs text-muted-foreground">Weight × Rate</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="certification_cost">Certification (₹)</Label>
          <Input
            id="certification_cost"
            name="certification_cost"
            type="number"
            step="0.01"
            value={formData.certification_cost || ''}
            onChange={handleChange}
            placeholder="0"
          />
        </div>
      </div>

      {/* Formula Breakdown */}
      <div className="p-4 bg-muted/50 rounded-lg border border-border">
        <p className="text-sm font-medium mb-3">Price Breakdown</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Diamond Value:</span>
            <span className="font-medium">₹{safeNumber(formData.d_value).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Making Charges:</span>
            <span className="font-medium">₹{safeNumber(formData.mkg).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Gold Value:</span>
            <span className="font-medium">₹{calculations.goldValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Certification:</span>
            <span className="font-medium">₹{safeNumber(formData.certification_cost).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Gemstone Cost:</span>
            <span className="font-medium">₹{safeNumber(formData.gemstone_cost).toLocaleString('en-IN')}</span>
          </div>
          <div className="border-t pt-2 flex justify-between">
            <span className="font-semibold">Total Price:</span>
            <span className="font-bold text-primary">₹{safeNumber(formData.retail_price).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
