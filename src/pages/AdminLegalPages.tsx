import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Save, FileText, Shield, Cookie } from "lucide-react";

const AdminLegalPages = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [privacyPolicy, setPrivacyPolicy] = useState("");
  const [termsOfService, setTermsOfService] = useState("");
  const [cookiePolicy, setCookiePolicy] = useState("");

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("settings")
        .select("key, value")
        .in("key", ["privacy_policy", "terms_of_service", "cookie_policy"]);

      if (data) {
        data.forEach((item) => {
          const value = typeof item.value === "string" ? item.value : "";
          switch (item.key) {
            case "privacy_policy":
              setPrivacyPolicy(value);
              break;
            case "terms_of_service":
              setTermsOfService(value);
              break;
            case "cookie_policy":
              setCookiePolicy(value);
              break;
          }
        });
      }
    } catch (error) {
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key: string, value: string) => {
    setSaving(key);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("settings")
        .upsert({
          key,
          value: value,
          updated_at: new Date().toISOString(),
          updated_by: user?.id,
        }, { onConflict: "key" });

      if (error) throw error;
      toast.success("Content saved successfully");
    } catch (error) {
      toast.error("Failed to save content");
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Legal Pages</h1>
          <p className="text-muted-foreground">
            Manage Privacy Policy, Terms of Service, and Cookie Policy content
          </p>
        </div>

        <Tabs defaultValue="privacy" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="privacy" className="gap-2">
              <Shield className="h-4 w-4" />
              Privacy Policy
            </TabsTrigger>
            <TabsTrigger value="terms" className="gap-2">
              <FileText className="h-4 w-4" />
              Terms of Service
            </TabsTrigger>
            <TabsTrigger value="cookies" className="gap-2">
              <Cookie className="h-4 w-4" />
              Cookie Policy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Policy</CardTitle>
                <CardDescription>
                  Edit your privacy policy content. HTML is supported for formatting.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={privacyPolicy}
                  onChange={(e) => setPrivacyPolicy(e.target.value)}
                  placeholder="Enter your privacy policy content here... (HTML supported)"
                  className="min-h-[400px] font-mono text-sm"
                />
                <Button
                  onClick={() => handleSave("privacy_policy", privacyPolicy)}
                  disabled={saving === "privacy_policy"}
                >
                  {saving === "privacy_policy" ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Privacy Policy
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="terms">
            <Card>
              <CardHeader>
                <CardTitle>Terms of Service</CardTitle>
                <CardDescription>
                  Edit your terms of service content. HTML is supported for formatting.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={termsOfService}
                  onChange={(e) => setTermsOfService(e.target.value)}
                  placeholder="Enter your terms of service content here... (HTML supported)"
                  className="min-h-[400px] font-mono text-sm"
                />
                <Button
                  onClick={() => handleSave("terms_of_service", termsOfService)}
                  disabled={saving === "terms_of_service"}
                >
                  {saving === "terms_of_service" ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Terms of Service
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cookies">
            <Card>
              <CardHeader>
                <CardTitle>Cookie Policy</CardTitle>
                <CardDescription>
                  Edit your cookie policy content. HTML is supported for formatting.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={cookiePolicy}
                  onChange={(e) => setCookiePolicy(e.target.value)}
                  placeholder="Enter your cookie policy content here... (HTML supported)"
                  className="min-h-[400px] font-mono text-sm"
                />
                <Button
                  onClick={() => handleSave("cookie_policy", cookiePolicy)}
                  disabled={saving === "cookie_policy"}
                >
                  {saving === "cookie_policy" ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Cookie Policy
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminLegalPages;
