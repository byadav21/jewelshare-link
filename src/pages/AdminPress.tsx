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
import { Plus, Pencil, Trash2, ExternalLink, Newspaper } from "lucide-react";
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

interface PressRelease {
  id: string;
  title: string;
  subtitle: string | null;
  content: string;
  publication: string | null;
  publication_logo: string | null;
  external_url: string | null;
  published_date: string;
  featured: boolean;
  created_at: string;
}

export default function AdminPress() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRelease, setEditingRelease] = useState<PressRelease | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    content: "",
    publication: "",
    publication_logo: "",
    external_url: "",
    published_date: new Date().toISOString().split("T")[0],
    featured: false,
  });

  const { data: releases, isLoading } = useQuery({
    queryKey: ["admin-press"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("press_releases")
        .select("*")
        .order("published_date", { ascending: false });
      if (error) throw error;
      return data as PressRelease[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("press_releases").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-press"] });
      toast.success("Press release created successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error("Failed to create press release"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("press_releases")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-press"] });
      toast.success("Press release updated successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error("Failed to update press release"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("press_releases")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-press"] });
      toast.success("Press release deleted successfully");
    },
    onError: () => toast.error("Failed to delete press release"),
  });

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      content: "",
      publication: "",
      publication_logo: "",
      external_url: "",
      published_date: new Date().toISOString().split("T")[0],
      featured: false,
    });
    setEditingRelease(null);
  };

  const handleEdit = (release: PressRelease) => {
    setEditingRelease(release);
    setFormData({
      title: release.title,
      subtitle: release.subtitle || "",
      content: release.content,
      publication: release.publication || "",
      publication_logo: release.publication_logo || "",
      external_url: release.external_url || "",
      published_date: release.published_date,
      featured: release.featured || false,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRelease) {
      updateMutation.mutate({ id: editingRelease.id, data: formData });
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
              Press Releases
            </h1>
            <p className="text-muted-foreground mt-1">Manage press coverage and media mentions</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="shadow-md hover:shadow-lg transition-all">
                <Plus className="h-4 w-4 mr-2" />
                New Release
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingRelease ? "Edit Press Release" : "Create Press Release"}
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
                  <Label>Subtitle</Label>
                  <Input
                    value={formData.subtitle}
                    onChange={(e) =>
                      setFormData({ ...formData, subtitle: e.target.value })
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
                    rows={8}
                    required
                    className="mt-1.5"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Publication</Label>
                    <Input
                      value={formData.publication}
                      onChange={(e) =>
                        setFormData({ ...formData, publication: e.target.value })
                      }
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Published Date</Label>
                    <Input
                      type="date"
                      value={formData.published_date}
                      onChange={(e) =>
                        setFormData({ ...formData, published_date: e.target.value })
                      }
                      required
                      className="mt-1.5"
                    />
                  </div>
                </div>
                <div>
                  <Label>Publication Logo</Label>
                  <div className="mt-1.5">
                    <MediaUpload
                      bucket="press-media"
                      onUploadComplete={(url) =>
                        setFormData({ ...formData, publication_logo: url })
                      }
                      currentImage={formData.publication_logo}
                    />
                  </div>
                </div>
                <div>
                  <Label>External URL</Label>
                  <Input
                    type="url"
                    value={formData.external_url}
                    onChange={(e) =>
                      setFormData({ ...formData, external_url: e.target.value })
                    }
                    placeholder="https://..."
                    className="mt-1.5"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    checked={formData.featured}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, featured: checked })
                    }
                  />
                  <Label>Featured</Label>
                </div>
                <Button type="submit" className="w-full">
                  {editingRelease ? "Update" : "Create"} Release
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <AdminLoadingSkeleton />
        ) : !releases || releases.length === 0 ? (
          <AdminEmptyState
            icon={Newspaper}
            title="No press releases yet"
            description="Add press releases to showcase your media coverage and announcements"
            actionLabel="Create First Release"
            onAction={() => setIsDialogOpen(true)}
          />
        ) : (
          <div className="grid gap-4">
            {releases.map((release, index) => (
              <Card
                key={release.id}
                className="bg-gradient-card border-border/50 shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-2 flex-1">
                      <CardTitle className="text-xl">{release.title}</CardTitle>
                      <div className="flex flex-wrap gap-2 items-center text-sm">
                        {release.publication && (
                          <span className="font-medium text-foreground">{release.publication}</span>
                        )}
                        <span className="text-muted-foreground">
                          {new Date(release.published_date).toLocaleDateString()}
                        </span>
                        {release.featured && (
                          <Badge className="bg-gradient-primary">Featured</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {release.external_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="hover:bg-primary/10 hover:border-primary transition-colors"
                        >
                          <a href={release.external_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(release)}
                        className="hover:bg-primary/10 hover:border-primary transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteMutation.mutate(release.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {release.subtitle && (
                    <p className="text-sm font-medium text-foreground/80">{release.subtitle}</p>
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {release.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
