import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MediaUpload } from "@/components/MediaUpload";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { 
  Settings, 
  FileText, 
  Image, 
  Newspaper, 
  MessageSquare,
  Mail,
  Save,
  Trash2,
  Plus,
  CheckCircle,
  XCircle,
  ArrowLeft,
  BarChart3
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { role, loading: roleLoading } = useUserRole();
  const [loading, setLoading] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState<any>({});
  
  // Blog posts state
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  
  // Brands state
  const [brands, setBrands] = useState<any[]>([]);
  
  // Comments state
  const [comments, setComments] = useState<any[]>([]);
  
  // Newsletter subscribers
  const [subscribers, setSubscribers] = useState<any[]>([]);

  useEffect(() => {
    if (!roleLoading && role !== "admin") {
      navigate("/");
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
    }
  }, [role, roleLoading, navigate, toast]);

  useEffect(() => {
    if (role === "admin") {
      fetchAllData();
    }
  }, [role]);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchSettings(),
      fetchBlogPosts(),
      fetchBrands(),
      fetchComments(),
      fetchSubscribers(),
    ]);
    setLoading(false);
  };

  const fetchSettings = async () => {
    const { data } = await supabase.from("settings").select("*");
    if (data) {
      const settingsObj = data.reduce((acc: any, item: any) => {
        acc[item.key] = item.value;
        return acc;
      }, {});
      setSettings(settingsObj);
    }
  };

  const fetchBlogPosts = async () => {
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setBlogPosts(data);
  };

  const fetchBrands = async () => {
    const { data } = await supabase
      .from("brands")
      .select("*")
      .order("display_order");
    if (data) setBrands(data);
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from("blog_comments")
      .select("*, blog_posts(title)")
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setComments(data);
  };

  const fetchSubscribers = async () => {
    const { data } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("subscribed_at", { ascending: false });
    if (data) setSubscribers(data);
  };

  const updateSetting = async (key: string, value: string) => {
    const { error } = await supabase
      .from("settings")
      .update({ value: JSON.stringify(value) })
      .eq("key", key);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Setting updated successfully" });
      fetchSettings();
    }
  };

  const moderateComment = async (id: string, status: string) => {
    const { error } = await supabase
      .from("blog_comments")
      .update({ status, moderated_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      toast({ title: "Success", description: `Comment ${status}` });
      fetchComments();
    }
  };

  const toggleSubscriber = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from("newsletter_subscribers")
      .update({ is_active: !isActive })
      .eq("id", id);

    if (!error) {
      toast({ title: "Success", description: "Subscriber status updated" });
      fetchSubscribers();
    }
  };

  if (roleLoading || loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (role !== "admin") return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Site
            </Button>
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your content and settings</p>
          </div>
        </div>

        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="blog">
              <FileText className="mr-2 h-4 w-4" />
              Blog Posts
            </TabsTrigger>
            <TabsTrigger value="brands">
              <Image className="mr-2 h-4 w-4" />
              Brands
            </TabsTrigger>
            <TabsTrigger value="comments">
              <MessageSquare className="mr-2 h-4 w-4" />
              Comments
            </TabsTrigger>
            <TabsTrigger value="newsletter">
              <Mail className="mr-2 h-4 w-4" />
              Newsletter
            </TabsTrigger>
          </TabsList>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Site Settings</CardTitle>
                <CardDescription>Manage global site configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>WhatsApp Number</Label>
                    <div className="flex gap-2">
                      <Input
                        value={settings.whatsapp_number || ""}
                        onChange={(e) =>
                          setSettings({ ...settings, whatsapp_number: e.target.value })
                        }
                        placeholder="1234567890"
                      />
                      <Button
                        onClick={() =>
                          updateSetting("whatsapp_number", settings.whatsapp_number)
                        }
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Contact Email</Label>
                    <div className="flex gap-2">
                      <Input
                        value={settings.contact_email || ""}
                        onChange={(e) =>
                          setSettings({ ...settings, contact_email: e.target.value })
                        }
                        placeholder="support@example.com"
                      />
                      <Button
                        onClick={() =>
                          updateSetting("contact_email", settings.contact_email)
                        }
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Contact Phone</Label>
                    <div className="flex gap-2">
                      <Input
                        value={settings.contact_phone || ""}
                        onChange={(e) =>
                          setSettings({ ...settings, contact_phone: e.target.value })
                        }
                        placeholder="+1 (555) 123-4567"
                      />
                      <Button
                        onClick={() =>
                          updateSetting("contact_phone", settings.contact_phone)
                        }
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <div className="flex gap-2">
                      <Input
                        value={settings.company_name || ""}
                        onChange={(e) =>
                          setSettings({ ...settings, company_name: e.target.value })
                        }
                        placeholder="Company Name"
                      />
                      <Button
                        onClick={() =>
                          updateSetting("company_name", settings.company_name)
                        }
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blog Posts Tab */}
          <TabsContent value="blog">
            <Card>
              <CardHeader>
                <CardTitle>Blog Posts Management</CardTitle>
                <CardDescription>
                  Manage blog posts - {blogPosts.length} total posts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blogPosts.map((post) => (
                        <TableRow key={post.id}>
                          <TableCell className="font-medium">{post.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{post.category}</Badge>
                          </TableCell>
                          <TableCell>{post.author_name}</TableCell>
                          <TableCell>
                            <Badge variant={post.published ? "default" : "secondary"}>
                              {post.published ? "Published" : "Draft"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(post.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Brands Tab */}
          <TabsContent value="brands">
            <Card>
              <CardHeader>
                <CardTitle>Brand Logos</CardTitle>
                <CardDescription>
                  Manage featured brand logos - {brands.length} brands
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {brands.map((brand) => (
                      <Card key={brand.id}>
                        <CardContent className="p-4">
                          <img
                            src={brand.logo_url}
                            alt={brand.name}
                            className="mb-4 h-20 w-full object-contain"
                          />
                          <p className="text-center font-medium">{brand.name}</p>
                          <div className="mt-2 flex items-center justify-center gap-2">
                            <Badge variant={brand.active ? "default" : "secondary"}>
                              {brand.active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments">
            <Card>
              <CardHeader>
                <CardTitle>Comment Moderation</CardTitle>
                <CardDescription>
                  Review and moderate blog comments - {comments.filter(c => c.status === 'pending').length} pending
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <Card key={comment.id} className={comment.status === 'pending' ? 'border-category-jewellery' : ''}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="mb-2 flex items-center gap-2">
                                <p className="font-semibold">{comment.author_name}</p>
                                <Badge variant="outline">{comment.status}</Badge>
                              </div>
                              <p className="mb-2 text-sm text-muted-foreground">
                                {comment.author_email}
                              </p>
                              <p className="text-sm">{comment.content}</p>
                              <p className="mt-2 text-xs text-muted-foreground">
                                {new Date(comment.created_at).toLocaleString()}
                              </p>
                            </div>
                            {comment.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => moderateComment(comment.id, 'approved')}
                                >
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => moderateComment(comment.id, 'rejected')}
                                >
                                  <XCircle className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Newsletter Tab */}
          <TabsContent value="newsletter">
            <Card>
              <CardHeader>
                <CardTitle>Newsletter Subscribers</CardTitle>
                <CardDescription>
                  Manage newsletter subscriptions - {subscribers.filter(s => s.is_active).length} active subscribers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Subscribed</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscribers.map((subscriber) => (
                        <TableRow key={subscriber.id}>
                          <TableCell>{subscriber.email}</TableCell>
                          <TableCell>
                            {new Date(subscriber.subscribed_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={subscriber.is_active ? "default" : "secondary"}>
                              {subscriber.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                toggleSubscriber(subscriber.id, subscriber.is_active)
                              }
                            >
                              {subscriber.is_active ? "Deactivate" : "Activate"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Access Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics & Insights
            </CardTitle>
            <CardDescription>View detailed analytics and usage trends</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/vendor-analytics")} className="w-full">
              View Usage Analytics Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;