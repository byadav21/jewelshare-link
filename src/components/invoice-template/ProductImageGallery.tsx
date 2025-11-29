import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Upload, Star, StarOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProductImage {
  id: string;
  url: string;
  name: string;
  isDefault?: boolean;
}

interface ProductImageGalleryProps {
  images: ProductImage[];
  onUpdate: (images: ProductImage[]) => void;
}

export const ProductImageGallery = ({ images, onUpdate }: ProductImageGalleryProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const uploadedImages: ProductImage[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast({
            title: "Invalid File",
            description: `${file.name} is not an image file`,
            variant: "destructive",
          });
          continue;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File Too Large",
            description: `${file.name} exceeds 5MB limit`,
            variant: "destructive",
          });
          continue;
        }

        // Upload to Supabase Storage
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `product-images/${fileName}`;

        const { data, error } = await supabase.storage
          .from("manufacturing-estimates")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) throw error;

        // Store the storage path, not the URL
        // Signed URLs will be generated when displaying images
        const imagePath = data.path;

        uploadedImages.push({
          id: `img_${Date.now()}_${i}`,
          url: imagePath,
          name: file.name,
          isDefault: images.length === 0 && i === 0, // First image is default if gallery is empty
        });
      }

      onUpdate([...images, ...uploadedImages]);

      toast({
        title: "Upload Successful",
        description: `${uploadedImages.length} image(s) uploaded successfully`,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = (imageId: string) => {
    const updatedImages = images.filter((img) => img.id !== imageId);
    
    // If we removed the default image, make the first remaining image default
    if (updatedImages.length > 0 && !updatedImages.some(img => img.isDefault)) {
      updatedImages[0].isDefault = true;
    }
    
    onUpdate(updatedImages);
    toast({
      title: "Image Removed",
      description: "Product image removed from gallery",
    });
  };

  const handleSetDefault = (imageId: string) => {
    const updatedImages = images.map((img) => ({
      ...img,
      isDefault: img.id === imageId,
    }));
    onUpdate(updatedImages);
    toast({
      title: "Default Image Set",
      description: "This image will be used as the default for line items",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Product Image Gallery</span>
          <label>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={(e) => {
                e.preventDefault();
                (e.currentTarget.previousElementSibling as HTMLInputElement)?.click();
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Uploading..." : "Upload Images"}
            </Button>
          </label>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {images.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm mb-2">No product images uploaded yet</p>
            <p className="text-xs">Upload images to use in invoice line items</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="relative group rounded-lg border border-border overflow-hidden bg-muted"
              >
                <div className="aspect-square relative">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => handleSetDefault(image.id)}
                      title={image.isDefault ? "Default image" : "Set as default"}
                    >
                      {image.isDefault ? (
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      ) : (
                        <StarOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleRemoveImage(image.id)}
                      title="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-2 bg-background">
                  <p className="text-xs truncate" title={image.name}>
                    {image.name}
                  </p>
                  {image.isDefault && (
                    <p className="text-xs text-primary font-medium">Default</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-4">
          Upload product images to use in invoice line items. Mark one as default to automatically
          apply it to line items. Max 5MB per image.
        </p>
      </CardContent>
    </Card>
  );
};
