import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { ApprovalGuard } from "@/components/ApprovalGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface VendorApproval {
  id: string;
  user_id: string;
  status: "pending" | "approved" | "rejected";
  requested_at: string;
  reviewed_at: string | null;
  rejection_reason: string | null;
  business_name: string | null;
  phone: string | null;
  notes: string | null;
  email: string | null;
}

const VendorApprovals = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [approvals, setApprovals] = useState<VendorApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApproval, setSelectedApproval] = useState<VendorApproval | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [categorySelections, setCategorySelections] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate("/catalog");
    }
  }, [isAdmin, roleLoading, navigate]);

  const fetchApprovals = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_approval_status")
      .select(`
        *,
        vendor_profiles!inner(seller_categories)
      `)
      .order("requested_at", { ascending: false });

    if (error) {
      console.error("Error fetching approvals:", error);
      toast({
        title: "Error",
        description: "Failed to fetch vendor approvals",
        variant: "destructive",
      });
      setApprovals([]);
    } else {
      setApprovals(data || []);
      
      // Initialize category selections with seller's requested categories
      const initialSelections: Record<string, string[]> = {};
      data?.forEach(approval => {
        const sellerCategories = (approval as any).vendor_profiles?.seller_categories || ["Jewellery"];
        initialSelections[approval.id] = sellerCategories;
      });
      setCategorySelections(initialSelections);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      fetchApprovals();
    }
  }, [isAdmin]);

  const handleApprove = async (approval: VendorApproval) => {
    const approvedCategories = categorySelections[approval.id] || [];
    
    if (approvedCategories.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one category to approve",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    const { error: updateError } = await supabase
      .from("user_approval_status")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id,
        approved_categories: approvedCategories
      })
      .eq("id", approval.id);

    if (updateError) {
      toast({
        title: "Error",
        description: "Failed to approve vendor",
        variant: "destructive",
      });
      return;
    }

    // Optionally assign team_member role
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({
        user_id: approval.user_id,
        role: "team_member",
      });

    if (roleError && !roleError.message.includes("duplicate")) {
      console.error("Error assigning role:", roleError);
    }

    toast({
      title: "Vendor Approved",
      description: `The vendor has been approved for ${approvedCategories.join(", ")}.`,
    });

    fetchApprovals();
  };

  const handleReject = async () => {
    if (!selectedApproval || !rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("user_approval_status")
      .update({
        status: "rejected",
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id,
        rejection_reason: rejectionReason,
      })
      .eq("id", selectedApproval.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to reject vendor",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Vendor Rejected",
      description: "The vendor has been rejected.",
    });

    setRejectDialogOpen(false);
    setSelectedApproval(null);
    setRejectionReason("");
    fetchApprovals();
  };

  const openRejectDialog = (approval: VendorApproval) => {
    setSelectedApproval(approval);
    setRejectDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredApprovals = approvals.filter(
    (a) => activeTab === "all" || a.status === activeTab
  );

  const pendingCount = approvals.filter((a) => a.status === "pending").length;

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <ApprovalGuard>
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Vendor Approvals</h1>
            <p className="text-muted-foreground mt-1">Review and manage vendor access requests</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/admin")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Vendor Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="pending">
                  Pending {pendingCount > 0 && `(${pendingCount})`}
                </TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {filteredApprovals.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No {activeTab} vendors found</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Business Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Requested Categories</TableHead>
                        <TableHead>Approve Categories</TableHead>
                        <TableHead>Requested</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApprovals.map((approval) => (
                        <TableRow key={approval.id}>
                          <TableCell className="font-medium">{approval.email || "N/A"}</TableCell>
                          <TableCell>{approval.business_name || "N/A"}</TableCell>
                          <TableCell>{approval.phone || "N/A"}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {((approval as any).vendor_profiles?.seller_categories || ["Jewellery"]).join(", ")}
                            </div>
                          </TableCell>
                          <TableCell>
                            {approval.status === "pending" ? (
                              <div className="space-y-2">
                                {["Jewellery", "Gemstones", "Loose Diamonds"].map((category) => {
                                  const requestedCategories = (approval as any).vendor_profiles?.seller_categories || ["Jewellery"];
                                  const isRequested = requestedCategories.includes(category);
                                  
                                  return (
                                    <div key={category} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`${approval.id}-${category}`}
                                        checked={categorySelections[approval.id]?.includes(category) || false}
                                        onCheckedChange={(checked) => {
                                          const current = categorySelections[approval.id] || [];
                                          const updated = checked
                                            ? [...current, category]
                                            : current.filter(c => c !== category);
                                          setCategorySelections({
                                            ...categorySelections,
                                            [approval.id]: updated
                                          });
                                        }}
                                        disabled={!isRequested}
                                      />
                                      <Label 
                                        htmlFor={`${approval.id}-${category}`} 
                                        className={`text-xs cursor-pointer ${!isRequested ? "text-muted-foreground" : ""}`}
                                      >
                                        {category}
                                      </Label>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-sm">
                                {(approval as any).approved_categories?.join(", ") || "N/A"}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(approval.requested_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{getStatusBadge(approval.status)}</TableCell>
                          <TableCell>
                            {approval.status === "pending" && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleApprove(approval)}
                                >
                                  <CheckCircle className="mr-1 h-4 w-4" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => openRejectDialog(approval)}
                                >
                                  <XCircle className="mr-1 h-4 w-4" />
                                  Reject
                                </Button>
                              </div>
                            )}
                            {approval.status === "rejected" && approval.rejection_reason && (
                              <p className="text-sm text-muted-foreground">
                                Reason: {approval.rejection_reason}
                              </p>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Vendor Application</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this vendor application.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px]"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject}>
                Reject Vendor
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ApprovalGuard>
  );
};

export default VendorApprovals;
