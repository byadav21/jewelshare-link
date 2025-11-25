import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, X, Trash2 } from "lucide-react";

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

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Comment Moderation</h1>

        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className="space-y-4">
            {comments?.map((comment) => (
              <Card key={comment.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        {comment.author_name}
                      </CardTitle>
                      <div className="text-sm text-muted-foreground">
                        {comment.author_email} •{" "}
                        {new Date(comment.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Post: {comment.blog_posts?.title}
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      {comment.status === "pending" ? (
                        <Badge variant="outline">Pending</Badge>
                      ) : comment.status === "approved" ? (
                        <Badge>Approved</Badge>
                      ) : (
                        <Badge variant="destructive">Rejected</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{comment.content}</p>
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
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteMutation.mutate(comment.id)}
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
