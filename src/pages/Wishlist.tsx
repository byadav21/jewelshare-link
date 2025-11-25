import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OptimizedImage } from "@/components/OptimizedImage";
import { WishlistButton } from "@/components/WishlistButton";
import { WishlistShareDialog } from "@/components/WishlistShareDialog";
import { useWishlist } from "@/hooks/useWishlist";
import { Gem, Heart, AlertCircle, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Wishlist = () => {
  const { token } = useParams<{ token?: string }>();
  const navigate = useNavigate();
  const { wishlistId, wishlistItems, loading: wishlistLoading } = useWishlist();
  const [wishlist, setWishlist] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usdToInr, setUsdToInr] = useState<number>(83);
  const isSharedView = !!token;

  useEffect(() => {
    const cachedRate = sessionStorage.getItem('usd_rate');
    const cachedTime = sessionStorage.getItem('usd_rate_time');
    
    if (cachedRate && cachedTime && Date.now() - parseInt(cachedTime) < 3600000) {
      setUsdToInr(parseFloat(cachedRate));
    } else {
      fetchExchangeRate();
    }

    if (isSharedView) {
      fetchSharedWishlist();
    } else if (!wishlistLoading && wishlistId) {
      fetchMyWishlist();
    }
  }, [token, wishlistId, wishlistLoading]);

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
      console.error('Failed to fetch exchange rate');
    }
  };

  const fetchSharedWishlist = async () => {
    try {
      const decodedToken = token ? decodeURIComponent(token) : '';
      
      const { data: wishlistData, error: wishlistError } = await supabase
        .from('wishlists')
        .select('*, wishlist_items(product_id)')
        .eq('share_token', decodedToken)
        .eq('is_public', true)
        .single();

      if (wishlistError) throw wishlistError;

      setWishlist(wishlistData);

      if (wishlistData.wishlist_items && wishlistData.wishlist_items.length > 0) {
        const productIds = wishlistData.wishlist_items.map((item: any) => item.product_id);
        
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds)
          .is('deleted_at', null);

        if (productsError) throw productsError;
        setProducts(productsData || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyWishlist = async () => {
    try {
      const { data: wishlistData, error: wishlistError } = await supabase
        .from('wishlists')
        .select('*, wishlist_items(product_id)')
        .eq('id', wishlistId)
        .single();

      if (wishlistError) throw wishlistError;

      setWishlist(wishlistData);

      if (wishlistData.wishlist_items && wishlistData.wishlist_items.length > 0) {
        const productIds = wishlistData.wishlist_items.map((item: any) => item.product_id);
        
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds)
          .is('deleted_at', null);

        if (productsError) throw productsError;
        setProducts(productsData || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  if (loading || wishlistLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-xl text-foreground">Loading wishlist...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            {!isSharedView && wishlistId && (
              <WishlistShareDialog
                wishlistId={wishlistId}
                wishlistName={wishlist?.name || 'My Wishlist'}
                itemCount={products.length}
              />
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 blur-xl rounded-full" />
              <Heart className="relative h-12 w-12 text-primary fill-primary drop-shadow-2xl" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-serif font-bold bg-gradient-to-r from-foreground via-foreground to-primary/80 bg-clip-text text-transparent">
                {wishlist?.name || 'My Wishlist'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {products.length} {products.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">Your wishlist is empty</p>
            <p className="text-sm text-muted-foreground mt-2">
              Start adding products you love!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card 
                key={product.id}
                className="group overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border-border/50 hover:border-primary/40 bg-gradient-to-b from-card to-card/95"
              >
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
                    
                    {!isSharedView && (
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                        <div className="bg-background/90 backdrop-blur-sm rounded-full shadow-lg">
                          <WishlistButton productId={product.id} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <CardHeader className="pb-3">
                  <h3 className="font-serif text-lg font-bold text-foreground line-clamp-2">
                    {product.name}
                  </h3>
                  {product.sku && (
                    <p className="text-xs text-muted-foreground font-mono">SKU: {product.sku}</p>
                  )}
                </CardHeader>
                
                <CardContent>
                  {product.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-muted-foreground">INR</span>
                      <p className="text-xl font-bold text-primary">
                        ₹{product.retail_price.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-muted-foreground">USD</span>
                      <p className="text-base font-semibold text-foreground">
                        ${(product.retail_price / usdToInr).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {product.category && (
                    <Badge variant="outline" className="mt-3">
                      {product.category}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
