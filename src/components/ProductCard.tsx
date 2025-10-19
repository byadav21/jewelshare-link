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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow relative">
      <div className="absolute top-3 left-3 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelection(product.id)}
          className="bg-background border-2"
        />
      </div>
      {images.length > 0 ? (
        <div className="aspect-square overflow-hidden bg-muted relative group">
          <img
            src={images[currentImageIndex]}
            alt={`${product.name} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover transition-all duration-300"
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
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentImageIndex 
                        ? 'bg-primary w-4' 
                        : 'bg-white/60 backdrop-blur-sm'
                    }`} 
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="aspect-square overflow-hidden bg-muted flex items-center justify-center">
          <Gem className="h-24 w-24 text-muted-foreground/30" />
        </div>
      )}
      <CardHeader>
        <h3 className="font-serif text-xl font-semibold text-foreground">{product.name}</h3>
        {product.sku && (
          <p className="text-sm text-muted-foreground mb-3">SKU: {product.sku}</p>
        )}
        <div className="space-y-1.5 text-xs border-t border-border pt-3">
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
      <CardContent>
        {product.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {product.description}
          </p>
        )}
        {product.category && (
          <div className="text-sm">
            <span className="text-muted-foreground">Category:</span> <span className="text-foreground font-medium">{product.category}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t border-border pt-4">
        <div>
          <p className="text-xs text-muted-foreground">Retail Price</p>
          <p className="text-lg font-bold text-primary">₹{product.retail_price.toLocaleString('en-IN')}</p>
          <p className="text-xs text-muted-foreground">${(product.retail_price / usdRate).toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Stock</p>
          <p className="text-lg font-semibold text-foreground">{product.stock_quantity}</p>
        </div>
      </CardFooter>
    </Card>
  );
};
