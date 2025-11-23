import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface JewelleryFormProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  setFormData: (data: any) => void;
}

export const JewelleryForm = ({ formData, handleChange, setFormData }: JewelleryFormProps) => {
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
    </div>
  );
};
