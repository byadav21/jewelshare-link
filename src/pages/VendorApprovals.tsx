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
  user_email?: string;
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
      .select("*")
      .order("requested_at", { ascending: false });

    if (error) {
      console.error("Error fetching approvals:", error);
      toast({
        title: "Error",
        description: "Failed to fetch vendor approvals",
        variant: "destructive",
      });
    } else {
      // Fetch user emails
      const approvalsWithEmails = await Promise.all(
        (data || []).map(async (approval) => {
          const { data: userData } = await supabase.auth.admin.getUserById(approval.user_id);
          return {
            ...approval,
            user_email: userData?.user?.email || "N/A",
          };
        })
      );
      setApprovals(approvalsWithEmails);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      fetchApprovals();
    }
  }, [isAdmin]);

  const handleApprove = async (approval: VendorApproval) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error: updateError } = await supabase
      .from("user_approval_status")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id,
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
      description: "The vendor has been approved successfully.",
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
                        <TableHead>Requested</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApprovals.map((approval) => (
                        <TableRow key={approval.id}>
                          <TableCell className="font-medium">{approval.user_email}</TableCell>
                          <TableCell>{approval.business_name || "N/A"}</TableCell>
                          <TableCell>{approval.phone || "N/A"}</TableCell>
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
