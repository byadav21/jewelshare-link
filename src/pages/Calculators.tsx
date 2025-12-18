import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Gem, Wrench, ArrowRight, Sparkles, Ruler, Grid3X3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { TiltCard } from "@/components/TiltCard";

const Calculators = () => {
  const navigate = useNavigate();

  const calculators: Array<{
    icon: any;
    title: string;
    description: string;
    features: string[];
    gradient: string;
    path: string;
    badge?: string;
    extraButtons?: Array<{
      label: string;
      path: string;
    }>;
  }> = [
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
      icon: Grid3X3,
      title: "Diamond Sieve Size Chart",
      description:
        "Interactive reference chart for diamond sieve sizes. Understand the relationship between sieve numbers, mm dimensions, carat weights, and number of stones per carat. Essential for sorting and pricing melee diamonds.",
      features: [
        "Complete sieve size reference",
        "MM to sieve converter",
        "Carat weight lookup",
        "Stones per carat calculator",
        "Interactive search & filter"
      ],
      gradient: "from-indigo-500 to-purple-600",
      path: "/diamond-sieve-chart",
      badge: "Reference",
      extraButtons: [
        {
          label: "Diamond Sizing Chart",
          path: "/diamond-sizing-chart"
        }
      ]
    },
    {
      icon: Wrench,
      title: "Estimate Generator",
      description:
        "Create detailed manufacturing cost estimates for jewelry quotes. Calculate complete costs including gold, diamonds, gemstones, making charges, CAD design, camming/casting, and certification. Perfect for providing accurate quotes to customers.",
      features: [
        "Complete cost breakdown",
        "Profit margin calculator",
        "Save & load estimates",
        "Customer tracking links",
        "Real-time calculations"
      ],
      gradient: "from-jewellery-from to-jewellery-to",
      path: "/manufacturing-cost",
      badge: "Quoting",
      extraButtons: [
        {
          label: "View Estimate History",
          path: "/estimate-history"
        }
      ]
    },
    {
      icon: Calculator,
      title: "Invoice Generator",
      description:
        "Generate professional invoices for completed jewelry orders. Convert approved estimates into formal invoices with invoice numbering, payment terms, GST calculations, and multi-item line items with complete specifications.",
      features: [
        "Auto invoice numbering",
        "GST & tax calculations",
        "Multi-item invoices",
        "Professional PDF export",
        "Email invoice to customers"
      ],
      gradient: "from-orange-500 to-orange-700",
      path: "/invoice-generator",
      badge: "Billing",
      extraButtons: [
        {
          label: "View Invoice History",
          path: "/invoice-history"
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <Header />
      <div className="py-4 md:py-8 px-3 md:px-4">
      <div className="container max-w-6xl mx-auto">
        
        <ScrollReveal>
          <div className="text-center mb-8 md:mb-12">
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
              <Calculator className="w-8 h-8 md:w-12 md:h-12 text-primary" />
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Jewelry Tools
              </h1>
            </div>
            <p className="text-muted-foreground text-sm md:text-base lg:text-xl max-w-2xl mx-auto px-4">
              Professional tools for pricing diamonds and estimating jewelry production costs
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-4 md:gap-6 lg:gap-8 md:grid-cols-2 lg:grid-cols-3 mb-8 md:mb-12">
          {calculators.map((calc, index) => (
            <ScrollReveal key={index} delay={0.1 * index} direction="up">
              <Card 
                className="group relative overflow-hidden border-2 h-full transition-all hover:shadow-2xl hover:shadow-primary/20 cursor-pointer"
                onClick={() => {
                  navigate(calc.path);
                }}
              >
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

                    <div className="space-y-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(calc.path);
                        }}
                        className="w-full group/btn"
                        size="lg"
                      >
                        Launch Calculator
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                      
                      {calc.extraButtons && calc.extraButtons.map((btn, idx) => (
                        <Button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(btn.path);
                          }}
                          variant="outline"
                          className="w-full"
                          size="lg"
                        >
                          {btn.label}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
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
      <Footer />
    </div>
  );
};

export default Calculators;
