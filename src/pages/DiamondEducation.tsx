import { useEffect } from "react";
import { motion } from "framer-motion";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { DiamondColorModule } from "@/components/diamond-education/DiamondColorModule";
import { DiamondClarityModule } from "@/components/diamond-education/DiamondClarityModule";
import { DiamondCaratModule } from "@/components/diamond-education/DiamondCaratModule";
import { DiamondCutModule } from "@/components/diamond-education/DiamondCutModule";
import { DiamondGradingQuiz } from "@/components/diamond-education/DiamondGradingQuiz";
import { DiamondValueCalculator } from "@/components/diamond-education/DiamondValueCalculator";
import { DiamondFluorescenceModule } from "@/components/diamond-education/DiamondFluorescenceModule";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEOHead } from "@/components/SEOHead";
import { StructuredData } from "@/components/StructuredData";
import { Palette, Search, GraduationCap, Scale, Sparkles, Trophy, DollarSign, Lightbulb } from "lucide-react";

const DiamondEducation = () => {
  // Educational content schema
  const educationSchema = {
    type: "Article" as const,
    headline: "Interactive Diamond Education - Learn the 4Cs",
    description: "Master diamond grading with interactive 3D visualization. Learn about Color (D-M grades), Clarity (IF-I3), Cut quality, and Carat weight. Take quizzes to test your knowledge.",
    image: "https://cataleon.com/og-image.png",
    author: "Cataleon Education Team",
    publisher: "Cataleon",
    datePublished: "2024-01-01",
    dateModified: "2025-01-15"
  };

  // FAQ schema for diamond education
  const faqSchema = {
    type: "FAQPage" as const,
    questions: [
      {
        question: "What are the 4Cs of diamonds?",
        answer: "The 4Cs are Color (D-Z scale, with D being colorless), Clarity (presence of inclusions, from IF to I3), Cut (how well the diamond is cut, affecting brilliance), and Carat (the weight of the diamond)."
      },
      {
        question: "What is diamond fluorescence?",
        answer: "Diamond fluorescence is the visible light some diamonds emit when exposed to UV light. It's graded from None to Very Strong and can affect a diamond's appearance and value."
      },
      {
        question: "How does diamond cut affect value?",
        answer: "Cut is considered the most important C. An excellent cut maximizes brilliance and fire, making the diamond appear more brilliant. Poor cuts can make even high-color, high-clarity diamonds look dull."
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      {/* SEO Meta Tags */}
      <SEOHead
        title="Interactive Diamond Education - Learn the 4Cs with 3D Visualization | Cataleon"
        description="Master diamond grading with our interactive education center. Learn about Color, Clarity, Cut, and Carat with 3D visualization tools. Take quizzes to test your diamond expertise. Free educational resource for jewelers and consumers."
        keywords="diamond education, 4Cs of diamonds, diamond grading, diamond color grades, diamond clarity, diamond cut quality, diamond carat weight, fluorescence, GIA grading, diamond quiz"
        canonicalUrl="/diamond-education"
      />
      
      {/* Structured Data */}
      <StructuredData data={[educationSchema, faqSchema]} />
      
      <div className="container mx-auto px-4 py-8">
        <BackToHomeButton />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary via-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">
                Interactive Diamond Education
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Master the 4Cs of diamond grading with hyper-realistic 3D visualization tools.
            </p>
          </div>

          <Tabs defaultValue="color" className="space-y-6">
            <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-7">
              <TabsTrigger value="color" className="flex items-center gap-1 text-xs md:text-sm">
                <Palette className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden md:inline">Color</span>
              </TabsTrigger>
              <TabsTrigger value="clarity" className="flex items-center gap-1 text-xs md:text-sm">
                <Search className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden md:inline">Clarity</span>
              </TabsTrigger>
              <TabsTrigger value="cut" className="flex items-center gap-1 text-xs md:text-sm">
                <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden md:inline">Cut</span>
              </TabsTrigger>
              <TabsTrigger value="carat" className="flex items-center gap-1 text-xs md:text-sm">
                <Scale className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden md:inline">Carat</span>
              </TabsTrigger>
              <TabsTrigger value="fluorescence" className="flex items-center gap-1 text-xs md:text-sm">
                <Lightbulb className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden md:inline">Fluor.</span>
              </TabsTrigger>
              <TabsTrigger value="value" className="flex items-center gap-1 text-xs md:text-sm">
                <DollarSign className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden md:inline">Value</span>
              </TabsTrigger>
              <TabsTrigger value="quiz" className="flex items-center gap-1 text-xs md:text-sm">
                <Trophy className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden md:inline">Quiz</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="color"><DiamondColorModule /></TabsContent>
            <TabsContent value="clarity"><DiamondClarityModule /></TabsContent>
            <TabsContent value="cut"><DiamondCutModule /></TabsContent>
            <TabsContent value="carat"><DiamondCaratModule /></TabsContent>
            <TabsContent value="fluorescence"><DiamondFluorescenceModule /></TabsContent>
            <TabsContent value="value"><DiamondValueCalculator /></TabsContent>
            <TabsContent value="quiz"><DiamondGradingQuiz /></TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default DiamondEducation;
