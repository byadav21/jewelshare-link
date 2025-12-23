import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ApprovalGuard } from "@/components/ApprovalGuard";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Trash2, UserPlus } from "lucide-react";

interface TeamMember {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export default function TeamManagement() {
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberPassword, setNewMemberPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      toast.error("Access denied. Admin only.");
      navigate("/catalog");
    }
  }, [isAdmin, roleLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchTeamMembers();
    }
  }, [isAdmin]);

  const fetchTeamMembers = async () => {
    const { data, error } = await supabase
      .from("user_roles")
      .select(`
        id,
        role,
        created_at,
        user_id
      `)
      .eq("role", "team_member");

    if (error) {
      toast.error("Failed to fetch team members");
      return;
    }

    // Fetch user emails from auth
    const userIds = data.map(m => m.user_id);
    const members: TeamMember[] = [];

    for (const member of data) {
      const { data: userData } = await supabase.auth.admin.getUserById(member.user_id);
      if (userData.user) {
        members.push({
          id: member.id,
          email: userData.user.email || "Unknown",
          role: member.role,
          created_at: member.created_at,
        });
      }
    }

    setTeamMembers(members);
  };

  const handleAddTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create new user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newMemberEmail,
        password: newMemberPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/catalog`,
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("Failed to create user");
      }

      // Assign team_member role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: authData.user.id,
          role: "team_member",
        });

      if (roleError) throw roleError;

      // Auto-approve admin-created accounts
      const { error: approvalError } = await supabase
        .from("user_approval_status")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq("user_id", authData.user.id);

      if (approvalError) {
        console.error("Error approving user:", approvalError);
      }

      toast.success("Team member added and approved successfully");
      setNewMemberEmail("");
      setNewMemberPassword("");
      fetchTeamMembers();
    } catch (error: any) {
      toast.error(error.message || "Failed to add team member");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveTeamMember = async (roleId: string) => {
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("id", roleId);

    if (error) {
      toast.error("Failed to remove team member");
      return;
    }

    toast.success("Team member removed successfully");
    fetchTeamMembers();
  };

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <ApprovalGuard>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Team Management</h1>
              <p className="text-muted-foreground mt-2">Manage your team members and their access</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/catalog")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Catalog
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Add Team Member</CardTitle>
              <CardDescription>
                Create a new team member account. They will be able to view inventory and create share links.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddTeamMember} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={newMemberPassword}
                    onChange={(e) => setNewMemberPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {isLoading ? "Adding..." : "Add Team Member"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                View and manage all team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No team members yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    teamMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">Team Member</Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(member.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveTeamMember(member.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </ApprovalGuard>
  );
}
