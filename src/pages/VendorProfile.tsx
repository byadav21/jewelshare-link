import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ApprovalGuard } from "@/components/ApprovalGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MediaUpload } from "@/components/MediaUpload";
import { LogoUpload } from "@/components/LogoUpload";
import { toast } from "sonner";
import { ArrowLeft, Upload, Palette, Bell } from "lucide-react";
import { PushNotificationToggle } from "@/components/PushNotificationToggle";

const brandThemes = {
  elegant: {
    name: "Elegant",
    description: "Sophisticated purple and gold palette",
    primary: "#6B21A8",
    secondary: "#D97706",
  },
  modern: {
    name: "Modern",
    description: "Fresh blue and cyan tones",
    primary: "#0EA5E9",
    secondary: "#06B6D4",
  },
  classic: {
    name: "Classic",
    description: "Timeless navy and burgundy",
    primary: "#1E3A8A",
    secondary: "#991B1B",
  },
  luxury: {
    name: "Luxury",
    description: "Premium gold and black elegance",
    primary: "#D4AF37",
    secondary: "#1a1a1a",
  },
  minimalist: {
    name: "Minimalist",
    description: "Clean grayscale simplicity",
    primary: "#4B5563",
    secondary: "#9CA3AF",
  },
  vibrant: {
    name: "Vibrant",
    description: "Bold and energetic colors",
    primary: "#EC4899",
    secondary: "#8B5CF6",
  },
};

const VendorProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<{ instagram?: boolean; whatsapp?: boolean }>({});
  const [selectedTheme, setSelectedTheme] = useState<string>("custom");
  const [formData, setFormData] = useState({
    business_name: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    email: "",
    phone: "",
    whatsapp_number: "",
    instagram_qr_url: "",
    whatsapp_qr_url: "",
    logo_url: "",
    business_story: "",
    certifications: [] as string[],
    awards: [] as string[],
    making_charges_per_gram: "",
    primary_brand_color: "#4F46E5",
    secondary_brand_color: "#8B5CF6",
    brand_tagline: "",
  });

  useEffect(() => {
    fetchVendorProfile();
  }, []);

  const fetchVendorProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("vendor_profiles" as any)
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        const profile = data as any;
        setFormData({
          business_name: profile.business_name || "",
          address_line1: profile.address_line1 || "",
          address_line2: profile.address_line2 || "",
          city: profile.city || "",
          state: profile.state || "",
          pincode: profile.pincode || "",
          country: profile.country || "",
          email: profile.email || "",
          phone: profile.phone || "",
          whatsapp_number: profile.whatsapp_number || "",
          instagram_qr_url: profile.instagram_qr_url || "",
          whatsapp_qr_url: profile.whatsapp_qr_url || "",
          logo_url: profile.logo_url || "",
          business_story: profile.business_story || "",
          certifications: profile.certifications || [],
          awards: profile.awards || [],
          making_charges_per_gram: profile.making_charges_per_gram || "",
          primary_brand_color: profile.primary_brand_color || "#4F46E5",
          secondary_brand_color: profile.secondary_brand_color || "#8B5CF6",
          brand_tagline: profile.brand_tagline || "",
        });
        setSelectedTheme(profile.brand_theme || "custom");
      }
    } catch (error: any) {
      toast.error("Failed to load vendor profile");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("vendor_profiles" as any)
        .upsert({
          user_id: user.id,
          ...formData,
          brand_theme: selectedTheme,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast.success("Vendor profile saved!");
    } catch (error: any) {
      toast.error(error.message || "Failed to save vendor profile");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, type: 'instagram' | 'whatsapp') => {
    try {
      setUploading({ ...uploading, [type]: true });
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${type}-qr-${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('vendor-qr-codes')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('vendor-qr-codes')
        .getPublicUrl(fileName);

      setFormData({
        ...formData,
        [type === 'instagram' ? 'instagram_qr_url' : 'whatsapp_qr_url']: publicUrl,
      });

      toast.success(`${type === 'instagram' ? 'Instagram' : 'WhatsApp'} QR code uploaded!`);
    } catch (error: any) {
      toast.error(`Failed to upload QR code: ${error.message}`);
    } finally {
      setUploading({ ...uploading, [type]: false });
    }
  };

  return (
    <ApprovalGuard>
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Catalog
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-serif">Vendor Profile</CardTitle>
              <p className="text-muted-foreground">
                This information will be displayed in your shared catalogs
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Brand Logo</Label>
                    <LogoUpload
                      onUploadComplete={(url) => setFormData({ ...formData, logo_url: url })}
                      currentImage={formData.logo_url}
                    />
                    <p className="text-xs text-muted-foreground">
                      Automatically cropped and optimized to 500×500px WebP format. Your logo will appear on PDF invoices and shared catalogs.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business_name">Business Name *</Label>
                    <Input
                      id="business_name"
                      value={formData.business_name}
                      onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                      placeholder="GEMHUB"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="contact@gemhub.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp_number">WhatsApp Number *</Label>
                    <Input
                      id="whatsapp_number"
                      type="tel"
                      value={formData.whatsapp_number}
                      onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                      placeholder="+919876543210 (with country code, no spaces)"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter with country code, no spaces (e.g., +919876543210)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address_line1">Address Line 1 *</Label>
                    <Input
                      id="address_line1"
                      value={formData.address_line1}
                      onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                      placeholder="Building, Street"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address_line2">Address Line 2</Label>
                    <Input
                      id="address_line2"
                      value={formData.address_line2}
                      onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                      placeholder="Area, Landmark"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Mumbai"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="Maharashtra"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input
                        id="pincode"
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        placeholder="400001"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="India"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="making_charges_per_gram">Making Charges per Gram (₹)</Label>
                    <Input
                      id="making_charges_per_gram"
                      type="number"
                      step="0.01"
                      value={formData.making_charges_per_gram}
                      onChange={(e) => setFormData({ ...formData, making_charges_per_gram: e.target.value })}
                      placeholder="150"
                    />
                    <p className="text-xs text-muted-foreground">
                      This will be used to auto-calculate making charges for jewelry products
                    </p>
                  </div>

                  <div className="border-t pt-6 space-y-4">
                    <h3 className="text-lg font-semibold">Brand Story & Credentials</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="business_story">Business Story</Label>
                      <Textarea
                        id="business_story"
                        value={formData.business_story}
                        onChange={(e) => setFormData({ ...formData, business_story: e.target.value })}
                        placeholder="Tell your brand's story..."
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Certifications</Label>
                      {formData.certifications.map((cert, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={cert}
                            onChange={(e) => {
                              const newCerts = [...formData.certifications];
                              newCerts[index] = e.target.value;
                              setFormData({ ...formData, certifications: newCerts });
                            }}
                            placeholder="e.g., ISO 9001:2015"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              const newCerts = formData.certifications.filter((_, i) => i !== index);
                              setFormData({ ...formData, certifications: newCerts });
                            }}
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFormData({ ...formData, certifications: [...formData.certifications, ""] })}
                      >
                        Add Certification
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Awards & Recognition</Label>
                      {formData.awards.map((award, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={award}
                            onChange={(e) => {
                              const newAwards = [...formData.awards];
                              newAwards[index] = e.target.value;
                              setFormData({ ...formData, awards: newAwards });
                            }}
                            placeholder="e.g., Best Jeweler 2023"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              const newAwards = formData.awards.filter((_, i) => i !== index);
                              setFormData({ ...formData, awards: newAwards });
                            }}
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFormData({ ...formData, awards: [...formData.awards, ""] })}
                      >
                        Add Award
                      </Button>
                    </div>
                  </div>

                  <div className="border-t pt-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <Palette className="w-5 h-5" />
                      <h3 className="text-lg font-semibold">Brand Customization for Estimates</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Choose a preset theme or customize your own brand colors
                    </p>
                    
                    <div>
                      <Label className="text-sm font-medium mb-3 block">
                        Choose a Brand Theme
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                        {Object.entries(brandThemes).map(([key, theme]) => (
                          <div
                            key={key}
                            onClick={() => {
                              setSelectedTheme(key);
                              setFormData({
                                ...formData,
                                primary_brand_color: theme.primary,
                                secondary_brand_color: theme.secondary,
                              });
                            }}
                            className={`cursor-pointer rounded-lg border-2 p-4 transition-all hover:scale-105 ${
                              selectedTheme === key
                                ? "border-primary shadow-lg ring-2 ring-primary/20"
                                : "border-border hover:border-primary/50"
                            }`}
                            style={{
                              background: `linear-gradient(135deg, ${theme.primary}15, ${theme.secondary}15)`,
                            }}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div
                                className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                                style={{ backgroundColor: theme.primary }}
                              />
                              <div
                                className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                                style={{ backgroundColor: theme.secondary }}
                              />
                            </div>
                            <p className="font-semibold text-sm">{theme.name}</p>
                            <p className="text-xs text-muted-foreground">{theme.description}</p>
                          </div>
                        ))}
                        <div
                          onClick={() => setSelectedTheme("custom")}
                          className={`cursor-pointer rounded-lg border-2 p-4 transition-all hover:scale-105 ${
                            selectedTheme === "custom"
                              ? "border-primary shadow-lg ring-2 ring-primary/20"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Palette className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <p className="font-semibold text-sm">Custom</p>
                          <p className="text-xs text-muted-foreground">Pick your own colors</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="brand_tagline">Brand Tagline</Label>
                      <Input
                        id="brand_tagline"
                        value={formData.brand_tagline}
                        onChange={(e) => setFormData({ ...formData, brand_tagline: e.target.value })}
                        placeholder="e.g., Crafting Excellence Since 1985"
                      />
                      <p className="text-xs text-muted-foreground">
                        This will appear on your estimate PDFs below your business name
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="primary_brand_color">Primary Brand Color</Label>
                        <div className="flex gap-2 items-center">
                          <Input
                            id="primary_brand_color"
                            type="color"
                            value={formData.primary_brand_color}
                            onChange={(e) => {
                              setFormData({ ...formData, primary_brand_color: e.target.value });
                              setSelectedTheme("custom");
                            }}
                            className="w-20 h-10"
                          />
                          <Input
                            type="text"
                            value={formData.primary_brand_color}
                            onChange={(e) => {
                              setFormData({ ...formData, primary_brand_color: e.target.value });
                              setSelectedTheme("custom");
                            }}
                            placeholder="#4F46E5"
                            className="flex-1"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Used for headers and primary accents in PDFs
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="secondary_brand_color">Secondary Brand Color</Label>
                        <div className="flex gap-2 items-center">
                          <Input
                            id="secondary_brand_color"
                            type="color"
                            value={formData.secondary_brand_color}
                            onChange={(e) => {
                              setFormData({ ...formData, secondary_brand_color: e.target.value });
                              setSelectedTheme("custom");
                            }}
                            className="w-20 h-10"
                          />
                          <Input
                            type="text"
                            value={formData.secondary_brand_color}
                            onChange={(e) => {
                              setFormData({ ...formData, secondary_brand_color: e.target.value });
                              setSelectedTheme("custom");
                            }}
                            placeholder="#8B5CF6"
                            className="flex-1"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Used for secondary elements and highlights
                        </p>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg bg-muted/30">
                      <p className="text-sm font-medium mb-2">Preview</p>
                      <div className="flex gap-2">
                        <div 
                          className="w-16 h-16 rounded border" 
                          style={{ backgroundColor: formData.primary_brand_color }}
                        />
                        <div 
                          className="w-16 h-16 rounded border" 
                          style={{ backgroundColor: formData.secondary_brand_color }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6 space-y-4">
                    <h3 className="text-lg font-semibold">QR Codes</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="instagram_qr">Instagram QR Code</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          id="instagram_qr"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, 'instagram');
                          }}
                          disabled={uploading.instagram}
                        />
                        {uploading.instagram && <span className="text-sm">Uploading...</span>}
                      </div>
                      {formData.instagram_qr_url && (
                        <img src={formData.instagram_qr_url} alt="Instagram QR" className="w-32 h-32 object-cover mt-2" />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="whatsapp_qr">WhatsApp QR Code</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          id="whatsapp_qr"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, 'whatsapp');
                          }}
                          disabled={uploading.whatsapp}
                        />
                        {uploading.whatsapp && <span className="text-sm">Uploading...</span>}
                      </div>
                      {formData.whatsapp_qr_url && (
                        <img src={formData.whatsapp_qr_url} alt="WhatsApp QR" className="w-32 h-32 object-cover mt-2" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    <h3 className="text-lg font-semibold">Notification Settings</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Get instant alerts when customers show interest in your products
                  </p>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <PushNotificationToggle showLabel={true} />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Saving..." : "Save Vendor Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ApprovalGuard>
  );
};

export default VendorProfile;
