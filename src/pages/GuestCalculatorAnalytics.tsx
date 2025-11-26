import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/AdminLayout";
import { BarChart, Users, Calculator, TrendingUp, Clock, Globe } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UsageHeatMap from "@/components/UsageHeatMap";

interface UsageStats {
  totalUses: number;
  manufacturingUses: number;
  diamondUses: number;
  uniqueIPs: number;
  last24Hours: number;
  last7Days: number;
}

interface TopIP {
  ip_address: string;
  usage_count: number;
  calculator_type: string;
  first_used: string;
  last_used: string;
}

interface DailyUsage {
  date: string;
  manufacturing: number;
  diamond: number;
  total: number;
}

interface GeographicData {
  country: string;
  country_code: string;
  usage_count: number;
  manufacturing: number;
  diamond: number;
  top_cities: Array<{ city: string; count: number }>;
}

const GuestCalculatorAnalytics = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UsageStats>({
    totalUses: 0,
    manufacturingUses: 0,
    diamondUses: 0,
    uniqueIPs: 0,
    last24Hours: 0,
    last7Days: 0,
  });
  const [topIPs, setTopIPs] = useState<TopIP[]>([]);
  const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([]);
  const [geographicData, setGeographicData] = useState<GeographicData[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch all usage records
      const { data: allUsage, error } = await supabase
        .from("guest_calculator_usage")
        .select("*")
        .order("used_at", { ascending: false });

      if (error) throw error;

      if (!allUsage) {
        setLoading(false);
        return;
      }

      // Calculate stats
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const manufacturingUses = allUsage.filter(u => u.calculator_type === "manufacturing").length;
      const diamondUses = allUsage.filter(u => u.calculator_type === "diamond").length;
      const uniqueIPs = new Set(allUsage.map(u => u.ip_address)).size;
      const last24Hours = allUsage.filter(u => new Date(u.used_at) > last24h).length;
      const last7Days = allUsage.filter(u => new Date(u.used_at) > last7d).length;

      setStats({
        totalUses: allUsage.length,
        manufacturingUses,
        diamondUses,
        uniqueIPs,
        last24Hours,
        last7Days,
      });

      // Calculate top IPs
      const ipUsage = new Map<string, { count: number; type: string; first: string; last: string }>();
      
      allUsage.forEach(usage => {
        const existing = ipUsage.get(usage.ip_address);
        if (existing) {
          existing.count++;
          if (new Date(usage.used_at) > new Date(existing.last)) {
            existing.last = usage.used_at;
          }
          if (new Date(usage.used_at) < new Date(existing.first)) {
            existing.first = usage.used_at;
          }
        } else {
          ipUsage.set(usage.ip_address, {
            count: 1,
            type: usage.calculator_type,
            first: usage.used_at,
            last: usage.used_at,
          });
        }
      });

      const topIPsList = Array.from(ipUsage.entries())
        .map(([ip, data]) => ({
          ip_address: ip,
          usage_count: data.count,
          calculator_type: data.type,
          first_used: data.first,
          last_used: data.last,
        }))
        .sort((a, b) => b.usage_count - a.usage_count)
        .slice(0, 20);

      setTopIPs(topIPsList);

      // Calculate daily usage for last 7 days
      const dailyMap = new Map<string, { manufacturing: number; diamond: number }>();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        dailyMap.set(dateStr, { manufacturing: 0, diamond: 0 });
      }

      allUsage
        .filter(u => new Date(u.used_at) > last7d)
        .forEach(usage => {
          const dateStr = new Date(usage.used_at).toISOString().split('T')[0];
          const existing = dailyMap.get(dateStr);
          if (existing) {
            if (usage.calculator_type === "manufacturing") {
              existing.manufacturing++;
            } else {
              existing.diamond++;
            }
          }
        });

      const dailyUsageList = Array.from(dailyMap.entries())
        .map(([date, counts]) => ({
          date,
          manufacturing: counts.manufacturing,
          diamond: counts.diamond,
          total: counts.manufacturing + counts.diamond,
        }));

      setDailyUsage(dailyUsageList);

      // Calculate geographic distribution
      const countryMap = new Map<string, {
        country: string;
        country_code: string;
        manufacturing: number;
        diamond: number;
        cities: Map<string, number>;
      }>();

      allUsage
        .filter(u => u.country) // Only include entries with geolocation data
        .forEach(usage => {
          const existing = countryMap.get(usage.country);
          if (existing) {
            existing.manufacturing += usage.calculator_type === "manufacturing" ? 1 : 0;
            existing.diamond += usage.calculator_type === "diamond" ? 1 : 0;
            if (usage.city) {
              const cityCount = existing.cities.get(usage.city) || 0;
              existing.cities.set(usage.city, cityCount + 1);
            }
          } else {
            const cities = new Map<string, number>();
            if (usage.city) {
              cities.set(usage.city, 1);
            }
            countryMap.set(usage.country, {
              country: usage.country,
              country_code: usage.country_code || "",
              manufacturing: usage.calculator_type === "manufacturing" ? 1 : 0,
              diamond: usage.calculator_type === "diamond" ? 1 : 0,
              cities,
            });
          }
        });

      const geoList = Array.from(countryMap.entries())
        .map(([_, data]) => {
          const topCities = Array.from(data.cities.entries())
            .map(([city, count]) => ({ city, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);

          return {
            country: data.country,
            country_code: data.country_code,
            usage_count: data.manufacturing + data.diamond,
            manufacturing: data.manufacturing,
            diamond: data.diamond,
            top_cities: topCities,
          };
        })
        .sort((a, b) => b.usage_count - a.usage_count)
        .slice(0, 15);

      setGeographicData(geoList);

    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Guest Calculator Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Track guest calculator usage patterns and identify conversion opportunities
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Guest Uses</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUses}</div>
              <p className="text-xs text-muted-foreground">
                {stats.last24Hours} in last 24 hours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique IP Addresses</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uniqueIPs}</div>
              <p className="text-xs text-muted-foreground">
                Individual guest users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last 7 Days</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.last7Days}</div>
              <p className="text-xs text-muted-foreground">
                Weekly usage trend
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Calculator Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Calculator Usage Breakdown</CardTitle>
            <CardDescription>Distribution by calculator type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="font-medium">Manufacturing Cost Estimator</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{stats.manufacturingUses}</div>
                  <div className="text-xs text-muted-foreground">
                    {stats.totalUses > 0 ? Math.round((stats.manufacturingUses / stats.totalUses) * 100) : 0}%
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="font-medium">Diamond Calculator</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{stats.diamondUses}</div>
                  <div className="text-xs text-muted-foreground">
                    {stats.totalUses > 0 ? Math.round((stats.diamondUses / stats.totalUses) * 100) : 0}%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="top-users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="top-users">Top Users</TabsTrigger>
            <TabsTrigger value="daily-usage">Daily Usage</TabsTrigger>
            <TabsTrigger value="geographic">Geographic</TabsTrigger>
          </TabsList>

          <TabsContent value="top-users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Users by IP Address</CardTitle>
                <CardDescription>
                  Users approaching or exceeding the 5-use limit are prime conversion targets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Usage Count</TableHead>
                      <TableHead>Primary Calculator</TableHead>
                      <TableHead>First Used</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topIPs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No guest usage data available
                        </TableCell>
                      </TableRow>
                    ) : (
                      topIPs.map((ip) => (
                        <TableRow key={ip.ip_address}>
                          <TableCell className="font-mono text-sm">{ip.ip_address}</TableCell>
                          <TableCell>
                            <div className="font-bold">{ip.usage_count}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={ip.calculator_type === "manufacturing" ? "default" : "secondary"}>
                              {ip.calculator_type === "manufacturing" ? "Manufacturing" : "Diamond"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{formatTime(ip.first_used)}</TableCell>
                          <TableCell className="text-sm">{formatTime(ip.last_used)}</TableCell>
                          <TableCell>
                            {ip.usage_count >= 5 ? (
                              <Badge variant="destructive">Limit Reached</Badge>
                            ) : ip.usage_count >= 3 ? (
                              <Badge variant="default" className="bg-orange-500">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                High Potential
                              </Badge>
                            ) : (
                              <Badge variant="outline">Active</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="daily-usage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Daily Usage (Last 7 Days)</CardTitle>
                <CardDescription>Guest calculator usage trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dailyUsage.map((day) => (
                    <div key={day.date} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{formatDate(day.date)}</span>
                        <span className="text-muted-foreground">{day.total} uses</span>
                      </div>
                      <div className="flex gap-2 h-8">
                        {day.manufacturing > 0 && (
                          <div
                            className="bg-blue-500 rounded flex items-center justify-center text-xs text-white font-medium"
                            style={{ width: `${(day.manufacturing / (day.total || 1)) * 100}%` }}
                            title={`Manufacturing: ${day.manufacturing}`}
                          >
                            {day.manufacturing}
                          </div>
                        )}
                        {day.diamond > 0 && (
                          <div
                            className="bg-purple-500 rounded flex items-center justify-center text-xs text-white font-medium"
                            style={{ width: `${(day.diamond / (day.total || 1)) * 100}%` }}
                            title={`Diamond: ${day.diamond}`}
                          >
                            {day.diamond}
                          </div>
                        )}
                        {day.total === 0 && (
                          <div className="w-full bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                            No usage
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="geographic" className="space-y-4">
            {geographicData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    World Usage Heat Map
                  </CardTitle>
                  <CardDescription>
                    Visual representation of calculator usage intensity by region
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UsageHeatMap data={geographicData} />
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">Usage Intensity:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(var(--muted))" }} />
                        <span className="text-xs text-muted-foreground">Low</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(210 80% 65%)" }} />
                        <span className="text-xs text-muted-foreground">Medium</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(210 80% 25%)" }} />
                        <span className="text-xs text-muted-foreground">High</span>
                      </div>
                    </div>
                    <span className="text-muted-foreground">
                      Hover over countries to see usage details
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Geographic Distribution
                </CardTitle>
                <CardDescription>
                  Calculator usage by country and region - identify expansion opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                {geographicData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No geographic data available yet. Location tracking started recently.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Country</TableHead>
                        <TableHead>Total Uses</TableHead>
                        <TableHead>Manufacturing</TableHead>
                        <TableHead>Diamond</TableHead>
                        <TableHead>Top Cities</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {geographicData.map((geo, index) => (
                        <TableRow key={geo.country_code || index}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {geo.country_code && (
                                <span className="text-2xl">
                                  {String.fromCodePoint(
                                    ...[...geo.country_code.toUpperCase()].map(
                                      c => 127397 + c.charCodeAt(0)
                                    )
                                  )}
                                </span>
                              )}
                              <span className="font-medium">{geo.country}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-bold">{geo.usage_count}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="default" className="bg-blue-500">
                              {geo.manufacturing}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-purple-500 text-white">
                              {geo.diamond}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {geo.top_cities.length > 0 ? (
                                geo.top_cities.map((city, i) => (
                                  <div key={i}>
                                    {city.city} ({city.count})
                                  </div>
                                ))
                              ) : (
                                <span className="text-xs">N/A</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Engagement Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Engagement Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold mb-2">High-Potential Conversion Targets</h4>
              <p className="text-sm text-muted-foreground">
                {topIPs.filter(ip => ip.usage_count >= 3 && ip.usage_count < 5).length} users have used calculators 3-4 times.
                These users are highly engaged and close to the limit - prime candidates for conversion campaigns.
              </p>
            </div>
            
            <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
              <h4 className="font-semibold mb-2">Blocked Users</h4>
              <p className="text-sm text-muted-foreground">
                {topIPs.filter(ip => ip.usage_count >= 5).length} users have reached the 5-use limit.
                Consider targeted email campaigns or remarketing to convert these blocked users into registered customers.
              </p>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-semibold mb-2">Calculator Preference</h4>
              <p className="text-sm text-muted-foreground">
                {stats.manufacturingUses > stats.diamondUses 
                  ? `Manufacturing Cost Estimator is more popular (${Math.round((stats.manufacturingUses / stats.totalUses) * 100)}% of uses). Consider promoting this calculator more prominently.`
                  : stats.diamondUses > stats.manufacturingUses
                  ? `Diamond Calculator is more popular (${Math.round((stats.diamondUses / stats.totalUses) * 100)}% of uses). Consider promoting this calculator more prominently.`
                  : "Both calculators have equal usage. Maintain balanced promotion strategy."
                }
              </p>
            </div>

            {geographicData.length > 0 && (
              <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Geographic Insights
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Top market: <strong>{geographicData[0]?.country}</strong> with {geographicData[0]?.usage_count} uses.
                  {geographicData.length > 1 && (
                    <> Emerging markets: {geographicData.slice(1, 4).map(g => g.country).join(", ")}.</>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  Consider localization, regional marketing, or partnerships in high-usage countries to maximize conversion potential.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default GuestCalculatorAnalytics;
