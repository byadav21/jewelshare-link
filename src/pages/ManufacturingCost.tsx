import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, IndianRupee } from "lucide-react";
import { BackToHomeButton } from "@/components/BackToHomeButton";

const ManufacturingCost = () => {
  const [formData, setFormData] = useState({
    netWeight: 0,
    purityFraction: 0.76,
    goldRate24k: 0,
    makingCharges: 0,
    cadDesignCharges: 0,
    cammingCharges: 0,
    certificationCost: 0,
    diamondCost: 0,
    gemstoneCost: 0,
  });

  const [costs, setCosts] = useState({
    goldCost: 0,
    totalCost: 0,
  });

  useEffect(() => {
    // Calculate gold cost
    const goldCost = formData.netWeight * formData.purityFraction * formData.goldRate24k;

    // Calculate total manufacturing cost
    const totalCost =
      goldCost +
      formData.makingCharges +
      formData.cadDesignCharges +
      formData.cammingCharges +
      formData.certificationCost +
      formData.diamondCost +
      formData.gemstoneCost;

    setCosts({
      goldCost: parseFloat(goldCost.toFixed(2)),
      totalCost: parseFloat(totalCost.toFixed(2)),
    });
  }, [formData]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: parseFloat(value) || 0,
    }));
  };

  const handleReset = () => {
    setFormData({
      netWeight: 0,
      purityFraction: 0.76,
      goldRate24k: 0,
      makingCharges: 0,
      cadDesignCharges: 0,
      cammingCharges: 0,
      certificationCost: 0,
      diamondCost: 0,
      gemstoneCost: 0,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 py-8 px-4">
      <div className="container max-w-5xl mx-auto">
        <BackToHomeButton />
        
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calculator className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Manufacturing Cost Estimator</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Calculate the total manufacturing cost for jewellery production
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="w-5 h-5" />
              Cost Components
            </CardTitle>
            <CardDescription>
              Enter all manufacturing cost components to calculate the total
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Gold Cost Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-accent/10 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="netWeight">Net Weight (grams)</Label>
                <Input
                  id="netWeight"
                  type="number"
                  step="0.01"
                  value={formData.netWeight || ""}
                  onChange={(e) => handleChange("netWeight", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purityFraction">Purity Fraction</Label>
                <Input
                  id="purityFraction"
                  type="number"
                  step="0.01"
                  value={formData.purityFraction || ""}
                  onChange={(e) => handleChange("purityFraction", e.target.value)}
                  placeholder="0.76"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goldRate24k">24K Gold Rate (₹/gram)</Label>
                <Input
                  id="goldRate24k"
                  type="number"
                  step="0.01"
                  value={formData.goldRate24k || ""}
                  onChange={(e) => handleChange("goldRate24k", e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Other Cost Components */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="makingCharges">Making Charges (₹)</Label>
                <Input
                  id="makingCharges"
                  type="number"
                  step="0.01"
                  value={formData.makingCharges || ""}
                  onChange={(e) => handleChange("makingCharges", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cadDesignCharges">CAD Design Charges (₹)</Label>
                <Input
                  id="cadDesignCharges"
                  type="number"
                  step="0.01"
                  value={formData.cadDesignCharges || ""}
                  onChange={(e) => handleChange("cadDesignCharges", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cammingCharges">Camming/Casting (₹)</Label>
                <Input
                  id="cammingCharges"
                  type="number"
                  step="0.01"
                  value={formData.cammingCharges || ""}
                  onChange={(e) => handleChange("cammingCharges", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="certificationCost">Certification (₹)</Label>
                <Input
                  id="certificationCost"
                  type="number"
                  step="0.01"
                  value={formData.certificationCost || ""}
                  onChange={(e) => handleChange("certificationCost", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diamondCost">Diamond Cost (₹)</Label>
                <Input
                  id="diamondCost"
                  type="number"
                  step="0.01"
                  value={formData.diamondCost || ""}
                  onChange={(e) => handleChange("diamondCost", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gemstoneCost">Gemstone Cost (₹)</Label>
                <Input
                  id="gemstoneCost"
                  type="number"
                  step="0.01"
                  value={formData.gemstoneCost || ""}
                  onChange={(e) => handleChange("gemstoneCost", e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-semibold">Cost Breakdown</h3>
              <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Gold Cost:</span>
                  <span className="font-medium">₹{costs.goldCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Making Charges:</span>
                  <span className="font-medium">₹{formData.makingCharges.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">CAD Design:</span>
                  <span className="font-medium">₹{formData.cadDesignCharges.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Camming/Casting:</span>
                  <span className="font-medium">₹{formData.cammingCharges.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Certification:</span>
                  <span className="font-medium">₹{formData.certificationCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Diamond Cost:</span>
                  <span className="font-medium">₹{formData.diamondCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Gemstone Cost:</span>
                  <span className="font-medium">₹{formData.gemstoneCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total Manufacturing Cost:</span>
                    <span className="text-2xl font-bold text-primary">
                      ₹{costs.totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Button onClick={handleReset} variant="outline" className="w-full">
              Reset Calculator
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManufacturingCost;

