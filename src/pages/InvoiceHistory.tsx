import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, FileText, Download, Eye, ArrowLeft } from "lucide-react";
import { generateInvoicePDF } from "@/utils/invoiceGenerator";
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

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [searchTerm, statusFilter, invoices]);

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

    setFilteredInvoices(filtered);
  };

  const handleRegenerateInvoice = async (invoice: Invoice) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: estimate, error } = await supabase
        .from("manufacturing_cost_estimates")
        .select("*")
        .eq("id", invoice.id)
        .single();

      if (error) throw error;

      const { data: profile } = await supabase
        .from("vendor_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

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
        invoiceNotes: estimate.invoice_notes,
        vendorBranding: profile ? {
          businessName: profile.business_name,
          logoUrl: profile.logo_url,
          primaryColor: profile.primary_brand_color,
          secondaryColor: profile.secondary_brand_color,
          tagline: profile.brand_tagline,
          email: profile.email,
          phone: profile.phone,
          address: `${profile.address_line1 || ""} ${profile.address_line2 || ""} ${profile.city || ""} ${profile.state || ""} ${profile.pincode || ""}`.trim(),
        } : undefined,
      };

      generateInvoicePDF(invoiceData);
      toast.success("Invoice downloaded successfully");
    } catch (error: any) {
      toast.error("Failed to regenerate invoice");
      console.error("Error regenerating invoice:", error);
    }
  };

  const handleViewEstimate = (invoiceId: string) => {
    navigate(`/manufacturing-cost?estimate=${invoiceId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/calculators")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Calculators
          </Button>
        </div>

        <Card className="border-primary/20 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardTitle className="text-2xl flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Invoice History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
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

            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading invoices...</p>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No invoices found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInvoices.map((invoice) => (
                  <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{invoice.invoice_number}</h3>
                            <Badge variant={invoice.status === "completed" ? "default" : "secondary"}>
                              {invoice.status?.replace("_", " ")}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Customer: {invoice.customer_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Date: {new Date(invoice.invoice_date).toLocaleDateString()}
                          </p>
                          <p className="text-sm font-semibold text-primary">
                            Amount: ₹{invoice.final_selling_price?.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewEstimate(invoice.id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleRegenerateInvoice(invoice)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
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
      </div>
    </div>
  );
};

export default InvoiceHistory;
