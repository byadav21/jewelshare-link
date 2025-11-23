import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ApprovalGuard } from "@/components/ApprovalGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, Loader2, Download } from "lucide-react";
import * as XLSX from 'xlsx';
import { productImportSchema, gemstoneImportSchema, diamondImportSchema } from "@/lib/validations";
import { generateProductTemplate } from "@/utils/generateTemplate";
import { convertINRtoUSD } from "@/utils/currencyConversion";

type ProductType = 'Jewellery' | 'Gemstones' | 'Loose Diamonds';

const Import = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedProductType, setSelectedProductType] = useState<ProductType>('Jewellery');
  const [importErrors, setImportErrors] = useState<Array<{row: number, product: string, errors: string[]}>>([]);
  const [previewData, setPreviewData] = useState<{
    valid: any[];
    invalid: Array<{row: number, product: string, errors: string[]}>;
  } | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch approved categories
  const { data: approvedCategories } = useQuery({
    queryKey: ['approvedCategories'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data } = await supabase
        .from('user_approval_status')
        .select('approved_categories')
        .eq('user_id', user.id)
        .single();

      return (data?.approved_categories || []) as string[];
    },
  });

  const handlePreview = async () => {
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
    setPreviewData(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { range: 1 });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Not authenticated");
      }

      const errors: Array<{row: number, product: string, errors: string[]}> = [];
      const validProducts: any[] = [];
      
      // Select appropriate schema based on product type
      const schema = selectedProductType === 'Gemstones' ? gemstoneImportSchema :
                     selectedProductType === 'Loose Diamonds' ? diamondImportSchema :
                     productImportSchema;
      
      for (const [index, rowData] of jsonData.entries()) {
        const row: any = rowData; // Type assertion for Excel data
        
        // Parse numbers safely
        const parseNumber = (val: any): number => {
          if (typeof val === 'number') return val;
          if (typeof val === 'string') {
            const cleaned = val.replace(/[^0-9.-]/g, '');
            return parseFloat(cleaned) || 0;
          }
          return 0;
        };

        // Parse image URLs
        let imageUrl = null;
        let imageUrl2 = null;
        let imageUrl3 = null;
        if (row.IMAGE_URL || row['IMAGE URL']) {
          const cleanUrls = String(row.IMAGE_URL || row['IMAGE URL'])
            .replace(/\\/g, '')
            .split('|')
            .map((url: string) => url.trim())
            .filter((url: string) => url.startsWith('http'));
          
          imageUrl = cleanUrls[0] || null;
          imageUrl2 = cleanUrls[1] || null;
          imageUrl3 = cleanUrls[2] || null;
        }

        let product: any;

        if (selectedProductType === 'Gemstones') {
          const priceINR = parseNumber(row.PRICE_INR || row['PRICE INR']);
          const priceUSD = await convertINRtoUSD(priceINR);
          
          product = {
            user_id: user.id,
            sku: row['SKU ID'] || row['SKU'] || `GEM-${index + 1}`,
            gemstone_name: row['GEMSTONE NAME'] || row['Gemstone Name'] || 'Unknown',
            gemstone_type: row['GEMSTONE TYPE'] || row['Gemstone Type'] || null,
            carat_weight: parseNumber(row['CARAT WEIGHT'] || row['Carat Weight']) || null,
            color: row.COLOR || row['Color'] || null,
            clarity: row.CLARITY || row['Clarity'] || null,
            cut: row.CUT || row['Cut'] || null,
            polish: row.POLISH || row['Polish'] || null,
            symmetry: row.SYMMETRY || row['Symmetry'] || null,
            measurement: row.MEASUREMENT || row['Measurement'] || null,
            certification: row.CERTIFICATION || row['Certification'] || null,
            image_url: imageUrl,
            image_url_2: imageUrl2,
            image_url_3: imageUrl3,
            price_inr: priceINR,
            price_usd: priceUSD,
            stock_quantity: parseNumber(row['STOCK QUANTITY'] || row['Stock Quantity']) || 1,
            product_type: 'Gemstones',
            name: row['GEMSTONE NAME'] || row['Gemstone Name'] || 'Unknown Gemstone',
          };
        } else if (selectedProductType === 'Loose Diamonds') {
          const priceINR = parseNumber(row.PRICE_INR || row['PRICE INR']);
          const priceUSD = await convertINRtoUSD(priceINR);
          
          product = {
            user_id: user.id,
            sku: row['SKU NO'] || row['SKU'] || `DIA-${index + 1}`,
            diamond_type: row['DIAMOND TYPE'] || row['Diamond Type'] || 'Natural',
            status: row.STATUS || row['Status'] || null,
            shape: row.SHAPE || row['Shape'] || 'Round',
            carat: parseNumber(row.CARAT || row['Carat']),
            clarity: row.CLARITY || row['Clarity'] || 'VS1',
            color: row.COLOR || row['Color'] || 'F',
            color_shade_amount: row['COLOR SHADE AMOUNT'] || row['Color Shade Amount'] || null,
            cut: row.CUT || row['Cut'] || null,
            polish: row.POLISH || row['Polish'] || null,
            symmetry: row.SYMMETRY || row['Symmetry'] || null,
            fluorescence: row.FLO || row['Fluorescence'] || null,
            measurement: row.MEASUREMENT || row['Measurement'] || null,
            ratio: row.RATIO || row['Ratio'] || null,
            lab: row.LAB || row['Lab'] || null,
            image_url: imageUrl,
            image_url_2: imageUrl2,
            image_url_3: imageUrl3,
            price_inr: priceINR,
            price_usd: priceUSD,
            stock_quantity: parseNumber(row['STOCK QUANTITY'] || row['Stock Quantity']) || 1,
            product_type: 'Loose Diamonds',
            name: `${row.SHAPE || 'Round'} Diamond ${row.CARAT || '1.0'}ct`,
          };
        } else {
          // Jewellery (existing logic)
          const costPrice = parseNumber(row['COST PRICE']) || 0;
          const retailPrice = parseNumber(row['RETAIL PRICE']) || parseNumber(row.TOTAL) || costPrice;
          
          product = {
            user_id: user.id,
            name: row.PRODUCT || row.CERT || `Product ${index + 1}`,
            description: row.DESCRIPTION || null,
            sku: row.CERT || null,
            category: row.CATEGORY || null,
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
            cost_price: costPrice,
            retail_price: retailPrice,
            stock_quantity: parseNumber(row['STOCK QUANTITY']) || 1,
            product_type: 'Jewellery',
          };
        }

        // Validate product data
        const validation = schema.safeParse(product);
        if (!validation.success) {
          const errorMessages = validation.error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          );
          errors.push({
            row: index + 2,
            product: product.name || product.sku || `Row ${index + 2}`,
            errors: errorMessages
          });
        } else {
          validProducts.push(product);
        }
      }

      setPreviewData({
        valid: validProducts,
        invalid: errors
      });

      toast({
        title: "Preview Ready",
        description: `${validProducts.length} products will be imported, ${errors.length} have errors`,
      });
    } catch (error: any) {
      toast({
        title: "Preview Failed",
        description: error.message || "Failed to preview Excel file",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!previewData || previewData.valid.length === 0) return;

    setLoading(true);
    try {
      const products = previewData.valid;

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

      setImportErrors(previewData.invalid);
      
      toast({
        title: "Success!",
        description: `Updated ${updatedCount} products, imported ${insertedCount} new products`,
      });

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import products",
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
                <div className="space-y-2">
                  <Label htmlFor="productType">Select Product Type</Label>
                  <Select value={selectedProductType} onValueChange={(v) => setSelectedProductType(v as ProductType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {approvedCategories?.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Step 1: Download Template</h3>
                    <p className="text-sm text-muted-foreground">
                      Get the Excel template for {selectedProductType}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => generateProductTemplate(selectedProductType)}
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
                    {selectedProductType === 'Jewellery' && (
                      <>
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
                      </>
                    )}
                    
                    {selectedProductType === 'Gemstones' && (
                      <>
                        <li>• SKU ID (SKU)</li>
                        <li>• GEMSTONE NAME</li>
                        <li>• GEMSTONE TYPE</li>
                        <li>• CARAT WEIGHT</li>
                        <li>• COLOR</li>
                        <li>• CLARITY</li>
                        <li>• CUT</li>
                        <li>• POLISH</li>
                        <li>• SYMMETRY</li>
                        <li>• MEASUREMENT</li>
                        <li>• CERTIFICATION</li>
                        <li>• PRICE_INR</li>
                        <li>• STOCK QUANTITY</li>
                        <li>• IMAGE_URL (images - use | separator)</li>
                      </>
                    )}
                    
                    {selectedProductType === 'Loose Diamonds' && (
                      <>
                        <li>• SKU NO</li>
                        <li>• DIAMOND TYPE (Natural/Lab-grown)</li>
                        <li>• STATUS</li>
                        <li>• SHAPE</li>
                        <li>• CARAT</li>
                        <li>• CLARITY</li>
                        <li>• COLOR</li>
                        <li>• COLOR SHADE AMOUNT</li>
                        <li>• CUT</li>
                        <li>• POLISH</li>
                        <li>• SYMMETRY</li>
                        <li>• FLO (Fluorescence)</li>
                        <li>• MEASUREMENT</li>
                        <li>• RATIO</li>
                        <li>• LAB</li>
                        <li>• PRICE_INR</li>
                        <li>• STOCK QUANTITY</li>
                        <li>• IMAGE_URL (images - use | separator)</li>
                      </>
                    )}
                  </ul>
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      {selectedProductType === 'Jewellery' && (
                        <>
                          <span className="font-semibold">Delivery:</span> Set DELIVERY TYPE to "immediate" or "scheduled". 
                          If scheduled, add DELIVERY DATE in YYYY-MM-DD format.
                        </>
                      )}
                      {(selectedProductType === 'Gemstones' || selectedProductType === 'Loose Diamonds') && (
                        <>
                          <span className="font-semibold">Images:</span> Separate multiple image URLs with | (pipe) symbol. 
                          Up to 3 images supported.
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handlePreview}
                  disabled={loading || !file}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading Preview...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Preview Import
                    </>
                  )}
                </Button>

                {previewData && (
                  <div className="mt-6 space-y-4">
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <h3 className="font-semibold mb-3">Import Preview</h3>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded">
                          <p className="text-sm text-muted-foreground">Valid Products</p>
                          <p className="text-2xl font-bold text-green-600">{previewData.valid.length}</p>
                        </div>
                        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded">
                          <p className="text-sm text-muted-foreground">Invalid Products</p>
                          <p className="text-2xl font-bold text-destructive">{previewData.invalid.length}</p>
                        </div>
                      </div>
                      
                      {previewData.invalid.length > 0 && (
                        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded">
                          <p className="text-sm font-semibold text-destructive mb-2">Products with errors:</p>
                          <div className="max-h-40 overflow-y-auto space-y-1">
                            {previewData.invalid.slice(0, 5).map((err, idx) => (
                              <p key={idx} className="text-xs text-muted-foreground">
                                Row {err.row}: {err.product} - {err.errors[0]}
                              </p>
                            ))}
                            {previewData.invalid.length > 5 && (
                              <p className="text-xs text-muted-foreground italic">
                                ...and {previewData.invalid.length - 5} more errors
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          onClick={handleConfirmImport}
                          disabled={loading || previewData.valid.length === 0}
                          className="flex-1"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Importing...
                            </>
                          ) : (
                            `Confirm Import (${previewData.valid.length} products)`
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setPreviewData(null)}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

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
