import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ApprovalGuard } from "@/components/ApprovalGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Monitor, Smartphone, Tablet, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useVendorPermissions } from "@/hooks/useVendorPermissions";

interface Session {
  id: string;
  session_id: string;
  device_info: string;
  ip_address: string;
  last_activity: string;
  created_at: string;
}

const ActiveSessions = () => {
  const navigate = useNavigate();
  const { role, loading: roleLoading } = useUserRole();
  const { permissions, loading: permissionsLoading } = useVendorPermissions();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  // Check permissions
  const canView = role === "admin" || role === "team_member" || permissions.can_view_sessions;
  const canManage = role === "admin" || permissions.can_manage_sessions;

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from("user_sessions" as any)
        .select("*")
        .order("last_activity", { ascending: false });

      if (error) throw error;
      setSessions((data as any) || []);
    } catch (error: any) {
      toast.error("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const removeSession = async (sessionId: string) => {
    if (!canManage) {
      toast.error("You don't have permission to manage sessions");
      return;
    }

    try {
      const { error } = await supabase
        .from("user_sessions" as any)
        .delete()
        .eq("id", sessionId);

      if (error) throw error;
      
      toast.success("Session removed successfully");
      fetchSessions();
    } catch (error: any) {
      toast.error("Failed to remove session");
    }
  };

  const getDeviceIcon = (deviceInfo: string) => {
    const info = deviceInfo.toLowerCase();
    if (info.includes("mobile") || info.includes("android") || info.includes("iphone")) {
      return <Smartphone className="h-4 w-4" />;
    }
    if (info.includes("tablet") || info.includes("ipad")) {
      return <Tablet className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  const getDeviceName = (deviceInfo: string) => {
    const info = deviceInfo.toLowerCase();
    if (info.includes("mobile") || info.includes("android")) return "Mobile (Android)";
    if (info.includes("iphone")) return "Mobile (iPhone)";
    if (info.includes("ipad")) return "Tablet (iPad)";
    if (info.includes("mac")) return "Desktop (Mac)";
    if (info.includes("windows")) return "Desktop (Windows)";
    if (info.includes("linux")) return "Desktop (Linux)";
    return "Unknown Device";
  };

  const isCurrentSession = (sessionId: string) => {
    // This would need to be enhanced with actual current session detection
    return false;
  };

  if (roleLoading || permissionsLoading) {
    return (
      <ApprovalGuard>
        <div className="container mx-auto p-6 max-w-6xl">
          <div className="text-center py-12">
            <div className="animate-pulse text-primary">Loading...</div>
          </div>
        </div>
      </ApprovalGuard>
    );
  }

  if (!canView) {
    return (
      <ApprovalGuard>
        <div className="container mx-auto p-6 max-w-6xl">
          <div className="text-center py-12">
            <p className="text-muted-foreground">You don't have permission to view active sessions</p>
            <Button variant="outline" onClick={() => navigate("/")} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Catalog
            </Button>
          </div>
        </div>
      </ApprovalGuard>
    );
  }

  return (
    <ApprovalGuard>
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Active Sessions</h1>
            <p className="text-muted-foreground mt-1">
              Manage your active devices (Maximum 5 devices)
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Catalog
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Devices</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-pulse text-primary">Loading sessions...</div>
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-12">
                <Monitor className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No active sessions found</p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {sessions.length} of 5 devices active
                  </p>
                  {sessions.length >= 5 && (
                    <Badge variant="destructive">Maximum devices reached</Badge>
                  )}
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Device</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Logged In</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getDeviceIcon(session.device_info)}
                            <div>
                              <p className="font-medium">{getDeviceName(session.device_info)}</p>
                              {isCurrentSession(session.session_id) && (
                                <Badge variant="secondary" className="text-xs mt-1">
                                  This device
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {session.ip_address}
                        </TableCell>
                        <TableCell>
                          {new Date(session.last_activity).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {new Date(session.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {canManage ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeSession(session.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          ) : (
                            <span className="text-sm text-muted-foreground">View only</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </ApprovalGuard>
  );
};

export default ActiveSessions;