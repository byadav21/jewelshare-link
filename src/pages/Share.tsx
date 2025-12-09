import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ApprovalGuard } from "@/components/ApprovalGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SocialShareButton } from "@/components/SocialShareButton";
import { ShareStats } from "@/components/ShareStats";
import { ShareLinkQRCode } from "@/components/ShareLinkQRCode";
import { ShareLinkAnalytics } from "@/components/ShareLinkAnalytics";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { ArrowLeft, Copy, ExternalLink, ChevronDown, BarChart3 } from "lucide-react";
import { PlanLimitWarning } from "@/components/PlanLimitWarning";
import { useRewardsSystemLazy } from "@/hooks/useRewardsSystemLazy";

const Share = () => {
  const navigate = useNavigate();
  const { awardPoints } = useRewardsSystemLazy();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [shareLinks, setShareLinks] = useState<any[]>([]);
  const [vendorProfile, setVendorProfile] = useState<any>(null);
  const [expandedAnalytics, setExpandedAnalytics] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    markup_percentage: "",
    markdown_percentage: "",
    expires_at: "",
    show_vendor_details: true,
    shared_categories: ["Jewellery", "Gemstones", "Loose Diamonds"],
  });

  // Fetch all data in parallel on mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setInitialLoading(false);
          return;
        }

        // Parallel fetch for share links and vendor profile
        const [shareLinksResult, vendorProfileResult] = await Promise.all([
          supabase
            .from("share_links")
            .select("*")
            .order("created_at", { ascending: false }),
          supabase
            .from("vendor_profiles")
            .select("business_name")
            .eq("user_id", user.id)
            .maybeSingle()
        ]);

        if (!shareLinksResult.error) {
          setShareLinks(shareLinksResult.data || []);
        }
        
        if (!vendorProfileResult.error && vendorProfileResult.data) {
          setVendorProfile(vendorProfileResult.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const fetchShareLinks = useCallback(async () => {
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
  }, []);

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

      if (formData.shared_categories.length === 0) {
        toast.error("Please select at least one product category to share");
        setLoading(false);
        return;
      }

      // Validate expiration date is in the future
      const expirationDate = new Date(formData.expires_at);
      const now = new Date();
      
      if (expirationDate <= now) {
        toast.error("Expiration date must be in the future");
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
            shared_categories: formData.shared_categories,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Award points for creating share link
      try {
        await awardPoints('share_link_created');
      } catch (pointsError) {
        console.error('Failed to award points:', pointsError);
      }

      toast.success("Share link created successfully! 🎉");
      setFormData({ 
        markup_percentage: "", 
        markdown_percentage: "", 
        expires_at: "", 
        show_vendor_details: true,
        shared_categories: ["Jewellery", "Gemstones", "Loose Diamonds"]
      });
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

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="h-10 w-32 bg-muted animate-pulse rounded mb-6" />
          <Card className="mb-8">
            <CardHeader>
              <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-24 bg-muted animate-pulse rounded" />
              <div className="h-10 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
              {/* Plan Limit Warning */}
              <div className="mb-6">
                <PlanLimitWarning />
              </div>
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
                    min={new Date().toISOString().slice(0, 16)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Set when this catalog link should stop working
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Product Categories to Share *</Label>
                  <div className="space-y-2">
                    {["Jewellery", "Gemstones", "Loose Diamonds"].map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category}`}
                          checked={formData.shared_categories.includes(category)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                shared_categories: [...formData.shared_categories, category],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                shared_categories: formData.shared_categories.filter((c) => c !== category),
                              });
                            }
                          }}
                        />
                        <Label htmlFor={`category-${category}`} className="cursor-pointer font-normal">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select which product types to include in this share link
                  </p>
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
                  {shareLinks.map((link) => {
                    const shareUrl = `${window.location.origin}/shared/${encodeURIComponent(link.share_token)}`;
                    const isExpiringSoon = new Date(link.expires_at).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000;
                    const isAnalyticsExpanded = expandedAnalytics === link.id;
                    
                    return (
                      <Card
                        key={link.id}
                        className="border-border hover:border-primary/30 transition-colors"
                      >
                        <CardContent className="p-4 space-y-3">
                          {/* Viral Stats */}
                          <ShareStats
                            viewCount={link.view_count}
                            isExpiringSoon={isExpiringSoon}
                            showTrending
                          />
                          
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <code className="text-sm bg-muted px-2 py-1 rounded truncate max-w-[200px]">
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
                                  onClick={() => window.open(shareUrl, "_blank")}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                                
                                {/* QR Code */}
                                <ShareLinkQRCode
                                  shareToken={link.share_token}
                                  businessName={vendorProfile?.business_name}
                                />
                                
                                {/* Social Share */}
                                <SocialShareButton
                                  url={shareUrl}
                                  title={vendorProfile?.business_name || "Exclusive Jewelry Collection"}
                                  description="Discover stunning jewelry pieces"
                                />
                              </div>
                              <div className="text-sm text-muted-foreground mt-2">
                                {link.markup_percentage > 0 && `+${link.markup_percentage}% markup`}
                                {link.markdown_percentage > 0 && `-${link.markdown_percentage}% markdown`}
                                {link.markup_percentage === 0 && link.markdown_percentage === 0 && "No price adjustment"}
                                {" • "}
                                Expires: {new Date(link.expires_at).toLocaleString()}
                              </div>
                              <div className="flex gap-1 mt-2 flex-wrap">
                                {link.shared_categories?.map((category: string) => (
                                  <Badge key={category} variant="secondary" className="text-xs">
                                    {category}
                                  </Badge>
                                ))}
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

                          {/* Analytics Section */}
                          <Collapsible
                            open={isAnalyticsExpanded}
                            onOpenChange={() => setExpandedAnalytics(isAnalyticsExpanded ? null : link.id)}
                          >
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full gap-2"
                              >
                                <BarChart3 className="h-4 w-4" />
                                {isAnalyticsExpanded ? "Hide Analytics" : "View Analytics"}
                                <ChevronDown
                                  className={`h-4 w-4 transition-transform ${
                                    isAnalyticsExpanded ? "rotate-180" : ""
                                  }`}
                                />
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-4">
                              <ShareLinkAnalytics
                                shareLinkId={link.id}
                                viewCount={link.view_count}
                              />
                            </CollapsibleContent>
                          </Collapsible>
                        </CardContent>
                      </Card>
                    );
                  })}
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