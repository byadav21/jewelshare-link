import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, FileText, Download, Eye, ArrowLeft, Trash2, Mail, CheckSquare, Square, Calendar } from "lucide-react";
import { generateInvoicePDF } from "@/utils/invoiceGenerator";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  final_selling_price: number;
  status: string;
  payment_due_date: string;
  estimate_name: string;
  created_at: string;
}

const InvoiceHistory = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set());
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [searchTerm, statusFilter, invoices, dateFrom, dateTo]);

  const fetchInvoices = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to view invoices");
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("manufacturing_cost_estimates")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_invoice_generated", true)
        .not("invoice_number", "is", null)
        .order("invoice_date", { ascending: false });

      if (error) throw error;

      setInvoices(data || []);
    } catch (error: any) {
      toast.error("Failed to load invoices");
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterInvoices = () => {
    let filtered = invoices;

    if (searchTerm) {
      filtered = filtered.filter(
        (invoice) =>
          invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((invoice) => invoice.status === statusFilter);
    }

    if (dateFrom) {
      filtered = filtered.filter((invoice) => new Date(invoice.invoice_date) >= dateFrom);
    }

    if (dateTo) {
      filtered = filtered.filter((invoice) => new Date(invoice.invoice_date) <= dateTo);
    }

    setFilteredInvoices(filtered);
  };

  const toggleSelectAll = () => {
    if (selectedInvoices.size === filteredInvoices.length) {
      setSelectedInvoices(new Set());
    } else {
      setSelectedInvoices(new Set(filteredInvoices.map(inv => inv.id)));
    }
  };

  const toggleSelectInvoice = (invoiceId: string) => {
    const newSelected = new Set(selectedInvoices);
    if (newSelected.has(invoiceId)) {
      newSelected.delete(invoiceId);
    } else {
      newSelected.add(invoiceId);
    }
    setSelectedInvoices(newSelected);
  };

  const handleBulkExport = async () => {
    if (selectedInvoices.size === 0) {
      toast.error("Please select invoices to export");
      return;
    }

    setBulkActionLoading(true);
    try {
      for (const invoiceId of selectedInvoices) {
        const invoice = invoices.find(inv => inv.id === invoiceId);
        if (invoice) {
          await handleRegenerateInvoice(invoice);
          await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between downloads
        }
      }
      toast.success(`Exported ${selectedInvoices.size} invoices`);
    } catch (error) {
      toast.error("Failed to export some invoices");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkEmail = async () => {
    if (selectedInvoices.size === 0) {
      toast.error("Please select invoices to email");
      return;
    }

    setBulkActionLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("vendor_profiles")
        .select("business_name, email")
        .eq("user_id", user.id)
        .maybeSingle();

      let successCount = 0;
      for (const invoiceId of selectedInvoices) {
        const invoice = invoices.find(inv => inv.id === invoiceId);
        if (invoice && invoice.customer_email) {
          try {
            const { error } = await supabase.functions.invoke("send-invoice-email", {
              body: {
                to: invoice.customer_email,
                customerName: invoice.customer_name,
                invoiceNumber: invoice.invoice_number,
                amount: invoice.final_selling_price,
                vendorName: profile?.business_name || "Your Vendor",
                vendorEmail: profile?.email || "vendor@example.com",
              },
            });

            if (!error) successCount++;
          } catch (err) {
            console.error(`Failed to send email for ${invoice.invoice_number}:`, err);
          }
        }
      }

      if (successCount > 0) {
        toast.success(`Sent ${successCount} of ${selectedInvoices.size} emails`);
      } else {
        toast.error("Failed to send emails");
      }
    } catch (error) {
      toast.error("Failed to send emails");
      console.error(error);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedInvoices.size === 0) {
      toast.error("Please select invoices to update");
      return;
    }

    setBulkActionLoading(true);
    try {
      const { error } = await supabase
        .from("manufacturing_cost_estimates")
        .update({ status: newStatus })
        .in("id", Array.from(selectedInvoices));

      if (error) throw error;

      toast.success(`Updated ${selectedInvoices.size} invoices to ${newStatus}`);
      setSelectedInvoices(new Set());
      fetchInvoices();
    } catch (error) {
      toast.error("Failed to update invoices");
      console.error(error);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleRegenerateInvoice = async (invoice: Invoice) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: estimateRaw, error } = await supabase
        .from("manufacturing_cost_estimates")
        .select("*")
        .eq("id", invoice.id)
        .maybeSingle();

      if (error) throw error;
      if (!estimateRaw) {
        toast.error("Invoice not found");
        return;
      }
      
      const estimate = estimateRaw as any;

      const { data: profile } = await supabase
        .from("vendor_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      const estimateDetails = estimate.details || {};
      const estimateLineItems = estimate.line_items || [];

      // Build vendor address
      const addressParts = [
        profile?.address_line1,
        profile?.address_line2,
        profile?.city,
        profile?.state,
        profile?.pincode,
        profile?.country
      ].filter(Boolean);
      const vendorAddress = addressParts.join(", ");

      const invoiceData = {
        invoiceNumber: estimate.invoice_number,
        invoiceDate: estimate.invoice_date,
        paymentDueDate: estimate.payment_due_date,
        paymentTerms: estimate.payment_terms,
        estimateName: estimate.estimate_name,
        status: estimate.status,
        customerName: estimate.customer_name,
        customerPhone: estimate.customer_phone,
        customerEmail: estimate.customer_email,
        customerAddress: estimate.customer_address,
        customerGSTIN: estimateDetails.customer_gstin,
        vendorGSTIN: estimateDetails.vendor_gstin,
        netWeight: estimate.net_weight,
        grossWeight: estimate.net_weight,
        purityFraction: estimate.purity_fraction,
        goldRate24k: estimate.gold_rate_24k,
        makingCharges: estimate.making_charges,
        cadDesignCharges: estimate.cad_design_charges,
        cammingCharges: estimate.camming_charges,
        certificationCost: estimate.certification_cost,
        diamondCost: estimate.diamond_cost,
        gemstoneCost: estimate.gemstone_cost,
        goldCost: estimate.gold_cost,
        totalCost: estimate.total_cost,
        profitMargin: estimate.profit_margin_percentage,
        finalSellingPrice: estimate.final_selling_price,
        gstMode: estimateDetails.gst_mode,
        sgstPercentage: estimateDetails.sgst_percentage,
        cgstPercentage: estimateDetails.cgst_percentage,
        igstPercentage: estimateDetails.igst_percentage,
        sgstAmount: estimateDetails.sgst_amount,
        cgstAmount: estimateDetails.cgst_amount,
        igstAmount: estimateDetails.igst_amount,
        shippingCharges: estimateDetails.shipping_charges,
        shippingZone: estimateDetails.shipping_zone,
        exchangeRate: estimateDetails.exchange_rate,
        grandTotal: estimateDetails.grand_total,
        invoiceNotes: estimate.invoice_notes,
        lineItems: estimateLineItems,
        details: estimateDetails,
        vendorBranding: profile ? {
          name: profile.business_name,
          logo: profile.logo_url,
          primaryColor: profile.primary_brand_color,
          secondaryColor: profile.secondary_brand_color,
          tagline: profile.brand_tagline,
          email: profile.email,
          phone: profile.phone,
          address: vendorAddress
        } : undefined,
      };

      await generateInvoicePDF(invoiceData);
      toast.success("Invoice downloaded successfully");
    } catch (error: any) {
      toast.error("Failed to regenerate invoice");
      console.error("Error regenerating invoice:", error);
    }
  };

  const handleDeleteClick = (invoice: Invoice) => {
    setInvoiceToDelete(invoice);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!invoiceToDelete) return;

    try {
      const { error } = await supabase
        .from("manufacturing_cost_estimates")
        .delete()
        .eq("id", invoiceToDelete.id);

      if (error) throw error;

      toast.success("Invoice deleted successfully");
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
      fetchInvoices(); // Refresh the list
    } catch (error: any) {
      toast.error("Failed to delete invoice");
      console.error("Error deleting invoice:", error);
    }
  };

  const handleViewEstimate = (invoiceId: string) => {
    navigate(`/manufacturing-cost?estimate=${invoiceId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/calculators")}
          className="group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Calculators
        </Button>

        <Card className="border-primary/10 shadow-2xl backdrop-blur-sm bg-card/95">
          <CardHeader className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl font-bold flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-7 w-7 text-primary" />
                </div>
                Invoice History
              </CardTitle>
              <Badge variant="secondary" className="text-sm">
                {filteredInvoices.length} {filteredInvoices.length === 1 ? "Invoice" : "Invoices"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by invoice number, customer name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="quoted">Quoted</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="in_production">In Production</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex gap-2 flex-wrap">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Calendar className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, "MMM dd, yyyy") : "From Date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={dateFrom}
                        onSelect={setDateFrom}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Calendar className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, "MMM dd, yyyy") : "To Date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={dateTo}
                        onSelect={setDateTo}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  {(dateFrom || dateTo) && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setDateFrom(undefined);
                        setDateTo(undefined);
                      }}
                    >
                      Clear Dates
                    </Button>
                  )}
                </div>
              </div>

              {selectedInvoices.size > 0 && (
                <div className="flex flex-wrap gap-2 items-center p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <span className="text-sm font-medium">
                    {selectedInvoices.size} selected
                  </span>
                  <div className="flex gap-2 ml-auto flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleBulkExport}
                      disabled={bulkActionLoading}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export All
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleBulkEmail}
                      disabled={bulkActionLoading}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Email All
                    </Button>
                    <Select onValueChange={handleBulkStatusUpdate}>
                      <SelectTrigger className="w-[140px] h-9">
                        <SelectValue placeholder="Update Status" />
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
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedInvoices(new Set())}
                    >
                      Clear Selection
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground text-lg">Loading invoices...</p>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-16">
                <div className="p-4 rounded-full bg-muted/50 inline-block mb-4">
                  <FileText className="h-16 w-16 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No invoices found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Start creating invoices to see them here"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInvoices.length > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Checkbox
                      checked={selectedInvoices.size === filteredInvoices.length}
                      onCheckedChange={toggleSelectAll}
                    />
                    <span className="text-sm font-medium">
                      Select All ({filteredInvoices.length})
                    </span>
                  </div>
                )}
                {filteredInvoices.map((invoice) => (
                  <Card 
                    key={invoice.id} 
                    className="group hover:shadow-lg hover:border-primary/20 transition-all duration-200 bg-gradient-to-br from-card to-card/50"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-start gap-3 flex-1">
                          <Checkbox
                            checked={selectedInvoices.has(invoice.id)}
                            onCheckedChange={() => toggleSelectInvoice(invoice.id)}
                            className="mt-1"
                          />
                          <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-lg">
                              <FileText className="h-4 w-4 text-primary" />
                              <h3 className="font-bold text-lg">{invoice.invoice_number}</h3>
                            </div>
                            <Badge 
                              variant={invoice.status === "completed" ? "default" : "secondary"}
                              className="capitalize"
                            >
                              {invoice.status?.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium text-muted-foreground">Customer:</span>
                              <span className="text-foreground">{invoice.customer_name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium text-muted-foreground">Date:</span>
                              <span className="text-foreground">
                                {new Date(invoice.invoice_date).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-baseline gap-2 pt-1">
                            <span className="text-sm font-medium text-muted-foreground">Amount:</span>
                            <span className="text-2xl font-bold text-primary">
                              ₹{invoice.final_selling_price?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                        </div>
                        <div className="flex gap-2 md:ml-3">
                          <Button
                            variant="outline"
                            size="default"
                            onClick={() => handleViewEstimate(invoice.id)}
                            className="group/btn"
                          >
                            <Eye className="h-4 w-4 mr-2 transition-transform group-hover/btn:scale-110" />
                            View Details
                          </Button>
                          <Button
                            size="default"
                            onClick={() => handleRegenerateInvoice(invoice)}
                            className="group/btn bg-primary hover:bg-primary/90"
                          >
                            <Download className="h-4 w-4 mr-2 transition-transform group-hover/btn:translate-y-0.5" />
                            Export PDF
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteClick(invoice)}
                            className="group/btn hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                          >
                            <Trash2 className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete invoice <strong>{invoiceToDelete?.invoice_number}</strong>? 
                This will permanently remove this invoice from your records. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Invoice
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default InvoiceHistory;
