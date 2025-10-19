import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Gem, Plus, LogOut, Share2, FileSpreadsheet, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Catalog = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [usdRate, setUsdRate] = useState(87.67); // Default INR to USD rate
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchUSDRate();
  }, []);

  const fetchUSDRate = async () => {
    try {
      // Fetch live USD/INR rate from exchange rate API
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      if (data.rates?.INR) {
        setUsdRate(data.rates.INR);
      }
    } catch (error) {
      console.error("Failed to fetch USD rate:", error);
      // Keep default rate if fetch fails
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .in("id", Array.from(selectedProducts));

      if (error) throw error;
      
      toast.success(`${selectedProducts.size} product(s) deleted successfully`);
      setSelectedProducts(new Set());
      fetchProducts();
    } catch (error: any) {
      toast.error("Failed to delete products");
    }
  };

  const toggleProductSelection = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)));
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  // Calculate totals
  const totalINR = products.reduce((sum, p) => sum + (p.retail_price || 0), 0);
  const totalUSD = totalINR / usdRate;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-serif font-bold text-foreground">My Jewelry Catalog</h1>
              {products.length > 0 && (
                <div className="flex flex-col items-end gap-1 px-6 py-3 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Inventory Value</div>
                  <div className="text-2xl font-bold text-primary">₹{totalINR.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                  <div className="text-sm text-muted-foreground font-semibold">${totalUSD.toLocaleString('en-US', { maximumFractionDigits: 0 })} USD</div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {selectedProducts.size > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Selected ({selectedProducts.size})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Selected Products?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete {selectedProducts.size} selected product(s). This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteSelected} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete Selected
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button variant="outline" onClick={() => navigate("/share")}>
                <Share2 className="h-4 w-4 mr-2" />
                Share Catalog
              </Button>
              <Button variant="outline" onClick={() => navigate("/import")}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button variant="outline" onClick={() => navigate("/add-product")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
              <Button variant="ghost" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-pulse text-primary text-xl">Loading catalog...</div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Gem className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-serif mb-2 text-foreground">No products yet</h2>
              <p className="text-muted-foreground mb-6">Start building your jewelry catalog</p>
              <Button onClick={() => navigate("/add-product")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Product
              </Button>
            </div>
          ) : (
            <>
              {products.length > 0 && (
                <div className="mb-4 flex items-center gap-3 pb-3 border-b border-border">
                  <Checkbox
                    id="select-all"
                    checked={selectedProducts.size === products.length}
                    onCheckedChange={toggleSelectAll}
                  />
                  <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                    Select All ({products.length})
                  </label>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow relative">
                  <div className="absolute top-3 left-3 z-10">
                    <Checkbox
                      checked={selectedProducts.has(product.id)}
                      onCheckedChange={() => toggleProductSelection(product.id)}
                      className="bg-background border-2"
                    />
                  </div>
                  {product.image_url ? (
                    <div className="aspect-square overflow-hidden bg-muted">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          console.error(`Failed to load image for ${product.sku}: ${product.image_url}`);
                          e.currentTarget.src = 'https://placehold.co/400x400/1a1a2e/FFD700?text=' + encodeURIComponent(product.name.substring(0, 20));
                        }}
                        onLoad={() => {
                          console.log(`Successfully loaded image for ${product.sku}`);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="aspect-square overflow-hidden bg-muted flex items-center justify-center">
                      <Gem className="h-24 w-24 text-muted-foreground/30" />
                    </div>
                  )}
                  <CardHeader>
                    <h3 className="font-serif text-xl font-semibold text-foreground">{product.name}</h3>
                    {product.sku && (
                      <p className="text-sm text-muted-foreground mb-3">SKU: {product.sku}</p>
                    )}
                    <div className="space-y-1.5 text-xs border-t border-border pt-3">
                      {product.gemstone && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground font-medium">Diamond Color:</span>
                            <span className="text-foreground font-semibold">{product.gemstone.split(' ')[0] || '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground font-medium">Diamond Clarity:</span>
                            <span className="text-foreground font-semibold">{product.gemstone.split(' ')[1] || '-'}</span>
                          </div>
                        </>
                      )}
                      {product.diamond_weight && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground font-medium">T DWT:</span>
                          <span className="text-foreground font-semibold">{product.diamond_weight}g</span>
                        </div>
                      )}
                      {product.weight_grams && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground font-medium">Gross Weight:</span>
                            <span className="text-foreground font-semibold">{product.weight_grams}g</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground font-medium">NET WT:</span>
                            <span className="text-foreground font-semibold">{product.net_weight}g</span>
                          </div>
                        </>
                      )}
                      {product.metal_type && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground font-medium">Metal Purity:</span>
                          <span className="text-foreground font-semibold">{product.metal_type}</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {product.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    {product.category && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Category:</span> <span className="text-foreground font-medium">{product.category}</span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between border-t border-border pt-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Retail Price</p>
                      <p className="text-lg font-bold text-primary">₹{product.retail_price.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-muted-foreground">${(product.retail_price / usdRate).toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Stock</p>
                      <p className="text-lg font-semibold text-foreground">{product.stock_quantity}</p>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
            </>
          )}
        </main>
      </div>
    </AuthGuard>
  );
};

export default Catalog;