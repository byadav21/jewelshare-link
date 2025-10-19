import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ApprovalGuard } from "@/components/ApprovalGuard";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Users, Package, Share2, Heart, Mail, TrendingUp, DollarSign } from "lucide-react";

interface Stats {
  totalProducts: number;
  totalValue: number;
  teamMembers: number;
  activeShareLinks: number;
  totalShares: number;
  productInterests: number;
  catalogInquiries: number;
  totalViews: number;
}

interface RecentActivity {
  type: 'share' | 'interest' | 'inquiry';
  data: any;
  timestamp: string;
}

export default function SuperAdmin() {
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalValue: 0,
    teamMembers: 0,
    activeShareLinks: 0,
    totalShares: 0,
    productInterests: 0,
    catalogInquiries: 0,
    totalViews: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      toast.error("Access denied. Admin only.");
      navigate("/catalog");
    }
  }, [isAdmin, roleLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
      fetchRecentActivity();
    }
  }, [isAdmin]);

  const fetchStats = async () => {
    try {
      // Fetch products
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("retail_price");

      if (productsError) throw productsError;

      const totalValue = products?.reduce((sum, p) => sum + (p.retail_price || 0), 0) || 0;

      // Fetch team members
      const { data: teamMembers, error: teamError } = await supabase
        .from("user_roles")
        .select("id")
        .eq("role", "team_member");

      if (teamError) throw teamError;

      // Fetch share links
      const { data: shareLinks, error: sharesError } = await supabase
        .from("share_links")
        .select("id, is_active, view_count");

      if (sharesError) throw sharesError;

      const activeShares = shareLinks?.filter(s => s.is_active).length || 0;
      const totalViews = shareLinks?.reduce((sum, s) => sum + (s.view_count || 0), 0) || 0;

      // Fetch product interests
      const { data: interests, error: interestsError } = await supabase
        .from("product_interests")
        .select("id");

      if (interestsError) throw interestsError;

      // Fetch catalog inquiries
      const { data: inquiries, error: inquiriesError } = await supabase
        .from("catalog_inquiries")
        .select("id");

      if (inquiriesError) throw inquiriesError;

      setStats({
        totalProducts: products?.length || 0,
        totalValue,
        teamMembers: teamMembers?.length || 0,
        activeShareLinks: activeShares,
        totalShares: shareLinks?.length || 0,
        productInterests: interests?.length || 0,
        catalogInquiries: inquiries?.length || 0,
        totalViews,
      });
    } catch (error: any) {
      toast.error("Failed to fetch stats");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const activities: RecentActivity[] = [];

      // Recent share links
      const { data: shares } = await supabase
        .from("share_links")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      shares?.forEach(share => {
        activities.push({
          type: 'share',
          data: share,
          timestamp: share.created_at || '',
        });
      });

      // Recent interests
      const { data: interests } = await supabase
        .from("product_interests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      interests?.forEach(interest => {
        activities.push({
          type: 'interest',
          data: interest,
          timestamp: interest.created_at,
        });
      });

      // Recent inquiries
      const { data: inquiries } = await supabase
        .from("catalog_inquiries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      inquiries?.forEach(inquiry => {
        activities.push({
          type: 'inquiry',
          data: inquiry,
          timestamp: inquiry.created_at,
        });
      });

      // Sort by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivity(activities.slice(0, 10));
    } catch (error) {
      console.error("Failed to fetch recent activity", error);
    }
  };

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading admin dashboard...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <ApprovalGuard>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">Manage your jewelry business</p>
              </div>
              <Button variant="outline" onClick={() => navigate("/catalog")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Catalog
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Inventory</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground">products</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stats.totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                <p className="text-xs text-muted-foreground">total retail value</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.teamMembers}</div>
                <p className="text-xs text-muted-foreground">active members</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Share Links</CardTitle>
                <Share2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeShareLinks}</div>
                <p className="text-xs text-muted-foreground">{stats.totalShares} total, {stats.totalViews} views</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Product Interests</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.productInterests}</div>
                <p className="text-xs text-muted-foreground">customer interests</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Catalog Inquiries</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.catalogInquiries}</div>
                <p className="text-xs text-muted-foreground">general inquiries</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.productInterests + stats.catalogInquiries}</div>
                <p className="text-xs text-muted-foreground">customer interactions</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your business operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline" onClick={() => navigate("/vendor-approvals")}>
                  <Users className="mr-2 h-4 w-4" />
                  Vendor Approvals
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => navigate("/team")}>
                  <Users className="mr-2 h-4 w-4" />
                  Manage Team Members
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => navigate("/catalog")}>
                  <Package className="mr-2 h-4 w-4" />
                  View Inventory
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => navigate("/interests")}>
                  <Heart className="mr-2 h-4 w-4" />
                  View Customer Interests
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => navigate("/share")}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Manage Share Links
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => navigate("/add-product")}>
                  <Package className="mr-2 h-4 w-4" />
                  Add New Product
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => navigate("/import")}>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Import Products
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest customer interactions and shares</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No recent activity</p>
                  ) : (
                    recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                        <div className="mt-1">
                          {activity.type === 'share' && <Share2 className="h-4 w-4 text-blue-500" />}
                          {activity.type === 'interest' && <Heart className="h-4 w-4 text-pink-500" />}
                          {activity.type === 'inquiry' && <Mail className="h-4 w-4 text-purple-500" />}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {activity.type === 'share' && 'Share Link Created'}
                              {activity.type === 'interest' && 'Product Interest'}
                              {activity.type === 'inquiry' && 'Catalog Inquiry'}
                            </Badge>
                          </div>
                          <p className="text-sm">
                            {activity.type === 'share' && `Token: ${activity.data.share_token?.substring(0, 8)}...`}
                            {activity.type === 'interest' && `${activity.data.customer_name}`}
                            {activity.type === 'inquiry' && `${activity.data.customer_name} - ${activity.data.customer_email}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ApprovalGuard>
  );
}
