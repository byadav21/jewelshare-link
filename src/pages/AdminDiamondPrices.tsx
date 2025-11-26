import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, Upload, Trash2, AlertCircle, History, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminDiamondPrices = () => {
  const [uploading, setUploading] = useState(false);
  const [pearFile, setPearFile] = useState<File | null>(null);
  const [roundFile, setRoundFile] = useState<File | null>(null);
  const [displayCount, setDisplayCount] = useState(100);
  const queryClient = useQueryClient();

  const { data: pricesData, isLoading } = useQuery({
    queryKey: ["diamond-prices"],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from("diamond_prices")
        .select("*", { count: 'exact' })
        .order("shape", { ascending: true })
        .order("carat_range_min", { ascending: true })
        .limit(10000);
      
      if (error) throw error;
      return { data, count };
    },
  });

  const prices = pricesData?.data || [];
  const totalCount = pricesData?.count || 0;

  const { data: priceHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["diamond-price-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("diamond_price_history")
        .select("*")
        .order("changed_at", { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    },
  });

  const downloadTemplate = () => {
    const headers = [
      "shape",
      "carat_range_min",
      "carat_range_max",
      "color_grade",
      "clarity_grade",
      "cut_grade",
      "price_per_carat",
      "currency",
      "notes"
    ];
    
    const sampleData = [
      "Round,0.50,0.69,D,IF,Excellent,15000,USD,Sample entry",
      "Round,0.50,0.69,D,VVS1,Excellent,12000,USD,",
      "Princess,1.00,1.49,E,VS1,Very Good,8000,USD,"
    ];

    const csv = [headers.join(","), ...sampleData].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "diamond_prices_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Template downloaded!");
  };

  const parseRapaportFormat = (line: string, defaultShape: string = "Round") => {
    // Format: CutGrade,Clarity,Color,CaratMin,CaratMax,Price,Date
    // Example: BR,IF,D,0.01,0.03,830.0, 11/21/2025
    const values = line.split(",").map(v => v.trim());
    
    if (values.length < 6) return null;

    // Map cut grade codes to shape
    const cutGradeMap: Record<string, string> = {
      'BR': 'Round',
      'PS': 'Pear',
      'PR': 'Princess',
      'EM': 'Emerald',
      'CU': 'Cushion',
      'OV': 'Oval',
      'MQ': 'Marquise',
      'HT': 'Heart',
      'RD': 'Radiant',
      'AS': 'Asscher'
    };

    const cutGrade = values[0];
    const shape = cutGradeMap[cutGrade] || defaultShape;

    return {
      shape,
      clarity_grade: values[1],
      color_grade: values[2],
      carat_range_min: parseFloat(values[3]),
      carat_range_max: parseFloat(values[4]),
      price_per_carat: parseFloat(values[5]),
      cut_grade: 'Excellent',
      currency: 'USD',
      notes: null,
    };
  };

  const parseStandardFormat = (line: string) => {
    // Format: shape,carat_range_min,carat_range_max,color_grade,clarity_grade,cut_grade,price_per_carat,currency,notes
    const values = line.split(",").map(v => v.trim());
    
    if (values.length < 7) return null;

    return {
      shape: values[0],
      carat_range_min: parseFloat(values[1]),
      carat_range_max: parseFloat(values[2]),
      color_grade: values[3],
      clarity_grade: values[4],
      cut_grade: values[5],
      price_per_carat: parseFloat(values[6]),
      currency: values[7] || "USD",
      notes: values[8] || null,
    };
  };

  const handleFileUpload = async (file: File | null, targetShape: 'pear' | 'round') => {
    if (!file) {
      toast.error("Please select a CSV file");
      return;
    }

    setUploading(true);
    try {
      const text = await file.text();
      const lines = text.split("\n").filter(line => line.trim());
      
      if (lines.length < 1) {
        toast.error("CSV file is empty");
        return;
      }

      const records = [];
      let skippedRows = 0;

      // Detect format from first line
      const firstLine = lines[0];
      const isRapaportFormat = /^[A-Z]{2},/.test(firstLine); // Starts with 2-letter code
      
      // If standard format with headers, skip first line
      const startIndex = isRapaportFormat ? 0 : (firstLine.toLowerCase().includes('shape') ? 1 : 0);

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        let record = null;
        
        if (isRapaportFormat) {
          record = parseRapaportFormat(line, targetShape === 'round' ? 'Round' : 'Pear');
        } else {
          record = parseStandardFormat(line);
        }

        // Override shape based on target
        if (record && targetShape === 'round') {
          record.shape = 'Round';
        } else if (record && targetShape === 'pear') {
          // For pear uploads, keep the parsed shape (could be any fancy shape)
          // or default to Pear if not specified
          if (!record.shape || record.shape === 'Round') {
            record.shape = 'Pear';
          }
        }

        if (!record) {
          skippedRows++;
          continue;
        }

        // Validate required fields
        if (
          !record.shape ||
          isNaN(record.carat_range_min) ||
          isNaN(record.carat_range_max) ||
          !record.color_grade ||
          !record.clarity_grade ||
          !record.cut_grade ||
          isNaN(record.price_per_carat)
        ) {
          skippedRows++;
          continue;
        }

        records.push(record);
      }

      if (records.length === 0) {
        toast.error("No valid records found in CSV");
        return;
      }

      // Insert records in batches
      const { error } = await supabase
        .from("diamond_prices")
        .insert(records);

      if (error) throw error;

      const message = skippedRows > 0 
        ? `Imported ${records.length} records (${skippedRows} rows skipped)`
        : `Successfully imported ${records.length} price records!`;
      
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ["diamond-prices"] });
      if (targetShape === 'pear') setPearFile(null);
      if (targetShape === 'round') setRoundFile(null);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload CSV");
    } finally {
      setUploading(false);
    }
  };

  const deleteAllPrices = async () => {
    if (!confirm("Are you sure you want to delete ALL diamond prices? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("diamond_prices")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

      if (error) throw error;

      toast.success("All prices deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["diamond-prices"] });
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error("Failed to delete prices");
    }
  };

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ["diamond-prices"] });
    queryClient.invalidateQueries({ queryKey: ["diamond-price-history"] });
    toast.success("Data refreshed");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Diamond Price Management</h1>
          <p className="text-muted-foreground mt-2">
            Import and manage Rapaport-style diamond pricing data
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Import CSV
              </CardTitle>
              <CardDescription>
                Upload a CSV file with diamond pricing data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs space-y-1">
                  <div><strong>Standard format:</strong> shape, carat_range_min, carat_range_max, color_grade, clarity_grade, cut_grade, price_per_carat, currency, notes</div>
                  <div><strong>Rapaport format:</strong> CutCode, Clarity, Color, CaratMin, CaratMax, Price, Date</div>
                  <div className="text-muted-foreground mt-1">Supports both formats automatically</div>
                </AlertDescription>
              </Alert>

              {/* Pear Upload - For all fancy shapes */}
              <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Fancy Shapes</Badge>
                  <p className="text-sm text-muted-foreground">Pear, Princess, Emerald, Cushion, Oval, etc.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pear-csv">Pear Pricing CSV</Label>
                  <Input
                    id="pear-csv"
                    type="file"
                    accept=".csv"
                    onChange={(e) => setPearFile(e.target.files?.[0] || null)}
                  />
                </div>
                <Button
                  onClick={() => handleFileUpload(pearFile, 'pear')}
                  disabled={!pearFile || uploading}
                  className="w-full"
                >
                  {uploading ? "Uploading..." : "Upload Pear/Fancy Shapes"}
                </Button>
              </div>

              {/* Round Upload - Round only */}
              <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Round</Badge>
                  <p className="text-sm text-muted-foreground">Round brilliant diamonds only</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="round-csv">Round Pricing CSV</Label>
                  <Input
                    id="round-csv"
                    type="file"
                    accept=".csv"
                    onChange={(e) => setRoundFile(e.target.files?.[0] || null)}
                  />
                </div>
                <Button
                  onClick={() => handleFileUpload(roundFile, 'round')}
                  disabled={!roundFile || uploading}
                  className="w-full"
                >
                  {uploading ? "Uploading..." : "Upload Round Pricing"}
                </Button>
              </div>

              <Button
                onClick={downloadTemplate}
                variant="outline"
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </CardContent>
          </Card>

          {/* Stats Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Database Stats</CardTitle>
                  <CardDescription>
                    Current pricing data summary
                  </CardDescription>
                </div>
                <Button
                  onClick={refreshData}
                  variant="outline"
                  size="icon"
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Entries</p>
                  <p className="text-2xl font-bold">{totalCount}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Unique Shapes</p>
                  <p className="text-2xl font-bold">
                    {prices ? new Set(prices.map(p => p.shape)).size : 0}
                  </p>
                </div>
              </div>

                <Button
                  onClick={deleteAllPrices}
                  variant="destructive"
                  className="w-full"
                  disabled={totalCount === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete All Prices
                </Button>
            </CardContent>
          </Card>
        </div>

        {/* Price List Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Diamond Pricing Data
            </CardTitle>
            <CardDescription>
              View current prices and update history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="current" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="current">Current Prices</TabsTrigger>
                <TabsTrigger value="history">Update History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="current">
                {isLoading ? (
                  <p className="text-center py-8 text-muted-foreground">Loading...</p>
                ) : totalCount === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    No pricing data yet. Upload a CSV to get started.
                  </p>
                ) : (
                  <div className="border rounded-lg overflow-auto max-h-[500px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Shape</TableHead>
                          <TableHead>Carat Range</TableHead>
                          <TableHead>Color</TableHead>
                          <TableHead>Clarity</TableHead>
                          <TableHead>Cut</TableHead>
                          <TableHead className="text-right">Price/Carat</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {prices.slice(0, displayCount).map((price) => (
                          <TableRow key={price.id}>
                            <TableCell>
                              <Badge variant="outline">{price.shape}</Badge>
                            </TableCell>
                            <TableCell>
                              {price.carat_range_min} - {price.carat_range_max}
                            </TableCell>
                            <TableCell>{price.color_grade}</TableCell>
                            <TableCell>{price.clarity_grade}</TableCell>
                            <TableCell>{price.cut_grade}</TableCell>
                            <TableCell className="text-right font-mono">
                              {price.currency} {price.price_per_carat.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {prices.length > displayCount && (
                      <div className="flex flex-col items-center gap-2 py-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          Showing {displayCount} of {prices.length} entries
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => setDisplayCount(prev => Math.min(prev + 100, prices.length))}
                        >
                          Load More (100)
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history">
                {historyLoading ? (
                  <p className="text-center py-8 text-muted-foreground">Loading history...</p>
                ) : !priceHistory || priceHistory.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    No price updates recorded yet.
                  </p>
                ) : (
                  <div className="border rounded-lg overflow-auto max-h-[500px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Shape</TableHead>
                          <TableHead>Grades</TableHead>
                          <TableHead>Change</TableHead>
                          <TableHead className="text-right">Old Price</TableHead>
                          <TableHead className="text-right">New Price</TableHead>
                          <TableHead>Type</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {priceHistory.map((history) => {
                          const priceChange = history.old_price_per_carat 
                            ? ((history.new_price_per_carat - history.old_price_per_carat) / history.old_price_per_carat * 100)
                            : 0;
                          const isIncrease = priceChange > 0;
                          
                          return (
                            <TableRow key={history.id}>
                              <TableCell className="text-sm">
                                {new Date(history.changed_at).toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{history.shape}</Badge>
                              </TableCell>
                              <TableCell className="text-sm">
                                {history.color_grade}/{history.clarity_grade}/{history.cut_grade}
                                <div className="text-xs text-muted-foreground">
                                  {history.carat_range_min}-{history.carat_range_max}ct
                                </div>
                              </TableCell>
                              <TableCell>
                                {history.change_type === 'insert' ? (
                                  <Badge variant="secondary">New</Badge>
                                ) : history.change_type === 'delete' ? (
                                  <Badge variant="destructive">Deleted</Badge>
                                ) : priceChange !== 0 ? (
                                  <div className="flex items-center gap-1">
                                    {isIncrease ? (
                                      <TrendingUp className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <TrendingDown className="h-4 w-4 text-red-500" />
                                    )}
                                    <span className={isIncrease ? "text-green-600" : "text-red-600"}>
                                      {isIncrease ? '+' : ''}{priceChange.toFixed(1)}%
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">No change</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right font-mono text-sm">
                                {history.old_price_per_carat 
                                  ? `${history.currency} ${history.old_price_per_carat.toLocaleString()}`
                                  : '-'}
                              </TableCell>
                              <TableCell className="text-right font-mono text-sm">
                                {history.currency} {history.new_price_per_carat.toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <Badge variant={
                                  history.change_type === 'insert' ? 'default' :
                                  history.change_type === 'delete' ? 'destructive' :
                                  'secondary'
                                }>
                                  {history.change_type}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                    <p className="text-sm text-muted-foreground text-center py-3 border-t">
                      Showing last 100 updates
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDiamondPrices;
