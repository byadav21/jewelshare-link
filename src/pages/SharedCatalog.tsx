import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Gem, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SharedCatalog = () => {
  const { token } = useParams<{ token: string }>();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchSharedCatalog();
    }
  }, [token]);

  const fetchSharedCatalog = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("get-shared-catalog", {
        body: { shareToken: token },
      });

      if (error) throw error;

      if (data.error) {
        setError(data.error);
      } else {
        setProducts(data.products || []);
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
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-2">
            <Gem className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-serif font-bold text-foreground">Jewelry Catalog</h1>
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
                <CardFooter className="border-t border-border pt-4">
                  <div className="w-full">
                    <p className="text-xs text-muted-foreground mb-1">Price</p>
                    <p className="text-2xl font-bold text-primary">${product.displayed_price}</p>
                  </div>
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