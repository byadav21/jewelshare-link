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
import { ArrowLeft, Trash2, User } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Vendor {
  id: string;
  email: string;
  business_name?: string;
  is_enabled: boolean;
  status: string;
  created_at: string;
  product_count: number;
  deleted_product_count: number;
}

export default function VendorManagement() {
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletedProducts, setDeletedProducts] = useState<any[]>([]);

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

      // Combine data
      const vendorsData: Vendor[] = approvals.map(approval => {
        const profile = profiles?.find(p => p.user_id === approval.user_id);
        const userProducts = productCounts?.filter(p => p.user_id === approval.user_id) || [];
        
        return {
          id: approval.user_id,
          email: approval.email || "N/A",
          business_name: profile?.business_name,
          is_enabled: approval.is_enabled ?? true,
          status: approval.status,
          created_at: approval.requested_at,
          product_count: userProducts.filter(p => !p.deleted_at).length,
          deleted_product_count: userProducts.filter(p => p.deleted_at).length,
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
                    </TableRow>
                  ))}
                  {vendors.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No vendors found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

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
