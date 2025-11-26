import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calculator, IndianRupee, Save, FolderOpen, Trash2, TrendingUp, Upload, X, Image as ImageIcon, Info } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ManufacturingCost = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [estimates, setEstimates] = useState<any[]>([]);
  const [currentEstimateId, setCurrentEstimateId] = useState<string | null>(null);
  const [estimateName, setEstimateName] = useState("");
  const [notes, setNotes] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customCertification, setCustomCertification] = useState("");
  
  const [formData, setFormData] = useState({
    netWeight: 0,
    purityFraction: 0.76,
    goldRate24k: 0,
    makingCharges: 0,
    cadDesignCharges: 0,
    cammingCharges: 0,
    certificationCost: 0,
    diamondPerCaratPrice: 0,
    diamondWeight: 0,
    diamondType: "",
    diamondShape: "",
    diamondColor: "",
    diamondClarity: "",
    diamondCertification: "",
    gemstonePerCaratPrice: 0,
    gemstoneWeight: 0,
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
    const diamondCost = formData.diamondPerCaratPrice * formData.diamondWeight;
    const gemstoneCost = formData.gemstonePerCaratPrice * formData.gemstoneWeight;

    const totalCost =
      goldCost +
      formData.makingCharges +
      formData.cadDesignCharges +
      formData.cammingCharges +
      formData.certificationCost +
      diamondCost +
      gemstoneCost;

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
      diamondPerCaratPrice: 0,
      diamondWeight: 0,
      diamondType: "",
      diamondShape: "",
      diamondColor: "",
      diamondClarity: "",
      diamondCertification: "",
      gemstonePerCaratPrice: 0,
      gemstoneWeight: 0,
    });
    setProfitMargin(0);
    setCurrentEstimateId(null);
    setEstimateName("");
    setNotes("");
    setReferenceImages([]);
    setCustomCertification("");
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

    const diamondCost = formData.diamondPerCaratPrice * formData.diamondWeight;
    const gemstoneCost = formData.gemstonePerCaratPrice * formData.gemstoneWeight;

    const estimateData = {
      user_id: user.id,
      estimate_name: estimateName,
      net_weight: formData.netWeight,
      purity_fraction: formData.purityFraction,
      gold_rate_24k: formData.goldRate24k,
      making_charges: formData.makingCharges,
      cad_design_charges: formData.cadDesignCharges,
      camming_charges: formData.cammingCharges,
      certification_cost: formData.certificationCost,
      diamond_cost: diamondCost,
      gemstone_cost: gemstoneCost,
      gold_cost: costs.goldCost,
      total_cost: costs.totalCost,
      profit_margin_percentage: profitMargin,
      final_selling_price: costs.finalSellingPrice,
      notes: notes || null,
      reference_images: referenceImages,
      details: {
        diamond_per_carat_price: formData.diamondPerCaratPrice,
        diamond_weight: formData.diamondWeight,
        diamond_type: formData.diamondType,
        diamond_shape: formData.diamondShape,
        diamond_color: formData.diamondColor,
        diamond_clarity: formData.diamondClarity,
        diamond_certification: formData.diamondCertification === 'other' ? customCertification : formData.diamondCertification,
        gemstone_per_carat_price: formData.gemstonePerCaratPrice,
        gemstone_weight: formData.gemstoneWeight,
      },
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
    const details = estimate.details as any;
    const certValue = details?.diamond_certification || "";
    const knownCerts = ["GIA", "IGI", "AGS", "EGL", "HRD", "GSI", "none"];
    
    setFormData({
      netWeight: estimate.net_weight || 0,
      purityFraction: estimate.purity_fraction || 0.76,
      goldRate24k: estimate.gold_rate_24k || 0,
      makingCharges: estimate.making_charges || 0,
      cadDesignCharges: estimate.cad_design_charges || 0,
      cammingCharges: estimate.camming_charges || 0,
      certificationCost: estimate.certification_cost || 0,
      diamondPerCaratPrice: details?.diamond_per_carat_price || 0,
      diamondWeight: details?.diamond_weight || 0,
      diamondType: details?.diamond_type || "",
      diamondShape: details?.diamond_shape || "",
      diamondColor: details?.diamond_color || "",
      diamondClarity: details?.diamond_clarity || "",
      diamondCertification: knownCerts.includes(certValue) ? certValue : (certValue ? "other" : ""),
      gemstonePerCaratPrice: details?.gemstone_per_carat_price || 0,
      gemstoneWeight: details?.gemstone_weight || 0,
    });
    
    if (certValue && !knownCerts.includes(certValue)) {
      setCustomCertification(certValue);
    } else {
      setCustomCertification("");
    }
    
    setProfitMargin(estimate.profit_margin_percentage || 0);
    setCurrentEstimateId(estimate.id);
    setEstimateName(estimate.estimate_name);
    setNotes(estimate.notes || "");
    setReferenceImages(estimate.reference_images || []);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingImage(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to upload images.",
          variant: "destructive",
        });
        return;
      }

      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast({
            title: "Invalid File Type",
            description: `${file.name} is not an image file.`,
            variant: "destructive",
          });
          continue;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File Too Large",
            description: `${file.name} exceeds 5MB limit.`,
            variant: "destructive",
          });
          continue;
        }

        // Create unique filename
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from("manufacturing-estimates")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from("manufacturing-estimates")
          .getPublicUrl(data.path);

        uploadedUrls.push(publicUrl);
      }

      setReferenceImages([...referenceImages, ...uploadedUrls]);
      
      toast({
        title: "Images Uploaded",
        description: `${uploadedUrls.length} image(s) uploaded successfully.`,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setReferenceImages(referenceImages.filter((_, i) => i !== index));
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

        {/* Reference Images Upload */}
        <Card className="shadow-lg mb-6">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              Reference Images
            </CardTitle>
            <CardDescription>
              Upload customer photos to estimate weight and materials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />

            {referenceImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {referenceImages.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square overflow-hidden rounded-lg border-2 border-border bg-muted">
                      <img
                        src={url}
                        alt={`Reference ${index + 1}`}
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -right-2 -top-2 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 shadow-lg"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Button
              variant="outline"
              className="w-full border-dashed border-2 hover:border-primary hover:bg-primary/5"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Reference Images
                </>
              )}
            </Button>
          </CardContent>
        </Card>

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
                <div className="flex items-center gap-2">
                  <Label htmlFor="diamondType">Diamond Type</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs bg-popover">
                        <p className="text-sm">
                          <strong>Natural Diamonds:</strong> Formed deep in the Earth over billions of years. Typically more expensive and considered traditional.
                          <br /><br />
                          <strong>Lab-Grown Diamonds:</strong> Created in controlled laboratory environments. Chemically identical to natural diamonds but more affordable and environmentally friendly.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Select
                  value={formData.diamondType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, diamondType: value }))}
                >
                  <SelectTrigger id="diamondType" className="bg-background">
                    <SelectValue placeholder="Select diamond type" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="natural">Natural Diamond</SelectItem>
                    <SelectItem value="lab-grown">Lab-Grown Diamond</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="diamondShape">Diamond Shape</Label>
                <Select
                  value={formData.diamondShape}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, diamondShape: value }))}
                >
                  <SelectTrigger id="diamondShape" className="bg-background">
                    <SelectValue placeholder="Select shape" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="round">Round</SelectItem>
                    <SelectItem value="princess">Princess</SelectItem>
                    <SelectItem value="cushion">Cushion</SelectItem>
                    <SelectItem value="oval">Oval</SelectItem>
                    <SelectItem value="emerald">Emerald</SelectItem>
                    <SelectItem value="pear">Pear</SelectItem>
                    <SelectItem value="marquise">Marquise</SelectItem>
                    <SelectItem value="radiant">Radiant</SelectItem>
                    <SelectItem value="asscher">Asscher</SelectItem>
                    <SelectItem value="heart">Heart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="diamondPerCaratPrice">Diamond Per Carat Price (₹)</Label>
                <Input
                  id="diamondPerCaratPrice"
                  type="number"
                  step="0.01"
                  value={formData.diamondPerCaratPrice || ""}
                  onChange={(e) => handleChange("diamondPerCaratPrice", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diamondWeight">Diamond Weight (carats)</Label>
                <Input
                  id="diamondWeight"
                  type="number"
                  step="0.01"
                  value={formData.diamondWeight || ""}
                  onChange={(e) => handleChange("diamondWeight", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diamondColor">Diamond Color</Label>
                <Select
                  value={formData.diamondColor}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, diamondColor: value }))}
                >
                  <SelectTrigger id="diamondColor" className="bg-background">
                    <SelectValue placeholder="Select color grade" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="D">D (Colorless)</SelectItem>
                    <SelectItem value="E">E (Colorless)</SelectItem>
                    <SelectItem value="F">F (Colorless)</SelectItem>
                    <SelectItem value="G">G (Near Colorless)</SelectItem>
                    <SelectItem value="H">H (Near Colorless)</SelectItem>
                    <SelectItem value="I">I (Near Colorless)</SelectItem>
                    <SelectItem value="J">J (Near Colorless)</SelectItem>
                    <SelectItem value="K">K (Faint Yellow)</SelectItem>
                    <SelectItem value="L">L (Faint Yellow)</SelectItem>
                    <SelectItem value="M">M (Faint Yellow)</SelectItem>
                    <SelectItem value="N-R">N-R (Very Light Yellow)</SelectItem>
                    <SelectItem value="S-Z">S-Z (Light Yellow)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="diamondClarity">Diamond Clarity</Label>
                <Select
                  value={formData.diamondClarity}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, diamondClarity: value }))}
                >
                  <SelectTrigger id="diamondClarity" className="bg-background">
                    <SelectValue placeholder="Select clarity grade" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="FL">FL (Flawless)</SelectItem>
                    <SelectItem value="IF">IF (Internally Flawless)</SelectItem>
                    <SelectItem value="VVS1">VVS1 (Very Very Slightly Included)</SelectItem>
                    <SelectItem value="VVS2">VVS2 (Very Very Slightly Included)</SelectItem>
                    <SelectItem value="VS1">VS1 (Very Slightly Included)</SelectItem>
                    <SelectItem value="VS2">VS2 (Very Slightly Included)</SelectItem>
                    <SelectItem value="SI1">SI1 (Slightly Included)</SelectItem>
                    <SelectItem value="SI2">SI2 (Slightly Included)</SelectItem>
                    <SelectItem value="I1">I1 (Included)</SelectItem>
                    <SelectItem value="I2">I2 (Included)</SelectItem>
                    <SelectItem value="I3">I3 (Included)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="diamondCertification">Diamond Certification</Label>
                <Select
                  value={formData.diamondCertification}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, diamondCertification: value }))}
                >
                  <SelectTrigger id="diamondCertification" className="bg-background">
                    <SelectValue placeholder="Select certification" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="GIA">GIA (Gemological Institute of America)</SelectItem>
                    <SelectItem value="IGI">IGI (International Gemological Institute)</SelectItem>
                    <SelectItem value="AGS">AGS (American Gem Society)</SelectItem>
                    <SelectItem value="EGL">EGL (European Gemological Laboratory)</SelectItem>
                    <SelectItem value="HRD">HRD (Hoge Raad voor Diamant)</SelectItem>
                    <SelectItem value="GSI">GSI (Gemological Science International)</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="none">No Certification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.diamondCertification === 'other' && (
                <div className="space-y-2">
                  <Label htmlFor="customCertification">Custom Certification</Label>
                  <Input
                    id="customCertification"
                    type="text"
                    value={customCertification}
                    onChange={(e) => setCustomCertification(e.target.value)}
                    placeholder="Enter certification name"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="gemstonePerCaratPrice">Gemstone Per Carat Price (₹)</Label>
                <Input
                  id="gemstonePerCaratPrice"
                  type="number"
                  step="0.01"
                  value={formData.gemstonePerCaratPrice || ""}
                  onChange={(e) => handleChange("gemstonePerCaratPrice", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gemstoneWeight">Gemstone Weight (carats)</Label>
                <Input
                  id="gemstoneWeight"
                  type="number"
                  step="0.01"
                  value={formData.gemstoneWeight || ""}
                  onChange={(e) => handleChange("gemstoneWeight", e.target.value)}
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
                  <span className="font-medium">₹{(formData.diamondPerCaratPrice * formData.diamondWeight).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Gemstone Cost:</span>
                  <span className="font-medium">₹{(formData.gemstonePerCaratPrice * formData.gemstoneWeight).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
