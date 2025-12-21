import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SEOHead } from "@/components/SEOHead";
import { StructuredData } from "@/components/StructuredData";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  HelpCircle, Search, Gem, Calculator, Users, Shield, 
  CreditCard, Share2, ArrowRight, MessageCircle 
} from "lucide-react";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";

const FAQ = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const faqCategories = [
    {
      id: "platform",
      name: "Platform & Features",
      icon: Gem,
      faqs: [
        {
          question: "What is Cataleon and who is it for?",
          answer: "Cataleon is a professional jewelry catalog management platform designed for jewelry vendors, wholesalers, and retailers. It helps you manage inventory, create shareable catalogs with custom pricing, track customer inquiries, and calculate accurate diamond prices. Whether you deal in loose diamonds, gemstones, or finished jewelry, Cataleon streamlines your B2B operations."
        },
        {
          question: "How does the catalog sharing work?",
          answer: "Create a shareable link with custom pricing (markup or markdown), set an expiry date, and share it with your clients. You can track views, customer interests, and video requests all from your dashboard. Each link is unique and can be customized for different client segments. Clients can browse, add to wishlist, and submit inquiries directly through the shared catalog."
        },
        {
          question: "What types of jewelry can I manage?",
          answer: "Our platform supports loose diamonds, gemstones, and finished jewelry pieces. Each category has specialized fields for specifications like carat weight, clarity, color, cut grade, certification, metal type, and more. Upload multiple images and detailed descriptions for each piece. The system auto-categorizes products and supports bulk imports via Excel/CSV."
        },
        {
          question: "How do video requests work?",
          answer: "When customers view your shared catalog, they can request videos of specific products they're interested in. You'll receive notifications with customer details and can update the request status (pending, fulfilled, declined). You can communicate directly via email or WhatsApp, and track all video request history in your dashboard."
        },
        {
          question: "Do you offer import/export features?",
          answer: "Yes, you can import products in bulk using Excel/CSV files with automatic column mapping. Export your catalog data, customer inquiries, analytics reports, and more. Perfect for integrating with your existing inventory management systems or migrating from other platforms."
        }
      ]
    },
    {
      id: "calculators",
      name: "Calculators & Tools",
      icon: Calculator,
      faqs: [
        {
          question: "How does the Diamond Price Calculator work?",
          answer: "Our advanced diamond calculator uses Rapaport-based pricing to estimate diamond values. Input the 4Cs (Carat weight, Cut grade, Color grade, Clarity grade) and select the diamond shape. The calculator instantly provides price estimates and allows you to apply custom discounts or markups. Compare up to 4 diamonds side-by-side. Authenticated users get unlimited calculations."
        },
        {
          question: "What is the Diamond Sizing Chart used for?",
          answer: "The Diamond Sizing Chart helps you visualize diamond dimensions across all shapes and carat weights. Compare sizes, see millimeter measurements, and understand how different shapes look at various carat weights. Features include interactive 3D viewing, ring finger overlay preview, and multi-shape comparison mode."
        },
        {
          question: "How do I use the Diamond Sieve Chart?",
          answer: "The Sieve Chart is a comprehensive reference for diamond sieve sizes. Look up the relationship between sieve numbers, mm dimensions, carat weights, and number of stones per carat. Includes a total carat weight calculator for multiple stones and MM-to-carat conversion tools. Essential for sorting and pricing melee diamonds."
        },
        {
          question: "What is the Manufacturing Cost Estimator?",
          answer: "The Estimate Generator helps you create detailed manufacturing cost estimates for jewelry. Calculate complete costs including gold, diamonds, gemstones, making charges, CAD design, camming/casting, and certification. Add profit margins, GST calculations, and generate professional PDF quotes. Save estimates and share tracking links with customers."
        },
        {
          question: "How do I generate professional invoices?",
          answer: "Use the Invoice Generator to create professional invoices for completed orders. Features include automatic invoice numbering, multi-item line items, GST/tax calculations (SGST/CGST or IGST), payment terms, and professional PDF export. You can also email invoices directly to customers and track payment status."
        }
      ]
    },
    {
      id: "team",
      name: "Team & Collaboration",
      icon: Users,
      faqs: [
        {
          question: "Can I manage multiple team members?",
          answer: "Yes! Add team members with granular permissions. Control who can view catalogs, add products, manage share links, handle custom orders, access analytics, and more. Use permission presets for quick role assignment. Perfect for businesses with sales teams or multiple locations."
        },
        {
          question: "How does session management work?",
          answer: "Cataleon includes enterprise-grade session management. View all active sessions, see device information and IP addresses, and remotely log out sessions if needed. Set maximum concurrent sessions per plan and get alerts for suspicious login activity."
        },
        {
          question: "Can team members share catalogs independently?",
          answer: "Based on permissions, team members can create their own share links with custom pricing. All activity is tracked and visible to admins. You can set limits on how many share links each team member can create and monitor their catalog performance."
        }
      ]
    },
    {
      id: "security",
      name: "Security & Privacy",
      icon: Shield,
      faqs: [
        {
          question: "Is my data secure?",
          answer: "Absolutely. We use enterprise-grade security with encrypted data storage, secure authentication, and comprehensive session management. All data is stored on secure cloud infrastructure with regular backups. You control who sees what with granular permissions and share link expiry dates."
        },
        {
          question: "How are share links protected?",
          answer: "Each share link has a unique token and can be set to expire after a specific date. You can deactivate links at any time. Links can be configured to show or hide vendor details and pricing. All link access is logged with viewer information."
        },
        {
          question: "Do you comply with data privacy regulations?",
          answer: "Yes, Cataleon is designed with privacy in mind. We provide clear privacy policies, cookie consent management, and data export capabilities. Customer data is protected and you maintain full control over what information is collected and shared."
        }
      ]
    },
    {
      id: "pricing",
      name: "Pricing & Plans",
      icon: CreditCard,
      faqs: [
        {
          question: "What's the pricing model?",
          answer: "We offer flexible plans based on your business size and needs. Plans include Starter for small businesses, Essentials for growing teams, Professional for established vendors, and Enterprise for large operations. Each plan has different limits for products, team members, and share links. Visit our pricing page for details."
        },
        {
          question: "Is there a free trial?",
          answer: "Yes! New users can explore the platform with limited features before committing to a paid plan. The calculator tools are accessible with generous daily limits even for guests. Sign up to unlock full features and higher limits."
        },
        {
          question: "Can I upgrade or downgrade my plan?",
          answer: "Yes, you can change your plan at any time. Upgrades take effect immediately with prorated billing. Downgrades take effect at the next billing cycle. Contact our support team if you need help choosing the right plan for your business."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards, debit cards, and UPI payments. Enterprise customers can also pay via bank transfer or cheque. All payments are processed securely through trusted payment gateways."
        }
      ]
    },
    {
      id: "sharing",
      name: "Sharing & Analytics",
      icon: Share2,
      faqs: [
        {
          question: "Can I track customer engagement?",
          answer: "Yes! Get detailed analytics on catalog views, popular products, customer interests, video requests, and custom orders. See which products generate the most engagement, track conversion rates, and make data-driven decisions for your inventory. Analytics include geographic data and time-based trends."
        },
        {
          question: "How does custom pricing work in shared catalogs?",
          answer: "When creating a share link, you can apply a markup or markdown percentage to all products. This allows you to share the same catalog with different pricing for different client tiers. The original pricing is never visible to customers - they only see the adjusted prices."
        },
        {
          question: "Can customers place orders through the catalog?",
          answer: "Customers can express interest in products, request videos, submit custom order inquiries, and add items to wishlists. All these interactions are tracked in your dashboard. For actual orders, you'll communicate directly with customers through the contact information they provide."
        },
        {
          question: "How do I manage customer inquiries?",
          answer: "All customer inquiries, interests, video requests, and custom orders are centralized in your dashboard. Filter by status, date, or product. Mark items as contacted, fulfilled, or closed. Export inquiry data for follow-up in your CRM. Get notifications for new inquiries."
        }
      ]
    }
  ];

  // Flatten all FAQs for search and structured data
  const allFaqs = useMemo(() => {
    return faqCategories.flatMap(category => 
      category.faqs.map(faq => ({ ...faq, category: category.name, categoryId: category.id }))
    );
  }, []);

  // Filter FAQs based on search and category
  const filteredFaqs = useMemo(() => {
    let faqs = allFaqs;
    
    if (activeCategory !== "all") {
      faqs = faqs.filter(faq => faq.categoryId === activeCategory);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      faqs = faqs.filter(faq => 
        faq.question.toLowerCase().includes(query) || 
        faq.answer.toLowerCase().includes(query)
      );
    }
    
    return faqs;
  }, [allFaqs, activeCategory, searchQuery]);

  // FAQ Schema for structured data
  const faqSchema = {
    type: "FAQPage" as const,
    questions: allFaqs.map(faq => ({
      question: faq.question,
      answer: faq.answer
    }))
  };

  // Breadcrumb schema
  const breadcrumbSchema = {
    type: "BreadcrumbList" as const,
    items: [
      { name: "Home", url: "https://cataleon.io/" },
      { name: "FAQ", url: "https://cataleon.io/faq" }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      {/* SEO Meta Tags */}
      <SEOHead
        title="FAQ - Frequently Asked Questions | Cataleon Jewelry Platform"
        description="Find answers to common questions about Cataleon's jewelry catalog management platform. Learn about diamond calculators, catalog sharing, pricing, team management, and security features."
        keywords="jewelry catalog FAQ, diamond calculator help, jewelry platform questions, Cataleon support, jewelry B2B FAQ, diamond pricing questions"
        canonicalUrl="/faq"
      />
      
      {/* Structured Data */}
      <StructuredData data={[faqSchema, breadcrumbSchema]} />

      <Header />
      
      {/* Breadcrumb Navigation */}
      <div className="container mx-auto px-4 pt-4">
        <BreadcrumbNav />
      </div>
      
      {/* Hero Section */}
      <section className="relative border-b bg-gradient-to-b from-primary/5 via-background to-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm mb-6">
                <HelpCircle className="h-4 w-4 text-primary" />
                <span className="text-primary font-medium">Help Center</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Frequently Asked Questions
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Find answers to common questions about Cataleon's jewelry catalog management platform, 
                diamond calculators, and business tools.
              </p>
              
              {/* Search Bar */}
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg"
                />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        {/* Category Filters */}
        <ScrollReveal>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <Button
              variant={activeCategory === "all" ? "default" : "outline"}
              onClick={() => setActiveCategory("all")}
              className="gap-2"
            >
              All Questions
              <Badge variant="secondary" className="ml-1">{allFaqs.length}</Badge>
            </Button>
            {faqCategories.map(category => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                onClick={() => setActiveCategory(category.id)}
                className="gap-2"
              >
                <category.icon className="h-4 w-4" />
                {category.name}
              </Button>
            ))}
          </div>
        </ScrollReveal>

        {/* FAQ Content */}
        {searchQuery || activeCategory !== "all" ? (
          // Flat list for search results or single category
          <ScrollReveal>
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  {searchQuery ? `Search Results (${filteredFaqs.length})` : faqCategories.find(c => c.id === activeCategory)?.name}
                </CardTitle>
                {searchQuery && (
                  <CardDescription>
                    Showing results for "{searchQuery}"
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {filteredFaqs.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {filteredFaqs.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">
                          <div className="flex flex-col items-start gap-1">
                            <span>{faq.question}</span>
                            {searchQuery && activeCategory === "all" && (
                              <Badge variant="outline" className="text-xs">{faq.category}</Badge>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>No questions found matching your search.</p>
                    <Button 
                      variant="link" 
                      onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
                    >
                      Clear search
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </ScrollReveal>
        ) : (
          // Categorized view
          <div className="space-y-8 max-w-4xl mx-auto">
            {faqCategories.map((category, catIndex) => (
              <ScrollReveal key={category.id} delay={catIndex * 0.1}>
                <Card>
                  <CardHeader className="bg-muted/30 border-b">
                    <CardTitle className="flex items-center gap-2">
                      <category.icon className="h-5 w-5 text-primary" />
                      {category.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <Accordion type="single" collapsible className="w-full">
                      {category.faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`${category.id}-${index}`}>
                          <AccordionTrigger className="text-left">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground leading-relaxed">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        )}

        {/* Still Have Questions CTA */}
        <ScrollReveal delay={0.3}>
          <Card className="max-w-4xl mx-auto mt-12 bg-gradient-to-br from-primary/5 via-background to-accent/5 border-2">
            <CardContent className="p-8 text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-2">Still Have Questions?</h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Can't find what you're looking for? Our support team is here to help you get the most out of Cataleon.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => navigate("/contact")} className="gap-2">
                  Contact Support
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => navigate("/pricing")}>
                  View Pricing Plans
                </Button>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
