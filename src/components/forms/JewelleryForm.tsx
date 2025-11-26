import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";

interface JewelleryFormProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  setFormData: (data: any) => void;
}

export const JewelleryForm = ({ formData, handleChange, setFormData }: JewelleryFormProps) => {
  const [vendorMakingCharges, setVendorMakingCharges] = useState(0);

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
        if (!isNaN(charges)) {
          setVendorMakingCharges(charges);
        }
      }
    };
    fetchVendorProfile();
  }, []);
  // Auto-calculate D VALUE
  useEffect(() => {
    const dWt1 = parseFloat(formData.d_wt_1) || 0;
    const dWt2 = parseFloat(formData.d_wt_2) || 0;
    const dRate1 = parseFloat(formData.d_rate_1) || 0;
    const pointerDiamond = parseFloat(formData.pointer_diamond) || 0;
    const tDwt = parseFloat(formData.diamond_weight) || 0;

    let calculatedDValue = 0;

    // Primary formula: D.WT 1 × D RATE 1 + D.WT 2 × Pointer diamond
    if (dWt1 > 0 && dRate1 > 0) {
      calculatedDValue = (dWt1 * dRate1) + (dWt2 * pointerDiamond);
    }
    // Fallback formula: T DWT × D RATE 1
    else if (tDwt > 0 && dRate1 > 0) {
      calculatedDValue = tDwt * dRate1;
    }

    if (calculatedDValue > 0 && calculatedDValue.toFixed(2) !== formData.d_value) {
      setFormData((prev: any) => ({
        ...prev,
        d_value: calculatedDValue.toFixed(2)
      }));
    }
  }, [formData.d_wt_1, formData.d_wt_2, formData.d_rate_1, formData.pointer_diamond, formData.diamond_weight]);

  // Auto-calculate net weight: Gross Weight - Diamond Weight (convert carats to grams)
  useEffect(() => {
    const grossWeight = parseFloat(formData.weight_grams) || 0;
    const diamondWeightCarats = parseFloat(formData.diamond_weight) || 0;
    const diamondWeightGrams = diamondWeightCarats * 0.2; // 1 carat = 0.2 grams
    
    if (grossWeight > 0 && diamondWeightCarats > 0) {
      const netWeight = grossWeight - diamondWeightGrams;
      if (netWeight > 0 && netWeight.toFixed(3) !== formData.net_weight) {
        setFormData((prev: any) => ({
          ...prev,
          net_weight: netWeight.toFixed(3)
        }));
      }
    }
  }, [formData.weight_grams, formData.diamond_weight]);

  // Auto-calculate MAKING charges (MKG)
  useEffect(() => {
    const netWeight = parseFloat(formData.net_weight) || 0;
    
    if (netWeight > 0 && vendorMakingCharges > 0) {
      const calculatedMkg = netWeight * vendorMakingCharges;
      if (calculatedMkg.toFixed(2) !== formData.mkg) {
        setFormData((prev: any) => ({
          ...prev,
          mkg: calculatedMkg.toFixed(2)
        }));
      }
    }
  }, [formData.net_weight, vendorMakingCharges]);

  // Auto-calculate GOLD value and TOTAL price
  useEffect(() => {
    const netWeight = parseFloat(formData.net_weight) || 0;
    const goldPerGram = parseFloat(formData.gold_per_gram_price) || 0;
    const purityFraction = (parseFloat(formData.purity_fraction_used) || 100) / 100;
    const diamondValue = parseFloat(formData.d_value) || 0;
    const mkg = parseFloat(formData.mkg) || 0;
    const certificationCost = parseFloat(formData.certification_cost) || 0;
    const gemstoneCost = parseFloat(formData.gemstone_cost) || 0;
    
    // GOLD = NET WT × gold rate × PURITY_FRACTION_USED
    const goldValue = netWeight * goldPerGram * purityFraction;
    
    // TOTAL = D VALUE + MAKING + GOLD + CERTIFICATION + GEMSTONE COST
    const totalPrice = diamondValue + mkg + goldValue + certificationCost + gemstoneCost;
    
    if (totalPrice > 0 && totalPrice.toFixed(2) !== formData.retail_price) {
      setFormData((prev: any) => ({
        ...prev,
        retail_price: totalPrice.toFixed(2),
        cost_price: (totalPrice * 0.85).toFixed(2) // 85% of retail as default cost
      }));
    }
  }, [
    formData.net_weight,
    formData.gold_per_gram_price,
    formData.purity_fraction_used,
    formData.d_value,
    formData.mkg,
    formData.certification_cost,
    formData.gemstone_cost
  ]);
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></span>
        Jewellery Details
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></span>
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="metal_type">Metal Type</Label>
          <Input
            id="metal_type"
            name="metal_type"
            value={formData.metal_type}
            onChange={handleChange}
            placeholder="18k Gold"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gemstone">Gemstone</Label>
          <Input
            id="gemstone"
            name="gemstone"
            value={formData.gemstone}
            onChange={handleChange}
            placeholder="GH VS (Color Clarity)"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="weight_grams">Gross Weight (g)</Label>
          <Input
            id="weight_grams"
            name="weight_grams"
            type="number"
            step="0.001"
            value={formData.weight_grams}
            onChange={handleChange}
            placeholder="4.37"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="net_weight">Net Weight (g)</Label>
          <Input
            id="net_weight"
            name="net_weight"
            type="number"
            step="0.001"
            value={formData.net_weight}
            onChange={handleChange}
            placeholder="4.252"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="d_wt_1">D.WT 1 (ct)</Label>
          <Input
            id="d_wt_1"
            name="d_wt_1"
            type="number"
            step="0.01"
            value={formData.d_wt_1}
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
            value={formData.d_wt_2}
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
            value={formData.diamond_weight}
            onChange={handleChange}
            placeholder="0.59"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="d_rate_1">D Rate 1 (₹)</Label>
          <Input
            id="d_rate_1"
            name="d_rate_1"
            type="number"
            step="0.01"
            value={formData.d_rate_1}
            onChange={handleChange}
            placeholder="15000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pointer_diamond">Pointer Diamond (₹)</Label>
          <Input
            id="pointer_diamond"
            name="pointer_diamond"
            type="number"
            step="0.01"
            value={formData.pointer_diamond}
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
            value={formData.d_value}
            onChange={handleChange}
            placeholder="8850"
            className="bg-muted/30"
            readOnly
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="purity_fraction_used">Purity (%)</Label>
          <Input
            id="purity_fraction_used"
            name="purity_fraction_used"
            type="number"
            step="0.01"
            value={formData.purity_fraction_used}
            onChange={handleChange}
            placeholder="76"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gold_per_gram_price">Gold/Gram (₹)</Label>
          <Input
            id="gold_per_gram_price"
            name="gold_per_gram_price"
            type="number"
            step="0.01"
            value={formData.gold_per_gram_price}
            onChange={handleChange}
            placeholder="7500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="mkg">Making Charges (₹)</Label>
          <Input
            id="mkg"
            name="mkg"
            type="number"
            step="0.01"
            value={formData.mkg}
            onChange={handleChange}
            placeholder="4039.40"
            className="bg-muted/30"
            readOnly
          />
          <p className="text-xs text-muted-foreground">
            Auto-calculated: Net Weight × {vendorMakingCharges}/g
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="retail_price">Total Price (₹)</Label>
          <Input
            id="retail_price"
            name="retail_price"
            type="number"
            step="0.01"
            value={formData.retail_price}
            onChange={handleChange}
            placeholder="0"
            className="bg-muted/30"
            readOnly
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="certification_cost">Cert Cost (₹)</Label>
          <Input
            id="certification_cost"
            name="certification_cost"
            type="number"
            step="0.01"
            value={formData.certification_cost}
            onChange={handleChange}
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gemstone_cost">Gemstone (₹)</Label>
          <Input
            id="gemstone_cost"
            name="gemstone_cost"
            type="number"
            step="0.01"
            value={formData.gemstone_cost}
            onChange={handleChange}
            placeholder="0"
          />
        </div>
      </div>

      <div className="p-4 bg-muted/50 rounded-lg border border-border">
        <p className="text-sm font-medium mb-3">Formula Breakdown:</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">D Value:</span>
            <span className="font-medium">₹{parseFloat(formData.d_value || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Making Charges:</span>
            <span className="font-medium">₹{parseFloat(formData.mkg || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Gold Value:</span>
            <span className="font-medium">₹{(parseFloat(formData.net_weight || 0) * parseFloat(formData.gold_per_gram_price || 0) * (parseFloat(formData.purity_fraction_used || 100) / 100)).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Certification:</span>
            <span className="font-medium">₹{parseFloat(formData.certification_cost || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Gemstone Cost:</span>
            <span className="font-medium">₹{parseFloat(formData.gemstone_cost || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="border-t pt-2 flex justify-between">
            <span className="font-semibold">Total Price:</span>
            <span className="font-bold text-primary">₹{parseFloat(formData.retail_price || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
