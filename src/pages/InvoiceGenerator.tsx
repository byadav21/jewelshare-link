import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { FileText, Calendar, Plus, History, Download, Sparkles } from "lucide-react";
import { generateInvoicePDF } from "@/utils/invoiceGenerator";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { format } from "date-fns";

const InvoiceGenerator = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [vendorProfile, setVendorProfile] = useState<any>(null);
  const [estimates, setEstimates] = useState<any[]>([]);
  const [showEstimateDialog, setShowEstimateDialog] = useState(false);
  
  // Invoice fields
  const [invoicePrefix, setInvoicePrefix] = useState("INV");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState<Date>(new Date());
  const [paymentTerms, setPaymentTerms] = useState("Net 30");
  const [paymentDueDate, setPaymentDueDate] = useState<Date>();
  const [invoiceNotes, setInvoiceNotes] = useState("");
  const [invoiceTemplate, setInvoiceTemplate] = useState<'detailed' | 'summary' | 'minimal' | 'traditional' | 'modern' | 'luxury' | 'loose_diamond' | 'gemstone'>('detailed');
  const [invoiceType, setInvoiceType] = useState<'tax' | 'export' | 'proforma'>('tax');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'partial'>('pending');
  const [estimateCategory, setEstimateCategory] = useState<'jewelry' | 'loose_diamond' | 'gemstone'>('jewelry');
  const [estimateName, setEstimateName] = useState("");
  
  // Customer details
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  
  // Cost breakdown
  const [netWeight, setNetWeight] = useState(0);
  const [grossWeight, setGrossWeight] = useState(0);
  const [purityFraction, setPurityFraction] = useState(0.76);
  const [goldRate24k, setGoldRate24k] = useState(0);
  const [makingCharges, setMakingCharges] = useState(0);
  const [cadDesignCharges, setCadDesignCharges] = useState(0);
  const [cammingCharges, setCammingCharges] = useState(0);
  const [certificationCost, setCertificationCost] = useState(0);
  const [diamondCost, setDiamondCost] = useState(0);
  const [gemstoneCost, setGemstoneCost] = useState(0);
  const [goldCost, setGoldCost] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [profitMargin, setProfitMargin] = useState(0);
  const [finalSellingPrice, setFinalSellingPrice] = useState(0);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to generate invoices");
      navigate("/auth");
      return;
    }
    setUser(user);
    await fetchVendorProfile();
    await fetchEstimates();
    
    // Check if we should auto-load an estimate
    const estimateId = searchParams.get('estimate');
    if (estimateId) {
      await loadEstimateById(estimateId);
    }
  };

  const fetchVendorProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('vendor_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching vendor profile:', error);
    } else {
      setVendorProfile(data);
    }
  };

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

  const generateNextInvoiceNumber = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("manufacturing_cost_estimates")
        .select("invoice_number")
        .eq("user_id", user.id)
        .not("invoice_number", "is", null)
        .order("created_at", { ascending: false })
        .limit(1);

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

  const loadEstimateById = async (estimateId: string) => {
    try {
      const { data, error } = await supabase
        .from('manufacturing_cost_estimates')
        .select('*')
        .eq('id', estimateId)
        .single();

      if (error) throw error;

      if (data) {
        loadFromEstimate(data);
        await generateNextInvoiceNumber();
        toast.success("Estimate loaded and ready to convert to invoice");
      }
    } catch (error) {
      console.error('Error loading estimate:', error);
      toast.error('Failed to load estimate');
    }
  };

  const loadFromEstimate = (estimate: any) => {
    setEstimateName(estimate.estimate_name);
    setEstimateCategory(estimate.estimate_category || 'jewelry');
    setCustomerName(estimate.customer_name || "");
    setCustomerPhone(estimate.customer_phone || "");
    setCustomerEmail(estimate.customer_email || "");
    setCustomerAddress(estimate.customer_address || "");
    setNetWeight(estimate.net_weight || 0);
    setGrossWeight(estimate.details?.gross_weight || estimate.net_weight || 0);
    setPurityFraction(estimate.purity_fraction || 0.76);
    setGoldRate24k(estimate.gold_rate_24k || 0);
    setMakingCharges(estimate.making_charges || 0);
    setCadDesignCharges(estimate.cad_design_charges || 0);
    setCammingCharges(estimate.camming_charges || 0);
    setCertificationCost(estimate.certification_cost || 0);
    setDiamondCost(estimate.diamond_cost || 0);
    setGemstoneCost(estimate.gemstone_cost || 0);
    setGoldCost(estimate.gold_cost || 0);
    setTotalCost(estimate.total_cost || 0);
    setProfitMargin(estimate.profit_margin_percentage || 0);
    setFinalSellingPrice(estimate.final_selling_price || 0);
    
    // Auto-select appropriate template based on category
    if (estimate.estimate_category === 'loose_diamond') {
      setInvoiceTemplate('loose_diamond');
    } else if (estimate.estimate_category === 'gemstone') {
      setInvoiceTemplate('gemstone');
    }
    
    if (estimate.invoice_number) {
      setInvoiceNumber(estimate.invoice_number);
    }
    
    setShowEstimateDialog(false);
  };

  const loadJewelryTemplate = () => {
    if (!vendorProfile) {
      toast.error("Please complete your vendor profile first");
      return;
    }

    // Auto-populate from vendor profile
    setGoldRate24k(vendorProfile.gold_rate_24k_per_gram || 0);
    setMakingCharges(vendorProfile.making_charges_per_gram || 0);
    
    // Generate next invoice number automatically
    generateNextInvoiceNumber();
    
    toast.success("Jewelry template loaded with your profile data");
  };

  const loadSampleData = async () => {
    setEstimateName("Diamond Engagement Ring Order");
    setCustomerName("Priya Sharma");
    setCustomerPhone("+91 98765 43210");
    setCustomerEmail("priya.sharma@example.com");
    setCustomerAddress("123 MG Road, Bangalore, Karnataka 560001, India");
    
    setNetWeight(8.5);
    setGrossWeight(10.2);
    setPurityFraction(0.76);
    setGoldRate24k(6500);
    setMakingCharges(15300);
    setCadDesignCharges(5000);
    setCammingCharges(2000);
    setCertificationCost(3000);
    setDiamondCost(125000);
    setGemstoneCost(8000);
    
    const goldCostCalc = 8.5 * 0.76 * 6500;
    setGoldCost(goldCostCalc);
    
    const totalCostCalc = goldCostCalc + 15300 + 5000 + 2000 + 3000 + 125000 + 8000;
    setTotalCost(totalCostCalc);
    
    setProfitMargin(20);
    const sellingPriceCalc = totalCostCalc * 1.2;
    setFinalSellingPrice(sellingPriceCalc);
    
    setInvoiceNotes("Payment accepted via bank transfer or UPI. 50% advance required before production. Remaining 50% due upon completion.");
    setPaymentTerms("Net 30");
    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    setPaymentDueDate(dueDate);
    
    await generateNextInvoiceNumber();
    
    toast.success("Sample data loaded successfully!");
  };

  const handleGenerateInvoice = async () => {
    if (!estimateName) {
      toast.error("Please enter an estimate/order name");
      return;
    }

    if (!customerName) {
      toast.error("Please enter customer name");
      return;
    }

    let finalInvoiceNumber = invoiceNumber;
    if (!finalInvoiceNumber) {
      finalInvoiceNumber = await generateNextInvoiceNumber() || "";
    }

    const addressParts = [
      vendorProfile?.address_line1,
      vendorProfile?.address_line2,
      vendorProfile?.city,
      vendorProfile?.state,
      vendorProfile?.pincode,
      vendorProfile?.country,
    ].filter(Boolean);
    const vendorAddress = addressParts.length > 0 ? addressParts.join(', ') : undefined;

    generateInvoicePDF({
      invoiceNumber: finalInvoiceNumber,
      invoiceDate: invoiceDate.toISOString(),
      paymentDueDate: paymentDueDate?.toISOString(),
      paymentTerms,
      estimateName,
      status: paymentStatus,
      invoiceType,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      netWeight,
      grossWeight,
      purityFraction,
      goldRate24k,
      makingCharges,
      cadDesignCharges,
      cammingCharges,
      certificationCost,
      diamondCost,
      gemstoneCost,
      goldCost,
      totalCost,
      profitMargin,
      finalSellingPrice,
      invoiceNotes,
      template: invoiceTemplate,
      estimateCategory,
      vendorBranding: vendorProfile ? {
        name: vendorProfile.business_name,
        logo: vendorProfile.logo_url,
        primaryColor: vendorProfile.primary_brand_color,
        secondaryColor: vendorProfile.secondary_brand_color,
        tagline: vendorProfile.brand_tagline,
        email: vendorProfile.email,
        phone: vendorProfile.phone,
        address: vendorAddress,
      } : undefined,
    });

    // Save to database or update existing estimate
    try {
      const estimateId = searchParams.get('estimate');
      
      if (estimateId) {
        // Update existing estimate to mark it as having an invoice generated
        const { error } = await supabase
          .from('manufacturing_cost_estimates')
          .update({
            invoice_number: finalInvoiceNumber,
            invoice_date: invoiceDate.toISOString(),
            payment_terms: paymentTerms,
            payment_due_date: paymentDueDate?.toISOString(),
            invoice_notes: invoiceNotes,
            is_invoice_generated: true,
            invoice_status: paymentStatus,
          })
          .eq('id', estimateId);

        if (error) throw error;
      } else {
        // Create new invoice record
        const { error } = await supabase
          .from('manufacturing_cost_estimates')
          .insert({
            user_id: user.id,
            estimate_name: estimateName,
            invoice_number: finalInvoiceNumber,
            invoice_date: invoiceDate.toISOString(),
            payment_terms: paymentTerms,
            payment_due_date: paymentDueDate?.toISOString(),
            invoice_notes: invoiceNotes,
            is_invoice_generated: true,
            invoice_status: paymentStatus,
            customer_name: customerName,
            customer_phone: customerPhone,
            customer_email: customerEmail,
            customer_address: customerAddress,
            net_weight: netWeight,
            purity_fraction: purityFraction,
            gold_rate_24k: goldRate24k,
            making_charges: makingCharges,
            cad_design_charges: cadDesignCharges,
            camming_charges: cammingCharges,
            certification_cost: certificationCost,
            diamond_cost: diamondCost,
            gemstone_cost: gemstoneCost,
            gold_cost: goldCost,
            total_cost: totalCost,
            profit_margin_percentage: profitMargin,
            final_selling_price: finalSellingPrice,
            status: 'draft',
          });

        if (error) throw error;
      }
      
      toast.success("Invoice generated and saved successfully");
    } catch (error: any) {
      console.error("Error saving invoice:", error);
      toast.error("Invoice generated but failed to save to database");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <BackToHomeButton />

        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <FileText className="h-10 w-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Invoice Generator
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Create professional invoices with your branding
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <Button onClick={loadJewelryTemplate} variant="default" className="bg-gradient-to-r from-primary to-accent">
            <Sparkles className="mr-2 h-4 w-4" />
            Use Jewelry Template
          </Button>
          <Button onClick={loadSampleData} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Load Sample Data
          </Button>
          <Button onClick={() => setShowEstimateDialog(true)} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Load from Estimate
          </Button>
          <Button onClick={generateNextInvoiceNumber} variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Auto-Generate Invoice #
          </Button>
          <Button onClick={() => navigate("/invoice-history")} variant="outline">
            <History className="mr-2 h-4 w-4" />
            View History
          </Button>
          <Button onClick={() => navigate("/invoice-templates")} variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Manage Templates
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Invoice Prefix</Label>
                  <Input
                    value={invoicePrefix}
                    onChange={(e) => setInvoicePrefix(e.target.value.toUpperCase())}
                    placeholder="INV"
                  />
                </div>
                <div>
                  <Label>Invoice Number</Label>
                  <Input
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="Auto-generated"
                  />
                </div>
              </div>

              <div>
                <Label>Order/Estimate Name *</Label>
                <Input
                  value={estimateName}
                  onChange={(e) => setEstimateName(e.target.value)}
                  placeholder="e.g., Diamond Ring Order"
                />
              </div>

              <div>
                <Label>Invoice Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="mr-2 h-4 w-4" />
                      {format(invoiceDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarPicker
                      mode="single"
                      selected={invoiceDate}
                      onSelect={(date) => date && setInvoiceDate(date)}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Payment Terms</Label>
                <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                    <SelectItem value="Net 15">Net 15</SelectItem>
                    <SelectItem value="Net 30">Net 30</SelectItem>
                    <SelectItem value="Net 45">Net 45</SelectItem>
                    <SelectItem value="Net 60">Net 60</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Payment Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="mr-2 h-4 w-4" />
                      {paymentDueDate ? format(paymentDueDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarPicker
                      mode="single"
                      selected={paymentDueDate}
                      onSelect={setPaymentDueDate}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Invoice Template</Label>
                <Select value={invoiceTemplate} onValueChange={(value: any) => setInvoiceTemplate(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="detailed">Detailed - Comprehensive Breakdown</SelectItem>
                    <SelectItem value="summary">Summary - Quick Overview</SelectItem>
                    <SelectItem value="minimal">Minimal - Essential Only</SelectItem>
                    <SelectItem value="traditional">Traditional - Classic Serif Style</SelectItem>
                    <SelectItem value="modern">Modern - Clean Minimalist</SelectItem>
                    <SelectItem value="luxury">Luxury - Premium Elegant</SelectItem>
                    <SelectItem value="loose_diamond">Loose Diamond - Diamond Specialist</SelectItem>
                    <SelectItem value="gemstone">Gemstone - Colored Stone Invoice</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Invoice Type</Label>
                <Select value={invoiceType} onValueChange={(value: any) => setInvoiceType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tax">Tax Invoice</SelectItem>
                    <SelectItem value="export">Export Invoice</SelectItem>
                    <SelectItem value="proforma">Proforma Invoice</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Payment Status</Label>
                <Select value={paymentStatus} onValueChange={(value: any) => setPaymentStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="partial">Partial Payment</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Invoice Notes</Label>
                <Textarea
                  value={invoiceNotes}
                  onChange={(e) => setInvoiceNotes(e.target.value)}
                  placeholder="Payment instructions..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Customer Details */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Customer Name *</Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Full name"
                />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+1234567890"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="customer@example.com"
                />
              </div>
              <div>
                <Label>Address</Label>
                <Textarea
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Complete address"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Cost Breakdown */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label>Gold Cost (₹)</Label>
                  <Input
                    type="number"
                    value={goldCost}
                    onChange={(e) => setGoldCost(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Making Charges (₹)</Label>
                  <Input
                    type="number"
                    value={makingCharges}
                    onChange={(e) => setMakingCharges(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Diamond Cost (₹)</Label>
                  <Input
                    type="number"
                    value={diamondCost}
                    onChange={(e) => setDiamondCost(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Gemstone Cost (₹)</Label>
                  <Input
                    type="number"
                    value={gemstoneCost}
                    onChange={(e) => setGemstoneCost(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>CAD Design (₹)</Label>
                  <Input
                    type="number"
                    value={cadDesignCharges}
                    onChange={(e) => setCadDesignCharges(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Certification (₹)</Label>
                  <Input
                    type="number"
                    value={certificationCost}
                    onChange={(e) => setCertificationCost(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Total Amount (₹)</Label>
                  <Input
                    type="number"
                    value={finalSellingPrice}
                    onChange={(e) => setFinalSellingPrice(Number(e.target.value))}
                    className="font-bold"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center gap-4">
          <Button onClick={handleGenerateInvoice} size="lg">
            <Download className="mr-2 h-5 w-5" />
            Generate Invoice PDF
          </Button>
        </div>

        {/* Load Estimate Dialog */}
        <Dialog open={showEstimateDialog} onOpenChange={setShowEstimateDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Load from Saved Estimate</DialogTitle>
              <DialogDescription>
                Select an estimate to pre-fill invoice details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              {estimates.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No saved estimates found
                </p>
              ) : (
                estimates.map((estimate) => (
                  <Card
                    key={estimate.id}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => loadFromEstimate(estimate)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{estimate.estimate_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {estimate.customer_name || "No customer"}
                          </p>
                          <p className="text-sm font-semibold text-primary mt-1">
                            ₹{estimate.final_selling_price?.toFixed(2)}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(estimate.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default InvoiceGenerator;
