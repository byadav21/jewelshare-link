import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InterestDialog } from "@/components/InterestDialog";
import { VideoRequestDialog } from "@/components/VideoRequestDialog";
import { ContactOwnerDialog } from "@/components/ContactOwnerDialog";
import { CatalogFilters, FilterState } from "@/components/CatalogFilters";
import { FloatingQRCodes } from "@/components/FloatingQRCodes";
import { PurchaseInquiryDialog } from "@/components/PurchaseInquiryDialog";
import { SocialShareButton } from "@/components/SocialShareButton";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ProductShareButton } from "@/components/ProductShareButton";
import { WishlistButton } from "@/components/WishlistButton";
import { ShareStats } from "@/components/ShareStats";
import { CountdownTimer } from "@/components/CountdownTimer";
import { OptimizedImage } from "@/components/OptimizedImage";
import { ProductShowcaseCarousel } from "@/components/ProductShowcaseCarousel";
import { Gem, AlertCircle, Building2, Video, Zap, Calendar, MessageCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { customOrderSchema } from "@/lib/validations";

const SharedCatalog = () => {
  const { token } = useParams<{ token: string }>();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareLinkId, setShareLinkId] = useState<string | null>(null);
  const [shareLinkData, setShareLinkData] = useState<any>(null);
  const [usdToInr, setUsdToInr] = useState<number>(83);
  const [vendorProfile, setVendorProfile] = useState<any>(null);
  const [showVendorDetails, setShowVendorDetails] = useState(true);
  const [showCustomOrderForm, setShowCustomOrderForm] = useState(false);
  const [customOrderLoading, setCustomOrderLoading] = useState(false);
  const [showVideoRequestForm, setShowVideoRequestForm] = useState(false);
  const [videoRequestLoading, setVideoRequestLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    category: "", metalType: "", minPrice: "", maxPrice: "",
    diamondColor: "", diamondClarity: "", searchQuery: "", deliveryType: "",
    gemstoneType: "", color: "", clarity: "", cut: "", minCarat: "", maxCarat: "",
    diamondType: "", shape: "", polish: "", symmetry: "", fluorescence: "", lab: ""
  });
  const [customOrderData, setCustomOrderData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    metal_type: "",
    gemstone_preference: "",
    design_description: "",
    budget_range: "",
  });
  const [videoRequestData, setVideoRequestData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    message: "",
  });
  const [displayCount, setDisplayCount] = useState(60);

  useEffect(() => {
    const cachedRate = sessionStorage.getItem('usd_rate');
    const cachedTime = sessionStorage.getItem('usd_rate_time');
    
    if (cachedRate && cachedTime && Date.now() - parseInt(cachedTime) < 3600000) {
      setUsdToInr(parseFloat(cachedRate));
    } else {
      fetchExchangeRate();
    }
    
    if (token) {
      fetchSharedCatalog();
    }
  }, [token]);

  const fetchExchangeRate = async () => {
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      if (data.rates && data.rates.INR) {
        setUsdToInr(data.rates.INR);
        sessionStorage.setItem('usd_rate', data.rates.INR.toString());
        sessionStorage.setItem('usd_rate_time', Date.now().toString());
      }
    } catch (err) {
      console.error('Failed to fetch exchange rate, using default');
    }
  };

  const fetchSharedCatalog = async () => {
    try {
      const decodedToken = token ? decodeURIComponent(token) : '';
      const { data, error } = await supabase.functions.invoke("get-shared-catalog", {
        body: { shareToken: decodedToken },
      });

      if (error) throw error;

      if (data.error) {
        setError(data.error);
      } else {
        setProducts(data.products || []);
        setShareLinkId(data.shareLinkId || null);
        setShareLinkData(data.shareLink || null);
        setVendorProfile(data.vendorProfile || null);
        setShowVendorDetails(data.shareLink?.show_vendor_details ?? true);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load catalog");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomOrderChange = (field: string, value: string) => {
    setCustomOrderData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCustomOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = customOrderSchema.safeParse(customOrderData);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      toast.error(firstError.message);
      return;
    }

    setCustomOrderLoading(true);

    const { error } = await supabase.from("custom_orders").insert({
      customer_name: validation.data.customer_name,
      customer_email: validation.data.customer_email,
      customer_phone: validation.data.customer_phone || null,
      metal_type: validation.data.metal_type || null,
      gemstone_preference: validation.data.gemstone_preference || null,
      design_description: validation.data.design_description,
      budget_range: validation.data.budget_range || null,
      share_link_id: shareLinkId,
    });

    setCustomOrderLoading(false);

    if (error) {
      toast.error("Failed to submit your request. Please try again.");
      return;
    }

    toast.success("Your custom order request has been submitted!");
    setShowCustomOrderForm(false);
    setCustomOrderData({
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      metal_type: "",
      gemstone_preference: "",
      design_description: "",
      budget_range: "",
    });
  };

  const handleVideoRequestChange = (field: string, value: string) => {
    setVideoRequestData((prev) => ({ ...prev, [field]: value }));
  };

  const handleVideoRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoRequestData.customer_name || !videoRequestData.customer_email || !videoRequestData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setVideoRequestLoading(true);

    const { error } = await supabase.from("video_requests").insert({
      customer_name: videoRequestData.customer_name,
      customer_email: videoRequestData.customer_email,
      customer_phone: videoRequestData.customer_phone || null,
      requested_products: videoRequestData.message,
      share_link_id: shareLinkId,
    });

    setVideoRequestLoading(false);

    if (error) {
      toast.error("Failed to submit your video request. Please try again.");
      return;
    }

    toast.success("Your video request has been submitted!");
    setShowVideoRequestForm(false);
    setVideoRequestData({
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      message: "",
    });
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = !filters.searchQuery || 
        product.name?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        product.sku?.toLowerCase().includes(filters.searchQuery.toLowerCase());

      const matchesCategory = !filters.category || product.category === filters.category;
      const matchesMetal = !filters.metalType || product.metal_type === filters.metalType;
      
      const matchesMinPrice = !filters.minPrice || 
        (product.retail_price >= parseFloat(filters.minPrice));
      const matchesMaxPrice = !filters.maxPrice || 
        (product.retail_price <= parseFloat(filters.maxPrice));

      const matchesDiamondColor = !filters.diamondColor || 
        product.diamond_color === filters.diamondColor;
      const matchesDiamondClarity = !filters.diamondClarity || 
        product.clarity === filters.diamondClarity;
      
      const matchesDeliveryType = !filters.deliveryType || 
        product.delivery_type === filters.deliveryType;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesMetal &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesDiamondColor &&
        matchesDiamondClarity &&
        matchesDeliveryType
      );
    });
  }, [products, filters]);

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(60);
  }, [filters]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Gem className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-xl text-foreground">Loading catalog...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check if expiring soon (within 24 hours)
  const isExpiringSoon = shareLinkData && 
    new Date(shareLinkData.expires_at).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000 &&
    new Date(shareLinkData.expires_at).getTime() > new Date().getTime();

  const catalogUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/shared/${encodeURIComponent(token || '')}`
    : '';

  // Check if catalog is expired
  const isExpired = shareLinkData && new Date(shareLinkData.expires_at).getTime() <= new Date().getTime();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-background relative">
      {/* Premium background effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Mobile-Optimized Header */}
      <header className="border-b border-border/50 bg-gradient-to-b from-card via-card/95 to-card/90 backdrop-blur-xl shadow-2xl relative z-10">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 md:py-6">
          {/* Viral Stats & Timer Banner */}
          {shareLinkData && !isExpired && (
            <div className="mb-4 sm:mb-5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 justify-between pb-3 sm:pb-5 border-b border-border/30 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 -mx-3 sm:-mx-4 lg:-mx-6 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 rounded-xl">
              <ShareStats 
                viewCount={shareLinkData.view_count}
                isExpiringSoon={isExpiringSoon}
                showTrending
              />
              <CountdownTimer expiresAt={shareLinkData.expires_at} />
            </div>
          )}

          {/* Vendor Details */}
          {showVendorDetails && vendorProfile && (
            <div className="mb-4 sm:mb-5 pb-3 sm:pb-5 border-b border-border/30">
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                {/* Logo & Business Info */}
                <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0 w-full">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 blur-xl rounded-full" />
                    <Gem className="relative h-6 w-6 sm:h-10 sm:w-10 md:h-12 md:w-12 text-primary flex-shrink-0 drop-shadow-2xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-serif font-bold bg-gradient-to-r from-foreground via-foreground to-primary/80 bg-clip-text text-transparent leading-tight mb-2 sm:mb-3 break-words">
                      {vendorProfile.business_name || "Jewelry Catalog"}
                    </h1>
                    
                    {/* Address */}
                    {vendorProfile.address_line1 && (
                      <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mb-1.5 sm:mb-2 break-words leading-relaxed">
                        {vendorProfile.address_line1}
                        {vendorProfile.address_line2 && `, ${vendorProfile.address_line2}`}
                        {vendorProfile.city && (
                          <span className="block sm:inline sm:ml-1">
                            <span className="sm:hidden">•</span> {vendorProfile.city}, {vendorProfile.state} {vendorProfile.pincode}
                          </span>
                        )}
                      </p>
                    )}
                    
                    {/* Contact Links - Mobile Optimized */}
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-3">
                      {vendorProfile.email && (
                        <a href={`mailto:${vendorProfile.email}`} className="text-[10px] sm:text-xs md:text-sm text-primary font-medium hover:underline truncate max-w-full">
                          ✉️ {vendorProfile.email}
                        </a>
                      )}
                      {vendorProfile.phone && (
                        <a 
                          href={`tel:${vendorProfile.phone}`} 
                          className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-2 sm:py-2 bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 border border-primary/30 rounded-full text-[10px] sm:text-xs md:text-sm font-medium text-foreground transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 min-h-[44px] sm:min-h-0"
                        >
                          📞 <span className="hidden xs:inline">{vendorProfile.phone}</span><span className="xs:hidden">Call</span>
                        </a>
                      )}
                      {vendorProfile.whatsapp_number && (
                        <a 
                          href={`https://wa.me/${vendorProfile.whatsapp_number.replace(/\D/g, '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-2 sm:py-2 bg-gradient-to-r from-emerald-500/20 to-green-500/20 hover:from-emerald-500/30 hover:to-green-500/30 border border-emerald-500/40 rounded-full text-[10px] sm:text-xs md:text-sm font-medium text-emerald-700 dark:text-emerald-400 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 min-h-[44px] sm:min-h-0"
                        >
                          💬 WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters Section */}
          <div className="mb-3">
            <CatalogFilters 
              filters={filters}
              onFilterChange={setFilters}
              productType="Jewellery"
              categories={Array.from(new Set(products.map(p => p.category).filter(Boolean)))}
              metalTypes={Array.from(new Set(products.map(p => p.metal_type).filter(Boolean)))}
              diamondColors={Array.from(new Set(products.map(p => p.diamond_color).filter(Boolean)))}
              diamondClarities={Array.from(new Set(products.map(p => p.clarity).filter(Boolean)))}
              deliveryTypes={Array.from(new Set(products.map(p => p.delivery_type).filter(Boolean)))}
              gemstoneTypes={[]} colors={[]} clarities={[]} cuts={[]} 
              shapes={[]} polishes={[]} symmetries={[]} fluorescences={[]} labs={[]}
            />
          </div>
          
          {/* Bottom Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4 pt-3 border-t border-border/30">
            {/* Exchange Rate */}
            <div className="relative bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/30 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
              <span className="relative text-[10px] sm:text-xs md:text-sm font-bold text-foreground">
                1 USD = <span className="text-primary text-sm sm:text-lg md:text-xl drop-shadow-sm">₹{usdToInr.toFixed(2)}</span>
              </span>
            </div>
            
            {/* Action Buttons */}
            {shareLinkId && (
              <div className="flex gap-1.5 sm:gap-2">
                {/* Social Share Button */}
                <SocialShareButton
                  url={catalogUrl}
                  title={vendorProfile?.business_name || "Jewelry Catalog"}
                  description="Check out this amazing jewelry collection!"
                  className="flex-1 sm:flex-none"
                />
                <Dialog open={showVideoRequestForm} onOpenChange={setShowVideoRequestForm}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none min-h-[44px] sm:h-10 text-[10px] sm:text-xs md:text-sm font-medium px-3 sm:px-4">
                      <Video className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                      <span className="hidden xs:inline">Request Video</span>
                      <span className="xs:hidden">Video</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Request Product Video</DialogTitle>
                      <DialogDescription className="text-xs sm:text-sm">
                        Request a video of specific products or the entire catalog
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleVideoRequestSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="video_customer_name" className="text-sm">Your Name *</Label>
                        <Input
                          id="video_customer_name"
                          value={videoRequestData.customer_name}
                          onChange={(e) => handleVideoRequestChange("customer_name", e.target.value)}
                          placeholder="John Doe"
                          className="h-10"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="video_customer_email" className="text-sm">Email *</Label>
                        <Input
                          id="video_customer_email"
                          type="email"
                          value={videoRequestData.customer_email}
                          onChange={(e) => handleVideoRequestChange("customer_email", e.target.value)}
                          placeholder="john@example.com"
                          className="h-10"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="video_customer_phone" className="text-sm">Phone (Optional)</Label>
                        <Input
                          id="video_customer_phone"
                          type="tel"
                          value={videoRequestData.customer_phone}
                          onChange={(e) => handleVideoRequestChange("customer_phone", e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="video_message" className="text-sm">What would you like to see? *</Label>
                        <Textarea
                          id="video_message"
                          value={videoRequestData.message}
                          onChange={(e) => handleVideoRequestChange("message", e.target.value)}
                          placeholder="Describe which products you'd like to see..."
                          rows={4}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full h-11" disabled={videoRequestLoading}>
                        {videoRequestLoading ? "Submitting..." : "Submit Video Request"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={showCustomOrderForm} onOpenChange={setShowCustomOrderForm}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="flex-1 sm:flex-none h-10 text-xs sm:text-sm font-medium shadow-lg">
                      <Building2 className="h-4 w-4 mr-1.5" />
                      <span className="hidden xs:inline">Build Jewelry</span>
                      <span className="xs:hidden">Custom</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Build Your Custom Jewelry</DialogTitle>
                      <DialogDescription className="text-xs sm:text-sm">
                        Tell us about your dream piece
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCustomOrderSubmit} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="customer_name" className="text-sm">Your Name *</Label>
                          <Input
                            id="customer_name"
                            value={customOrderData.customer_name}
                            onChange={(e) => handleCustomOrderChange("customer_name", e.target.value)}
                            placeholder="John Doe"
                            className="h-10"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="customer_email" className="text-sm">Email *</Label>
                          <Input
                            id="customer_email"
                            type="email"
                            value={customOrderData.customer_email}
                            onChange={(e) => handleCustomOrderChange("customer_email", e.target.value)}
                            placeholder="john@example.com"
                            className="h-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="customer_phone" className="text-sm">Phone (Optional)</Label>
                        <Input
                          id="customer_phone"
                          type="tel"
                          value={customOrderData.customer_phone}
                          onChange={(e) => handleCustomOrderChange("customer_phone", e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="h-10"
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="metal_type" className="text-sm">Preferred Metal</Label>
                          <Select
                            value={customOrderData.metal_type}
                            onValueChange={(value) => handleCustomOrderChange("metal_type", value)}
                          >
                            <SelectTrigger id="metal_type" className="h-10">
                              <SelectValue placeholder="Select metal" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover z-50">
                              <SelectItem value="Gold">Gold</SelectItem>
                              <SelectItem value="White Gold">White Gold</SelectItem>
                              <SelectItem value="Rose Gold">Rose Gold</SelectItem>
                              <SelectItem value="Platinum">Platinum</SelectItem>
                              <SelectItem value="Silver">Silver</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="gemstone_preference" className="text-sm">Gemstone</Label>
                          <Input
                            id="gemstone_preference"
                            value={customOrderData.gemstone_preference}
                            onChange={(e) => handleCustomOrderChange("gemstone_preference", e.target.value)}
                            placeholder="Diamond, Sapphire..."
                            className="h-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="budget_range" className="text-sm">Budget Range</Label>
                        <Select
                          value={customOrderData.budget_range}
                          onValueChange={(value) => handleCustomOrderChange("budget_range", value)}
                        >
                          <SelectTrigger id="budget_range" className="h-10">
                            <SelectValue placeholder="Select budget" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover z-50">
                            <SelectItem value="Under ₹50,000">Under ₹50,000</SelectItem>
                            <SelectItem value="₹50,000 - ₹1,00,000">₹50,000 - ₹1,00,000</SelectItem>
                            <SelectItem value="₹1,00,000 - ₹2,50,000">₹1,00,000 - ₹2,50,000</SelectItem>
                            <SelectItem value="₹2,50,000 - ₹5,00,000">₹2,50,000 - ₹5,00,000</SelectItem>
                            <SelectItem value="Above ₹5,00,000">Above ₹5,00,000</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="design_description" className="text-sm">Design Description *</Label>
                        <Textarea
                          id="design_description"
                          value={customOrderData.design_description}
                          onChange={(e) => handleCustomOrderChange("design_description", e.target.value)}
                          placeholder="Describe your ideal piece in detail..."
                          rows={4}
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full h-11" disabled={customOrderLoading}>
                        {customOrderLoading ? "Submitting..." : "Submit Custom Order"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
                
                <ContactOwnerDialog shareLinkId={shareLinkId} />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Product Grid */}
      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 md:py-12 relative z-10">
        {/* Featured Products Showcase */}
        {products.length > 0 && (
          <div className="mb-8 sm:mb-12">
            <ProductShowcaseCarousel products={products.slice(0, 8)} usdRate={usdToInr} />
          </div>
        )}

        {filteredProducts.length === 0 && products.length > 0 ? (
          <div className="text-center py-12 sm:py-16 md:py-20">
            <Gem className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 text-muted-foreground mx-auto mb-3 sm:mb-4 opacity-50" />
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-3 sm:mb-4">No products match your filters</p>
            <Button 
              variant="outline" 
              onClick={() => setFilters({
                category: "",
                metalType: "",
                minPrice: "",
                maxPrice: "",
                diamondColor: "",
                diamondClarity: "",
                searchQuery: "",
                deliveryType: "",
                gemstoneType: "",
                color: "",
                clarity: "",
                cut: "",
                minCarat: "",
                maxCarat: "",
                diamondType: "",
                shape: "",
                polish: "",
                symmetry: "",
                fluorescence: "",
                lab: "",
              })}
              className="min-h-[44px] sm:h-10 md:h-11 text-xs sm:text-sm px-4 sm:px-6"
            >
              Clear All Filters
            </Button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 sm:py-16 md:py-20">
            <Gem className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 text-muted-foreground mx-auto mb-3 sm:mb-4 opacity-50" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-bold mb-2 text-foreground">No Products Available</h2>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">This catalog is currently empty</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
              {filteredProducts.slice(0, displayCount).map((product) => {
              // Track product view when card is clicked
              const handleProductClick = () => {
                if (shareLinkId) {
                  supabase.functions.invoke("track-product-view", {
                    body: {
                      shareLinkId,
                      productId: product.id,
                    },
                  }).catch(err => console.error("Failed to track view:", err));
                }
              };

              return (
                <Card 
                  key={product.id} 
                  className="group overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border-border/50 hover:border-primary/40 bg-gradient-to-b from-card to-card/95 backdrop-blur-sm cursor-pointer hover:-translate-y-1"
                  onClick={handleProductClick}
                >
                {/* Premium hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                {product.image_url && (
                  <div className="aspect-square overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10 relative">
                    <OptimizedImage
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      width={400}
                      height={400}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Action Buttons Overlay - Always visible on mobile, hover on desktop */}
                    <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 z-10">
                      <div className="bg-background/90 backdrop-blur-sm rounded-full shadow-lg">
                        <WishlistButton 
                          productId={product.id}
                          shareLinkId={shareLinkId}
                        />
                      </div>
                      <div className="bg-background/90 backdrop-blur-sm rounded-full shadow-lg">
                        <ProductShareButton
                          productName={product.name}
                          productSku={product.sku}
                          price={product.displayed_price}
                          imageUrl={product.image_url}
                          catalogUrl={catalogUrl}
                          businessName={vendorProfile?.business_name}
                        />
                      </div>
                    </div>
                  </div>
                )}
                <CardHeader className="pb-2 sm:pb-3 relative z-10 p-3 sm:p-4 md:p-6">
                  <h3 className="font-serif text-sm sm:text-base md:text-lg font-bold text-foreground group-hover:text-primary line-clamp-2 leading-tight transition-colors duration-300">
                    {product.name}
                  </h3>
                  {product.sku && (
                    <p className="text-[10px] sm:text-xs text-muted-foreground font-mono mt-1">SKU: {product.sku}</p>
                  )}
                </CardHeader>
                <CardContent className="pb-2 sm:pb-3 p-3 sm:p-4 md:p-6 pt-0">
                  {product.description && (
                    <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  )}
                  <div className="space-y-0.5 sm:space-y-1 text-[10px] sm:text-xs md:text-sm">
                    {product.category && (
                      <p className="text-foreground truncate">
                        <span className="text-muted-foreground">Category:</span> <span className="font-medium">{product.category}</span>
                      </p>
                    )}
                    {product.metal_type && (
                      <p className="text-foreground truncate">
                        <span className="text-muted-foreground">Metal:</span> <span className="font-medium">{product.metal_type}</span>
                      </p>
                    )}
                    {product.weight_grams && (
                      <p className="text-foreground">
                        <span className="text-muted-foreground">Weight:</span> <span className="font-medium">{product.weight_grams}g</span>
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-t border-border/30 pt-3 sm:pt-4 flex-col gap-2.5 sm:gap-3.5 bg-gradient-to-b from-muted/10 to-transparent relative z-10 p-3 sm:p-4 md:p-6">
                  {/* Delivery Badge */}
                  {product.delivery_type && (
                    <div className="w-full">
                      {product.delivery_type === 'immediate delivery' ? (
                        <Badge variant="secondary" className="w-full justify-center gap-1.5 sm:gap-2 py-1.5 sm:py-2 bg-gradient-to-r from-emerald-500/20 via-green-500/20 to-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:from-emerald-500/30 hover:to-green-500/30 shadow-sm font-semibold text-[10px] sm:text-xs">
                          <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          <span>Immediate Dispatch</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="w-full justify-center gap-1.5 sm:gap-2 py-1.5 sm:py-2 border-primary/40 text-primary hover:bg-primary/10 shadow-sm font-semibold text-[10px] sm:text-xs">
                          <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          <span>{product.delivery_type}</span>
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="w-full space-y-1 sm:space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">INR</span>
                      <div className="relative">
                        <p className="text-base sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent drop-shadow-sm">
                          ₹{product.displayed_price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">USD</span>
                      <p className="text-sm sm:text-base md:text-lg font-semibold text-foreground">
                        ${(product.displayed_price / usdToInr).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  {shareLinkId && (
                    <div className="flex flex-col gap-1.5 sm:gap-2">
                      <PurchaseInquiryDialog
                        productId={product.id}
                        productName={product.name}
                        shareLinkId={shareLinkId}
                      />
                      <div className="flex gap-1.5 sm:gap-2 items-stretch">
                        <InterestDialog
                          productId={product.id}
                          productName={product.name}
                          shareLinkId={shareLinkId}
                        />
                        <VideoRequestDialog
                          productId={product.id}
                          productName={product.name}
                          shareLinkId={shareLinkId}
                          trigger={
                            <Button variant="outline" size="sm" className="whitespace-nowrap px-2.5 sm:px-3 md:px-4 min-h-[40px] sm:h-9 text-[10px] sm:text-xs">
                              <Video className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
                              Video
                            </Button>
                          }
                        />
                      </div>
                    </div>
                  )}
                </CardFooter>
              </Card>
              );
              })}
            </div>
            
            {/* Load More Button */}
            {displayCount < filteredProducts.length && (
              <div className="flex justify-center mt-8 sm:mt-12">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setDisplayCount(prev => prev + 60)}
                  className="min-h-[48px] sm:min-h-0 px-6 sm:px-8 py-3 sm:py-6 text-xs sm:text-base font-semibold hover:bg-primary/10 hover:border-primary transition-all duration-300"
                >
                  Load More Products ({filteredProducts.length - displayCount} remaining)
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating QR Codes */}
      {showVendorDetails && vendorProfile && (
        <FloatingQRCodes
          instagramQrUrl={vendorProfile.instagram_qr_url}
          whatsappQrUrl={vendorProfile.whatsapp_qr_url}
        />
      )}

      {/* WhatsApp Contact Button */}
      {vendorProfile?.whatsapp_number && (
        <WhatsAppButton
          whatsappNumber={vendorProfile.whatsapp_number}
          businessName={vendorProfile.business_name}
        />
      )}
    </div>
  );
};

export default SharedCatalog;
