import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Brand {
  name: string;
  logo_url: string;
}

export const BrandLogosCarousel = () => {
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    const fetchBrands = async () => {
      const { data } = await supabase
        .from("brands")
        .select("name, logo_url")
        .eq("active", true)
        .order("display_order");
      
      if (data) {
        setBrands(data);
      }
    };

    fetchBrands();
  }, []);

  // Duplicate brands for seamless infinite scroll
  const duplicatedBrands = [...brands, ...brands];

  if (brands.length === 0) return null;

  return (
    <div className="relative overflow-hidden py-8">
      {/* Gradient overlays for fade effect */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-background to-transparent" />
      
      <motion.div
        className="flex gap-12"
        animate={{
          x: [0, -50 * brands.length],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 30,
            ease: "linear",
          },
        }}
      >
        {duplicatedBrands.map((brand, index) => (
          <div
            key={`${brand.name}-${index}`}
            className="flex min-w-[150px] items-center justify-center"
          >
            <div className="group relative flex h-20 w-32 items-center justify-center rounded-lg border border-border/50 bg-card/50 p-4 transition-all hover:border-primary/30 hover:shadow-lg">
              <img
                src={brand.logo_url}
                alt={brand.name}
                className="h-full w-full object-contain opacity-70 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0"
              />
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};