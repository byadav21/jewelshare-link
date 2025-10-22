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
  const [usdToInr, setUsdToInr] = useState<number>(83); // Default fallback rate
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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          {/* First Layer: Company Details */}
          {showVendorDetails && (
            <div className="flex items-start justify-between gap-6 mb-4">
              <div className="flex items-center gap-3">
                <Gem className="h-8 w-8 text-primary flex-shrink-0" />
                {vendorProfile && (
                <div className="flex items-center gap-6 flex-1">
                  <div className="flex-1">
                    <h2 className="text-xl font-serif font-bold text-foreground leading-tight mb-1.5">
                      {vendorProfile.business_name || "My Jewelry Business"}
                    </h2>
                    <div className="text-sm text-muted-foreground mb-1.5">
                      {vendorProfile.address_line1 && (
                        <span>
                          {vendorProfile.address_line1}
                          {vendorProfile.address_line2 && `, ${vendorProfile.address_line2}`}
                        </span>
                      )}
                      {vendorProfile.city && (
                        <span className="ml-1">• {vendorProfile.city}, {vendorProfile.state} {vendorProfile.pincode}</span>
                      )}
                    </div>
                    <div className="flex gap-4 text-sm">
                      {vendorProfile.email && (
                        <span className="text-primary font-medium">Email: {vendorProfile.email}</span>
                      )}
                      {vendorProfile.phone && (
                        <span className="text-primary font-medium">Phone: {vendorProfile.phone}</span>
                      )}
                      {vendorProfile.whatsapp_number && (
                        <span className="text-primary font-medium">WhatsApp: {vendorProfile.whatsapp_number}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-start gap-3">
              {vendorProfile?.instagram_qr_url && (
                <div className="text-center">
                  <img 
                    src={vendorProfile.instagram_qr_url} 
                    alt="Instagram QR Code" 
                    className="w-24 h-24 object-cover rounded border border-border"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Instagram</p>
                </div>
              )}
              {vendorProfile?.whatsapp_qr_url && (
                <div className="text-center">
                  <img 
                    src={vendorProfile.whatsapp_qr_url} 
                    alt="WhatsApp QR Code" 
                    className="w-24 h-24 object-cover rounded border border-border"
                  />
                  <p className="text-xs text-muted-foreground mt-1">WhatsApp</p>
                </div>
              )}
            </div>
            </div>
          )}

          {/* Second Layer: Filters and Exchange Rate */}
          <div className="space-y-4">
            <CatalogFilters 
              filters={filters}
              onFilterChange={setFilters}
              categories={Array.from(new Set(products.map(p => p.category).filter(Boolean)))}
              metalTypes={Array.from(new Set(products.map(p => p.metal_type).filter(Boolean)))}
              diamondColors={Array.from(new Set(products.map(p => p.diamond_color).filter(Boolean)))}
              diamondClarities={Array.from(new Set(products.map(p => p.clarity).filter(Boolean)))}
            />
            
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm bg-muted px-4 py-2 rounded-lg">
                <span className="text-muted-foreground">1 USD = ₹{usdToInr.toFixed(2)}</span>
              </div>
              <div className="flex gap-2">
              {shareLinkId && (
                <>
                  <Dialog open={showVideoRequestForm} onOpenChange={setShowVideoRequestForm}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Video className="h-4 w-4 mr-2" />
                        Request Video
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Request Product Video</DialogTitle>
                        <DialogDescription>
                          Request a video of specific products or the entire catalog
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleVideoRequestSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="video_customer_name">Your Name *</Label>
                          <Input
                            id="video_customer_name"
                            value={videoRequestData.customer_name}
                            onChange={(e) => handleVideoRequestChange("customer_name", e.target.value)}
                            placeholder="John Doe"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="video_customer_email">Email *</Label>
                          <Input
                            id="video_customer_email"
                            type="email"
                            value={videoRequestData.customer_email}
                            onChange={(e) => handleVideoRequestChange("customer_email", e.target.value)}
                            placeholder="john@example.com"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="video_customer_phone">Phone Number (Optional)</Label>
                          <Input
                            id="video_customer_phone"
                            type="tel"
                            value={videoRequestData.customer_phone}
                            onChange={(e) => handleVideoRequestChange("customer_phone", e.target.value)}
                            placeholder="+1 (555) 000-0000"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="video_message">What would you like to see? *</Label>
                          <Textarea
                            id="video_message"
                            value={videoRequestData.message}
                            onChange={(e) => handleVideoRequestChange("message", e.target.value)}
                            placeholder="Describe which products you'd like to see in video format..."
                            rows={4}
                            required
                          />
                        </div>

                        <Button type="submit" className="w-full" disabled={videoRequestLoading}>
                          {videoRequestLoading ? "Submitting..." : "Submit Video Request"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={showCustomOrderForm} onOpenChange={setShowCustomOrderForm}>
                    <DialogTrigger asChild>
                      <Button variant="default" size="sm">
                        <Building2 className="h-4 w-4 mr-2" />
                        Build Your Jewelry
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Build Your Custom Jewelry</DialogTitle>
                        <DialogDescription>
                          Tell us about your dream piece and we'll bring it to life
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCustomOrderSubmit} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="customer_name">Your Name *</Label>
                            <Input
                              id="customer_name"
                              value={customOrderData.customer_name}
                              onChange={(e) => handleCustomOrderChange("customer_name", e.target.value)}
                              placeholder="John Doe"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="customer_email">Email *</Label>
                            <Input
                              id="customer_email"
                              type="email"
                              value={customOrderData.customer_email}
                              onChange={(e) => handleCustomOrderChange("customer_email", e.target.value)}
                              placeholder="john@example.com"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="customer_phone">Phone Number (Optional)</Label>
                          <Input
                            id="customer_phone"
                            type="tel"
                            value={customOrderData.customer_phone}
                            onChange={(e) => handleCustomOrderChange("customer_phone", e.target.value)}
                            placeholder="+1 (555) 000-0000"
                          />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="metal_type">Preferred Metal Type</Label>
                            <Select
                              value={customOrderData.metal_type}
                              onValueChange={(value) => handleCustomOrderChange("metal_type", value)}
                            >
                              <SelectTrigger id="metal_type">
                                <SelectValue placeholder="Select metal type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Gold">Gold</SelectItem>
                                <SelectItem value="White Gold">White Gold</SelectItem>
                                <SelectItem value="Rose Gold">Rose Gold</SelectItem>
                                <SelectItem value="Platinum">Platinum</SelectItem>
                                <SelectItem value="Silver">Silver</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="gemstone_preference">Gemstone Preference</Label>
                            <Input
                              id="gemstone_preference"
                              value={customOrderData.gemstone_preference}
                              onChange={(e) => handleCustomOrderChange("gemstone_preference", e.target.value)}
                              placeholder="e.g., Diamond, Sapphire, Ruby"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="budget_range">Budget Range</Label>
                          <Select
                            value={customOrderData.budget_range}
                            onValueChange={(value) => handleCustomOrderChange("budget_range", value)}
                          >
                            <SelectTrigger id="budget_range">
                              <SelectValue placeholder="Select your budget range" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Under ₹50,000">Under ₹50,000</SelectItem>
                              <SelectItem value="₹50,000 - ₹1,00,000">₹50,000 - ₹1,00,000</SelectItem>
                              <SelectItem value="₹1,00,000 - ₹2,50,000">₹1,00,000 - ₹2,50,000</SelectItem>
                              <SelectItem value="₹2,50,000 - ₹5,00,000">₹2,50,000 - ₹5,00,000</SelectItem>
                              <SelectItem value="Above ₹5,00,000">Above ₹5,00,000</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="design_description">Design Description *</Label>
                          <Textarea
                            id="design_description"
                            value={customOrderData.design_description}
                            onChange={(e) => handleCustomOrderChange("design_description", e.target.value)}
                            placeholder="Describe your ideal piece in detail..."
                            rows={4}
                            required
                          />
                        </div>

                        <Button type="submit" className="w-full" disabled={customOrderLoading}>
                          {customOrderLoading ? "Submitting..." : "Submit Custom Order Request"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <ContactOwnerDialog shareLinkId={shareLinkId} />
                </>
              )}
            </div>
          </div>
        </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {filteredProducts.length === 0 && products.length > 0 ? (
          <div className="text-center py-12">
            <Gem className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">No products match your filters</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setFilters({
                category: "",
                metalType: "",
                minPrice: "",
                maxPrice: "",
                diamondColor: "",
                diamondClarity: "",
                searchQuery: "",
              })}
            >
              Clear Filters
            </Button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Gem className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-serif mb-2 text-foreground">No products available</h2>
            <p className="text-muted-foreground">This catalog is currently empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-all duration-300">
                {product.image_url && (
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                )}
                <CardHeader>
                  <h3 className="font-serif text-xl font-semibold text-foreground">{product.name}</h3>
                  {product.sku && (
                    <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                  )}
                </CardHeader>
                <CardContent>
                  {product.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                      {product.description}
                    </p>
                  )}
                  <div className="space-y-1 text-sm">
                    {product.category && (
                      <p className="text-foreground">
                        <span className="text-muted-foreground">Category:</span> {product.category}
                      </p>
                    )}
                    {product.metal_type && (
                      <p className="text-foreground">
                        <span className="text-muted-foreground">Metal:</span> {product.metal_type}
                      </p>
                    )}
                    {product.gemstone && (
                      <p className="text-foreground">
                        <span className="text-muted-foreground">Gemstone:</span> {product.gemstone}
                      </p>
                    )}
                    {product.weight_grams && (
                      <p className="text-foreground">
                        <span className="text-muted-foreground">Weight:</span> {product.weight_grams}g
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-t border-border pt-4 flex-col gap-3">
                  <div className="w-full space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Price (INR)</p>
                      <p className="text-2xl font-bold text-primary">₹{product.displayed_price.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Price (USD)</p>
                      <p className="text-xl font-semibold text-foreground">${(product.displayed_price / usdToInr).toFixed(2)}</p>
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