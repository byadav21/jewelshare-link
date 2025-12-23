import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { 
  FileText, 
  Image, 
  MessageSquare,
  Mail,
  Users,
  TrendingUp,
  BarChart3,
  ShieldCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardStats {
  blogPosts: number;
  publishedPosts: number;
  brands: number;
  pendingComments: number;
  activeSubscribers: number;
  totalVendors: number;
  pendingApprovals: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    blogPosts: 0,
    publishedPosts: 0,
    brands: 0,
    pendingComments: 0,
    activeSubscribers: 0,
    totalVendors: 0,
    pendingApprovals: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [
        { data: blogPosts },
        { data: brands },
        { data: comments },
        { data: subscribers },
        { data: permissions },
        { data: approvals }
      ] = await Promise.all([
        supabase.from("blog_posts").select("id, published"),
        supabase.from("brands").select("id"),
        supabase.from("blog_comments").select("id").eq("status", "pending"),
        supabase.from("newsletter_subscribers").select("id").eq("is_active", true),
        supabase.from("vendor_permissions").select("id"),
        supabase.from("user_approval_status").select("id").eq("status", "pending"),
      ]);

      setStats({
        blogPosts: blogPosts?.length || 0,
        publishedPosts: blogPosts?.filter(p => p.published).length || 0,
        brands: brands?.length || 0,
        pendingComments: comments?.length || 0,
        activeSubscribers: subscribers?.length || 0,
        totalVendors: permissions?.length || 0,
        pendingApprovals: approvals?.length || 0,
      });
    } catch (error) {
      console.error("Failed to fetch stats", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Blog Posts",
      value: stats.blogPosts,
      description: `${stats.publishedPosts} published`,
      icon: FileText,
      link: "/admin/blog",
      color: "text-blue-500",
    },
    {
      title: "Brand Logos",
      value: stats.brands,
      description: "Active brands",
      icon: Image,
      link: "/admin/brands",
      color: "text-purple-500",
    },
    {
      title: "Pending Comments",
      value: stats.pendingComments,
      description: "Needs moderation",
      icon: MessageSquare,
      link: "/admin/comments",
      color: "text-orange-500",
    },
    {
      title: "Newsletter Subscribers",
      value: stats.activeSubscribers,
      description: "Active subscribers",
      icon: Mail,
      link: "/admin/newsletter",
      color: "text-green-500",
    },
    {
      title: "Total Vendors",
      value: stats.totalVendors,
      description: "Registered vendors",
      icon: Users,
      link: "/vendor-management",
      color: "text-indigo-500",
    },
    {
      title: "Pending Approvals",
      value: stats.pendingApprovals,
      description: "Needs review",
      icon: ShieldCheck,
      link: "/vendor-approvals",
      color: "text-red-500",
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-pulse">Loading dashboard...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your platform's content and activity
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {statCards.map((stat) => (
            <Card 
              key={stat.title} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(stat.link)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/analytics-dashboard")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Analytics Dashboard
              </CardTitle>
              <CardDescription>
                View detailed analytics and engagement metrics
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/audit-logs")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Audit Logs
              </CardTitle>
              <CardDescription>
                Track admin actions and system changes
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
