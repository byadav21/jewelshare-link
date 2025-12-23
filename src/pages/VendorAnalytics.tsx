import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Package, Share2, Users, TrendingUp } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";
import { format, subDays, eachDayOfInterval, startOfDay } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const VendorAnalytics = () => {
  const navigate = useNavigate();
  const { role, loading: roleLoading } = useUserRole();
  const [timeRange, setTimeRange] = useState("30");

  // Fetch vendor's usage trends
  const { data: usageTrends, isLoading } = useQuery({
    queryKey: ["vendor-usage-trends", timeRange],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const days = parseInt(timeRange);
      const startDate = startOfDay(subDays(new Date(), days));

      // Get products added over time
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("created_at")
        .eq("user_id", user.id)
        .gte("created_at", startDate.toISOString())
        .is("deleted_at", null);

      if (productsError) throw productsError;

      // Get share links created over time
      const { data: shareLinks, error: linksError } = await supabase
        .from("share_links")
        .select("created_at")
        .eq("user_id", user.id)
        .gte("created_at", startDate.toISOString());

      if (linksError) throw linksError;

      // Get team members invited over time
      const { data: teamMembers, error: teamError } = await supabase
        .from("user_roles")
        .select("created_at")
        .gte("created_at", startDate.toISOString());

      if (teamError) throw teamError;

      // Create date range
      const dateRange = eachDayOfInterval({
        start: startDate,
        end: new Date(),
      });

      // Group data by date
      const productsByDate = products?.reduce((acc: any, p: any) => {
        const date = format(new Date(p.created_at), "yyyy-MM-dd");
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      const linksByDate = shareLinks?.reduce((acc: any, l: any) => {
        const date = format(new Date(l.created_at), "yyyy-MM-dd");
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      const membersByDate = teamMembers?.reduce((acc: any, m: any) => {
        const date = format(new Date(m.created_at), "yyyy-MM-dd");
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      // Create cumulative data for trends
      let cumulativeProducts = 0;
      let cumulativeLinks = 0;
      let cumulativeMembers = 0;

      const chartData = dateRange.map((date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        cumulativeProducts += productsByDate?.[dateStr] || 0;
        cumulativeLinks += linksByDate?.[dateStr] || 0;
        cumulativeMembers += membersByDate?.[dateStr] || 0;

        return {
          date: format(date, "MMM dd"),
          products: productsByDate?.[dateStr] || 0,
          shareLinks: linksByDate?.[dateStr] || 0,
          teamMembers: membersByDate?.[dateStr] || 0,
          cumulativeProducts,
          cumulativeLinks,
          cumulativeMembers,
        };
      });

      // Calculate summary stats
      const totalProducts = products?.length || 0;
      const totalShareLinks = shareLinks?.length || 0;
      const totalTeamMembers = teamMembers?.length || 0;

      return {
        chartData,
        summary: {
          totalProducts,
          totalShareLinks,
          totalTeamMembers,
        },
      };
    },
    enabled: !roleLoading && !!role,
  });

  if (roleLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Usage Analytics</h1>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products Added</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : usageTrends?.summary.totalProducts}
            </div>
            <p className="text-xs text-muted-foreground">Last {timeRange} days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Share Links Created</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : usageTrends?.summary.totalShareLinks}
            </div>
            <p className="text-xs text-muted-foreground">Last {timeRange} days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members Invited</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : usageTrends?.summary.totalTeamMembers}
            </div>
            <p className="text-xs text-muted-foreground">Last {timeRange} days</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Daily Activity
          </CardTitle>
          <CardDescription>Daily breakdown of products, share links, and team invites</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading chart data...</div>
          ) : (
            <ChartContainer
              config={{
                products: {
                  label: "Products",
                  color: "hsl(var(--chart-1))",
                },
                shareLinks: {
                  label: "Share Links",
                  color: "hsl(var(--chart-2))",
                },
                teamMembers: {
                  label: "Team Members",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usageTrends?.chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="products" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="shareLinks" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="teamMembers" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Cumulative Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Cumulative Growth Trends</CardTitle>
          <CardDescription>Total cumulative growth over time</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading chart data...</div>
          ) : (
            <ChartContainer
              config={{
                cumulativeProducts: {
                  label: "Total Products",
                  color: "hsl(var(--chart-1))",
                },
                cumulativeLinks: {
                  label: "Total Share Links",
                  color: "hsl(var(--chart-2))",
                },
                cumulativeMembers: {
                  label: "Total Team Members",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={usageTrends?.chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="cumulativeProducts"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="cumulativeLinks"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="cumulativeMembers"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorAnalytics;
