import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { InterestDialog } from "@/components/InterestDialog";
import { ContactOwnerDialog } from "@/components/ContactOwnerDialog";
import { CatalogFilters, FilterState } from "@/components/CatalogFilters";
import { Gem, AlertCircle, Building2, Video } from "lucide-react";
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
  const [usdToInr, setUsdToInr] = useState<number>(83);
  const [vendorProfile, setVendorProfile] = useState<any>(null);
  const [showVendorDetails, setShowVendorDetails] = useState(true);
  const [showCustomOrderForm, setShowCustomOrderForm] = useState(false);
  const [customOrderLoading, setCustomOrderLoading] = useState(false);
  const [showVideoRequestForm, setShowVideoRequestForm] = useState(false);
  const [videoRequestLoading, setVideoRequestLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    category: "",
    metalType: "",
    minPrice: "",
    maxPrice: "",
    diamondColor: "",
    diamondClarity: "",
    searchQuery: "",
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

  useEffect(() => {
    fetchExchangeRate();
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
      const firstError = validation.error.errors[0];
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

    const { error } = await supabase.from("catalog_inquiries").insert({
      customer_name: videoRequestData.customer_name,
      customer_email: videoRequestData.customer_email,
      customer_phone: videoRequestData.customer_phone || null,
      message: `[VIDEO REQUEST] ${videoRequestData.message}`,
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

      return (
        matchesSearch &&
        matchesCategory &&
        matchesMetal &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesDiamondColor &&
        matchesDiamondClarity
      );
    });
  }, [products, filters]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Mobile-Optimized Header */}
      <header className="border-b border-border/50 bg-card/90 backdrop-blur-md shadow-xl">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          {/* Vendor Details */}
          {showVendorDetails && vendorProfile && (
            <div className="mb-4 pb-4 border-b border-border/30">
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                {/* Logo & Business Info */}
                <div className="flex items-start gap-3 flex-1 min-w-0 w-full">
                  <Gem className="h-8 w-8 sm:h-10 sm:w-10 text-primary flex-shrink-0 drop-shadow-lg" />
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-foreground leading-tight mb-2 break-words">
                      {vendorProfile.business_name || "Jewelry Catalog"}
                    </h1>
                    
                    {/* Address */}
                    {vendorProfile.address_line1 && (
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 break-words leading-relaxed">
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
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {vendorProfile.email && (
                        <a href={`mailto:${vendorProfile.email}`} className="text-xs sm:text-sm text-primary font-medium hover:underline truncate max-w-full">
                          ✉️ {vendorProfile.email}
                        </a>
                      )}
                      {vendorProfile.phone && (
                        <a href={`tel:${vendorProfile.phone}`} className="text-xs sm:text-sm text-primary font-medium hover:underline whitespace-nowrap">
                          📞 {vendorProfile.phone}
                        </a>
                      )}
                      {vendorProfile.whatsapp_number && (
                        <a 
                          href={`https://wa.me/${vendorProfile.whatsapp_number.replace(/\D/g, '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs sm:text-sm text-primary font-medium hover:underline whitespace-nowrap"
                        >
                          💬 WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* QR Codes */}
                {(vendorProfile.instagram_qr_url || vendorProfile.whatsapp_qr_url) && (
                  <div className="flex gap-2 sm:gap-3 self-center sm:self-start">
                    {vendorProfile.instagram_qr_url && (
                      <div className="text-center">
                        <img 
                          src={vendorProfile.instagram_qr_url} 
                          alt="Instagram" 
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border-2 border-primary/30 shadow-lg hover:scale-105 transition-transform"
                        />
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 font-medium">Instagram</p>
                      </div>
                    )}
                    {vendorProfile.whatsapp_qr_url && (
                      <div className="text-center">
                        <img 
                          src={vendorProfile.whatsapp_qr_url} 
                          alt="WhatsApp" 
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border-2 border-primary/30 shadow-lg hover:scale-105 transition-transform"
                        />
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 font-medium">WhatsApp</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Filters Section */}
          <div className="mb-3">
            <CatalogFilters 
              filters={filters}
              onFilterChange={setFilters}
              categories={Array.from(new Set(products.map(p => p.category).filter(Boolean)))}
              metalTypes={Array.from(new Set(products.map(p => p.metal_type).filter(Boolean)))}
              diamondColors={Array.from(new Set(products.map(p => p.diamond_color).filter(Boolean)))}
              diamondClarities={Array.from(new Set(products.map(p => p.clarity).filter(Boolean)))}
            />
          </div>
          
          {/* Bottom Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4 pt-3 border-t border-border/30">
            {/* Exchange Rate */}
            <div className="bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/30 px-4 py-2.5 rounded-xl shadow-md">
              <span className="text-xs sm:text-sm font-semibold text-foreground">
                1 USD = <span className="text-primary text-base sm:text-lg">₹{usdToInr.toFixed(2)}</span>
              </span>
            </div>
            
            {/* Action Buttons */}
            {shareLinkId && (
              <div className="flex gap-2">
                <Dialog open={showVideoRequestForm} onOpenChange={setShowVideoRequestForm}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none h-10 text-xs sm:text-sm font-medium">
                      <Video className="h-4 w-4 mr-1.5" />
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
      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
        {filteredProducts.length === 0 && products.length > 0 ? (
          <div className="text-center py-16 sm:py-20">
            <Gem className="h-16 w-16 sm:h-20 sm:w-20 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-lg sm:text-xl text-muted-foreground mb-4">No products match your filters</p>
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
              })}
              className="h-10 sm:h-11"
            >
              Clear All Filters
            </Button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <Gem className="h-16 w-16 sm:h-20 sm:w-20 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-xl sm:text-2xl font-serif font-bold mb-2 text-foreground">No Products Available</h2>
            <p className="text-sm sm:text-base text-muted-foreground">This catalog is currently empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-border/50 hover:border-primary/30 bg-card/80 backdrop-blur-sm">
                {product.image_url && (
                  <div className="aspect-square overflow-hidden bg-muted/30 relative">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                )}
                <CardHeader className="pb-3">
                  <h3 className="font-serif text-base sm:text-lg font-bold text-foreground line-clamp-2 leading-tight">
                    {product.name}
                  </h3>
                  {product.sku && (
                    <p className="text-xs text-muted-foreground font-mono">SKU: {product.sku}</p>
                  )}
                </CardHeader>
                <CardContent className="pb-3">
                  {product.description && (
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  )}
                  <div className="space-y-1 text-xs sm:text-sm">
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
                <CardFooter className="border-t border-border/30 pt-4 flex-col gap-3 bg-muted/10">
                  <div className="w-full space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-muted-foreground">INR</span>
                      <p className="text-xl sm:text-2xl font-bold text-primary">
                        ₹{product.displayed_price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-muted-foreground">USD</span>
                      <p className="text-base sm:text-lg font-semibold text-foreground">
                        ${(product.displayed_price / usdToInr).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  {shareLinkId && (
                    <InterestDialog
                      productId={product.id}
                      productName={product.name}
                      shareLinkId={shareLinkId}
                    />
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SharedCatalog;
