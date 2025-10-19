import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApprovalGuard } from "@/components/ApprovalGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import * as XLSX from 'xlsx';
import { productImportSchema } from "@/lib/validations";

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
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      // Skip first row (the one with Base 24K rate info) and use row 2 as headers
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { range: 1 });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Not authenticated");
      }

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
        
        // Parse image URLs - handle backslash escaping and pipe separators
        let imageUrl = null;
        let imageUrl2 = null;
        if (row.IMAGE_URL) {
          const cleanUrls = String(row.IMAGE_URL)
            .replace(/\\/g, '') // Remove backslashes
            .split('|') // Split by pipe
            .map(url => url.trim())
            .filter(url => url.startsWith('http'));
          
          imageUrl = cleanUrls[0] || null;
          imageUrl2 = cleanUrls[1] || null;
        }
        
        const product = {
          user_id: user.id,
          name: row.PRODUCT || row.CERT || `Product ${index + 1}`,
          description: `${row['Diamond Color'] || ''} ${row.CLARITY || ''} ${row['T DWT'] ? row['T DWT'] + ' ct' : ''}`.trim() || null,
          sku: row.CERT || null,
          category: row['Prodcut Type'] || row['Product Type'] || "Diamond Jewelry",
          metal_type: row.PURITY_FRACTION_USED ? `${Math.round(parseFloat(row.PURITY_FRACTION_USED) * 100)}% Gold` : null,
          gemstone: row['Diamond Color'] && row.CLARITY ? `${row['Diamond Color']} ${row.CLARITY}` : null,
          image_url: imageUrl,
          image_url_2: imageUrl2,
          weight_grams: parseNumber(row['NET WT']) || null,
          cost_price: costPrice,
          retail_price: retailPrice,
          stock_quantity: 1,
        };

        // Validate product data
        const validation = productImportSchema.safeParse(product);
        if (!validation.success) {
          return null; // Skip invalid products
        }

        return product; // Return original product with all required fields
      }).filter((p): p is NonNullable<typeof p> => p !== null);

      if (products.length === 0) {
        throw new Error("No valid products found in file. Please check your Excel format.");
      }

      // Get existing SKUs to separate updates from inserts
      const skus = products.map(p => p.sku).filter(Boolean);
      const { data: existingProducts } = await supabase
        .from("products")
        .select("id, sku")
        .in("sku", skus);

      const existingSkuMap = new Map(existingProducts?.map(p => [p.sku, p.id]) || []);
      const productsToUpdate = products.filter(p => p.sku && existingSkuMap.has(p.sku));
      const productsToInsert = products.filter(p => !p.sku || !existingSkuMap.has(p.sku));

      let updatedCount = 0;
      let insertedCount = 0;

      // Update existing products
      if (productsToUpdate.length > 0) {
        for (const product of productsToUpdate) {
          const productId = existingSkuMap.get(product.sku);
          const { error: updateError } = await supabase
            .from("products")
            .update(product)
            .eq("id", productId);

          if (!updateError) {
            updatedCount++;
          }
        }
      }

      // Insert new products
      if (productsToInsert.length > 0) {
        const { data: insertedProducts, error: insertError } = await supabase
          .from("products")
          .insert(productsToInsert)
          .select();

        if (insertError) {
          throw insertError;
        }

        insertedCount = insertedProducts?.length || 0;
      }

      toast({
        title: "Success!",
        description: `Updated ${updatedCount} products, imported ${insertedCount} new products`,
      });

      navigate("/");
    } catch (error: any) {
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
    <ApprovalGuard>
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
                    <li>• IMAGE_URL (product images - use pipe | to separate multiple: url1|url2)</li>
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
    </ApprovalGuard>
  );
};

export default Import;
