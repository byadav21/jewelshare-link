import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Gem, ChevronLeft, ChevronRight } from "lucide-react";

interface ProductCardProps {
  product: any;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  usdRate: number;
}

export const ProductCard = ({ product, isSelected, onToggleSelection, usdRate }: ProductCardProps) => {
  const images = [product.image_url, product.image_url_2].filter(Boolean);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow relative active:scale-[0.98] touch-manipulation">
      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelection(product.id)}
          className="bg-background border-2 w-5 h-5 sm:w-4 sm:h-4"
        />
      </div>
      {images.length > 0 ? (
        <div className="aspect-square overflow-hidden bg-muted relative group">
          <img
            src={images[currentImageIndex]}
            alt={`${product.name} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover transition-all duration-500 animate-fade-in"
            onError={(e) => {
              console.error(`Failed to load image ${currentImageIndex + 1} for ${product.sku}: ${images[currentImageIndex]}`);
              e.currentTarget.src = 'https://placehold.co/400x400/1a1a2e/FFD700?text=' + encodeURIComponent(product.name.substring(0, 20));
            }}
            onLoad={() => {
              console.log(`Successfully loaded image ${currentImageIndex + 1} for ${product.sku}`);
            }}
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
      <CardHeader className="p-3 sm:p-6">
        <h3 className="font-serif text-base sm:text-xl font-semibold text-foreground">{product.name}</h3>
        {product.sku && (
          <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">SKU: {product.sku}</p>
        )}
        <div className="space-y-1 sm:space-y-1.5 text-[11px] sm:text-xs border-t border-border pt-2 sm:pt-3">
          {product.gemstone && (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Diamond Color:</span>
                <span className="text-foreground font-semibold">{product.gemstone.split(' ')[0] || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Diamond Clarity:</span>
                <span className="text-foreground font-semibold">{product.gemstone.split(' ')[1] || '-'}</span>
              </div>
            </>
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
              <span className="text-muted-foreground font-medium">Metal Purity:</span>
              <span className="text-foreground font-semibold">{product.metal_type}</span>
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
      <CardFooter className="flex justify-between border-t border-border p-3 sm:p-6 pt-3 sm:pt-4">
        <div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">Retail Price</p>
          <p className="text-base sm:text-lg font-bold text-primary">₹{product.retail_price.toLocaleString('en-IN')}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">${(product.retail_price / usdRate).toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] sm:text-xs text-muted-foreground">Stock</p>
          <p className="text-base sm:text-lg font-semibold text-foreground">{product.stock_quantity}</p>
        </div>
      </CardFooter>
    </Card>
  );
};
