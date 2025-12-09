import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, FileText, Eye, ArrowLeft, FileCheck } from "lucide-react";
import { exportCatalogToPDF } from "@/utils/pdfExport";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Estimate {
  id: string;
  estimate_name: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_cost: number;
  final_selling_price: number;
  status: string;
  updated_at: string;
}

const EstimateHistory = () => {
  const navigate = useNavigate();
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [filteredEstimates, setFilteredEstimates] = useState<Estimate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEstimates();
  }, []);

  useEffect(() => {
    filterEstimates();
  }, [searchTerm, statusFilter, estimates]);

  const fetchEstimates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to view estimates");
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("manufacturing_cost_estimates")
        .select("*")
        .eq("user_id", user.id)
        .or("is_invoice_generated.is.null,is_invoice_generated.eq.false")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setEstimates(data || []);
    } catch (error: any) {
      toast.error("Failed to load estimates");
      console.error("Error fetching estimates:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterEstimates = () => {
    let filtered = estimates;

    if (searchTerm) {
      filtered = filtered.filter(
        (estimate) =>
          estimate.estimate_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          estimate.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          estimate.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((estimate) => estimate.status === statusFilter);
    }

    setFilteredEstimates(filtered);
  };

  const handleViewEstimate = (estimateId: string) => {
    navigate(`/manufacturing-cost?estimate=${estimateId}`);
  };

  const handleConvertToInvoice = (estimateId: string) => {
    navigate(`/invoice-generator?estimate=${estimateId}`);
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
                Estimate History
              </CardTitle>
              <Badge variant="secondary" className="text-sm">
                {filteredEstimates.length} {filteredEstimates.length === 1 ? "Estimate" : "Estimates"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by estimate name, customer name or email..."
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
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="rounded-lg border bg-card p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-48 bg-muted animate-pulse rounded-lg" />
                          <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                          <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                        </div>
                        <div className="h-6 w-28 bg-muted animate-pulse rounded" />
                      </div>
                      <div className="flex gap-3">
                        <div className="h-10 w-20 bg-muted animate-pulse rounded" />
                        <div className="h-10 w-32 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredEstimates.length === 0 ? (
              <div className="text-center py-16">
                <div className="p-4 rounded-full bg-muted/50 inline-block mb-4">
                  <FileText className="h-16 w-16 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No estimates found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Start creating estimates to see them here"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEstimates.map((estimate) => (
                  <Card 
                    key={estimate.id} 
                    className="group hover:shadow-lg hover:border-primary/20 transition-all duration-200 bg-gradient-to-br from-card to-card/50"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-lg">
                              <FileText className="h-4 w-4 text-primary" />
                              <h3 className="font-bold text-lg">{estimate.estimate_name}</h3>
                            </div>
                            <Badge 
                              variant={estimate.status === "completed" ? "default" : "secondary"}
                              className="capitalize"
                            >
                              {estimate.status?.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium text-muted-foreground">Customer:</span>
                              <span className="text-foreground">{estimate.customer_name || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium text-muted-foreground">Created:</span>
                              <span className="text-foreground">
                                {new Date(estimate.created_at).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-baseline gap-2 pt-1">
                            <span className="text-sm font-medium text-muted-foreground">Amount:</span>
                            <span className="text-2xl font-bold text-primary">
                              ₹{estimate.final_selling_price?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            size="default"
                            onClick={() => handleViewEstimate(estimate.id)}
                            className="group/btn"
                          >
                            <Eye className="h-4 w-4 mr-2 transition-transform group-hover/btn:scale-110" />
                            View
                          </Button>
                          <Button
                            size="default"
                            onClick={() => handleConvertToInvoice(estimate.id)}
                            className="group/btn bg-primary hover:bg-primary/90"
                          >
                            <FileCheck className="h-4 w-4 mr-2 transition-transform group-hover/btn:scale-110" />
                            Create Invoice
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

export default EstimateHistory;
