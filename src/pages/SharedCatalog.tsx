import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { InterestDialog } from "@/components/InterestDialog";
import { ContactOwnerDialog } from "@/components/ContactOwnerDialog";
import { Gem, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SharedCatalog = () => {
  const { token } = useParams<{ token: string }>();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareLinkId, setShareLinkId] = useState<string | null>(null);
  const [usdToInr, setUsdToInr] = useState<number>(83); // Default fallback rate
  const [vendorProfile, setVendorProfile] = useState<any>(null);

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
      }
    } catch (err: any) {
      setError(err.message || "Failed to load catalog");
    } finally {
      setLoading(false);
    }
  };

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

          {/* Second Layer: Exchange Rate and Contact Button */}
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm bg-muted px-4 py-2 rounded-lg">
              <span className="text-muted-foreground">1 USD = ₹{usdToInr.toFixed(2)}</span>
            </div>
            <div className="flex gap-2">
              {shareLinkId && (
                <ContactOwnerDialog shareLinkId={shareLinkId} />
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {products.length === 0 ? (
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