import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Heart, Mail, Phone, ArrowLeft, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface ProductInterest {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  notes: string;
  created_at: string;
  products: {
    id: string;
    name: string;
    sku: string;
    image_url: string;
    retail_price: number;
  };
}

const Interests = () => {
  const [interests, setInterests] = useState<ProductInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInterests();
  }, []);

  const fetchInterests = async () => {
    try {
      const { data, error } = await supabase
        .from("product_interests")
        .select(`
          id,
          customer_name,
          customer_email,
          customer_phone,
          notes,
          created_at,
          products (
            id,
            name,
            sku,
            image_url,
            retail_price
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInterests(data || []);
    } catch (error: any) {
      toast.error("Failed to load interests");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-serif font-bold text-foreground">Customer Interests</h1>
              </div>
              <Badge variant="secondary" className="text-sm">
                <Heart className="h-3 w-3 mr-1" />
                {interests.length} Total
              </Badge>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-pulse text-primary text-xl">Loading interests...</div>
            </div>
          ) : interests.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-serif mb-2 text-foreground">No interests yet</h2>
              <p className="text-muted-foreground mb-6">
                When customers show interest in your products through shared catalogs, they'll appear here
              </p>
              <Button onClick={() => navigate("/")}>
                Go to Catalog
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {interests.map((interest) => (
                <Card key={interest.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-muted/50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4 flex-1">
                        {interest.products?.image_url && (
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            <img
                              src={interest.products.image_url}
                              alt={interest.products.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1">{interest.products?.name}</CardTitle>
                          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                            {interest.products?.sku && (
                              <span>SKU: {interest.products.sku}</span>
                            )}
                            {interest.products?.retail_price && (
                              <span className="font-semibold text-primary">
                                ₹{interest.products.retail_price.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(interest.created_at), "MMM d, yyyy")}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Customer Name</p>
                          <p className="text-foreground font-semibold">{interest.customer_name}</p>
                        </div>
                        {interest.customer_email && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Email</p>
                            <a
                              href={`mailto:${interest.customer_email}`}
                              className="text-primary hover:underline flex items-center gap-1"
                            >
                              <Mail className="h-4 w-4" />
                              {interest.customer_email}
                            </a>
                          </div>
                        )}
                        {interest.customer_phone && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Phone</p>
                            <a
                              href={`tel:${interest.customer_phone}`}
                              className="text-primary hover:underline flex items-center gap-1"
                            >
                              <Phone className="h-4 w-4" />
                              {interest.customer_phone}
                            </a>
                          </div>
                        )}
                      </div>
                      {interest.notes && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Additional Notes</p>
                          <p className="text-sm text-foreground bg-muted p-3 rounded-md">
                            {interest.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
};

export default Interests;
