import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, Search, Filter, Eye, Mail, Phone, IndianRupee, CheckSquare } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { AdminLoadingSkeleton } from "@/components/admin/AdminLoadingSkeleton";

interface ManufacturingOrder {
  id: string;
  estimate_name: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: string;
  total_cost: number;
  final_selling_price: number;
  created_at: string;
  updated_at: string;
  estimated_completion_date: string | null;
  is_customer_visible: boolean;
  share_token: string;
}

const AdminManufacturingOrders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<ManufacturingOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<ManufacturingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  
  // Bulk actions states
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<string>("");
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const statusConfig: Record<string, { label: string; color: string }> = {
    draft: { label: "Draft", color: "bg-gray-500" },
    quoted: { label: "Quoted", color: "bg-blue-500" },
    approved: { label: "Approved", color: "bg-green-500" },
    in_production: { label: "In Production", color: "bg-yellow-500" },
    completed: { label: "Completed", color: "bg-emerald-600" },
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, searchQuery, statusFilter, dateFrom, dateTo]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("manufacturing_cost_estimates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setOrders(data || []);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to load manufacturing orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // Search filter (customer name, email, or estimate name)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.customer_name?.toLowerCase().includes(query) ||
          order.customer_email?.toLowerCase().includes(query) ||
          order.estimate_name.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(
        (order) => new Date(order.created_at) >= dateFrom
      );
    }
    if (dateTo) {
      const endOfDay = new Date(dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      filtered = filtered.filter(
        (order) => new Date(order.created_at) <= endOfDay
      );
    }

    setFilteredOrders(filtered);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(new Set(filteredOrders.map(order => order.id)));
    } else {
      setSelectedOrders(new Set());
    }
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    const newSelected = new Set(selectedOrders);
    if (checked) {
      newSelected.add(orderId);
    } else {
      newSelected.delete(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus || selectedOrders.size === 0) return;

    setIsBulkUpdating(true);
    try {
      const ordersToUpdate = orders.filter(order => selectedOrders.has(order.id));
      
      // Update all selected orders
      const { error: updateError } = await supabase
        .from("manufacturing_cost_estimates")
        .update({ status: bulkStatus })
        .in("id", Array.from(selectedOrders));

      if (updateError) throw updateError;

      // Send email notifications for orders with customer visibility
      const notificationPromises = ordersToUpdate
        .filter(order => order.is_customer_visible && order.customer_email)
        .map(order =>
          supabase.functions.invoke('notify-order-status', {
            body: {
              estimateId: order.id,
              customerName: order.customer_name,
              customerEmail: order.customer_email,
              status: bulkStatus,
              estimatedCompletionDate: order.estimated_completion_date,
              shareToken: order.share_token,
            },
          }).catch(err => {
            console.error(`Failed to send notification for order ${order.id}:`, err);
            return null; // Don't fail the whole operation if emails fail
          })
        );

      await Promise.all(notificationPromises);

      toast({
        title: "Success",
        description: `Updated ${selectedOrders.size} order${selectedOrders.size > 1 ? 's' : ''} to ${bulkStatus}`,
      });

      // Reset selections and refresh
      setSelectedOrders(new Set());
      setBulkStatus("");
      setShowBulkDialog(false);
      fetchOrders();
    } catch (error: any) {
      console.error("Error updating orders:", error);
      toast({
        title: "Error",
        description: "Failed to update orders",
        variant: "destructive",
      });
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <AdminLayout>
        <AdminLoadingSkeleton />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Manufacturing Orders</h1>
          <p className="text-muted-foreground mt-2">
            View and manage all manufacturing cost estimates and orders
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            <CardDescription>
              Filter orders by customer, status, or date range
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Customer or estimate name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="quoted">Quoted</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="in_production">In Production</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date From */}
              <div className="space-y-2">
                <Label>Date From</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Date To */}
              <div className="space-y-2">
                <Label>Date To</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button variant="outline" onClick={resetFilters}>
                Reset Filters
              </Button>
              <p className="text-sm text-muted-foreground">
                Showing {filteredOrders.length} of {orders.length} orders
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedOrders.size > 0 && (
          <Card className="border-primary">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-primary" />
                  <span className="font-medium">
                    {selectedOrders.size} order{selectedOrders.size > 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Select value={bulkStatus} onValueChange={setBulkStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Change status to..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="quoted">Quoted</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="in_production">In Production</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => setShowBulkDialog(true)}
                    disabled={!bulkStatus}
                  >
                    Update Status
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedOrders(new Set())}
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Orders ({filteredOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No orders found matching your filters</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            filteredOrders.length > 0 &&
                            filteredOrders.every(order => selectedOrders.has(order.id))
                          }
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Estimate Name</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total Cost</TableHead>
                      <TableHead>Selling Price</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Completion Date</TableHead>
                      <TableHead>Visible</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedOrders.has(order.id)}
                            onCheckedChange={(checked) => 
                              handleSelectOrder(order.id, checked as boolean)
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {order.estimate_name}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">{order.customer_name || "N/A"}</p>
                            {order.customer_email && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {order.customer_email}
                              </div>
                            )}
                            {order.customer_phone && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {order.customer_phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "text-white",
                              statusConfig[order.status]?.color || "bg-gray-500"
                            )}
                          >
                            {statusConfig[order.status]?.label || order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <IndianRupee className="h-3 w-3" />
                            {formatCurrency(order.total_cost || 0)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <IndianRupee className="h-3 w-3" />
                            {formatCurrency(order.final_selling_price || 0)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(order.created_at), "PPP")}
                        </TableCell>
                        <TableCell>
                          {order.estimated_completion_date
                            ? format(new Date(order.estimated_completion_date), "PPP")
                            : "Not set"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={order.is_customer_visible ? "default" : "secondary"}>
                            {order.is_customer_visible ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {order.is_customer_visible && order.share_token && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                window.open(`/order-tracking/${order.share_token}`, "_blank");
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bulk Update Confirmation Dialog */}
        <AlertDialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Bulk Status Update</AlertDialogTitle>
              <AlertDialogDescription>
                You are about to update {selectedOrders.size} order{selectedOrders.size > 1 ? 's' : ''} to status:{' '}
                <span className="font-semibold">
                  {statusConfig[bulkStatus]?.label || bulkStatus}
                </span>
                <br /><br />
                Email notifications will be sent to customers for orders that are visible to them.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isBulkUpdating}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleBulkStatusUpdate}
                disabled={isBulkUpdating}
              >
                {isBulkUpdating ? "Updating..." : "Confirm Update"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminManufacturingOrders;
