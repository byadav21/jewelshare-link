import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApprovalGuard } from "@/components/ApprovalGuard";
import { AdminLoadingSkeleton } from "@/components/admin/AdminLoadingSkeleton";
import { toast } from "sonner";
import { ShoppingCart, Search, Mail, Phone, Package, Calendar, TrendingUp, CheckCircle, Clock, XCircle, Download, FileSpreadsheet } from "lucide-react";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";

interface PurchaseInquiry {
  id: string;
  product_id: string;
  share_link_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  quantity: number;
  message: string | null;
  status: string;
  created_at: string;
  products?: {
    name: string;
    retail_price: number;
    image_url: string | null;
    sku: string | null;
  };
  share_links?: {
    share_token: string;
  };
}

const PurchaseInquiries = () => {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState<PurchaseInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("purchase_inquiries")
        .select(`
          *,
          products (name, retail_price, image_url, sku),
          share_links (share_token)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (error: any) {
      console.error("Error fetching inquiries:", error);
      toast.error("Failed to load purchase inquiries");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (inquiryId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("purchase_inquiries")
        .update({ status: newStatus })
        .eq("id", inquiryId);

      if (error) throw error;

      setInquiries((prev) =>
        prev.map((inquiry) =>
          inquiry.id === inquiryId ? { ...inquiry, status: newStatus } : inquiry
        )
      );

      toast.success("Status updated successfully");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const exportToCSV = () => {
    const exportData = filteredInquiries.map((inquiry) => ({
      "Customer Name": inquiry.customer_name,
      "Email": inquiry.customer_email,
      "Phone": inquiry.customer_phone || "N/A",
      "Product": inquiry.products?.name || "N/A",
      "SKU": inquiry.products?.sku || "N/A",
      "Quantity": inquiry.quantity,
      "Unit Price": inquiry.products?.retail_price || 0,
      "Total Value": (inquiry.products?.retail_price || 0) * inquiry.quantity,
      "Status": inquiry.status,
      "Message": inquiry.message || "N/A",
      "Date": new Date(inquiry.created_at).toLocaleDateString(),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `purchase-inquiries-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("CSV exported successfully");
  };

  const exportToExcel = () => {
    const exportData = filteredInquiries.map((inquiry) => ({
      "Customer Name": inquiry.customer_name,
      "Email": inquiry.customer_email,
      "Phone": inquiry.customer_phone || "N/A",
      "Product": inquiry.products?.name || "N/A",
      "SKU": inquiry.products?.sku || "N/A",
      "Quantity": inquiry.quantity,
      "Unit Price": inquiry.products?.retail_price || 0,
      "Total Value": (inquiry.products?.retail_price || 0) * inquiry.quantity,
      "Status": inquiry.status,
      "Message": inquiry.message || "N/A",
      "Date": new Date(inquiry.created_at).toLocaleDateString(),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Purchase Inquiries");
    XLSX.writeFile(wb, `purchase-inquiries-${new Date().toISOString().split("T")[0]}.xlsx`);
    toast.success("Excel file exported successfully");
  };

  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesSearch =
      searchQuery === "" ||
      inquiry.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.products?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.products?.sku?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || inquiry.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: inquiries.length,
    pending: inquiries.filter((i) => i.status === "pending").length,
    contacted: inquiries.filter((i) => i.status === "contacted").length,
    completed: inquiries.filter((i) => i.status === "completed").length,
    totalRevenue: inquiries
      .filter((i) => i.status === "completed")
      .reduce((sum, i) => sum + (i.products?.retail_price || 0) * i.quantity, 0),
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: "secondary" as const, icon: Clock, label: "Pending" },
      contacted: { variant: "default" as const, icon: Mail, label: "Contacted" },
      completed: { variant: "default" as const, icon: CheckCircle, label: "Completed" },
      cancelled: { variant: "destructive" as const, icon: XCircle, label: "Cancelled" },
    };

    const config = variants[status as keyof typeof variants] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (loading) return <AdminLoadingSkeleton />;

  return (
    <ApprovalGuard>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary/20 to-accent/20 p-3 rounded-xl">
              <ShoppingCart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Purchase Inquiries
              </h1>
              <p className="text-muted-foreground">Manage customer purchase requests</p>
            </div>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Inquiries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats.total}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card className="border-secondary/20 bg-gradient-to-br from-card to-secondary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-secondary">{stats.pending}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card className="border-accent/20 bg-gradient-to-br from-card to-accent/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Contacted</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">{stats.contacted}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card className="border-green-500/20 bg-gradient-to-br from-card to-green-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  ₹{stats.totalRevenue.toLocaleString("en-IN")}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer name, email, product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button variant="outline" onClick={exportToCSV} className="gap-2">
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
                <Button variant="outline" onClick={exportToExcel} className="gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Export Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inquiries List */}
        <div className="space-y-4">
          {filteredInquiries.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg text-muted-foreground">No purchase inquiries found</p>
              </CardContent>
            </Card>
          ) : (
            filteredInquiries.map((inquiry) => (
              <motion.div
                key={inquiry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Product Image */}
                      {inquiry.products?.image_url && (
                        <div className="w-full lg:w-32 h-32 flex-shrink-0">
                          <img
                            src={inquiry.products.image_url}
                            alt={inquiry.products.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      )}

                      {/* Inquiry Details */}
                      <div className="flex-1 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="space-y-1">
                            <h3 className="text-lg font-semibold">{inquiry.products?.name}</h3>
                            {inquiry.products?.sku && (
                              <p className="text-sm text-muted-foreground">SKU: {inquiry.products.sku}</p>
                            )}
                          </div>
                          {getStatusBadge(inquiry.status)}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <div className="min-w-0">
                              <p className="text-xs text-muted-foreground">Customer</p>
                              <p className="font-medium truncate">{inquiry.customer_name}</p>
                              <p className="text-xs text-muted-foreground truncate">{inquiry.customer_email}</p>
                            </div>
                          </div>

                          {inquiry.customer_phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">Phone</p>
                                <p className="font-medium">{inquiry.customer_phone}</p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Quantity</p>
                              <p className="font-medium">{inquiry.quantity}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Date</p>
                              <p className="font-medium">
                                {new Date(inquiry.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Value</p>
                              <p className="font-medium">
                                ₹{((inquiry.products?.retail_price || 0) * inquiry.quantity).toLocaleString("en-IN")}
                              </p>
                            </div>
                          </div>
                        </div>

                        {inquiry.message && (
                          <div className="pt-2 border-t">
                            <p className="text-sm text-muted-foreground mb-1">Message:</p>
                            <p className="text-sm">{inquiry.message}</p>
                          </div>
                        )}

                        {/* Status Update Actions */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          {inquiry.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateStatus(inquiry.id, "contacted")}
                                className="gap-2"
                              >
                                <Mail className="h-4 w-4" />
                                Mark as Contacted
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatus(inquiry.id, "cancelled")}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                          {inquiry.status === "contacted" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateStatus(inquiry.id, "completed")}
                                className="gap-2"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Mark as Completed
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatus(inquiry.id, "pending")}
                              >
                                Back to Pending
                              </Button>
                            </>
                          )}
                          {inquiry.status === "completed" && (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Sale Completed
                            </Badge>
                          )}
                          {inquiry.status === "cancelled" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(inquiry.id, "pending")}
                            >
                              Reopen
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </ApprovalGuard>
  );
};

export default PurchaseInquiries;
