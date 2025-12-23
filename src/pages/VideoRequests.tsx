import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Video, Clock, CheckCircle, XCircle, MessageSquare, Mail, Phone, Calendar } from "lucide-react";
import { format } from "date-fns";

interface VideoRequest {
  id: string;
  product_id: string | null;
  share_link_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  requested_products: string;
  status: string;
  created_at: string;
  updated_at: string;
  products?: {
    name: string;
    sku: string;
  };
}

const VideoRequests = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [requests, setRequests] = useState<VideoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<VideoRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchVideoRequests();
  }, []);

  const fetchVideoRequests = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Get user's share links
      const { data: shareLinks } = await supabase
        .from("share_links")
        .select("id")
        .eq("user_id", user.id);

      if (!shareLinks || shareLinks.length === 0) {
        setRequests([]);
        setLoading(false);
        return;
      }

      const shareLinkIds = shareLinks.map((link) => link.id);

      // Fetch video requests for these share links
      const { data, error } = await supabase
        .from("video_requests")
        .select(`
          *,
          products:product_id (
            name,
            sku
          )
        `)
        .in("share_link_id", shareLinkIds)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch video requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("video_requests")
        .update({ status: newStatus })
        .eq("id", requestId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Request status changed to ${newStatus}`,
      });

      // Refresh the list
      fetchVideoRequests();
      setSelectedRequest(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "fulfilled":
        return <CheckCircle className="h-4 w-4" />;
      case "declined":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "pending":
        return "secondary";
      case "fulfilled":
        return "default";
      case "declined":
        return "destructive";
      default:
        return "outline";
    }
  };

  const filteredRequests = requests.filter((req) => 
    statusFilter === "all" || req.status === statusFilter
  );

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    fulfilled: requests.filter((r) => r.status === "fulfilled").length,
    declined: requests.filter((r) => r.status === "declined").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Video className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-xl text-foreground">Loading video requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Catalog
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Video Requests</h1>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Fulfilled</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{stats.fulfilled}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Declined</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">{stats.declined}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requests</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="fulfilled">Fulfilled</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">No video requests found</p>
              <p className="text-sm text-muted-foreground mt-2">
                {statusFilter !== "all" 
                  ? `No ${statusFilter} requests at the moment`
                  : "Video requests will appear here when customers request them"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{request.customer_name}</CardTitle>
                        <Badge variant={getStatusVariant(request.status)} className="gap-1">
                          {getStatusIcon(request.status)}
                          {request.status}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(request.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                        {request.products && (
                          <span className="font-medium text-primary">
                            Product: {request.products.name} ({request.products.sku})
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedRequest(request)}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Video Request Details</DialogTitle>
                          <DialogDescription>
                            Manage this video request and update its status
                          </DialogDescription>
                        </DialogHeader>
                        {selectedRequest && (
                          <div className="space-y-6">
                            {/* Customer Info */}
                            <div className="space-y-3">
                              <h3 className="font-semibold text-sm text-muted-foreground">Customer Information</h3>
                              <div className="grid gap-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="h-4 w-4 text-muted-foreground" />
                                  <a href={`mailto:${selectedRequest.customer_email}`} className="text-primary hover:underline">
                                    {selectedRequest.customer_email}
                                  </a>
                                </div>
                                {selectedRequest.customer_phone && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <a href={`tel:${selectedRequest.customer_phone}`} className="text-primary hover:underline">
                                      {selectedRequest.customer_phone}
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Requested Products */}
                            <div className="space-y-3">
                              <h3 className="font-semibold text-sm text-muted-foreground">What They Want to See</h3>
                              <div className="bg-muted p-4 rounded-lg">
                                <p className="text-sm whitespace-pre-wrap">{selectedRequest.requested_products}</p>
                              </div>
                            </div>

                            {/* Status Update */}
                            <div className="space-y-3">
                              <h3 className="font-semibold text-sm text-muted-foreground">Update Status</h3>
                              <div className="flex gap-2">
                                <Button
                                  variant={selectedRequest.status === "pending" ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => updateRequestStatus(selectedRequest.id, "pending")}
                                  className="flex-1"
                                >
                                  <Clock className="h-4 w-4 mr-2" />
                                  Pending
                                </Button>
                                <Button
                                  variant={selectedRequest.status === "fulfilled" ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => updateRequestStatus(selectedRequest.id, "fulfilled")}
                                  className="flex-1"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Fulfilled
                                </Button>
                                <Button
                                  variant={selectedRequest.status === "declined" ? "destructive" : "outline"}
                                  size="sm"
                                  onClick={() => updateRequestStatus(selectedRequest.id, "declined")}
                                  className="flex-1"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Declined
                                </Button>
                              </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="pt-4 border-t">
                              <p className="text-sm text-muted-foreground mb-3">Quick Actions</p>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(`mailto:${selectedRequest.customer_email}`, '_blank')}
                                >
                                  <Mail className="h-4 w-4 mr-2" />
                                  Email Customer
                                </Button>
                                {selectedRequest.customer_phone && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(`https://wa.me/${selectedRequest.customer_phone.replace(/\D/g, '')}`, '_blank')}
                                  >
                                    <Phone className="h-4 w-4 mr-2" />
                                    WhatsApp
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Mail className="h-3 w-3" />
                    {request.customer_email}
                    {request.customer_phone && (
                      <>
                        <span className="mx-2">•</span>
                        <Phone className="h-3 w-3" />
                        {request.customer_phone}
                      </>
                    )}
                  </div>
                  <p className="text-sm text-foreground line-clamp-2">{request.requested_products}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoRequests;
