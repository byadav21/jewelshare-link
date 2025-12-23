import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Image, 
  Upload, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  AlertCircle,
  Database
} from "lucide-react";

interface MigrationResult {
  productId: string;
  sku: string;
  success: boolean;
  migratedImages: number;
  error?: string;
}

interface MigrationSummary {
  totalProducts: number;
  successfulProducts: number;
  totalImagesMigrated: number;
}

const MigrateImages = () => {
  const navigate = useNavigate();
  const [migrating, setMigrating] = useState(false);
  const [results, setResults] = useState<MigrationResult[]>([]);
  const [summary, setSummary] = useState<MigrationSummary | null>(null);
  const [progress, setProgress] = useState(0);

  const handleMigration = async () => {
    try {
      setMigrating(true);
      setProgress(10);
      setResults([]);
      setSummary(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in to migrate images");
        return;
      }

      setProgress(30);

      const { data, error } = await supabase.functions.invoke('migrate-images', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      setProgress(90);

      if (error) {
        console.error('Migration error:', error);
        throw new Error(error.message || 'Migration failed');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResults(data.results || []);
      setSummary(data.summary);
      setProgress(100);

      if (data.summary.totalImagesMigrated > 0) {
        toast.success(
          `Successfully migrated ${data.summary.totalImagesMigrated} images from ${data.summary.successfulProducts} products!`
        );
      } else {
        toast.info("No external images found to migrate. All images are already hosted on your server.");
      }

    } catch (error: any) {
      console.error('Migration error:', error);
      toast.error(error.message || "Failed to migrate images");
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/95 backdrop-blur-md shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="hover:bg-muted"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-foreground">
                  Image Migration Tool
                </h1>
                <p className="text-sm text-muted-foreground">
                  Migrate external images to your server
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-6 py-8 max-w-4xl">
        {/* Instructions Card */}
        <Card className="mb-6 border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5 text-primary" />
              What does this tool do?
            </CardTitle>
            <CardDescription>
              This migration tool will automatically:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">Download external images</p>
                <p className="text-sm text-muted-foreground">
                  Fetches all product images currently hosted on external URLs
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Upload className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">Upload to your server</p>
                <p className="text-sm text-muted-foreground">
                  Stores images in your Supabase Storage for faster, reliable access
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Database className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">Update product records</p>
                <p className="text-sm text-muted-foreground">
                  Automatically updates your products with new hosted image URLs
                </p>
              </div>
            </div>

            <Alert className="mt-4 border-blue-500/30 bg-blue-500/5">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-sm">
                This process may take a few minutes depending on how many products you have.
                Images larger than 5MB will be skipped.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Migration Control */}
        <Card className="mb-6 bg-card/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <Button
              onClick={handleMigration}
              disabled={migrating}
              size="lg"
              className="w-full h-14 text-base shadow-lg hover:shadow-xl transition-all"
            >
              {migrating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Migrating Images...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 mr-2" />
                  Start Migration
                </>
              )}
            </Button>

            {migrating && (
              <div className="mt-4 space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground text-center">
                  {progress < 30 ? "Preparing migration..." : 
                   progress < 90 ? "Processing images..." : 
                   "Finalizing..."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        {summary && (
          <Card className="mb-6 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle className="text-xl">Migration Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-background/50">
                  <div className="text-3xl font-bold text-primary">{summary.totalProducts}</div>
                  <div className="text-sm text-muted-foreground mt-1">Products Processed</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-background/50">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {summary.successfulProducts}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Successful</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-background/50">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {summary.totalImagesMigrated}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Images Migrated</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Migration Results</CardTitle>
              <CardDescription>
                Detailed results for each product
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {results.map((result) => (
                    <div
                      key={result.productId}
                      className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {result.success ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {result.sku}
                          </p>
                          {result.error && (
                            <p className="text-sm text-destructive truncate">
                              {result.error}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge 
                        variant={result.migratedImages > 0 ? "default" : "secondary"}
                        className="ml-3"
                      >
                        {result.migratedImages} {result.migratedImages === 1 ? 'image' : 'images'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default MigrateImages;
