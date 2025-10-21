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
import { ArrowLeft, Users } from "lucide-react";

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
            <div>
              <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">Manage vendors and approvals</p>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/vendor-approvals")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-primary" />
                  Vendor Approvals
                </CardTitle>
                <CardDescription>Review and approve new vendor applications</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="default">
                  Manage Approvals
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/vendor-management")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-primary" />
                  Vendor Management
                </CardTitle>
                <CardDescription>Manage vendor accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="default">
                  Manage Vendors
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ApprovalGuard>
  );
}
