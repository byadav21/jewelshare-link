import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ParallaxImage } from "@/components/ParallaxImage";
import { AnimatedIcon } from "@/components/AnimatedIcon";
import { 
  Share2, 
  QrCode, 
  TrendingUp, 
  Upload, 
  Tags, 
  Archive, 
  ShoppingCart,
  Heart,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import catalogFeature from "@/assets/catalog-feature.jpg";

export const CatalogFeatures = () => {
  const navigate = useNavigate();

  const catalogFeatures = [
    {
      icon: Share2,
      title: "Smart Catalog Sharing",
      description: "Create shareable links with custom pricing (markup/markdown) and expiry dates. Track views in real-time.",
    },
    {
      icon: QrCode,
      title: "QR Code Generation",
      description: "Generate QR codes for each catalog link. Perfect for offline distribution, business cards, and signage.",
    },
    {
      icon: TrendingUp,
      title: "Share Link Analytics",
      description: "Track views over time, top products, and customer engagement metrics for data-driven decisions.",
    },
    {
      icon: Upload,
      title: "Bulk Operations",
      description: "Import products via Excel, bulk edit multiple items, auto-categorization, and batch status updates.",
    },
    {
      icon: Tags,
      title: "Smart Categorization",
      description: "AI-powered auto-categorization based on product names and SKUs. Drag-and-drop category assignment.",
    },
    {
      icon: Archive,
      title: "Soft Delete System",
      description: "Safely remove products with soft delete. Maintain data integrity and audit trails.",
    },
    {
      icon: ShoppingCart,
      title: "Purchase Inquiries",
      description: "Customers can submit purchase requests with quantity and messages. Track and manage all inquiries.",
    },
    {
      icon: Heart,
      title: "Wishlist System",
      description: "Customers can save favorites and share wishlists with friends. Track product interest analytics.",
    },
  ];

  return (
    <section className="container mx-auto px-4 py-24">
      <ScrollReveal>
        <div className="mb-20 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-primary/30 bg-primary/10 px-6 py-3 text-sm backdrop-blur-sm">
            <Share2 className="h-5 w-5 text-primary" />
            <span className="font-semibold text-primary">Catalog Management</span>
          </div>
          <h2 className="mb-6 text-5xl font-bold font-serif bg-gradient-to-r from-jewellery-from via-gemstone-from to-diamond-from bg-clip-text text-transparent">
            Powerful Digital Catalog System
          </h2>
          <p className="text-2xl text-muted-foreground max-w-3xl mx-auto">
            Showcase your jewelry collection with smart sharing, customer engagement tools, and comprehensive management features
          </p>
        </div>
      </ScrollReveal>

      <div className="grid gap-12 lg:grid-cols-2 items-center mb-16">
        <ScrollReveal direction="left">
          <ParallaxImage
            src={catalogFeature}
            alt="Digital catalog showcase"
            className="relative overflow-hidden rounded-2xl border-2 shadow-2xl"
            speed={0.3}
          />
        </ScrollReveal>

        <ScrollReveal direction="right">
          <div className="space-y-8">
            <div>
              <h3 className="mb-4 text-3xl font-bold">Share Catalogs Your Way</h3>
              <p className="text-lg text-muted-foreground mb-6">
                Create beautiful, shareable catalogs in seconds. Control pricing, access, and expiry dates for different customer segments.
              </p>
              <ul className="space-y-3">
                {[
                  "Custom markup/markdown pricing per catalog",
                  "QR codes for offline distribution",
                  "Track views and engagement analytics",
                  "Expiry date control",
                  "Show/hide vendor details",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Button 
              size="lg"
              className="group bg-gradient-to-r from-gemstone-from to-gemstone-to hover:opacity-90"
              onClick={() => navigate("/share")}
            >
              Create Shareable Catalog
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </ScrollReveal>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {catalogFeatures.map((feature, index) => (
          <ScrollReveal key={index} delay={0.05 * index}>
            <Card className="group relative overflow-hidden border-2 h-full hover:shadow-lg hover:shadow-primary/10 transition-all">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-jewellery-from to-gemstone-to shadow-md group-hover:shadow-lg transition-all">
                  <AnimatedIcon 
                    icon={feature.icon} 
                    className="h-6 w-6 text-white" 
                    animation={index % 2 === 0 ? "pulse" : "rotate"}
                    delay={0.05 * index}
                  />
                </div>
                <h3 className="mb-2 text-lg font-bold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
};
