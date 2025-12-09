import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Diamond, Ruler, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PREVIEW_SHAPES = [
  { key: "round", name: "Round", mm: "6.5mm", carat: "1.00ct" },
  { key: "princess", name: "Princess", mm: "5.5 x 5.5mm", carat: "1.00ct" },
  { key: "oval", name: "Oval", mm: "8.0 x 5.5mm", carat: "1.00ct" },
  { key: "cushion", name: "Cushion", mm: "5.5 x 5.5mm", carat: "1.00ct" },
  { key: "emerald", name: "Emerald", mm: "7.0 x 5.0mm", carat: "1.00ct" },
  { key: "pear", name: "Pear", mm: "8.5 x 5.5mm", carat: "1.00ct" },
];

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
}

const ShapeIcon = ({ shape, isHovered }: { shape: string; isHovered?: boolean }) => {
  const shapes: Record<string, JSX.Element> = {
    round: (
      <svg viewBox="0 0 40 40" className="w-full h-full">
        <defs>
          <filter id="glow-round" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <circle cx="20" cy="20" r="16" fill="url(#previewGrad)" className={`transition-all duration-300 ${isHovered ? 'opacity-50' : 'opacity-30'}`} />
        <circle cx="20" cy="20" r="16" fill="none" stroke="url(#previewGrad)" strokeWidth="2" filter={isHovered ? "url(#glow-round)" : ""} />
        {isHovered && <circle cx="20" cy="20" r="10" fill="none" stroke="url(#previewGrad)" strokeWidth="1" className="animate-pulse opacity-60" />}
      </svg>
    ),
    princess: (
      <svg viewBox="0 0 40 40" className="w-full h-full">
        <rect x="6" y="6" width="28" height="28" fill="url(#previewGrad)" className={`transition-all duration-300 ${isHovered ? 'opacity-50' : 'opacity-30'}`} />
        <rect x="6" y="6" width="28" height="28" fill="none" stroke="url(#previewGrad)" strokeWidth="2" />
        {isHovered && (
          <>
            <line x1="6" y1="6" x2="34" y2="34" stroke="url(#previewGrad)" strokeWidth="1" className="animate-pulse opacity-60" />
            <line x1="34" y1="6" x2="6" y2="34" stroke="url(#previewGrad)" strokeWidth="1" className="animate-pulse opacity-60" />
          </>
        )}
      </svg>
    ),
    oval: (
      <svg viewBox="0 0 40 40" className="w-full h-full">
        <ellipse cx="20" cy="20" rx="16" ry="11" fill="url(#previewGrad)" className={`transition-all duration-300 ${isHovered ? 'opacity-50' : 'opacity-30'}`} />
        <ellipse cx="20" cy="20" rx="16" ry="11" fill="none" stroke="url(#previewGrad)" strokeWidth="2" />
        {isHovered && <ellipse cx="20" cy="20" rx="10" ry="7" fill="none" stroke="url(#previewGrad)" strokeWidth="1" className="animate-pulse opacity-60" />}
      </svg>
    ),
    cushion: (
      <svg viewBox="0 0 40 40" className="w-full h-full">
        <rect x="6" y="6" width="28" height="28" rx="6" fill="url(#previewGrad)" className={`transition-all duration-300 ${isHovered ? 'opacity-50' : 'opacity-30'}`} />
        <rect x="6" y="6" width="28" height="28" rx="6" fill="none" stroke="url(#previewGrad)" strokeWidth="2" />
        {isHovered && <rect x="12" y="12" width="16" height="16" rx="3" fill="none" stroke="url(#previewGrad)" strokeWidth="1" className="animate-pulse opacity-60" />}
      </svg>
    ),
    emerald: (
      <svg viewBox="0 0 40 40" className="w-full h-full">
        <polygon points="8,8 32,8 34,32 6,32" fill="url(#previewGrad)" className={`transition-all duration-300 ${isHovered ? 'opacity-50' : 'opacity-30'}`} />
        <polygon points="8,8 32,8 34,32 6,32" fill="none" stroke="url(#previewGrad)" strokeWidth="2" />
        {isHovered && (
          <>
            <line x1="10" y1="15" x2="30" y2="15" stroke="url(#previewGrad)" strokeWidth="1" className="animate-pulse opacity-60" />
            <line x1="9" y1="22" x2="31" y2="22" stroke="url(#previewGrad)" strokeWidth="1" className="animate-pulse opacity-60" />
          </>
        )}
      </svg>
    ),
    pear: (
      <svg viewBox="0 0 40 40" className="w-full h-full">
        <path d="M20 4 C8 16, 6 26, 20 38 C34 26, 32 16, 20 4" fill="url(#previewGrad)" className={`transition-all duration-300 ${isHovered ? 'opacity-50' : 'opacity-30'}`} />
        <path d="M20 4 C8 16, 6 26, 20 38 C34 26, 32 16, 20 4" fill="none" stroke="url(#previewGrad)" strokeWidth="2" />
        {isHovered && <circle cx="20" cy="22" r="6" fill="none" stroke="url(#previewGrad)" strokeWidth="1" className="animate-pulse opacity-60" />}
      </svg>
    ),
  };
  return shapes[shape] || null;
};

const SparkleParticle = ({ x, y, size }: { x: number; y: number; size: number }) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{ left: x, top: y }}
    initial={{ scale: 0, opacity: 1 }}
    animate={{ scale: 1, opacity: 0 }}
    exit={{ scale: 0, opacity: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
  >
    <svg width={size} height={size} viewBox="0 0 24 24" className="text-primary">
      <path
        fill="currentColor"
        d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"
      />
    </svg>
  </motion.div>
);

const ShapeCard = ({ shape, index, navigate }: { shape: typeof PREVIEW_SHAPES[0]; index: number; navigate: (path: string) => void }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);
  const sparkleIdRef = useRef(0);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isHovered || !cardRef.current) return;
    
    // Only create sparkle occasionally
    if (Math.random() > 0.3) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 6;
    const y = e.clientY - rect.top - 6;
    const size = Math.random() * 8 + 6;
    
    const newSparkle: Sparkle = {
      id: sparkleIdRef.current++,
      x,
      y,
      size,
    };
    
    setSparkles(prev => [...prev.slice(-5), newSparkle]);
    
    // Remove sparkle after animation
    setTimeout(() => {
      setSparkles(prev => prev.filter(s => s.id !== newSparkle.id));
    }, 600);
  }, [isHovered]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
    >
      <Card 
        ref={cardRef}
        className="p-4 text-center hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 border-primary/10 hover:border-primary/30 cursor-pointer overflow-hidden relative"
        onClick={() => navigate("/diamond-sizing-chart")}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setSparkles([]);
        }}
        onMouseMove={handleMouseMove}
      >
        {/* Sparkle particles */}
        <AnimatePresence>
          {sparkles.map(sparkle => (
            <SparkleParticle key={sparkle.id} x={sparkle.x} y={sparkle.y} size={sparkle.size} />
          ))}
        </AnimatePresence>

        {/* Shimmer overlay */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}

        <motion.div 
          className="w-12 h-12 mx-auto mb-3 relative z-10"
          animate={{ 
            scale: isHovered ? 1.2 : 1,
            rotate: isHovered ? [0, -5, 5, 0] : 0
          }}
          transition={{ duration: 0.3 }}
        >
          <ShapeIcon shape={shape.key} isHovered={isHovered} />
        </motion.div>
        <motion.h3 
          className="font-semibold text-sm mb-1 relative z-10"
          animate={{ color: isHovered ? "hsl(var(--primary))" : "hsl(var(--foreground))" }}
        >
          {shape.name}
        </motion.h3>
        <p className="text-xs text-muted-foreground relative z-10">{shape.mm}</p>
        <motion.p 
          className="text-xs font-medium relative z-10"
          animate={{ 
            scale: isHovered ? 1.1 : 1,
            color: "hsl(var(--primary))"
          }}
        >
          {shape.carat}
        </motion.p>
      </Card>
    </motion.div>
  );
};

export const SizingChartPreview = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-gradient-to-br from-diamond-from/5 via-background to-gemstone-from/5">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-sm mb-6">
              <Ruler className="h-4 w-4 text-primary" />
              <span className="font-medium text-primary">Diamond Reference Tool</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold font-serif mb-4">
              Diamond Sizing
              <span className="block mt-2 bg-gradient-to-r from-diamond-from to-diamond-to bg-clip-text text-transparent">
                Chart
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Quick reference for diamond dimensions across popular shapes
            </p>
          </div>
        </ScrollReveal>

        {/* SVG Gradient Definition */}
        <svg className="absolute w-0 h-0">
          <defs>
            <linearGradient id="previewGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--diamond-from))" />
              <stop offset="100%" stopColor="hsl(var(--diamond-to))" />
            </linearGradient>
          </defs>
        </svg>

        <ScrollReveal delay={0.1}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
            {PREVIEW_SHAPES.map((shape, index) => (
              <ShapeCard key={shape.key} shape={shape} index={index} navigate={navigate} />
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="text-center">
            <Button
              size="lg"
              className="group gap-2 bg-gradient-to-r from-diamond-from to-diamond-to hover:opacity-90"
              onClick={() => navigate("/diamond-sizing-chart")}
            >
              <Diamond className="h-5 w-5" />
              View Full Sizing Chart
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">
              Interactive 3D viewer • MM to Carat lookup • Shape comparisons
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
