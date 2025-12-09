import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RichTextEditor } from "@/components/RichTextEditor";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Save, FileText, Shield, Cookie, RotateCcw } from "lucide-react";
import {
  DEFAULT_PRIVACY_POLICY,
  DEFAULT_TERMS_OF_SERVICE,
  DEFAULT_COOKIE_POLICY,
} from "@/constants/legalDefaults";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
              setPrivacyPolicy(value || DEFAULT_PRIVACY_POLICY);
              break;
            case "terms_of_service":
              setTermsOfService(value || DEFAULT_TERMS_OF_SERVICE);
              break;
            case "cookie_policy":
              setCookiePolicy(value || DEFAULT_COOKIE_POLICY);
              break;
          }
        });
      }

      // Set defaults if no data exists
      if (!data || data.length === 0) {
        setPrivacyPolicy(DEFAULT_PRIVACY_POLICY);
        setTermsOfService(DEFAULT_TERMS_OF_SERVICE);
        setCookiePolicy(DEFAULT_COOKIE_POLICY);
      } else {
        // Check each individually
        if (!data.find((d) => d.key === "privacy_policy")?.value) {
          setPrivacyPolicy(DEFAULT_PRIVACY_POLICY);
        }
        if (!data.find((d) => d.key === "terms_of_service")?.value) {
          setTermsOfService(DEFAULT_TERMS_OF_SERVICE);
        }
        if (!data.find((d) => d.key === "cookie_policy")?.value) {
          setCookiePolicy(DEFAULT_COOKIE_POLICY);
        }
      }
    } catch (error) {
      toast.error("Failed to load content");
      // Set defaults on error
      setPrivacyPolicy(DEFAULT_PRIVACY_POLICY);
      setTermsOfService(DEFAULT_TERMS_OF_SERVICE);
      setCookiePolicy(DEFAULT_COOKIE_POLICY);
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

  const handleResetToDefault = (key: string) => {
    switch (key) {
      case "privacy_policy":
        setPrivacyPolicy(DEFAULT_PRIVACY_POLICY);
        toast.success("Reset to default. Click Save to apply.");
        break;
      case "terms_of_service":
        setTermsOfService(DEFAULT_TERMS_OF_SERVICE);
        toast.success("Reset to default. Click Save to apply.");
        break;
      case "cookie_policy":
        setCookiePolicy(DEFAULT_COOKIE_POLICY);
        toast.success("Reset to default. Click Save to apply.");
        break;
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
              <span className="hidden sm:inline">Privacy Policy</span>
              <span className="sm:hidden">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="terms" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Terms of Service</span>
              <span className="sm:hidden">Terms</span>
            </TabsTrigger>
            <TabsTrigger value="cookies" className="gap-2">
              <Cookie className="h-4 w-4" />
              <span className="hidden sm:inline">Cookie Policy</span>
              <span className="sm:hidden">Cookies</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Policy</CardTitle>
                <CardDescription>
                  Edit your privacy policy content using the rich text editor below.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RichTextEditor
                  content={privacyPolicy}
                  onChange={setPrivacyPolicy}
                />
                <div className="flex gap-2">
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
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset to Default
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reset to Default?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will replace the current content with the default template.
                          You will need to save to apply the changes.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleResetToDefault("privacy_policy")}>
                          Reset
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="terms">
            <Card>
              <CardHeader>
                <CardTitle>Terms of Service</CardTitle>
                <CardDescription>
                  Edit your terms of service content using the rich text editor below.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RichTextEditor
                  content={termsOfService}
                  onChange={setTermsOfService}
                />
                <div className="flex gap-2">
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
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset to Default
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reset to Default?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will replace the current content with the default template.
                          You will need to save to apply the changes.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleResetToDefault("terms_of_service")}>
                          Reset
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cookies">
            <Card>
              <CardHeader>
                <CardTitle>Cookie Policy</CardTitle>
                <CardDescription>
                  Edit your cookie policy content using the rich text editor below.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RichTextEditor
                  content={cookiePolicy}
                  onChange={setCookiePolicy}
                />
                <div className="flex gap-2">
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
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset to Default
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reset to Default?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will replace the current content with the default template.
                          You will need to save to apply the changes.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleResetToDefault("cookie_policy")}>
                          Reset
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminLegalPages;
