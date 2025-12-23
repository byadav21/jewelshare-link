import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ScrollReveal";
import { TiltCard } from "@/components/TiltCard";
import { AnimatedIcon } from "@/components/AnimatedIcon";
import { ArrowRight, Calculator, FileText, Package, Share2, ShoppingCart, Users, BarChart3, Sparkles, Heart, Video, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const FeaturesGrid = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Calculator,
      title: "Diamond Price Calculator",
      description:
        "Professional Rapaport-based diamond pricing with 4Cs. Compare up to 4 diamonds side-by-side with instant price estimates.",
      gradient: "from-diamond-from to-diamond-to",
      link: "/diamond-calculator",
    },
    {
      icon: Calculator,
      title: "Manufacturing Cost Estimator",
      description:
        "Calculate complete jewelry costs including gold, diamonds, gemstones, making charges, CAD design, and certification.",
      gradient: "from-jewellery-from to-jewellery-to",
      link: "/manufacturing-cost",
    },
    {
      icon: FileText,
      title: "Invoice Generator",
      description:
        "Create professional branded invoices with customizable templates. Support for multi-item orders, GST, and shipping zones.",
      gradient: "from-gemstone-from to-gemstone-to",
      link: "/invoice-generator",
    },
    {
      icon: Package,
      title: "Comprehensive Catalog",
      description:
        "Manage diamonds, gemstones, and jewelry with detailed specifications. Bulk operations, auto-categorization, and soft delete.",
      gradient: "from-jewellery-from to-jewellery-to",
      link: "/catalog",
    },
    {
      icon: Share2,
      title: "Shareable Catalogs with QR",
      description:
        "Create shareable links with custom pricing and expiry dates. Generate QR codes for offline distribution.",
      gradient: "from-diamond-from to-diamond-to",
      link: "/share",
    },
    {
      icon: ShoppingCart,
      title: "Purchase Inquiries",
      description:
        "Receive and manage customer purchase requests. Track status, export to CRM, and automated email notifications.",
      gradient: "from-gemstone-from to-gemstone-to",
      link: "/purchase-inquiries",
    },
    {
      icon: Heart,
      title: "Wishlist & Interests",
      description:
        "Customers can save favorites and share wishlists. Track product interest analytics for data-driven decisions.",
      gradient: "from-jewellery-from to-jewellery-to",
      link: "/wishlist",
    },
    {
      icon: Video,
      title: "Video Request Management",
      description:
        "Handle video requests from customers viewing shared catalogs. Update status and communicate directly.",
      gradient: "from-diamond-from to-diamond-to",
      link: "/video-requests",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description:
        "Real-time insights into catalog performance, customer engagement, popular products, and sales trends.",
      gradient: "from-gemstone-from to-gemstone-to",
      link: "/analytics",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description:
        "Add team members with granular permissions. Control access to catalog, products, sharing, and customer data.",
      gradient: "from-jewellery-from to-jewellery-to",
      link: "/team-management",
    },
    {
      icon: Sparkles,
      title: "Rewards System",
      description:
        "Earn points for platform engagement. Redeem for extra product slots and premium features.",
      gradient: "from-diamond-from to-diamond-to",
      link: "/rewards",
    },
    {
      icon: Settings,
      title: "Session Management",
      description:
        "Control active sessions with device tracking, IP monitoring, and remote session termination for security.",
      gradient: "from-gemstone-from to-gemstone-to",
      link: "/active-sessions",
    },
  ];

  return (
    <section className="container mx-auto px-4 py-24">
      <ScrollReveal>
        <div className="mb-20 text-center">
          <h2 className="mb-6 text-5xl font-bold font-serif bg-gradient-to-r from-jewellery-from via-gemstone-from to-diamond-from bg-clip-text text-transparent">
            Complete Jewelry Management Suite
          </h2>
          <p className="text-2xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to run a professional jewelry business - from pricing calculators to customer management
          </p>
        </div>
      </ScrollReveal>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <ScrollReveal key={index} delay={0.05 * (index % 3)} direction="up">
            <TiltCard maxTilt={8} scale={1.05}>
              <Card 
                className="group relative overflow-hidden border-2 h-full transition-all hover:shadow-xl hover:shadow-primary/20 cursor-pointer"
                onClick={() => navigate(feature.link)}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity group-hover:opacity-10`}
                />
                <CardHeader>
                  <div
                    className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg group-hover:shadow-xl transition-all duration-300`}
                  >
                    <AnimatedIcon 
                      icon={feature.icon} 
                      className="h-7 w-7 text-white" 
                      animation={index % 4 === 0 ? "pulse" : index % 4 === 1 ? "rotate" : index % 4 === 2 ? "bounce" : "scale"}
                      delay={0.05 * (index % 3)}
                    />
                  </div>
                  <CardTitle className="text-xl flex items-center justify-between group-hover:text-primary transition-colors">
                    {feature.title}
                    <ArrowRight className="h-5 w-5 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </TiltCard>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
};
