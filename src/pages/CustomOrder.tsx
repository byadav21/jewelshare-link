import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, X } from "lucide-react";
import { customOrderSchema } from "@/lib/validations";

const CustomOrder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    metal_type: "",
    gemstone_preference: "",
    design_description: "",
    budget_range: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Limit to 5 files
    if (uploadedImages.length + files.length > 5) {
      toast({
        title: "Too many files",
        description: "You can upload up to 5 reference images or videos",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const newFileUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file size (max 20MB for videos, 5MB for images)
        const maxSize = file.type.startsWith('video/') ? 20 * 1024 * 1024 : 5 * 1024 * 1024;
        if (file.size > maxSize) {
          toast({
            title: "File too large",
            description: `${file.name} is larger than ${file.type.startsWith('video/') ? '20MB' : '5MB'}`,
            variant: "destructive",
          });
          continue;
        }

        // Validate file type (images and videos only)
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          toast({
            title: "Invalid file type",
            description: `${file.name} must be an image or video`,
            variant: "destructive",
          });
          continue;
        }

        // Upload to Supabase storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `custom-orders/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('vendor-qr-codes')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('vendor-qr-codes')
          .getPublicUrl(filePath);

        newFileUrls.push(publicUrl);
      }

      setUploadedImages([...uploadedImages, ...newFileUrls]);
      toast({
        title: "Success",
        description: `${newFileUrls.length} file(s) uploaded successfully`,
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validation = customOrderSchema.safeParse(formData);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      toast({
        title: "Validation Error",
        description: firstError.message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("custom_orders").insert({
      customer_name: validation.data.customer_name,
      customer_email: validation.data.customer_email,
      customer_phone: validation.data.customer_phone || null,
      metal_type: validation.data.metal_type || null,
      gemstone_preference: validation.data.gemstone_preference || null,
      design_description: validation.data.design_description,
      budget_range: validation.data.budget_range || null,
      reference_images: uploadedImages.length > 0 ? uploadedImages : null,
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit your request. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success!",
      description: "Your custom order request has been submitted. We'll contact you soon!",
    });

    setFormData({
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      metal_type: "",
      gemstone_preference: "",
      design_description: "",
      budget_range: "",
    });
    setUploadedImages([]);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Catalog
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Build Your Custom Jewelry</CardTitle>
            <CardDescription>
              Tell us about your dream piece and we'll bring it to life
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customer_name">
                    Your Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => handleChange("customer_name", e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer_email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="customer_email"
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => handleChange("customer_email", e.target.value)}
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
                  value={formData.customer_phone}
                  onChange={(e) => handleChange("customer_phone", e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="metal_type">Preferred Metal Type</Label>
                  <Select
                    value={formData.metal_type}
                    onValueChange={(value) => handleChange("metal_type", value)}
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
                    value={formData.gemstone_preference}
                    onChange={(e) => handleChange("gemstone_preference", e.target.value)}
                    placeholder="e.g., Diamond, Sapphire, Ruby"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget_range">Budget Range</Label>
                <Select
                  value={formData.budget_range}
                  onValueChange={(value) => handleChange("budget_range", value)}
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
                <Label htmlFor="design_description">
                  Design Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="design_description"
                  value={formData.design_description}
                  onChange={(e) => handleChange("design_description", e.target.value)}
                  placeholder="Describe your ideal piece in detail - style, occasion, any specific features you'd like..."
                  rows={6}
                  required
                />
              </div>

              {/* Reference Images/Videos Upload */}
              <div className="space-y-2">
                <Label htmlFor="reference_images">
                  Reference Images/Videos (Optional)
                </Label>
                <p className="text-sm text-muted-foreground">
                  Upload up to 5 images or videos for design inspiration (max 5MB for images, 20MB for videos)
                </p>
                
                {/* Upload Button */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('reference_images')?.click()}
                    disabled={uploading || uploadedImages.length >= 5}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading ? "Uploading..." : "Upload Files"}
                  </Button>
                  <Input
                    id="reference_images"
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Uploaded Files Preview */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {uploadedImages.map((url, index) => {
                      const isVideo = url.match(/\.(mp4|mov|avi|webm|mkv)(\?|$)/i);
                      return (
                        <div key={index} className="relative group">
                          {isVideo ? (
                            <video
                              src={url}
                              className="w-full h-32 object-cover rounded-lg border border-border"
                              controls
                            />
                          ) : (
                            <img
                              src={url}
                              alt={`Reference ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-border"
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading || uploading}>
                {loading ? "Submitting..." : "Submit Custom Order Request"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomOrder;
