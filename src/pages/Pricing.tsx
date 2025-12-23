import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Check, Gem, ArrowRight, Sparkles } from "lucide-react";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { StructuredData } from "@/components/StructuredData";

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Essentials",
      price: "Free",
      period: "30-day trial",
      description: "Perfect for trying out our professional calculators",
      gradient: "from-gemstone-from to-gemstone-to",
      features: [
        "Unlimited Diamond Calculator access",
        "Unlimited Manufacturing Cost Estimator",
        "Read-only catalog browsing",
        "Profile management",
        "Email support",
        "30-day free trial period"
      ],
      limitations: [
        "Cannot add products",
        "Cannot create share links",
        "No team members",
        "Upgrade anytime to full features"
      ],
      cta: "Start Free Trial",
      popular: false,
      highlighted: true
    },
    {
      name: "Starter",
      price: "Free",
      period: "forever",
      description: "Perfect for small jewelry vendors getting started",
      gradient: "from-gemstone-from to-gemstone-to",
      features: [
        "Up to 100 products",
        "1 active share link",
        "Basic analytics",
        "Email support",
        "Product image uploads (3 per product)",
        "Customer interest tracking",
        "7-day share link expiry"
      ],
      limitations: [
        "No team members",
        "No video requests",
        "No custom orders"
      ],
      cta: "Get Started Free",
      popular: false
    },
    {
      name: "Professional",
      price: "$49",
      period: "per month",
      description: "For growing businesses with active catalogs",
      gradient: "from-jewellery-from to-jewellery-to",
      features: [
        "Up to 1,000 products",
        "10 active share links",
        "Advanced analytics & insights",
        "Priority email support",
        "Unlimited product images",
        "Video request management",
        "Custom order tracking",
        "Up to 3 team members",
        "90-day share link expiry",
        "Custom pricing per link",
        "WhatsApp integration"
      ],
      limitations: [],
      cta: "Start 14-Day Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "$149",
      period: "per month",
      description: "For established vendors with large inventories",
      gradient: "from-diamond-from to-diamond-to",
      features: [
        "Unlimited products",
        "Unlimited share links",
        "Real-time analytics dashboard",
        "Dedicated account manager",
        "Unlimited team members",
        "Advanced permissions control",
        "Bulk import/export",
        "API access",
        "Custom branding",
        "No expiry on share links",
        "Priority phone support",
        "Custom integrations",
        "Session management",
        "Audit logs"
      ],
      limitations: [],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const comparison = [
    { feature: "Diamond Calculator", essentials: "✓ Unlimited", starter: "✓ Unlimited", professional: "✓ Unlimited", enterprise: "✓ Unlimited" },
    { feature: "Manufacturing Estimator", essentials: "✓ Unlimited", starter: "✓ Unlimited", professional: "✓ Unlimited", enterprise: "✓ Unlimited" },
    { feature: "Catalog View", essentials: "Read-Only", starter: "Full Access", professional: "Full Access", enterprise: "Full Access" },
    { feature: "Products", essentials: "0", starter: "100", professional: "1,000", enterprise: "Unlimited" },
    { feature: "Share Links", essentials: "0", starter: "1", professional: "10", enterprise: "Unlimited" },
    { feature: "Team Members", essentials: "0", starter: "0", professional: "3", enterprise: "Unlimited" },
    { feature: "Product Images", starter: "3/product", professional: "Unlimited", enterprise: "Unlimited" },
    { feature: "Analytics", starter: "Basic", professional: "Advanced", enterprise: "Real-time" },
    { feature: "Video Requests", starter: "✗", professional: "✓", enterprise: "✓" },
    { feature: "Custom Orders", starter: "✗", professional: "✓", enterprise: "✓" },
    { feature: "Bulk Import/Export", starter: "✗", professional: "✗", enterprise: "✓" },
    { feature: "API Access", starter: "✗", professional: "✗", enterprise: "✓" },
    { feature: "Custom Branding", starter: "✗", professional: "✗", enterprise: "✓" },
    { feature: "Support", starter: "Email", professional: "Priority Email", enterprise: "Phone + Email" }
  ];

  // Product schema for pricing
  const pricingSchema = {
    type: "Product" as const,
    name: "Cataleon Professional Plan",
    description: "Professional jewelry catalog management with up to 1,000 products, 10 share links, advanced analytics, and team collaboration features.",
    image: "https://cataleon.com/og-image.png",
    brand: "Cataleon",
    offers: {
      price: "49",
      priceCurrency: "USD",
      availability: "InStock"
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* SEO Meta Tags */}
      <SEOHead
        title="Pricing Plans - Cataleon Jewelry Catalog Management"
        description="Choose the perfect Cataleon plan for your jewelry business. Start free with our Essentials plan, or upgrade to Professional ($49/mo) or Enterprise ($149/mo) for unlimited products and advanced features. 14-day money-back guarantee."
        keywords="jewelry software pricing, catalog management plans, jewelry inventory cost, B2B jewelry platform pricing, diamond calculator pricing"
        canonicalUrl="/pricing"
      />
      
      {/* Structured Data */}
      <StructuredData data={pricingSchema} />
      
      <Header />
      
      {/* Breadcrumb Navigation */}
      <div className="container mx-auto px-4 pt-4">
        <BreadcrumbNav />
      </div>
      
      {/* Hero Section */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-16 text-center">
          {/* AI Summary */}
          <p className="sr-only">
            This page shows Cataleon pricing plans. Essentials: Free 30-day trial with unlimited calculators. Starter: Free forever with 100 products. Professional: $49/month with 1,000 products and team features. Enterprise: $149/month with unlimited everything. All plans include diamond calculator and manufacturing cost estimator.
          </p>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm">
            <Sparkles className="h-4 w-4 text-jewellery-from" />
            <span className="text-muted-foreground">Simple, Transparent Pricing</span>
          </div>
          <h1 className="mb-4 text-5xl font-bold tracking-tight">
            Choose Your Perfect Plan
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Start free, scale as you grow. All plans include 14-day money-back guarantee.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-8 lg:grid-cols-4">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative overflow-hidden border-2 transition-all hover:shadow-xl ${
                plan.popular ? 'border-jewellery-from shadow-lg' : ''
              } ${
                plan.highlighted ? 'border-gemstone-from shadow-md' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute right-4 top-4">
                  <Badge className="bg-gradient-to-r from-jewellery-from to-jewellery-to">
                    Most Popular
                  </Badge>
                </div>
              )}
              {plan.highlighted && (
                <div className="absolute right-4 top-4">
                  <Badge className="bg-gradient-to-r from-gemstone-from to-gemstone-to">
                    Try Free
                  </Badge>
                </div>
              )}
              <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-5`} />
              <CardHeader className="relative">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-base">{plan.description}</CardDescription>
                <div className="mt-6">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    {plan.period !== "forever" && (
                      <span className="ml-2 text-muted-foreground">/{plan.period}</span>
                    )}
                  </div>
                  {plan.period === "forever" && (
                    <p className="mt-1 text-sm text-muted-foreground">No credit card required</p>
                  )}
                </div>
              </CardHeader>
              <CardContent className="relative space-y-6">
                <Button 
                  className={`w-full ${plan.popular ? 'bg-gradient-to-r from-jewellery-from to-jewellery-to' : ''} ${plan.highlighted ? 'bg-gradient-to-r from-gemstone-from to-gemstone-to' : ''}`}
                  variant={plan.popular || plan.highlighted ? "default" : "outline"}
                  size="lg"
                  onClick={() => navigate(plan.name === "Essentials" ? '/auth?plan=essentials' : '/auth')}
                >
                  {plan.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                
                <div className="space-y-3">
                  <p className="text-sm font-semibold">What's included:</p>
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-jewellery-from" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                  {plan.limitations.length > 0 && (
                    <>
                      <p className="pt-4 text-sm font-semibold text-muted-foreground">Not included:</p>
                      {plan.limitations.map((limitation, i) => (
                        <div key={i} className="flex items-start gap-3 opacity-50">
                          <div className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground">✗</div>
                          <span className="text-sm text-muted-foreground">{limitation}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">Detailed Feature Comparison</h2>
          <p className="text-lg text-muted-foreground">See exactly what's included in each plan</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2">
                <th className="p-4 text-left font-semibold">Feature</th>
                <th className="p-4 text-center font-semibold">Essentials</th>
                <th className="p-4 text-center font-semibold">Starter</th>
                <th className="p-4 text-center font-semibold">Professional</th>
                <th className="p-4 text-center font-semibold">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row, index) => (
                <tr key={index} className="border-b hover:bg-muted/30">
                  <td className="p-4 font-medium">{row.feature}</td>
                  <td className="p-4 text-center text-gemstone-from">{row.essentials}</td>
                  <td className="p-4 text-center text-muted-foreground">{row.starter}</td>
                  <td className="p-4 text-center font-medium text-jewellery-from">{row.professional}</td>
                  <td className="p-4 text-center font-medium text-diamond-from">{row.enterprise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ CTA */}
      <section className="border-t py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Still Have Questions?</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Check out our FAQ section or contact our sales team
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="outline" onClick={() => navigate('/')}>
              View FAQ
            </Button>
            <Button size="lg" onClick={() => navigate('/auth')}>
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
