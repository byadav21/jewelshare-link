import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { BrandLogosCarousel } from "@/components/BrandLogosCarousel";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ParallaxImage } from "@/components/ParallaxImage";
import { AnimatedParticles } from "@/components/AnimatedParticles";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { AnimatedIcon } from "@/components/AnimatedIcon";
import { ParallaxSection } from "@/components/ParallaxSection";
import { TiltCard } from "@/components/TiltCard";
import { InteractiveROICalculator } from "@/components/InteractiveROICalculator";
import { SEOHead } from "@/components/SEOHead";
import { StructuredData } from "@/components/StructuredData";

import { useState, useEffect } from "react";
import { TestimonialsCarousel } from "@/components/TestimonialsCarousel";
import { NewsletterSubscription } from "@/components/NewsletterSubscription";
import { CookieConsent } from "@/components/CookieConsent";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ScratchCard } from "@/components/ScratchCard";
import { FeaturesGrid } from "@/components/home/FeaturesGrid";
import { ToolsShowcase } from "@/components/home/ToolsShowcase";
import { CatalogFeatures } from "@/components/home/CatalogFeatures";
import { SizingChartPreview } from "@/components/home/SizingChartPreview";
import { CalculatorPreview } from "@/components/home/CalculatorPreview";
import { DiamondEducationPreview } from "@/components/home/DiamondEducationPreview";
import { supabase } from "@/integrations/supabase/client";
import heroBanner from "@/assets/hero-banner.jpg";
import vendorManagement from "@/assets/vendor-management.jpg";
import analyticsFeature from "@/assets/analytics-feature.jpg";


import { Footer } from "@/components/Footer";
import {
  Gem,
  Share2,
  Video,
  ShoppingBag,
  Users,
  BarChart3,
  Shield,
  Zap,
  Heart,
  Link2,
  Bell,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Quote,
  Star,
  Play,
  Calculator,
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [showScratchCard, setShowScratchCard] = useState(false);
  const [vendorName, setVendorName] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication and fetch vendor name
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsAuthenticated(true);
        // Fetch vendor profile to get business name
        const { data: profile } = await supabase
          .from("vendor_profiles")
          .select("business_name")
          .eq("user_id", session.user.id)
          .single();
        
        if (profile?.business_name) {
          setVendorName(profile.business_name);
        }
      }
    };
    
    checkAuth();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        const { data: profile } = await supabase
          .from("vendor_profiles")
          .select("business_name")
          .eq("user_id", session.user.id)
          .single();
        
        if (profile?.business_name) {
          setVendorName(profile.business_name);
        }
      } else {
        setIsAuthenticated(false);
        setVendorName(null);
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // Show scratch card after a short delay on first visit
  useEffect(() => {
    const hasSeenScratch = localStorage.getItem("has_seen_scratch_card");
    if (!hasSeenScratch) {
      const timer = setTimeout(() => {
        setShowScratchCard(true);
        localStorage.setItem("has_seen_scratch_card", "true");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const testimonials = [
    {
      name: "Priya Sharma",
      business: "Brilliant Gems & Jewelry",
      role: "Owner",
      content:
        "This platform transformed how we share our diamond collection with international clients. The custom pricing feature alone has increased our B2B sales by 45%. Video requests help us close deals faster than ever.",
      rating: 5,
      gradient: "from-jewellery-from to-jewellery-to",
    },
    {
      name: "Rajesh Patel",
      business: "Heritage Diamonds",
      role: "Managing Director",
      content:
        "Managing our inventory of 5,000+ pieces was chaos before. Now everything is organized, shareable, and trackable. The analytics show us which products generate the most interest. Game changer for our wholesale business.",
      rating: 5,
      gradient: "from-gemstone-from to-gemstone-to",
    },
    {
      name: "Anita Desai",
      business: "Luxury Gemstone Gallery",
      role: "Director of Sales",
      content:
        "The shareable catalog links with expiry dates are brilliant for our seasonal promotions. Our team can manage everything from one place, and customers love how easy it is to browse and request videos of pieces they're interested in.",
      rating: 5,
      gradient: "from-diamond-from to-diamond-to",
    },
    {
      name: "Vikram Singh",
      business: "Royal Jewels Collection",
      role: "CEO",
      content:
        "We've been using this for 6 months and our customer engagement has doubled. The custom order management system helps us track bespoke jewelry requests perfectly. Our clients appreciate the professional presentation.",
      rating: 5,
      gradient: "from-jewellery-from to-jewellery-to",
    },
  ];

  const benefits = [
    { icon: Zap, text: "Lightning-fast catalog updates" },
    { icon: Link2, text: "Shareable links with custom pricing" },
    { icon: Bell, text: "Real-time customer notifications" },
    { icon: Sparkles, text: "Premium jewelry-focused interface" },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* SEO Meta Tags */}
      <SEOHead
        title="Cataleon - Professional Jewelry Catalog Management Platform"
        description="Cataleon is the leading jewelry catalog management platform. Manage inventory, share catalogs with custom pricing, calculate diamond prices using Rapaport-based pricing, and track customer inquiries. Trusted by 500+ jewelry vendors worldwide."
        keywords="jewelry catalog software, diamond price calculator, jewelry inventory management, jewelry B2B platform, loose diamonds, gemstones, jewelry vendors, Rapaport pricing, manufacturing cost estimator"
        canonicalUrl="/"
      />

      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-jewellery-from/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-gemstone-from/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-diamond-from/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>


      {/* Hero Section */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0">
          <img src={heroBanner} alt="Luxury diamonds and gemstones" className="h-full w-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/90" />
          <AnimatedParticles />
        </div>
        <div className="container relative mx-auto px-4 py-32 sm:py-40">
          <ScrollReveal>
            <div className="mx-auto max-w-4xl text-center">
              {isAuthenticated && vendorName && (
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-primary/30 bg-primary/10 px-6 py-3 text-base backdrop-blur-sm animate-fade-in">
                  <span className="font-semibold text-primary">
                    Hello, {vendorName}! 👋
                  </span>
                </div>
              )}
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border-2 border-primary/30 bg-primary/5 px-6 py-3 text-sm backdrop-blur-sm animate-fade-in">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                <span className="font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Cataleon - Professional Jewelry Management
                </span>
              </div>
              <h1 className="mb-8 text-6xl font-bold tracking-tight sm:text-7xl lg:text-8xl animate-fade-in" style={{ animationDelay: "0.1s" }}>
                Manage & Share Your
                <span className="block mt-2 bg-gradient-to-r from-jewellery-from via-gemstone-from to-diamond-from bg-clip-text text-transparent animate-gradient">
                  Jewelry Collection
                </span>
              </h1>
              <p className="mb-12 text-xl text-muted-foreground sm:text-2xl leading-relaxed animate-fade-in" style={{ animationDelay: "0.2s" }}>
                The complete platform for jewelry vendors to showcase inventory, share catalogs with custom pricing, manage customer inquiries, and calculate accurate diamond prices with our professional Rapaport-based calculator.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in" style={{ animationDelay: "0.3s" }}>
                {!isAuthenticated ? (
                  <>
                    <Button 
                      size="lg" 
                      className="group h-14 gap-2 px-10 text-lg font-semibold shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 bg-gradient-to-r from-gemstone-from to-gemstone-to" 
                      onClick={() => navigate("/auth?plan=essentials")}
                    >
                      <Calculator className="h-5 w-5" />
                      Free Calculator Access
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="h-14 px-10 text-lg font-semibold border-2 hover:bg-primary/5 transition-all duration-300" 
                      onClick={() => navigate("/auth")}
                    >
                      Full Catalog Access
                    </Button>
                  </>
                ) : (
                  <Button 
                    size="lg" 
                    className="group h-14 gap-2 px-10 text-lg font-semibold shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 bg-gradient-to-r from-primary to-accent" 
                    onClick={() => navigate("/catalog")}
                  >
                    Access Catalog
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>


      {/* Statistics Section */}
      <section className="border-y bg-gradient-to-br from-jewellery-from/10 via-gemstone-from/10 to-diamond-from/10 py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            <ScrollReveal delay={0.1}>
              <TiltCard maxTilt={6} scale={1.08}>
                <div className="text-center group">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-jewellery-from to-jewellery-to shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <AnimatedIcon icon={Gem} className="h-8 w-8 text-white" animation="pulse" delay={0.1} />
                  </div>
                  <div className="mb-2 text-5xl font-bold font-serif">
                    <AnimatedCounter end={15000} suffix="+" />
                  </div>
                  <p className="text-muted-foreground font-medium">Products Managed</p>
                </div>
              </TiltCard>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <TiltCard maxTilt={6} scale={1.08}>
                <div className="text-center group">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gemstone-from to-gemstone-to shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <AnimatedIcon icon={Share2} className="h-8 w-8 text-white" animation="rotate" delay={0.2} />
                  </div>
                  <div className="mb-2 text-5xl font-bold font-serif">
                    <AnimatedCounter end={2500} suffix="+" />
                  </div>
                  <p className="text-muted-foreground font-medium">Active Catalogs</p>
                </div>
              </TiltCard>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <TiltCard maxTilt={6} scale={1.08}>
                <div className="text-center group">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-diamond-from to-diamond-to shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <AnimatedIcon icon={Heart} className="h-8 w-8 text-white" animation="bounce" delay={0.3} />
                  </div>
                  <div className="mb-2 text-5xl font-bold font-serif">
                    <AnimatedCounter end={8750} suffix="+" />
                  </div>
                  <p className="text-muted-foreground font-medium">Customer Inquiries</p>
                </div>
              </TiltCard>
            </ScrollReveal>
            <ScrollReveal delay={0.4}>
              <TiltCard maxTilt={6} scale={1.08}>
                <div className="text-center group">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-jewellery-from via-gemstone-from to-diamond-from shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <AnimatedIcon icon={TrendingUp} className="h-8 w-8 text-white" animation="scale" delay={0.4} />
                  </div>
                  <div className="mb-2 text-5xl font-bold font-serif">
                    <AnimatedCounter end={98} suffix="%" />
                  </div>
                  <p className="text-muted-foreground font-medium">Satisfaction Rate</p>
                </div>
              </TiltCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Tools Showcase Section */}
      <ToolsShowcase />

      {/* Diamond Sizing Chart Preview */}
      <SizingChartPreview />

      {/* Diamond Calculator Preview */}
      <CalculatorPreview />

      {/* Diamond Education Preview */}
      <DiamondEducationPreview />

      {/* Catalog Features Section */}
      <CatalogFeatures />

      {/* Team Analytics Section */}
      <section className="container mx-auto px-4 py-24 bg-gradient-to-br from-background via-primary/5 to-background">
        <ScrollReveal>
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-5xl font-bold font-serif bg-gradient-to-r from-jewellery-from via-gemstone-from to-diamond-from bg-clip-text text-transparent">
              Team & Analytics
            </h2>
            <p className="text-2xl text-muted-foreground max-w-3xl mx-auto">
              Collaborate with your team and make data-driven decisions with powerful analytics
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-12 lg:grid-cols-2">
          <ScrollReveal direction="left">
            <div className="flex flex-col justify-center space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-jewellery-from via-gemstone-from to-diamond-from shadow-lg">
                  <AnimatedIcon icon={Users} className="h-7 w-7 text-white" animation="bounce" delay={0.2} />
                </div>
                <div>
                  <h3 className="mb-3 text-3xl font-bold font-serif">Team Collaboration</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Scale your business with multi-user access. Set granular permissions for team members, track
                    activities, and maintain full control over who can view and manage your inventory.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-diamond-from to-diamond-to shadow-lg">
                  <AnimatedIcon icon={BarChart3} className="h-7 w-7 text-white" animation="scale" delay={0.3} />
                </div>
                <div>
                  <h3 className="mb-3 text-3xl font-bold font-serif">Advanced Analytics</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Get real-time insights into catalog performance, customer engagement, and popular products. Make
                    data-driven decisions with comprehensive dashboards and visual reports.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal direction="right">
            <ParallaxImage
              src={analyticsFeature}
              alt="Analytics dashboard"
              className="relative overflow-hidden rounded-2xl border-2 shadow-2xl"
              speed={0.3}
            />
          </ScrollReveal>
        </div>
      </section>

      {/* Complete Features Grid */}
      <FeaturesGrid />

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-24">
        <ScrollReveal>
          <div className="mb-20 text-center">
            <h2 className="mb-6 text-5xl font-bold font-serif bg-gradient-to-r from-jewellery-from via-gemstone-from to-diamond-from bg-clip-text text-transparent">
              Trusted by Jewelry Vendors Worldwide
            </h2>
            <p className="text-2xl text-muted-foreground max-w-2xl mx-auto">
              See what our customers say about their experience
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <TestimonialsCarousel />
        </ScrollReveal>
      </section>

      {/* How It Works */}
      <section className="relative border-y bg-muted/30 py-24">
        <ParallaxSection speed={-0.3} className="absolute inset-0 overflow-hidden opacity-10">
          <img src={vendorManagement} alt="Vendor using platform" className="h-full w-full object-cover" />
        </ParallaxSection>
        <div className="container relative mx-auto px-4">
          <ScrollReveal>
            <div className="mb-20 text-center">
              <h2 className="mb-6 text-5xl font-bold font-serif">How It Works</h2>
              <p className="text-2xl text-muted-foreground max-w-2xl mx-auto">
                Simple steps to showcase your jewelry collection
              </p>
            </div>
          </ScrollReveal>
          <div className="grid gap-8 md:grid-cols-3">
            <ScrollReveal delay={0.1} direction="up">
              <div className="text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-jewellery-from to-jewellery-to text-2xl font-bold text-white">
                  1
                </div>
                <h3 className="mb-3 text-xl font-semibold">Add Your Inventory</h3>
                <p className="text-muted-foreground">
                  Upload your diamonds, gemstones, and jewelry pieces with detailed specifications, pricing, and images.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2} direction="up">
              <div className="text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gemstone-from to-gemstone-to text-2xl font-bold text-white">
                  2
                </div>
                <h3 className="mb-3 text-xl font-semibold">Create Share Links</h3>
                <p className="text-muted-foreground">
                  Generate shareable catalog links with custom pricing adjustments and expiry dates for different
                  clients.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.3} direction="up">
              <div className="text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-diamond-from to-diamond-to text-2xl font-bold text-white">
                  3
                </div>
                <h3 className="mb-3 text-xl font-semibold">Manage Inquiries</h3>
                <p className="text-muted-foreground">
                  Track customer interests, video requests, and custom orders all in one centralized dashboard.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-4xl">
          <ScrollReveal>
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-4xl font-bold">Why Choose Our Platform</h2>
              <p className="text-xl text-muted-foreground">Built specifically for jewelry industry professionals</p>
            </div>
          </ScrollReveal>
          <div className="grid gap-6 sm:grid-cols-2">
            {benefits.map((benefit, index) => (
              <ScrollReveal key={index} delay={0.1 * index} direction="up">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <AnimatedIcon 
                      icon={benefit.icon} 
                      className="h-5 w-5 text-primary" 
                      animation={index % 2 === 0 ? "pulse" : "bounce"}
                      delay={0.1 * index}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 font-semibold">{benefit.text}</h3>
                    <p className="text-sm text-muted-foreground">
                      {index === 0 && "Update your catalog instantly and share changes with customers in real-time"}
                      {index === 1 && "Set custom markups or markdowns for different clients and market segments"}
                      {index === 2 && "Get notified when customers show interest or request videos"}
                      {index === 3 && "Elegant design tailored for the luxury jewelry market"}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive ROI Calculator */}
      <section className="container mx-auto px-4 py-24">
        <ScrollReveal>
          <InteractiveROICalculator />
        </ScrollReveal>
      </section>

      {/* Trusted Brands Carousel */}
      <section className="container mx-auto px-4 py-16">
        <ScrollReveal>
          <div className="mb-8 text-center">
            <h2 className="mb-4 text-3xl font-bold font-serif bg-gradient-to-r from-jewellery-from via-gemstone-from to-diamond-from bg-clip-text text-transparent">
              Trusted by Leading Jewelry Brands
            </h2>
            <p className="text-lg text-muted-foreground">
              Join the industry leaders who rely on Cataleon
            </p>
          </div>
        </ScrollReveal>
        <BrandLogosCarousel />
      </section>

      {/* Newsletter Section */}
      <section className="container mx-auto px-4 py-24">
        <ScrollReveal>
          <NewsletterSubscription />
        </ScrollReveal>
      </section>

      {/* CTA Section */}
      <section className="border-t py-24">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="relative overflow-hidden rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-jewellery-from/10 via-gemstone-from/10 to-diamond-from/10 p-16 text-center shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
              <div className="relative z-10">
                <Sparkles className="h-12 w-12 text-primary mx-auto mb-6 animate-pulse" />
                <h2 className="mb-6 text-5xl font-bold font-serif bg-gradient-to-r from-jewellery-from via-gemstone-from to-diamond-from bg-clip-text text-transparent">
                  Ready to Transform Your Jewelry Business?
                </h2>
                <p className="mb-10 text-2xl text-muted-foreground max-w-2xl mx-auto">
                  Join thousands of vendors who are already managing their catalogs smarter
                </p>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Button 
                    size="lg" 
                    className="group h-14 gap-2 px-10 text-lg font-semibold shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all duration-300" 
                    onClick={() => navigate("/auth")}
                  >
                    Start Free Trial
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-10 text-lg font-semibold border-2 hover:bg-primary/5 transition-all duration-300"
                    onClick={() => navigate("/pricing")}
                  >
                    View Pricing
                  </Button>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Floating Components */}
      <ThemeSwitcher />
      <WhatsAppButton />
      <CookieConsent />
      {showScratchCard && <ScratchCard onClose={() => setShowScratchCard(false)} />}
    </div>
  );
};

export default Index;
