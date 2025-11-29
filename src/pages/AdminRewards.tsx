import { useState, useEffect } from "react";
import { AdminGuard } from "@/components/AdminGuard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Gift, Plus, Edit, Trash2, TrendingUp, Users, Award } from "lucide-react";
import { format } from "date-fns";

interface Reward {
  id: string;
  name: string;
  description: string;
  points_cost: number;
  reward_type: string;
  reward_value: any;
  is_active: boolean;
}

interface RedemptionStats {
  total_redemptions: number;
  total_points_spent: number;
  active_redemptions: number;
}

const AdminRewards = () => {
  const { toast } = useToast();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [stats, setStats] = useState<RedemptionStats>({ total_redemptions: 0, total_points_spent: 0, active_redemptions: 0 });
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    points_cost: "",
    reward_type: "extra_products",
    reward_value_amount: "",
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchRewards(), fetchRedemptions(), fetchStats()]);
    setLoading(false);
  };

  const fetchRewards = async () => {
    const { data, error } = await supabase
      .from('rewards_catalog')
      .select('*')
      .order('points_cost', { ascending: true });

    if (!error && data) {
      setRewards(data);
    }
  };

  const fetchRedemptions = async () => {
    const { data, error } = await supabase
      .from('redemptions')
      .select('*')
      .order('redeemed_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setRedemptions(data);
    }
  };

  const fetchStats = async () => {
    const { data, error } = await supabase
      .from('redemptions')
      .select('points_spent, status');

    if (!error && data) {
      const total_redemptions = data.length;
      const total_points_spent = data.reduce((sum, r) => sum + r.points_spent, 0);
      const active_redemptions = data.filter(r => r.status === 'applied').length;
      setStats({ total_redemptions, total_points_spent, active_redemptions });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const rewardValue: any = {
      amount: parseInt(formData.reward_value_amount) || 0,
    };

    if (formData.reward_type === 'premium_support') {
      rewardValue.duration_days = parseInt(formData.reward_value_amount) || 30;
      delete rewardValue.amount;
    }

    const rewardData = {
      name: formData.name,
      description: formData.description,
      points_cost: parseInt(formData.points_cost),
      reward_type: formData.reward_type,
      reward_value: rewardValue,
      is_active: formData.is_active,
    };

    if (editingReward) {
      const { error } = await supabase
        .from('rewards_catalog')
        .update(rewardData)
        .eq('id', editingReward.id);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Reward updated successfully" });
        setIsDialogOpen(false);
        fetchRewards();
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from('rewards_catalog')
        .insert([rewardData]);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Reward created successfully" });
        setIsDialogOpen(false);
        fetchRewards();
        resetForm();
      }
    }
  };

  const handleEdit = (reward: Reward) => {
    setEditingReward(reward);
    setFormData({
      name: reward.name,
      description: reward.description || "",
      points_cost: reward.points_cost.toString(),
      reward_type: reward.reward_type,
      reward_value_amount: (reward.reward_value.amount || reward.reward_value.duration_days || "").toString(),
      is_active: reward.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this reward?")) return;

    const { error } = await supabase
      .from('rewards_catalog')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Reward deleted successfully" });
      fetchRewards();
    }
  };

  const toggleActive = async (reward: Reward) => {
    const { error } = await supabase
      .from('rewards_catalog')
      .update({ is_active: !reward.is_active })
      .eq('id', reward.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      fetchRewards();
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      points_cost: "",
      reward_type: "extra_products",
      reward_value_amount: "",
      is_active: true,
    });
    setEditingReward(null);
  };

  if (loading) {
    return (
      <AdminGuard>
        <div className="container mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-muted rounded w-1/4"></div>
            <div className="grid md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted rounded"></div>)}
            </div>
          </div>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Rewards Management</h1>
            <p className="text-muted-foreground">Manage reward catalog and view redemption analytics</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Reward
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingReward ? "Edit Reward" : "Add New Reward"}</DialogTitle>
                <DialogDescription>Create or update a reward in the catalog</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Reward Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="points_cost">Points Cost</Label>
                  <Input
                    id="points_cost"
                    type="number"
                    value={formData.points_cost}
                    onChange={(e) => setFormData({ ...formData, points_cost: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="reward_type">Reward Type</Label>
                  <Select value={formData.reward_type} onValueChange={(value) => setFormData({ ...formData, reward_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="extra_products">Extra Products</SelectItem>
                      <SelectItem value="extra_share_links">Extra Share Links</SelectItem>
                      <SelectItem value="premium_support">Premium Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="reward_value_amount">
                    {formData.reward_type === 'premium_support' ? 'Duration (days)' : 'Amount'}
                  </Label>
                  <Input
                    id="reward_value_amount"
                    type="number"
                    value={formData.reward_value_amount}
                    onChange={(e) => setFormData({ ...formData, reward_value_amount: e.target.value })}
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                <Button type="submit" className="w-full">
                  {editingReward ? "Update Reward" : "Create Reward"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Redemptions</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_redemptions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Points Spent</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_points_spent.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Rewards</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active_redemptions}</div>
            </CardContent>
          </Card>
        </div>

        {/* Rewards Table */}
        <Card>
          <CardHeader>
            <CardTitle>Rewards Catalog</CardTitle>
            <CardDescription>Manage available rewards</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reward</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rewards.map((reward) => (
                  <TableRow key={reward.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{reward.name}</div>
                        <div className="text-sm text-muted-foreground">{reward.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{reward.reward_type.replace(/_/g, ' ')}</Badge>
                    </TableCell>
                    <TableCell>{reward.points_cost} pts</TableCell>
                    <TableCell>
                      <Badge variant={reward.is_active ? "default" : "secondary"}>
                        {reward.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(reward)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => toggleActive(reward)}>
                          {reward.is_active ? "Disable" : "Enable"}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(reward.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Redemptions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Redemptions</CardTitle>
            <CardDescription>Latest reward redemptions by vendors</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Points Spent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {redemptions.slice(0, 10).map((redemption) => (
                  <TableRow key={redemption.id}>
                    <TableCell className="font-mono text-xs">{redemption.user_id.substring(0, 8)}...</TableCell>
                    <TableCell>{redemption.points_spent} pts</TableCell>
                    <TableCell>
                      <Badge variant={redemption.status === 'applied' ? "default" : "secondary"}>
                        {redemption.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(redemption.redeemed_at), 'MMM d, yyyy')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  );
};

export default AdminRewards;