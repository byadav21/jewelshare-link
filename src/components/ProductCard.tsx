import { useState, memo } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Gem, ChevronLeft, ChevronRight, Zap, Calendar } from "lucide-react";

interface ProductCardProps {
  product: any;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  usdRate: number;
  vendorLogoUrl?: string;
}

const ProductCardComponent = ({ product, isSelected, onToggleSelection, usdRate, vendorLogoUrl }: ProductCardProps) => {
  const images = [product.image_url, product.image_url_2, product.image_url_3].filter(Boolean);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (images.length > 1) {
      nextImage();
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setCurrentImageIndex(0);
  };

  return (
    <div className="transform hover:-translate-y-2 transition-transform duration-300">
      <Card className="overflow-hidden relative group bg-gradient-to-b from-card to-card/95 border-border/50 shadow-lg hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 active:scale-[0.98] touch-manipulation">
        {/* Premium glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <div 
          className="absolute top-3 left-3 z-10" 
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-md rounded opacity-0 group-hover:opacity-100 transition-opacity" />
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => {
                onToggleSelection(product.id);
              }}
              className="relative bg-background/95 backdrop-blur-sm border-2 border-primary/30 w-5 h-5 sm:w-6 sm:h-6 shadow-lg cursor-pointer"
            />
          </div>
        </div>
      {images.length > 0 ? (
        <div 
          className="aspect-square overflow-hidden bg-muted relative group"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <OptimizedImage
            src={images[currentImageIndex]}
            alt={`${product.name} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover transition-all duration-300"
            width={400}
            height={400}
          />
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background p-1.5 sm:p-2 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 active:scale-95 shadow-lg touch-manipulation"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background p-1.5 sm:p-2 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 active:scale-95 shadow-lg touch-manipulation"
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 bg-background/80 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`transition-all duration-300 rounded-full touch-manipulation ${
                      idx === currentImageIndex 
                        ? 'bg-primary w-5 sm:w-6 h-1.5 sm:h-2' 
                        : 'bg-muted-foreground/40 w-1.5 sm:w-2 h-1.5 sm:h-2 active:bg-muted-foreground/60'
                    }`}
                    aria-label={`Go to image ${idx + 1}`}
                  />
                ))}
              </div>
              {/* Image counter badge */}
              <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-background/90 backdrop-blur-sm px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium shadow-sm">
                {currentImageIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="aspect-square overflow-hidden bg-muted flex items-center justify-center">
          <Gem className="h-24 w-24 text-muted-foreground/30" />
        </div>
      )}
      <CardHeader className="p-4 sm:p-6 relative">
        <h3 className="font-serif text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">{product.name}</h3>
        {product.sku && (
          <p className="text-xs sm:text-sm text-muted-foreground/80 mb-3 font-medium">SKU: {product.sku}</p>
        )}
        <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm border-t border-border/50 pt-3 sm:pt-4 bg-gradient-to-b from-transparent to-muted/20 -mx-4 sm:-mx-6 px-4 sm:px-6 pb-2">
          {product.diamond_color && (
            <div className="flex justify-between">
              <span className="text-muted-foreground font-medium">Diamond Color:</span>
              <span className="text-foreground font-semibold">{product.diamond_color}</span>
            </div>
          )}
          {product.clarity && (
            <div className="flex justify-between">
              <span className="text-muted-foreground font-medium">Diamond Clarity:</span>
              <span className="text-foreground font-semibold">{product.clarity}</span>
            </div>
          )}
          {product.diamond_weight && (
            <div className="flex justify-between">
              <span className="text-muted-foreground font-medium">T DWT:</span>
              <span className="text-foreground font-semibold">{product.diamond_weight}g</span>
            </div>
          )}
          {product.weight_grams && (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Gross Weight:</span>
                <span className="text-foreground font-semibold">{product.weight_grams}g</span>
              </div>
              {product.net_weight && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">NET WT:</span>
                  <span className="text-foreground font-semibold">{product.net_weight}g</span>
                </div>
              )}
            </>
          )}
          {product.metal_type && (
            <div className="flex justify-between">
              <span className="text-muted-foreground font-medium">Metal Type:</span>
              <span className="text-foreground font-semibold">{product.metal_type}</span>
            </div>
          )}
          {product.purity_fraction_used && (
            <div className="flex justify-between">
              <span className="text-muted-foreground font-medium">Metal Purity:</span>
              <span className="text-foreground font-semibold">{(product.purity_fraction_used * 100).toFixed(0)}%</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        {product.description && (
          <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2">
            {product.description}
          </p>
        )}
        {product.category && (
          <div className="text-xs sm:text-sm">
            <span className="text-muted-foreground">Category:</span> <span className="text-foreground font-medium">{product.category}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-3.5 border-t border-border/50 p-4 sm:p-6 pt-4 sm:pt-5 bg-gradient-to-b from-muted/5 to-transparent">
        {/* Delivery Badge */}
        {product.delivery_type && (
          <div className="w-full">
            {product.delivery_type === 'immediate delivery' ? (
              <Badge variant="secondary" className="w-full justify-center gap-2 py-2 bg-gradient-to-r from-emerald-500/20 via-green-500/20 to-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:from-emerald-500/30 hover:to-green-500/30 shadow-sm font-semibold">
                <Zap className="h-3.5 w-3.5" />
                <span className="text-xs">Immediate Dispatch</span>
              </Badge>
            ) : (
              <Badge variant="outline" className="w-full justify-center gap-2 py-2 border-primary/40 text-primary hover:bg-primary/10 shadow-sm font-semibold">
                <Calendar className="h-3.5 w-3.5" />
                <span className="text-xs">{product.delivery_type}</span>
              </Badge>
            )}
          </div>
        )}
        
        {/* Price and Stock */}
        <div className="flex justify-between w-full items-end">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Retail Price</p>
            <div className="relative">
              <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent drop-shadow-sm">
                ₹{product.retail_price.toLocaleString('en-IN')}
              </p>
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 blur-lg opacity-30 -z-10" />
            </div>
            <p className="text-xs text-muted-foreground font-medium">${(product.retail_price / usdRate).toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Stock</p>
            <p className="text-xl sm:text-2xl font-bold text-foreground">{product.stock_quantity}</p>
          </div>
        </div>
      </CardFooter>
    </Card>
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export const ProductCard = memo(ProductCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.usdRate === nextProps.usdRate &&
    prevProps.product.retail_price === nextProps.product.retail_price
  );
});
