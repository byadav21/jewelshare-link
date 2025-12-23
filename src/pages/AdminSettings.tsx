import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Save, Settings as SettingsIcon, Loader2 } from "lucide-react";

const AdminSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    whatsapp_number: "",
    contact_email: "",
    contact_phone: "",
    company_name: "",
    company_address: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("*");

      if (error) throw error;

      const settingsMap: Record<string, string> = {};
      data?.forEach((setting) => {
        settingsMap[setting.key] = setting.value as string;
      });

      setSettings({
        whatsapp_number: settingsMap.whatsapp_number || "",
        contact_email: settingsMap.contact_email || "",
        contact_phone: settingsMap.contact_phone || "",
        company_name: settingsMap.company_name || "",
        company_address: settingsMap.company_address || "",
      });
    } catch (error: any) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      for (const [key, value] of Object.entries(settings)) {
        const { error } = await supabase
          .from("settings")
          .upsert({
            key,
            value,
            updated_by: user.id,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: "key"
          });

        if (error) throw error;
      }

      toast.success("Settings saved successfully!");
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <AdminLayout>
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4 animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
              <div className="relative bg-gradient-primary rounded-full p-6 shadow-glow mx-auto w-fit">
                <Loader2 className="h-12 w-12 text-primary-foreground animate-spin" />
              </div>
            </div>
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      ) : (
        <div className="p-6 space-y-6 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Site Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure your website's global settings
            </p>
          </div>

          <Card className="bg-gradient-card border-border/50 shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <SettingsIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>
                    Basic details about your business
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={settings.company_name}
                  onChange={(e) => handleChange("company_name", e.target.value)}
                  placeholder="Your Company Name"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="company_address">Company Address</Label>
                <Input
                  id="company_address"
                  value={settings.company_address}
                  onChange={(e) => handleChange("company_address", e.target.value)}
                  placeholder="123 Main Street, City, Country"
                  className="mt-1.5"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50 shadow-md">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                How customers can reach you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) => handleChange("contact_email", e.target.value)}
                  placeholder="contact@example.com"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  type="tel"
                  value={settings.contact_phone}
                  onChange={(e) => handleChange("contact_phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
                <Input
                  id="whatsapp_number"
                  type="tel"
                  value={settings.whatsapp_number}
                  onChange={(e) => handleChange("whatsapp_number", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Include country code (e.g., +1 for US)
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="shadow-md hover:shadow-lg transition-all"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminSettings;
