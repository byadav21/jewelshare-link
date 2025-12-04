/**
 * Optimized Image component with lazy loading
 * Handles lazy loading with Intersection Observer and graceful error handling
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
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset state when src changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  // Lazy loading with Intersection Observer
  useEffect(() => {
    if (!lazy || priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "100px" }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, priority, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const objectFitClass = {
    contain: "object-contain",
    cover: "object-cover",
    fill: "object-fill",
    none: "object-none",
    "scale-down": "object-scale-down",
  }[objectFit];

  // Show skeleton while not in view
  if (!isInView) {
    return (
      <div
        ref={containerRef}
        className={cn("relative bg-muted", className)}
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
        <span className="text-xs">Image unavailable</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {!isLoaded && <Skeleton className="absolute inset-0" />}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={lazy && !priority ? "lazy" : "eager"}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-opacity duration-200 max-w-full h-auto",
          isLoaded ? "opacity-100" : "opacity-0",
          objectFitClass
        )}
        {...props}
      />
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
      { rootMargin: "100px" }
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
