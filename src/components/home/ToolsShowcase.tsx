import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ScrollReveal";
import { TiltCard } from "@/components/TiltCard";
import { Calculator, Wrench, FileText, ArrowRight, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ToolsShowcase = () => {
  const navigate = useNavigate();

  const tools = [
    {
      icon: Calculator,
      title: "Diamond Price Calculator",
      description: "Professional Rapaport-based pricing engine",
      features: [
        "All diamond shapes supported",
        "4Cs-based instant calculations",
        "Compare up to 4 diamonds",
        "Custom markup/discount",
        "PDF export for clients",
      ],
      gradient: "from-diamond-from to-diamond-to",
      link: "/diamond-calculator",
    },
    {
      icon: Wrench,
      title: "Manufacturing Cost Estimator",
      description: "Complete jewelry cost breakdown calculator",
      features: [
        "Gold cost calculation",
        "Diamond & gemstone pricing",
        "Making charges & CAD fees",
        "Profit margin calculator",
        "Save & compare estimates",
      ],
      gradient: "from-jewellery-from to-jewellery-to",
      link: "/manufacturing-cost",
    },
    {
      icon: FileText,
      title: "Invoice Generator",
      description: "Professional branded invoices in minutes",
      features: [
        "Customizable templates",
        "Multi-item jewelry invoices",
        "GST & shipping zones",
        "Auto-populate vendor data",
        "Email & PDF export",
      ],
      gradient: "from-gemstone-from to-gemstone-to",
      link: "/invoice-generator",
    },
  ];

  return (
    <section className="container mx-auto px-4 py-24 bg-gradient-to-br from-background via-primary/5 to-background">
      <ScrollReveal>
        <div className="mb-16 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-primary/30 bg-primary/10 px-6 py-3 text-sm backdrop-blur-sm">
            <Calculator className="h-5 w-5 text-primary" />
            <span className="font-semibold text-primary">Professional Tools</span>
          </div>
          <h2 className="mb-6 text-5xl font-bold font-serif bg-gradient-to-r from-jewellery-from via-gemstone-from to-diamond-from bg-clip-text text-transparent">
            Free Calculation Tools for Jewellers
          </h2>
          <p className="text-2xl text-muted-foreground max-w-3xl mx-auto">
            Industry-standard calculators to price diamonds, estimate manufacturing costs, and generate professional invoices
          </p>
        </div>
      </ScrollReveal>

      <div className="grid gap-8 lg:grid-cols-3">
        {tools.map((tool, index) => (
          <ScrollReveal key={index} delay={0.1 * index}>
            <TiltCard maxTilt={6} scale={1.05}>
              <Card className="group relative overflow-hidden border-2 h-full hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300">
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 transition-opacity group-hover:opacity-10`} />
                <CardContent className="p-8">
                  <div className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${tool.gradient} shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                    <tool.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold">{tool.title}</h3>
                  <p className="mb-6 text-muted-foreground">{tool.description}</p>
                  
                  <ul className="mb-8 space-y-3">
                    {tool.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full group/btn bg-gradient-to-r ${tool.gradient} hover:opacity-90 transition-opacity`}
                    onClick={() => navigate(tool.link)}
                  >
                    Try {tool.title}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            </TiltCard>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal delay={0.3}>
        <div className="mt-12 text-center">
          <Button 
            size="lg" 
            variant="outline"
            className="group h-14 gap-2 px-10 text-lg font-semibold border-2 hover:bg-primary/5 transition-all duration-300"
            onClick={() => navigate("/calculators")}
          >
            View All Calculators
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </ScrollReveal>
    </section>
  );
};
