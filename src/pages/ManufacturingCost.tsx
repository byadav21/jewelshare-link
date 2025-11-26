import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calculator, IndianRupee, Save, FolderOpen, Trash2, TrendingUp } from "lucide-react";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ManufacturingCost = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [estimates, setEstimates] = useState<any[]>([]);
  const [currentEstimateId, setCurrentEstimateId] = useState<string | null>(null);
  const [estimateName, setEstimateName] = useState("");
  const [notes, setNotes] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  
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

  const [profitMargin, setProfitMargin] = useState(0);

  const [costs, setCosts] = useState({
    goldCost: 0,
    totalCost: 0,
    finalSellingPrice: 0,
    profitAmount: 0,
  });

  // Check auth status
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        fetchEstimates();
      }
    });
  }, []);

  // Fetch saved estimates
  const fetchEstimates = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('manufacturing_cost_estimates')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching estimates:', error);
    } else {
      setEstimates(data || []);
    }
  };

  // Calculate costs
  useEffect(() => {
    const goldCost = formData.netWeight * formData.purityFraction * formData.goldRate24k;

    const totalCost =
      goldCost +
      formData.makingCharges +
      formData.cadDesignCharges +
      formData.cammingCharges +
      formData.certificationCost +
      formData.diamondCost +
      formData.gemstoneCost;

    const finalSellingPrice = totalCost * (1 + profitMargin / 100);
    const profitAmount = finalSellingPrice - totalCost;

    setCosts({
      goldCost: parseFloat(goldCost.toFixed(2)),
      totalCost: parseFloat(totalCost.toFixed(2)),
      finalSellingPrice: parseFloat(finalSellingPrice.toFixed(2)),
      profitAmount: parseFloat(profitAmount.toFixed(2)),
    });
  }, [formData, profitMargin]);

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
    setProfitMargin(0);
    setCurrentEstimateId(null);
    setEstimateName("");
    setNotes("");
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save estimates",
        variant: "destructive",
      });
      return;
    }

    if (!estimateName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for this estimate",
        variant: "destructive",
      });
      return;
    }

    const estimateData = {
      user_id: user.id,
      estimate_name: estimateName,
      ...formData,
      gold_cost: costs.goldCost,
      total_cost: costs.totalCost,
      profit_margin_percentage: profitMargin,
      final_selling_price: costs.finalSellingPrice,
      notes: notes || null,
    };

    if (currentEstimateId) {
      // Update existing
      const { error } = await supabase
        .from('manufacturing_cost_estimates')
        .update(estimateData)
        .eq('id', currentEstimateId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update estimate",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Estimate updated successfully",
        });
        fetchEstimates();
        setShowSaveDialog(false);
      }
    } else {
      // Create new
      const { error } = await supabase
        .from('manufacturing_cost_estimates')
        .insert([estimateData]);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to save estimate",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Estimate saved successfully",
        });
        fetchEstimates();
        setShowSaveDialog(false);
      }
    }
  };

  const handleLoad = (estimate: any) => {
    setFormData({
      netWeight: estimate.net_weight || 0,
      purityFraction: estimate.purity_fraction || 0.76,
      goldRate24k: estimate.gold_rate_24k || 0,
      makingCharges: estimate.making_charges || 0,
      cadDesignCharges: estimate.cad_design_charges || 0,
      cammingCharges: estimate.camming_charges || 0,
      certificationCost: estimate.certification_cost || 0,
      diamondCost: estimate.diamond_cost || 0,
      gemstoneCost: estimate.gemstone_cost || 0,
    });
    setProfitMargin(estimate.profit_margin_percentage || 0);
    setCurrentEstimateId(estimate.id);
    setEstimateName(estimate.estimate_name);
    setNotes(estimate.notes || "");
    setShowLoadDialog(false);
    toast({
      title: "Loaded",
      description: `Estimate "${estimate.estimate_name}" loaded successfully`,
    });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('manufacturing_cost_estimates')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete estimate",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Deleted",
        description: "Estimate deleted successfully",
      });
      fetchEstimates();
      if (currentEstimateId === id) {
        handleReset();
      }
    }
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

          {user && (
            <div className="flex gap-2 justify-center mt-4">
              <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    Save Estimate
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save Manufacturing Cost Estimate</DialogTitle>
                    <DialogDescription>
                      Save this estimate for future reference and comparison
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="estimateName">Estimate Name *</Label>
                      <Input
                        id="estimateName"
                        value={estimateName}
                        onChange={(e) => setEstimateName(e.target.value)}
                        placeholder="e.g., Gold Ring - Design A"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add any additional notes..."
                        rows={3}
                      />
                    </div>
                    <Button onClick={handleSave} className="w-full">
                      {currentEstimateId ? 'Update' : 'Save'} Estimate
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Load Estimate
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Saved Estimates</DialogTitle>
                    <DialogDescription>
                      Select an estimate to load
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2">
                    {estimates.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No saved estimates yet
                      </p>
                    ) : (
                      estimates.map((estimate) => (
                        <div
                          key={estimate.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold">{estimate.estimate_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Total Cost: ₹{estimate.total_cost?.toLocaleString('en-IN')} | 
                              Selling Price: ₹{estimate.final_selling_price?.toLocaleString('en-IN')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(estimate.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleLoad(estimate)}
                            >
                              Load
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(estimate.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
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

            {/* Profit Margin Calculator */}
            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Profit Margin Calculator</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-primary/5 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="profitMargin">Profit Margin (%)</Label>
                  <Input
                    id="profitMargin"
                    type="number"
                    step="0.1"
                    value={profitMargin || ""}
                    onChange={(e) => setProfitMargin(parseFloat(e.target.value) || 0)}
                    placeholder="0.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Final Selling Price</Label>
                  <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-lg font-bold text-primary">
                    ₹{costs.finalSellingPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
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
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-bold">Total Manufacturing Cost:</span>
                    <span className="text-2xl font-bold text-primary">
                      ₹{costs.totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  {profitMargin > 0 && (
                    <>
                      <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
                        <span>Profit ({profitMargin}%):</span>
                        <span className="font-medium text-green-600">
                          +₹{costs.profitAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-lg font-bold">Final Selling Price:</span>
                        <span className="text-2xl font-bold text-green-600">
                          ₹{costs.finalSellingPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </>
                  )}
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
