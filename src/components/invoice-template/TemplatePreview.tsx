import { Card, CardContent } from "@/components/ui/card";
import { TemplateSection } from "@/types/invoiceTemplate";

interface TemplatePreviewProps {
  sections: TemplateSection[];
  globalStyling?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    pageMargin?: number;
    logoUrl?: string;
  };
  productImages?: Array<{
    id: string;
    url: string;
    name: string;
    isDefault?: boolean;
  }>;
}

export const TemplatePreview = ({ sections, globalStyling, productImages = [] }: TemplatePreviewProps) => {
  const visibleSections = sections.filter((s) => s.visible).sort((a, b) => a.order - b.order);
  const defaultProductImage = productImages.find(img => img.isDefault) || productImages[0];

  const renderField = (field: any, section: any) => {
    if (field.key === 'logo') {
      return (
        <div className="flex items-center gap-2 mb-2">
          {globalStyling?.logoUrl ? (
            <img 
              src={globalStyling.logoUrl} 
              alt="Business Logo" 
              className="w-20 h-20 object-contain rounded border border-border"
            />
          ) : (
            <div className="w-16 h-16 rounded border border-border flex items-center justify-center bg-muted text-muted-foreground text-xs">
              Logo
            </div>
          )}
        </div>
      );
    }
    
    if (field.key === 'itemImage') {
      return (
        <div className="flex items-center gap-2 mb-2">
          {defaultProductImage ? (
            <img 
              src={defaultProductImage.url} 
              alt="Product" 
              className="w-16 h-16 object-cover rounded border border-border"
            />
          ) : (
            <div className="w-16 h-16 rounded border border-border flex items-center justify-center bg-muted text-muted-foreground text-xs">
              Product
            </div>
          )}
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
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr style={{ backgroundColor: globalStyling?.secondaryColor || '#FED7AA' }}>
              {visibleFields.map((field: any) => (
                <th key={field.id} className="text-center py-2 px-2 font-bold border border-border">
                  {field.customLabel || field.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2].map((row) => (
              <tr key={row} className="border border-border">
                {visibleFields.map((field: any) => (
                  <td key={field.id} className="py-2 px-2 text-center border border-border">
                    {field.key === 'itemImage' ? (
                      defaultProductImage ? (
                        <img 
                          src={defaultProductImage.url} 
                          alt="Product" 
                          className="w-12 h-12 mx-auto object-cover rounded border border-border"
                        />
                      ) : (
                        <div className="w-10 h-10 mx-auto rounded border border-border flex items-center justify-center bg-muted text-muted-foreground text-[10px]">
                          IMG
                        </div>
                      )
                    ) : field.key === 'itemDescription' ? (
                      <span className="font-semibold">Diamond Ring 18K</span>
                    ) : field.key === 'itemHSN' ? (
                      <span>7113</span>
                    ) : field.key === 'grossWeight' ? (
                      <span>10.50</span>
                    ) : field.key === 'diamondWeight' ? (
                      <span>1.25</span>
                    ) : field.key === 'diamondPerCarat' ? (
                      <span>₹25,000</span>
                    ) : field.key === 'diamondCost' ? (
                      <span className="font-semibold">₹31,250</span>
                    ) : field.key === 'stoneWeight' ? (
                      <span>0.50</span>
                    ) : field.key === 'stonePerCarat' ? (
                      <span>₹5,000</span>
                    ) : field.key === 'stoneCost' ? (
                      <span className="font-semibold">₹2,500</span>
                    ) : field.key === 'netWeight' ? (
                      <span>8.50</span>
                    ) : field.key === 'goldRate' ? (
                      <span>₹6,500</span>
                    ) : field.key === 'goldCost' ? (
                      <span className="font-semibold">₹55,250</span>
                    ) : field.key === 'makingChargesPerGram' ? (
                      <span>₹800</span>
                    ) : field.key === 'totalMaking' ? (
                      <span className="font-semibold">₹6,800</span>
                    ) : field.key === 'cadCharges' ? (
                      <span>₹2,000</span>
                    ) : field.key === 'cammingCharges' ? (
                      <span>₹1,500</span>
                    ) : field.key === 'certification' ? (
                      <span>₹3,000</span>
                    ) : field.key === 'tax' ? (
                      <span>₹3,090</span>
                    ) : field.key === 'shipping' ? (
                      <span>₹500</span>
                    ) : field.key === 'vaPercent' ? (
                      <span>10%</span>
                    ) : field.key === 'wastage' ? (
                      <span>0.9</span>
                    ) : field.key === 'finalWeight' ? (
                      <span>9.9</span>
                    ) : field.key === 'rate' ? (
                      <span>₹4,400.00</span>
                    ) : field.key === 'makingCharges' ? (
                      <span>₹500</span>
                    ) : field.key === 'amount' ? (
                      <span className="font-semibold text-primary">₹1,05,890</span>
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
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  {section.fields
                    .filter((f) => f.visible && (f.key === 'logo' || f.key === 'businessName' || f.key === 'businessTagline'))
                    .sort((a, b) => a.order - b.order)
                    .map((field) => renderField(field, section))}
                </div>
                <div className="space-y-2">
                  {section.fields
                    .filter((f) => f.visible && ['businessAddress', 'businessPhone', 'businessLandline', 'businessEmail', 'businessGSTN'].includes(f.key))
                    .sort((a, b) => a.order - b.order)
                    .map((field) => renderField(field, section))}
                </div>
                <div className="space-y-2 text-right">
                  {section.fields
                    .filter((f) => f.visible && ['invoiceNumber', 'invoiceDate', 'goldRate', 'silverRate'].includes(f.key))
                    .sort((a, b) => a.order - b.order)
                    .map((field) => renderField(field, section))}
                </div>
              </div>
            ) : section.id === 'customer_info' ? (
              <div className="grid grid-cols-2 gap-6" style={{ backgroundColor: globalStyling?.secondaryColor || '#FED7AA', padding: '12px', borderRadius: '4px' }}>
                <div className="space-y-2">
                  {section.fields
                    .filter((f) => f.visible)
                    .slice(0, 4)
                    .sort((a, b) => a.order - b.order)
                    .map((field) => renderField(field, section))}
                </div>
                <div className="space-y-2">
                  {section.fields
                    .filter((f) => f.visible)
                    .slice(4)
                    .sort((a, b) => a.order - b.order)
                    .map((field) => renderField(field, section))}
                </div>
              </div>
            ) : section.id === 'cost_breakdown' ? (
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4 p-3 rounded" style={{ backgroundColor: globalStyling?.secondaryColor || '#FED7AA' }}>
                    <div className="text-center">
                      <div className="font-bold text-xs">GOLD TOTAL WEIGHT</div>
                      <div className="text-sm mt-1">9.900</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-xs">SILVER TOTAL WEIGHT</div>
                      <div className="text-sm mt-1">150.000</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-xs">TOTAL MC</div>
                      <div className="text-sm mt-1">₹500.0</div>
                    </div>
                  </div>
                  <div className="border border-border p-3 rounded text-xs space-y-1">
                    <div className="font-bold mb-2">OLD/EXCHANGE</div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div><span className="font-semibold">G.WT</span></div>
                      <div><span className="font-semibold">PURITY</span></div>
                      <div><span className="font-semibold">N.WT</span></div>
                      <div><span className="font-semibold">RATE</span></div>
                    </div>
                  </div>
                  <div className="border border-border p-3 rounded text-xs">
                    <div className="font-bold mb-2">T&C:</div>
                    <div className="text-muted-foreground">* Goods once sold will not be taken back.</div>
                  </div>
                  <div className="border border-border p-3 rounded text-xs">
                    <div className="font-bold mb-2">Declaration:</div>
                    <div className="text-muted-foreground">We declare that this invoice shows the</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2 p-2 text-xs text-center" style={{ backgroundColor: globalStyling?.secondaryColor || '#FED7AA' }}>
                    <div className="font-bold">GST</div>
                    <div className="font-bold">CGST</div>
                    <div className="font-bold">SGST</div>
                    <div className="font-bold">IGST</div>
                    <div>3%</div>
                    <div>₹748.65</div>
                    <div>₹748.65</div>
                    <div>0</div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between py-1 px-2">
                      <span className="font-semibold">TOTAL AMOUNT</span>
                      <span className="font-bold">₹49,910</span>
                    </div>
                    <div className="flex justify-between py-1 px-2 text-muted-foreground">
                      <span>Add: Other</span>
                      <span>-</span>
                    </div>
                    <div className="flex justify-between py-1 px-2 text-muted-foreground">
                      <span>Less: Discount</span>
                      <span>-</span>
                    </div>
                    <div className="flex justify-between py-1 px-2 border-t border-border">
                      <span className="font-semibold">Taxable Amount</span>
                      <span className="font-semibold">₹49,910</span>
                    </div>
                    <div className="flex justify-between py-1 px-2">
                      <span>GST Total</span>
                      <span>₹1,497</span>
                    </div>
                    <div className="flex justify-between py-1 px-2">
                      <span>After Tax</span>
                      <span>₹51,407</span>
                    </div>
                    <div className="flex justify-between py-1 px-2">
                      <span>Less: O/E Value</span>
                      <span>-</span>
                    </div>
                    <div className="flex justify-between py-2 px-2 border-t-2 border-border" style={{ backgroundColor: globalStyling?.secondaryColor || '#FED7AA' }}>
                      <span className="font-bold text-base">GRAND TOTAL</span>
                      <span className="font-bold text-base">₹51,407</span>
                    </div>
                  </div>
                  <div className="border border-border p-2 rounded text-xs mt-4" style={{ backgroundColor: globalStyling?.secondaryColor || '#FED7AA' }}>
                    <div className="font-bold text-center mb-2">PAYMENT MODE</div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="font-semibold">MODE</div>
                      <div className="font-semibold">AMOUNT</div>
                      <div className="font-semibold">REF NO.</div>
                    </div>
                  </div>
                </div>
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
