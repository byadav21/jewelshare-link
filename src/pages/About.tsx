import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import {
  Target, 
  Users, 
  Heart, 
  Award,
  Gem,
  TrendingUp,
  Shield,
  Sparkles,
  Linkedin,
  Twitter,
  Mail
} from "lucide-react";

const About = () => {
  const navigate = useNavigate();

  const values = [
    {
      icon: Heart,
      title: "Customer First",
      description: "We prioritize our customers' success and build features that truly solve their business challenges."
    },
    {
      icon: Shield,
      title: "Trust & Security",
      description: "Your data security is paramount. We maintain the highest standards of protection and privacy."
    },
    {
      icon: Sparkles,
      title: "Innovation",
      description: "We continuously innovate to provide cutting-edge solutions for the jewelry industry."
    },
    {
      icon: TrendingUp,
      title: "Growth Partnership",
      description: "Your growth is our success. We're committed to helping your business scale and thrive."
    }
  ];

  const team = [
    {
      name: "Vikram Shah",
      role: "CEO & Founder",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram",
      bio: "15+ years in jewelry technology and B2B solutions",
      social: { linkedin: "#", twitter: "#", email: "vikram@jewelrycatalog.com" }
    },
    {
      name: "Priya Desai",
      role: "Chief Technology Officer",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
      bio: "Former tech lead at major e-commerce platforms",
      social: { linkedin: "#", twitter: "#", email: "priya@jewelrycatalog.com" }
    },
    {
      name: "Rajesh Kumar",
      role: "Head of Product",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh",
      bio: "Expert in jewelry industry digital transformation",
      social: { linkedin: "#", twitter: "#", email: "rajesh@jewelrycatalog.com" }
    },
    {
      name: "Anita Sharma",
      role: "Customer Success Lead",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anita",
      bio: "Passionate about empowering jewelry vendors worldwide",
      social: { linkedin: "#", twitter: "#", email: "anita@jewelrycatalog.com" }
    }
  ];

  const stats = [
    { number: "2020", label: "Founded" },
    { number: "500+", label: "Active Vendors" },
    { number: "15K+", label: "Products Managed" },
    { number: "98%", label: "Satisfaction Rate" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-6">
        <BackToHomeButton />
      </div>
      
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-jewellery-from/10 via-gemstone-from/10 to-diamond-from/10 py-24">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="mx-auto max-w-3xl text-center">
              <Badge className="mb-4 gap-1.5 px-4 py-1.5" variant="secondary">
                <Users className="h-3.5 w-3.5" />
                About Us
              </Badge>
              <h1 className="mb-6 text-5xl font-bold">
                Revolutionizing Jewelry Business Management
              </h1>
              <p className="text-xl text-muted-foreground">
                We're on a mission to empower jewelry vendors with modern tools that simplify inventory management, 
                enhance customer engagement, and drive business growth.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="container mx-auto px-4 py-24">
        <div className="grid gap-12 lg:grid-cols-2">
          <ScrollReveal>
            <Card className="border-2 p-8">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-jewellery-from to-jewellery-to">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h2 className="mb-4 text-3xl font-bold">Our Mission</h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                To transform how jewelry vendors manage, showcase, and sell their products by providing 
                intuitive, powerful tools that bridge the gap between traditional craftsmanship and modern technology. 
                We believe every jewelry business, regardless of size, deserves access to enterprise-level solutions.
              </p>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <Card className="border-2 p-8">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gemstone-from to-gemstone-to">
                <Gem className="h-8 w-8 text-white" />
              </div>
              <h2 className="mb-4 text-3xl font-bold">Our Vision</h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                To become the global standard for jewelry catalog management, trusted by vendors worldwide. 
                We envision a future where every jewelry piece can be showcased beautifully, shared instantly, 
                and purchased seamlessly, connecting artisans with customers across borders and cultures.
              </p>
            </Card>
          </ScrollReveal>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <ScrollReveal key={index} delay={0.1 * index}>
                <div className="text-center">
                  <div className="mb-2 text-5xl font-bold text-primary">{stat.number}</div>
                  <p className="text-lg text-muted-foreground">{stat.label}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="container mx-auto px-4 py-24">
        <ScrollReveal>
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold">Our Core Values</h2>
            <p className="text-xl text-muted-foreground">
              The principles that guide everything we do
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {values.map((value, index) => (
            <ScrollReveal key={index} delay={0.1 * index}>
              <Card className="border-2 p-6 text-center transition-all hover:shadow-lg">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
                  <value.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-3 text-xl font-semibold">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="border-t bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-4xl font-bold">Meet Our Team</h2>
              <p className="text-xl text-muted-foreground">
                Passionate professionals dedicated to your success
              </p>
            </div>
          </ScrollReveal>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {team.map((member, index) => (
              <ScrollReveal key={index} delay={0.1 * index}>
                <Card className="overflow-hidden border-2 transition-all hover:shadow-xl">
                  <CardContent className="p-6 text-center">
                    <Avatar className="mx-auto mb-4 h-32 w-32 border-4 border-primary/10">
                      <AvatarImage src={member.image} alt={member.name} />
                      <AvatarFallback className="text-2xl">{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <h3 className="mb-1 text-xl font-semibold">{member.name}</h3>
                    <p className="mb-3 text-sm font-medium text-primary">{member.role}</p>
                    <p className="mb-4 text-sm text-muted-foreground">{member.bio}</p>
                    <div className="flex justify-center gap-2">
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <Linkedin className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <Twitter className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t py-24">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="mx-auto max-w-3xl text-center">
              <Award className="mx-auto mb-6 h-16 w-16 text-primary" />
              <h2 className="mb-4 text-4xl font-bold">Join Our Growing Community</h2>
              <p className="mb-8 text-xl text-muted-foreground">
                Be part of the revolution in jewelry business management
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button size="lg" onClick={() => navigate('/auth')}>
                  Get Started Today
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/contact')}>
                  Contact Us
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default About;
