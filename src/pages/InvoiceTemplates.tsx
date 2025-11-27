import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Copy, Star, StarOff } from "lucide-react";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { InvoiceTemplate, InvoiceTemplateData } from "@/types/invoiceTemplate";

const InvoiceTemplates = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    fetchTemplates();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to manage templates");
      navigate("/auth");
      return;
    }
  };

  const fetchTemplates = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("invoice_templates")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to load templates");
    } else {
      setTemplates((data || []).map(d => ({
        ...d,
        template_data: d.template_data as unknown as InvoiceTemplateData
      })));
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from("invoice_templates")
      .delete()
      .eq("id", deleteId);

    if (error) {
      toast.error("Failed to delete template");
      console.error(error);
    } else {
      toast.success("Template deleted successfully");
      fetchTemplates();
    }
    setDeleteId(null);
  };

  const handleDuplicate = async (template: InvoiceTemplate) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("invoice_templates")
      .insert({
        user_id: user.id,
        name: `${template.name} (Copy)`,
        description: template.description,
        template_data: template.template_data as unknown as any,
        is_default: false,
      });

    if (error) {
      toast.error("Failed to duplicate template");
      console.error(error);
    } else {
      toast.success("Template duplicated successfully");
      fetchTemplates();
    }
  };

  const handleToggleDefault = async (template: InvoiceTemplate) => {
    const { error } = await supabase
      .from("invoice_templates")
      .update({ is_default: !template.is_default })
      .eq("id", template.id!);

    if (error) {
      toast.error("Failed to update template");
      console.error(error);
    } else {
      toast.success(template.is_default ? "Removed from default" : "Set as default");
      fetchTemplates();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <BackToHomeButton />
          <Button onClick={() => navigate("/invoice-template-builder")}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Template
          </Button>
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Invoice Templates
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your custom invoice layouts
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading templates...</p>
          </div>
        ) : templates.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No templates yet. Create your first custom invoice template!
              </p>
              <Button onClick={() => navigate("/invoice-template-builder")}>
                <Plus className="mr-2 h-4 w-4" />
                Create Template
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      {template.is_default && (
                        <Badge className="mt-2" variant="secondary">
                          Default
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleDefault(template)}
                    >
                      {template.is_default ? (
                        <StarOff className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <Star className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {template.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                  )}

                  <div className="text-xs text-muted-foreground">
                    {template.template_data.sections?.length || 0} sections
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/invoice-template-builder/${template.id}`)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicate(template)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteId(template.id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Template</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this template? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default InvoiceTemplates;
