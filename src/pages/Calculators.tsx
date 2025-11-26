import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Gem, Wrench, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { ScrollReveal } from "@/components/ScrollReveal";
import { TiltCard } from "@/components/TiltCard";

const Calculators = () => {
  const navigate = useNavigate();

  const calculators = [
    {
      icon: Gem,
      title: "Diamond Price Calculator",
      description:
        "Professional diamond pricing tool with Rapaport-based calculations. Estimate diamond values based on the 4Cs (Carat, Cut, Color, Clarity) with support for all shapes and instant price comparisons. Apply custom discounts or markups for accurate pricing.",
      features: [
        "All diamond shapes supported",
        "4Cs-based pricing",
        "Compare up to 4 diamonds",
        "PDF export for quotes",
        "Price history tracking"
      ],
      gradient: "from-diamond-from to-diamond-to",
      path: "/diamond-calculator",
      badge: "Most Popular"
    },
    {
      icon: Wrench,
      title: "Manufacturing Cost Estimator",
      description:
        "Calculate complete jewelry manufacturing costs including gold, diamonds, gemstones, making charges, CAD design, camming/casting, and certification. Get detailed cost breakdowns for accurate pricing and profitability analysis.",
      features: [
        "Complete cost breakdown",
        "Profit margin calculator",
        "Save & load estimates",
        "Compare multiple estimates",
        "Real-time calculations"
      ],
      gradient: "from-jewellery-from to-jewellery-to",
      path: "/manufacturing-cost",
      badge: "New"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 py-8 px-4">
      <div className="container max-w-6xl mx-auto">
        <BackToHomeButton />
        
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Calculator className="w-12 h-12 text-primary" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Jewelry Calculators
              </h1>
            </div>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
              Professional tools to help you price diamonds accurately and estimate manufacturing costs for jewelry production
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-8 md:grid-cols-2 mb-12">
          {calculators.map((calc, index) => (
            <ScrollReveal key={index} delay={0.1 * index} direction="up">
              <TiltCard maxTilt={5} scale={1.02}>
                <Card className="group relative overflow-hidden border-2 h-full transition-all hover:shadow-2xl hover:shadow-primary/20">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${calc.gradient} opacity-0 transition-opacity group-hover:opacity-10`}
                  />
                  
                  {calc.badge && (
                    <div className="absolute top-4 right-4 z-10">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground">
                        <Sparkles className="w-3 h-3" />
                        {calc.badge}
                      </span>
                    </div>
                  )}

                  <CardHeader className="pb-4">
                    <div
                      className={`mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${calc.gradient}`}
                    >
                      <calc.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl">{calc.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {calc.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground">Key Features:</h4>
                      <ul className="space-y-2">
                        {calc.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <div className="mt-1 flex-shrink-0">
                              <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${calc.gradient}`} />
                            </div>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button
                      onClick={() => navigate(calc.path)}
                      className={`w-full bg-gradient-to-r ${calc.gradient} hover:opacity-90 transition-opacity group/btn`}
                    >
                      Launch Calculator
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </CardContent>
                </Card>
              </TiltCard>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.3}>
          <Card className="border-2 bg-gradient-to-br from-primary/5 via-background to-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Why Use Our Calculators?
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <h4 className="font-semibold">Accurate Pricing</h4>
                <p className="text-sm text-muted-foreground">
                  Industry-standard calculations ensure professional and reliable pricing for your jewelry business.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Time-Saving</h4>
                <p className="text-sm text-muted-foreground">
                  Instant calculations eliminate manual work and reduce pricing errors, saving hours of time.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Professional Reports</h4>
                <p className="text-sm text-muted-foreground">
                  Generate detailed reports and comparisons to share with clients and make informed decisions.
                </p>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </div>
  );
};

export default Calculators;
