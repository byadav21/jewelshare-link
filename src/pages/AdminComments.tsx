import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, X, Trash2, MessageSquare } from "lucide-react";
import { AdminLoadingSkeleton } from "@/components/admin/AdminLoadingSkeleton";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";

interface BlogComment {
  id: string;
  blog_post_id: string;
  author_name: string;
  author_email: string;
  content: string;
  status: string;
  created_at: string;
  blog_posts: {
    title: string;
  };
}

export default function AdminComments() {
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery({
    queryKey: ["admin-comments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_comments")
        .select("*, blog_posts(title)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BlogComment[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("blog_comments")
        .update({ 
          status,
          moderated_at: new Date().toISOString(),
          moderated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-comments"] });
      toast.success("Comment status updated");
    },
    onError: () => toast.error("Failed to update comment"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("blog_comments")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-comments"] });
      toast.success("Comment deleted");
    },
    onError: () => toast.error("Failed to delete comment"),
  });

  const pendingCount = comments?.filter((c) => c.status === "pending").length || 0;
  const approvedCount = comments?.filter((c) => c.status === "approved").length || 0;

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Comment Moderation
          </h1>
          <p className="text-muted-foreground mt-1">Review and moderate blog comments</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-card border-border/50 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{comments?.length || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-info border-border/50 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-info-foreground">
                Pending Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-info">{pendingCount}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-success border-border/50 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-success-foreground">
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">{approvedCount}</div>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <AdminLoadingSkeleton />
        ) : !comments || comments.length === 0 ? (
          <AdminEmptyState
            icon={MessageSquare}
            title="No comments yet"
            description="Comments will appear here when visitors start engaging with your blog posts"
          />
        ) : (
          <div className="space-y-4">
            {comments.map((comment, index) => (
              <Card
                key={comment.id}
                className="bg-gradient-card border-border/50 shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-lg">{comment.author_name}</CardTitle>
                        {comment.status === "pending" ? (
                          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                            Pending
                          </Badge>
                        ) : comment.status === "approved" ? (
                          <Badge className="bg-success text-success-foreground">Approved</Badge>
                        ) : (
                          <Badge variant="destructive">Rejected</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>{comment.author_email}</p>
                        <p className="flex items-center gap-2">
                          <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="text-foreground/70">{comment.blog_posts?.title}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-relaxed border-l-2 border-primary/30 pl-4 py-2">
                    {comment.content}
                  </p>
                  <div className="flex gap-2">
                    {comment.status !== "approved" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          updateStatusMutation.mutate({
                            id: comment.id,
                            status: "approved",
                          })
                        }
                        className="bg-success hover:bg-success/90 text-success-foreground shadow-md"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    )}
                    {comment.status !== "rejected" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateStatusMutation.mutate({
                            id: comment.id,
                            status: "rejected",
                          })
                        }
                        className="hover:bg-destructive/10 hover:border-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteMutation.mutate(comment.id)}
                      className="ml-auto"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
