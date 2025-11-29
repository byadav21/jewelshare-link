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
import { JewelrySpecsSection } from "@/components/estimate/JewelrySpecsSection";
import { CostingSection } from "@/components/estimate/CostingSection";
import { PricingSection } from "@/components/estimate/PricingSection";
import { ReviewSection } from "@/components/estimate/ReviewSection";
import { ReferenceImagesSection } from "@/components/estimate/ReferenceImagesSection";
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
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customCertification, setCustomCertification] = useState("");
  const [weightEntryMode, setWeightEntryMode] = useState<"gross" | "net">("gross");
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
    grossWeight: 0,
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
    diamondCertification: "none",
    gemstonePerCaratPrice: 0,
    gemstoneWeight: 0
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
  const [gstMode, setGstMode] = useState<'sgst_cgst' | 'igst'>('sgst_cgst');
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

  // Calculate net weight automatically (only in gross weight mode)
  useEffect(() => {
    if (weightEntryMode === "gross") {
      const diamondWeightGrams = formData.diamondWeight / 5;
      const gemstoneWeightGrams = formData.gemstoneWeight / 5;
      const calculatedNetWeight = formData.grossWeight - diamondWeightGrams - gemstoneWeightGrams;
      setFormData(prev => ({
        ...prev,
        netWeight: Math.max(0, calculatedNetWeight)
      }));
    }
  }, [weightEntryMode, formData.grossWeight, formData.diamondWeight, formData.gemstoneWeight]);

  // Calculate costs
  useEffect(() => {
    const goldCost = formData.netWeight * formData.purityFraction * formData.goldRate24k;
    const diamondCost = formData.diamondPerCaratPrice * formData.diamondWeight;
    const gemstoneCost = formData.gemstonePerCaratPrice * formData.gemstoneWeight;
    const totalCost = goldCost + formData.makingCharges + formData.cadDesignCharges + formData.cammingCharges + formData.certificationCost + diamondCost + gemstoneCost;
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
      goldCost: parseFloat(goldCost.toFixed(2)),
      totalCost: parseFloat(totalCost.toFixed(2)),
      finalSellingPrice: parseFloat(finalSellingPrice.toFixed(2)),
      profitAmount: parseFloat(profitAmount.toFixed(2)),
      sgstAmount: parseFloat(sgstAmount.toFixed(2)),
      cgstAmount: parseFloat(cgstAmount.toFixed(2)),
      igstAmount: parseFloat(igstAmount.toFixed(2)),
      grandTotal: parseFloat(grandTotal.toFixed(2)),
      totalInUSD: parseFloat(totalInUSD.toFixed(2))
    });
  }, [formData, profitMargin, gstMode, sgstPercentage, cgstPercentage, igstPercentage, shippingCharges, exchangeRate]);
  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };
  const handleReset = () => {
    setFormData({
      grossWeight: 0,
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
      diamondCertification: "none",
      gemstonePerCaratPrice: 0,
      gemstoneWeight: 0
    });
    setProfitMargin(0);
    setCurrentEstimateId(null);
    setEstimateName("");
    setNotes("");
    setReferenceImages([]);
    setCustomCertification("");
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
  const handleGenerateInvoice = async () => {
    if (!estimateName) {
      toast({
        title: "Missing Information",
        description: "Please enter estimate name before generating invoice",
        variant: "destructive"
      });
      return;
    }
    let finalInvoiceNumber = invoiceNumber;
    if (!finalInvoiceNumber) {
      finalInvoiceNumber = (await generateNextInvoiceNumber()) || "";
    }
    const details = formData;
    const diamondCost = formData.diamondPerCaratPrice * formData.diamondWeight;
    const gemstoneCost = formData.gemstonePerCaratPrice * formData.gemstoneWeight;

    // Build vendor address string
    const addressParts = [vendorProfile?.address_line1, vendorProfile?.address_line2, vendorProfile?.city, vendorProfile?.state, vendorProfile?.pincode, vendorProfile?.country].filter(Boolean);
    const vendorAddress = addressParts.length > 0 ? addressParts.join(', ') : undefined;
    generateInvoicePDF({
      invoiceNumber: finalInvoiceNumber,
      invoiceDate: invoiceDate.toISOString(),
      paymentDueDate: paymentDueDate?.toISOString(),
      paymentTerms,
      estimateName,
      status: estimateStatus,
      customerName: customerDetails.name,
      customerPhone: customerDetails.phone,
      customerEmail: customerDetails.email,
      customerAddress: customerDetails.address,
      customerGSTIN: customerDetails.gstin,
      vendorGSTIN: vendorGSTIN,
      netWeight: formData.netWeight,
      grossWeight: formData.grossWeight,
      purityFraction: formData.purityFraction,
      goldRate24k: formData.goldRate24k,
      makingCharges: formData.makingCharges,
      cadDesignCharges: formData.cadDesignCharges,
      cammingCharges: formData.cammingCharges,
      certificationCost: formData.certificationCost,
      diamondCost,
      gemstoneCost,
      goldCost: costs.goldCost,
      totalCost: costs.totalCost,
      profitMargin,
      finalSellingPrice: costs.finalSellingPrice,
      gstMode,
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
      notes,
      invoiceNotes,
      template: invoiceTemplate,
      lineItems: lineItems.length > 0 ? lineItems : undefined,
      details: {
        diamond_type: formData.diamondType,
        diamond_shape: formData.diamondShape,
        diamond_weight: formData.diamondWeight,
        diamond_color: formData.diamondColor,
        diamond_clarity: formData.diamondClarity,
        diamond_certification: formData.diamondCertification === 'other' ? customCertification : formData.diamondCertification,
        gemstone_weight: formData.gemstoneWeight
      },
      vendorBranding: vendorProfile ? {
        name: vendorProfile.business_name,
        logo: vendorProfile.logo_url,
        primaryColor: vendorProfile.primary_brand_color,
        secondaryColor: vendorProfile.secondary_brand_color,
        tagline: vendorProfile.brand_tagline,
        email: vendorProfile.email,
        phone: vendorProfile.phone,
        address: vendorAddress
      } : undefined
    });

    // Save/update the estimate with invoice generated flag
    await handleSaveInvoice(finalInvoiceNumber);
    toast({
      title: "Invoice Generated",
      description: "Invoice PDF has been downloaded and saved"
    });
  };
  const handleExportEstimate = async () => {
    // Use default name if estimate name is not provided
    const finalEstimateName = estimateName || `Estimate ${format(new Date(), 'dd-MMM-yyyy HH:mm')}`;

    // Generate invoice number if not exists
    let finalInvoiceNumber = invoiceNumber;
    if (!finalInvoiceNumber) {
      finalInvoiceNumber = (await generateNextInvoiceNumber()) || "";
    }
    const details = formData;
    const diamondCost = formData.diamondPerCaratPrice * formData.diamondWeight;
    const gemstoneCost = formData.gemstonePerCaratPrice * formData.gemstoneWeight;
    // Build vendor address string
    const addressParts = [vendorProfile?.address_line1, vendorProfile?.address_line2, vendorProfile?.city, vendorProfile?.state, vendorProfile?.pincode, vendorProfile?.country].filter(Boolean);
    const vendorAddress = addressParts.length > 0 ? addressParts.join(', ') : undefined;
    const invoiceData: InvoiceData = {
      invoiceNumber: finalInvoiceNumber,
      invoiceDate: invoiceDate.toISOString(),
      paymentDueDate: paymentDueDate?.toISOString(),
      paymentTerms,
      estimateName: finalEstimateName,
      status: estimateStatus,
      customerName: customerDetails.name,
      customerPhone: customerDetails.phone,
      customerEmail: customerDetails.email,
      customerAddress: customerDetails.address,
      customerGSTIN: customerDetails.gstin,
      vendorGSTIN: vendorGSTIN,
      netWeight: formData.netWeight,
      grossWeight: formData.grossWeight,
      purityFraction: formData.purityFraction,
      goldRate24k: vendorProfile?.gold_rate_24k_per_gram || formData.goldRate24k,
      goldCost: costs.goldCost,
      makingCharges: formData.makingCharges,
      cadDesignCharges: formData.cadDesignCharges,
      cammingCharges: formData.cammingCharges,
      certificationCost: formData.certificationCost,
      diamondCost: diamondCost,
      gemstoneCost: gemstoneCost,
      totalCost: costs.totalCost,
      profitMargin,
      finalSellingPrice: costs.finalSellingPrice,
      gstMode,
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
      notes,
      invoiceNotes,
      template: invoiceTemplate,
      lineItems: lineItems.length > 0 ? lineItems : undefined,
      details: {
        diamond_type: formData.diamondType,
        diamond_shape: formData.diamondShape,
        diamond_color: formData.diamondColor,
        diamond_clarity: formData.diamondClarity
      },
      vendorBranding: vendorProfile ? {
        name: vendorProfile.business_name || "",
        logo: vendorProfile.logo_url,
        phone: vendorProfile.phone,
        email: vendorProfile.email,
        address: vendorAddress
      } : undefined
    };

    // Show preview dialog instead of immediately downloading
    setPreviewInvoiceData(invoiceData);
    setShowInvoicePreview(true);
  };
  const handleConfirmDownload = () => {
    if (previewInvoiceData) {
      generateInvoicePDF(previewInvoiceData);
      setShowInvoicePreview(false);
      toast({
        title: "Invoice Exported",
        description: "Invoice PDF has been downloaded successfully"
      });
    }
  };
  const handleSaveInvoice = async (generatedInvoiceNumber: string) => {
    if (!user) return;
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
      customer_name: customerDetails.name || null,
      customer_phone: customerDetails.phone || null,
      customer_email: customerDetails.email || null,
      customer_address: customerDetails.address || null,
      status: estimateStatus,
      estimated_completion_date: estimatedCompletionDate?.toISOString() || null,
      is_customer_visible: isCustomerVisible,
      invoice_number: generatedInvoiceNumber,
      invoice_date: invoiceDate.toISOString(),
      payment_terms: paymentTerms,
      payment_due_date: paymentDueDate?.toISOString() || null,
      invoice_notes: invoiceNotes || null,
      is_invoice_generated: true,
      line_items: (lineItems.length > 0 ? lineItems : []) as any,
      details: {
        gross_weight: formData.grossWeight,
        diamond_per_carat_price: formData.diamondPerCaratPrice,
        diamond_weight: formData.diamondWeight,
        diamond_type: formData.diamondType,
        diamond_shape: formData.diamondShape,
        diamond_color: formData.diamondColor,
        diamond_clarity: formData.diamondClarity,
        diamond_certification: formData.diamondCertification === 'other' ? customCertification : formData.diamondCertification,
        gemstone_per_carat_price: formData.gemstonePerCaratPrice,
        gemstone_weight: formData.gemstoneWeight,
        vendor_gstin: vendorGSTIN || null,
        customer_gstin: customerDetails.gstin || null,
        gst_mode: gstMode,
        sgst_percentage: sgstPercentage,
        cgst_percentage: cgstPercentage,
        igst_percentage: igstPercentage,
        sgst_amount: costs.sgstAmount,
        cgst_amount: costs.cgstAmount,
        igst_amount: costs.igstAmount,
        shipping_charges: shippingCharges,
        shipping_zone: shippingZone,
        exchange_rate: exchangeRate,
        grand_total: costs.grandTotal
      }
    };
    if (currentEstimateId) {
      await supabase.from('manufacturing_cost_estimates').update(estimateData).eq('id', currentEstimateId);
    } else {
      const {
        data
      } = await supabase.from('manufacturing_cost_estimates').insert([estimateData]).select();
      if (data && data[0]) {
        setCurrentEstimateId(data[0].id);
      }
    }
    fetchEstimates();
  };
  const handleSaveAsInvoice = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save invoices",
        variant: "destructive"
      });
      return;
    }
    if (!customerDetails.name) {
      toast({
        title: "Customer Details Required",
        description: "Please enter customer name before saving invoice",
        variant: "destructive"
      });
      return;
    }
    try {
      // Generate invoice number if not exists
      let finalInvoiceNumber = invoiceNumber;
      if (!finalInvoiceNumber) {
        finalInvoiceNumber = (await generateNextInvoiceNumber()) || "";
      }

      // Save invoice to database
      await handleSaveInvoice(finalInvoiceNumber);
      toast({
        title: "Invoice Saved",
        description: `Invoice ${finalInvoiceNumber} saved successfully`
      });

      // Navigate to invoice history
      setTimeout(() => {
        navigate("/invoice-history");
      }, 1000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save invoice",
        variant: "destructive"
      });
      console.error("Save invoice error:", error);
    }
  };
  const handleExportPDF = async () => {
    if (!customerDetails.name) {
      toast({
        title: "Customer Details Required",
        description: "Please enter customer name before exporting PDF",
        variant: "destructive"
      });
      return;
    }
    try {
      // Generate invoice number if not exists
      let finalInvoiceNumber = invoiceNumber;
      if (!finalInvoiceNumber) {
        finalInvoiceNumber = (await generateNextInvoiceNumber()) || "";
        setInvoiceNumber(finalInvoiceNumber);
      }
      const diamondCost = formData.diamondPerCaratPrice * formData.diamondWeight;
      const gemstoneCost = formData.gemstonePerCaratPrice * formData.gemstoneWeight;

      // Build vendor address string
      const addressParts = [vendorProfile?.address_line1, vendorProfile?.address_line2, vendorProfile?.city, vendorProfile?.state, vendorProfile?.pincode, vendorProfile?.country].filter(Boolean);
      const vendorAddress = addressParts.length > 0 ? addressParts.join(", ") : undefined;
      const invoiceData: InvoiceData = {
        invoiceNumber: finalInvoiceNumber,
        invoiceDate: invoiceDate.toISOString(),
        paymentDueDate: paymentDueDate?.toISOString(),
        paymentTerms,
        estimateName: estimateName || `Invoice ${format(new Date(), "dd-MMM-yyyy")}`,
        status: estimateStatus,
        customerName: customerDetails.name,
        customerPhone: customerDetails.phone,
        customerEmail: customerDetails.email,
        customerAddress: customerDetails.address,
        customerGSTIN: customerDetails.gstin,
        vendorGSTIN: vendorGSTIN,
        netWeight: formData.netWeight,
        grossWeight: formData.grossWeight,
        purityFraction: formData.purityFraction,
        goldRate24k: vendorProfile?.gold_rate_24k_per_gram || formData.goldRate24k,
        goldCost: costs.goldCost,
        makingCharges: formData.makingCharges,
        cadDesignCharges: formData.cadDesignCharges,
        cammingCharges: formData.cammingCharges,
        certificationCost: formData.certificationCost,
        diamondCost: diamondCost,
        gemstoneCost: gemstoneCost,
        totalCost: costs.totalCost,
        profitMargin,
        finalSellingPrice: costs.finalSellingPrice,
        gstMode,
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
        notes,
        invoiceNotes,
        template: invoiceTemplate,
        lineItems: lineItems.length > 0 ? lineItems : undefined,
        details: {
          diamond_type: formData.diamondType,
          diamond_shape: formData.diamondShape,
          diamond_color: formData.diamondColor,
          diamond_clarity: formData.diamondClarity,
          diamond_certification: formData.diamondCertification === "other" ? customCertification : formData.diamondCertification,
          gemstone_weight: formData.gemstoneWeight
        },
        vendorBranding: vendorProfile ? {
          name: vendorProfile.business_name,
          logo: vendorProfile.logo_url,
          primaryColor: vendorProfile.primary_brand_color,
          secondaryColor: vendorProfile.secondary_brand_color,
          tagline: vendorProfile.brand_tagline,
          email: vendorProfile.email,
          phone: vendorProfile.phone,
          address: vendorAddress
        } : undefined
      };
      await generateInvoicePDF(invoiceData);
      toast({
        title: "Invoice Exported",
        description: "Invoice PDF downloaded successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to export PDF",
        variant: "destructive"
      });
      console.error("Export PDF error:", error);
    }
  };
  const handleSave = async () => {
    if (!estimateName) {
      toast({
        title: "Missing Information",
        description: "Please enter estimate name",
        variant: "destructive"
      });
      return;
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

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
      diamond_cost: formData.diamondPerCaratPrice * formData.diamondWeight,
      gemstone_cost: formData.gemstonePerCaratPrice * formData.gemstoneWeight,
      gold_cost: costs.goldCost,
      total_cost: costs.totalCost,
      profit_margin_percentage: profitMargin,
      final_selling_price: costs.finalSellingPrice,
      notes,
      reference_images: referenceImages,
      customer_name: customerDetails.name,
      customer_phone: customerDetails.phone,
      customer_email: customerDetails.email,
      customer_address: customerDetails.address,
      status: estimateStatus,
      estimated_completion_date: estimatedCompletionDate?.toISOString(),
      is_customer_visible: isCustomerVisible,
      share_token: shareToken || undefined,
      line_items: lineItems.length > 0 ? (lineItems as any) : null,
      is_invoice_generated: false,
      details: {
        gross_weight: formData.grossWeight,
        diamond_type: formData.diamondType,
        diamond_shape: formData.diamondShape,
        diamond_weight: formData.diamondWeight,
        diamond_color: formData.diamondColor,
        diamond_clarity: formData.diamondClarity,
        diamond_per_carat_price: formData.diamondPerCaratPrice,
        gemstone_weight: formData.gemstoneWeight,
        gemstone_per_carat_price: formData.gemstonePerCaratPrice,
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
    const certValue = details?.diamond_certification || "";
    const knownCerts = ["GIA", "IGI", "AGS", "EGL", "HRD", "GSI", "none"];
    setFormData({
      grossWeight: details?.gross_weight || 0,
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
      diamondCertification: knownCerts.includes(certValue) ? certValue : certValue ? "other" : "none",
      gemstonePerCaratPrice: details?.gemstone_per_carat_price || 0,
      gemstoneWeight: details?.gemstone_weight || 0
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
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setUploadingImage(true);
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to upload images.",
          variant: "destructive"
        });
        return;
      }
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) {
          toast({
            title: "Invalid File Type",
            description: `${file.name} is not an image file.`,
            variant: "destructive"
          });
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File Too Large",
            description: `${file.name} exceeds 5MB limit.`,
            variant: "destructive"
          });
          continue;
        }
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const {
          data,
          error
        } = await supabase.storage.from("manufacturing-estimates").upload(fileName, file, {
          cacheControl: "3600",
          upsert: false
        });
        if (error) throw error;
        const {
          data: {
            publicUrl
          }
        } = supabase.storage.from("manufacturing-estimates").getPublicUrl(data.path);
        uploadedUrls.push(publicUrl);
      }
      setReferenceImages([...referenceImages, ...uploadedUrls]);
      toast({
        title: "Images Uploaded",
        description: `${uploadedUrls.length} image(s) uploaded successfully.`
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  const removeImage = (index: number) => {
    setReferenceImages(referenceImages.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background py-8 px-4">
      {/* Guest Usage Limit Dialog */}
      <Dialog open={showUsageLimitDialog} onOpenChange={setShowUsageLimitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Usage Limit Reached</DialogTitle>
            <DialogDescription>
              You've reached the limit of 5 uses per 24 hours for guest users. Sign in to get unlimited access to the Manufacturing Cost Estimator, or wait 24 hours for your limit to reset.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-4">
            <Button onClick={() => navigate('/auth')} className="flex-1">
              Sign In
            </Button>
            <Button variant="outline" onClick={() => navigate('/')} className="flex-1">
              Go Home
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BackToHomeButton />
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full mb-4">
            <Calculator className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary animate-gradient">
            Manufacturing Cost Estimator
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Professional jewelry cost estimation and invoice generation workflow
          </p>
          
          {/* Guest Usage Counter */}
          {!user && guestUsageCount > 0 && guestUsageCount < 5 && <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg border border-border">
              <Info className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Guest Usage: {guestUsageCount}/5 uses (resets in 24 hours).
                <Button variant="link" className="ml-1 p-0 h-auto text-sm underline" onClick={() => navigate('/auth')}>
                  Sign in for unlimited access
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

        {/* Jewelry Specifications Section */}
        <JewelrySpecsSection
          formData={formData}
          onFormDataChange={(field, value) => {
            if (typeof value === 'string') {
              setFormData(prev => ({ ...prev, [field]: value }));
            } else {
              setFormData(prev => ({ ...prev, [field]: value }));
            }
          }}
          weightEntryMode={weightEntryMode}
          onWeightEntryModeChange={setWeightEntryMode}
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

        {/* Profit Margin and Summary */}
        <PricingSection
          profitMargin={profitMargin}
          onProfitMarginChange={setProfitMargin}
          costs={costs}
          formData={formData}
        />

        {/* Reference Images Upload */}
        <ReferenceImagesSection
          referenceImages={referenceImages}
          uploadingImage={uploadingImage}
          onImageUpload={handleImageUpload}
          onRemoveImage={removeImage}
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
      </div>

      <InvoicePreviewDialog open={showInvoicePreview} onOpenChange={setShowInvoicePreview} invoiceData={previewInvoiceData} onConfirmDownload={handleConfirmDownload} />
    </div>
  );
};

export default ManufacturingCost;