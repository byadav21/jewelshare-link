import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminGuard } from "@/components/AdminGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { ArrowLeft, Crown, Edit, Search, Bookmark } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface VendorPermission {
  id: string;
  user_id: string;
  subscription_plan: 'starter' | 'professional' | 'enterprise';
  max_products: number | null;
  max_share_links: number | null;
  max_team_members: number | null;
  max_product_images: number | null;
  max_active_sessions: number;
  override_plan_limits: boolean | null;
  can_add_products: boolean | null;
  can_edit_products: boolean | null;
  can_delete_products: boolean | null;
  can_view_catalog: boolean | null;
  can_share_catalog: boolean | null;
  can_manage_share_links: boolean | null;
  can_view_share_links: boolean | null;
  can_view_interests: boolean | null;
  can_manage_team: boolean | null;
  can_edit_profile: boolean | null;
  can_add_vendor_details: boolean | null;
  can_view_custom_orders: boolean | null;
  can_manage_custom_orders: boolean | null;
  can_import_data: boolean | null;
  can_view_sessions: boolean | null;
  can_manage_sessions: boolean | null;
}

interface VendorInfo {
  business_name: string | null;
  email: string | null;
}

interface VendorWithPlan extends VendorPermission {
  vendor_info: VendorInfo;
}

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
}

export default function PlanManagement() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<VendorWithPlan[]>([]);
  const [templates, setTemplates] = useState<PermissionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<VendorWithPlan | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [customPlanDialogOpen, setCustomPlanDialogOpen] = useState(false);
  const [editedPlan, setEditedPlan] = useState<Partial<VendorPermission>>({});

  useEffect(() => {
    fetchVendors();
    fetchTemplates();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const { data: permissions, error: permError } = await supabase
        .from("vendor_permissions")
        .select("*")
        .order("subscription_plan");

      if (permError) throw permError;

      // Fetch vendor profiles to get business names
      const vendorsWithInfo = await Promise.all(
        (permissions || []).map(async (perm) => {
          const { data: profile } = await supabase
            .from("vendor_profiles")
            .select("business_name, email")
            .eq("user_id", perm.user_id)
            .single();

          return {
            ...perm,
            vendor_info: profile || { business_name: null, email: null }
          };
        })
      );

      setVendors(vendorsWithInfo);
    } catch (error: any) {
      toast.error("Failed to fetch vendors");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("permission_templates")
        .select("*")
        .order("name");

      if (error) throw error;
      setTemplates((data as any) || []);
    } catch (error: any) {
      console.error("Failed to fetch templates", error);
    }
  };

  const handleApplyTemplate = async (templateId: string) => {
    if (!selectedVendor) return;

    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    try {
      const { error } = await supabase
        .from("vendor_permissions")
        .update(template.template_config)
        .eq("user_id", selectedVendor.user_id);

      if (error) throw error;

      toast.success(`Template "${template.name}" applied successfully`);
      setCustomPlanDialogOpen(false);
      fetchVendors();
    } catch (error: any) {
      toast.error("Failed to apply template");
      console.error(error);
    }
  };

  const handleChangePlan = async (vendorId: string, newPlan: 'starter' | 'professional' | 'enterprise') => {
    try {
      const { error } = await supabase
        .from("vendor_permissions")
        .update({ subscription_plan: newPlan })
        .eq("user_id", vendorId);

      if (error) throw error;

      toast.success("Plan updated successfully");
      fetchVendors();
    } catch (error: any) {
      toast.error("Failed to update plan");
      console.error(error);
    }
  };

  const handleOpenCustomPlan = (vendor: VendorWithPlan) => {
    setSelectedVendor(vendor);
    setEditedPlan({
      max_products: vendor.max_products,
      max_share_links: vendor.max_share_links,
      max_team_members: vendor.max_team_members,
      max_product_images: vendor.max_product_images,
      max_active_sessions: vendor.max_active_sessions,
      override_plan_limits: vendor.override_plan_limits,
      can_add_products: vendor.can_add_products,
      can_edit_products: vendor.can_edit_products,
      can_delete_products: vendor.can_delete_products,
      can_view_catalog: vendor.can_view_catalog,
      can_share_catalog: vendor.can_share_catalog,
      can_manage_share_links: vendor.can_manage_share_links,
      can_view_share_links: vendor.can_view_share_links,
      can_view_interests: vendor.can_view_interests,
      can_manage_team: vendor.can_manage_team,
      can_edit_profile: vendor.can_edit_profile,
      can_add_vendor_details: vendor.can_add_vendor_details,
      can_view_custom_orders: vendor.can_view_custom_orders,
      can_manage_custom_orders: vendor.can_manage_custom_orders,
      can_import_data: vendor.can_import_data,
      can_view_sessions: vendor.can_view_sessions,
      can_manage_sessions: vendor.can_manage_sessions,
    });
    setCustomPlanDialogOpen(true);
  };

  const handleSaveCustomPlan = async () => {
    if (!selectedVendor) return;

    try {
      const { error } = await supabase
        .from("vendor_permissions")
        .update(editedPlan)
        .eq("user_id", selectedVendor.user_id);

      if (error) throw error;

      toast.success("Custom plan saved successfully");
      setCustomPlanDialogOpen(false);
      fetchVendors();
    } catch (error: any) {
      toast.error("Failed to save custom plan");
      console.error(error);
    }
  };

  const filteredVendors = vendors.filter(v => 
    v.vendor_info.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.vendor_info.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'starter': return 'bg-secondary text-secondary-foreground';
      case 'professional': return 'bg-primary text-primary-foreground';
      case 'enterprise': return 'bg-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

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
                  <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Crown className="h-8 w-8 text-primary" />
                    Plan Management
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage vendor subscription plans and permissions
                    {templates.length > 0 && ` • ${templates.length} template${templates.length !== 1 ? 's' : ''} available`}
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={() => navigate("/permission-presets")}>
                <Bookmark className="mr-2 h-4 w-4" />
                Manage Templates
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Vendor Plans</CardTitle>
                  <CardDescription>View and manage subscription plans for all vendors</CardDescription>
                </div>
                <div className="flex items-center gap-2 w-72">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search vendors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading vendors...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Current Plan</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead>Share Links</TableHead>
                      <TableHead>Team Members</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVendors.map((vendor) => (
                      <TableRow key={vendor.id}>
                        <TableCell className="font-medium">
                          {vendor.vendor_info.business_name || 'N/A'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {vendor.vendor_info.email || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge className={getPlanColor(vendor.subscription_plan)}>
                            {vendor.subscription_plan}
                          </Badge>
                        </TableCell>
                        <TableCell>{vendor.max_products || '∞'}</TableCell>
                        <TableCell>{vendor.max_share_links || '∞'}</TableCell>
                        <TableCell>{vendor.max_team_members || '∞'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Select
                              value={vendor.subscription_plan}
                              onValueChange={(value: 'starter' | 'professional' | 'enterprise') => 
                                handleChangePlan(vendor.user_id, value)
                              }
                            >
                              <SelectTrigger className="w-36">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="starter">Starter</SelectItem>
                                <SelectItem value="professional">Professional</SelectItem>
                                <SelectItem value="enterprise">Enterprise</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleOpenCustomPlan(vendor)}
                            >
                              <Edit className="h-4 w-4" />
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

        {/* Custom Plan Dialog */}
        <Dialog open={customPlanDialogOpen} onOpenChange={setCustomPlanDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Custom Plan Configuration</DialogTitle>
              <DialogDescription>
                Configure custom limits and permissions for {selectedVendor?.vendor_info.business_name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Template Selection */}
              {templates.length > 0 && (
                <div className="space-y-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-start gap-3">
                    <Bookmark className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <Label className="text-base font-semibold">Apply Permission Template</Label>
                      <p className="text-sm text-muted-foreground mt-1 mb-3">
                        Quick apply a saved permission preset to this vendor
                      </p>
                      <Select onValueChange={handleApplyTemplate}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a template..." />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{template.name}</span>
                                {template.description && (
                                  <span className="text-xs text-muted-foreground">{template.description}</span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Override Toggle */}
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="override_limits" className="text-base font-semibold">Override Plan Limits</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Allow this vendor to bypass all plan restrictions and limits
                    </p>
                  </div>
                  <Switch
                    id="override_limits"
                    checked={editedPlan.override_plan_limits || false}
                    onCheckedChange={(checked) => setEditedPlan({ ...editedPlan, override_plan_limits: checked })}
                  />
                </div>
              </div>

              {/* Limits Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Resource Limits</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Max Products</Label>
                    <Input
                      type="number"
                      value={editedPlan.max_products || ''}
                      onChange={(e) => setEditedPlan({ ...editedPlan, max_products: parseInt(e.target.value) || null })}
                      placeholder="Unlimited"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Share Links</Label>
                    <Input
                      type="number"
                      value={editedPlan.max_share_links || ''}
                      onChange={(e) => setEditedPlan({ ...editedPlan, max_share_links: parseInt(e.target.value) || null })}
                      placeholder="Unlimited"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Team Members</Label>
                    <Input
                      type="number"
                      value={editedPlan.max_team_members || ''}
                      onChange={(e) => setEditedPlan({ ...editedPlan, max_team_members: parseInt(e.target.value) || null })}
                      placeholder="Unlimited"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Product Images</Label>
                    <Input
                      type="number"
                      value={editedPlan.max_product_images || ''}
                      onChange={(e) => setEditedPlan({ ...editedPlan, max_product_images: parseInt(e.target.value) || null })}
                      placeholder="Unlimited"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Active Sessions</Label>
                    <Input
                      type="number"
                      value={editedPlan.max_active_sessions || ''}
                      onChange={(e) => setEditedPlan({ ...editedPlan, max_active_sessions: parseInt(e.target.value) || 3 })}
                    />
                  </div>
                </div>
              </div>

              {/* Permissions Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Permissions</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'can_add_products', label: 'Add Products' },
                    { key: 'can_edit_products', label: 'Edit Products' },
                    { key: 'can_delete_products', label: 'Delete Products' },
                    { key: 'can_view_catalog', label: 'View Catalog' },
                    { key: 'can_share_catalog', label: 'Share Catalog' },
                    { key: 'can_manage_share_links', label: 'Manage Share Links' },
                    { key: 'can_view_share_links', label: 'View Share Links' },
                    { key: 'can_view_interests', label: 'View Interests' },
                    { key: 'can_manage_team', label: 'Manage Team' },
                    { key: 'can_edit_profile', label: 'Edit Profile' },
                    { key: 'can_add_vendor_details', label: 'Add Vendor Details' },
                    { key: 'can_view_custom_orders', label: 'View Custom Orders' },
                    { key: 'can_manage_custom_orders', label: 'Manage Custom Orders' },
                    { key: 'can_import_data', label: 'Import Data' },
                    { key: 'can_view_sessions', label: 'View Sessions' },
                    { key: 'can_manage_sessions', label: 'Manage Sessions' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between space-x-2">
                      <Label htmlFor={key} className="text-sm">{label}</Label>
                      <Switch
                        id={key}
                        checked={editedPlan[key as keyof typeof editedPlan] as boolean || false}
                        onCheckedChange={(checked) => setEditedPlan({ ...editedPlan, [key]: checked })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setCustomPlanDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveCustomPlan}>
                Save Custom Plan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  );
}
