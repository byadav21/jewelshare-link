import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InterestDialog } from "@/components/InterestDialog";
import { ContactOwnerDialog } from "@/components/ContactOwnerDialog";
import { CatalogFilters, FilterState } from "@/components/CatalogFilters";
import { PurchaseInquiryDialog } from "@/components/PurchaseInquiryDialog";
import { SocialShareButton } from "@/components/SocialShareButton";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ProductShareButton } from "@/components/ProductShareButton";
import { WishlistButton } from "@/components/WishlistButton";
import { ShareStats } from "@/components/ShareStats";
import { CountdownTimer } from "@/components/CountdownTimer";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Gem, AlertCircle, Building2, Video, Zap, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { customOrderSchema } from "@/lib/validations";

const initialFilters: FilterState = {
  category: "", metalType: "", minPrice: "", maxPrice: "",
  diamondColor: "", diamondClarity: "", searchQuery: "", deliveryType: "",
  minDiamondWeight: "", maxDiamondWeight: "", minNetWeight: "", maxNetWeight: "",
  gemstoneType: "", color: "", clarity: "", cut: "", minCarat: "", maxCarat: "",
  diamondType: "", shape: "", polish: "", symmetry: "", fluorescence: "", lab: ""
};

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
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [displayCount, setDisplayCount] = useState(60);
  
  // Form states
  const [showCustomOrderForm, setShowCustomOrderForm] = useState(false);
  const [customOrderLoading, setCustomOrderLoading] = useState(false);
  const [showVideoRequestForm, setShowVideoRequestForm] = useState(false);
  const [videoRequestLoading, setVideoRequestLoading] = useState(false);
  const [customOrderData, setCustomOrderData] = useState({
    customer_name: "", customer_email: "", customer_phone: "",
    metal_type: "", gemstone_preference: "", design_description: "", budget_range: "",
  });
  const [videoRequestData, setVideoRequestData] = useState({
    customer_name: "", customer_email: "", customer_phone: "", message: "",
  });

  useEffect(() => {
    if (!token) return;
    
    const fetchData = async () => {
      const decodedToken = decodeURIComponent(token);
      
      // Check cached exchange rate
      const cachedRate = sessionStorage.getItem('usd_rate');
      const cachedTime = sessionStorage.getItem('usd_rate_time');
      const useCache = cachedRate && cachedTime && Date.now() - parseInt(cachedTime) < 3600000;
      
      // Fetch catalog and exchange rate in parallel
      const [catalogResult, rateResult] = await Promise.allSettled([
        supabase.functions.invoke("get-shared-catalog", { body: { shareToken: decodedToken } }),
        useCache ? Promise.resolve(null) : fetch('https://api.exchangerate-api.com/v4/latest/USD').then(r => r.json())
      ]);
      
      // Process exchange rate
      if (rateResult.status === 'fulfilled' && rateResult.value?.rates?.INR) {
        setUsdToInr(rateResult.value.rates.INR);
        sessionStorage.setItem('usd_rate', rateResult.value.rates.INR.toString());
        sessionStorage.setItem('usd_rate_time', Date.now().toString());
      } else if (useCache && cachedRate) {
        setUsdToInr(parseFloat(cachedRate));
      }
      
      // Process catalog data
      if (catalogResult.status === 'fulfilled') {
        const { data, error } = catalogResult.value;
        if (error) {
          setError(error.message || "Failed to load catalog");
        } else if (data?.error) {
          setError(data.error);
        } else {
          setProducts(data?.products || []);
          setShareLinkId(data?.shareLinkId || null);
          setShareLinkData(data?.shareLink || null);
          setVendorProfile(data?.vendorProfile || null);
          setShowVendorDetails(data?.shareLink?.show_vendor_details ?? true);
        }
      } else {
        setError("Failed to load catalog");
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, [token]);

  useEffect(() => {
    setDisplayCount(60);
  }, [filters]);

  const handleCustomOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = customOrderSchema.safeParse(customOrderData);
    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
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
      customer_name: "", customer_email: "", customer_phone: "",
      metal_type: "", gemstone_preference: "", design_description: "", budget_range: "",
    });
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
    setVideoRequestData({ customer_name: "", customer_email: "", customer_phone: "", message: "" });
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const match = [product.name, product.description, product.sku]
          .filter(Boolean).some(f => f.toLowerCase().includes(query));
        if (!match) return false;
      }
      if (filters.category && product.category !== filters.category) return false;
      if (filters.metalType && product.metal_type !== filters.metalType) return false;
      if (filters.minPrice && product.retail_price < parseFloat(filters.minPrice)) return false;
      if (filters.maxPrice && product.retail_price > parseFloat(filters.maxPrice)) return false;
      if (filters.diamondColor && product.diamond_color !== filters.diamondColor) return false;
      if (filters.diamondClarity && product.clarity !== filters.diamondClarity) return false;
      if (filters.deliveryType && product.delivery_type !== filters.deliveryType) return false;
      return true;
    });
  }, [products, filters]);

  // Loading state with skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto">
          {/* Header skeleton */}
          <div className="mb-6 space-y-4">
            <div className="h-12 w-48 bg-muted animate-pulse rounded-lg" />
            <div className="h-6 w-64 bg-muted animate-pulse rounded" />
            <div className="flex gap-2">
              <div className="h-8 w-24 bg-muted animate-pulse rounded-full" />
              <div className="h-8 w-24 bg-muted animate-pulse rounded-full" />
            </div>
          </div>
          {/* Products grid skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-lg border bg-card overflow-hidden">
                <div className="aspect-square bg-muted animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                  <div className="h-5 w-1/2 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
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

  const isExpiringSoon = shareLinkData && 
    new Date(shareLinkData.expires_at).getTime() - Date.now() < 24 * 60 * 60 * 1000 &&
    new Date(shareLinkData.expires_at).getTime() > Date.now();

  const isExpired = shareLinkData && new Date(shareLinkData.expires_at).getTime() <= Date.now();

  const catalogUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/shared/${encodeURIComponent(token || '')}`
    : '';

  const trackProductView = (productId: string) => {
    if (shareLinkId) {
      supabase.functions.invoke("track-product-view", {
        body: { shareLinkId, productId },
      }).catch(err => console.error("Failed to track view:", err));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-background relative">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Header */}
      <header className="border-b border-border/50 bg-gradient-to-b from-card via-card/95 to-card/90 backdrop-blur-xl shadow-2xl relative z-10">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 md:py-6">
          {/* Stats & Timer Banner */}
          {shareLinkData && !isExpired && (
            <div className="mb-4 sm:mb-5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 justify-between pb-3 sm:pb-5 border-b border-border/30 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 -mx-3 sm:-mx-4 lg:-mx-6 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 rounded-xl">
              <ShareStats viewCount={shareLinkData.view_count} isExpiringSoon={isExpiringSoon} showTrending />
              <CountdownTimer expiresAt={shareLinkData.expires_at} />
            </div>
          )}

          {/* Vendor Details */}
          {showVendorDetails && vendorProfile && (
            <div className="mb-4 sm:mb-5 pb-3 sm:pb-5 border-b border-border/30">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 blur-xl rounded-full" />
                  <Gem className="relative h-6 w-6 sm:h-10 sm:w-10 text-primary flex-shrink-0" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-2xl md:text-3xl font-serif font-bold text-foreground leading-tight mb-2">
                    {vendorProfile.business_name || "Jewelry Catalog"}
                  </h1>
                  {vendorProfile.address_line1 && (
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                      {vendorProfile.address_line1}
                      {vendorProfile.city && `, ${vendorProfile.city}, ${vendorProfile.state} ${vendorProfile.pincode}`}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {vendorProfile.email && (
                      <a href={`mailto:${vendorProfile.email}`} className="text-xs text-primary hover:underline">
                        ✉️ {vendorProfile.email}
                      </a>
                    )}
                    {vendorProfile.phone && (
                      <a href={`tel:${vendorProfile.phone}`} className="text-xs px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-full">
                        📞 {vendorProfile.phone}
                      </a>
                    )}
                    {vendorProfile.whatsapp_number && (
                      <a 
                        href={`https://wa.me/${vendorProfile.whatsapp_number.replace(/\D/g, '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-emerald-600 dark:text-emerald-400"
                      >
                        💬 WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="mb-3">
            <CatalogFilters 
              filters={filters}
              onFilterChange={setFilters}
              productType="Jewellery"
              categories={[...new Set(products.map(p => p.category).filter(Boolean))]}
              metalTypes={[...new Set(products.map(p => p.metal_type).filter(Boolean))]}
              diamondColors={[...new Set(products.map(p => p.diamond_color).filter(Boolean))]}
              diamondClarities={[...new Set(products.map(p => p.clarity).filter(Boolean))]}
              deliveryTypes={[...new Set(products.map(p => p.delivery_type).filter(Boolean))]}
              gemstoneTypes={[]} colors={[]} clarities={[]} cuts={[]} 
              shapes={[]} polishes={[]} symmetries={[]} fluorescences={[]} labs={[]}
            />
          </div>
          
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4 pt-3 border-t border-border/30">
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 px-4 py-2 rounded-xl">
              <span className="text-xs font-bold">1 USD = <span className="text-primary text-lg">₹{usdToInr.toFixed(2)}</span></span>
            </div>
            
            {shareLinkId && (
              <div className="flex gap-1.5 sm:gap-2">
                <SocialShareButton
                  url={catalogUrl}
                  title={vendorProfile?.business_name || "Jewelry Catalog"}
                  description="Check out this amazing jewelry collection!"
                  className="flex-1 sm:flex-none"
                />
                
                {/* Video Request Dialog */}
                <Dialog open={showVideoRequestForm} onOpenChange={setShowVideoRequestForm}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none min-h-[44px] text-xs">
                      <Video className="h-4 w-4 mr-1.5" />Video
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Request Product Video</DialogTitle>
                      <DialogDescription className="text-sm">Request a video of specific products</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleVideoRequestSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Your Name *</Label>
                        <Input value={videoRequestData.customer_name} onChange={(e) => setVideoRequestData(p => ({ ...p, customer_name: e.target.value }))} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Email *</Label>
                        <Input type="email" value={videoRequestData.customer_email} onChange={(e) => setVideoRequestData(p => ({ ...p, customer_email: e.target.value }))} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone (Optional)</Label>
                        <Input type="tel" value={videoRequestData.customer_phone} onChange={(e) => setVideoRequestData(p => ({ ...p, customer_phone: e.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label>What would you like to see? *</Label>
                        <Textarea value={videoRequestData.message} onChange={(e) => setVideoRequestData(p => ({ ...p, message: e.target.value }))} rows={4} required />
                      </div>
                      <Button type="submit" className="w-full" disabled={videoRequestLoading}>
                        {videoRequestLoading ? "Submitting..." : "Submit Request"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                {/* Custom Order Dialog */}
                <Dialog open={showCustomOrderForm} onOpenChange={setShowCustomOrderForm}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="flex-1 sm:flex-none min-h-[44px] text-xs">
                      <Building2 className="h-4 w-4 mr-1.5" />Custom
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Build Your Custom Jewelry</DialogTitle>
                      <DialogDescription className="text-sm">Tell us about your dream piece</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCustomOrderSubmit} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Your Name *</Label>
                          <Input value={customOrderData.customer_name} onChange={(e) => setCustomOrderData(p => ({ ...p, customer_name: e.target.value }))} required />
                        </div>
                        <div className="space-y-2">
                          <Label>Email *</Label>
                          <Input type="email" value={customOrderData.customer_email} onChange={(e) => setCustomOrderData(p => ({ ...p, customer_email: e.target.value }))} required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Phone (Optional)</Label>
                        <Input type="tel" value={customOrderData.customer_phone} onChange={(e) => setCustomOrderData(p => ({ ...p, customer_phone: e.target.value }))} />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Preferred Metal</Label>
                          <Select value={customOrderData.metal_type} onValueChange={(v) => setCustomOrderData(p => ({ ...p, metal_type: v }))}>
                            <SelectTrigger><SelectValue placeholder="Select metal" /></SelectTrigger>
                            <SelectContent>
                              {["Gold", "White Gold", "Rose Gold", "Platinum", "Silver"].map(m => (
                                <SelectItem key={m} value={m}>{m}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Gemstone</Label>
                          <Input value={customOrderData.gemstone_preference} onChange={(e) => setCustomOrderData(p => ({ ...p, gemstone_preference: e.target.value }))} placeholder="Diamond, Sapphire..." />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Budget Range</Label>
                        <Select value={customOrderData.budget_range} onValueChange={(v) => setCustomOrderData(p => ({ ...p, budget_range: v }))}>
                          <SelectTrigger><SelectValue placeholder="Select budget" /></SelectTrigger>
                          <SelectContent>
                            {["Under ₹50,000", "₹50,000 - ₹1,00,000", "₹1,00,000 - ₹2,50,000", "₹2,50,000 - ₹5,00,000", "Above ₹5,00,000"].map(b => (
                              <SelectItem key={b} value={b}>{b}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Design Description *</Label>
                        <Textarea value={customOrderData.design_description} onChange={(e) => setCustomOrderData(p => ({ ...p, design_description: e.target.value }))} rows={4} required placeholder="Describe your ideal piece..." />
                      </div>
                      <Button type="submit" className="w-full" disabled={customOrderLoading}>
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
        {filteredProducts.length === 0 && products.length > 0 ? (
          <div className="text-center py-16">
            <Gem className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-lg text-muted-foreground mb-4">No products match your filters</p>
            <Button variant="outline" onClick={() => setFilters(initialFilters)}>Clear All Filters</Button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Gem className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-serif font-bold mb-2">No Products Available</h2>
            <p className="text-muted-foreground">This catalog is currently empty</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
              {filteredProducts.slice(0, displayCount).map((product) => (
                <Card 
                  key={product.id} 
                  className="group overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border-border/50 hover:border-primary/40 bg-gradient-to-b from-card to-card/95 cursor-pointer hover:-translate-y-1"
                  onClick={() => trackProductView(product.id)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  
                  {product.image_url && (
                    <div className="aspect-square overflow-hidden bg-muted/30 relative">
                      <OptimizedImage
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        width={400}
                        height={400}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* Action Buttons */}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
                        <div className="bg-background/90 backdrop-blur-sm rounded-full shadow-lg">
                          <WishlistButton productId={product.id} shareLinkId={shareLinkId} />
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
                  
                  <CardHeader className="pb-2 p-3 sm:p-4">
                    <h3 className="font-serif text-sm sm:text-base font-bold text-foreground group-hover:text-primary line-clamp-2 transition-colors">
                      {product.name}
                    </h3>
                    {product.sku && <p className="text-[10px] text-muted-foreground font-mono mt-1">SKU: {product.sku}</p>}
                  </CardHeader>
                  
                  <CardContent className="pb-3 p-3 sm:p-4 pt-0">
                    {product.description && (
                      <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 line-clamp-2">{product.description}</p>
                    )}
                    <div className="space-y-0.5 text-[10px] sm:text-xs">
                      {product.category && <p><span className="text-muted-foreground">Category:</span> <span className="font-medium">{product.category}</span></p>}
                      {product.metal_type && <p><span className="text-muted-foreground">Metal:</span> <span className="font-medium">{product.metal_type}</span></p>}
                      {product.weight_grams && <p><span className="text-muted-foreground">Weight:</span> <span className="font-medium">{product.weight_grams}g</span></p>}
                    </div>
                    
                    {/* Delivery Badge */}
                    {product.delivery_type && (
                      <div className="mt-2">
                        <Badge variant={product.delivery_type === 'immediate' ? 'default' : 'secondary'} className="text-[9px]">
                          {product.delivery_type === 'immediate' ? <><Zap className="h-2.5 w-2.5 mr-0.5" />Ready</> : <><Calendar className="h-2.5 w-2.5 mr-0.5" />{product.dispatches_in_days || 7}d</>}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Price */}
                    <div className="mt-3 pt-2 border-t border-border/30">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm sm:text-lg font-bold text-primary">
                          ₹{(product.displayed_price || product.retail_price || 0).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[9px] sm:text-xs text-muted-foreground">
                          (${((product.displayed_price || product.retail_price || 0) / usdToInr).toFixed(0)})
                        </span>
                      </div>
                    </div>
                    
                    {/* Interest Buttons */}
                    <div className="mt-3 flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <InterestDialog productId={product.id} productName={product.name} shareLinkId={shareLinkId || ""} />
                      <PurchaseInquiryDialog productId={product.id} productName={product.name} shareLinkId={shareLinkId || ""} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            {filteredProducts.length > displayCount && (
              <div className="flex justify-center mt-8">
                <Button variant="outline" size="lg" onClick={() => setDisplayCount(prev => prev + 60)}>
                  Load More ({filteredProducts.length - displayCount} remaining)
                </Button>
              </div>
            )}

            {/* Results Count */}
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Showing {Math.min(displayCount, filteredProducts.length)} of {filteredProducts.length} products
            </div>
          </>
        )}
      </main>

      {/* Floating WhatsApp Button */}
      {vendorProfile?.whatsapp_number && (
        <WhatsAppButton whatsappNumber={vendorProfile.whatsapp_number} message="Hi! I'm interested in your jewelry catalog." businessName={vendorProfile?.business_name} />
      )}
    </div>
  );
};

export default SharedCatalog;
