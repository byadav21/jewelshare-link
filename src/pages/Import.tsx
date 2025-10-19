import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, FileSpreadsheet, Loader2 } from "lucide-react";

const Import = () => {
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [range, setRange] = useState("Sheet1!A:L");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleImport = async () => {
    if (!spreadsheetId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Google Sheet ID",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("import-from-sheets", {
        body: { spreadsheetId: spreadsheetId.trim(), range },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Success!",
        description: `Imported ${data.count} products from Google Sheets`,
      });

      navigate("/");
    } catch (error: any) {
      console.error("Import error:", error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import from Google Sheets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Catalog
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Import from Google Sheets</CardTitle>
                  <CardDescription>
                    Import your jewelry catalog from a Google Sheet
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="spreadsheetId">Google Sheet ID</Label>
                  <Input
                    id="spreadsheetId"
                    placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                    value={spreadsheetId}
                    onChange={(e) => setSpreadsheetId(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Found in your sheet URL: docs.google.com/spreadsheets/d/<strong>SHEET_ID</strong>/edit
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="range">Sheet Range</Label>
                  <Input
                    id="range"
                    placeholder="Sheet1!A:L"
                    value={range}
                    onChange={(e) => setRange(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Format: SheetName!StartColumn:EndColumn (e.g., Sheet1!A:L)
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-muted p-4 space-y-2">
                <h3 className="font-semibold text-sm">Required Columns:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Name (required)</li>
                  <li>• Cost Price (required)</li>
                  <li>• Retail Price (required)</li>
                  <li>• Description, SKU, Category, Metal Type, Gemstone (optional)</li>
                  <li>• Image URL, Weight (grams), Stock Quantity (optional)</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">
                  Note: Your sheet must be publicly accessible or shared with anyone with the link
                </p>
              </div>

              <Button
                onClick={handleImport}
                disabled={loading || !spreadsheetId.trim()}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Import Products
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Import;
