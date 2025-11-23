import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ApprovalGuard } from "@/components/ApprovalGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useVendorPermissions } from "@/hooks/useVendorPermissions";
import { JewelleryForm } from "@/components/forms/JewelleryForm";
import { GemstonesForm } from "@/components/forms/GemstonesForm";
import { LooseDiamondsForm } from "@/components/forms/LooseDiamondsForm";
import { Upload, X, Loader2 } from "lucide-react";
import { PlanLimitWarning } from "@/components/PlanLimitWarning";

const AddProduct = () => {
  const navigate = useNavigate();
  const { permissions, loading: permissionsLoading } = useVendorPermissions();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<{ [key: string]: boolean }>({});
  const [approvedCategories, setApprovedCategories] = useState<string[]>(["Jewellery"]);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sku: "",
    category: "",
    product_type: "Jewellery",
    metal_type: "",
    gemstone: "",
    gemstone_name: "",
    gemstone_type: "",
    color: "",
    diamond_color: "",
    clarity: "",
    cut: "",
    polish: "",
    symmetry: "",
    fluorescence: "",
    shape: "",
    measurement: "",
    certification: "",
    ratio: "",
    lab: "",
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
    carat: "",
    carat_weight: "",
    per_carat_price: "",
    gold_per_gram_price: "",
    certification_cost: "",
    gemstone_cost: "",
    cost_price: "",
    retail_price: "",
    total_usd: "",
    stock_quantity: "0",
    color_shade_amount: "",
    image_url: "",
    image_url_2: "",
    image_url_3: "",
    delivery_type: "immediate delivery",
    dispatches_in_days: "",
  });

  useEffect(() => {
    fetchApprovedCategories();
  }, []);

  const fetchApprovedCategories = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_approval_status")
        .select("approved_categories")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      
      const approved = data?.approved_categories || ["Jewellery"];
      setApprovedCategories(approved);
      setFormData(prev => ({ ...prev, product_type: approved[0] }));
    } catch (error) {
      console.error("Failed to fetch approved categories:", error);
    }
  };

  useEffect(() => {
    if (!permissionsLoading && !permissions.can_add_products) {
      toast.error("You don't have permission to add products");
      navigate("/");
    }
  }, [permissions, permissionsLoading, navigate]);

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
          product_type: formData.product_type,
          metal_type: formData.metal_type || null,
          gemstone: formData.gemstone || null,
          gemstone_name: formData.gemstone_name || null,
          gemstone_type: formData.gemstone_type || null,
          color: formData.color || null,
          diamond_color: formData.diamond_color || null,
          clarity: formData.clarity || null,
          cut: formData.cut || null,
          polish: formData.polish || null,
          symmetry: formData.symmetry || null,
          fluorescence: formData.fluorescence || null,
          shape: formData.shape || null,
          measurement: formData.measurement || null,
          certification: formData.certification || null,
          ratio: formData.ratio || null,
          lab: formData.lab || null,
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
          carat: formData.carat ? parseFloat(formData.carat) : null,
          carat_weight: formData.carat_weight ? parseFloat(formData.carat_weight) : null,
          per_carat_price: formData.per_carat_price ? parseFloat(formData.per_carat_price) : null,
          gold_per_gram_price: formData.gold_per_gram_price ? parseFloat(formData.gold_per_gram_price) : null,
          certification_cost: formData.certification_cost ? parseFloat(formData.certification_cost) : null,
          gemstone_cost: formData.gemstone_cost ? parseFloat(formData.gemstone_cost) : null,
          cost_price: parseFloat(formData.cost_price),
          retail_price: parseFloat(formData.retail_price),
          total_usd: formData.total_usd ? parseFloat(formData.total_usd) : null,
          stock_quantity: parseInt(formData.stock_quantity),
          color_shade_amount: formData.color_shade_amount || null,
          image_url: formData.image_url || null,
          image_url_2: formData.image_url_2 || null,
          image_url_3: formData.image_url_3 || null,
          delivery_type: formData.delivery_type,
          dispatches_in_days: formData.dispatches_in_days ? parseInt(formData.dispatches_in_days) : null,
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

  const handleImageUpload = async (file: File, fieldName: string) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploadingImages(prev => ({ ...prev, [fieldName]: true }));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path);

      // Update form data
      setFormData(prev => ({ ...prev, [fieldName]: publicUrl }));
      toast.success("Image uploaded successfully!");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploadingImages(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const removeImage = (fieldName: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: "" }));
  };

  if (permissionsLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <ApprovalGuard>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Catalog
          </Button>

          <Card className="shadow-xl">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-3xl font-serif bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Add New Product
              </CardTitle>
              <p className="text-muted-foreground text-sm mt-2">Select a category and fill in the product details</p>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Plan Limit Warning */}
              <div className="mb-6">
                <PlanLimitWarning />
              </div>
              {/* Category Selector */}
              {approvedCategories.length > 1 && (
                <div className="mb-8 pb-6 border-b border-border/30">
                  <Label className="text-base font-semibold mb-4 block">Select Product Category *</Label>
                  <div className="flex gap-3 flex-wrap">
                    {approvedCategories.map((category) => {
                      const isSelected = formData.product_type === category;
                      const categoryKey = category.toLowerCase().replace(/\s+/g, '-');
                      
                      const categoryStyles: Record<string, any> = {
                        'jewellery': {
                          gradient: 'from-category-jewellery/20 to-category-jewellery/5',
                          border: 'border-category-jewellery/40',
                          text: 'text-category-jewellery',
                          glow: 'shadow-[0_0_20px_hsl(var(--category-jewellery)/0.3)]',
                          icon: '💍'
                        },
                        'gemstones': {
                          gradient: 'from-category-gemstone/20 to-category-gemstone/5',
                          border: 'border-category-gemstone/40',
                          text: 'text-category-gemstone',
                          glow: 'shadow-[0_0_20px_hsl(var(--category-gemstone)/0.3)]',
                          icon: '💎'
                        },
                        'loose-gemstones': {
                          gradient: 'from-category-gemstone/20 to-category-gemstone/5',
                          border: 'border-category-gemstone/40',
                          text: 'text-category-gemstone',
                          glow: 'shadow-[0_0_20px_hsl(var(--category-gemstone)/0.3)]',
                          icon: '💎'
                        },
                        'loose-diamonds': {
                          gradient: 'from-category-diamond/20 to-category-diamond/5',
                          border: 'border-category-diamond/40',
                          text: 'text-category-diamond',
                          glow: 'shadow-[0_0_20px_hsl(var(--category-diamond)/0.3)]',
                          icon: '✨'
                        }
                      };
                      
                      const style = categoryStyles[categoryKey] || categoryStyles['jewellery'];
                      
                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setFormData({ ...formData, product_type: category })}
                          className={`
                            group relative overflow-hidden px-6 py-3 rounded-xl
                            font-serif text-base font-semibold transition-all duration-300 ease-out
                            ${isSelected 
                              ? `bg-gradient-to-br ${style.gradient} border-2 ${style.border} ${style.glow} scale-105` 
                              : 'bg-card/50 border-2 border-border/30 hover:border-border/60 hover:scale-102'
                            }
                          `}
                        >
                          <div className={`
                            absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent
                            -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out
                          `} />
                          
                          <span className={`
                            relative flex items-center gap-2
                            ${isSelected ? style.text : 'text-muted-foreground group-hover:text-foreground'}
                            transition-colors duration-300
                          `}>
                            <span className="text-xl">{style.icon}</span>
                            <span className="tracking-wide">{category}</span>
                          </span>
                          
                          {isSelected && (
                            <div className={`
                              absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-3/4 rounded-full
                              bg-gradient-to-r ${style.gradient} animate-pulse
                            `} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Common Fields for All Categories */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></span>
                    Basic Information
                    <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></span>
                  </h3>
                  
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
                      <Label htmlFor="category">Sub-Category</Label>
                      <Input
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        placeholder="DIAMOND PANDENT SET"
                      />
                    </div>
                  </div>
                </div>

                {/* Category-Specific Forms */}
                {formData.product_type === 'Jewellery' && (
                  <JewelleryForm
                    formData={formData}
                    handleChange={handleChange}
                    setFormData={setFormData}
                  />
                )}

                {(formData.product_type === 'Gemstones' || formData.product_type === 'Loose Gemstones') && (
                  <GemstonesForm
                    formData={formData}
                    handleChange={handleChange}
                  />
                )}

                {formData.product_type === 'Loose Diamonds' && (
                  <LooseDiamondsForm
                    formData={formData}
                    handleChange={handleChange}
                  />
                )}

                {/* Pricing Section - Common for All */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></span>
                    Pricing & Stock
                    <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></span>
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cost_price">Cost Price (₹) *</Label>
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
                        placeholder="95000.00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stock_quantity">Stock Quantity</Label>
                    <Input
                      id="stock_quantity"
                      name="stock_quantity"
                      type="number"
                      value={formData.stock_quantity}
                      onChange={handleChange}
                      placeholder="1"
                    />
                  </div>
                </div>

                {/* Images Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></span>
                    Product Images
                    <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></span>
                  </h3>

                  {/* Primary Image */}
                  <div className="space-y-2">
                    <Label>Primary Image *</Label>
                    {formData.image_url ? (
                      <div className="relative group">
                        <img
                          src={formData.image_url}
                          alt="Primary product"
                          className="w-full h-64 object-cover rounded-lg border-2 border-border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage('image_url')}
                          className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type="file"
                          id="image_upload"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file, 'image_url');
                          }}
                          disabled={uploadingImages.image_url}
                        />
                        <label
                          htmlFor="image_upload"
                          className={`
                            flex flex-col items-center justify-center w-full h-64 
                            border-2 border-dashed rounded-lg cursor-pointer
                            bg-muted/50 hover:bg-muted transition-colors
                            ${uploadingImages.image_url ? 'opacity-50 cursor-wait' : 'border-border hover:border-primary'}
                          `}
                        >
                          {uploadingImages.image_url ? (
                            <div className="flex flex-col items-center gap-2">
                              <Loader2 className="h-10 w-10 text-primary animate-spin" />
                              <span className="text-sm text-muted-foreground">Uploading...</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <Upload className="h-10 w-10 text-muted-foreground" />
                              <span className="text-sm font-medium">Click to upload primary image</span>
                              <span className="text-xs text-muted-foreground">PNG, JPG up to 5MB</span>
                            </div>
                          )}
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Additional Images */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Image 2 */}
                    <div className="space-y-2">
                      <Label>Image 2</Label>
                      {formData.image_url_2 ? (
                        <div className="relative group">
                          <img
                            src={formData.image_url_2}
                            alt="Product image 2"
                            className="w-full h-48 object-cover rounded-lg border-2 border-border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage('image_url_2')}
                            className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="relative">
                          <input
                            type="file"
                            id="image_upload_2"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file, 'image_url_2');
                            }}
                            disabled={uploadingImages.image_url_2}
                          />
                          <label
                            htmlFor="image_upload_2"
                            className={`
                              flex flex-col items-center justify-center w-full h-48 
                              border-2 border-dashed rounded-lg cursor-pointer
                              bg-muted/50 hover:bg-muted transition-colors
                              ${uploadingImages.image_url_2 ? 'opacity-50 cursor-wait' : 'border-border hover:border-primary'}
                            `}
                          >
                            {uploadingImages.image_url_2 ? (
                              <Loader2 className="h-8 w-8 text-primary animate-spin" />
                            ) : (
                              <div className="flex flex-col items-center gap-1">
                                <Upload className="h-8 w-8 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Upload image</span>
                              </div>
                            )}
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Image 3 */}
                    <div className="space-y-2">
                      <Label>Image 3</Label>
                      {formData.image_url_3 ? (
                        <div className="relative group">
                          <img
                            src={formData.image_url_3}
                            alt="Product image 3"
                            className="w-full h-48 object-cover rounded-lg border-2 border-border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage('image_url_3')}
                            className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="relative">
                          <input
                            type="file"
                            id="image_upload_3"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file, 'image_url_3');
                            }}
                            disabled={uploadingImages.image_url_3}
                          />
                          <label
                            htmlFor="image_upload_3"
                            className={`
                              flex flex-col items-center justify-center w-full h-48 
                              border-2 border-dashed rounded-lg cursor-pointer
                              bg-muted/50 hover:bg-muted transition-colors
                              ${uploadingImages.image_url_3 ? 'opacity-50 cursor-wait' : 'border-border hover:border-primary'}
                            `}
                          >
                            {uploadingImages.image_url_3 ? (
                              <Loader2 className="h-8 w-8 text-primary animate-spin" />
                            ) : (
                              <div className="flex flex-col items-center gap-1">
                                <Upload className="h-8 w-8 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Upload image</span>
                              </div>
                            )}
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delivery Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></span>
                    Delivery
                    <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></span>
                  </h3>

                  <div className="space-y-3">
                    <Label>Delivery Type</Label>
                    <RadioGroup
                      value={formData.delivery_type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, delivery_type: value })
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="immediate delivery" id="immediate" />
                        <Label htmlFor="immediate">Immediate Delivery</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dispatches in" id="scheduled" />
                        <Label htmlFor="scheduled">Scheduled Delivery</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {formData.delivery_type === "dispatches in" && (
                    <div className="space-y-2">
                      <Label htmlFor="dispatches_in_days">Dispatch in (days)</Label>
                      <Input
                        id="dispatches_in_days"
                        name="dispatches_in_days"
                        type="number"
                        value={formData.dispatches_in_days}
                        onChange={handleChange}
                        placeholder="3"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full h-12 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? "Adding Product..." : "Add Product"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ApprovalGuard>
  );
};

export default AddProduct;
