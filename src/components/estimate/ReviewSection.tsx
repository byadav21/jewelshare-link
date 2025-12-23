import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, FolderOpen, FileText, Trash2 } from "lucide-react";

interface ReviewSectionProps {
  onSave: () => void;
  onLoad: () => void;
  onExportPDF: () => void;
  onReset: () => void;
  onViewHistory: () => void;
  onCreateInvoice: () => void;
  isAuthenticated: boolean;
}

export const ReviewSection = ({
  onSave,
  onLoad,
  onExportPDF,
  onReset,
  onViewHistory,
  onCreateInvoice,
  isAuthenticated,
}: ReviewSectionProps) => {
  return (
    <Card className="border-primary/20 shadow-lg">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Primary Actions */}
          <div className="flex flex-wrap gap-4 justify-center">
            {isAuthenticated && (
              <>
                <Button onClick={onSave} size="lg" variant="outline" className="gap-2">
                  <Save className="h-5 w-5" />
                  Save Estimate
                </Button>

                <Button onClick={onLoad} size="lg" variant="outline" className="gap-2">
                  <FolderOpen className="h-5 w-5" />
                  Load Estimate
                </Button>
              </>
            )}

            <Button
              onClick={onExportPDF}
              size="lg"
              className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <FileText className="h-5 w-5" />
              Export Estimate PDF
            </Button>
          </div>

          {/* Secondary Actions */}
          {isAuthenticated && (
            <div className="flex flex-wrap gap-4 justify-center border-t pt-4">
              <Button onClick={onViewHistory} size="lg" variant="secondary" className="gap-2">
                <FolderOpen className="h-5 w-5" />
                View Estimate History
              </Button>

              <Button onClick={onCreateInvoice} size="lg" variant="secondary" className="gap-2">
                <FileText className="h-5 w-5" />
                Create Invoice
              </Button>

              <Button onClick={onReset} size="lg" variant="destructive" className="gap-2">
                <Trash2 className="h-5 w-5" />
                Reset Form
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};