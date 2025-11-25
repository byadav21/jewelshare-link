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
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MediaUpload } from "@/components/MediaUpload";

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
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Press Releases</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
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
                  />
                </div>
                <div>
                  <Label>Subtitle</Label>
                  <Input
                    value={formData.subtitle}
                    onChange={(e) =>
                      setFormData({ ...formData, subtitle: e.target.value })
                    }
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
                    />
                  </div>
                </div>
                <div>
                  <Label>Publication Logo</Label>
                  <MediaUpload
                    bucket="press-media"
                    onUploadComplete={(url) =>
                      setFormData({ ...formData, publication_logo: url })
                    }
                    currentImage={formData.publication_logo}
                  />
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
                  />
                </div>
                <div className="flex items-center space-x-2">
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
          <div>Loading...</div>
        ) : (
          <div className="grid gap-4">
            {releases?.map((release) => (
              <Card key={release.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle>{release.title}</CardTitle>
                      <div className="flex gap-2 items-center text-sm text-muted-foreground">
                        {release.publication && <span>{release.publication}</span>}
                        <span>
                          {new Date(release.published_date).toLocaleDateString()}
                        </span>
                        {release.featured && <Badge>Featured</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {release.external_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
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
                <CardContent>
                  {release.subtitle && (
                    <p className="text-sm font-medium mb-2">{release.subtitle}</p>
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-3">
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
