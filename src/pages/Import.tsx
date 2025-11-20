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
        const deliveryType = row['DELIVERY TYPE'] || row['Delivery Type'] || 'immediate';
        let deliveryDate = null;
        if ((deliveryType === 'scheduled' || deliveryType === 'Scheduled') && row['DELIVERY DATE']) {
          try {
            // Handle Excel date serial numbers or formatted dates
            const rawDate = row['DELIVERY DATE'];
            if (typeof rawDate === 'number') {
              // Excel serial date conversion
              const excelDate = new Date((rawDate - 25569) * 86400 * 1000);
              deliveryDate = excelDate.toISOString();
            } else if (typeof rawDate === 'string') {
              deliveryDate = new Date(rawDate).toISOString();
            }
          } catch (e) {
            console.warn('Could not parse delivery date:', row['DELIVERY DATE']);
          }
        }
        
        const product = {
          user_id: user.id,
          name: row.PRODUCT || row.CERT || `Product ${index + 1}`,
          description: `${row['Diamond Color'] || row['Diamond Co'] || ''} ${row.CLARITY || ''} ${row['T DWT'] ? row['T DWT'] + ' ct' : ''}`.trim() || null,
          sku: row.CERT || null,
          category: row['CS TYPE'] || row['Prodcut Type'] || row['Product Type'] || "Diamond Jewelry",
          metal_type: row.PURITY_FRACTION_USED ? `${Math.round(parseFloat(row.PURITY_FRACTION_USED) * 100)}% Gold` : null,
          gemstone: row['GEMSTONE TYPE'] || row.GEMSTONE || (row['Diamond Color'] && row.CLARITY ? `${row['Diamond Color']} ${row.CLARITY}` : null),
          color: row['Diamond Color'] || row['Diamond Co'] || null,
          clarity: row.CLARITY || null,
          image_url: imageUrl,
          image_url_2: imageUrl2,
          image_url_3: imageUrl3,
          weight_grams: parseNumber(row['G WT']) || parseNumber(row['GROSS WT']) || parseNumber(row['Gross WT']) || null,
          net_weight: parseNumber(row['NET WT']) || parseNumber(row['Net WT']) || null,
          diamond_weight: parseNumber(row['T DWT']) || parseNumber(row['Diamond Wt']) || null,
          cost_price: costPrice,
          retail_price: retailPrice,
          per_carat_price: parseNumber(row['Per Carat Price']) || parseNumber(row['PER CARAT PRICE']) || null,
          gold_per_gram_price: parseNumber(row['Gold/g Price']) || parseNumber(row['GOLD PER GRAM PRICE']) || null,
          stock_quantity: 1,
          // New fields from Excel
          diamond_color: row['Diamond Color'] || row['Diamond Co'] || null,
          d_wt_1: parseNumber(row['D.WT 1']) || parseNumber(row['D WT 1']) || null,
          d_wt_2: parseNumber(row['D.WT 2']) || parseNumber(row['D WT 2']) || null,
          purity_fraction_used: parseNumber(row.PURITY_FRACTION_USED) ? parseNumber(row.PURITY_FRACTION_USED) * 100 : null,
          d_rate_1: parseNumber(row['D RATE 1']) || null,
          pointer_diamond: parseNumber(row['Pointer diamond']) || null,
          d_value: parseNumber(row['D VALUE']) || null,
          mkg: parseNumber(row.MKG) || null,
          certification_cost: parseNumber(row['Certification cost']) || null,
          gemstone_cost: parseNumber(row['Gemstone cost']) || null,
          total_usd: parseNumber(row.TOTAL_USD) || null,
          product_type: row['Prodcut Type'] || row['Product Type'] || null,
          delivery_type: deliveryType === 'scheduled' || deliveryType === 'Scheduled' ? 'scheduled' : 'immediate',
          delivery_date: deliveryDate,
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ApprovalGuard>
  );
};

export default Import;
