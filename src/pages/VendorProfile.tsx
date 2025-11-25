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
import { toast } from "sonner";
import { ArrowLeft, Upload } from "lucide-react";

const VendorProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<{ instagram?: boolean; whatsapp?: boolean }>({});
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
        });
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
                    <MediaUpload
                      bucket="brand-logos"
                      onUploadComplete={(url) => setFormData({ ...formData, logo_url: url })}
                      currentImage={formData.logo_url}
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload your brand logo (recommended: square format, min 300x300px)
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
