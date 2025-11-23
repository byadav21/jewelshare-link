import { motion } from "framer-motion";

const brands = [
  { name: "Diamond Dynasty", logo: "https://api.dicebear.com/7.x/shapes/svg?seed=DiamondDynasty&backgroundColor=1a1a2e" },
  { name: "Gem Gallery", logo: "https://api.dicebear.com/7.x/shapes/svg?seed=GemGallery&backgroundColor=2d3561" },
  { name: "Luxe Jewelry", logo: "https://api.dicebear.com/7.x/shapes/svg?seed=LuxeJewelry&backgroundColor=3f4e7a" },
  { name: "Heritage Jewelers", logo: "https://api.dicebear.com/7.x/shapes/svg?seed=HeritageJewelers&backgroundColor=1a1a2e" },
  { name: "Royal Gems", logo: "https://api.dicebear.com/7.x/shapes/svg?seed=RoyalGems&backgroundColor=2d3561" },
  { name: "Brilliant Stones", logo: "https://api.dicebear.com/7.x/shapes/svg?seed=BrilliantStones&backgroundColor=3f4e7a" },
  { name: "Crystal Palace", logo: "https://api.dicebear.com/7.x/shapes/svg?seed=CrystalPalace&backgroundColor=1a1a2e" },
  { name: "Golden Era", logo: "https://api.dicebear.com/7.x/shapes/svg?seed=GoldenEra&backgroundColor=2d3561" },
  { name: "Precious Vault", logo: "https://api.dicebear.com/7.x/shapes/svg?seed=PreciousVault&backgroundColor=3f4e7a" },
  { name: "Treasure Trove", logo: "https://api.dicebear.com/7.x/shapes/svg?seed=TreasureTrove&backgroundColor=1a1a2e" },
];

export const BrandLogosCarousel = () => {
  // Duplicate brands for seamless infinite scroll
  const duplicatedBrands = [...brands, ...brands];

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
                src={brand.logo}
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
