import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calculator, IndianRupee, Save, FolderOpen, Trash2, TrendingUp, Upload, X, Image as ImageIcon, Info, FileText, Calendar, Copy, Check, Building2, User, Coins, Diamond, Gem, Percent } from "lucide-react";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EstimateWorkflowSteps } from "@/components/estimate/EstimateWorkflowSteps";
import { EstimateFlowGuide } from "@/components/estimate/EstimateFlowGuide";
import { BasicInfoSection } from "@/components/estimate/BasicInfoSection";
import { CostingSection } from "@/components/estimate/CostingSection";
import { PricingSection } from "@/components/estimate/PricingSection";
import { ReviewSection } from "@/components/estimate/ReviewSection";
import { useEstimateWorkflow } from "@/hooks/useEstimateWorkflow";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { InvoiceLineItems, type LineItem } from "@/components/InvoiceLineItems";
import { generateInvoicePDF, type InvoiceData } from "@/utils/invoiceGenerator";
import { generateEstimatePDF } from "@/utils/estimateGenerator";
import { InvoicePreviewDialog } from "@/components/InvoicePreviewDialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

const ManufacturingCost = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const { currentStep, steps } = useEstimateWorkflow();
  const [showFlowGuide, setShowFlowGuide] = useState(true);
  const [estimates, setEstimates] = useState<any[]>([]);
  const [currentEstimateId, setCurrentEstimateId] = useState<string | null>(null);
  const [estimateName, setEstimateName] = useState("");
  const [notes, setNotes] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [estimateStatus, setEstimateStatus] = useState("draft");
  const [estimatedCompletionDate, setEstimatedCompletionDate] = useState<Date>();
  const [isCustomerVisible, setIsCustomerVisible] = useState(false);
  const [shareToken, setShareToken] = useState<string>("");
  const [copiedToken, setCopiedToken] = useState(false);
  const [guestUsageCount, setGuestUsageCount] = useState(0);
  const [showUsageLimitDialog, setShowUsageLimitDialog] = useState(false);
  const [vendorProfile, setVendorProfile] = useState<any>(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoicePrefix, setInvoicePrefix] = useState("INV");
  const [invoiceDate, setInvoiceDate] = useState<Date>(new Date());
  const [paymentTerms, setPaymentTerms] = useState("Net 30");
  const [paymentDueDate, setPaymentDueDate] = useState<Date>();
  const [invoiceNotes, setInvoiceNotes] = useState("");
  const [invoiceTemplate, setInvoiceTemplate] = useState<'detailed' | 'summary' | 'minimal'>('detailed');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [previewInvoiceData, setPreviewInvoiceData] = useState<InvoiceData | null>(null);
  const [formData, setFormData] = useState({
    purityFraction: 0.76,
    goldRate24k: 0
  });
  const [profitMargin, setProfitMargin] = useState(0);
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    gstin: ""
  });
  const [vendorGSTIN, setVendorGSTIN] = useState("");
  const [gstMode, setGstMode] = useState<'sgst_cgst' | 'igst' | 'none'>('sgst_cgst');
  const [sgstPercentage, setSgstPercentage] = useState(9);
  const [cgstPercentage, setCgstPercentage] = useState(9);
  const [igstPercentage, setIgstPercentage] = useState(18);
  const [shippingCharges, setShippingCharges] = useState(0);
  const [shippingZone, setShippingZone] = useState('local');
  const [exchangeRate, setExchangeRate] = useState(83); // USD to INR rate
  const [costs, setCosts] = useState({
    goldCost: 0,
    totalCost: 0,
    finalSellingPrice: 0,
    profitAmount: 0,
    sgstAmount: 0,
    cgstAmount: 0,
    igstAmount: 0,
    grandTotal: 0,
    totalInUSD: 0
  });

  // Check auth status and usage limits
  useEffect(() => {
    const checkUsageAndAuth = async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        // Authenticated users have unlimited access
        fetchEstimates();
        fetchVendorProfile();
      } else {
        // Check guest usage via backend
        try {
          const {
            data,
            error
          } = await supabase.functions.invoke('check-guest-usage', {
            body: {
              calculatorType: 'manufacturing'
            }
          });
          if (error) {
            console.error("Error checking guest usage:", error);
            // Fallback to allowing access if backend check fails
            return;
          }
          if (!data.allowed) {
            setShowUsageLimitDialog(true);
          } else {
            setGuestUsageCount(data.usageCount);
          }
        } catch (error) {
          console.error("Failed to check usage:", error);
          // Fallback to allowing access if request fails
        }
      }
    };
    checkUsageAndAuth();
  }, []);

  // Fetch vendor profile for branding and auto-populate pricing
  const fetchVendorProfile = async () => {
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (!user) return;
    const {
      data,
      error
    } = await supabase.from('vendor_profiles').select('business_name, logo_url, primary_brand_color, secondary_brand_color, brand_tagline, email, phone, address_line1, address_line2, city, state, pincode, country, gold_rate_24k_per_gram, making_charges_per_gram').eq('user_id', user.id).maybeSingle();
    if (error) {
      console.error('Error fetching vendor profile:', error);
    } else if (data) {
      setVendorProfile(data);
      // Auto-populate gold rate and making charges from profile
      setFormData(prev => ({
        ...prev,
        goldRate24k: data.gold_rate_24k_per_gram || 0,
        makingCharges: data.making_charges_per_gram || 0
      }));
    }
  };

  // Fetch saved estimates
  const fetchEstimates = async () => {
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (!user) return;
    const {
      data,
      error
    } = await supabase.from('manufacturing_cost_estimates').select('*').eq('user_id', user.id).order('created_at', {
      ascending: false
    });
    if (error) {
      console.error('Error fetching estimates:', error);
    } else {
      setEstimates(data || []);
    }
  };


  // Calculate costs from line items
  useEffect(() => {
    // Calculate subtotal from line items
    const lineItemsTotal = lineItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    const totalCost = lineItemsTotal;
    const finalSellingPrice = totalCost * (1 + profitMargin / 100);
    const profitAmount = finalSellingPrice - totalCost;

    // Calculate GST based on mode
    let sgstAmount = 0;
    let cgstAmount = 0;
    let igstAmount = 0;
    if (gstMode === 'sgst_cgst') {
      sgstAmount = finalSellingPrice * sgstPercentage / 100;
      cgstAmount = finalSellingPrice * cgstPercentage / 100;
    } else {
      igstAmount = finalSellingPrice * igstPercentage / 100;
    }

    // Calculate grand total with GST and shipping
    const grandTotal = finalSellingPrice + sgstAmount + cgstAmount + igstAmount + shippingCharges;

    // Calculate USD equivalent
    const totalInUSD = grandTotal / exchangeRate;
    setCosts({
      goldCost: 0, // No longer calculated from formData
      totalCost: parseFloat(totalCost.toFixed(2)),
      finalSellingPrice: parseFloat(finalSellingPrice.toFixed(2)),
      profitAmount: parseFloat(profitAmount.toFixed(2)),
      sgstAmount: parseFloat(sgstAmount.toFixed(2)),
      cgstAmount: parseFloat(cgstAmount.toFixed(2)),
      igstAmount: parseFloat(igstAmount.toFixed(2)),
      grandTotal: parseFloat(grandTotal.toFixed(2)),
      totalInUSD: parseFloat(totalInUSD.toFixed(2))
    });
  }, [lineItems, profitMargin, gstMode, sgstPercentage, cgstPercentage, igstPercentage, shippingCharges, exchangeRate]);
  const handleReset = () => {
    setFormData({
      purityFraction: 0.76,
      goldRate24k: 0
    });
    setProfitMargin(0);
    setCurrentEstimateId(null);
    setEstimateName("");
    setNotes("");
    setCustomerDetails({
      name: "",
      phone: "",
      email: "",
      address: "",
      gstin: ""
    });
    setVendorGSTIN("");
    setEstimateStatus("draft");
    setEstimatedCompletionDate(undefined);
    setIsCustomerVisible(false);
    setShareToken("");
    setLineItems([]);
    setGstMode('sgst_cgst');
    setSgstPercentage(9);
    setCgstPercentage(9);
    setIgstPercentage(18);
    setShippingCharges(0);
    setShippingZone('local');
    setExchangeRate(83);
  };
  const copyShareLink = () => {
    if (!shareToken) {
      toast({
        title: "No Tracking Link",
        description: "Please save the estimate first to generate a tracking link",
        variant: "destructive"
      });
      return;
    }
    const trackingUrl = `${window.location.origin}/order-tracking/${shareToken}`;
    navigator.clipboard.writeText(trackingUrl);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
    toast({
      title: "Link Copied",
      description: "Customer tracking link copied to clipboard"
    });
  };
  const generateNextInvoiceNumber = async () => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return;
      const {
        data,
        error
      } = await supabase.from("manufacturing_cost_estimates").select("invoice_number").eq("user_id", user.id).not("invoice_number", "is", null).order("created_at", {
        ascending: false
      }).limit(1);
      if (error) throw error;
      const currentYear = new Date().getFullYear();
      let nextNumber = 1;
      if (data && data.length > 0) {
        const lastInvoice = data[0].invoice_number;
        const match = lastInvoice.match(/(\d+)$/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }
      const newInvoiceNumber = `${invoicePrefix}-${currentYear}-${String(nextNumber).padStart(3, '0')}`;
      setInvoiceNumber(newInvoiceNumber);
      return newInvoiceNumber;
    } catch (error) {
      console.error("Error generating invoice number:", error);
      return `${invoicePrefix}-${new Date().getFullYear()}-001`;
    }
  };
  // Simplified handlers - redirect to Invoice Generator page
  const handleGenerateInvoice = async () => {
    navigate('/invoice-generator');
  };

  const handleExportPDF = () => {
    toast({
      title: "Use Invoice Generator",
      description: "Please use the Invoice Generator page to create and export invoice PDFs"
    });
    navigate('/invoice-generator');
  };

  const handleConfirmDownload = () => {
    toast({
      title: "Use Invoice Generator",
      description: "Please use the Invoice Generator page to create and export invoice PDFs"
    });
    navigate('/invoice-generator');
  };
  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save estimates.",
        variant: "destructive"
      });
      return;
    }

    if (!estimateName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter an estimate name.",
        variant: "destructive"
      });
      return;
    }

    const estimateData = {
      user_id: user.id,
      estimate_name: estimateName,
      customer_name: customerDetails.name || null,
      customer_phone: customerDetails.phone || null,
      customer_email: customerDetails.email || null,
      customer_address: customerDetails.address || null,
      net_weight: 0,
      purity_fraction: formData.purityFraction,
      gold_rate_24k: formData.goldRate24k,
      making_charges: 0,
      cad_design_charges: 0,
      camming_charges: 0,
      certification_cost: 0,
      diamond_cost: 0,
      gemstone_cost: 0,
      gold_cost: costs.goldCost,
      total_cost: costs.totalCost,
      final_selling_price: costs.finalSellingPrice,
      profit_margin_percentage: profitMargin,
      notes,
      status: estimateStatus,
      estimated_completion_date: estimatedCompletionDate?.toISOString() || null,
      is_customer_visible: isCustomerVisible,
      share_token: shareToken || `EST-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      line_items: (lineItems.length > 0 ? lineItems : null) as any,
      details: {
        customer_gstin: customerDetails.gstin,
        vendor_gstin: vendorGSTIN,
        gst_mode: gstMode,
        sgst_percentage: sgstPercentage,
        cgst_percentage: cgstPercentage,
        igst_percentage: igstPercentage,
        shipping_charges: shippingCharges,
        shipping_zone: shippingZone,
        exchange_rate: exchangeRate
      }
    };

    let result;
    if (currentEstimateId) {
      result = await supabase
        .from('manufacturing_cost_estimates')
        .update(estimateData)
        .eq('id', currentEstimateId);
    } else {
      result = await supabase
        .from('manufacturing_cost_estimates')
        .insert(estimateData)
        .select()
        .single();
      
      if (result.data) {
        setCurrentEstimateId(result.data.id);
        setShareToken(result.data.share_token);
      }
    }

    if (result.error) {
      toast({
        title: "Error",
        description: "Failed to save estimate",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Saved",
        description: currentEstimateId ? "Estimate updated successfully" : "Estimate saved successfully"
      });
      fetchEstimates();
      setShowSaveDialog(false);
    }
  };
  const handleLoad = (estimate: any) => {
    const details = estimate.details as any;
    setFormData({
      purityFraction: estimate.purity_fraction || 0.76,
      goldRate24k: estimate.gold_rate_24k || 0
    });
    setProfitMargin(estimate.profit_margin_percentage || 0);
    setCurrentEstimateId(estimate.id);
    setEstimateName(estimate.estimate_name);
    setNotes(estimate.notes || "");
    setCustomerDetails({
      name: estimate.customer_name || "",
      phone: estimate.customer_phone || "",
      email: estimate.customer_email || "",
      address: estimate.customer_address || "",
      gstin: details?.customer_gstin || ""
    });
    setVendorGSTIN(details?.vendor_gstin || "");
    setGstMode(details?.gst_mode || 'sgst_cgst');
    setSgstPercentage(details?.sgst_percentage || 9);
    setCgstPercentage(details?.cgst_percentage || 9);
    setIgstPercentage(details?.igst_percentage || 18);
    setShippingCharges(details?.shipping_charges || 0);
    setShippingZone(details?.shipping_zone || 'local');
    setExchangeRate(details?.exchange_rate || 83);
    setLineItems(estimate.line_items || []);
    setEstimateStatus(estimate.status || "draft");
    setEstimatedCompletionDate(estimate.estimated_completion_date ? new Date(estimate.estimated_completion_date) : undefined);
    setIsCustomerVisible(estimate.is_customer_visible || false);
    setShareToken(estimate.share_token || "");
    setInvoiceNumber(estimate.invoice_number || "");
    setInvoiceDate(estimate.invoice_date ? new Date(estimate.invoice_date) : new Date());
    setPaymentTerms(estimate.payment_terms || "Net 30");
    setPaymentDueDate(estimate.payment_due_date ? new Date(estimate.payment_due_date) : undefined);
    setInvoiceNotes(estimate.invoice_notes || "");
    setShowLoadDialog(false);
    toast({
      title: "Loaded",
      description: `Estimate "${estimate.estimate_name}" loaded successfully`
    });
  };
  const handleDelete = async (id: string) => {
    const {
      error
    } = await supabase.from('manufacturing_cost_estimates').delete().eq('id', id);
    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete estimate",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Deleted",
        description: "Estimate deleted successfully"
      });
      fetchEstimates();
      if (currentEstimateId === id) {
        handleReset();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background py-4 md:py-8 px-3 md:px-4">
      {/* Guest Usage Limit Dialog */}
      <Dialog open={showUsageLimitDialog} onOpenChange={setShowUsageLimitDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Usage Limit Reached</DialogTitle>
            <DialogDescription className="text-sm">
              You've reached 5 uses in 24 hours. Sign in for unlimited access.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/auth')} className="flex-1" size="sm">
              Sign In
            </Button>
            <Button variant="outline" onClick={() => navigate('/')} className="flex-1" size="sm">
              Go Home
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BackToHomeButton />
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 md:space-y-4 px-4">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full mb-2 md:mb-4">
            <Calculator className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
            Cost Estimator
          </h1>
          <p className="text-muted-foreground text-sm md:text-base lg:text-lg max-w-2xl mx-auto">
            Professional jewelry estimation & invoicing
          </p>
          
          {/* Guest Usage Counter */}
          {!user && guestUsageCount > 0 && guestUsageCount < 5 && <div className="mt-3 md:mt-4 inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-muted/50 rounded-lg border border-border">
              <Info className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
              <p className="text-xs md:text-sm text-muted-foreground">
                Guest: {guestUsageCount}/5 uses.
                <Button variant="link" className="ml-1 p-0 h-auto text-xs md:text-sm underline" onClick={() => navigate('/auth')}>
                  Sign in
                </Button>
              </p>
            </div>}
        </div>

        {/* Workflow Steps Indicator */}
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <EstimateWorkflowSteps currentStep={currentStep} steps={steps} />
          </CardContent>
        </Card>

        {/* Flow Guide (Collapsible) */}
        <Collapsible open={showFlowGuide} onOpenChange={setShowFlowGuide}>
          <Card className="border-primary/20">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-5 w-5 text-primary" />
                      Understanding the Workflow
                    </CardTitle>
                    <CardDescription>
                      Learn the difference between estimates and invoices
                    </CardDescription>
                  </div>
                  <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${showFlowGuide ? 'rotate-180' : ''}`} />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <EstimateFlowGuide />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Action Buttons */}
        <ReviewSection
          onSave={() => setShowSaveDialog(true)}
          onLoad={() => setShowLoadDialog(true)}
          onExportPDF={handleExportPDF}
          onReset={handleReset}
          onViewHistory={() => navigate("/estimate-history")}
          onCreateInvoice={() => navigate("/invoice-generator")}
          isAuthenticated={!!user}
        />
        

        {/* Save Dialog */}
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Save Estimate</DialogTitle>
              <DialogDescription>
                Save this manufacturing cost estimate with customer details and tracking options
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="estimate-name">Estimate Name *</Label>
                <Input id="estimate-name" value={estimateName} onChange={e => setEstimateName(e.target.value)} placeholder="e.g., Diamond Ring Quote - John Doe" />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer-name">Customer Name</Label>
                    <Input id="customer-name" value={customerDetails.name} onChange={e => setCustomerDetails({
                    ...customerDetails,
                    name: e.target.value
                  })} placeholder="Full name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer-phone">Phone Number</Label>
                    <Input id="customer-phone" value={customerDetails.phone} onChange={e => setCustomerDetails({
                    ...customerDetails,
                    phone: e.target.value
                  })} placeholder="+1234567890" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer-email">Email</Label>
                    <Input id="customer-email" type="email" value={customerDetails.email} onChange={e => setCustomerDetails({
                    ...customerDetails,
                    email: e.target.value
                  })} placeholder="customer@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer-address">Address</Label>
                    <Input id="customer-address" value={customerDetails.address} onChange={e => setCustomerDetails({
                    ...customerDetails,
                    address: e.target.value
                  })} placeholder="Complete address" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add any additional notes or specifications..." rows={3} />
              </div>

              <div className="space-y-2">
                <Label>Order Status</Label>
                <Select value={estimateStatus} onValueChange={setEstimateStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="quoted">Quoted</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="in_production">In Production</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Estimated Completion Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />
                      {estimatedCompletionDate ? format(estimatedCompletionDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarPicker mode="single" selected={estimatedCompletionDate} onSelect={setEstimatedCompletionDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center justify-between space-x-2 border rounded-lg p-4">
                <div className="space-y-0.5">
                  <Label>Enable Customer Portal</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow customer to track order status with a secure link
                  </p>
                </div>
                <Switch checked={isCustomerVisible} onCheckedChange={setIsCustomerVisible} />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSave} className="flex-1">Save Estimate</Button>
                <Button onClick={() => setShowSaveDialog(false)} variant="outline" className="flex-1">Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Vendor and Customer Details Section */}
        <BasicInfoSection
          vendorProfile={vendorProfile}
          vendorGSTIN={vendorGSTIN}
          onVendorGSTINChange={setVendorGSTIN}
          customerDetails={customerDetails}
          onCustomerDetailsChange={setCustomerDetails}
        />

        {/* Invoice Line Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Invoice Line Items
            </CardTitle>
            <CardDescription>Add multiple jewelry items with individual pricing details</CardDescription>
          </CardHeader>
          <CardContent>
            <InvoiceLineItems items={lineItems} onChange={setLineItems} goldRate24k={formData.goldRate24k} purityFraction={formData.purityFraction} />
          </CardContent>
        </Card>

        {/* Profit Margin and Summary */}
        <PricingSection
          profitMargin={profitMargin}
          onProfitMarginChange={setProfitMargin}
          costs={costs}
          formData={{ diamondPerCaratPrice: 0, diamondWeight: 0, gemstonePerCaratPrice: 0, gemstoneWeight: 0, makingCharges: 0, cadDesignCharges: 0, cammingCharges: 0, certificationCost: 0 }}
        />

        {/* Tax, Shipping & Currency Section */}
        <CostingSection
          gstMode={gstMode}
          onGstModeChange={setGstMode}
          sgstPercentage={sgstPercentage}
          cgstPercentage={cgstPercentage}
          igstPercentage={igstPercentage}
          onSgstChange={setSgstPercentage}
          onCgstChange={setCgstPercentage}
          onIgstChange={setIgstPercentage}
          shippingCharges={shippingCharges}
          onShippingChargesChange={setShippingCharges}
          shippingZone={shippingZone}
          onShippingZoneChange={setShippingZone}
          exchangeRate={exchangeRate}
          onExchangeRateChange={setExchangeRate}
          costs={costs}
        />
      </div>

      <InvoicePreviewDialog open={showInvoicePreview} onOpenChange={setShowInvoicePreview} invoiceData={previewInvoiceData} onConfirmDownload={handleConfirmDownload} />
    </div>
  );
};

export default ManufacturingCost;