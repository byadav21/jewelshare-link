import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MediaUpload } from "@/components/MediaUpload";
import { AdminLoadingSkeleton } from "@/components/admin/AdminLoadingSkeleton";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  author_name: string;
  author_role: string | null;
  author_avatar: string | null;
  cover_image: string | null;
  published: boolean;
  published_at: string | null;
  tags: string[] | null;
  category: string | null;
  read_time: number | null;
  created_at: string;
}

export default function AdminBlog() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    author_name: "",
    author_role: "",
    cover_image: "",
    published: false,
    tags: "",
    category: "",
    read_time: 5,
  });

  const { data: posts, isLoading } = useQuery({
    queryKey: ["admin-blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BlogPost[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("blog_posts").insert({
        ...data,
        tags: data.tags ? data.tags.split(",").map((t) => t.trim()) : [],
        published_at: data.published ? new Date().toISOString() : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast.success("Blog post created successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error("Failed to create blog post"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("blog_posts")
        .update({
          ...data,
          tags: data.tags ? data.tags.split(",").map((t) => t.trim()) : [],
          published_at: data.published ? new Date().toISOString() : null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast.success("Blog post updated successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error("Failed to update blog post"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast.success("Blog post deleted successfully");
    },
    onError: () => toast.error("Failed to delete blog post"),
  });

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      author_name: "",
      author_role: "",
      cover_image: "",
      published: false,
      tags: "",
      category: "",
      read_time: 5,
    });
    setEditingPost(null);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content,
      author_name: post.author_name,
      author_role: post.author_role || "",
      cover_image: post.cover_image || "",
      published: post.published || false,
      tags: post.tags?.join(", ") || "",
      category: post.category || "",
      read_time: post.read_time || 5,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPost) {
      updateMutation.mutate({ id: editingPost.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Blog Posts
            </h1>
            <p className="text-muted-foreground mt-1">Manage your blog content</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="shadow-md hover:shadow-lg transition-all">
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPost ? "Edit Blog Post" : "Create Blog Post"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Slug (URL)</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    required
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Excerpt</Label>
                  <Textarea
                    value={formData.excerpt}
                    onChange={(e) =>
                      setFormData({ ...formData, excerpt: e.target.value })
                    }
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Content</Label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    rows={10}
                    required
                    className="mt-1.5"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Author Name</Label>
                    <Input
                      value={formData.author_name}
                      onChange={(e) =>
                        setFormData({ ...formData, author_name: e.target.value })
                      }
                      required
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Author Role</Label>
                    <Input
                      value={formData.author_role}
                      onChange={(e) =>
                        setFormData({ ...formData, author_role: e.target.value })
                      }
                      className="mt-1.5"
                    />
                  </div>
                </div>
                <div>
                  <Label>Cover Image</Label>
                  <div className="mt-1.5">
                    <MediaUpload
                      bucket="blog-images"
                      onUploadComplete={(url) =>
                        setFormData({ ...formData, cover_image: url })
                      }
                      currentImage={formData.cover_image}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Input
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Read Time (minutes)</Label>
                    <Input
                      type="number"
                      value={formData.read_time}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          read_time: parseInt(e.target.value),
                        })
                      }
                      className="mt-1.5"
                    />
                  </div>
                </div>
                <div>
                  <Label>Tags (comma-separated)</Label>
                  <Input
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    placeholder="jewelry, trends, tips"
                    className="mt-1.5"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    checked={formData.published}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, published: checked })
                    }
                  />
                  <Label>Published</Label>
                </div>
                <Button type="submit" className="w-full">
                  {editingPost ? "Update" : "Create"} Post
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <AdminLoadingSkeleton />
        ) : !posts || posts.length === 0 ? (
          <AdminEmptyState
            icon={FileText}
            title="No blog posts yet"
            description="Create your first blog post to start sharing content with your audience"
            actionLabel="Create First Post"
            onAction={() => setIsDialogOpen(true)}
          />
        ) : (
          <div className="grid gap-4">
            {posts.map((post, index) => (
              <Card
                key={post.id}
                className="bg-gradient-card border-border/50 shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-2 flex-1">
                      <CardTitle className="text-xl">{post.title}</CardTitle>
                      <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{post.author_name}</span>
                        {post.category && (
                          <Badge variant="secondary" className="bg-gradient-primary">
                            {post.category}
                          </Badge>
                        )}
                        {post.published ? (
                          <Badge className="bg-success text-success-foreground">Published</Badge>
                        ) : (
                          <Badge variant="outline">Draft</Badge>
                        )}
                        <span className="text-xs">{post.read_time} min read</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(post)}
                        className="hover:bg-primary/10 hover:border-primary transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteMutation.mutate(post.id)}
                        className="hover:shadow-md transition-shadow"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  )}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
