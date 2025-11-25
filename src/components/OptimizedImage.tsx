/**
 * Optimized Image component with lazy loading and modern formats
 * Automatically handles WebP/AVIF with fallbacks, lazy loading, and responsive images
 */

import { useState, useEffect, useRef, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  lazy?: boolean;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  className?: string;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  lazy = true,
  priority = false,
  quality = 85,
  sizes,
  className,
  objectFit = "cover",
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Lazy loading with Intersection Observer
  useEffect(() => {
    if (!lazy || priority || isInView) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin: "50px", // Start loading 50px before entering viewport
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [lazy, priority, isInView]);

  // Generate srcset for responsive images
  const generateSrcSet = (baseSrc: string): string => {
    if (!width) return baseSrc;
    
    const widths = [320, 640, 768, 1024, 1920];
    return widths
      .map((w) => `${baseSrc}?w=${w}&q=${quality} ${w}w`)
      .join(", ");
  };

  // Generate WebP and AVIF sources
  const getImageSources = () => {
    const sources = [];
    
    // AVIF (best compression, if supported)
    sources.push(
      <source
        key="avif"
        type="image/avif"
        srcSet={`${src}?format=avif&q=${quality}`}
      />
    );
    
    // WebP (good compression, widely supported)
    sources.push(
      <source
        key="webp"
        type="image/webp"
        srcSet={generateSrcSet(src)}
        sizes={sizes}
      />
    );
    
    return sources;
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const imageClasses = cn(
    "transition-opacity duration-300 max-w-full h-auto",
    isLoaded ? "opacity-100" : "opacity-0",
    className
  );

  const objectFitClass = {
    contain: "object-contain",
    cover: "object-cover",
    fill: "object-fill",
    none: "object-none",
    "scale-down": "object-scale-down",
  }[objectFit];

  // Show skeleton while loading
  if (!isInView) {
    return (
      <div
        ref={imgRef}
        className={cn("relative", className)}
        style={{ width, height }}
      >
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className
        )}
        style={{ width, height }}
      >
        <span className="text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <div className={cn("relative", !isLoaded && "overflow-hidden")}>
      {!isLoaded && <Skeleton className="absolute inset-0" />}
      
      <picture>
        {getImageSources()}
        
        {/* Fallback to original format */}
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={lazy && !priority ? "lazy" : "eager"}
          decoding={priority ? "sync" : "async"}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(imageClasses, objectFitClass)}
          {...props}
        />
      </picture>
    </div>
  );
};

/**
 * Background Image component with lazy loading
 */
interface OptimizedBackgroundImageProps {
  src: string;
  className?: string;
  children?: React.ReactNode;
  lazy?: boolean;
  overlay?: boolean;
  overlayOpacity?: number;
}

export const OptimizedBackgroundImage = ({
  src,
  className,
  children,
  lazy = true,
  overlay = false,
  overlayOpacity = 0.5,
}: OptimizedBackgroundImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "50px" }
    );

    if (divRef.current) {
      observer.observe(divRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, isInView]);

  useEffect(() => {
    if (!isInView) return;

    const img = new Image();
    img.onload = () => setIsLoaded(true);
    img.src = src;
  }, [isInView, src]);

  return (
    <div
      ref={divRef}
      className={cn("relative", className)}
      style={{
        backgroundImage: isLoaded ? `url(${src})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {!isLoaded && <Skeleton className="absolute inset-0" />}
      
      {overlay && isLoaded && (
        <div
          className="absolute inset-0 bg-background"
          style={{ opacity: overlayOpacity }}
        />
      )}
      
      <div className="relative z-10">{children}</div>
    </div>
  );
};
