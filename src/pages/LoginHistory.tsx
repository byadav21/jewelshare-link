import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Monitor, AlertTriangle, MapPin, Clock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, formatDistanceToNow } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LoginHistory = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState<string>("all");

  // Fetch login sessions
  const { data: sessions, isLoading } = useQuery({
    queryKey: ["login-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_sessions")
        .select("*")
        .order("last_activity", { ascending: false });

      if (error) throw error;

      // Get user emails from vendor profiles
      const { data: profiles } = await supabase
        .from("vendor_profiles")
        .select("user_id, business_name, email");

      const { data: approvals } = await supabase
        .from("user_approval_status")
        .select("user_id, business_name, email");

      return data?.map((session: any) => ({
        ...session,
        profile: profiles?.find((p: any) => p.user_id === session.user_id),
        approval: approvals?.find((a: any) => a.user_id === session.user_id),
      }));
    },
    enabled: isAdmin,
  });

  // Detect suspicious activity
  const detectSuspicious = (session: any): boolean => {
    // Multiple sessions from same user in short time
    const userSessions = sessions?.filter((s: any) => s.user_id === session.user_id);
    if (userSessions && userSessions.length > 5) return true;

    // Session from unusual location (simplified check)
    // In real app, would check against historical IP patterns
    return false;
  };

  // Filter sessions
  const filteredSessions = useMemo(() => {
    if (!sessions) return [];

    let filtered = sessions;

    // Time filter
    if (timeFilter !== "all") {
      const now = new Date();
      const cutoff = new Date();

      switch (timeFilter) {
        case "today":
          cutoff.setHours(0, 0, 0, 0);
          break;
        case "week":
          cutoff.setDate(cutoff.getDate() - 7);
          break;
        case "month":
          cutoff.setMonth(cutoff.getMonth() - 1);
          break;
      }

      filtered = filtered.filter((s: any) => new Date(s.last_activity) >= cutoff);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((session: any) =>
        session.profile?.business_name?.toLowerCase().includes(query) ||
        session.profile?.email?.toLowerCase().includes(query) ||
        session.approval?.email?.toLowerCase().includes(query) ||
        session.ip_address?.toLowerCase().includes(query) ||
        session.device_info?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [sessions, searchQuery, timeFilter]);

  // Get stats
  const stats = useMemo(() => {
    const uniqueUsers = new Set(sessions?.map((s: any) => s.user_id)).size;
    const suspiciousCount = sessions?.filter((s: any) => detectSuspicious(s)).length || 0;
    const activeToday = sessions?.filter((s: any) => {
      const lastActivity = new Date(s.last_activity);
      const today = new Date();
      return lastActivity.toDateString() === today.toDateString();
    }).length || 0;

    return {
      totalSessions: sessions?.length || 0,
      uniqueUsers,
      suspiciousCount,
      activeToday,
    };
  }, [sessions]);

  if (roleLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAdmin) {
    navigate("/");
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/super-admin")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Monitor className="h-8 w-8" />
            Login History
          </h1>
          <p className="text-muted-foreground mt-1">Monitor vendor login activity and sessions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious Activity</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.suspiciousCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by business name, email, IP, or device..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Login Sessions</CardTitle>
          <CardDescription>
            View all login sessions with device and location information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading sessions...</div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No sessions found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.map((session: any) => {
                    const isSuspicious = detectSuspicious(session);
                    return (
                      <TableRow key={session.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {session.profile?.business_name ||
                                session.approval?.business_name ||
                                "Unknown"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {session.profile?.email || session.approval?.email || "N/A"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>
                              {formatDistanceToNow(new Date(session.last_activity), {
                                addSuffix: true,
                              })}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(session.last_activity), "MMM dd, yyyy HH:mm")}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {session.ip_address || "N/A"}
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-sm">
                          {session.device_info || "Unknown device"}
                        </TableCell>
                        <TableCell>
                          {isSuspicious ? (
                            <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                              <AlertTriangle className="h-3 w-3" />
                              Suspicious
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Normal</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginHistory;
