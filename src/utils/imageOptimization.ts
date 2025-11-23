/**
 * Image optimization utilities
 * Handles conversion to modern formats (WebP, AVIF) and compression
 */

/**
 * Convert image to WebP format
 * @param file - Image file to convert
 * @param quality - Compression quality (0-1)
 * @returns WebP blob
 */
export const convertToWebP = async (
  file: File | Blob,
  quality: number = 0.85
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to convert to WebP"));
          }
        },
        "image/webp",
        quality
      );
    };
    
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Resize image to specified dimensions while maintaining aspect ratio
 * @param file - Image file to resize
 * @param maxWidth - Maximum width
 * @param maxHeight - Maximum height
 * @returns Resized image blob
 */
export const resizeImage = async (
  file: File | Blob,
  maxWidth: number,
  maxHeight: number,
  quality: number = 0.9
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      
      // Calculate new dimensions maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;
        
        if (width > height) {
          width = maxWidth;
          height = width / aspectRatio;
        } else {
          height = maxHeight;
          width = height * aspectRatio;
        }
      }
      
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }
      
      // Use high-quality image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to resize image"));
          }
        },
        "image/jpeg",
        quality
      );
    };
    
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Generate responsive image variants
 * @param file - Original image file
 * @param sizes - Array of widths for responsive variants
 * @returns Object with different sized variants
 */
export const generateResponsiveVariants = async (
  file: File | Blob,
  sizes: number[] = [320, 640, 768, 1024, 1920]
): Promise<Record<string, Blob>> => {
  const variants: Record<string, Blob> = {};
  
  for (const size of sizes) {
    try {
      const resized = await resizeImage(file, size, size, 0.85);
      const webp = await convertToWebP(resized, 0.85);
      variants[`${size}w`] = webp;
    } catch (error) {
      console.error(`Failed to generate ${size}w variant:`, error);
    }
  }
  
  return variants;
};

/**
 * Compress image to reduce file size
 * @param file - Image file to compress
 * @param quality - Compression quality (0-1)
 * @param maxSizeKB - Maximum file size in KB (optional)
 * @returns Compressed image blob
 */
export const compressImage = async (
  file: File | Blob,
  quality: number = 0.8,
  maxSizeKB?: number
): Promise<Blob> => {
  let currentQuality = quality;
  let compressed = await convertToWebP(file, currentQuality);
  
  // If max size specified, iteratively reduce quality
  if (maxSizeKB) {
    const maxSizeBytes = maxSizeKB * 1024;
    let iterations = 0;
    const maxIterations = 10;
    
    while (compressed.size > maxSizeBytes && iterations < maxIterations) {
      currentQuality -= 0.1;
      if (currentQuality < 0.1) break;
      
      compressed = await convertToWebP(file, currentQuality);
      iterations++;
    }
  }
  
  return compressed;
};

/**
 * Check if browser supports WebP
 */
export const supportsWebP = (): boolean => {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
};

/**
 * Check if browser supports AVIF
 */
export const supportsAVIF = async (): Promise<boolean> => {
  const avif = "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=";
  
  try {
    const response = await fetch(avif);
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Get optimal image format based on browser support
 */
export const getOptimalFormat = async (): Promise<"avif" | "webp" | "jpeg"> => {
  if (await supportsAVIF()) return "avif";
  if (supportsWebP()) return "webp";
  return "jpeg";
};

/**
 * Extract dominant color from image for placeholder
 * @param file - Image file
 * @returns Hex color string
 */
export const extractDominantColor = async (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }
      
      // Sample from center of image
      canvas.width = 1;
      canvas.height = 1;
      ctx.drawImage(img, 0, 0, 1, 1);
      
      const pixel = ctx.getImageData(0, 0, 1, 1).data;
      const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2])
        .toString(16)
        .slice(1)}`;
      
      resolve(hex);
    };
    
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Create blur placeholder from image
 * @param file - Image file
 * @returns Base64 encoded blur placeholder
 */
export const createBlurPlaceholder = async (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }
      
      // Create tiny version for blur effect
      canvas.width = 20;
      canvas.height = 20;
      ctx.filter = "blur(10px)";
      ctx.drawImage(img, 0, 0, 20, 20);
      
      resolve(canvas.toDataURL("image/jpeg", 0.5));
    };
    
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
};
