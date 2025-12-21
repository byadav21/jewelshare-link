import { useEffect } from "react";
import { motion } from "framer-motion";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { DiamondColorModule } from "@/components/diamond-education/DiamondColorModule";
import { DiamondClarityModule } from "@/components/diamond-education/DiamondClarityModule";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Search, GraduationCap } from "lucide-react";

const DiamondEducation = () => {
  useEffect(() => {
    document.title = "Interactive Diamond Education | Learn 4Cs - Color & Clarity Charts";
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
          {/* Header */}
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
              Master the art of diamond grading with our interactive 3D visualization tools. 
              Explore how color and clarity affect a diamond's appearance and value.
            </p>
          </div>

          {/* Tabs for Color and Clarity */}
          <Tabs defaultValue="color" className="space-y-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="color" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Color Chart
              </TabsTrigger>
              <TabsTrigger value="clarity" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Clarity Chart
              </TabsTrigger>
            </TabsList>

            <TabsContent value="color">
              <DiamondColorModule />
            </TabsContent>

            <TabsContent value="clarity">
              <DiamondClarityModule />
            </TabsContent>
          </Tabs>

          {/* Educational Tips */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="p-6 rounded-xl bg-gradient-to-br from-sky-500/10 to-blue-500/5 border border-sky-500/20">
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Palette className="h-5 w-5 text-sky-500" />
                Understanding Diamond Color
              </h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• <strong>D-F (Colorless):</strong> Highest grades, appear ice-white</li>
                <li>• <strong>G-H (Near Colorless):</strong> Excellent value, minimal color visible</li>
                <li>• <strong>I-J (Near Colorless):</strong> Slight warmth, great for yellow gold</li>
                <li>• <strong>K+ (Faint to Light):</strong> Noticeable color, budget-friendly</li>
              </ul>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/5 border border-purple-500/20">
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Search className="h-5 w-5 text-purple-500" />
                Understanding Diamond Clarity
              </h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• <strong>FL-IF:</strong> No inclusions visible under 10x magnification</li>
                <li>• <strong>VVS1-VVS2:</strong> Minute inclusions, very difficult to see</li>
                <li>• <strong>VS1-VS2:</strong> Minor inclusions, excellent balance of value</li>
                <li>• <strong>SI1-SI2:</strong> Noticeable under 10x, often eye-clean</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DiamondEducation;
