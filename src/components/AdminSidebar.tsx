import { useState, useEffect } from "react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Settings,
  FileText,
  Image,
  MessageSquare,
  Mail,
  Users,
  Shield,
  Crown,
  Bookmark,
  Monitor,
  Search,
  TrendingUp,
  Database,
  FileDown,
  History,
  LogOut,
  LayoutDashboard,
  Newspaper,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

const contentManagementItems = [
  { title: "Site Settings", url: "/admin/settings", icon: Settings },
  { title: "Blog Posts", url: "/admin/blog", icon: FileText },
  { title: "Brand Logos", url: "/admin/brands", icon: Image },
  { title: "Comments", url: "/admin/comments", icon: MessageSquare },
  { title: "Newsletter", url: "/admin/newsletter", icon: Mail },
  { title: "Press Releases", url: "/admin/press", icon: Newspaper },
];

const vendorManagementItems = [
  { title: "Vendor Approvals", url: "/vendor-approvals", icon: Users },
  { title: "Vendor Management", url: "/vendor-management", icon: Shield },
  { title: "Plan Management", url: "/plan-management", icon: Crown },
  { title: "Permission Presets", url: "/permission-presets", icon: Bookmark },
];

const systemItems = [
  { title: "Active Sessions", url: "/active-sessions", icon: Monitor },
  { title: "Global Search", url: "/global-search", icon: Search },
  { title: "Customer Database", url: "/customer-database", icon: Database },
  { title: "Analytics", url: "/analytics-dashboard", icon: TrendingUp },
  { title: "Audit Logs", url: "/audit-logs", icon: Shield },
  { title: "Export Reports", url: "/export-reports", icon: FileDown },
  { title: "Login History", url: "/login-history", icon: History },
];

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [notificationCounts, setNotificationCounts] = useState({
    comments: 0,
    approvals: 0,
  });

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    fetchNotificationCounts();

    // Subscribe to real-time updates
    const commentsChannel = supabase
      .channel('sidebar-notifications-comments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blog_comments',
          filter: 'status=eq.pending'
        },
        () => fetchNotificationCounts()
      )
      .subscribe();

    const approvalsChannel = supabase
      .channel('sidebar-notifications-approvals')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_approval_status',
          filter: 'status=eq.pending'
        },
        () => fetchNotificationCounts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(approvalsChannel);
    };
  }, []);

  const fetchNotificationCounts = async () => {
    try {
      const [
        { data: comments },
        { data: approvals }
      ] = await Promise.all([
        supabase.from("blog_comments").select("id", { count: 'exact' }).eq("status", "pending"),
        supabase.from("user_approval_status").select("id", { count: 'exact' }).eq("status", "pending"),
      ]);

      setNotificationCounts({
        comments: comments?.length || 0,
        approvals: approvals?.length || 0,
      });
    } catch (error) {
      console.error("Failed to fetch notification counts", error);
    }
  };


  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h2 className="font-bold text-lg">Admin Panel</h2>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Dashboard Overview */}
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/admin" className="hover:bg-muted/50" activeClassName="bg-primary/10 text-primary font-semibold">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Content Management */}
        <SidebarGroup>
          <SidebarGroupLabel>Content Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {contentManagementItems.map((item) => {
                const showBadge = item.title === "Comments" && notificationCounts.comments > 0;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className="hover:bg-muted/50 flex items-center justify-between" activeClassName="bg-primary/10 text-primary font-semibold">
                        <div className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </div>
                        {showBadge && (
                          <Badge variant="destructive" className="ml-auto">
                            {notificationCounts.comments > 9 ? '9+' : notificationCounts.comments}
                          </Badge>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Vendor Management */}
        <SidebarGroup>
          <SidebarGroupLabel>Vendor Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {vendorManagementItems.map((item) => {
                const showBadge = item.title === "Vendor Approvals" && notificationCounts.approvals > 0;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className="hover:bg-muted/50 flex items-center justify-between" activeClassName="bg-primary/10 text-primary font-semibold">
                        <div className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </div>
                        {showBadge && (
                          <Badge variant="destructive" className="ml-auto">
                            {notificationCounts.approvals > 9 ? '9+' : notificationCounts.approvals}
                          </Badge>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* System & Analytics */}
        <SidebarGroup>
          <SidebarGroupLabel>System & Analytics</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className="hover:bg-muted/50" activeClassName="bg-primary/10 text-primary font-semibold">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <Button 
          variant="ghost" 
          className="w-full justify-start" 
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span>Sign Out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
