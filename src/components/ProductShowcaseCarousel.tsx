import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  name: string;
  image_url?: string;
  retail_price: number;
  category?: string;
  created_at?: string;
}

interface ProductShowcaseCarouselProps {
  products: Product[];
  usdRate: number;
}

export const ProductShowcaseCarousel = ({ products, usdRate }: ProductShowcaseCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Get featured/new products (most recent 5)
  const featuredProducts = products
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    .slice(0, 5);

  if (featuredProducts.length === 0) return null;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredProducts.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);
  };

  const currentProduct = featuredProducts[currentIndex];

  return (
    <div className="relative w-full h-[400px] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 backdrop-blur-sm border border-border/50">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-50" />
      
      {/* Featured badge */}
      <div className="absolute top-6 left-6 z-10">
        <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-sm flex items-center gap-1 px-3 py-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Featured Collection
        </Badge>
      </div>

      {/* Navigation buttons */}
      <Button
        variant="outline"
        size="icon"
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background hover:scale-110 transition-all duration-300"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background hover:scale-110 transition-all duration-300"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* Product showcase */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentProduct.id}
          initial={{ opacity: 0, scale: 0.95, rotateY: -10 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          exit={{ opacity: 0, scale: 0.95, rotateY: 10 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-full flex items-center justify-center p-8"
        >
          <div className="flex items-center gap-8 max-w-5xl w-full">
            {/* Product image */}
            <motion.div
              whileHover={{ scale: 1.05, rotateY: 5 }}
              transition={{ duration: 0.4 }}
              className="relative w-1/2 h-[300px] rounded-xl overflow-hidden shadow-2xl group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
              <img
                src={currentProduct.image_url || "/placeholder.svg"}
                alt={currentProduct.name}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
              {/* Shine effect on hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.8 }}
              />
            </motion.div>

            {/* Product details */}
            <div className="w-1/2 space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Badge variant="secondary" className="mb-2">
                  {currentProduct.category || "Premium"}
                </Badge>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {currentProduct.name}
                </h3>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <p className="text-4xl font-bold text-primary">
                  ₹{currentProduct.retail_price.toLocaleString("en-IN")}
                </p>
                <p className="text-lg text-muted-foreground">
                  ${(currentProduct.retail_price / usdRate).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Indicator dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {featuredProducts.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "w-8 bg-primary"
                : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
