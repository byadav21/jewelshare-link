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
import { ArrowLeft, Upload, Loader2, Download, AlertCircle, CheckCircle2 } from "lucide-react";
import * as XLSX from 'xlsx';
import { productImportSchema, gemstoneImportSchema, diamondImportSchema } from "@/lib/validations";
import { generateProductTemplate } from "@/utils/generateTemplate";
import { convertINRtoUSD } from "@/utils/currencyConversion";
import { getExpectedColumns } from "@/utils/columnMapping";

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
  const [columnMappings, setColumnMappings] = useState<{
    detected: string[];
    missing: string[];
    suggestions: Record<string, string>;
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
    setColumnMappings(null);

    try {
      // Fetch vendor profile for auto-calculations
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Not authenticated");
      }

      const { data: vendorProfile } = await supabase
        .from('vendor_profiles')
        .select('gold_rate_24k_per_gram, making_charges_per_gram')
        .eq('user_id', user.id)
        .single();

      const goldRate = vendorProfile?.gold_rate_24k_per_gram || 7000; // Default fallback
      const makingCharges = vendorProfile?.making_charges_per_gram || 500; // Default fallback

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      
      // Find the data sheet (skip "Instructions" sheet if present)
      let sheetName = workbook.SheetNames[0];
      if (sheetName === 'Instructions' && workbook.SheetNames.length > 1) {
        sheetName = workbook.SheetNames[1]; // Use second sheet if first is instructions
      }
      
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet); // Don't skip any rows - read headers correctly

      // Detect columns and check for mapping issues
      if (jsonData.length > 0) {
        const detectedColumns = Object.keys(jsonData[0] as any);
        const expectedColumns = getExpectedColumns(selectedProductType);
        const missing: string[] = [];
        const suggestions: Record<string, string> = {};

        // Check for missing required columns and suggest mappings
        expectedColumns.required.forEach(reqCol => {
          const exactMatch = detectedColumns.find(col => 
            col.toLowerCase() === reqCol.toLowerCase() || 
            col.replace(/[_\s]/g, '').toLowerCase() === reqCol.replace(/[_\s]/g, '').toLowerCase()
          );
          
          if (!exactMatch) {
            // Try to find similar column
            const similar = detectedColumns.find(col => {
              const colClean = col.toLowerCase().replace(/[_\s]/g, '');
              const reqClean = reqCol.toLowerCase().replace(/[_\s]/g, '');
              return colClean.includes(reqClean) || reqClean.includes(colClean);
            });
            
            if (similar) {
              suggestions[reqCol] = similar;
            } else {
              missing.push(reqCol);
            }
          }
        });

        setColumnMappings({
          detected: detectedColumns,
          missing,
          suggestions
        });
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
          const priceINR = parseNumber(row['PRICE INR'] || row.PRICE_INR || row['Price INR'] || row['Price']);
          
          // Check if COST PRICE and RETAIL PRICE columns exist in the file (handle both underscore and space formats)
          const hasCostPrice = 'COST PRICE' in row || 'COST_PRICE' in row || 'Cost Price' in row;
          const hasRetailPrice = 'RETAIL PRICE' in row || 'RETAIL_PRICE' in row || 'Retail Price' in row;
          
          const costPriceRaw = hasCostPrice ? parseNumber(row['COST PRICE'] || row.COST_PRICE || row['Cost Price']) : null;
          const retailPriceRaw = hasRetailPrice ? parseNumber(row['RETAIL PRICE'] || row.RETAIL_PRICE || row['Retail Price']) : null;
          
          // Ensure we always have valid prices (minimum 0.01)
          const safePrice = (priceINR && priceINR > 0) ? priceINR : 0.01;
          const costPrice = (costPriceRaw !== null && costPriceRaw > 0) ? costPriceRaw : safePrice;
          const retailPrice = (retailPriceRaw !== null && retailPriceRaw > 0) ? retailPriceRaw : safePrice;
          const priceUSD = safePrice > 0.01 ? await convertINRtoUSD(safePrice) : null;
          
          product = {
            user_id: user.id,
            sku: row['SKU ID'] || row['SKU'] || `GEM-${index + 1}`,
            gemstone_name: row['GEMSTONE NAME'] || row['Gemstone Name'] || 'Ruby',
            gemstone_type: row['GEMSTONE TYPE'] || row['Gemstone Type'] || null,
            carat_weight: parseNumber(row['CARAT WEIGHT'] || row['Carat Weight']),
            color: row['COLOR'] || row['Color'] || null,
            clarity: row['CLARITY'] || row['Clarity'] || null,
            cut: row['CUT'] || row['Cut'] || null,
            polish: row['POLISH'] || row['Polish'] || null,
            symmetry: row['SYMMETRY'] || row['Symmetry'] || null,
            measurement: row['MEASUREMENT'] || row['Measurement'] || null,
            certification: row['CERTIFICATION'] || row['Certification'] || null,
            image_url: imageUrl || null,
            image_url_2: imageUrl2 || null,
            image_url_3: imageUrl3 || null,
            price_inr: safePrice,
            price_usd: priceUSD,
            cost_price: costPrice,
            retail_price: retailPrice,
            stock_quantity: parseNumber(row['STOCK QUANTITY'] || row['Stock Quantity']) || 1,
            product_type: 'Gemstones',
            name: row['GEMSTONE NAME'] || row['Gemstone Name'] || 'Unknown Gemstone',
          };
        } else if (selectedProductType === 'Loose Diamonds') {
          const priceINR = parseNumber(row['PRICE INR'] || row.PRICE_INR || row['Price INR'] || row['Price']);
          
          // Check if COST PRICE and RETAIL PRICE columns exist in the file (handle both underscore and space formats)
          const hasCostPrice = 'COST PRICE' in row || 'COST_PRICE' in row || 'Cost Price' in row;
          const hasRetailPrice = 'RETAIL PRICE' in row || 'RETAIL_PRICE' in row || 'Retail Price' in row;
          
          const costPriceRaw = hasCostPrice ? parseNumber(row['COST PRICE'] || row.COST_PRICE || row['Cost Price']) : null;
          const retailPriceRaw = hasRetailPrice ? parseNumber(row['RETAIL PRICE'] || row.RETAIL_PRICE || row['Retail Price']) : null;
          
          // Ensure we always have valid prices (minimum 0.01)
          const safePrice = (priceINR && priceINR > 0) ? priceINR : 0.01;
          const costPrice = (costPriceRaw !== null && costPriceRaw > 0) ? costPriceRaw : safePrice;
          const retailPrice = (retailPriceRaw !== null && retailPriceRaw > 0) ? retailPriceRaw : safePrice;
          const priceUSD = safePrice > 0.01 ? await convertINRtoUSD(safePrice) : null;
          
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
            image_url: imageUrl || null,
            image_url_2: imageUrl2 || null,
            image_url_3: imageUrl3 || null,
            price_inr: safePrice,
            price_usd: priceUSD,
            cost_price: costPrice,
            retail_price: retailPrice,
            stock_quantity: parseNumber(row['STOCK QUANTITY'] || row['Stock Quantity']) || 1,
            product_type: 'Loose Diamonds',
            name: `${row.SHAPE || 'Round'} Diamond ${row.CARAT || '1.0'}ct`,
          };
        } else {
          // Jewellery - GEMHUB format with auto-calculations
          const grossWeight = parseNumber(row['G WT']) || 0;
          const totalDiamondWeight = parseNumber(row['T DWT']) || 0;
          const gemstoneWeight = parseNumber(row['GEMSTONE WT']) || 0;
          
          // Calculate NET WT if not provided: G WT - T DWT + GEMSTONE WT/5
          const netWeightFromExcel = parseNumber(row['NET WT']);
          const netWeight = netWeightFromExcel || (grossWeight - totalDiamondWeight + gemstoneWeight / 5);
          
          // Parse purity (handles both 76% and 0.76 formats)
          const purityFraction = (() => {
            const purityValue = row.PURITY_FRACTION_USED;
            if (!purityValue) return 0.76; // Default 18K
            if (typeof purityValue === 'string' && purityValue.includes('%')) {
              const numValue = parseFloat(purityValue.replace(/[^0-9.-]/g, ''));
              return numValue > 0 ? numValue / 100 : 0.76;
            }
            const numValue = parseNumber(purityValue);
            return numValue > 1 ? numValue / 100 : (numValue || 0.76);
          })();
          
          // Calculate D VALUE if not provided: (D.WT 1 × D RATE 1) + (D.WT 2 × Pointer diamond)
          const dWt1 = parseNumber(row['D.WT 1'] || row['D WT 1']) || 0;
          const dWt2 = parseNumber(row['D.WT 2'] || row['D WT 2']) || 0;
          const dRate1 = parseNumber(row['D RATE 1']) || 0;
          const pointerDiamond = parseNumber(row['Pointer diamond']) || 0;
          const dValueFromExcel = parseNumber(row['D VALUE']);
          const dValue = dValueFromExcel || (dWt1 * dRate1 + dWt2 * pointerDiamond);
          
          // Calculate MKG if not provided: G WT × making_charges_per_gram
          const mkgFromExcel = parseNumber(row.MKG);
          const mkg = mkgFromExcel || (grossWeight * makingCharges);
          
          // Calculate GOLD if not provided: NET WT × gold_rate × purity_fraction
          const goldFromExcel = parseNumber(row.GOLD);
          const goldValue = goldFromExcel || (netWeight * goldRate * purityFraction);
          
          // Calculate TOTAL if not provided: D VALUE + MKG + GOLD + Certification cost + Gemstone cost
          const certificationCost = parseNumber(row['Certification cost']) || 0;
          const gemstoneCost = parseNumber(row['Gemstone cost']) || 0;
          const totalFromExcel = parseNumber(row.TOTAL);
          const totalPrice = totalFromExcel || (dValue + mkg + goldValue + certificationCost + gemstoneCost);
          
          // Convert to USD if not provided
          const totalUsdFromExcel = parseNumber(row.TOTAL_USD);
          const totalUsd = totalUsdFromExcel || (totalPrice > 0 ? await convertINRtoUSD(totalPrice) : null);
          
          // Handle GEMHUB format columns
          product = {
            user_id: user.id,
            name: row.PRODUCT || row.CERT || `Product ${index + 1}`,
            description: row.DESCRIPTION || row['Prodcut Type'] || null,
            sku: row.CERT || row.SKU || null,
            category: row.CATEGORY || null,
            metal_type: row['METAL TYPE'] || null,
            gemstone: row.GEMSTONE || null,
            color: row.COLOR || null,
            diamond_color: row['Diamond Color'] || row['DIAMOND COLOR'] || null,
            clarity: row.CLARITY || null,
            image_url: imageUrl || null,
            image_url_2: imageUrl2 || null,
            image_url_3: imageUrl3 || null,
            
            // Weight fields
            weight_grams: grossWeight || null,
            net_weight: netWeight || null,
            diamond_weight: totalDiamondWeight || null,
            carat_weight: gemstoneWeight || null, // Store gemstone weight in carat_weight
            
            // GEMHUB specific diamond fields
            d_wt_1: dWt1 || null,
            d_wt_2: dWt2 || null,
            diamond_type: row['CS TYPE'] || null,
            purity_fraction_used: purityFraction,
            d_rate_1: dRate1 || null,
            pointer_diamond: pointerDiamond || null,
            d_value: dValue || null,
            gemstone_type: row['GEMSTONE TYPE'] || null,
            mkg: mkg || null,
            gold_per_gram_price: goldValue || null,
            certification_cost: certificationCost || null,
            gemstone_cost: gemstoneCost || null,
            total_usd: totalUsd,
            
            // Pricing - use calculated TOTAL
            price_inr: totalPrice,
            price_usd: totalUsd,
            cost_price: totalPrice, // Use TOTAL as cost price
            retail_price: totalPrice, // Use TOTAL as retail price
            stock_quantity: parseNumber(row['STOCK QUANTITY']) || 1,
            
            // Delivery
            delivery_type: (() => {
              const deliveryType = row['DELIVERY TYPE'];
              if (!deliveryType) return 'immediate';
              const typeStr = String(deliveryType).toLowerCase();
              return typeStr.includes('schedule') ? 'scheduled' : 'immediate';
            })(),
            dispatches_in_days: row['DISPATCHES IN DAYS'] || null,
            
            product_type: 'Jewellery',
          };
        }

        // Validate product data
        const validation = schema.safeParse(product);
        if (!validation.success) {
          const errorMessages = validation.error.issues.map(err => 
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
        // Debug: Log first product to see what values we're sending
        console.log('DEBUG: First product to insert:', JSON.stringify(productsToInsert[0], null, 2));
        console.log('DEBUG: cost_price value:', productsToInsert[0].cost_price);
        console.log('DEBUG: retail_price value:', productsToInsert[0].retail_price);
        
        const { data: insertedProducts, error: insertError } = await supabase
          .from("products")
          .insert(productsToInsert)
          .select();

        if (insertError) {
          console.error('DEBUG: Insert error:', insertError);
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

                {columnMappings && (
                  <div className="space-y-3">
                    {columnMappings.missing.length > 0 && (
                      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg space-y-2">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-destructive">Missing Required Columns</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              The following columns are required but not found in your file:
                            </p>
                            <ul className="mt-2 space-y-1">
                              {columnMappings.missing.map(col => (
                                <li key={col} className="text-sm font-mono bg-background/50 px-2 py-1 rounded">
                                  {col}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {Object.keys(columnMappings.suggestions).length > 0 && (
                      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg space-y-2">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-amber-600">Column Name Suggestions</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              These columns have similar names and will be automatically mapped:
                            </p>
                            <ul className="mt-2 space-y-1">
                              {Object.entries(columnMappings.suggestions).map(([expected, detected]) => (
                                <li key={expected} className="text-sm">
                                  <span className="font-mono bg-background/50 px-2 py-1 rounded">{detected}</span>
                                  <span className="mx-2">→</span>
                                  <span className="font-mono bg-primary/10 px-2 py-1 rounded">{expected}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {columnMappings.missing.length === 0 && Object.keys(columnMappings.suggestions).length === 0 && (
                      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <p className="text-sm font-semibold text-green-600">
                            All columns match perfectly!
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        <strong>Detected columns:</strong> {columnMappings.detected.join(', ')}
                      </p>
                    </div>
                  </div>
                )}

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
