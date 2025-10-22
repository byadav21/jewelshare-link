import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, Users, Package, Share2, Eye, MessageSquare } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNow } from "date-fns";

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useUserRole();

  // Fetch vendor activity data
  const { data: vendorActivity, isLoading: activityLoading } = useQuery({
    queryKey: ["vendor-activity"],
    queryFn: async () => {
      // Get all vendors with approval status
      const { data: vendors, error: vendorsError } = await supabase
        .from("user_approval_status")
        .select("user_id, business_name, email, status")
        .eq("status", "approved");

      if (vendorsError) throw vendorsError;

      // Get vendor profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("vendor_profiles")
        .select("user_id, business_name");

      if (profilesError) throw profilesError;

      // Get last session activity
      const { data: sessions, error: sessionsError } = await supabase
        .from("user_sessions")
        .select("user_id, last_activity")
        .order("last_activity", { ascending: false });

      if (sessionsError) throw sessionsError;

      // Get product counts (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: recentProducts, error: productsError } = await supabase
        .from("products")
        .select("user_id, created_at")
        .gte("created_at", thirtyDaysAgo.toISOString())
        .is("deleted_at", null);

      if (productsError) throw productsError;

      // Get share link stats
      const { data: shareLinks, error: linksError } = await supabase
        .from("share_links")
        .select("user_id, view_count, created_at");

      if (linksError) throw linksError;

      // Process data
      const productCounts = recentProducts?.reduce((acc: any, p: any) => {
        acc[p.user_id] = (acc[p.user_id] || 0) + 1;
        return acc;
      }, {});

      const shareLinkStats = shareLinks?.reduce((acc: any, link: any) => {
        if (!acc[link.user_id]) {
          acc[link.user_id] = { count: 0, totalViews: 0 };
        }
        acc[link.user_id].count++;
        acc[link.user_id].totalViews += link.view_count || 0;
        return acc;
      }, {});

      const lastActivity = sessions?.reduce((acc: any, session: any) => {
        if (!acc[session.user_id] || new Date(session.last_activity) > new Date(acc[session.user_id])) {
          acc[session.user_id] = session.last_activity;
        }
        return acc;
      }, {});

      return vendors?.map((vendor: any) => ({
        ...vendor,
        businessName: profiles?.find((p: any) => p.user_id === vendor.user_id)?.business_name || vendor.business_name,
        lastActivity: lastActivity[vendor.user_id],
        productsAddedThisMonth: productCounts?.[vendor.user_id] || 0,
        shareLinks: shareLinkStats?.[vendor.user_id]?.count || 0,
        totalViews: shareLinkStats?.[vendor.user_id]?.totalViews || 0,
      })).sort((a: any, b: any) => {
        if (!a.lastActivity) return 1;
        if (!b.lastActivity) return -1;
        return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
      });
    },
    enabled: isAdmin,
  });

  // Fetch customer engagement metrics
  const { data: engagementMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["engagement-metrics"],
    queryFn: async () => {
      const { data: interests, error: interestsError } = await supabase
        .from("product_interests")
        .select("product_id, created_at");

      if (interestsError) throw interestsError;

      const { data: inquiries, error: inquiriesError } = await supabase
        .from("catalog_inquiries")
        .select("created_at");

      if (inquiriesError) throw inquiriesError;

      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, name, sku")
        .is("deleted_at", null);

      if (productsError) throw productsError;

      // Calculate most inquired products
      const productInterestCounts = interests?.reduce((acc: any, interest: any) => {
        acc[interest.product_id] = (acc[interest.product_id] || 0) + 1;
        return acc;
      }, {});

      const topProducts = Object.entries(productInterestCounts || {})
        .map(([productId, count]: [string, any]) => {
          const product = products?.find((p: any) => p.id === productId);
          return {
            productId,
            name: product?.name || "Unknown",
            sku: product?.sku,
            interestCount: count,
          };
        })
        .sort((a, b) => b.interestCount - a.interestCount)
        .slice(0, 10);

      return {
        totalInterests: interests?.length || 0,
        totalInquiries: inquiries?.length || 0,
        conversionRate: products?.length ? ((interests?.length || 0) / products.length * 100).toFixed(2) : 0,
        topProducts,
      };
    },
    enabled: isAdmin,
  });

  if (roleLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAdmin) {
    navigate("/");
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/super-admin")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Activity Analytics</h1>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interests</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? "..." : engagementMetrics?.totalInterests}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? "..." : engagementMetrics?.totalInquiries}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activityLoading ? "..." : vendorActivity?.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interest Rate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? "..." : `${engagementMetrics?.conversionRate}%`}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Activity Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Activity</CardTitle>
          <CardDescription>Monitor vendor engagement and productivity</CardDescription>
        </CardHeader>
        <CardContent>
          {activityLoading ? (
            <div className="text-center py-8">Loading vendor activity...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Products Added (30d)</TableHead>
                    <TableHead>Share Links</TableHead>
                    <TableHead>Total Views</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendorActivity?.map((vendor: any) => (
                    <TableRow key={vendor.user_id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{vendor.businessName || "N/A"}</div>
                          <div className="text-sm text-muted-foreground">{vendor.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {vendor.lastActivity ? (
                          <div className="text-sm">
                            <div>{formatDistanceToNow(new Date(vendor.lastActivity), { addSuffix: true })}</div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(vendor.lastActivity), "MMM dd, yyyy HH:mm")}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{vendor.productsAddedThisMonth}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{vendor.shareLinks}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{vendor.totalViews}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Most Inquired Products
          </CardTitle>
          <CardDescription>Products with the highest customer interest</CardDescription>
        </CardHeader>
        <CardContent>
          {metricsLoading ? (
            <div className="text-center py-8">Loading metrics...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Interest Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {engagementMetrics?.topProducts?.map((product: any, index: number) => (
                    <TableRow key={product.productId}>
                      <TableCell>
                        <Badge variant={index < 3 ? "default" : "outline"}>#{index + 1}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.sku || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{product.interestCount}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
