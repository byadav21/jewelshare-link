/**
 * Optimized Image component with lazy loading and blur-up placeholder
 * Handles lazy loading with Intersection Observer and graceful error handling
 */

import { useState, useEffect, useRef, ImgHTMLAttributes, useMemo } from "react";
import { cn } from "@/lib/utils";

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
  blurPlaceholder?: boolean;
}

// Generate a tiny placeholder color based on image URL for consistent blur effect
const generatePlaceholderColor = (src: string): string => {
  let hash = 0;
  for (let i = 0; i < src.length; i++) {
    hash = src.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash % 360);
  return `hsl(${h}, 20%, 85%)`;
};

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
  blurPlaceholder = true,
  ...props
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Memoize placeholder color for consistent blur effect
  const placeholderColor = useMemo(() => generatePlaceholderColor(src || ''), [src]);

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
      { rootMargin: "200px", threshold: 0.01 }
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

  // Show placeholder while not in view
  if (!isInView) {
    return (
      <div
        ref={containerRef}
        className={cn("relative overflow-hidden", className)}
        style={{ 
          width, 
          height,
          backgroundColor: blurPlaceholder ? placeholderColor : undefined
        }}
      >
        {/* Blur placeholder with shimmer effect */}
        <div 
          className="absolute inset-0 animate-pulse"
          style={{ 
            background: `linear-gradient(90deg, ${placeholderColor} 0%, hsl(0, 0%, 90%) 50%, ${placeholderColor} 100%)`,
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite'
          }}
        />
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
    <div 
      ref={containerRef} 
      className={cn("relative overflow-hidden", className)}
    >
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
          "w-full h-full",
          objectFitClass
        )}
        {...props}
      />
    </div>
  );
};

/**
 * Background Image component with lazy loading and blur-up placeholder
 */
interface OptimizedBackgroundImageProps {
  src: string;
  className?: string;
  children?: React.ReactNode;
  lazy?: boolean;
  overlay?: boolean;
  overlayOpacity?: number;
}

// Generate placeholder color for background images
const generateBgPlaceholderColor = (src: string): string => {
  let hash = 0;
  for (let i = 0; i < src.length; i++) {
    hash = src.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash % 360);
  return `hsl(${h}, 15%, 80%)`;
};

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
  const placeholderColor = useMemo(() => generateBgPlaceholderColor(src || ''), [src]);

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
      { rootMargin: "200px" }
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
      className={cn("relative overflow-hidden", className)}
      style={{
        backgroundImage: isLoaded ? `url(${src})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: !isLoaded ? placeholderColor : undefined,
      }}
    >
      {/* Blur-up placeholder for background */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 animate-pulse"
          style={{ 
            background: `linear-gradient(135deg, ${placeholderColor} 0%, hsl(0, 0%, 85%) 100%)`,
            filter: 'blur(4px)'
          }}
        />
      )}
      
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
