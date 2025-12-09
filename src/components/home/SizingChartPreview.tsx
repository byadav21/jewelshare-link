import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Diamond, Ruler, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const PREVIEW_SHAPES = [
  { key: "round", name: "Round", mm: "6.5mm", carat: "1.00ct" },
  { key: "princess", name: "Princess", mm: "5.5 x 5.5mm", carat: "1.00ct" },
  { key: "oval", name: "Oval", mm: "8.0 x 5.5mm", carat: "1.00ct" },
  { key: "cushion", name: "Cushion", mm: "5.5 x 5.5mm", carat: "1.00ct" },
  { key: "emerald", name: "Emerald", mm: "7.0 x 5.0mm", carat: "1.00ct" },
  { key: "pear", name: "Pear", mm: "8.5 x 5.5mm", carat: "1.00ct" },
];

const ShapeIcon = ({ shape }: { shape: string }) => {
  const shapes: Record<string, JSX.Element> = {
    round: (
      <svg viewBox="0 0 40 40" className="w-full h-full">
        <circle cx="20" cy="20" r="16" fill="url(#previewGrad)" opacity="0.3" />
        <circle cx="20" cy="20" r="16" fill="none" stroke="url(#previewGrad)" strokeWidth="2" />
      </svg>
    ),
    princess: (
      <svg viewBox="0 0 40 40" className="w-full h-full">
        <rect x="6" y="6" width="28" height="28" fill="url(#previewGrad)" opacity="0.3" />
        <rect x="6" y="6" width="28" height="28" fill="none" stroke="url(#previewGrad)" strokeWidth="2" />
      </svg>
    ),
    oval: (
      <svg viewBox="0 0 40 40" className="w-full h-full">
        <ellipse cx="20" cy="20" rx="16" ry="11" fill="url(#previewGrad)" opacity="0.3" />
        <ellipse cx="20" cy="20" rx="16" ry="11" fill="none" stroke="url(#previewGrad)" strokeWidth="2" />
      </svg>
    ),
    cushion: (
      <svg viewBox="0 0 40 40" className="w-full h-full">
        <rect x="6" y="6" width="28" height="28" rx="6" fill="url(#previewGrad)" opacity="0.3" />
        <rect x="6" y="6" width="28" height="28" rx="6" fill="none" stroke="url(#previewGrad)" strokeWidth="2" />
      </svg>
    ),
    emerald: (
      <svg viewBox="0 0 40 40" className="w-full h-full">
        <polygon points="8,8 32,8 34,32 6,32" fill="url(#previewGrad)" opacity="0.3" />
        <polygon points="8,8 32,8 34,32 6,32" fill="none" stroke="url(#previewGrad)" strokeWidth="2" />
      </svg>
    ),
    pear: (
      <svg viewBox="0 0 40 40" className="w-full h-full">
        <path d="M20 4 C8 16, 6 26, 20 38 C34 26, 32 16, 20 4" fill="url(#previewGrad)" opacity="0.3" />
        <path d="M20 4 C8 16, 6 26, 20 38 C34 26, 32 16, 20 4" fill="none" stroke="url(#previewGrad)" strokeWidth="2" />
      </svg>
    ),
  };
  return shapes[shape] || null;
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
              <motion.div
                key={shape.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4 text-center hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 border-primary/10 hover:border-primary/30 group cursor-pointer"
                  onClick={() => navigate("/diamond-sizing-chart")}
                >
                  <div className="w-12 h-12 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <ShapeIcon shape={shape.key} />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{shape.name}</h3>
                  <p className="text-xs text-muted-foreground">{shape.mm}</p>
                  <p className="text-xs text-primary font-medium">{shape.carat}</p>
                </Card>
              </motion.div>
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
