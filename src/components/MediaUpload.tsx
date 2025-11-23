import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MediaUploadProps {
  bucket: "blog-images" | "brand-logos" | "press-media";
  onUploadComplete: (url: string) => void;
  currentImage?: string;
}

export const MediaUpload = ({ bucket, onUploadComplete, currentImage }: MediaUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = bucket === "brand-logos" 
      ? ["image/jpeg", "image/png", "image/svg+xml", "image/webp"]
      : ["image/jpeg", "image/png", "image/webp", "image/gif"];

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: `Please upload ${validTypes.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB for blog/press, 2MB for logos)
    const maxSize = bucket === "brand-logos" ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: `Maximum file size is ${maxSize / 1024 / 1024}MB`,
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);

      // Create a unique file name
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      setPreview(publicUrl);
      onUploadComplete(publicUrl);

      toast({
        title: "Upload Successful",
        description: "Image has been uploaded successfully.",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUploadComplete("");
  };

  return (
    <div className="space-y-4">
      <Label>Image Upload</Label>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {preview ? (
        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
              <img
                src={preview}
                alt="Preview"
                className="h-full w-full object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card
          className="cursor-pointer border-2 border-dashed transition-colors hover:border-category-jewellery"
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 rounded-full bg-category-jewellery/10 p-4">
              {uploading ? (
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-category-jewellery border-t-transparent" />
              ) : (
                <ImageIcon className="h-8 w-8 text-category-jewellery" />
              )}
            </div>
            <p className="mb-2 text-sm font-medium">
              {uploading ? "Uploading..." : "Click to upload image"}
            </p>
            <p className="text-xs text-muted-foreground">
              {bucket === "brand-logos" 
                ? "PNG, JPG, SVG or WebP (max 2MB)"
                : "PNG, JPG, WebP or GIF (max 5MB)"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};