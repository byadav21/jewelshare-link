import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ScrollReveal } from "@/components/ScrollReveal";
import { TiltCard } from "@/components/TiltCard";
import { AnimatedIcon } from "@/components/AnimatedIcon";
import { Gem, Palette, Sparkles, Scale, Lightbulb, GraduationCap, ArrowRight, Quote, Star } from "lucide-react";

const educationTopics = [
  {
    icon: Palette,
    title: "Diamond Color",
    description: "Learn how color grades from D to Z affect a diamond's appearance and value.",
    gradient: "from-amber-500 to-yellow-500",
  },
  {
    icon: Sparkles,
    title: "Diamond Clarity",
    description: "Understand inclusions and blemishes, and how they impact diamond clarity grades.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Gem,
    title: "Diamond Cut",
    description: "Discover how cut quality determines a diamond's brilliance and fire.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Scale,
    title: "Carat Weight",
    description: "Explore how carat weight affects size, rarity, and pricing of diamonds.",
    gradient: "from-emerald-500 to-teal-500",
  },
];

const educationTestimonials = [
  {
    name: "Meera Kapoor",
    role: "Training Manager",
    business: "Kapoor Diamonds",
    content: "We use the Diamond Education module to onboard new sales staff. The interactive 4Cs guides reduced our training time by 60% and improved customer consultations significantly.",
    rating: 5,
  },
  {
    name: "Amit Joshi",
    role: "Store Manager",
    business: "Joshi Jewellers",
    content: "The grading quizzes are brilliant for testing our team's knowledge. Our staff confidence in explaining diamond quality to customers has improved dramatically.",
    rating: 5,
  },
  {
    name: "Sunita Agarwal",
    role: "Sales Director",
    business: "Agarwal Gems & Co.",
    content: "The 3D diamond visualizations help our customers understand exactly what they are buying. It has become an essential part of our sales process.",
    rating: 5,
  },
];

export const DiamondEducationPreview = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm">
              <GraduationCap className="h-4 w-4 text-primary" />
              <span className="font-medium text-primary">Learn the 4Cs</span>
            </div>
            <h2 className="mb-6 text-5xl font-bold font-serif bg-gradient-to-r from-jewellery-from via-gemstone-from to-diamond-from bg-clip-text text-transparent">
              Diamond Education
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Master the fundamentals of diamond grading with our comprehensive interactive guides. 
              Understand what makes each diamond unique.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-16">
          {educationTopics.map((topic, index) => (
            <ScrollReveal key={topic.title} delay={index * 0.1}>
              <TiltCard maxTilt={8} scale={1.03}>
                <Card className="h-full border-2 hover:border-primary/30 transition-all duration-300 group cursor-pointer" onClick={() => navigate("/diamond-education")}>
                  <CardContent className="p-6 text-center">
                    <div className={`mb-4 mx-auto inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${topic.gradient} shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                      <AnimatedIcon icon={topic.icon} className="h-7 w-7 text-white" animation="pulse" delay={index * 0.1} />
                    </div>
                    <h3 className="mb-2 text-lg font-bold font-serif">{topic.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {topic.description}
                    </p>
                  </CardContent>
                </Card>
              </TiltCard>
            </ScrollReveal>
          ))}
        </div>

        {/* Education Testimonials */}
        <ScrollReveal delay={0.2}>
          <div className="mb-16">
            <h3 className="text-2xl font-bold font-serif text-center mb-8">
              Trusted by Jewelry Professionals
            </h3>
            <div className="grid gap-6 md:grid-cols-3">
              {educationTestimonials.map((testimonial, index) => (
                <Card key={testimonial.name} className="border-2 hover:border-primary/20 transition-all duration-300">
                  <CardContent className="p-6">
                    <Quote className="h-8 w-8 text-primary/30 mb-4" />
                    <p className="text-muted-foreground mb-4 italic leading-relaxed">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center gap-1 mb-3">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}, {testimonial.business}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <div className="text-center">
            <div className="mb-6 flex flex-wrap items-center justify-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <span>Interactive 3D Visualizations</span>
              </div>
              <span className="text-border hidden sm:inline">•</span>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <span>Grading Quizzes</span>
              </div>
              <span className="text-border hidden sm:inline">•</span>
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                <span>Value Calculator</span>
              </div>
            </div>
            <Button
              size="lg"
              onClick={() => navigate("/diamond-education")}
              className="group h-14 gap-2 px-10 text-lg font-semibold shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 bg-gradient-to-r from-jewellery-from via-gemstone-from to-diamond-from"
            >
              <GraduationCap className="h-5 w-5" />
              Start Learning
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
