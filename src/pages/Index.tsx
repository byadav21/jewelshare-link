import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { AnimatedCounter } from "@/components/AnimatedCounter";
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
  Star
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const testimonials = [
    {
      name: "Priya Sharma",
      business: "Brilliant Gems & Jewelry",
      role: "Owner",
      content: "This platform transformed how we share our diamond collection with international clients. The custom pricing feature alone has increased our B2B sales by 45%. Video requests help us close deals faster than ever.",
      rating: 5,
      gradient: "from-jewellery-from to-jewellery-to"
    },
    {
      name: "Rajesh Patel",
      business: "Heritage Diamonds",
      role: "Managing Director",
      content: "Managing our inventory of 5,000+ pieces was chaos before. Now everything is organized, shareable, and trackable. The analytics show us which products generate the most interest. Game changer for our wholesale business.",
      rating: 5,
      gradient: "from-gemstone-from to-gemstone-to"
    },
    {
      name: "Anita Desai",
      business: "Luxury Gemstone Gallery",
      role: "Director of Sales",
      content: "The shareable catalog links with expiry dates are brilliant for our seasonal promotions. Our team can manage everything from one place, and customers love how easy it is to browse and request videos of pieces they're interested in.",
      rating: 5,
      gradient: "from-diamond-from to-diamond-to"
    },
    {
      name: "Vikram Singh",
      business: "Royal Jewels Collection",
      role: "CEO",
      content: "We've been using this for 6 months and our customer engagement has doubled. The custom order management system helps us track bespoke jewelry requests perfectly. Our clients appreciate the professional presentation.",
      rating: 5,
      gradient: "from-jewellery-from to-jewellery-to"
    }
  ];


  const features = [
    {
      icon: Gem,
      title: "Comprehensive Catalog Management",
      description: "Manage your entire jewelry inventory including loose diamonds, gemstones, and finished jewelry pieces with detailed specifications.",
      gradient: "from-jewellery-from to-jewellery-to"
    },
    {
      icon: Share2,
      title: "Smart Catalog Sharing",
      description: "Create shareable catalogs with custom pricing (markup/markdown) and expiry dates. Track views and engagement in real-time.",
      gradient: "from-gemstone-from to-gemstone-to"
    },
    {
      icon: Video,
      title: "Video Request Management",
      description: "Receive and manage video requests from customers. Update status and communicate directly via email or WhatsApp.",
      gradient: "from-diamond-from to-diamond-to"
    },
    {
      icon: ShoppingBag,
      title: "Custom Order Tracking",
      description: "Handle custom jewelry orders with design descriptions, budget tracking, and reference images. Manage entire workflow from request to fulfillment.",
      gradient: "from-jewellery-from to-jewellery-to"
    },
    {
      icon: Heart,
      title: "Product Interest Analytics",
      description: "Track customer interests in specific products. Collect contact details and notes to follow up effectively.",
      gradient: "from-gemstone-from to-gemstone-to"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Add team members with granular permissions. Control access to catalog, products, sharing, and customer data.",
      gradient: "from-diamond-from to-diamond-to"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Get insights into catalog performance, customer engagement, popular products, and sales trends with visual dashboards.",
      gradient: "from-jewellery-from to-jewellery-to"
    },
    {
      icon: Shield,
      title: "Secure Session Management",
      description: "Control active sessions with device tracking, IP monitoring, and remote session termination for enhanced security.",
      gradient: "from-gemstone-from to-gemstone-to"
    }
  ];

  const benefits = [
    { icon: Zap, text: "Lightning-fast catalog updates" },
    { icon: Link2, text: "Shareable links with custom pricing" },
    { icon: Bell, text: "Real-time customer notifications" },
    { icon: Sparkles, text: "Premium jewelry-focused interface" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-jewellery-from/5 via-gemstone-from/5 to-diamond-from/5" />
        <div className="container relative mx-auto px-4 py-24 sm:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm">
              <Sparkles className="h-4 w-4 text-jewellery-from" />
              <span className="text-muted-foreground">Professional Jewelry Catalog Management</span>
            </div>
            <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Manage & Share Your
              <span className="block bg-gradient-to-r from-jewellery-from via-gemstone-from to-diamond-from bg-clip-text text-transparent">
                Jewelry Collection
              </span>
            </h1>
            <p className="mb-10 text-xl text-muted-foreground sm:text-2xl">
              The complete platform for jewelry vendors to showcase inventory, share catalogs with custom pricing, and manage customer inquiries seamlessly.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button 
                size="lg" 
                className="group h-12 gap-2 px-8 text-base"
                onClick={() => navigate('/catalog')}
              >
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-12 px-8 text-base"
                onClick={() => navigate('/auth')}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="border-b bg-gradient-to-br from-jewellery-from/5 via-gemstone-from/5 to-diamond-from/5 py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-jewellery-from to-jewellery-to">
                <Gem className="h-6 w-6 text-white" />
              </div>
              <div className="mb-1 text-4xl font-bold">
                <AnimatedCounter end={15000} suffix="+" />
              </div>
              <p className="text-muted-foreground">Products Managed</p>
            </div>
            <div className="text-center">
              <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-gemstone-from to-gemstone-to">
                <Share2 className="h-6 w-6 text-white" />
              </div>
              <div className="mb-1 text-4xl font-bold">
                <AnimatedCounter end={2500} suffix="+" />
              </div>
              <p className="text-muted-foreground">Active Catalogs</p>
            </div>
            <div className="text-center">
              <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-diamond-from to-diamond-to">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div className="mb-1 text-4xl font-bold">
                <AnimatedCounter end={8750} suffix="+" />
              </div>
              <p className="text-muted-foreground">Customer Inquiries</p>
            </div>
            <div className="text-center">
              <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-jewellery-from via-gemstone-from to-diamond-from">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="mb-1 text-4xl font-bold">
                <AnimatedCounter end={98} suffix="%" />
              </div>
              <p className="text-muted-foreground">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-24">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold">Powerful Features for Jewelry Vendors</h2>
          <p className="text-xl text-muted-foreground">Everything you need to manage and grow your jewelry business</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={index} className="group relative overflow-hidden border-2 transition-all hover:shadow-lg">
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity group-hover:opacity-5`} />
              <CardHeader>
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${feature.gradient}`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold">Trusted by Jewelry Vendors Worldwide</h2>
          <p className="text-xl text-muted-foreground">See what our customers say about their experience</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative overflow-hidden border-2 transition-all hover:shadow-lg">
              <div className={`absolute right-0 top-0 h-32 w-32 bg-gradient-to-br ${testimonial.gradient} opacity-5`} />
              <CardHeader>
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="mb-1 text-lg">{testimonial.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {testimonial.role} at <span className="font-medium text-foreground">{testimonial.business}</span>
                    </CardDescription>
                  </div>
                  <Quote className={`h-8 w-8 text-${testimonial.gradient.split('-')[1]}`} />
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-jewellery-from text-jewellery-from" />
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{testimonial.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold">How It Works</h2>
            <p className="text-xl text-muted-foreground">Simple steps to showcase your jewelry collection</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-jewellery-from to-jewellery-to text-2xl font-bold text-white">
                1
              </div>
              <h3 className="mb-3 text-xl font-semibold">Add Your Inventory</h3>
              <p className="text-muted-foreground">
                Upload your diamonds, gemstones, and jewelry pieces with detailed specifications, pricing, and images.
              </p>
            </div>
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gemstone-from to-gemstone-to text-2xl font-bold text-white">
                2
              </div>
              <h3 className="mb-3 text-xl font-semibold">Create Share Links</h3>
              <p className="text-muted-foreground">
                Generate shareable catalog links with custom pricing adjustments and expiry dates for different clients.
              </p>
            </div>
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-diamond-from to-diamond-to text-2xl font-bold text-white">
                3
              </div>
              <h3 className="mb-3 text-xl font-semibold">Manage Inquiries</h3>
              <p className="text-muted-foreground">
                Track customer interests, video requests, and custom orders all in one centralized dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold">Why Choose Our Platform</h2>
            <p className="text-xl text-muted-foreground">Built specifically for jewelry industry professionals</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <benefit.icon className="h-5 w-5 text-primary" />
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
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t py-24">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br from-jewellery-from/10 via-gemstone-from/10 to-diamond-from/10 p-12 text-center">
            <div className="relative z-10">
              <h2 className="mb-4 text-4xl font-bold">Ready to Transform Your Jewelry Business?</h2>
              <p className="mb-8 text-xl text-muted-foreground">
                Join vendors who are already managing their catalogs smarter
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button 
                  size="lg" 
                  className="group h-12 gap-2 px-8 text-base"
                  onClick={() => navigate('/auth')}
                >
                  Start Free Trial
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-12 px-8 text-base"
                  onClick={() => navigate('/catalog')}
                >
                  View Demo Catalog
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
