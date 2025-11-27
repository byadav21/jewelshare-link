import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calculator, IndianRupee, Save, FolderOpen, Trash2, TrendingUp, Upload, X, Image as ImageIcon, Info, FileText, Calendar, Copy, Check } from "lucide-react";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
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
  const [costs, setCosts] = useState({
    goldCost: 0,
    totalCost: 0,
    finalSellingPrice: 0,
    profitAmount: 0
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
    setCosts({
      goldCost: parseFloat(goldCost.toFixed(2)),
      totalCost: parseFloat(totalCost.toFixed(2)),
      finalSellingPrice: parseFloat(finalSellingPrice.toFixed(2)),
      profitAmount: parseFloat(profitAmount.toFixed(2))
    });
  }, [formData, profitMargin]);
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
        customer_gstin: customerDetails.gstin || null
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
  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save estimates",
        variant: "destructive"
      });
      return;
    }
    if (!estimateName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for this estimate",
        variant: "destructive"
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
      customer_name: customerDetails.name || null,
      customer_phone: customerDetails.phone || null,
      customer_email: customerDetails.email || null,
      customer_address: customerDetails.address || null,
      status: estimateStatus,
      estimated_completion_date: estimatedCompletionDate?.toISOString() || null,
      is_customer_visible: isCustomerVisible,
      invoice_number: invoiceNumber || null,
      invoice_date: invoiceDate.toISOString(),
      payment_terms: paymentTerms,
      payment_due_date: paymentDueDate?.toISOString() || null,
      invoice_notes: invoiceNotes || null,
      is_invoice_generated: false,
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
        gemstone_weight: formData.gemstoneWeight
      }
    };
    if (currentEstimateId) {
      // Get previous status for comparison
      const previousEstimate = estimates.find(e => e.id === currentEstimateId);
      const previousStatus = previousEstimate?.status;
      const {
        error,
        data
      } = await supabase.from('manufacturing_cost_estimates').update(estimateData).eq('id', currentEstimateId).select();
      if (error) {
        toast({
          title: "Error",
          description: "Failed to update estimate",
          variant: "destructive"
        });
      } else {
        if (data && data[0]) {
          setShareToken(data[0].share_token);

          // Send email notification if status changed and customer details exist
          if (data[0].status !== previousStatus && data[0].customer_email && data[0].is_customer_visible) {
            try {
              await supabase.functions.invoke('notify-order-status', {
                body: {
                  estimateId: data[0].id,
                  customerName: data[0].customer_name,
                  customerEmail: data[0].customer_email,
                  status: data[0].status,
                  estimatedCompletionDate: data[0].estimated_completion_date,
                  shareToken: data[0].share_token
                }
              });
              console.log('Order status notification sent');
            } catch (emailError) {
              console.error('Failed to send email notification:', emailError);
              // Don't fail the save operation if email fails
            }
          }
        }
        toast({
          title: "Success",
          description: "Estimate updated successfully"
        });
        fetchEstimates();
        setShowSaveDialog(false);
      }
    } else {
      const {
        error,
        data
      } = await supabase.from('manufacturing_cost_estimates').insert([estimateData]).select();
      if (error) {
        toast({
          title: "Error",
          description: "Failed to save estimate",
          variant: "destructive"
        });
      } else {
        if (data && data[0]) {
          setShareToken(data[0].share_token);
          setCurrentEstimateId(data[0].id);

          // Send initial email notification if customer details exist and visible
          if (data[0].customer_email && data[0].is_customer_visible) {
            try {
              await supabase.functions.invoke('notify-order-status', {
                body: {
                  estimateId: data[0].id,
                  customerName: data[0].customer_name,
                  customerEmail: data[0].customer_email,
                  status: data[0].status,
                  estimatedCompletionDate: data[0].estimated_completion_date,
                  shareToken: data[0].share_token
                }
              });
              console.log('Initial order notification sent');
            } catch (emailError) {
              console.error('Failed to send email notification:', emailError);
              // Don't fail the save operation if email fails
            }
          }
        }
        toast({
          title: "Success",
          description: "Estimate saved successfully"
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
      gstin: ""
    });
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
  return <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background py-8 px-4">
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
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full mb-4">
            <Calculator className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary animate-gradient">
            Manufacturing Cost Estimator
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Calculate precise manufacturing costs and pricing for your custom jewelry orders
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

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button onClick={() => setShowSaveDialog(true)} disabled={!costs.totalCost}>
            <Save className="mr-2 h-4 w-4" />
            Save Estimate
          </Button>
          <Button onClick={() => setShowLoadDialog(true)} variant="outline">
            <FolderOpen className="mr-2 h-4 w-4" />
            Load Estimate
          </Button>
          <Button onClick={handleExportEstimate} variant="default" disabled={!costs.totalCost}>Create Invoice<FileText className="mr-2 h-4 w-4" />
            Export Invoice
          </Button>
          
          <Button onClick={() => navigate("/estimate-history")} variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Estimate History
          </Button>
          <Button onClick={() => navigate("/invoice-history")} variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Invoice History
          </Button>
          {shareToken && <Button onClick={copyShareLink} variant="outline" size="sm">
              {copiedToken ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copiedToken ? "Copied!" : "Copy Tracking Link"}
            </Button>}
          <Button onClick={handleReset} variant="ghost" size="sm">
            <Trash2 className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* Save Dialog */}
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Save Estimate</DialogTitle>
              <DialogDescription>
                Save this estimate with customer details and tracking options
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="estimate-name">Estimate Name *</Label>
                <Input id="estimate-name" value={estimateName} onChange={e => setEstimateName(e.target.value)} placeholder="e.g., Diamond Ring - John Doe" />
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

              {/* Invoice Section */}
              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">Invoice Details</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Configure invoice information for PDF generation
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoice-prefix">Invoice Prefix</Label>
                    <Input id="invoice-prefix" value={invoicePrefix} onChange={e => setInvoicePrefix(e.target.value.toUpperCase())} placeholder="INV" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="invoice-number">Invoice Number</Label>
                    <div className="flex gap-2">
                      <Input id="invoice-number" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} placeholder="Auto-generated" />
                      <Button type="button" variant="outline" onClick={generateNextInvoiceNumber} size="sm">
                        Auto
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Invoice Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <Calendar className="mr-2 h-4 w-4" />
                          {format(invoiceDate, "PPP")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarPicker mode="single" selected={invoiceDate} onSelect={date => date && setInvoiceDate(date)} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
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

                  <div className="space-y-2">
                    <Label>Payment Due Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <Calendar className="mr-2 h-4 w-4" />
                          {paymentDueDate ? format(paymentDueDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarPicker mode="single" selected={paymentDueDate} onSelect={setPaymentDueDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Invoice Template</Label>
                  <Select value={invoiceTemplate} onValueChange={(value: any) => setInvoiceTemplate(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="detailed">Detailed - Full breakdown with all specifications</SelectItem>
                      <SelectItem value="summary">Summary - Condensed view with key information</SelectItem>
                      <SelectItem value="minimal">Minimal - Basic invoice with totals only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoice-notes">Invoice Notes</Label>
                  <Textarea id="invoice-notes" value={invoiceNotes} onChange={e => setInvoiceNotes(e.target.value)} placeholder="Add payment instructions or special terms..." rows={3} />
                </div>
              </div>

              <Button onClick={handleSave} className="w-full">
                Save Estimate
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Load Dialog */}
        <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Load Estimate</DialogTitle>
              <DialogDescription>
                Select a saved estimate to continue working on
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              {estimates.length === 0 ? <p className="text-center text-muted-foreground py-8">
                  No saved estimates found
                </p> : estimates.map(estimate => <div key={estimate.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-medium">{estimate.estimate_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Created: {new Date(estimate.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleLoad(estimate)} size="sm">
                        Load
                      </Button>
                      <Button onClick={() => handleDelete(estimate.id)} variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>)}
            </div>
          </DialogContent>
        </Dialog>

        {/* Vendor and Customer Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Vendor Details (Auto-fetched) */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
              <CardTitle className="text-lg">Vendor Details</CardTitle>
              <CardDescription>Your business information</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {vendorProfile ? <div className="space-y-4">
                  {vendorProfile.logo_url && <div className="flex justify-center mb-4">
                      <img src={vendorProfile.logo_url} alt="Vendor Logo" className="h-20 w-auto object-contain" />
                    </div>}
                  <div className="space-y-3 text-sm">
                    <div className="border-b border-border pb-2">
                      <p className="font-semibold text-foreground">{vendorProfile.business_name || 'Business Name'}</p>
                    </div>
                    {(vendorProfile.address_line1 || vendorProfile.city || vendorProfile.state) && <div>
                        <p className="text-xs text-muted-foreground mb-1">Address</p>
                        <p className="text-foreground leading-relaxed">
                          {[vendorProfile.address_line1, vendorProfile.address_line2, vendorProfile.city, vendorProfile.state, vendorProfile.pincode, vendorProfile.country].filter(Boolean).join(', ')}
                        </p>
                      </div>}
                    {vendorProfile.phone && <div>
                        <p className="text-xs text-muted-foreground mb-1">Phone</p>
                        <p className="text-foreground">{vendorProfile.phone}</p>
                      </div>}
                  {vendorProfile.email && <div>
                        <p className="text-xs text-muted-foreground mb-1">Email</p>
                        <p className="text-foreground">{vendorProfile.email}</p>
                      </div>}
                    <div>
                      <Label htmlFor="vendor-gstin" className="text-xs text-muted-foreground mb-1">GSTIN (Optional)</Label>
                      <Input id="vendor-gstin" value={vendorGSTIN} onChange={e => setVendorGSTIN(e.target.value)} placeholder="Enter GSTIN" className="mt-1.5" />
                    </div>
                  </div>
                </div> : <p className="text-sm text-muted-foreground py-4">Loading vendor details...</p>}
            </CardContent>
          </Card>

          {/* Customer Details (Input fields) */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-accent/5 to-secondary/5">
              <CardTitle className="text-lg">Customer Details</CardTitle>
              <CardDescription>Enter customer information</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customer-name" className="text-sm font-medium">Customer Name *</Label>
                  <Input id="customer-name" value={customerDetails.name} onChange={e => setCustomerDetails({
                  ...customerDetails,
                  name: e.target.value
                })} placeholder="Enter customer name" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="customer-phone" className="text-sm font-medium">Phone Number</Label>
                  <Input id="customer-phone" value={customerDetails.phone} onChange={e => setCustomerDetails({
                  ...customerDetails,
                  phone: e.target.value
                })} placeholder="Enter phone number" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="customer-email" className="text-sm font-medium">Email Address</Label>
                  <Input id="customer-email" type="email" value={customerDetails.email} onChange={e => setCustomerDetails({
                  ...customerDetails,
                  email: e.target.value
                })} placeholder="Enter email address" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="customer-address" className="text-sm font-medium">Address</Label>
                  <Textarea id="customer-address" value={customerDetails.address} onChange={e => setCustomerDetails({
                  ...customerDetails,
                  address: e.target.value
                })} placeholder="Enter customer address" className="mt-1.5 min-h-[90px]" rows={3} />
                </div>
                <div>
                  <Label htmlFor="customer-gstin" className="text-sm font-medium">GSTIN (Optional)</Label>
                  <Input id="customer-gstin" value={customerDetails.gstin} onChange={e => setCustomerDetails({
                  ...customerDetails,
                  gstin: e.target.value
                })} placeholder="Enter customer GSTIN" className="mt-1.5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Weight and Purity Inputs */}
          

          {/* Gold Rate and Charges */}
          <Card>
            <CardHeader>
              <CardTitle>Gold Rate & Charges</CardTitle>
              <CardDescription>Enter rates and additional charges</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="space-y-1">
                <Label htmlFor="gold-rate-24k" className="text-sm">Gold Rate 24K (per gram)</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="gold-rate-24k" type="number" min={0} step={0.01} value={formData.goldRate24k} onChange={e => handleChange("goldRate24k", e.target.value)} className="pl-9" />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="making-charges" className="text-sm">Making Charges</Label>
                <Input id="making-charges" type="number" min={0} step={0.01} value={formData.makingCharges} onChange={e => handleChange("makingCharges", e.target.value)} />
              </div>

              <div className="space-y-1">
                <Label htmlFor="cad-design-charges" className="text-sm">CAD Design Charges</Label>
                <Input id="cad-design-charges" type="number" min={0} step={0.01} value={formData.cadDesignCharges} onChange={e => handleChange("cadDesignCharges", e.target.value)} />
              </div>

              <div className="space-y-1">
                <Label htmlFor="camming-charges" className="text-sm">Camming Charges</Label>
                <Input id="camming-charges" type="number" min={0} step={0.01} value={formData.cammingCharges} onChange={e => handleChange("cammingCharges", e.target.value)} />
              </div>

              <div className="space-y-1">
                <Label htmlFor="certification-cost" className="text-sm">Certification Cost</Label>
                <Input id="certification-cost" type="number" min={0} step={0.01} value={formData.certificationCost} onChange={e => handleChange("certificationCost", e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Diamond Details */}
        <Card>
          
          
        </Card>

        {/* Gemstone Details */}
        

        {/* Profit Margin and Summary */}
        

        {/* Reference Images Upload */}
        

        {/* Invoice Line Items */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Line Items</CardTitle>
            <CardDescription>Add multiple jewelry items with individual pricing details</CardDescription>
          </CardHeader>
          <CardContent>
            <InvoiceLineItems items={lineItems} onChange={setLineItems} goldRate24k={formData.goldRate24k} purityFraction={formData.purityFraction} />
          </CardContent>
        </Card>
      </div>

      <InvoicePreviewDialog open={showInvoicePreview} onOpenChange={setShowInvoicePreview} invoiceData={previewInvoiceData} onConfirmDownload={handleConfirmDownload} />
    </div>;
};
export default ManufacturingCost;