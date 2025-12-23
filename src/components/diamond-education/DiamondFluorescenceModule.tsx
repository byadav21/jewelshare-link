import { useState, useMemo, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Lightbulb, Sun, Moon, Info, TrendingDown, TrendingUp, Minus } from "lucide-react";

// Fluorescence levels with properties
const FLUORESCENCE_LEVELS = [
  { 
    level: "None", 
    index: 0, 
    intensity: 0, 
    glowColor: "#0066ff", 
    priceImpact: 0,
    description: "No fluorescence visible under UV light",
    marketNote: "Standard pricing, no fluorescence discount or premium",
    visibility: "No visible effect under any lighting"
  },
  { 
    level: "Faint", 
    index: 1, 
    intensity: 0.15, 
    glowColor: "#3388ff", 
    priceImpact: -2,
    description: "Slight blue glow under UV light, not visible in normal lighting",
    marketNote: "Minimal price impact, generally 1-3% discount",
    visibility: "Only visible under strong UV light"
  },
  { 
    level: "Medium", 
    index: 2, 
    intensity: 0.35, 
    glowColor: "#4499ff", 
    priceImpact: -5,
    description: "Moderate blue glow visible under UV light",
    marketNote: "Typically 3-7% discount, can enhance appearance of lower color grades",
    visibility: "Visible under UV, rarely affects appearance in daylight"
  },
  { 
    level: "Strong", 
    index: 3, 
    intensity: 0.6, 
    glowColor: "#55aaff", 
    priceImpact: -10,
    description: "Pronounced blue glow under UV light, may affect daylight appearance",
    marketNote: "Usually 10-15% discount, but can make I-M colors appear whiter",
    visibility: "Visible under UV, may create slight haze in direct sunlight"
  },
  { 
    level: "Very Strong", 
    index: 4, 
    intensity: 0.9, 
    glowColor: "#66bbff", 
    priceImpact: -15,
    description: "Intense blue glow, may cause oily or milky appearance in daylight",
    marketNote: "Significant discount 15-25%, but some prefer the effect",
    visibility: "Strongly visible under UV, may appear hazy or oily in sunlight"
  },
];

// Fluorescent Diamond Component
const FluorescentDiamond = ({ 
  fluorescenceLevel, 
  uvLightOn, 
  autoRotate,
  colorGrade = "H"
}: { 
  fluorescenceLevel: number;
  uvLightOn: boolean;
  autoRotate: boolean;
  colorGrade?: string;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const diamondRef = useRef<THREE.Mesh>(null);
  
  const level = FLUORESCENCE_LEVELS[Math.round(fluorescenceLevel)];
  
  useFrame((state, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.3;
    }
    
    // Pulsing glow effect when UV is on
    if (glowRef.current && uvLightOn && level.intensity > 0) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.1 + 1;
      glowRef.current.scale.setScalar(pulse * 1.15);
    }
  });

  // Diamond base color based on color grade
  const diamondBaseColor = useMemo(() => {
    const colors: Record<string, string> = {
      D: "#f8fcff",
      E: "#f6fafd",
      F: "#f4f8fb",
      G: "#f5f5ed",
      H: "#f7f3e8",
      I: "#f9f0e0",
      J: "#fbedd8",
    };
    return colors[colorGrade] || "#f7f3e8";
  }, [colorGrade]);

  // Calculate diamond color when UV is on
  const diamondColor = useMemo(() => {
    if (!uvLightOn || level.intensity === 0) return diamondBaseColor;
    // Mix base color with blue fluorescence
    const base = new THREE.Color(diamondBaseColor);
    const glow = new THREE.Color(level.glowColor);
    return base.lerp(glow, level.intensity * 0.3).getStyle();
  }, [uvLightOn, level, diamondBaseColor]);

  return (
    <group ref={groupRef}>
      {/* Fluorescent glow sphere (visible when UV is on) */}
      {uvLightOn && level.intensity > 0 && (
        <mesh ref={glowRef} scale={1.15}>
          <sphereGeometry args={[1.2, 32, 32]} />
          <meshBasicMaterial
            color={level.glowColor}
            transparent
            opacity={level.intensity * 0.4}
            side={THREE.BackSide}
          />
        </mesh>
      )}
      
      {/* Crown */}
      <mesh position={[0, 0.25, 0]} rotation={[Math.PI, 0, 0]} ref={diamondRef}>
        <coneGeometry args={[0.9, 1.3, 8, 1]} />
        <meshPhysicalMaterial
          color={diamondColor}
          metalness={0}
          roughness={0}
          transmission={uvLightOn ? 0.7 - level.intensity * 0.3 : 0.95}
          thickness={1.5}
          ior={2.417}
          clearcoat={1}
          envMapIntensity={uvLightOn ? 1.5 : 3}
          emissive={uvLightOn && level.intensity > 0 ? level.glowColor : "#000000"}
          emissiveIntensity={uvLightOn ? level.intensity * 0.5 : 0}
        />
      </mesh>
      
      {/* Pavilion */}
      <mesh position={[0, -0.35, 0]}>
        <coneGeometry args={[0.9, 0.7, 8, 1]} />
        <meshPhysicalMaterial
          color={diamondColor}
          metalness={0}
          roughness={0}
          transmission={uvLightOn ? 0.7 - level.intensity * 0.3 : 0.95}
          thickness={1.2}
          ior={2.417}
          clearcoat={1}
          envMapIntensity={uvLightOn ? 1.5 : 3}
          emissive={uvLightOn && level.intensity > 0 ? level.glowColor : "#000000"}
          emissiveIntensity={uvLightOn ? level.intensity * 0.4 : 0}
        />
      </mesh>

      {/* Table */}
      <mesh position={[0, 0.26, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 8]} />
        <meshPhysicalMaterial
          color={diamondColor}
          metalness={0.1}
          roughness={0}
          transmission={0.9}
          thickness={0.2}
          envMapIntensity={2}
          clearcoat={1}
          ior={2.417}
          emissive={uvLightOn && level.intensity > 0 ? level.glowColor : "#000000"}
          emissiveIntensity={uvLightOn ? level.intensity * 0.6 : 0}
        />
      </mesh>

      {/* Sparkles when UV is off */}
      {!uvLightOn && (
        <Sparkles count={20} scale={2} size={3} speed={0.3} opacity={0.5} color="#ffffff" />
      )}
      
      {/* UV glow particles when UV is on */}
      {uvLightOn && level.intensity > 0 && (
        <Sparkles 
          count={Math.round(30 * level.intensity)} 
          scale={2.5} 
          size={4} 
          speed={0.8} 
          opacity={level.intensity * 0.8} 
          color={level.glowColor} 
        />
      )}
    </group>
  );
};

// UV Light source visualization
const UVLight = ({ isOn }: { isOn: boolean }) => {
  const lightRef = useRef<THREE.PointLight>(null);
  
  useFrame((state) => {
    if (lightRef.current && isOn) {
      lightRef.current.intensity = 2 + Math.sin(state.clock.elapsedTime * 5) * 0.5;
    }
  });
  
  return (
    <>
      {isOn && (
        <>
          <pointLight ref={lightRef} position={[0, 4, 0]} intensity={2} color="#4400ff" distance={10} />
          <pointLight position={[2, 3, 2]} intensity={1} color="#6600ff" distance={8} />
          <pointLight position={[-2, 3, -2]} intensity={1} color="#6600ff" distance={8} />
        </>
      )}
    </>
  );
};

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full">
    <div className="flex items-center gap-2 text-muted-foreground">
      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <span className="text-sm">Loading...</span>
    </div>
  </div>
);

const FluorescenceScene = ({ 
  fluorescenceLevel, 
  uvLightOn, 
  autoRotate,
  colorGrade
}: { 
  fluorescenceLevel: number;
  uvLightOn: boolean;
  autoRotate: boolean;
  colorGrade: string;
}) => {
  return (
    <Canvas camera={{ position: [0, 0, 4], fov: 40 }} dpr={[1, 2]}>
      <Suspense fallback={null}>
        <ambientLight intensity={uvLightOn ? 0.15 : 0.4} />
        
        {!uvLightOn && (
          <>
            <spotLight position={[5, 5, 5]} angle={0.3} penumbra={1} intensity={1.5} castShadow />
            <spotLight position={[-5, 5, -5]} angle={0.3} penumbra={1} intensity={1} />
            <pointLight position={[0, 3, 0]} intensity={1} />
          </>
        )}
        
        <UVLight isOn={uvLightOn} />
        
        <FluorescentDiamond 
          fluorescenceLevel={fluorescenceLevel}
          uvLightOn={uvLightOn}
          autoRotate={autoRotate}
          colorGrade={colorGrade}
        />
        
        <Environment preset={uvLightOn ? "night" : "studio"} />
        <ContactShadows 
          position={[0, -1.2, 0]} 
          opacity={uvLightOn ? 0.2 : 0.4} 
          scale={8} 
          blur={2} 
        />
        <OrbitControls 
          enableZoom={true} 
          enablePan={false}
          minDistance={2}
          maxDistance={8}
        />
      </Suspense>
    </Canvas>
  );
};

export const DiamondFluorescenceModule = () => {
  const [fluorescenceIndex, setFluorescenceIndex] = useState(2);
  const [uvLightOn, setUvLightOn] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [colorGrade, setColorGrade] = useState("H");

  const currentLevel = useMemo(() => 
    FLUORESCENCE_LEVELS[Math.round(fluorescenceIndex)], 
    [fluorescenceIndex]
  );

  const priceImpactIcon = useMemo(() => {
    if (currentLevel.priceImpact < -10) return <TrendingDown className="h-4 w-4 text-red-400" />;
    if (currentLevel.priceImpact < 0) return <TrendingDown className="h-4 w-4 text-orange-400" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  }, [currentLevel]);

  const colorGrades = ["D", "E", "F", "G", "H", "I", "J"];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center">
            <Lightbulb className="h-4 w-4 text-white" />
          </div>
          Diamond Fluorescence Visualization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* UV Light Control */}
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div className="flex items-center gap-6">
            <motion.div 
              className="flex items-center space-x-3"
              animate={{ scale: uvLightOn ? 1.02 : 1 }}
            >
              <Switch
                id="uv-light"
                checked={uvLightOn}
                onCheckedChange={setUvLightOn}
              />
              <Label 
                htmlFor="uv-light" 
                className={`flex items-center gap-2 font-medium transition-colors ${uvLightOn ? "text-violet-400" : ""}`}
              >
                {uvLightOn ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                {uvLightOn ? "UV Light ON" : "Normal Light"}
              </Label>
            </motion.div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="rotate-fluor"
                checked={autoRotate}
                onCheckedChange={setAutoRotate}
              />
              <Label htmlFor="rotate-fluor">360° Rotation</Label>
            </div>
          </div>

          {/* Color Grade Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Diamond Color:</span>
            <div className="flex gap-1">
              {colorGrades.map((grade) => (
                <Button
                  key={grade}
                  variant={colorGrade === grade ? "default" : "outline"}
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => setColorGrade(grade)}
                >
                  {grade}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Visualization Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* 3D Diamond View */}
          <div className="relative">
            <motion.div 
              className="h-80 rounded-xl overflow-hidden"
              animate={{ 
                backgroundColor: uvLightOn ? "#0a001a" : "#0f172a"
              }}
              transition={{ duration: 0.5 }}
              style={{
                background: uvLightOn 
                  ? "radial-gradient(circle at 50% 30%, #1a0033 0%, #0a001a 50%, #000005 100%)"
                  : "radial-gradient(ellipse at 50% 30%, #1e293b 0%, #0f172a 50%, #020617 100%)"
              }}
            >
              <FluorescenceScene 
                fluorescenceLevel={fluorescenceIndex}
                uvLightOn={uvLightOn}
                autoRotate={autoRotate}
                colorGrade={colorGrade}
              />
            </motion.div>
            
            <div className="absolute top-2 left-2 flex gap-2">
              <Badge className={`shadow-lg ${uvLightOn ? "bg-violet-600" : "bg-primary"}`}>
                <Lightbulb className="h-3 w-3 mr-1" />
                {currentLevel.level} Fluorescence
              </Badge>
              <Badge variant="outline" className="bg-black/50 text-white border-white/30">
                {colorGrade} Color
              </Badge>
            </div>

            {uvLightOn && currentLevel.intensity > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute bottom-2 left-2 right-2"
              >
                <div className="bg-violet-500/20 backdrop-blur-sm border border-violet-400/30 rounded-lg p-2 text-center">
                  <span className="text-violet-300 text-sm font-medium">
                    ✨ Blue fluorescent glow visible under UV light
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Controls & Info */}
          <div className="space-y-6">
            {/* Fluorescence Level Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Fluorescence Level</span>
                <Badge variant="outline" className="font-mono">
                  {currentLevel.level}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  {FLUORESCENCE_LEVELS.map((l) => (
                    <TooltipProvider key={l.level}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setFluorescenceIndex(l.index)}
                            className={`px-1.5 py-0.5 rounded transition-all ${
                              Math.round(fluorescenceIndex) === l.index 
                                ? "bg-violet-500 text-white font-bold" 
                                : "hover:bg-muted"
                            }`}
                          >
                            {l.level.split(" ")[0]}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{l.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
                
                <div className="relative">
                  <div 
                    className="absolute inset-0 h-3 rounded-full mt-2"
                    style={{
                      background: "linear-gradient(to right, #374151, #3b82f6, #8b5cf6, #a855f7, #c084fc)"
                    }}
                  />
                  <Slider
                    value={[fluorescenceIndex]}
                    onValueChange={(value) => setFluorescenceIndex(value[0])}
                    max={FLUORESCENCE_LEVELS.length - 1}
                    step={0.01}
                    className="relative z-10"
                  />
                </div>
              </div>
            </div>

            {/* Intensity Visualization */}
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Glow Intensity</span>
              <div className="h-4 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(to right, ${currentLevel.glowColor}, #c084fc)`
                  }}
                  animate={{ width: `${currentLevel.intensity * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Price Impact */}
            <div className="p-4 rounded-xl bg-muted/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium flex items-center gap-2">
                  {priceImpactIcon}
                  Price Impact
                </span>
                <Badge 
                  variant="outline" 
                  className={`${
                    currentLevel.priceImpact < -10 
                      ? "border-red-400/50 text-red-400" 
                      : currentLevel.priceImpact < 0 
                        ? "border-orange-400/50 text-orange-400"
                        : "border-muted-foreground"
                  }`}
                >
                  {currentLevel.priceImpact === 0 ? "No Impact" : `${currentLevel.priceImpact}%`}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{currentLevel.marketNote}</p>
            </div>
          </div>
        </div>

        {/* Level Information */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentLevel.level}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 space-y-4"
          >
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${currentLevel.glowColor}, #8b5cf6)`,
                  boxShadow: uvLightOn ? `0 0 20px ${currentLevel.glowColor}` : "none"
                }}
                animate={{ 
                  boxShadow: uvLightOn && currentLevel.intensity > 0
                    ? [`0 0 10px ${currentLevel.glowColor}`, `0 0 30px ${currentLevel.glowColor}`, `0 0 10px ${currentLevel.glowColor}`]
                    : "0 0 0px transparent"
                }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Lightbulb className="h-5 w-5 text-white" />
              </motion.div>
              <div>
                <h3 className="text-lg font-bold">{currentLevel.level} Fluorescence</h3>
                <p className="text-sm text-muted-foreground">Intensity: {Math.round(currentLevel.intensity * 100)}%</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-violet-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Description</p>
                  <p className="text-muted-foreground">{currentLevel.description}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Sun className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Visibility</p>
                  <p className="text-muted-foreground">{currentLevel.visibility}</p>
                </div>
              </div>
            </div>

            {/* Pro Tip */}
            {currentLevel.intensity > 0 && (
              <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
                <p className="text-sm">
                  <span className="font-medium text-violet-400">💡 Pro Tip:</span>{" "}
                  {currentLevel.index >= 3 
                    ? "Strong fluorescence can make lower color grades (I-M) appear whiter, potentially offering good value."
                    : "Medium fluorescence rarely affects appearance and can offer slight savings."}
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default DiamondFluorescenceModule;
