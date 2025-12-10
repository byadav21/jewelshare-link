import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { FileText, Calendar, Plus, History, Download, Sparkles, Diamond, Gem, Coins, AlertCircle } from "lucide-react";
import { generateInvoicePDF, type InvoiceData, type LineItem as InvoiceLineItem } from "@/utils/invoiceGenerator";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { InvoiceLineItems, type LineItem } from "@/components/InvoiceLineItems";
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
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [invoiceType, setInvoiceType] = useState<'tax' | 'export' | 'proforma'>('tax');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'partial'>('pending');
  const [estimateCategory, setEstimateCategory] = useState<'jewelry' | 'loose_diamond' | 'gemstone'>('jewelry');
  const [estimateName, setEstimateName] = useState("");
  
  // Customer details
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerGSTIN, setCustomerGSTIN] = useState("");
  const [vendorGSTIN, setVendorGSTIN] = useState("");
  
  // Line items (the primary data source)
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  
  // Pricing
  const [profitMargin, setProfitMargin] = useState(0);
  const [goldRate24k, setGoldRate24k] = useState(0);
  const [platinumRate, setPlatinumRate] = useState(3200);
  const [silverRate, setSilverRate] = useState(95);
  const [purityFraction, setPurityFraction] = useState(0.76);
  
  // GST & Shipping
  const [gstMode, setGstMode] = useState<'sgst_cgst' | 'igst' | 'none'>('sgst_cgst');
  const [sgstPercentage, setSgstPercentage] = useState(1.5);
  const [cgstPercentage, setCgstPercentage] = useState(1.5);
  const [igstPercentage, setIgstPercentage] = useState(3);
  const [shippingCharges, setShippingCharges] = useState(0);
  const [shippingZone, setShippingZone] = useState('local');
  const [exchangeRate, setExchangeRate] = useState(83);

  // Calculated values
  const [costs, setCosts] = useState({
    totalCost: 0,
    finalSellingPrice: 0,
    sgstAmount: 0,
    cgstAmount: 0,
    igstAmount: 0,
    grandTotal: 0,
    totalInUSD: 0
  });

  // Calculate costs from line items
  useEffect(() => {
    const lineItemsTotal = lineItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    const totalCost = lineItemsTotal;
    const finalSellingPrice = totalCost * (1 + profitMargin / 100);

    let sgstAmount = 0;
    let cgstAmount = 0;
    let igstAmount = 0;
    
    if (gstMode === 'sgst_cgst') {
      sgstAmount = finalSellingPrice * sgstPercentage / 100;
      cgstAmount = finalSellingPrice * cgstPercentage / 100;
    } else if (gstMode === 'igst') {
      igstAmount = finalSellingPrice * igstPercentage / 100;
    }

    const grandTotal = finalSellingPrice + sgstAmount + cgstAmount + igstAmount + shippingCharges;
    const totalInUSD = grandTotal / exchangeRate;

    setCosts({
      totalCost: parseFloat(totalCost.toFixed(2)),
      finalSellingPrice: parseFloat(finalSellingPrice.toFixed(2)),
      sgstAmount: parseFloat(sgstAmount.toFixed(2)),
      cgstAmount: parseFloat(cgstAmount.toFixed(2)),
      igstAmount: parseFloat(igstAmount.toFixed(2)),
      grandTotal: parseFloat(grandTotal.toFixed(2)),
      totalInUSD: parseFloat(totalInUSD.toFixed(2))
    });
  }, [lineItems, profitMargin, gstMode, sgstPercentage, cgstPercentage, igstPercentage, shippingCharges, exchangeRate]);

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

    if (!error && data) {
      setVendorProfile(data);
      setGoldRate24k(data.gold_rate_24k_per_gram || 0);
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

    if (!error) {
      setEstimates(data || []);
    }
  };

  const generateNextInvoiceNumber = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("manufacturing_cost_estimates")
        .select("invoice_number")
        .eq("user_id", user.id)
        .not("invoice_number", "is", null)
        .order("created_at", { ascending: false })
        .limit(1);

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
        toast.success("Estimate loaded - ready to generate invoice");
      }
    } catch (error) {
      console.error('Error loading estimate:', error);
      toast.error('Failed to load estimate');
    }
  };

  const loadFromEstimate = (estimate: any) => {
    // Set basic info
    setEstimateName(estimate.estimate_name);
    setEstimateCategory(estimate.estimate_category || 'jewelry');
    setCustomerName(estimate.customer_name || "");
    setCustomerPhone(estimate.customer_phone || "");
    setCustomerEmail(estimate.customer_email || "");
    setCustomerAddress(estimate.customer_address || "");
    setProfitMargin(estimate.profit_margin_percentage || 0);
    setPurityFraction(estimate.purity_fraction || 0.76);
    
    if (estimate.gold_rate_24k) {
      setGoldRate24k(estimate.gold_rate_24k);
    }

    // Parse line items - handle both old and new format
    const lineItemsData = estimate.line_items;
    let items: LineItem[] = [];
    let meta: any = {};
    
    if (Array.isArray(lineItemsData)) {
      items = lineItemsData;
    } else if (lineItemsData?.items) {
      items = lineItemsData.items;
      meta = lineItemsData.meta || {};
    }
    
    // Set line items
    setLineItems(items);
    
    // Load GST and shipping settings from meta
    if (meta.customer_gstin) setCustomerGSTIN(meta.customer_gstin);
    if (meta.vendor_gstin) setVendorGSTIN(meta.vendor_gstin);
    if (meta.gst_mode) setGstMode(meta.gst_mode);
    if (meta.sgst_percentage) setSgstPercentage(meta.sgst_percentage);
    if (meta.cgst_percentage) setCgstPercentage(meta.cgst_percentage);
    if (meta.igst_percentage) setIgstPercentage(meta.igst_percentage);
    if (meta.shipping_charges) setShippingCharges(meta.shipping_charges);
    if (meta.shipping_zone) setShippingZone(meta.shipping_zone);
    if (meta.exchange_rate) setExchangeRate(meta.exchange_rate);
    
    // Load existing invoice settings if present
    if (estimate.invoice_number) setInvoiceNumber(estimate.invoice_number);
    if (estimate.invoice_notes) setInvoiceNotes(estimate.invoice_notes);
    if (estimate.payment_terms) setPaymentTerms(estimate.payment_terms);
    if (estimate.payment_due_date) setPaymentDueDate(new Date(estimate.payment_due_date));
    
    setShowEstimateDialog(false);
  };

  const getCategoryIcon = () => {
    switch (estimateCategory) {
      case 'loose_diamond': return <Diamond className="h-5 w-5" />;
      case 'gemstone': return <Gem className="h-5 w-5" />;
      default: return <Coins className="h-5 w-5" />;
    }
  };

  const getCategoryLabel = () => {
    switch (estimateCategory) {
      case 'loose_diamond': return 'Loose Diamond Invoice';
      case 'gemstone': return 'Gemstone Invoice';
      default: return 'Jewelry Invoice';
    }
  };

  const handleGenerateInvoice = async () => {
    if (!estimateName) {
      toast.error("Please enter an order/estimate name");
      return;
    }

    if (!customerName) {
      toast.error("Please enter customer name");
      return;
    }

    if (lineItems.length === 0) {
      toast.error("Please add at least one line item");
      return;
    }

    let finalInvoiceNumber = invoiceNumber;
    if (!finalInvoiceNumber) {
      finalInvoiceNumber = await generateNextInvoiceNumber() || "";
    }

    // Build vendor address
    const addressParts = [
      vendorProfile?.address_line1,
      vendorProfile?.address_line2,
      vendorProfile?.city,
      vendorProfile?.state,
      vendorProfile?.pincode,
      vendorProfile?.country,
    ].filter(Boolean);
    const vendorAddress = addressParts.length > 0 ? addressParts.join(', ') : undefined;

    // Prepare invoice data with line items
    const invoiceData: InvoiceData = {
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
      customerGSTIN,
      vendorGSTIN,
      // Line items are the primary data source
      lineItems: lineItems as InvoiceLineItem[],
      estimateCategory,
      // Calculated totals
      netWeight: 0,
      grossWeight: 0,
      purityFraction,
      goldRate24k,
      makingCharges: 0,
      cadDesignCharges: 0,
      cammingCharges: 0,
      certificationCost: 0,
      diamondCost: 0,
      gemstoneCost: 0,
      goldCost: 0,
      totalCost: costs.totalCost,
      profitMargin,
      finalSellingPrice: costs.finalSellingPrice,
      // GST
      gstMode: gstMode === 'none' ? undefined : gstMode,
      sgstPercentage,
      cgstPercentage,
      igstPercentage,
      sgstAmount: costs.sgstAmount,
      cgstAmount: costs.cgstAmount,
      igstAmount: costs.igstAmount,
      shippingCharges,
      shippingZone,
      exchangeRate,
      grandTotal: costs.grandTotal,
      invoiceNotes,
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
    };

    // Generate PDF - the generator auto-selects template based on estimateCategory
    await generateInvoicePDF(invoiceData);

    // Save to database
    try {
      const estimateId = searchParams.get('estimate');
      
      if (estimateId) {
        await supabase
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
      } else {
        // Create new invoice record with line items
        const lineItemsWithMeta = {
          items: lineItems,
          meta: {
            customer_gstin: customerGSTIN,
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

        await supabase
          .from('manufacturing_cost_estimates')
          .insert({
            user_id: user.id,
            estimate_name: estimateName,
            estimate_category: estimateCategory,
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
            purity_fraction: purityFraction,
            gold_rate_24k: goldRate24k,
            total_cost: costs.totalCost,
            profit_margin_percentage: profitMargin,
            final_selling_price: costs.grandTotal,
            line_items: lineItemsWithMeta as any,
            status: 'completed',
          });
      }
      
      toast.success("Invoice generated and saved");
    } catch (error: any) {
      console.error("Error saving invoice:", error);
      toast.error("Invoice generated but failed to save");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <BackToHomeButton />

        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <FileText className="h-10 w-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Invoice Generator
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Create professional invoices with automatic category-based formatting
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <Button onClick={() => setShowEstimateDialog(true)} variant="default" className="bg-gradient-to-r from-primary to-accent">
            <Sparkles className="mr-2 h-4 w-4" />
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
        </div>

        {/* Category Selection Card */}
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              {getCategoryIcon()}
              Invoice Category
            </CardTitle>
            <CardDescription>
              Select the category to automatically format the invoice correctly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant={estimateCategory === 'jewelry' ? 'default' : 'outline'}
                onClick={() => setEstimateCategory('jewelry')}
                className="flex flex-col h-auto py-4 gap-2"
              >
                <Coins className="h-6 w-6" />
                <span>Jewelry</span>
              </Button>
              <Button
                variant={estimateCategory === 'loose_diamond' ? 'default' : 'outline'}
                onClick={() => setEstimateCategory('loose_diamond')}
                className="flex flex-col h-auto py-4 gap-2"
              >
                <Diamond className="h-6 w-6" />
                <span>Loose Diamond</span>
              </Button>
              <Button
                variant={estimateCategory === 'gemstone' ? 'default' : 'outline'}
                onClick={() => setEstimateCategory('gemstone')}
                className="flex flex-col h-auto py-4 gap-2"
              >
                <Gem className="h-6 w-6" />
                <span>Gemstone</span>
              </Button>
            </div>
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>{getCategoryLabel()}</strong> - The invoice PDF will be formatted specifically for {estimateCategory === 'jewelry' ? 'jewelry with gold, diamonds, and gemstones' : estimateCategory === 'loose_diamond' ? 'loose diamonds with 4Cs specifications' : 'colored gemstones with origin and treatment details'}.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

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

              <div className="grid grid-cols-2 gap-4">
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
              <div className="grid grid-cols-2 gap-4">
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
              </div>
              <div>
                <Label>Customer GSTIN</Label>
                <Input
                  value={customerGSTIN}
                  onChange={(e) => setCustomerGSTIN(e.target.value)}
                  placeholder="e.g., 22AAAAA0000A1Z5"
                />
              </div>
              <div>
                <Label>Address</Label>
                <Textarea
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Complete address"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Line Items - The primary data entry */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getCategoryIcon()}
              {getCategoryLabel()} - Line Items
            </CardTitle>
            <CardDescription>
              Add items with {estimateCategory === 'jewelry' ? 'gold, diamond, and gemstone details' : estimateCategory === 'loose_diamond' ? 'diamond specifications (4Cs)' : 'gemstone specifications'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InvoiceLineItems 
              items={lineItems} 
              onChange={setLineItems} 
              goldRate24k={goldRate24k}
              platinumRate={platinumRate}
              silverRate={silverRate}
              purityFraction={purityFraction}
              estimateCategory={estimateCategory}
            />
          </CardContent>
        </Card>

        {/* Pricing & Tax */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {estimateCategory === 'jewelry' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Gold Rate (24K/gram)</Label>
                      <Input
                        type="number"
                        value={goldRate24k}
                        onChange={(e) => setGoldRate24k(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Default Purity</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={purityFraction}
                        onChange={(e) => setPurityFraction(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Platinum Rate (/gram)</Label>
                      <Input
                        type="number"
                        value={platinumRate}
                        onChange={(e) => setPlatinumRate(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Silver Rate (/gram)</Label>
                      <Input
                        type="number"
                        value={silverRate}
                        onChange={(e) => setSilverRate(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div>
                <Label>Profit Margin (%)</Label>
                <Input
                  type="number"
                  value={profitMargin}
                  onChange={(e) => setProfitMargin(Number(e.target.value))}
                />
              </div>
              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>₹{costs.totalCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>After Margin ({profitMargin}%):</span>
                  <span>₹{costs.finalSellingPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tax & Shipping</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>GST Mode</Label>
                <Select value={gstMode} onValueChange={(v: any) => setGstMode(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sgst_cgst">SGST + CGST (Intra-state)</SelectItem>
                    <SelectItem value="igst">IGST (Inter-state)</SelectItem>
                    <SelectItem value="none">No GST</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {gstMode === 'sgst_cgst' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>SGST (%)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={sgstPercentage}
                      onChange={(e) => setSgstPercentage(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>CGST (%)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={cgstPercentage}
                      onChange={(e) => setCgstPercentage(Number(e.target.value))}
                    />
                  </div>
                </div>
              )}
              
              {gstMode === 'igst' && (
                <div>
                  <Label>IGST (%)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={igstPercentage}
                    onChange={(e) => setIgstPercentage(Number(e.target.value))}
                  />
                </div>
              )}

              <div>
                <Label>Shipping Charges (₹)</Label>
                <Input
                  type="number"
                  value={shippingCharges}
                  onChange={(e) => setShippingCharges(Number(e.target.value))}
                />
              </div>

              <div className="pt-4 border-t space-y-2">
                {gstMode === 'sgst_cgst' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>SGST ({sgstPercentage}%):</span>
                      <span>₹{costs.sgstAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>CGST ({cgstPercentage}%):</span>
                      <span>₹{costs.cgstAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </>
                )}
                {gstMode === 'igst' && (
                  <div className="flex justify-between text-sm">
                    <span>IGST ({igstPercentage}%):</span>
                    <span>₹{costs.igstAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Shipping:</span>
                  <span>₹{shippingCharges.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Grand Total:</span>
                  <span className="text-primary">₹{costs.grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={invoiceNotes}
              onChange={(e) => setInvoiceNotes(e.target.value)}
              placeholder="Payment instructions, terms & conditions, bank details..."
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Generate Button */}
        <div className="flex justify-center gap-4">
          <Button 
            onClick={handleGenerateInvoice} 
            size="lg" 
            className="bg-gradient-to-r from-primary to-accent"
            disabled={lineItems.length === 0}
          >
            <Download className="mr-2 h-5 w-5" />
            Generate {getCategoryLabel()} PDF
          </Button>
        </div>

        {/* Load Estimate Dialog */}
        <Dialog open={showEstimateDialog} onOpenChange={setShowEstimateDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Load from Saved Estimate</DialogTitle>
              <DialogDescription>
                Select an estimate to pre-fill all invoice details including line items
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              {estimates.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No saved estimates found. Create estimates in the Cost Estimator first.
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
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {estimate.estimate_category === 'loose_diamond' ? (
                              <Diamond className="h-5 w-5 text-primary" />
                            ) : estimate.estimate_category === 'gemstone' ? (
                              <Gem className="h-5 w-5 text-primary" />
                            ) : (
                              <Coins className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold">{estimate.estimate_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {estimate.customer_name || "No customer"} • {estimate.estimate_category || 'jewelry'}
                            </p>
                            <p className="text-sm font-semibold text-primary mt-1">
                              ₹{(estimate.final_selling_price || 0).toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {new Date(estimate.created_at).toLocaleDateString()}
                          </p>
                          {estimate.is_invoice_generated && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded mt-1 inline-block">
                              Invoiced
                            </span>
                          )}
                        </div>
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
