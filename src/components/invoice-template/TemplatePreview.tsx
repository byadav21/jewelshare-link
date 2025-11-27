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

  const renderField = (field: any, section: any) => {
    if (field.key === 'logo' || field.key === 'itemImage') {
      return (
        <div className="flex items-center gap-2 mb-2">
          <div className="w-16 h-16 rounded border border-border flex items-center justify-center bg-muted text-muted-foreground text-xs">
            Logo
          </div>
        </div>
      );
    }

    if (section.id === 'line_items') {
      return null; // Handled separately as table
    }

    return (
      <div className="flex justify-between items-start mb-2">
        <span className="text-muted-foreground text-sm">
          {field.customLabel || field.label}:
        </span>
        <span className="font-medium text-sm">[{field.key}]</span>
      </div>
    );
  };

  const renderLineItemsTable = (section: any) => {
    const visibleFields = section.fields.filter((f: any) => f.visible).sort((a: any, b: any) => a.order - b.order);
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2" style={{ borderColor: globalStyling?.primaryColor }}>
              {visibleFields.map((field: any) => (
                <th key={field.id} className="text-left py-2 px-3 text-sm font-semibold" style={{ color: globalStyling?.primaryColor }}>
                  {field.customLabel || field.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2].map((row) => (
              <tr key={row} className="border-b border-border">
                {visibleFields.map((field: any) => (
                  <td key={field.id} className="py-3 px-3 text-sm">
                    {field.key === 'itemImage' ? (
                      <div className="w-12 h-12 rounded border border-border flex items-center justify-center bg-muted text-muted-foreground text-xs">
                        IMG
                      </div>
                    ) : field.key === 'itemDescription' ? (
                      <span className="text-muted-foreground text-xs">Sample description</span>
                    ) : (
                      <span>[{field.key}]</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div
      className="bg-white rounded-lg shadow-lg border border-border min-h-[600px] max-h-[800px] overflow-y-auto"
      style={{
        fontFamily: globalStyling?.fontFamily || "Arial",
        padding: `${globalStyling?.pageMargin || 20}px`,
      }}
    >
      <div className="space-y-6">
        {visibleSections.map((section) => (
          <div
            key={section.id}
            className="pb-4"
            style={{
              backgroundColor: section.styling?.backgroundColor,
              color: section.styling?.textColor,
              padding: `${section.styling?.padding || 0}px`,
              borderColor: section.styling?.borderColor,
              borderWidth: section.styling?.borderWidth || 0,
              borderRadius: section.styling?.borderWidth ? '8px' : '0',
            }}
          >
            <h3
              className="font-bold mb-4"
              style={{
                fontSize: `${section.styling?.fontSize || 18}px`,
                fontWeight: section.styling?.fontWeight || "700",
                color: globalStyling?.primaryColor,
              }}
            >
              {section.title}
            </h3>
            
            {section.id === 'line_items' ? (
              renderLineItemsTable(section)
            ) : section.id === 'header' ? (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  {section.fields
                    .filter((f) => f.visible)
                    .slice(0, 5)
                    .sort((a, b) => a.order - b.order)
                    .map((field) => renderField(field, section))}
                </div>
                <div className="text-right">
                  {section.fields
                    .filter((f) => f.visible)
                    .slice(5)
                    .sort((a, b) => a.order - b.order)
                    .map((field) => renderField(field, section))}
                </div>
              </div>
            ) : section.id === 'cost_breakdown' ? (
              <div className="ml-auto max-w-xs space-y-2">
                {section.fields
                  .filter((f) => f.visible)
                  .sort((a, b) => a.order - b.order)
                  .map((field) => (
                    <div key={field.id} className="flex justify-between">
                      <span className={field.key === 'finalSellingPrice' ? 'font-bold' : 'text-muted-foreground'}>
                        {field.customLabel || field.label}:
                      </span>
                      <span className={field.key === 'finalSellingPrice' ? 'font-bold text-lg' : 'font-medium'}>
                        [{field.key}]
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <div>
                {section.fields
                  .filter((f) => f.visible)
                  .sort((a, b) => a.order - b.order)
                  .map((field) => renderField(field, section))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
