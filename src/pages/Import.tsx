import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApprovalGuard } from "@/components/ApprovalGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, Loader2, Download } from "lucide-react";
import * as XLSX from 'xlsx';
import { productImportSchema } from "@/lib/validations";
import { generateProductTemplate } from "@/utils/generateTemplate";

const Import = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [importErrors, setImportErrors] = useState<Array<{row: number, product: string, errors: string[]}>>([]);
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
    setImportErrors([]);

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

      const errors: Array<{row: number, product: string, errors: string[]}> = [];
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

        const costPrice = parseNumber(row['COST PRICE']) || 0;
        const retailPrice = parseNumber(row['RETAIL PRICE']) || parseNumber(row.TOTAL) || costPrice;
        
        // Parse image URLs - handle backslash escaping and pipe separators  
        let imageUrl = null;
        let imageUrl2 = null;
        let imageUrl3 = null;
        if (row.IMAGE_URL) {
          const cleanUrls = String(row.IMAGE_URL)
            .replace(/\\/g, '') // Remove backslashes
            .split('|') // Split by pipe
            .map(url => url.trim())
            .filter(url => url.startsWith('http'));
          
          imageUrl = cleanUrls[0] || null;
          imageUrl2 = cleanUrls[1] || null;
          imageUrl3 = cleanUrls[2] || null;
        }
        
        // Check if Thumbnail column exists and use it for image_url_3 if available
        if (row.Thumbnail && String(row.Thumbnail).startsWith('http')) {
          imageUrl3 = row.Thumbnail;
        }
        
        
        // Parse delivery information
        const deliveryType = row['DELIVERY TYPE'] || row['Delivery Type'] || 'immediate delivery';
        let dispatchesInDays = null;
        
        // Check for DISPATCHES IN DAYS column
        if (row['DISPATCHES IN DAYS'] || row['Dispatches In Days']) {
          const days = parseNumber(row['DISPATCHES IN DAYS'] || row['Dispatches In Days']);
          if (days > 0) {
            dispatchesInDays = Math.floor(days);
          }
        }
        // Or extract from delivery type text (e.g., "Despatches in 5 working days")
        else if (deliveryType && deliveryType.toLowerCase().includes('despatches')) {
          const match = deliveryType.match(/(\d+)/);
          if (match) {
            dispatchesInDays = parseInt(match[1], 10);
          }
        }
        
        const product = {
          user_id: user.id,
          name: row.PRODUCT || row.CERT || `Product ${index + 1}`,
          description: row.DESCRIPTION || null,
          sku: row.CERT || null,
          category: row.CATEGORY || row['PRODUCT TYPE'] || null,
          metal_type: row['METAL TYPE'] || null,
          gemstone: row.GEMSTONE || null,
          color: row.COLOR || null,
          diamond_color: row['DIAMOND COLOR'] || null,
          clarity: row.CLARITY || null,
          image_url: imageUrl,
          image_url_2: imageUrl2,
          image_url_3: imageUrl3,
          weight_grams: parseNumber(row['WEIGHT (grams)']) || null,
          net_weight: parseNumber(row['NET WEIGHT']) || null,
          diamond_weight: parseNumber(row['DIAMOND WEIGHT']) || null,
          d_wt_1: parseNumber(row['D WT 1']) || null,
          d_wt_2: parseNumber(row['D WT 2']) || null,
          pointer_diamond: parseNumber(row['POINTER DIAMOND']) || null,
          per_carat_price: parseNumber(row['PER CARAT PRICE']) || null,
          d_rate_1: parseNumber(row['D RATE 1']) || null,
          d_value: parseNumber(row['D VALUE']) || null,
          gold_per_gram_price: parseNumber(row['GOLD PER GRAM PRICE']) || null,
          purity_fraction_used: parseNumber(row['PURITY FRACTION USED']) || null,
          mkg: parseNumber(row.MKG) || null,
          certification_cost: parseNumber(row['CERTIFICATION COST']) || null,
          gemstone_cost: parseNumber(row['GEMSTONE COST']) || null,
          cost_price: parseNumber(row['COST PRICE']) || costPrice,
          retail_price: parseNumber(row['RETAIL PRICE']) || parseNumber(row.TOTAL) || retailPrice,
          total_usd: parseNumber(row['TOTAL USD']) || null,
          stock_quantity: parseNumber(row['STOCK QUANTITY']) || 1,
          product_type: row['PRODUCT TYPE'] || null,
          delivery_type: deliveryType,
          dispatches_in_days: dispatchesInDays,
        };

        // Validate product data
        const validation = productImportSchema.safeParse(product);
        if (!validation.success) {
          const errorMessages = validation.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          );
          errors.push({
            row: index + 2, // +2 because row 1 is header info, row 2 is column headers
            product: product.name || product.sku || `Row ${index + 2}`,
            errors: errorMessages
          });
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

      setImportErrors(errors);
      
      toast({
        title: "Success!",
        description: `Updated ${updatedCount} products, imported ${insertedCount} new products${errors.length > 0 ? `. ${errors.length} products failed.` : ''}`,
      });

      if (errors.length === 0) {
        navigate("/");
      }
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

  const downloadErrorLog = () => {
    const workbook = XLSX.utils.book_new();
    const errorData = importErrors.map(error => ({
      'Row Number': error.row,
      'Product Name/SKU': error.product,
      'Errors': error.errors.join('; ')
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(errorData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Import Errors");
    XLSX.writeFile(workbook, `import-errors-${new Date().toISOString().split('T')[0]}.xlsx`);
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
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Step 1: Download Template</h3>
                    <p className="text-sm text-muted-foreground">
                      Get the Excel template with all required columns
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={generateProductTemplate}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Template
                  </Button>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Step 2: Upload Filled Template</h3>
                  <Label htmlFor="file">Select Excel File</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Upload your filled .xlsx or .xls file
                  </p>
                </div>

                <div className="rounded-lg bg-muted p-4 space-y-2">
                  <h3 className="font-semibold text-sm">Supported Columns:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 grid grid-cols-1 md:grid-cols-2 gap-1">
                    <li>• CERT (SKU)</li>
                    <li>• PRODUCT (name)</li>
                    <li>• Diamond Color/Co</li>
                    <li>• CLARITY</li>
                    <li>• D.WT 1, D.WT 2 (diamond weights)</li>
                    <li>• T DWT (total diamond weight)</li>
                    <li>• G WT (gross weight)</li>
                    <li>• NET WT (net weight)</li>
                    <li>• CS TYPE (category)</li>
                    <li>• PURITY_FRACTION_USED</li>
                    <li>• D RATE 1 (diamond rate)</li>
                    <li>• Pointer diamond</li>
                    <li>• D VALUE (diamond value)</li>
                    <li>• GEMSTONE TYPE</li>
                    <li>• MKG (making charges)</li>
                    <li>• GOLD (gold cost)</li>
                    <li>• Certification cost</li>
                    <li>• Gemstone cost</li>
                    <li>• TOTAL (retail price)</li>
                    <li>• TOTAL_USD</li>
                    <li>• Product Type</li>
                    <li>• IMAGE_URL (images - use | separator)</li>
                    <li>• Thumbnail (3rd image)</li>
                    <li className="font-semibold text-primary">• DELIVERY TYPE (immediate/scheduled)</li>
                    <li className="font-semibold text-primary">• DELIVERY DATE (for scheduled)</li>
                  </ul>
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold">Delivery:</span> Set DELIVERY TYPE to "immediate" or "scheduled". 
                      If scheduled, add DELIVERY DATE in YYYY-MM-DD format.
                    </p>
                  </div>
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

                {importErrors.length > 0 && (
                  <div className="mt-6 p-4 border border-destructive rounded-lg bg-destructive/10">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-destructive">Import Errors ({importErrors.length})</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadErrorLog}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download Error Log
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Some products failed to import. Download the error log to see details.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ApprovalGuard>
  );
};

export default Import;
