import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, FileSpreadsheet, Loader2, Upload } from "lucide-react";
import * as XLSX from 'xlsx';

const Import = () => {
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [range, setRange] = useState("Sheet1!A:L");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileUpload = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log("Starting file upload...", file.name);
      
      const data = await file.arrayBuffer();
      console.log("File read successfully");
      
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      console.log("Sheet name:", sheetName);
      
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      console.log("Parsed rows:", jsonData.length);
      console.log("First row sample:", jsonData[0]);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No user found");
        throw new Error("Not authenticated");
      }
      console.log("User authenticated:", user.id);

      const products = jsonData.map((row: any) => {
        // Map your Excel columns to database fields
        const product: any = {
          user_id: user.id,
          name: row.PRODUCT || row.CERT || "Unnamed Product",
          description: `${row['Diamond Color'] || ''} ${row.CLARITY || ''} ${row['T DWT'] || ''} ct`.trim(),
          sku: row.CERT,
          category: row['Prodcut Type'] || "Jewelry",
          metal_type: row.PURITY_FRACTION_USED ? `${Math.round(parseFloat(row.PURITY_FRACTION_USED) * 100)}% Gold` : null,
          gemstone: row['Diamond Color'] && row.CLARITY ? `${row['Diamond Color']} ${row.CLARITY}` : "Diamond",
          image_url: row.IMAGE_URL?.split('|')[0] || null,
          weight_grams: parseFloat(row['NET WT']) || null,
          cost_price: parseFloat(row.GOLD) || parseFloat(row.MKG) || 0,
          retail_price: parseFloat(row.TOTAL) || parseFloat(row.GOLD) || 0,
          stock_quantity: 1,
        };

        return product;
      }).filter((p: any) => p.name && p.cost_price && p.retail_price);

      console.log(`Processed ${products.length} valid products`);
      console.log("Sample product:", products[0]);

      if (products.length === 0) {
        throw new Error("No valid products found in file. Please check your Excel format.");
      }

      const { data: insertedProducts, error: insertError } = await supabase
        .from("products")
        .insert(products)
        .select();

      if (insertError) {
        console.error("Insert error:", insertError);
        throw insertError;
      }

      console.log(`Successfully inserted ${insertedProducts?.length} products`);

      toast({
        title: "Success!",
        description: `Imported ${insertedProducts?.length || 0} products from Excel file`,
      });

      navigate("/");
    } catch (error: any) {
      console.error("Import error:", error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import from Excel file",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
                  <CardTitle>Import Products</CardTitle>
                  <CardDescription>
                    Import your jewelry catalog from Excel or Google Sheets
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="excel" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="excel">Excel File</TabsTrigger>
                  <TabsTrigger value="sheets">Google Sheets</TabsTrigger>
                </TabsList>

                <TabsContent value="excel" className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="file">Upload Excel File</Label>
                      <Input
                        id="file"
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
                      <p className="text-sm text-muted-foreground">
                        Upload your .xlsx or .xls file
                      </p>
                    </div>

                    <div className="rounded-lg bg-muted p-4 space-y-2">
                      <h3 className="font-semibold text-sm">Supported Columns:</h3>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• PRODUCT, CERT (product name/SKU)</li>
                        <li>• Diamond Color, CLARITY (gemstone details)</li>
                        <li>• NET WT (weight in grams)</li>
                        <li>• GOLD, MKG, TOTAL (pricing)</li>
                        <li>• IMAGE_URL (product images)</li>
                      </ul>
                    </div>

                    <Button
                      onClick={handleFileUpload}
                      disabled={loading || !file}
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Import from Excel
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="sheets" className="space-y-6">
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
                          Import from Google Sheets
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Import;
