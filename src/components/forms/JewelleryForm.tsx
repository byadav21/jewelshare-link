import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface JewelleryFormProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  setFormData: (data: any) => void;
}

export const JewelleryForm = ({ formData, handleChange, setFormData }: JewelleryFormProps) => {
  // Auto-calculate net weight: Gross Weight - Diamond Weight (convert carats to grams)
  useEffect(() => {
    const grossWeight = parseFloat(formData.weight_grams) || 0;
    const diamondWeightCarats = parseFloat(formData.diamond_weight) || 0;
    const diamondWeightGrams = diamondWeightCarats * 0.2; // 1 carat = 0.2 grams
    
    if (grossWeight > 0 && diamondWeightCarats > 0) {
      const netWeight = grossWeight - diamondWeightGrams;
      if (netWeight > 0 && netWeight !== parseFloat(formData.net_weight)) {
        setFormData((prev: any) => ({
          ...prev,
          net_weight: netWeight.toFixed(3)
        }));
      }
    }
  }, [formData.weight_grams, formData.diamond_weight]);

  // Auto-calculate retail price: Gold Value + Diamond Value + MKG + Certification + Gemstone costs
  useEffect(() => {
    const netWeight = parseFloat(formData.net_weight) || 0;
    const goldPerGram = parseFloat(formData.gold_per_gram_price) || 0;
    const purityFraction = (parseFloat(formData.purity_fraction_used) || 100) / 100;
    const diamondValue = parseFloat(formData.d_value) || 0;
    const mkg = parseFloat(formData.mkg) || 0;
    const certificationCost = parseFloat(formData.certification_cost) || 0;
    const gemstoneCost = parseFloat(formData.gemstone_cost) || 0;
    
    if (netWeight > 0 && goldPerGram > 0) {
      const goldValue = netWeight * goldPerGram * purityFraction;
      const totalPrice = goldValue + diamondValue + mkg + certificationCost + gemstoneCost;
      
      if (totalPrice > 0 && totalPrice !== parseFloat(formData.retail_price)) {
        setFormData((prev: any) => ({
          ...prev,
          retail_price: totalPrice.toFixed(2),
          cost_price: (totalPrice * 0.85).toFixed(2) // 85% of retail as default cost
        }));
      }
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
          <Label htmlFor="mkg">MKG (₹)</Label>
          <Input
            id="mkg"
            name="mkg"
            type="number"
            step="0.01"
            value={formData.mkg}
            onChange={handleChange}
            placeholder="4039.40"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
        <p className="text-sm text-muted-foreground mb-2">Auto-calculated values:</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-medium">Net Weight:</span> {formData.net_weight || '0'} g
          </div>
          <div>
            <span className="font-medium">Retail Price:</span> ₹{parseFloat(formData.retail_price || 0).toLocaleString('en-IN')}
          </div>
        </div>
      </div>
    </div>
  );
};
