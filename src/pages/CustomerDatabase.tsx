import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Mail, Phone, MessageSquare, Heart } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

const CustomerDatabase = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch product interests
  const { data: interestsData, isLoading: interestsLoading } = useQuery({
    queryKey: ["customer-interests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_interests")
        .select(`
          *,
          product:product_id (
            name,
            sku,
            category
          ),
          share_link:share_link_id (
            share_token
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Fetch catalog inquiries
  const { data: inquiriesData, isLoading: inquiriesLoading } = useQuery({
    queryKey: ["customer-inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("catalog_inquiries")
        .select(`
          *,
          share_link:share_link_id (
            share_token
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Filter interests
  const filteredInterests = interestsData?.filter((interest: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      interest.customer_name?.toLowerCase().includes(query) ||
      interest.customer_email?.toLowerCase().includes(query) ||
      interest.customer_phone?.toLowerCase().includes(query) ||
      interest.product?.name?.toLowerCase().includes(query)
    );
  });

  // Filter inquiries
  const filteredInquiries = inquiriesData?.filter((inquiry: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      inquiry.customer_name?.toLowerCase().includes(query) ||
      inquiry.customer_email?.toLowerCase().includes(query) ||
      inquiry.customer_phone?.toLowerCase().includes(query) ||
      inquiry.message?.toLowerCase().includes(query)
    );
  });

  // Get unique customers
  const uniqueCustomers = () => {
    const customerMap = new Map();

    interestsData?.forEach((interest: any) => {
      const email = interest.customer_email;
      if (!customerMap.has(email)) {
        customerMap.set(email, {
          name: interest.customer_name,
          email: interest.customer_email,
          phone: interest.customer_phone,
          interests: 0,
          inquiries: 0,
          lastActivity: interest.created_at,
        });
      }
      const customer = customerMap.get(email);
      customer.interests++;
      if (new Date(interest.created_at) > new Date(customer.lastActivity)) {
        customer.lastActivity = interest.created_at;
      }
    });

    inquiriesData?.forEach((inquiry: any) => {
      const email = inquiry.customer_email;
      if (!customerMap.has(email)) {
        customerMap.set(email, {
          name: inquiry.customer_name,
          email: inquiry.customer_email,
          phone: inquiry.customer_phone,
          interests: 0,
          inquiries: 0,
          lastActivity: inquiry.created_at,
        });
      }
      const customer = customerMap.get(email);
      customer.inquiries++;
      if (new Date(inquiry.created_at) > new Date(customer.lastActivity)) {
        customer.lastActivity = inquiry.created_at;
      }
    });

    return Array.from(customerMap.values()).filter((customer: any) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        customer.name?.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query) ||
        customer.phone?.toLowerCase().includes(query)
      );
    });
  };

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
          <h1 className="text-3xl font-bold">Customer Database</h1>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueCustomers().length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Product Interests</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interestsData?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Catalog Inquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inquiriesData?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search customers by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results Tabs */}
      <Tabs defaultValue="customers" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="interests">Interests</TabsTrigger>
          <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Interests</TableHead>
                      <TableHead>Inquiries</TableHead>
                      <TableHead>Last Activity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uniqueCustomers().map((customer: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </div>
                            {customer.phone && (
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="h-3 w-3" />
                                {customer.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{customer.interests}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{customer.inquiries}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(customer.lastActivity), "MMM dd, yyyy HH:mm")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Interests</CardTitle>
            </CardHeader>
            <CardContent>
              {interestsLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInterests?.map((interest: any) => (
                        <TableRow key={interest.id}>
                          <TableCell className="font-medium">
                            {interest.customer_name}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{interest.product?.name || "N/A"}</div>
                              {interest.product?.sku && (
                                <div className="text-xs text-muted-foreground">
                                  SKU: {interest.product.sku}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1 text-sm">
                              {interest.customer_email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {interest.customer_email}
                                </div>
                              )}
                              {interest.customer_phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {interest.customer_phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {interest.notes || "-"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(interest.created_at), "MMM dd, yyyy")}
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

        <TabsContent value="inquiries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Catalog Inquiries</CardTitle>
            </CardHeader>
            <CardContent>
              {inquiriesLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInquiries?.map((inquiry: any) => (
                        <TableRow key={inquiry.id}>
                          <TableCell className="font-medium">
                            {inquiry.customer_name}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {inquiry.customer_email}
                              </div>
                              {inquiry.customer_phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {inquiry.customer_phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-md">
                            <div className="line-clamp-2">{inquiry.message}</div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(inquiry.created_at), "MMM dd, yyyy")}
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

export default CustomerDatabase;
