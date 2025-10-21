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
    product_type: "",
    metal_type: "",
    gemstone: "",
    color: "",
    diamond_color: "",
    clarity: "",
    weight_grams: "",
    net_weight: "",
    diamond_weight: "",
    d_wt_1: "",
    d_wt_2: "",
    purity_fraction_used: "",
    d_rate_1: "",
    pointer_diamond: "",
    d_value: "",
    mkg: "",
    per_carat_price: "",
    gold_per_gram_price: "",
    certification_cost: "",
    gemstone_cost: "",
    cost_price: "",
    retail_price: "",
    total_usd: "",
    stock_quantity: "0",
    image_url: "",
    image_url_2: "",
    image_url_3: "",
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
          product_type: formData.product_type || null,
          metal_type: formData.metal_type || null,
          gemstone: formData.gemstone || null,
          color: formData.color || null,
          diamond_color: formData.diamond_color || null,
          clarity: formData.clarity || null,
          weight_grams: formData.weight_grams ? parseFloat(formData.weight_grams) : null,
          net_weight: formData.net_weight ? parseFloat(formData.net_weight) : null,
          diamond_weight: formData.diamond_weight ? parseFloat(formData.diamond_weight) : null,
          d_wt_1: formData.d_wt_1 ? parseFloat(formData.d_wt_1) : null,
          d_wt_2: formData.d_wt_2 ? parseFloat(formData.d_wt_2) : null,
          purity_fraction_used: formData.purity_fraction_used ? parseFloat(formData.purity_fraction_used) : null,
          d_rate_1: formData.d_rate_1 ? parseFloat(formData.d_rate_1) : null,
          pointer_diamond: formData.pointer_diamond ? parseFloat(formData.pointer_diamond) : null,
          d_value: formData.d_value ? parseFloat(formData.d_value) : null,
          mkg: formData.mkg ? parseFloat(formData.mkg) : null,
          per_carat_price: formData.per_carat_price ? parseFloat(formData.per_carat_price) : null,
          gold_per_gram_price: formData.gold_per_gram_price ? parseFloat(formData.gold_per_gram_price) : null,
          certification_cost: formData.certification_cost ? parseFloat(formData.certification_cost) : null,
          gemstone_cost: formData.gemstone_cost ? parseFloat(formData.gemstone_cost) : null,
          cost_price: parseFloat(formData.cost_price),
          retail_price: parseFloat(formData.retail_price),
          total_usd: formData.total_usd ? parseFloat(formData.total_usd) : null,
          stock_quantity: parseInt(formData.stock_quantity),
          image_url: formData.image_url || null,
          image_url_2: formData.image_url_2 || null,
          image_url_3: formData.image_url_3 || null,
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
                      placeholder="DPS19"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      placeholder="DIAMOND PANDENT SET"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product_type">Product Type</Label>
                    <Input
                      id="product_type"
                      name="product_type"
                      value={formData.product_type}
                      onChange={handleChange}
                      placeholder="Necklace, Earrings, etc."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metal_type">Metal Type</Label>
                    <Input
                      id="metal_type"
                      name="metal_type"
                      value={formData.metal_type}
                      onChange={handleChange}
                      placeholder="18k Gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gemstone">Gemstone</Label>
                    <Input
                      id="gemstone"
                      name="gemstone"
                      value={formData.gemstone}
                      onChange={handleChange}
                      placeholder="GH VS (Color Clarity)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="diamond_color">Diamond Color</Label>
                    <Input
                      id="diamond_color"
                      name="diamond_color"
                      value={formData.diamond_color}
                      onChange={handleChange}
                      placeholder="GH"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      placeholder="Yellow, White, Rose..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clarity">Clarity</Label>
                    <Input
                      id="clarity"
                      name="clarity"
                      value={formData.clarity}
                      onChange={handleChange}
                      placeholder="VS"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight_grams">Gross Weight (g)</Label>
                    <Input
                      id="weight_grams"
                      name="weight_grams"
                      type="number"
                      step="0.001"
                      value={formData.weight_grams}
                      onChange={handleChange}
                      placeholder="4.37"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="net_weight">Net Weight (g)</Label>
                    <Input
                      id="net_weight"
                      name="net_weight"
                      type="number"
                      step="0.001"
                      value={formData.net_weight}
                      onChange={handleChange}
                      placeholder="4.252"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="d_wt_1">D.WT 1 (ct)</Label>
                    <Input
                      id="d_wt_1"
                      name="d_wt_1"
                      type="number"
                      step="0.01"
                      value={formData.d_wt_1}
                      onChange={handleChange}
                      placeholder="0.23"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="d_wt_2">D.WT 2 (ct)</Label>
                    <Input
                      id="d_wt_2"
                      name="d_wt_2"
                      type="number"
                      step="0.01"
                      value={formData.d_wt_2}
                      onChange={handleChange}
                      placeholder="0.36"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="diamond_weight">Total D.WT (ct)</Label>
                    <Input
                      id="diamond_weight"
                      name="diamond_weight"
                      type="number"
                      step="0.01"
                      value={formData.diamond_weight}
                      onChange={handleChange}
                      placeholder="0.59"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="purity_fraction_used">Purity (%)</Label>
                    <Input
                      id="purity_fraction_used"
                      name="purity_fraction_used"
                      type="number"
                      step="0.01"
                      value={formData.purity_fraction_used}
                      onChange={handleChange}
                      placeholder="76"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="d_rate_1">D Rate 1 (₹/ct)</Label>
                    <Input
                      id="d_rate_1"
                      name="d_rate_1"
                      type="number"
                      step="0.01"
                      value={formData.d_rate_1}
                      onChange={handleChange}
                      placeholder="65000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pointer_diamond">Pointer Diamond</Label>
                    <Input
                      id="pointer_diamond"
                      name="pointer_diamond"
                      type="number"
                      step="0.01"
                      value={formData.pointer_diamond}
                      onChange={handleChange}
                      placeholder="65000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="d_value">D Value (₹)</Label>
                    <Input
                      id="d_value"
                      name="d_value"
                      type="number"
                      step="0.01"
                      value={formData.d_value}
                      onChange={handleChange}
                      placeholder="38350"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mkg">MKG (₹)</Label>
                    <Input
                      id="mkg"
                      name="mkg"
                      type="number"
                      step="0.01"
                      value={formData.mkg}
                      onChange={handleChange}
                      placeholder="4039.40"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="certification_cost">Cert Cost (₹)</Label>
                    <Input
                      id="certification_cost"
                      name="certification_cost"
                      type="number"
                      step="0.01"
                      value={formData.certification_cost}
                      onChange={handleChange}
                      placeholder="2000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gemstone_cost">Gem Cost (₹)</Label>
                    <Input
                      id="gemstone_cost"
                      name="gemstone_cost"
                      type="number"
                      step="0.01"
                      value={formData.gemstone_cost}
                      onChange={handleChange}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="per_carat_price">Per Carat Price</Label>
                    <Input
                      id="per_carat_price"
                      name="per_carat_price"
                      type="number"
                      step="0.01"
                      value={formData.per_carat_price}
                      onChange={handleChange}
                      placeholder="50000.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gold_per_gram_price">Gold/Gram (₹)</Label>
                    <Input
                      id="gold_per_gram_price"
                      name="gold_per_gram_price"
                      type="number"
                      step="0.01"
                      value={formData.gold_per_gram_price}
                      onChange={handleChange}
                      placeholder="6500.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
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
                      placeholder="75000.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="retail_price">Retail Price (₹) *</Label>
                    <Input
                      id="retail_price"
                      name="retail_price"
                      type="number"
                      step="0.01"
                      value={formData.retail_price}
                      onChange={handleChange}
                      required
                      placeholder="86328.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="total_usd">Total USD</Label>
                    <Input
                      id="total_usd"
                      name="total_usd"
                      type="number"
                      step="0.01"
                      value={formData.total_usd}
                      onChange={handleChange}
                      placeholder="984.00"
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
                  <Label htmlFor="image_url">Image URL 1</Label>
                  <Input
                    id="image_url"
                    name="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={handleChange}
                    placeholder="https://example.com/image1.jpg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="image_url_2">Image URL 2</Label>
                    <Input
                      id="image_url_2"
                      name="image_url_2"
                      type="url"
                      value={formData.image_url_2}
                      onChange={handleChange}
                      placeholder="https://example.com/image2.jpg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image_url_3">Image URL 3</Label>
                    <Input
                      id="image_url_3"
                      name="image_url_3"
                      type="url"
                      value={formData.image_url_3}
                      onChange={handleChange}
                      placeholder="https://example.com/image3.jpg"
                    />
                  </div>
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