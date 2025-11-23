import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LooseDiamondsFormProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const LooseDiamondsForm = ({ formData, handleChange }: LooseDiamondsFormProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></span>
        Diamond Details
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></span>
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="shape">Shape</Label>
          <Input
            id="shape"
            name="shape"
            value={formData.shape}
            onChange={handleChange}
            placeholder="Round, Princess, Oval..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="carat">Carat</Label>
          <Input
            id="carat"
            name="carat"
            type="number"
            step="0.01"
            value={formData.carat}
            onChange={handleChange}
            placeholder="1.50"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            name="color"
            value={formData.color}
            onChange={handleChange}
            placeholder="D, E, F, G, H..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clarity">Clarity</Label>
          <Input
            id="clarity"
            name="clarity"
            value={formData.clarity}
            onChange={handleChange}
            placeholder="IF, VVS1, VVS2, VS1..."
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cut">Cut</Label>
          <Input
            id="cut"
            name="cut"
            value={formData.cut}
            onChange={handleChange}
            placeholder="Excellent, Very Good..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="polish">Polish</Label>
          <Input
            id="polish"
            name="polish"
            value={formData.polish}
            onChange={handleChange}
            placeholder="Excellent, Very Good..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="symmetry">Symmetry</Label>
          <Input
            id="symmetry"
            name="symmetry"
            value={formData.symmetry}
            onChange={handleChange}
            placeholder="Excellent, Very Good..."
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fluorescence">Fluorescence</Label>
          <Input
            id="fluorescence"
            name="fluorescence"
            value={formData.fluorescence}
            onChange={handleChange}
            placeholder="None, Faint, Medium..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="measurement">Measurement</Label>
          <Input
            id="measurement"
            name="measurement"
            value={formData.measurement}
            onChange={handleChange}
            placeholder="6.50 x 6.55 x 4.05 mm"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="lab">Lab</Label>
          <Input
            id="lab"
            name="lab"
            value={formData.lab}
            onChange={handleChange}
            placeholder="GIA, IGI, AGS..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="certification">Certification #</Label>
          <Input
            id="certification"
            name="certification"
            value={formData.certification}
            onChange={handleChange}
            placeholder="Certificate number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ratio">Ratio</Label>
          <Input
            id="ratio"
            name="ratio"
            value={formData.ratio}
            onChange={handleChange}
            placeholder="1.00 - 1.05"
          />
        </div>
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
          placeholder="500000"
        />
      </div>
    </div>
  );
};
