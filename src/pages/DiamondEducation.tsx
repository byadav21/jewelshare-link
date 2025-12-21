import { useEffect } from "react";
import { motion } from "framer-motion";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { DiamondColorModule } from "@/components/diamond-education/DiamondColorModule";
import { DiamondClarityModule } from "@/components/diamond-education/DiamondClarityModule";
import { DiamondCaratModule } from "@/components/diamond-education/DiamondCaratModule";
import { DiamondCutModule } from "@/components/diamond-education/DiamondCutModule";
import { DiamondGradingQuiz } from "@/components/diamond-education/DiamondGradingQuiz";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Search, GraduationCap, Scale, Sparkles, Trophy } from "lucide-react";

const DiamondEducation = () => {
  useEffect(() => {
    document.title = "Interactive Diamond Education | Learn 4Cs - Color, Clarity, Cut & Carat";
  }, []);

  return (
    <div className="min-h-screen bg-background">
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
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-5">
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
              <TabsTrigger value="quiz" className="flex items-center gap-1 text-xs md:text-sm">
                <Trophy className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden md:inline">Quiz</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="color"><DiamondColorModule /></TabsContent>
            <TabsContent value="clarity"><DiamondClarityModule /></TabsContent>
            <TabsContent value="cut"><DiamondCutModule /></TabsContent>
            <TabsContent value="carat"><DiamondCaratModule /></TabsContent>
            <TabsContent value="quiz"><DiamondGradingQuiz /></TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default DiamondEducation;
