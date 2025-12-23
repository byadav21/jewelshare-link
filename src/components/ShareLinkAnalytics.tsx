import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, TrendingUp, Users, Package } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ShareLinkAnalyticsProps {
  shareLinkId: string;
  viewCount: number;
}

export const ShareLinkAnalytics = ({ shareLinkId, viewCount }: ShareLinkAnalyticsProps) => {
  const [loading, setLoading] = useState(true);
  const [viewsOverTime, setViewsOverTime] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [totalProductViews, setTotalProductViews] = useState(0);

  useEffect(() => {
    fetchAnalytics();
  }, [shareLinkId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch views over time (last 7 days)
      const sevenDaysAgo = subDays(new Date(), 7);
      
      const { data: productViews, error } = await supabase
        .from("share_link_product_views")
        .select("viewed_at, product_id, products(name, image_url)")
        .eq("share_link_id", shareLinkId)
        .gte("viewed_at", sevenDaysAgo.toISOString());

      if (error) throw error;

      // Process views over time
      const viewsByDay: Record<string, number> = {};
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        const dateKey = format(date, "MMM dd");
        viewsByDay[dateKey] = 0;
        return dateKey;
      });

      productViews?.forEach((view) => {
        const dateKey = format(new Date(view.viewed_at), "MMM dd");
        if (dateKey in viewsByDay) {
          viewsByDay[dateKey]++;
        }
      });

      const viewsData = last7Days.map((date) => ({
        date,
        views: viewsByDay[date] || 0,
      }));

      setViewsOverTime(viewsData);

      // Process top products
      const productCounts: Record<string, { count: number; name: string; image: string | null }> = {};
      productViews?.forEach((view) => {
        const productData = view.products as any;
        if (productData && view.product_id) {
          if (!productCounts[view.product_id]) {
            productCounts[view.product_id] = {
              count: 0,
              name: productData.name || "Unknown Product",
              image: productData.image_url || null,
            };
          }
          productCounts[view.product_id].count++;
        }
      });

      const topProductsData = Object.entries(productCounts)
        .map(([id, data]) => ({
          id,
          name: data.name,
          image: data.image,
          views: data.count,
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

      setTopProducts(topProductsData);
      setTotalProductViews(productViews?.length || 0);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Catalog Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{viewCount}</div>
            <p className="text-xs text-muted-foreground">Total link opens</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Product Views</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProductViews}</div>
            <p className="text-xs text-muted-foreground">Individual product views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {viewCount > 0 ? ((totalProductViews / viewCount) * 100).toFixed(1) : "0"}%
            </div>
            <p className="text-xs text-muted-foreground">Products per visit</p>
          </CardContent>
        </Card>
      </div>

      {/* Views Over Time Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Views Over Time (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={viewsOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="views"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Products */}
      {topProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Most Viewed Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-4">
                  <Badge variant="secondary" className="min-w-[2rem] justify-center">
                    {index + 1}
                  </Badge>
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-12 w-12 object-cover rounded-md"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.views} views</p>
                  </div>
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${(product.views / topProducts[0].views) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
