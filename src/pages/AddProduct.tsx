import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ApprovalGuard } from "@/components/ApprovalGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sku: "",
    category: "",
    metal_type: "",
    gemstone: "",
    weight_grams: "",
    cost_price: "",
    retail_price: "",
    stock_quantity: "0",
    image_url: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("products").insert([
        {
          user_id: user.id,
          name: formData.name,
          description: formData.description || null,
          sku: formData.sku || null,
          category: formData.category || null,
          metal_type: formData.metal_type || null,
          gemstone: formData.gemstone || null,
          weight_grams: formData.weight_grams ? parseFloat(formData.weight_grams) : null,
          cost_price: parseFloat(formData.cost_price),
          retail_price: parseFloat(formData.retail_price),
          stock_quantity: parseInt(formData.stock_quantity),
          image_url: formData.image_url || null,
        },
      ]);

      if (error) throw error;

      toast.success("Product added successfully!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <ApprovalGuard>
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Catalog
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-serif">Add New Product</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Gold Diamond Ring"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Beautiful 18k gold ring with diamond..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      placeholder="JW-001"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      placeholder="Ring, Necklace, Bracelet..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="metal_type">Metal Type</Label>
                    <Input
                      id="metal_type"
                      name="metal_type"
                      value={formData.metal_type}
                      onChange={handleChange}
                      placeholder="18k Gold, Platinum..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gemstone">Gemstone</Label>
                    <Input
                      id="gemstone"
                      name="gemstone"
                      value={formData.gemstone}
                      onChange={handleChange}
                      placeholder="Diamond, Ruby, Sapphire..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight_grams">Weight (grams)</Label>
                  <Input
                    id="weight_grams"
                    name="weight_grams"
                    type="number"
                    step="0.01"
                    value={formData.weight_grams}
                    onChange={handleChange}
                    placeholder="5.50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cost_price">Cost Price *</Label>
                    <Input
                      id="cost_price"
                      name="cost_price"
                      type="number"
                      step="0.01"
                      value={formData.cost_price}
                      onChange={handleChange}
                      required
                      placeholder="500.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="retail_price">Retail Price *</Label>
                    <Input
                      id="retail_price"
                      name="retail_price"
                      type="number"
                      step="0.01"
                      value={formData.retail_price}
                      onChange={handleChange}
                      required
                      placeholder="1000.00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">Stock Quantity *</Label>
                  <Input
                    id="stock_quantity"
                    name="stock_quantity"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={handleChange}
                    required
                    placeholder="10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    name="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Adding Product..." : "Add Product"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ApprovalGuard>
  );
};

export default AddProduct;