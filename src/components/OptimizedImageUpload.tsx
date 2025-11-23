/**
 * Image upload component with automatic optimization
 * Converts uploaded images to WebP and creates responsive variants
 */

import { useState, useRef, ChangeEvent } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  convertToWebP,
  generateResponsiveVariants,
  compressImage,
  createBlurPlaceholder,
} from "@/utils/imageOptimization";
import { cn } from "@/lib/utils";

interface OptimizedImageUploadProps {
  onUpload: (file: File, metadata: ImageMetadata) => void | Promise<void>;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  generateVariants?: boolean;
  className?: string;
  value?: string;
}

interface ImageMetadata {
  original: File;
  optimized: Blob;
  variants?: Record<string, Blob>;
  placeholder?: string;
  width: number;
  height: number;
}

export const OptimizedImageUpload = ({
  onUpload,
  maxSizeMB = 5,
  acceptedFormats = ["image/jpeg", "image/png", "image/webp"],
  generateVariants = true,
  className,
  value,
}: OptimizedImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = async (file: File) => {
    try {
      setIsProcessing(true);
      setProgress(10);

      // Validate file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`File too large. Maximum size is ${maxSizeMB}MB`);
        return;
      }

      // Validate file type
      if (!acceptedFormats.includes(file.type)) {
        toast.error("Invalid file format. Please upload a JPEG, PNG, or WebP image");
        return;
      }

      setProgress(20);

      // Get image dimensions
      const img = await loadImage(file);
      const { naturalWidth: width, naturalHeight: height } = img;

      setProgress(40);

      // Optimize image
      const optimized = await compressImage(file, 0.85, maxSizeMB * 1024 * 0.8);
      
      setProgress(60);

      // Generate responsive variants if enabled
      let variants: Record<string, Blob> | undefined;
      if (generateVariants) {
        variants = await generateResponsiveVariants(optimized);
        setProgress(80);
      }

      // Create blur placeholder
      const placeholder = await createBlurPlaceholder(optimized);
      setProgress(90);

      const metadata: ImageMetadata = {
        original: file,
        optimized,
        variants,
        placeholder,
        width,
        height,
      };

      // Set preview
      const previewUrl = URL.createObjectURL(optimized);
      setPreview(previewUrl);

      setProgress(100);

      // Call upload callback
      await onUpload(file, metadata);

      toast.success("Image optimized successfully", {
        description: `Original: ${(file.size / 1024).toFixed(0)}KB → Optimized: ${(optimized.size / 1024).toFixed(0)}KB`,
      });
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Failed to process image");
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const loadImage = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  return (
    <div className={cn("space-y-4", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(",")}
        onChange={handleFileChange}
        className="hidden"
        disabled={isProcessing}
      />

      {preview ? (
        <Card className="relative">
          <CardContent className="p-4">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleRemove}
                disabled={isProcessing}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {isProcessing && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Optimizing...</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card
          className={cn(
            "border-2 border-dashed cursor-pointer hover:border-primary/50 transition-colors",
            isProcessing && "pointer-events-none opacity-50"
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            {isProcessing ? (
              <>
                <Loader2 className="h-12 w-12 text-muted-foreground animate-spin mb-4" />
                <p className="text-sm text-muted-foreground mb-2">Processing image...</p>
                <Progress value={progress} className="w-full max-w-xs" />
              </>
            ) : (
              <>
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <ImageIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Upload Image</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  Max {maxSizeMB}MB • Automatically optimized to WebP
                </p>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
