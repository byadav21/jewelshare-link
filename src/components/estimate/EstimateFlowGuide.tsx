import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Calculator, 
  Diamond, 
  IndianRupee, 
  TrendingUp,
  Save,
  FileCheck,
  Info,
  ArrowRight
} from "lucide-react";

/**
 * EstimateFlowGuide Component
 * 
 * Provides visual guidance on the estimate creation and invoice generation workflow.
 * Helps users understand the difference between estimates and invoices.
 */
export const EstimateFlowGuide = () => {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          Estimate vs Invoice - Quick Guide
        </CardTitle>
        <CardDescription>
          Understanding the workflow from cost estimation to final invoice
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estimate Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Step 1: Create Estimate</h3>
          </div>
          <div className="pl-7 space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <Diamond className="h-4 w-4" />
              Enter jewelry specifications (weight, purity, diamonds, gemstones)
            </p>
            <p className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4" />
              Calculate manufacturing costs (gold, making charges, CAD, certification)
            </p>
            <p className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Set profit margin to determine selling price
            </p>
            <p className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save as <span className="font-semibold text-foreground">Draft</span> for future reference
            </p>
          </div>
          
          <Alert className="bg-primary/5 border-primary/20">
            <AlertDescription className="text-sm">
              <strong>Estimates</strong> are for quotations and internal calculations. 
              They can be modified anytime and don't require complete customer details.
            </AlertDescription>
          </Alert>
        </div>

        <div className="flex items-center justify-center">
          <ArrowRight className="h-6 w-6 text-muted-foreground" />
        </div>

        <Separator />

        {/* Invoice Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-accent" />
            <h3 className="font-semibold text-lg">Step 2: Generate Invoice</h3>
          </div>
          <div className="pl-7 space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Convert approved estimate to professional invoice
            </p>
            <p>• Add invoice number (auto-generated)</p>
            <p>• Set payment terms and due date</p>
            <p>• Include customer name (mandatory for invoices)</p>
            <p>• Choose invoice template style</p>
          </div>
          
          <Alert className="bg-accent/5 border-accent/20">
            <AlertDescription className="text-sm">
              <strong>Invoices</strong> are final billing documents with unique numbers. 
              Once generated, they're stored separately in Invoice History for record-keeping.
            </AlertDescription>
          </Alert>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg border">
          <p className="text-sm font-semibold mb-2">Quick Actions:</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>✓ Save Estimate → Draft status</div>
            <div>✓ Export Estimate PDF → Quotation</div>
            <div>✓ Generate Invoice → Final bill</div>
            <div>✓ View History → Past records</div>
          </div>
        </div>

        {/* Status Workflow */}
        <div className="p-4 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-lg">
          <p className="text-sm font-semibold mb-2">Status Workflow:</p>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-1 bg-background rounded border">Draft</span>
            <ArrowRight className="h-3 w-3" />
            <span className="px-2 py-1 bg-background rounded border">Quoted</span>
            <ArrowRight className="h-3 w-3" />
            <span className="px-2 py-1 bg-background rounded border">Approved</span>
            <ArrowRight className="h-3 w-3" />
            <span className="px-2 py-1 bg-background rounded border">In Production</span>
            <ArrowRight className="h-3 w-3" />
            <span className="px-2 py-1 bg-background rounded border text-accent font-semibold">Completed</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};