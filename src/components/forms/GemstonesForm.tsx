import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GemstonesFormProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const GemstonesForm = ({ formData, handleChange }: GemstonesFormProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></span>
        Gemstone Details
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></span>
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="gemstone_name">Gemstone Name</Label>
          <Input
            id="gemstone_name"
            name="gemstone_name"
            value={formData.gemstone_name}
            onChange={handleChange}
            placeholder="Ruby, Sapphire, Emerald..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gemstone_type">Gemstone Type</Label>
          <Input
            id="gemstone_type"
            name="gemstone_type"
            value={formData.gemstone_type}
            onChange={handleChange}
            placeholder="Natural, Synthetic..."
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            name="color"
            value={formData.color}
            onChange={handleChange}
            placeholder="Red, Blue, Green..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clarity">Clarity</Label>
          <Input
            id="clarity"
            name="clarity"
            value={formData.clarity}
            onChange={handleChange}
            placeholder="VVS, VS, SI..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cut">Cut</Label>
          <Input
            id="cut"
            name="cut"
            value={formData.cut}
            onChange={handleChange}
            placeholder="Excellent, Good..."
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="carat_weight">Carat Weight</Label>
          <Input
            id="carat_weight"
            name="carat_weight"
            type="number"
            step="0.01"
            value={formData.carat_weight}
            onChange={handleChange}
            placeholder="5.50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="per_carat_price">Per Carat Price (₹)</Label>
          <Input
            id="per_carat_price"
            name="per_carat_price"
            type="number"
            step="0.01"
            value={formData.per_carat_price}
            onChange={handleChange}
            placeholder="10000"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="color_shade_amount">Color Shade Amount</Label>
        <Input
          id="color_shade_amount"
          name="color_shade_amount"
          value={formData.color_shade_amount}
          onChange={handleChange}
          placeholder="Vivid, Medium..."
        />
      </div>
    </div>
  );
};
