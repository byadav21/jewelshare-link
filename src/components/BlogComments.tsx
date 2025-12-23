import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const commentSchema = z.object({
  author_name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  author_email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  content: z.string().trim().min(10, "Comment must be at least 10 characters").max(1000, "Comment must be less than 1000 characters"),
});

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
  status: string;
}

interface BlogCommentsProps {
  blogPostId: string;
}

export const BlogComments = ({ blogPostId }: BlogCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    author_name: "",
    author_email: "",
    content: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
  }, [blogPostId]);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("blog_comments")
      .select("*")
      .eq("blog_post_id", blogPostId)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching comments:", error);
    } else {
      setComments(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validation = commentSchema.safeParse(formData);

      if (!validation.success) {
        toast({
          title: "Validation Error",
          description: validation.error.issues[0].message,
          variant: "destructive",
        });
        return;
      }

      setSubmitting(true);

      const { error } = await supabase.from("blog_comments").insert([{
        blog_post_id: blogPostId,
        author_name: validation.data.author_name,
        author_email: validation.data.author_email,
        content: validation.data.content,
        status: "pending",
      }]);

      if (error) throw error;

      toast({
        title: "Comment Submitted!",
        description: "Your comment is pending moderation and will appear shortly.",
      });

      setFormData({ author_name: "", author_email: "", content: "" });
    } catch (error) {
      console.error("Comment submission error:", error);
      toast({
        title: "Submission Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      {/* Comment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Leave a Comment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Input
                  placeholder="Your Name"
                  value={formData.author_name}
                  onChange={(e) =>
                    setFormData({ ...formData, author_name: e.target.value })
                  }
                  maxLength={100}
                  required
                />
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Your Email"
                  value={formData.author_email}
                  onChange={(e) =>
                    setFormData({ ...formData, author_email: e.target.value })
                  }
                  maxLength={255}
                  required
                />
              </div>
            </div>
            <Textarea
              placeholder="Share your thoughts..."
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              maxLength={1000}
              rows={4}
              required
            />
            <Button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-category-jewellery to-category-gemstone"
            >
              <Send className="mr-2 h-4 w-4" />
              {submitting ? "Submitting..." : "Post Comment"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">
          Comments ({comments.length})
        </h3>
        {loading ? (
          <p className="text-muted-foreground">Loading comments...</p>
        ) : comments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No comments yet. Be the first to comment!
            </CardContent>
          </Card>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarFallback>
                      {comment.author_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <p className="font-semibold">{comment.author_name}</p>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};