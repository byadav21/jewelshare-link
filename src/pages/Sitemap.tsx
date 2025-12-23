import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { StructuredData } from "@/components/StructuredData";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Home, Calculator, Gem, Users, FileText, Shield, 
  HelpCircle, Mail, Newspaper, Award, BookOpen,
  Ruler, Grid3X3, GraduationCap, Wrench, Receipt,
  Share2, Heart, BarChart3, Settings, Map
} from "lucide-react";

const Sitemap = () => {
  const siteStructure = [
    {
      category: "Main Pages",
      icon: Home,
      description: "Core pages of the Cataleon platform",
      links: [
        { path: "/", title: "Home", description: "Welcome to Cataleon - Professional jewelry catalog management" },
        { path: "/pricing", title: "Pricing", description: "View our flexible pricing plans for all business sizes" },
        { path: "/about", title: "About Us", description: "Learn about our mission and team" },
        { path: "/contact", title: "Contact", description: "Get in touch with our support team" },
        { path: "/demo", title: "Demo", description: "See Cataleon in action with a live demonstration" },
      ]
    },
    {
      category: "Diamond Tools",
      icon: Calculator,
      description: "Professional calculators and reference charts for diamond pricing",
      links: [
        { path: "/calculators", title: "All Calculators", description: "Browse all available jewelry calculation tools" },
        { path: "/diamond-calculator", title: "Diamond Price Calculator", description: "Calculate diamond values using Rapaport-based pricing with 4Cs" },
        { path: "/diamond-sizing-chart", title: "Diamond Sizing Chart", description: "Visual reference for diamond dimensions across all shapes" },
        { path: "/diamond-sieve-chart", title: "Diamond Sieve Chart", description: "Sieve sizes, MM dimensions, and carat weight reference" },
        { path: "/diamond-education", title: "Diamond Education", description: "Interactive guides for color, clarity, cut, and carat" },
      ]
    },
    {
      category: "Business Tools",
      icon: Wrench,
      description: "Essential tools for jewelry business operations",
      links: [
        { path: "/manufacturing-cost", title: "Manufacturing Cost Estimator", description: "Calculate complete jewelry manufacturing costs" },
        { path: "/invoice-generator", title: "Invoice Generator", description: "Create professional invoices with GST calculations" },
        { path: "/order-tracking", title: "Order Tracking", description: "Track manufacturing orders and delivery status" },
      ]
    },
    {
      category: "Catalog Features",
      icon: Gem,
      badge: "Requires Login",
      description: "Manage and share your jewelry inventory",
      links: [
        { path: "/catalog", title: "Product Catalog", description: "View and manage your complete jewelry inventory" },
        { path: "/add-product", title: "Add Product", description: "Add new diamonds, gemstones, or jewelry pieces" },
        { path: "/import", title: "Bulk Import", description: "Import products from Excel or CSV files" },
        { path: "/share", title: "Share Catalog", description: "Create shareable links with custom pricing" },
        { path: "/interests", title: "Customer Interests", description: "Track customer inquiries and product interests" },
        { path: "/video-requests", title: "Video Requests", description: "Manage customer video request submissions" },
        { path: "/purchase-inquiries", title: "Purchase Inquiries", description: "Handle customer purchase requests" },
      ]
    },
    {
      category: "Account & Team",
      icon: Users,
      badge: "Requires Login",
      description: "Manage your account, team, and preferences",
      links: [
        { path: "/vendor-profile", title: "Vendor Profile", description: "Customize your business profile and branding" },
        { path: "/team-management", title: "Team Management", description: "Add team members and manage permissions" },
        { path: "/vendor-analytics", title: "Analytics Dashboard", description: "View catalog performance and engagement metrics" },
        { path: "/rewards", title: "Rewards Program", description: "Earn points and redeem exclusive rewards" },
        { path: "/wishlist", title: "Wishlist", description: "View and manage saved products" },
      ]
    },
    {
      category: "Content & Resources",
      icon: BookOpen,
      description: "Blog posts, news, and educational content",
      links: [
        { path: "/blog", title: "Blog", description: "Industry insights, tips, and jewelry business guides" },
        { path: "/press", title: "Press & News", description: "Latest announcements and media coverage" },
        { path: "/faq", title: "FAQ", description: "Frequently asked questions about the platform" },
      ]
    },
    {
      category: "Legal & Policies",
      icon: Shield,
      description: "Terms, privacy, and compliance information",
      links: [
        { path: "/privacy-policy", title: "Privacy Policy", description: "How we collect, use, and protect your data" },
        { path: "/terms-of-service", title: "Terms of Service", description: "Terms and conditions for using Cataleon" },
        { path: "/cookie-policy", title: "Cookie Policy", description: "Information about cookies and tracking" },
      ]
    },
    {
      category: "Authentication",
      icon: Shield,
      description: "Account access and security",
      links: [
        { path: "/auth", title: "Sign In / Sign Up", description: "Access your Cataleon account or create a new one" },
        { path: "/reset-password", title: "Reset Password", description: "Recover access to your account" },
      ]
    },
  ];

  // Structured data for the sitemap
  const sitemapSchema = {
    type: "WebSite" as const,
    name: "Cataleon",
    url: "https://cataleon.io",
    description: "Professional jewelry catalog management platform",
  };

  const breadcrumbSchema = {
    type: "BreadcrumbList" as const,
    items: [
      { name: "Home", url: "https://cataleon.io/" },
      { name: "Sitemap", url: "https://cataleon.io/sitemap" }
    ]
  };

  // Count total links
  const totalLinks = siteStructure.reduce((acc, section) => acc + section.links.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Sitemap - Navigate Cataleon | Complete Site Directory"
        description="Explore the complete Cataleon sitemap. Find all pages including diamond calculators, jewelry catalog tools, pricing, blog, FAQ, and more. Easy navigation for users and search engines."
        keywords="Cataleon sitemap, jewelry platform navigation, diamond calculator pages, jewelry catalog sitemap, site directory"
        canonicalUrl="/sitemap"
      />
      
      <StructuredData data={[sitemapSchema, breadcrumbSchema]} />

      <Header />
      
      <div className="container mx-auto px-4 pt-4">
        <BreadcrumbNav />
      </div>

      {/* Hero Section */}
      <section className="relative border-b bg-gradient-to-b from-primary/5 via-background to-background py-16 md:py-20">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm mb-6">
                <Map className="h-4 w-4 text-primary" />
                <span className="text-primary font-medium">Site Navigation</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Sitemap
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-4">
                Explore all {totalLinks}+ pages and features of the Cataleon platform. 
                Find diamond calculators, catalog tools, resources, and more.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                <Badge variant="secondary" className="text-sm">
                  {siteStructure.length} Categories
                </Badge>
                <Badge variant="secondary" className="text-sm">
                  {totalLinks} Pages
                </Badge>
                <Badge variant="outline" className="text-sm">
                  Updated: {new Date().toLocaleDateString()}
                </Badge>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Sitemap Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2">
          {siteStructure.map((section, sectionIndex) => (
            <ScrollReveal key={section.category} delay={sectionIndex * 0.05}>
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
                        <section.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{section.category}</CardTitle>
                        {section.badge && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {section.badge}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary">{section.links.length}</Badge>
                  </div>
                  <CardDescription className="mt-2">
                    {section.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {section.links.map((link) => (
                      <li key={link.path}>
                        <Link
                          to={link.path}
                          className="group block rounded-lg p-3 -mx-3 transition-colors hover:bg-muted/50"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                                {link.title}
                              </span>
                              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                                {link.description}
                              </p>
                            </div>
                            <span className="text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                              →
                            </span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>

        {/* Quick Access Section */}
        <ScrollReveal delay={0.3}>
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-6">Quick Access</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link 
                to="/diamond-calculator" 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-diamond-from to-diamond-to text-white font-medium hover:opacity-90 transition-opacity"
              >
                <Calculator className="h-4 w-4" />
                Diamond Calculator
              </Link>
              <Link 
                to="/pricing" 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-jewellery-from to-jewellery-to text-white font-medium hover:opacity-90 transition-opacity"
              >
                <Award className="h-4 w-4" />
                View Pricing
              </Link>
              <Link 
                to="/faq" 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-gemstone-from to-gemstone-to text-white font-medium hover:opacity-90 transition-opacity"
              >
                <HelpCircle className="h-4 w-4" />
                FAQ
              </Link>
              <Link 
                to="/contact" 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-primary text-primary font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Mail className="h-4 w-4" />
                Contact Us
              </Link>
            </div>
          </div>
        </ScrollReveal>

        {/* XML Sitemap Link */}
        <ScrollReveal delay={0.4}>
          <div className="mt-12 p-6 rounded-xl bg-muted/50 border text-center">
            <p className="text-muted-foreground mb-2">
              Looking for the XML sitemap for search engines?
            </p>
            <a 
              href="/sitemap.xml" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              View XML Sitemap →
            </a>
          </div>
        </ScrollReveal>
      </main>

      <Footer />
    </div>
  );
};

export default Sitemap;
