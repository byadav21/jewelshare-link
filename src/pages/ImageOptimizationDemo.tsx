/**
 * Image Optimization Demo Page
 * Showcases all image optimization features
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OptimizedImage, OptimizedBackgroundImage } from "@/components/OptimizedImage";
import { OptimizedImageUpload } from "@/components/OptimizedImageUpload";
import { Button } from "@/components/ui/button";
import { removeBackgroundFromFile } from "@/utils/backgroundRemoval";
import { toast } from "sonner";
import { Download, Zap, Image as ImageIcon, Sparkles } from "lucide-react";

export default function ImageOptimizationDemo() {
  const [removedBgImage, setRemovedBgImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  const handleBackgroundRemoval = async (file: File) => {
    try {
      setIsProcessing(true);
      toast.info("Processing image...", {
        description: "This may take a few seconds",
      });

      const result = await removeBackgroundFromFile(file, (progress) => {
        setProcessingProgress(progress);
      });

      const url = URL.createObjectURL(result);
      setRemovedBgImage(url);

      toast.success("Background removed successfully!");
    } catch (error) {
      console.error("Failed to remove background:", error);
      toast.error("Failed to remove background");
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const downloadImage = () => {
    if (!removedBgImage) return;

    const link = document.createElement("a");
    link.href = removedBgImage;
    link.download = "transparent-background.png";
    link.click();
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Image Optimization Demo</h1>
          <p className="text-muted-foreground text-lg">
            Modern image handling with WebP, AVIF, lazy loading, and AI
          </p>
        </div>

        <Tabs defaultValue="optimized" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="optimized">
              <Zap className="h-4 w-4 mr-2" />
              Optimized Images
            </TabsTrigger>
            <TabsTrigger value="lazy">
              <ImageIcon className="h-4 w-4 mr-2" />
              Lazy Loading
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Download className="h-4 w-4 mr-2" />
              Smart Upload
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Sparkles className="h-4 w-4 mr-2" />
              AI Background Removal
            </TabsTrigger>
          </TabsList>

          {/* Optimized Images Tab */}
          <TabsContent value="optimized" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>WebP/AVIF with Fallbacks</CardTitle>
                <CardDescription>
                  Images automatically served in modern formats with JPEG fallback
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-4">
                <OptimizedImage
                  src="/placeholder.svg"
                  alt="Demo image 1"
                  width={400}
                  height={300}
                  className="rounded-lg"
                />
                <OptimizedImage
                  src="/placeholder.svg"
                  alt="Demo image 2"
                  width={400}
                  height={300}
                  className="rounded-lg"
                />
                <OptimizedImage
                  src="/placeholder.svg"
                  alt="Demo image 3"
                  width={400}
                  height={300}
                  className="rounded-lg"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Responsive Images</CardTitle>
                <CardDescription>
                  Different sizes loaded based on viewport width
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OptimizedImage
                  src="/placeholder.svg"
                  alt="Responsive demo"
                  width={1920}
                  height={1080}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="rounded-lg w-full"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lazy Loading Tab */}
          <TabsContent value="lazy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lazy Loading Demo</CardTitle>
                <CardDescription>
                  Images load as you scroll. Scroll down to see the effect.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <h3 className="font-semibold">Image {i + 1}</h3>
                    <OptimizedImage
                      src="/placeholder.svg"
                      alt={`Lazy loaded image ${i + 1}`}
                      width={800}
                      height={400}
                      lazy
                      className="rounded-lg w-full"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Smart Image Upload</CardTitle>
                <CardDescription>
                  Automatic compression to WebP with responsive variants
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OptimizedImageUpload
                  onUpload={async (file, metadata) => {
                    console.log("Original size:", (file.size / 1024).toFixed(0), "KB");
                    console.log("Optimized size:", (metadata.optimized.size / 1024).toFixed(0), "KB");
                    console.log("Dimensions:", metadata.width, "x", metadata.height);
                    console.log("Variants:", Object.keys(metadata.variants || {}));
                    console.log("Placeholder:", metadata.placeholder?.slice(0, 50) + "...");
                  }}
                  maxSizeMB={10}
                  generateVariants
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Background Removal Tab */}
          <TabsContent value="ai" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Background Removal</CardTitle>
                <CardDescription>
                  Remove backgrounds using AI - runs entirely in your browser
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <OptimizedImageUpload
                  onUpload={handleBackgroundRemoval}
                  maxSizeMB={5}
                  generateVariants={false}
                />

                {isProcessing && (
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Processing: {processingProgress}%
                    </p>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${processingProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {removedBgImage && (
                  <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-muted to-muted/50 p-8">
                      <img
                        src={removedBgImage}
                        alt="Background removed"
                        className="mx-auto max-h-96 object-contain"
                      />
                    </div>
                    
                    <Button onClick={downloadImage} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download PNG
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Background Image Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Background Image with Lazy Loading</CardTitle>
            <CardDescription>
              Background images also support lazy loading and overlays
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OptimizedBackgroundImage
              src="/placeholder.svg"
              className="rounded-lg min-h-[400px]"
              overlay
              overlayOpacity={0.7}
            >
              <div className="flex items-center justify-center h-full text-center p-8">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold text-primary-foreground">
                    Background Image Demo
                  </h2>
                  <p className="text-primary-foreground/80">
                    Lazy loaded with customizable overlay
                  </p>
                </div>
              </div>
            </OptimizedBackgroundImage>
          </CardContent>
        </Card>

        {/* Feature Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Modern Formats</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✅ WebP (30% smaller)</li>
                  <li>✅ AVIF (50% smaller)</li>
                  <li>✅ Automatic fallbacks</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Lazy Loading</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✅ IntersectionObserver</li>
                  <li>✅ 50px preload margin</li>
                  <li>✅ Skeleton states</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Optimization</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✅ Auto compression</li>
                  <li>✅ Responsive variants</li>
                  <li>✅ Blur placeholders</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">AI Features</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✅ Background removal</li>
                  <li>✅ Browser-based</li>
                  <li>✅ WebGPU accelerated</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
