import { ScrollReveal } from "@/components/ScrollReveal";
import { TiltCard } from "@/components/TiltCard";
import { AnimatedIcon } from "@/components/AnimatedIcon";
import { 
  Upload, 
  Link2, 
  MessageSquare, 
  TrendingUp,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

const steps = [
  {
    number: 1,
    icon: Upload,
    title: "Add Your Inventory",
    description: "Upload your diamonds, gemstones, and jewelry pieces with detailed specifications, pricing, and high-quality images.",
    features: ["Bulk Excel import", "Multiple images per product", "Auto-categorization"],
    gradient: "from-jewellery-from to-jewellery-to",
  },
  {
    number: 2,
    icon: Link2,
    title: "Create Share Links",
    description: "Generate shareable catalog links with custom pricing adjustments and expiry dates for different clients.",
    features: ["Custom markups/markdowns", "Expiry dates", "Category filtering"],
    gradient: "from-gemstone-from to-gemstone-to",
  },
  {
    number: 3,
    icon: MessageSquare,
    title: "Manage Inquiries",
    description: "Track customer interests, video requests, and custom orders all in one centralized dashboard.",
    features: ["Real-time notifications", "Video requests", "Custom orders"],
    gradient: "from-diamond-from to-diamond-to",
  },
  {
    number: 4,
    icon: TrendingUp,
    title: "Grow Your Business",
    description: "Analyze performance metrics, understand customer behavior, and scale your jewelry business.",
    features: ["Analytics dashboard", "Customer insights", "Team collaboration"],
    gradient: "from-purple-500 to-pink-500",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-muted/50 via-background to-muted/50 overflow-hidden">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span className="font-medium text-primary">Simple Process</span>
            </div>
            <h2 className="mb-6 text-5xl font-bold font-serif bg-gradient-to-r from-jewellery-from via-gemstone-from to-diamond-from bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes with our intuitive platform designed for jewelry professionals
            </p>
          </div>
        </ScrollReveal>

        {/* Desktop: Horizontal Timeline */}
        <div className="hidden lg:block relative">
          {/* Connecting Line */}
          <div className="absolute top-24 left-[12%] right-[12%] h-1 bg-gradient-to-r from-jewellery-from via-gemstone-from to-diamond-from rounded-full opacity-30" />
          
          <div className="grid grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <ScrollReveal key={step.number} delay={index * 0.15}>
                <TiltCard maxTilt={6} scale={1.02}>
                  <div className="relative text-center">
                    {/* Step Number with Icon */}
                    <div className="relative z-10 mb-6">
                      <div className={`mx-auto inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${step.gradient} shadow-xl`}>
                        <AnimatedIcon 
                          icon={step.icon} 
                          className="h-10 w-10 text-white" 
                          animation="pulse" 
                          delay={index * 0.1} 
                        />
                      </div>
                      <div className={`absolute -top-2 -right-2 h-8 w-8 rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                        {step.number}
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="mb-3 text-xl font-bold font-serif">{step.title}</h3>
                    <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                      {step.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-2">
                      {step.features.map((feature) => (
                        <div key={feature} className="flex items-center justify-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Mobile/Tablet: Vertical Timeline */}
        <div className="lg:hidden relative">
          {/* Vertical Connecting Line */}
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-jewellery-from via-gemstone-from to-diamond-from rounded-full opacity-30" />

          <div className="space-y-8">
            {steps.map((step, index) => (
              <ScrollReveal key={step.number} delay={index * 0.1}>
                <div className="relative flex gap-6">
                  {/* Step Number with Icon */}
                  <div className="relative z-10 shrink-0">
                    <div className={`inline-flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br ${step.gradient} shadow-xl`}>
                      <AnimatedIcon 
                        icon={step.icon} 
                        className="h-8 w-8 text-white" 
                        animation="pulse" 
                        delay={index * 0.1} 
                      />
                    </div>
                    <div className={`absolute -top-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white font-bold text-xs shadow-lg`}>
                      {step.number}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <h3 className="mb-2 text-xl font-bold font-serif">{step.title}</h3>
                    <p className="text-muted-foreground mb-3 text-sm leading-relaxed">
                      {step.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {step.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-1.5 text-xs bg-muted/50 px-2 py-1 rounded-full">
                          <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};