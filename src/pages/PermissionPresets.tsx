import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminGuard } from "@/components/AdminGuard";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { ArrowLeft, Plus, Edit, Trash2, Bookmark } from "lucide-react";

interface PermissionTemplate {
  id: string;
  name: string;
  description: string | null;
  template_config: {
    can_add_products: boolean;
    can_view_catalog: boolean;
    can_edit_products: boolean;
    can_delete_products: boolean;
    can_share_catalog: boolean;
    can_view_share_links: boolean;
    can_manage_share_links: boolean;
    can_view_interests: boolean;
    can_add_vendor_details: boolean;
    can_edit_profile: boolean;
    can_view_custom_orders: boolean;
    can_manage_custom_orders: boolean;
    can_import_data: boolean;
    can_manage_team: boolean;
    can_view_sessions: boolean;
    can_manage_sessions: boolean;
    max_products: number | null;
    max_share_links: number | null;
    max_team_members: number | null;
    max_product_images: number | null;
    max_active_sessions: number;
  };
  created_at: string;
}

export default function PermissionPresets() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<PermissionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PermissionTemplate | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    can_add_products: true,
    can_view_catalog: true,
    can_edit_products: true,
    can_delete_products: true,
    can_share_catalog: true,
    can_view_share_links: true,
    can_manage_share_links: true,
    can_view_interests: true,
    can_add_vendor_details: true,
    can_edit_profile: true,
    can_view_custom_orders: true,
    can_manage_custom_orders: false,
    can_import_data: true,
    can_manage_team: false,
    can_view_sessions: true,
    can_manage_sessions: true,
    max_products: 100,
    max_share_links: 1,
    max_team_members: 0,
    max_product_images: 3,
    max_active_sessions: 1,
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("permission_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTemplates((data as any) || []);
    } catch (error: any) {
      toast.error("Failed to load templates");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (template?: PermissionTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        description: template.description || "",
        ...template.template_config,
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        name: "",
        description: "",
        can_add_products: true,
        can_view_catalog: true,
        can_edit_products: true,
        can_delete_products: true,
        can_share_catalog: true,
        can_view_share_links: true,
        can_manage_share_links: true,
        can_view_interests: true,
        can_add_vendor_details: true,
        can_edit_profile: true,
        can_view_custom_orders: true,
        can_manage_custom_orders: false,
        can_import_data: true,
        can_manage_team: false,
        can_view_sessions: true,
        can_manage_sessions: true,
        max_products: 100,
        max_share_links: 1,
        max_team_members: 0,
        max_product_images: 3,
        max_active_sessions: 1,
      });
    }
    setDialogOpen(true);
  };

  const handleSaveTemplate = async () => {
    if (!formData.name.trim()) {
      toast.error("Template name is required");
      return;
    }

    try {
      const { name, description, ...permissions } = formData;
      const templateData = {
        name: name.trim(),
        description: description.trim() || null,
        template_config: permissions,
      };

      if (editingTemplate) {
        const { error } = await supabase
          .from("permission_templates")
          .update(templateData)
          .eq("id", editingTemplate.id);

        if (error) throw error;
        toast.success("Template updated successfully");
      } else {
        const { error } = await supabase
          .from("permission_templates")
          .insert([templateData]);

        if (error) throw error;
        toast.success("Template created successfully");
      }

      setDialogOpen(false);
      fetchTemplates();
    } catch (error: any) {
      toast.error(error.message || "Failed to save template");
      console.error(error);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const { error } = await supabase
        .from("permission_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Template deleted successfully");
      fetchTemplates();
    } catch (error: any) {
      toast.error("Failed to delete template");
      console.error(error);
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/super-admin")}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">Permission Presets</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create and manage reusable permission templates
                  </p>
                </div>
              </div>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Create Template
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Permission Templates</CardTitle>
              <CardDescription>
                Saved templates can be applied to vendors in Plan Management
              </CardDescription>
            </CardHeader>
            <CardContent>
              {templates.length === 0 ? (
                <div className="text-center py-12">
                  <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No permission templates yet</p>
                  <Button variant="outline" className="mt-4" onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Template
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Template Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Limits</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {template.description || "No description"}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm space-y-1">
                            <div>Products: {template.template_config.max_products || "Unlimited"}</div>
                            <div>Share Links: {template.template_config.max_share_links || "Unlimited"}</div>
                            <div>Team: {template.template_config.max_team_members || "0"}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(template)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteTemplate(template.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? "Edit Permission Template" : "Create Permission Template"}
              </DialogTitle>
              <DialogDescription>
                Define a reusable set of permissions and limits
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Premium Vendor"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this template..."
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Resource Limits</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max_products">Max Products</Label>
                    <Input
                      id="max_products"
                      type="number"
                      value={formData.max_products || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, max_products: parseInt(e.target.value) || null })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_share_links">Max Share Links</Label>
                    <Input
                      id="max_share_links"
                      type="number"
                      value={formData.max_share_links || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, max_share_links: parseInt(e.target.value) || null })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_team_members">Max Team Members</Label>
                    <Input
                      id="max_team_members"
                      type="number"
                      value={formData.max_team_members || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, max_team_members: parseInt(e.target.value) || null })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_product_images">Max Product Images</Label>
                    <Input
                      id="max_product_images"
                      type="number"
                      value={formData.max_product_images || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, max_product_images: parseInt(e.target.value) || null })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_active_sessions">Max Active Sessions</Label>
                    <Input
                      id="max_active_sessions"
                      type="number"
                      value={formData.max_active_sessions}
                      onChange={(e) =>
                        setFormData({ ...formData, max_active_sessions: parseInt(e.target.value) || 1 })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Permissions</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries({
                    can_add_products: "Add Products",
                    can_view_catalog: "View Catalog",
                    can_edit_products: "Edit Products",
                    can_delete_products: "Delete Products",
                    can_share_catalog: "Share Catalog",
                    can_view_share_links: "View Share Links",
                    can_manage_share_links: "Manage Share Links",
                    can_view_interests: "View Interests",
                    can_add_vendor_details: "Add Vendor Details",
                    can_edit_profile: "Edit Profile",
                    can_view_custom_orders: "View Custom Orders",
                    can_manage_custom_orders: "Manage Custom Orders",
                    can_import_data: "Import Data",
                    can_manage_team: "Manage Team",
                    can_view_sessions: "View Sessions",
                    can_manage_sessions: "Manage Sessions",
                  }).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label htmlFor={key}>{label}</Label>
                      <Switch
                        id={key}
                        checked={formData[key as keyof typeof formData] as boolean}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, [key]: checked })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTemplate}>
                {editingTemplate ? "Update Template" : "Create Template"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  );
}
