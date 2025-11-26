import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useNavigate } from "react-router-dom";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ParallaxImage } from "@/components/ParallaxImage";
import { AnimatedParticles } from "@/components/AnimatedParticles";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { AnimatedIcon } from "@/components/AnimatedIcon";
import { ParallaxSection } from "@/components/ParallaxSection";
import { TiltCard } from "@/components/TiltCard";
import { InteractiveROICalculator } from "@/components/InteractiveROICalculator";

import { lazy, Suspense, useState, useEffect } from "react";
import { TestimonialsCarousel } from "@/components/TestimonialsCarousel";
import { BrandLogosCarousel } from "@/components/BrandLogosCarousel";
import { NewsletterSubscription } from "@/components/NewsletterSubscription";
import { CookieConsent } from "@/components/CookieConsent";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ScratchCard } from "@/components/ScratchCard";
import heroBanner from "@/assets/hero-banner.jpg";
import catalogFeature from "@/assets/catalog-feature.jpg";
import vendorManagement from "@/assets/vendor-management.jpg";
import analyticsFeature from "@/assets/analytics-feature.jpg";

const JewelryViewer3D = lazy(() => import("@/components/JewelryViewer3D").then(m => ({ default: m.JewelryViewer3D })));
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
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [showScratchCard, setShowScratchCard] = useState(false);

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

  const faqs = [
    {
      question: "How does the catalog sharing work?",
      answer:
        "Create a shareable link with custom pricing (markup or markdown), set an expiry date, and share it with your clients. You can track views, customer interests, and video requests all from your dashboard. Each link is unique and can be customized for different client segments.",
    },
    {
      question: "Can I manage multiple team members?",
      answer:
        "Yes! Add team members with granular permissions. Control who can view catalogs, add products, manage share links, handle custom orders, and more. Perfect for businesses with sales teams or multiple locations.",
    },
    {
      question: "What types of jewelry can I manage?",
      answer:
        "Our platform supports loose diamonds, gemstones, and finished jewelry pieces. Each category has specialized fields for specifications like carat weight, clarity, color, certification, metal type, and more. Upload multiple images and detailed descriptions for each piece.",
    },
    {
      question: "How do video requests work?",
      answer:
        "When customers view your shared catalog, they can request videos of specific products. You'll receive notifications with customer details and can update the request status (pending, fulfilled, declined). Communicate directly via email or WhatsApp.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Absolutely. We use enterprise-grade security with encrypted data storage, secure authentication, and session management. You control who sees what with granular permissions and share link expiry dates. All communications are encrypted.",
    },
    {
      question: "Can I track customer engagement?",
      answer:
        "Yes! Get detailed analytics on catalog views, popular products, customer interests, video requests, and custom orders. See which products generate the most engagement and make data-driven decisions for your inventory.",
    },
    {
      question: "Do you offer import/export features?",
      answer:
        "Yes, you can import products in bulk using Excel/CSV files and export your catalog data, customer inquiries, and analytics reports. Perfect for integrating with your existing inventory management systems.",
    },
    {
      question: "What's the pricing model?",
      answer:
        "We offer flexible plans based on your business size and needs. Start with a free trial to explore all features. Visit our pricing page for detailed plan comparisons and choose what works best for your jewelry business.",
    },
  ];

  const features = [
    {
      icon: Gem,
      title: "Comprehensive Catalog Management",
      description:
        "Manage your entire jewelry inventory including loose diamonds, gemstones, and finished jewelry pieces with detailed specifications.",
      gradient: "from-jewellery-from to-jewellery-to",
    },
    {
      icon: Share2,
      title: "Smart Catalog Sharing",
      description:
        "Create shareable catalogs with custom pricing (markup/markdown) and expiry dates. Track views and engagement in real-time.",
      gradient: "from-gemstone-from to-gemstone-to",
    },
    {
      icon: Video,
      title: "Video Request Management",
      description:
        "Receive and manage video requests from customers. Update status and communicate directly via email or WhatsApp.",
      gradient: "from-diamond-from to-diamond-to",
    },
    {
      icon: ShoppingBag,
      title: "Custom Order Tracking",
      description:
        "Handle custom jewelry orders with design descriptions, budget tracking, and reference images. Manage entire workflow from request to fulfillment.",
      gradient: "from-jewellery-from to-jewellery-to",
    },
    {
      icon: Heart,
      title: "Product Interest Analytics",
      description:
        "Track customer interests in specific products. Collect contact details and notes to follow up effectively.",
      gradient: "from-gemstone-from to-gemstone-to",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description:
        "Add team members with granular permissions. Control access to catalog, products, sharing, and customer data.",
      gradient: "from-diamond-from to-diamond-to",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description:
        "Get insights into catalog performance, customer engagement, popular products, and sales trends with visual dashboards.",
      gradient: "from-jewellery-from to-jewellery-to",
    },
    {
      icon: Shield,
      title: "Secure Session Management",
      description:
        "Control active sessions with device tracking, IP monitoring, and remote session termination for enhanced security.",
      gradient: "from-gemstone-from to-gemstone-to",
    },
  ];

  const benefits = [
    { icon: Zap, text: "Lightning-fast catalog updates" },
    { icon: Link2, text: "Shareable links with custom pricing" },
    { icon: Bell, text: "Real-time customer notifications" },
    { icon: Sparkles, text: "Premium jewelry-focused interface" },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
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
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border-2 border-primary/30 bg-primary/5 px-6 py-3 text-sm backdrop-blur-sm animate-fade-in">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                <span className="font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Professional Jewelry Catalog Management
                </span>
              </div>
              <h1 className="mb-8 text-6xl font-bold tracking-tight sm:text-7xl lg:text-8xl animate-fade-in" style={{ animationDelay: "0.1s" }}>
                Manage & Share Your
                <span className="block mt-2 bg-gradient-to-r from-jewellery-from via-gemstone-from to-diamond-from bg-clip-text text-transparent animate-gradient">
                  Jewelry Collection
                </span>
              </h1>
              <p className="mb-12 text-xl text-muted-foreground sm:text-2xl leading-relaxed animate-fade-in" style={{ animationDelay: "0.2s" }}>
                The complete platform for jewelry vendors to showcase inventory, share catalogs with custom pricing, and
                manage customer inquiries seamlessly.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <Button 
                  size="lg" 
                  className="group h-14 gap-2 px-10 text-lg font-semibold shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 bg-gradient-to-r from-primary to-accent" 
                  onClick={() => navigate("/catalog")}
                >
                  Get Started Free
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-14 px-10 text-lg font-semibold border-2 hover:bg-primary/5 transition-all duration-300" 
                  onClick={() => navigate("/auth")}
                >
                  Sign In
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 3D Viewer Section */}
      <section className="container mx-auto px-4 py-24">
        <ScrollReveal>
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-5xl font-bold font-serif bg-gradient-to-r from-jewellery-from via-gemstone-from to-diamond-from bg-clip-text text-transparent">
              Experience Jewelry in 3D
            </h2>
            <p className="text-2xl text-muted-foreground max-w-2xl mx-auto">
              Interactive 3D viewer for showcasing your finest pieces
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <div className="mx-auto max-w-5xl">
            <Suspense fallback={
              <div className="h-[500px] w-full rounded-2xl overflow-hidden border-2 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                  <Gem className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
                  <p className="text-muted-foreground">Loading 3D Viewer...</p>
                </div>
              </div>
            }>
              <JewelryViewer3D />
            </Suspense>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Click and drag to rotate • Scroll to zoom • Auto-rotate enabled
            </p>
          </div>
        </ScrollReveal>
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

      {/* Brand Logos Carousel */}
      <section className="container mx-auto px-4 py-16">
        <ScrollReveal>
          <div className="mb-8 text-center">
            <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Trusted by Leading Jewelry Brands
            </p>
          </div>
          <BrandLogosCarousel />
        </ScrollReveal>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-24">
        <ScrollReveal>
          <div className="mb-20 text-center">
            <h2 className="mb-6 text-5xl font-bold font-serif bg-gradient-to-r from-jewellery-from via-gemstone-from to-diamond-from bg-clip-text text-transparent">
              Powerful Features for Jewelry Vendors
            </h2>
            <p className="text-2xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage and grow your jewelry business
            </p>
          </div>
        </ScrollReveal>

        {/* Feature Showcase with Images */}
        <ScrollReveal delay={0.1}>
          <div className="mb-16 grid gap-8 lg:grid-cols-2">
            <ParallaxImage
              src={catalogFeature}
              alt="Digital catalog on devices"
              className="relative overflow-hidden rounded-2xl border-2"
              speed={0.3}
            />
            <div className="flex flex-col justify-center space-y-6">
              <ScrollReveal delay={0.2} direction="right">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-jewellery-from to-jewellery-to shadow-lg">
                    <AnimatedIcon icon={Share2} className="h-7 w-7 text-white" animation="rotate" delay={0.2} />
                  </div>
                  <div>
                    <h3 className="mb-3 text-3xl font-bold font-serif">Smart Catalog Sharing</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      Create stunning digital catalogs accessible on any device. Share with custom pricing, track
                      engagement, and manage everything from a single dashboard. Perfect for B2B and retail customers.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.3} direction="right">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gemstone-from to-gemstone-to shadow-lg">
                    <AnimatedIcon icon={Gem} className="h-7 w-7 text-white" animation="pulse" delay={0.3} />
                  </div>
                  <div>
                    <h3 className="mb-3 text-3xl font-bold font-serif">Complete Inventory Control</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      Manage diamonds, gemstones, and jewelry with detailed specifications. Upload multiple high-quality
                      images, track stock levels, and update pricing instantly across all shared catalogs.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mb-16 grid gap-8 lg:grid-cols-2">
            <div className="order-2 lg:order-1 flex flex-col justify-center space-y-6">
              <ScrollReveal delay={0.2} direction="left">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-diamond-from to-diamond-to">
                    <AnimatedIcon icon={BarChart3} className="h-6 w-6 text-white" animation="scale" delay={0.2} />
                  </div>
                  <div>
                    <h3 className="mb-2 text-2xl font-bold">Advanced Analytics</h3>
                    <p className="text-muted-foreground">
                      Get real-time insights into catalog performance, customer engagement, and popular products. Make
                      data-driven decisions with comprehensive dashboards and visual reports.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.3} direction="left">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-jewellery-from via-gemstone-from to-diamond-from">
                    <AnimatedIcon icon={Users} className="h-6 w-6 text-white" animation="bounce" delay={0.3} />
                  </div>
                  <div>
                    <h3 className="mb-2 text-2xl font-bold">Team Collaboration</h3>
                    <p className="text-muted-foreground">
                      Scale your business with multi-user access. Set granular permissions for team members, track
                      activities, and maintain full control over who can view and manage your inventory.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
            <ParallaxImage
              src={analyticsFeature}
              alt="Analytics dashboard"
              className="order-1 lg:order-2 relative overflow-hidden rounded-2xl border-2"
              speed={0.3}
            />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <ScrollReveal key={index} delay={0.1 * index} direction="up">
                <TiltCard maxTilt={8} scale={1.05}>
                  <Card className="group relative overflow-hidden border-2 h-full transition-all hover:shadow-lg hover:shadow-primary/10">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity group-hover:opacity-5`}
                    />
                    <CardHeader>
                      <div
                        className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${feature.gradient}`}
                      >
                        <AnimatedIcon 
                          icon={feature.icon} 
                          className="h-6 w-6 text-white" 
                          animation={index % 4 === 0 ? "pulse" : index % 4 === 1 ? "rotate" : index % 4 === 2 ? "bounce" : "scale"}
                          delay={0.1 * index}
                        />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">{feature.description}</CardDescription>
                    </CardContent>
                  </Card>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </ScrollReveal>
      </section>

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

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-3xl">
          <ScrollReveal>
            <div className="mb-16 text-center">
              <h2 className="mb-6 text-5xl font-bold font-serif bg-gradient-to-r from-jewellery-from via-gemstone-from to-diamond-from bg-clip-text text-transparent">
                Frequently Asked Questions
              </h2>
              <p className="text-2xl text-muted-foreground">
                Everything you need to know about the platform
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-lg font-semibold">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollReveal>
        </div>
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
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-16">
          <ScrollReveal>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-jewellery-from to-diamond-from">
                  <Gem className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">Jewelry Catalog</span>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                Professional jewelry inventory management with shareable catalogs and custom pricing for modern vendors.
              </p>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border bg-background transition-colors hover:bg-accent"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border bg-background transition-colors hover:bg-accent"
                >
                  <Twitter className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border bg-background transition-colors hover:bg-accent"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border bg-background transition-colors hover:bg-accent"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="mb-4 font-semibold">Product</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="transition-colors hover:text-foreground">
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="transition-colors hover:text-foreground"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/pricing");
                    }}
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-foreground">
                    Demo
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-foreground">
                    Analytics
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="transition-colors hover:text-foreground"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/diamond-calculator");
                    }}
                  >
                    Diamond Calculator
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-foreground">
                    Security
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="mb-4 font-semibold">Company</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="transition-colors hover:text-foreground"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/about");
                    }}
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-foreground">
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="transition-colors hover:text-foreground"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/blog");
                    }}
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="transition-colors hover:text-foreground"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/press");
                    }}
                  >
                    Press
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="transition-colors hover:text-foreground"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/demo");
                    }}
                  >
                    Demo
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-foreground">
                    Partners
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="mb-4 font-semibold">Contact</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0" />
                  <a href="mailto:support@jewelrycatalog.com" className="transition-colors hover:text-foreground">
                    support@jewelrycatalog.com
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0" />
                  <a href="tel:+1234567890" className="transition-colors hover:text-foreground">
                    +1 (234) 567-890
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>Mumbai, Maharashtra, India</span>
                </li>
                <li>
                  <a
                    href="#"
                    className="transition-colors hover:text-foreground"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/contact");
                    }}
                  >
                    Contact Form →
                  </a>
                </li>
              </ul>
            </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="mt-12 border-t pt-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-muted-foreground">© 2024 Jewelry Catalog. All rights reserved.</p>
              <div className="flex gap-6 text-sm text-muted-foreground">
                <a href="#" className="transition-colors hover:text-foreground">
                  Privacy Policy
                </a>
                <a href="#" className="transition-colors hover:text-foreground">
                  Terms of Service
                </a>
                <a href="#" className="transition-colors hover:text-foreground">
                  Cookie Policy
                </a>
              </div>
            </div>
            </div>
          </ScrollReveal>
        </div>
      </footer>

      {/* Floating Components */}
      <ThemeSwitcher />
      <WhatsAppButton />
      <CookieConsent />
      {showScratchCard && <ScratchCard onClose={() => setShowScratchCard(false)} />}
    </div>
  );
};

export default Index;
