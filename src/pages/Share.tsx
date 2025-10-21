import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ApprovalGuard } from "@/components/ApprovalGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Copy, ExternalLink } from "lucide-react";

const Share = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [shareLinks, setShareLinks] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    markup_percentage: "",
    markdown_percentage: "",
    expires_at: "",
    show_vendor_details: true,
  });

  useEffect(() => {
    fetchShareLinks();
  }, []);

  const fetchShareLinks = async () => {
    try {
      const { data, error } = await supabase
        .from("share_links")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setShareLinks(data || []);
    } catch (error: any) {
      toast.error("Failed to load share links");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const markup = formData.markup_percentage ? parseFloat(formData.markup_percentage) : 0;
      const markdown = formData.markdown_percentage ? parseFloat(formData.markdown_percentage) : 0;

      if (markup > 0 && markdown > 0) {
        toast.error("Please use either markup or markdown, not both");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("share_links")
        .insert([
          {
            user_id: user.id,
            markup_percentage: markup,
            markdown_percentage: markdown,
            expires_at: formData.expires_at,
            show_vendor_details: formData.show_vendor_details,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast.success("Share link created!");
      setFormData({ markup_percentage: "", markdown_percentage: "", expires_at: "", show_vendor_details: true });
      fetchShareLinks();
    } catch (error: any) {
      toast.error(error.message || "Failed to create share link");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (token: string) => {
    const url = `${window.location.origin}/shared/${encodeURIComponent(token)}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const toggleLinkStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("share_links")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      toast.success(currentStatus ? "Link deactivated" : "Link activated");
      fetchShareLinks();
    } catch (error: any) {
      toast.error("Failed to update link status");
    }
  };

  return (
    <ApprovalGuard>
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Catalog
          </Button>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-3xl font-serif">Create Share Link</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="markup_percentage">Markup % (optional)</Label>
                    <Input
                      id="markup_percentage"
                      name="markup_percentage"
                      type="number"
                      step="0.01"
                      min="0"
                      max="1000"
                      value={formData.markup_percentage}
                      onChange={(e) =>
                        setFormData({ ...formData, markup_percentage: e.target.value, markdown_percentage: "" })
                      }
                      placeholder="10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="markdown_percentage">Markdown % (optional)</Label>
                    <Input
                      id="markdown_percentage"
                      name="markdown_percentage"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.markdown_percentage}
                      onChange={(e) =>
                        setFormData({ ...formData, markdown_percentage: e.target.value, markup_percentage: "" })
                      }
                      placeholder="5"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expires_at">Expiration Date *</Label>
                  <Input
                    id="expires_at"
                    name="expires_at"
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="show_vendor_details"
                      checked={formData.show_vendor_details}
                      onChange={(e) => setFormData({ ...formData, show_vendor_details: e.target.checked })}
                      className="h-4 w-4 rounded border-input"
                    />
                    <Label htmlFor="show_vendor_details" className="cursor-pointer">
                      Show vendor details in shared catalog header
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    When enabled, your business name, contact info, and QR codes will be visible in the shared catalog
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating Link..." : "Create Share Link"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-serif">Your Share Links</CardTitle>
            </CardHeader>
            <CardContent>
              {shareLinks.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No share links yet</p>
              ) : (
                <div className="space-y-4">
                  {shareLinks.map((link) => (
                    <div
                      key={link.id}
                      className="border border-border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                              {link.share_token.substring(0, 20)}...
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(link.share_token)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(`/shared/${encodeURIComponent(link.share_token)}`, "_blank")}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-sm text-muted-foreground mt-2">
                            {link.markup_percentage > 0 && `+${link.markup_percentage}% markup`}
                            {link.markdown_percentage > 0 && `-${link.markdown_percentage}% markdown`}
                            {link.markup_percentage === 0 && link.markdown_percentage === 0 && "No price adjustment"}
                            {" • "}
                            Expires: {new Date(link.expires_at).toLocaleString()}
                            {" • "}
                            Views: {link.view_count}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={link.is_active ? "destructive" : "default"}
                          onClick={() => toggleLinkStatus(link.id, link.is_active)}
                        >
                          {link.is_active ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ApprovalGuard>
  );
};

export default Share;