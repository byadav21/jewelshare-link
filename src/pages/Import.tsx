import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import * as XLSX from 'xlsx';

const Import = () => {
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
      // Skip first row (the one with Base 24K rate info) and use row 2 as headers
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { range: 1 });
      console.log("Parsed rows:", jsonData.length);
      
      if (jsonData.length > 0) {
        console.log("First row sample:", jsonData[0]);
        console.log("Column names:", Object.keys(jsonData[0]));
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No user found");
        throw new Error("Not authenticated");
      }
      console.log("User authenticated:", user.id);

      const products = jsonData.map((row: any, index: number) => {
        // Parse numbers safely
        const parseNumber = (val: any): number => {
          if (typeof val === 'number') return val;
          if (typeof val === 'string') {
            const cleaned = val.replace(/[^0-9.-]/g, '');
            return parseFloat(cleaned) || 0;
          }
          return 0;
        };

        const costPrice = parseNumber(row.GOLD) || parseNumber(row.MKG) || parseNumber(row['COST PRICE']);
        const retailPrice = parseNumber(row.TOTAL) || parseNumber(row['RETAIL PRICE']) || costPrice;
        
        // Parse image URL - handle backslash escaping and pipe separators
        let imageUrl = null;
        if (row.IMAGE_URL) {
          const cleanUrl = String(row.IMAGE_URL)
            .replace(/\\/g, '') // Remove backslashes
            .split('|')[0] // Take first URL if multiple
            .trim();
          imageUrl = cleanUrl.startsWith('http') ? cleanUrl : null;
        }
        
        const product: any = {
          user_id: user.id,
          name: row.PRODUCT || row.CERT || `Product ${index + 1}`,
          description: `${row['Diamond Color'] || ''} ${row.CLARITY || ''} ${row['T DWT'] ? row['T DWT'] + ' ct' : ''}`.trim() || null,
          sku: row.CERT || null,
          category: row['Prodcut Type'] || row['Product Type'] || "Diamond Jewelry",
          metal_type: row.PURITY_FRACTION_USED ? `${Math.round(parseFloat(row.PURITY_FRACTION_USED) * 100)}% Gold` : null,
          gemstone: row['Diamond Color'] && row.CLARITY ? `${row['Diamond Color']} ${row.CLARITY}` : null,
          image_url: imageUrl,
          weight_grams: parseNumber(row['NET WT']) || null,
          cost_price: costPrice,
          retail_price: retailPrice,
          stock_quantity: 1,
        };

        console.log(`Product ${index + 1}:`, {
          name: product.name,
          image: product.image_url,
          cost: product.cost_price,
          retail: product.retail_price,
          valid: !!(product.name && product.cost_price > 0 && product.retail_price > 0)
        });

        return product;
      }).filter((p: any) => {
        const valid = p.name && p.cost_price > 0 && p.retail_price > 0;
        if (!valid) {
          console.log("Filtered out product:", p.name, "cost:", p.cost_price, "retail:", p.retail_price);
        }
        return valid;
      });

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
                <Upload className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Import Products</CardTitle>
                  <CardDescription>
                    Upload your jewelry catalog from an Excel file
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Import;
