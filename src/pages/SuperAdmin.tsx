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
import { ArrowLeft, Users, LogOut, Monitor, Search, TrendingUp, Database, Shield, FileDown, History, Settings, Crown } from "lucide-react";

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
      navigate("/auth");
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
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
          <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Super Admin</h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">Manage vendors and approvals</p>
              </div>
              <Button variant="outline" onClick={handleSignOut} size="sm" className="w-full sm:w-auto">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-3 sm:px-6 py-4 sm:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 max-w-6xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer active:scale-[0.98]" onClick={() => navigate("/vendor-approvals")}>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  Vendor Approvals
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Review and approve new vendor applications</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <Button className="w-full h-9 sm:h-10 text-xs sm:text-sm" variant="default">
                  Manage Approvals
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer active:scale-[0.98]" onClick={() => navigate("/vendor-management")}>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  Vendor Management
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Manage vendor accounts</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <Button className="w-full h-9 sm:h-10 text-xs sm:text-sm" variant="default">
                  Manage
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer active:scale-[0.98]" onClick={() => navigate("/admin")}>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                  <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  Content Management
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Manage blog posts, brands, and site settings</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <Button className="w-full h-9 sm:h-10 text-xs sm:text-sm" variant="default">
                  Open Dashboard
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer active:scale-[0.98]" onClick={() => navigate("/active-sessions")}>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                  <Monitor className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  Active Sessions
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Monitor user sessions</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <Button className="w-full h-9 sm:h-10 text-xs sm:text-sm" variant="default">
                  View
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer active:scale-[0.98]" onClick={() => navigate("/global-search")}>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                  <Search className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  Global Search
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Search products & vendors</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <Button className="w-full h-9 sm:h-10 text-xs sm:text-sm" variant="default">
                  Search
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer active:scale-[0.98]" onClick={() => navigate("/customer-database")}>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                  <Database className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  Customers
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Customer interests & inquiries</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <Button className="w-full h-9 sm:h-10 text-xs sm:text-sm" variant="default">
                  View
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer active:scale-[0.98]" onClick={() => navigate("/analytics-dashboard")}>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  Analytics
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Activity & engagement metrics</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <Button className="w-full h-9 sm:h-10 text-xs sm:text-sm" variant="default">
                  View
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer active:scale-[0.98]" onClick={() => navigate("/audit-logs")}>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  Audit Logs
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Track admin actions</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <Button className="w-full h-9 sm:h-10 text-xs sm:text-sm" variant="default">
                  View
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer active:scale-[0.98]" onClick={() => navigate("/export-reports")}>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                  <FileDown className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  Export Reports
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Generate PDF & Excel reports</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <Button className="w-full h-9 sm:h-10 text-xs sm:text-sm" variant="default">
                  Export
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer active:scale-[0.98]" onClick={() => navigate("/login-history")}>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                  <History className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  Login History
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Vendor login activity</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <Button className="w-full h-9 sm:h-10 text-xs sm:text-sm" variant="default">
                  View
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer active:scale-[0.98] border-primary/50 bg-gradient-to-br from-primary/5 to-transparent" onClick={() => navigate("/plan-management")}>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                  <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  Plan Management
                  <Badge variant="secondary" className="ml-auto text-xs">Permissions</Badge>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Manage vendor subscription plans & permissions</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <Button className="w-full h-9 sm:h-10 text-xs sm:text-sm" variant="default">
                  Manage Plans & Access
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ApprovalGuard>
  );
}
