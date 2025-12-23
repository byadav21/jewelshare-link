import { useState, useEffect } from "react";
import { getEstimateImageSignedUrl } from "@/utils/storageUtils";
import { Loader2 } from "lucide-react";

interface EstimateImageProps {
  src: string;
  alt: string;
  className?: string;
}

/**
 * Component for displaying images from the manufacturing-estimates bucket
 * Automatically converts storage paths to signed URLs for secure access
 */
export const EstimateImage = ({ src, alt, className = "" }: EstimateImageProps) => {
  const [signedUrl, setSignedUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadSignedUrl = async () => {
      if (!src) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(false);
        const url = await getEstimateImageSignedUrl(src);
        setSignedUrl(url);
      } catch (err) {
        console.error("Failed to load image:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadSignedUrl();
  }, [src]);

  if (!src) {
    return null;
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !signedUrl) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <span className="text-sm text-muted-foreground">Failed to load image</span>
      </div>
    );
  }

  return (
    <img
      src={signedUrl}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
};
