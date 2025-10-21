import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ApprovalGuard } from "@/components/ApprovalGuard";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Trash2, Settings } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface VendorPermissions {
  can_add_products: boolean;
  can_import_data: boolean;
  can_share_catalog: boolean;
  can_manage_team: boolean;
  can_view_interests: boolean;
  can_delete_products: boolean;
  can_edit_products: boolean;
  can_edit_profile: boolean;
}

interface Vendor {
  id: string;
  email: string;
  business_name?: string;
  is_enabled: boolean;
  status: string;
  created_at: string;
  product_count: number;
  deleted_product_count: number;
  permissions?: VendorPermissions;
}

export default function VendorManagement() {
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletedProducts, setDeletedProducts] = useState<any[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      toast.error("Access denied. Admin only.");
      navigate("/catalog");
    }
  }, [isAdmin, roleLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchVendors();
      fetchDeletedProducts();
    }
  }, [isAdmin]);

  const fetchVendors = async () => {
    try {
      // Get all users with approval status
      const { data: approvals, error: approvalsError } = await supabase
        .from("user_approval_status")
        .select("*")
        .eq("status", "approved");

      if (approvalsError) throw approvalsError;

      // Get vendor profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("vendor_profiles")
        .select("*");

      if (profilesError) throw profilesError;

      // Get product counts for each vendor
      const { data: productCounts, error: productError } = await supabase
        .from("products")
        .select("user_id, deleted_at");

      if (productError) throw productError;

      // Get permissions for each vendor
      const { data: permissionsData, error: permissionsError } = await supabase
        .from("vendor_permissions")
        .select("*");

      if (permissionsError) throw permissionsError;

      // Combine data
      const vendorsData: Vendor[] = approvals.map(approval => {
        const profile = profiles?.find(p => p.user_id === approval.user_id);
        const userProducts = productCounts?.filter(p => p.user_id === approval.user_id) || [];
        const vendorPermissions = permissionsData?.find(p => p.user_id === approval.user_id);
        
        return {
          id: approval.user_id,
          email: approval.email || "N/A",
          business_name: profile?.business_name,
          is_enabled: approval.is_enabled ?? true,
          status: approval.status,
          created_at: approval.requested_at,
          product_count: userProducts.filter(p => !p.deleted_at).length,
          deleted_product_count: userProducts.filter(p => p.deleted_at).length,
          permissions: vendorPermissions ? {
            can_add_products: vendorPermissions.can_add_products,
            can_import_data: vendorPermissions.can_import_data,
            can_share_catalog: vendorPermissions.can_share_catalog,
            can_manage_team: vendorPermissions.can_manage_team,
            can_view_interests: vendorPermissions.can_view_interests,
            can_delete_products: vendorPermissions.can_delete_products,
            can_edit_products: vendorPermissions.can_edit_products,
            can_edit_profile: vendorPermissions.can_edit_profile,
          } : undefined,
        };
      });

      setVendors(vendorsData);
    } catch (error: any) {
      toast.error("Failed to fetch vendors");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false });

      if (error) throw error;
      setDeletedProducts(data || []);
    } catch (error: any) {
      console.error("Failed to fetch deleted products:", error);
    }
  };

  const toggleVendorStatus = async (vendorId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("user_approval_status")
        .update({ is_enabled: !currentStatus })
        .eq("user_id", vendorId);

      if (error) throw error;

      toast.success(`Vendor ${!currentStatus ? "enabled" : "disabled"} successfully`);
      fetchVendors();
    } catch (error: any) {
      toast.error("Failed to update vendor status");
      console.error(error);
    }
  };

  const handleHardDelete = async (productIds: string[]) => {
    try {
      const { error } = await supabase.rpc("hard_delete_products", {
        product_ids: productIds,
      });

      if (error) throw error;

      toast.success(`${productIds.length} product(s) permanently deleted`);
      fetchDeletedProducts();
      fetchVendors();
    } catch (error: any) {
      toast.error("Failed to delete products permanently");
      console.error(error);
    }
  };

  const updateVendorPermissions = async (vendorId: string, permissions: Partial<VendorPermissions>) => {
    try {
      const { error } = await supabase
        .from("vendor_permissions")
        .update(permissions)
        .eq("user_id", vendorId);

      if (error) throw error;

      toast.success("Permissions updated successfully");
      fetchVendors();
      setShowPermissionsDialog(false);
    } catch (error: any) {
      toast.error("Failed to update permissions");
      console.error(error);
    }
  };

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading vendor management...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <ApprovalGuard>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Vendor Management</h1>
                <p className="text-muted-foreground mt-1">Manage vendors and deleted products</p>
              </div>
              <Button variant="outline" onClick={() => navigate("/admin")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8 space-y-8">
          {/* Vendors List */}
          <Card>
            <CardHeader>
              <CardTitle>Vendors</CardTitle>
              <CardDescription>Manage vendor accounts and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Deleted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Enabled</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell className="font-medium">
                        {vendor.business_name || "No business name"}
                      </TableCell>
                      <TableCell>{vendor.email}</TableCell>
                      <TableCell>{vendor.product_count}</TableCell>
                      <TableCell>{vendor.deleted_product_count}</TableCell>
                      <TableCell>
                        <Badge variant={vendor.status === "approved" ? "default" : "secondary"}>
                          {vendor.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={vendor.is_enabled}
                          onCheckedChange={() => toggleVendorStatus(vendor.id, vendor.is_enabled)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedVendor(vendor);
                            setShowPermissionsDialog(true);
                          }}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Permissions
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {vendors.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No vendors found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Permissions Dialog */}
          <Dialog open={showPermissionsDialog} onOpenChange={setShowPermissionsDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Vendor Permissions</DialogTitle>
                <DialogDescription>
                  Configure what {selectedVendor?.business_name || selectedVendor?.email} can do
                </DialogDescription>
              </DialogHeader>
              {selectedVendor?.permissions && (
                <div className="space-y-4 py-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="can_add_products">Add Products</Label>
                    <Switch
                      id="can_add_products"
                      checked={selectedVendor.permissions.can_add_products}
                      onCheckedChange={(checked) => 
                        updateVendorPermissions(selectedVendor.id, { can_add_products: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="can_import_data">Import Data</Label>
                    <Switch
                      id="can_import_data"
                      checked={selectedVendor.permissions.can_import_data}
                      onCheckedChange={(checked) => 
                        updateVendorPermissions(selectedVendor.id, { can_import_data: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="can_share_catalog">Share Catalog</Label>
                    <Switch
                      id="can_share_catalog"
                      checked={selectedVendor.permissions.can_share_catalog}
                      onCheckedChange={(checked) => 
                        updateVendorPermissions(selectedVendor.id, { can_share_catalog: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="can_manage_team">Manage Team</Label>
                    <Switch
                      id="can_manage_team"
                      checked={selectedVendor.permissions.can_manage_team}
                      onCheckedChange={(checked) => 
                        updateVendorPermissions(selectedVendor.id, { can_manage_team: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="can_view_interests">View Interests</Label>
                    <Switch
                      id="can_view_interests"
                      checked={selectedVendor.permissions.can_view_interests}
                      onCheckedChange={(checked) => 
                        updateVendorPermissions(selectedVendor.id, { can_view_interests: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="can_delete_products">Delete Products</Label>
                    <Switch
                      id="can_delete_products"
                      checked={selectedVendor.permissions.can_delete_products}
                      onCheckedChange={(checked) => 
                        updateVendorPermissions(selectedVendor.id, { can_delete_products: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="can_edit_products">Edit Products</Label>
                    <Switch
                      id="can_edit_products"
                      checked={selectedVendor.permissions.can_edit_products}
                      onCheckedChange={(checked) => 
                        updateVendorPermissions(selectedVendor.id, { can_edit_products: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="can_edit_profile">Edit Profile</Label>
                    <Switch
                      id="can_edit_profile"
                      checked={selectedVendor.permissions.can_edit_profile}
                      onCheckedChange={(checked) => 
                        updateVendorPermissions(selectedVendor.id, { can_edit_profile: checked })
                      }
                    />
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Deleted Products */}
          <Card>
            <CardHeader>
              <CardTitle>Deleted Products</CardTitle>
              <CardDescription>Permanently delete products that were soft-deleted by vendors</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Deleted At</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deletedProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.sku || "N/A"}</TableCell>
                      <TableCell>{product.category || "N/A"}</TableCell>
                      <TableCell>
                        {new Date(product.deleted_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Hard Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Permanently Delete Product?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete "{product.name}". This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleHardDelete([product.id])}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Permanently Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                  {deletedProducts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No deleted products
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </ApprovalGuard>
  );
}
