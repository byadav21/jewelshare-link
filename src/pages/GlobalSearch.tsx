import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Building2, Package, Mail, Phone, DollarSign } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const GlobalSearch = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all products with vendor info
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["global-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          vendor:user_id (
            id,
            email
          )
        `)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch vendor profiles separately
      const { data: profiles, error: profileError } = await supabase
        .from("vendor_profiles")
        .select("user_id, business_name, email, phone");

      if (profileError) throw profileError;

      // Merge vendor profile data
      return data?.map((product: any) => ({
        ...product,
        vendorProfile: profiles?.find((p: any) => p.user_id === product.user_id),
      }));
    },
    enabled: isAdmin,
  });

  // Fetch all vendors with stats
  const { data: vendorsData, isLoading: vendorsLoading } = useQuery({
    queryKey: ["global-vendors"],
    queryFn: async () => {
      const { data: approvals, error: approvalsError } = await supabase
        .from("user_approval_status")
        .select("user_id, status, is_enabled, business_name, email, phone");

      if (approvalsError) throw approvalsError;

      const { data: profiles, error: profilesError } = await supabase
        .from("vendor_profiles")
        .select("user_id, business_name, email, phone");

      if (profilesError) throw profilesError;

      // Get product counts
      const { data: productCounts, error: countsError } = await supabase
        .from("products")
        .select("user_id")
        .is("deleted_at", null);

      if (countsError) throw countsError;

      const counts = productCounts?.reduce((acc: any, p: any) => {
        acc[p.user_id] = (acc[p.user_id] || 0) + 1;
        return acc;
      }, {});

      return approvals?.map((vendor: any) => ({
        ...vendor,
        profile: profiles?.find((p: any) => p.user_id === vendor.user_id),
        productCount: counts?.[vendor.user_id] || 0,
      }));
    },
    enabled: isAdmin,
  });

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!searchQuery || !productsData) return productsData || [];

    const query = searchQuery.toLowerCase().trim();
    return productsData.filter((product: any) => {
      const searchableFields = [
        product.name,
        product.sku,
        product.category,
        product.product_type,
        product.metal_type,
        product.gemstone,
        product.diamond_color,
        product.clarity,
        product.vendorProfile?.business_name,
        product.vendorProfile?.email,
        product.vendor?.email,
      ].filter(Boolean);

      return searchableFields.some((field) =>
        field?.toLowerCase().includes(query)
      );
    });
  }, [productsData, searchQuery]);

  // Filter vendors
  const filteredVendors = useMemo(() => {
    if (!searchQuery || !vendorsData) return vendorsData || [];

    const query = searchQuery.toLowerCase().trim();
    return vendorsData.filter((vendor: any) => {
      const searchableFields = [
        vendor.business_name,
        vendor.email,
        vendor.phone,
        vendor.profile?.business_name,
        vendor.profile?.email,
        vendor.status,
        vendor.productCount?.toString(),
      ].filter(Boolean);

      return searchableFields.some((field) =>
        field?.toLowerCase().includes(query)
      );
    });
  }, [vendorsData, searchQuery]);

  if (roleLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAdmin) {
    navigate("/");
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/super-admin")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Global Search</h1>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search across all products and vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results Tabs */}
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="products">
            Products ({filteredProducts?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="vendors">
            Vendors ({filteredVendors?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="text-center py-8">Loading products...</div>
              ) : filteredProducts?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No products found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price (INR)</TableHead>
                        <TableHead>Stock</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts?.map((product: any) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div>{product.name}</div>
                              {product.product_type && (
                                <div className="text-xs text-muted-foreground">
                                  {product.product_type}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{product.sku || "-"}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">
                                {product.vendorProfile?.business_name || "N/A"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {product.vendorProfile?.email || product.vendor?.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{product.category || "N/A"}</Badge>
                          </TableCell>
                          <TableCell>
                            ₹{product.retail_price?.toLocaleString() || "0"}
                          </TableCell>
                          <TableCell>{product.stock_quantity || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Vendor Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vendorsLoading ? (
                <div className="text-center py-8">Loading vendors...</div>
              ) : filteredVendors?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No vendors found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Business Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Products</TableHead>
                        <TableHead>Enabled</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVendors?.map((vendor: any) => (
                        <TableRow key={vendor.user_id}>
                          <TableCell className="font-medium">
                            {vendor.profile?.business_name || vendor.business_name || "N/A"}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {(vendor.profile?.email || vendor.email) && (
                                <div className="flex items-center gap-1 text-sm">
                                  <Mail className="h-3 w-3" />
                                  {vendor.profile?.email || vendor.email}
                                </div>
                              )}
                              {(vendor.profile?.phone || vendor.phone) && (
                                <div className="flex items-center gap-1 text-sm">
                                  <Phone className="h-3 w-3" />
                                  {vendor.profile?.phone || vendor.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                vendor.status === "approved"
                                  ? "default"
                                  : vendor.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {vendor.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{vendor.productCount}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={vendor.is_enabled ? "default" : "secondary"}>
                              {vendor.is_enabled ? "Yes" : "No"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GlobalSearch;
