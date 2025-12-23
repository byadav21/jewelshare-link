import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ColumnMapping {
  excelColumn: string;
  databaseField: string;
  sampleValue: string;
  dataType: string;
  required: boolean;
  mapped: boolean;
  columnPosition?: string; // e.g., "C" for column C
}

interface ColumnMappingPreviewProps {
  mappings: ColumnMapping[];
  productType: string;
}

export const ColumnMappingPreview = ({ mappings, productType }: ColumnMappingPreviewProps) => {
  const requiredMappings = mappings.filter(m => m.required);
  const optionalMappings = mappings.filter(m => !m.required);
  const successfulMappings = mappings.filter(m => m.mapped);
  const missingMappings = requiredMappings.filter(m => !m.mapped);

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Column Mapping Preview</CardTitle>
            <CardDescription>
              Review how your Excel columns will be imported for {productType}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant={missingMappings.length === 0 ? "default" : "destructive"} className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              {successfulMappings.length} / {requiredMappings.length} required
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {/* Required Fields Section */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2 text-primary">
                <span className="h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent"></span>
                Required Fields
                <span className="h-px flex-1 bg-gradient-to-l from-primary/50 to-transparent"></span>
              </h3>
              {requiredMappings.map((mapping, idx) => (
                <MappingRow key={`req-${idx}`} mapping={mapping} />
              ))}
            </div>

            {/* Optional Fields Section */}
            {optionalMappings.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground">
                  <span className="h-px flex-1 bg-gradient-to-r from-border to-transparent"></span>
                  Optional Fields
                  <span className="h-px flex-1 bg-gradient-to-l from-border to-transparent"></span>
                </h3>
                {optionalMappings.map((mapping, idx) => (
                  <MappingRow key={`opt-${idx}`} mapping={mapping} />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Summary Footer */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-2 bg-green-500/10 rounded">
              <p className="text-xs text-muted-foreground">Mapped</p>
              <p className="text-lg font-bold text-green-600">{successfulMappings.length}</p>
            </div>
            <div className="p-2 bg-amber-500/10 rounded">
              <p className="text-xs text-muted-foreground">Optional</p>
              <p className="text-lg font-bold text-amber-600">{optionalMappings.filter(m => !m.mapped).length}</p>
            </div>
            <div className="p-2 bg-destructive/10 rounded">
              <p className="text-xs text-muted-foreground">Missing</p>
              <p className="text-lg font-bold text-destructive">{missingMappings.length}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const MappingRow = ({ mapping }: { mapping: ColumnMapping }) => {
  return (
    <div className={`
      p-3 rounded-lg border transition-all
      ${mapping.mapped 
        ? 'bg-green-500/5 border-green-500/20' 
        : mapping.required 
          ? 'bg-destructive/5 border-destructive/20'
          : 'bg-muted/30 border-border/50'
      }
    `}>
      <div className="flex items-start gap-3">
        {/* Status Icon */}
        <div className="mt-0.5">
          {mapping.mapped ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : mapping.required ? (
            <AlertCircle className="h-4 w-4 text-destructive" />
          ) : (
            <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
          )}
        </div>

        {/* Mapping Details */}
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Excel Column */}
            <div className="flex items-center gap-1">
              {mapping.columnPosition && (
                <Badge variant="outline" className="text-xs font-mono">
                  Col {mapping.columnPosition}
                </Badge>
              )}
              <code className="px-2 py-0.5 bg-background rounded text-xs font-mono">
                {mapping.excelColumn}
              </code>
            </div>

            {/* Arrow */}
            <ArrowRight className="h-3 w-3 text-muted-foreground" />

            {/* Database Field */}
            <code className="px-2 py-0.5 bg-primary/10 rounded text-xs font-mono text-primary">
              {mapping.databaseField}
            </code>

            {/* Required Badge */}
            {mapping.required && (
              <Badge variant="secondary" className="text-xs">
                Required
              </Badge>
            )}

            {/* Data Type */}
            <span className="text-xs text-muted-foreground">
              ({mapping.dataType})
            </span>
          </div>

          {/* Sample Value */}
          {mapping.sampleValue && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Sample:</span>{' '}
              <span className="italic">"{mapping.sampleValue}"</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};