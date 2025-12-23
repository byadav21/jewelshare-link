import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, Search, Gift, Users, TrendingUp, Mail } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface ScratchLead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  business_name: string | null;
  interest: string | null;
  created_at: string;
  session_id: string;
}

interface ScratchReward {
  id: string;
  session_id: string;
  reward_type: string;
  reward_value: string;
  claimed: boolean;
  created_at: string;
}

interface LeadWithReward extends ScratchLead {
  reward?: ScratchReward;
}

export default function ScratchLeads() {
  const [leads, setLeads] = useState<LeadWithReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalLeads: 0,
    winners: 0,
    nonWinners: 0,
    claimedRewards: 0,
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);

      // Fetch all leads
      const { data: leadsData, error: leadsError } = await supabase
        .from("scratch_leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (leadsError) throw leadsError;

      // Fetch all rewards
      const { data: rewardsData, error: rewardsError } = await supabase
        .from("scratch_rewards")
        .select("*");

      if (rewardsError) throw rewardsError;

      // Merge leads with their rewards
      const leadsWithRewards: LeadWithReward[] = (leadsData || []).map((lead) => ({
        ...lead,
        reward: rewardsData?.find((reward) => reward.session_id === lead.session_id),
      }));

      setLeads(leadsWithRewards);

      // Calculate stats
      const winners = leadsWithRewards.filter((l) => l.reward?.reward_type === "winner").length;
      const claimed = leadsWithRewards.filter((l) => l.reward?.claimed).length;

      setStats({
        totalLeads: leadsWithRewards.length,
        winners: winners,
        nonWinners: leadsWithRewards.length - winners,
        claimedRewards: claimed,
      });
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast.error("Failed to load scratch card leads");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Phone", "Business Name", "Interest", "Status", "Reward", "Claimed", "Date"];
    const rows = filteredLeads.map((lead) => [
      lead.name,
      lead.email,
      lead.phone || "",
      lead.business_name || "",
      lead.interest || "",
      lead.reward ? "Winner" : "Non-Winner",
      lead.reward?.reward_value || "N/A",
      lead.reward?.claimed ? "Yes" : "No",
      format(new Date(lead.created_at), "yyyy-MM-dd HH:mm"),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scratch-leads-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Leads exported successfully!");
  };

  const filteredLeads = leads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.business_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Scratch Card Leads</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all leads captured from the Scratch & Win game
            </p>
          </div>
          <Button onClick={exportToCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLeads}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Winners</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.winners}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalLeads > 0 ? Math.round((stats.winners / stats.totalLeads) * 100) : 0}% win rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Non-Winners</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.nonWinners}</div>
              <p className="text-xs text-muted-foreground mt-1">Follow-up opportunities</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Claimed Rewards</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.claimedRewards}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.winners > 0 ? Math.round((stats.claimedRewards / stats.winners) * 100) : 0}% claim rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or business name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading leads...</div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? "No leads found matching your search." : "No leads captured yet."}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Interest</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reward</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.phone || "-"}</TableCell>
                      <TableCell>{lead.business_name || "-"}</TableCell>
                      <TableCell>{lead.interest || "-"}</TableCell>
                      <TableCell>
                        {lead.reward ? (
                          <Badge variant="default" className="bg-green-500">
                            Winner
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Non-Winner</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {lead.reward ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-sm">{lead.reward.reward_value}</span>
                            {lead.reward.claimed && (
                              <Badge variant="outline" className="w-fit">
                                Claimed
                              </Badge>
                            )}
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(lead.created_at), "MMM dd, yyyy HH:mm")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
