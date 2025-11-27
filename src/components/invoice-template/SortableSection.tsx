import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Eye, EyeOff, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TemplateSection } from "@/types/invoiceTemplate";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface SortableSectionProps {
  section: TemplateSection;
  onUpdate: (sectionId: string, updates: Partial<TemplateSection>) => void;
  onRemove: (sectionId: string) => void;
}

export const SortableSection = ({ section, onUpdate, onRemove }: SortableSectionProps) => {
  const [expanded, setExpanded] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const toggleFieldVisibility = (fieldId: string) => {
    const updatedFields = section.fields.map((field) =>
      field.id === fieldId ? { ...field, visible: !field.visible } : field
    );
    onUpdate(section.id, { fields: updatedFields });
  };

  const updateFieldLabel = (fieldId: string, customLabel: string) => {
    const updatedFields = section.fields.map((field) =>
      field.id === fieldId ? { ...field, customLabel } : field
    );
    onUpdate(section.id, { fields: updatedFields });
  };

  return (
    <Card ref={setNodeRef} style={style} className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing touch-none"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </button>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Input
                value={section.title}
                onChange={(e) => onUpdate(section.id, { title: e.target.value })}
                className="font-medium"
              />
              <Badge variant="outline">{section.type}</Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={section.visible}
              onCheckedChange={(visible) => onUpdate(section.id, { visible })}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            {section.type === 'custom' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(section.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {expanded && section.fields.length > 0 && (
          <div className="mt-4 space-y-3 pl-8 border-l-2 border-muted">
            {section.fields.map((field) => (
              <div key={field.id} className="flex items-center gap-3 text-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFieldVisibility(field.id)}
                >
                  {field.visible ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
                <Label className="flex-1">{field.label}</Label>
                <Input
                  placeholder="Custom label..."
                  value={field.customLabel || ""}
                  onChange={(e) => updateFieldLabel(field.id, e.target.value)}
                  className="max-w-[200px]"
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
