import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calculator, Coins, Diamond, Gem, IndianRupee } from "lucide-react";

interface FormData {
  grossWeight: number;
  netWeight: number;
  purityFraction: number;
  goldRate24k: number;
  makingCharges: number;
  cadDesignCharges: number;
  cammingCharges: number;
  certificationCost: number;
  diamondPerCaratPrice: number;
  diamondWeight: number;
  diamondType: string;
  diamondShape: string;
  diamondColor: string;
  diamondClarity: string;
  gemstonePerCaratPrice: number;
  gemstoneWeight: number;
}

interface JewelrySpecsSectionProps {
  formData: FormData;
  onFormDataChange: (field: keyof FormData, value: string | number) => void;
  weightEntryMode: "gross" | "net";
  onWeightEntryModeChange: (mode: "gross" | "net") => void;
}

export const JewelrySpecsSection = ({
  formData,
  onFormDataChange,
  weightEntryMode,
  onWeightEntryModeChange,
}: JewelrySpecsSectionProps) => {
  const handleChange = (field: keyof FormData, value: string) => {
    onFormDataChange(field, parseFloat(value) || 0);
  };

  return (
    <div className="space-y-8">
      {/* Weight and Purity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Weight & Purity
          </CardTitle>
          <CardDescription>Enter jewelry weight specifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Weight Entry Mode Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Weight Entry Mode</Label>
              <p className="text-xs text-muted-foreground">
                Choose how you want to enter weight values
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={weightEntryMode === "gross" ? "default" : "outline"}
                size="sm"
                onClick={() => onWeightEntryModeChange("gross")}
              >
                Gross Weight
              </Button>
              <Button
                type="button"
                variant={weightEntryMode === "net" ? "default" : "outline"}
                size="sm"
                onClick={() => onWeightEntryModeChange("net")}
              >
                Net Weight
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {weightEntryMode === "gross" ? (
              <>
                <div className="space-y-1">
                  <Label htmlFor="gross-weight" className="text-sm">
                    Gross Weight (grams)
                  </Label>
                  <Input
                    id="gross-weight"
                    type="number"
                    min={0}
                    step={0.001}
                    value={formData.grossWeight}
                    onChange={(e) => handleChange("grossWeight", e.target.value)}
                    placeholder="0.000"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="net-weight-auto" className="text-sm">
                    Net Weight (grams)
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Input
                          id="net-weight-auto"
                          type="number"
                          value={formData.netWeight}
                          disabled
                          className="bg-muted/50 cursor-not-allowed"
                          placeholder="Auto-calculated"
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">
                          Auto-calculated: Gross - (Diamond + Gemstone weights)
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </>
            ) : (
              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="net-weight-manual" className="text-sm">
                  Net Weight (grams)
                </Label>
                <Input
                  id="net-weight-manual"
                  type="number"
                  min={0}
                  step={0.001}
                  value={formData.netWeight}
                  onChange={(e) => handleChange("netWeight", e.target.value)}
                  placeholder="0.000"
                />
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="purity-fraction" className="text-sm">
                Purity Fraction
              </Label>
              <Input
                id="purity-fraction"
                type="number"
                min={0}
                max={1}
                step={0.01}
                value={formData.purityFraction}
                onChange={(e) => handleChange("purityFraction", e.target.value)}
                placeholder="0.76"
              />
              <p className="text-xs text-muted-foreground">e.g., 0.76 for 18K gold</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gold Rate and Charges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Gold Rate & Charges
          </CardTitle>
          <CardDescription>Enter rates and additional charges</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="space-y-1">
            <Label htmlFor="gold-rate-24k" className="text-sm">
              Gold Rate 24K (per gram)
            </Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="gold-rate-24k"
                type="number"
                min={0}
                step={0.01}
                value={formData.goldRate24k}
                onChange={(e) => handleChange("goldRate24k", e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="making-charges" className="text-sm">
              Making Charges (Rs.)
            </Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="making-charges"
                type="number"
                min={0}
                step={0.01}
                value={formData.makingCharges}
                onChange={(e) => handleChange("makingCharges", e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="cad-charges" className="text-sm">
              CAD Design Charges
            </Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="cad-charges"
                type="number"
                min={0}
                step={0.01}
                value={formData.cadDesignCharges}
                onChange={(e) => handleChange("cadDesignCharges", e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="camming-charges" className="text-sm">
              Camming Charges
            </Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="camming-charges"
                type="number"
                min={0}
                step={0.01}
                value={formData.cammingCharges}
                onChange={(e) => handleChange("cammingCharges", e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="certification-cost" className="text-sm">
              Certification Charges
            </Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="certification-cost"
                type="number"
                min={0}
                step={0.01}
                value={formData.certificationCost}
                onChange={(e) => handleChange("certificationCost", e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diamond Specifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Diamond className="h-5 w-5 text-primary" />
            Diamond Specifications
          </CardTitle>
          <CardDescription>Enter diamond details and pricing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label htmlFor="diamond-type" className="text-sm">
                Diamond Type
              </Label>
              <Select
                value={formData.diamondType}
                onValueChange={(value) => onFormDataChange("diamondType", value)}
              >
                <SelectTrigger id="diamond-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="natural">Natural Diamond</SelectItem>
                  <SelectItem value="lab-grown">Lab Grown Diamond</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="diamond-weight" className="text-sm">
                Diamond Carat Weight
              </Label>
              <Input
                id="diamond-weight"
                type="number"
                min={0}
                step={0.01}
                value={formData.diamondWeight}
                onChange={(e) => handleChange("diamondWeight", e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="diamond-per-carat" className="text-sm">
                Diamond Per Carat Price (Rs.)
              </Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="diamond-per-carat"
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.diamondPerCaratPrice}
                  onChange={(e) => handleChange("diamondPerCaratPrice", e.target.value)}
                  className="pl-9"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="diamond-shape" className="text-sm">
                Diamond Shape
              </Label>
              <Select
                value={formData.diamondShape}
                onValueChange={(value) => onFormDataChange("diamondShape", value)}
              >
                <SelectTrigger id="diamond-shape">
                  <SelectValue placeholder="Select shape" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="round">Round</SelectItem>
                  <SelectItem value="princess">Princess</SelectItem>
                  <SelectItem value="cushion">Cushion</SelectItem>
                  <SelectItem value="emerald">Emerald</SelectItem>
                  <SelectItem value="oval">Oval</SelectItem>
                  <SelectItem value="pear">Pear</SelectItem>
                  <SelectItem value="marquise">Marquise</SelectItem>
                  <SelectItem value="heart">Heart</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="diamond-color" className="text-sm">
                Diamond Color
              </Label>
              <Select
                value={formData.diamondColor}
                onValueChange={(value) => onFormDataChange("diamondColor", value)}
              >
                <SelectTrigger id="diamond-color">
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="D">D (Colorless)</SelectItem>
                  <SelectItem value="E">E (Colorless)</SelectItem>
                  <SelectItem value="F">F (Colorless)</SelectItem>
                  <SelectItem value="G">G (Near Colorless)</SelectItem>
                  <SelectItem value="H">H (Near Colorless)</SelectItem>
                  <SelectItem value="I">I (Near Colorless)</SelectItem>
                  <SelectItem value="J">J (Near Colorless)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="diamond-clarity" className="text-sm">
                Diamond Clarity
              </Label>
              <Select
                value={formData.diamondClarity}
                onValueChange={(value) => onFormDataChange("diamondClarity", value)}
              >
                <SelectTrigger id="diamond-clarity">
                  <SelectValue placeholder="Select clarity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FL">FL (Flawless)</SelectItem>
                  <SelectItem value="IF">IF (Internally Flawless)</SelectItem>
                  <SelectItem value="VVS1">VVS1</SelectItem>
                  <SelectItem value="VVS2">VVS2</SelectItem>
                  <SelectItem value="VS1">VS1</SelectItem>
                  <SelectItem value="VS2">VS2</SelectItem>
                  <SelectItem value="SI1">SI1</SelectItem>
                  <SelectItem value="SI2">SI2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Diamond Cost:</span>
              <span className="text-lg font-bold text-primary">
                ₹{(formData.diamondPerCaratPrice * formData.diamondWeight).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gemstone Specifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gem className="h-5 w-5 text-primary" />
            Gemstone Specifications
          </CardTitle>
          <CardDescription>Enter gemstone details and pricing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="gemstone-weight" className="text-sm">
                Gemstone Carat Weight
              </Label>
              <Input
                id="gemstone-weight"
                type="number"
                min={0}
                step={0.01}
                value={formData.gemstoneWeight}
                onChange={(e) => handleChange("gemstoneWeight", e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="gemstone-per-carat" className="text-sm">
                Gemstone Per Carat Price (Rs.)
              </Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="gemstone-per-carat"
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.gemstonePerCaratPrice}
                  onChange={(e) => handleChange("gemstonePerCaratPrice", e.target.value)}
                  className="pl-9"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Gemstone Cost:</span>
              <span className="text-lg font-bold text-primary">
                ₹
                {(formData.gemstonePerCaratPrice * formData.gemstoneWeight).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};