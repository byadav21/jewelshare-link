import { Card, CardContent } from "@/components/ui/card";
import { TemplateSection } from "@/types/invoiceTemplate";

interface TemplatePreviewProps {
  sections: TemplateSection[];
  globalStyling?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    pageMargin?: number;
  };
}

export const TemplatePreview = ({ sections, globalStyling }: TemplatePreviewProps) => {
  const visibleSections = sections.filter((s) => s.visible).sort((a, b) => a.order - b.order);

  return (
    <div
      className="bg-white p-8 rounded-lg shadow-sm border border-border min-h-[600px]"
      style={{
        fontFamily: globalStyling?.fontFamily || "Arial",
        padding: `${globalStyling?.pageMargin || 20}px`,
      }}
    >
      <div className="space-y-6">
        {visibleSections.map((section) => (
          <div
            key={section.id}
            className="border-b border-border pb-4 last:border-0"
            style={{
              backgroundColor: section.styling?.backgroundColor,
              color: section.styling?.textColor,
              padding: `${section.styling?.padding || 0}px`,
              borderColor: section.styling?.borderColor,
              borderWidth: section.styling?.borderWidth || 0,
            }}
          >
            <h3
              className="font-semibold mb-3"
              style={{
                fontSize: `${section.styling?.fontSize || 16}px`,
                fontWeight: section.styling?.fontWeight || "600",
                color: globalStyling?.primaryColor,
              }}
            >
              {section.title}
            </h3>
            <div className="space-y-2 text-sm">
              {section.fields
                .filter((f) => f.visible)
                .sort((a, b) => a.order - b.order)
                .map((field) => (
                  <div key={field.id} className="flex justify-between">
                    <span className="text-muted-foreground">
                      {field.customLabel || field.label}:
                    </span>
                    <span className="font-medium">[{field.key}]</span>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
