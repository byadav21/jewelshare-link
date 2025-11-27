import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Save, Eye, Plus } from "lucide-react";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { Switch } from "@/components/ui/switch";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { SortableSection } from "@/components/invoice-template/SortableSection";
import { TemplatePreview } from "@/components/invoice-template/TemplatePreview";
import { StylingControls } from "@/components/invoice-template/StylingControls";
import { InvoiceTemplate, InvoiceTemplateData, TemplateSection, DEFAULT_SECTIONS } from "@/types/invoiceTemplate";
import { LogoUpload } from "@/components/LogoUpload";
import { MediaUpload } from "@/components/MediaUpload";

const InvoiceTemplateBuilder = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [sections, setSections] = useState<TemplateSection[]>(DEFAULT_SECTIONS);
  const [globalStyling, setGlobalStyling] = useState({
    primaryColor: "#4F46E5",
    secondaryColor: "#8B5CF6",
    fontFamily: "Arial",
    pageMargin: 20,
    logoUrl: "",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (id && user) {
      loadTemplate();
    }
  }, [id, user]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to create templates");
      navigate("/auth");
      return;
    }
    setUser(user);
  };

  const loadTemplate = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from("invoice_templates")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast.error("Failed to load template");
      console.error(error);
      return;
    }

    if (data) {
      setTemplateName(data.name);
      setTemplateDescription(data.description || "");
      setIsDefault(data.is_default);
      const templateData = data.template_data as unknown as InvoiceTemplateData;
      setSections(templateData.sections || DEFAULT_SECTIONS);
      if (templateData.globalStyling) {
        setGlobalStyling({
          primaryColor: templateData.globalStyling.primaryColor || "#4F46E5",
          secondaryColor: templateData.globalStyling.secondaryColor || "#8B5CF6",
          fontFamily: templateData.globalStyling.fontFamily || "Arial",
          pageMargin: templateData.globalStyling.pageMargin || 20,
          logoUrl: templateData.globalStyling.logoUrl || "",
        });
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newSections = arrayMove(items, oldIndex, newIndex);
        return newSections.map((section, index) => ({
          ...section,
          order: index,
        }));
      });
    }
  };

  const updateSection = (sectionId: string, updates: Partial<TemplateSection>) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    );
  };

  const addCustomSection = () => {
    const newSection: TemplateSection = {
      id: `custom_${Date.now()}`,
      type: 'custom',
      title: 'Custom Section',
      visible: true,
      order: sections.length,
      fields: [],
    };
    setSections([...sections, newSection]);
    toast.success("Custom section added");
  };

  const removeSection = (sectionId: string) => {
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
    toast.success("Section removed");
  };

  const handleSave = async () => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    setLoading(true);

    const templateData = {
      name: templateName,
      description: templateDescription,
      template_data: {
        sections,
        globalStyling,
      } as unknown as any,
      is_default: isDefault,
    };

    try {
      if (id) {
        const { error } = await supabase
          .from("invoice_templates")
          .update(templateData)
          .eq("id", id);

        if (error) throw error;
        toast.success("Template updated successfully");
      } else {
        const { error } = await supabase
          .from("invoice_templates")
          .insert({
            user_id: user.id,
            ...templateData,
          });

        if (error) throw error;
        toast.success("Template created successfully");
      }

      navigate("/invoice-templates");
    } catch (error: any) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/invoice-templates")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Templates
          </Button>
          <BackToHomeButton />
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            {id ? "Edit" : "Create"} Invoice Template
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Design beautiful, professional invoices with product images, business branding, and customizable layouts - all with simple drag-and-drop
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Panel - Template Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Template Name *</Label>
                  <Input
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g., Premium Invoice Template"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder="Describe this template..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Set as Default Template</Label>
                  <Switch checked={isDefault} onCheckedChange={setIsDefault} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Business Logo</CardTitle>
              </CardHeader>
              <CardContent>
                <LogoUpload
                  onUploadComplete={(url) => setGlobalStyling({ ...globalStyling, logoUrl: url })}
                  currentImage={globalStyling.logoUrl}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Upload your company logo to appear on the invoice header
                </p>
              </CardContent>
            </Card>

            <StylingControls
              globalStyling={globalStyling}
              onUpdate={setGlobalStyling}
            />

            {/* Sections */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Template Sections</CardTitle>
                <Button onClick={addCustomSection} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Custom Section
                </Button>
              </CardHeader>
              <CardContent>
                <DndContext
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={sections.map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {sections.map((section) => (
                        <SortableSection
                          key={section.id}
                          section={section}
                          onUpdate={updateSection}
                          onRemove={removeSection}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Preview */}
          <div className="lg:sticky lg:top-6 h-fit">
            <Card>
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <TemplatePreview
                  sections={sections}
                  globalStyling={globalStyling}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Button
            onClick={() => setShowPreview(!showPreview)}
            variant="outline"
            size="lg"
          >
            <Eye className="mr-2 h-5 w-5" />
            {showPreview ? "Hide" : "Show"} Full Preview
          </Button>
          <Button onClick={handleSave} size="lg" disabled={loading}>
            <Save className="mr-2 h-5 w-5" />
            {loading ? "Saving..." : "Save Template"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplateBuilder;
