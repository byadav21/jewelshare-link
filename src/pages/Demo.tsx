import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play, CheckCircle2, Video } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

const Demo = () => {
  const navigate = useNavigate();

  const features = [
    "Upload and organize your jewelry catalog",
    "Share catalogs with custom pricing",
    "Track customer interests and inquiries",
    "Manage custom orders seamlessly",
    "Analytics and insights dashboard",
    "Team collaboration features",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-16">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          
          <div className="text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm">
              <Video className="h-4 w-4 text-category-jewellery" />
              <span className="text-muted-foreground">Product Walkthrough</span>
            </div>
            <h1 className="mb-4 text-5xl font-bold tracking-tight">
              See JewelCatalog Pro in Action
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              Watch our comprehensive 3-minute walkthrough to discover how our platform transforms jewelry catalog management
            </p>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="container mx-auto px-4 py-16">
        <ScrollReveal>
          <Card className="overflow-hidden border-2 border-category-jewellery/20">
            <CardContent className="p-0">
              <div className="relative aspect-video w-full bg-gradient-to-br from-card to-muted">
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                  <div className="rounded-full bg-category-jewellery/10 p-8">
                    <Play className="h-16 w-16 text-category-jewellery" />
                  </div>
                  <div className="text-center">
                    <h3 className="mb-2 text-2xl font-bold">
                      Platform Walkthrough Video
                    </h3>
                    <p className="text-muted-foreground">
                      3 minutes • Comprehensive overview
                    </p>
                  </div>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-category-jewellery to-category-gemstone"
                    onClick={() => {
                      // Placeholder for video play functionality
                    }}
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Watch Demo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Note: Interactive demo video coming soon. Contact our sales team for a personalized walkthrough.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* What You'll Learn */}
      <section className="container mx-auto px-4 py-16">
        <ScrollReveal>
          <h2 className="mb-12 text-center text-3xl font-bold">
            What You'll Learn
          </h2>
        </ScrollReveal>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <ScrollReveal key={index} delay={index * 0.1}>
              <Card className="group transition-all hover:border-category-jewellery hover:shadow-lg">
                <CardContent className="flex items-start gap-4 p-6">
                  <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-category-jewellery" />
                  <p className="text-lg">{feature}</p>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Key Benefits */}
      <section className="border-t py-16">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="mb-12 text-center text-3xl font-bold">
              Key Platform Benefits
            </h2>
          </ScrollReveal>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Save Time",
                description: "Reduce catalog management time by 60% with automated features",
                gradient: "from-category-jewellery to-category-gemstone",
              },
              {
                title: "Increase Sales",
                description: "Share professional catalogs that convert browsers into buyers",
                gradient: "from-category-gemstone to-category-diamond",
              },
              {
                title: "Scale Easily",
                description: "Grow from hundreds to thousands of products effortlessly",
                gradient: "from-category-diamond to-category-jewellery",
              },
            ].map((benefit, index) => (
              <ScrollReveal key={index} delay={index * 0.1}>
                <Card className="relative overflow-hidden border-2 transition-all hover:shadow-xl">
                  <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-5`} />
                  <CardContent className="relative p-8 text-center">
                    <h3 className="mb-4 text-2xl font-bold">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t py-16">
        <div className="container mx-auto px-4 text-center">
          <ScrollReveal>
            <h2 className="mb-4 text-3xl font-bold">Ready to Get Started?</h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Start your free trial today or schedule a personalized demo with our team
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="bg-gradient-to-r from-category-jewellery to-category-gemstone"
                onClick={() => navigate("/auth")}
              >
                Start Free Trial
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/contact")}
              >
                Schedule a Demo
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default Demo;