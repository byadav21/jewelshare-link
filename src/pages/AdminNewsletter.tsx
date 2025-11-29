import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash2, Mail, MailOpen } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminLoadingSkeleton } from "@/components/admin/AdminLoadingSkeleton";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";

interface Subscriber {
  id: string;
  email: string;
  is_active: boolean;
  subscribed_at: string;
}

export default function AdminNewsletter() {
  const queryClient = useQueryClient();

  const { data: subscribers, isLoading } = useQuery({
    queryKey: ["admin-newsletter"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("subscribed_at", { ascending: false });
      if (error) throw error;
      return data as Subscriber[];
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-newsletter"] });
      toast.success("Subscriber status updated");
    },
    onError: () => toast.error("Failed to update subscriber"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-newsletter"] });
      toast.success("Subscriber deleted");
    },
    onError: () => toast.error("Failed to delete subscriber"),
  });

  const activeCount = subscribers?.filter((s) => s.is_active).length || 0;
  const totalCount = subscribers?.length || 0;

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Newsletter Subscribers
          </h1>
          <p className="text-muted-foreground mt-1">Manage your email newsletter subscribers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-card border-border/50 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Subscribers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalCount}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-success border-border/50 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-success-foreground">
                Active Subscribers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">{activeCount}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-border/50 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Inactive Subscribers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalCount - activeCount}</div>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <AdminLoadingSkeleton />
        ) : !subscribers || subscribers.length === 0 ? (
          <AdminEmptyState
            icon={MailOpen}
            title="No subscribers yet"
            description="Email subscribers will appear here when visitors sign up for your newsletter"
          />
        ) : (
          <Card className="bg-gradient-card border-border/50 shadow-md">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead className="font-semibold">Email</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Subscribed</TableHead>
                      <TableHead className="text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscribers.map((subscriber) => (
                      <TableRow
                        key={subscriber.id}
                        className="border-border/50 hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="font-medium">
                          {subscriber.email}
                        </TableCell>
                        <TableCell>
                          {subscriber.is_active ? (
                            <Badge className="bg-success text-success-foreground">Active</Badge>
                          ) : (
                            <Badge variant="outline">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(subscriber.subscribed_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                toggleActiveMutation.mutate({
                                  id: subscriber.id,
                                  is_active: !subscriber.is_active,
                                })
                              }
                              className="hover:bg-primary/10 hover:border-primary transition-colors"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteMutation.mutate(subscriber.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
