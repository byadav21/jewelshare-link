import { useState, useMemo, useRef, Suspense, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Html } from "@react-three/drei";
import * as THREE from "three";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RotateCcw, Search, Eye, Info } from "lucide-react";

// Clarity grades with their properties
const CLARITY_GRADES = [
  { grade: "FL", index: 0, name: "Flawless", inclusions: 0, size: 0, visibility: 0, description: "No inclusions or blemishes visible under 10x magnification", rarity: "Extremely Rare (<1%)" },
  { grade: "IF", index: 1, name: "Internally Flawless", inclusions: 0, size: 0, visibility: 0.05, description: "No inclusions visible under 10x magnification", rarity: "Very Rare (~3%)" },
  { grade: "VVS1", index: 2, name: "Very Very Slightly Included 1", inclusions: 1, size: 0.1, visibility: 0.15, description: "Minute inclusions very difficult to see under 10x", rarity: "Rare" },
  { grade: "VVS2", index: 3, name: "Very Very Slightly Included 2", inclusions: 2, size: 0.15, visibility: 0.2, description: "Minute inclusions difficult to see under 10x", rarity: "Uncommon" },
  { grade: "VS1", index: 4, name: "Very Slightly Included 1", inclusions: 3, size: 0.2, visibility: 0.35, description: "Minor inclusions somewhat difficult to see under 10x", rarity: "Common" },
  { grade: "VS2", index: 5, name: "Very Slightly Included 2", inclusions: 4, size: 0.25, visibility: 0.45, description: "Minor inclusions easily visible under 10x", rarity: "Common" },
  { grade: "SI1", index: 6, name: "Slightly Included 1", inclusions: 5, size: 0.35, visibility: 0.6, description: "Noticeable inclusions under 10x, may be eye-visible", rarity: "Common" },
  { grade: "SI2", index: 7, name: "Slightly Included 2", inclusions: 7, size: 0.45, visibility: 0.75, description: "Noticeable inclusions, often eye-visible", rarity: "Common" },
  { grade: "I1", index: 8, name: "Included 1", inclusions: 9, size: 0.55, visibility: 0.85, description: "Obvious inclusions, visible to naked eye", rarity: "Abundant" },
  { grade: "I2", index: 9, name: "Included 2", inclusions: 12, size: 0.7, visibility: 0.95, description: "Many obvious inclusions affecting transparency", rarity: "Abundant" },
  { grade: "I3", index: 10, name: "Included 3", inclusions: 15, size: 0.85, visibility: 1, description: "Many large inclusions severely affecting beauty", rarity: "Abundant" },
];

// Inclusion types
const INCLUSION_TYPES = [
  { type: "pinpoint", color: "#333333", shape: "sphere", minGrade: 2 },
  { type: "feather", color: "#666666", shape: "line", minGrade: 3 },
  { type: "cloud", color: "#888888", shape: "cluster", minGrade: 4 },
  { type: "crystal", color: "#111111", shape: "cube", minGrade: 6 },
  { type: "needle", color: "#444444", shape: "cylinder", minGrade: 5 },
];

// Generate random inclusions based on clarity grade
const generateInclusions = (gradeIndex: number, seed: number = 0) => {
  const grade = CLARITY_GRADES[gradeIndex];
  const inclusions: Array<{
    position: [number, number, number];
    size: number;
    type: typeof INCLUSION_TYPES[0];
    opacity: number;
  }> = [];

  if (grade.inclusions === 0) return inclusions;

  const random = (i: number) => {
    const x = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };

  for (let i = 0; i < grade.inclusions; i++) {
    // Position moves from edge to center as grade decreases
    const distFromCenter = 0.6 - (gradeIndex / 10) * 0.4;
    const angle = random(i) * Math.PI * 2;
    const radius = random(i + 100) * distFromCenter;
    
    const availableTypes = INCLUSION_TYPES.filter(t => t.minGrade <= gradeIndex);
    const type = availableTypes[Math.floor(random(i + 200) * availableTypes.length)] || INCLUSION_TYPES[0];

    inclusions.push({
      position: [
        Math.cos(angle) * radius,
        (random(i + 300) - 0.5) * 0.8,
        Math.sin(angle) * radius,
      ],
      size: grade.size * (0.5 + random(i + 400) * 0.5),
      type,
      opacity: grade.visibility * (0.5 + random(i + 500) * 0.5),
    });
  }

  return inclusions;
};

// Inclusion mesh component
const Inclusion = ({ 
  position, 
  size, 
  type, 
  opacity,
  microscopeMode 
}: { 
  position: [number, number, number]; 
  size: number; 
  type: typeof INCLUSION_TYPES[0];
  opacity: number;
  microscopeMode: boolean;
}) => {
  const scale = microscopeMode ? size * 2.5 : size;
  const finalOpacity = microscopeMode ? Math.min(opacity * 1.5, 1) : opacity;

  return (
    <mesh position={position}>
      {type.shape === "sphere" && <sphereGeometry args={[0.03 * scale, 8, 8]} />}
      {type.shape === "cube" && <boxGeometry args={[0.04 * scale, 0.04 * scale, 0.04 * scale]} />}
      {type.shape === "cylinder" && <cylinderGeometry args={[0.01 * scale, 0.01 * scale, 0.08 * scale, 6]} />}
      {type.shape === "line" && (
        <boxGeometry args={[0.06 * scale, 0.005 * scale, 0.005 * scale]} />
      )}
      {type.shape === "cluster" && <icosahedronGeometry args={[0.025 * scale, 0]} />}
      <meshBasicMaterial 
        color={type.color} 
        transparent 
        opacity={finalOpacity}
      />
    </mesh>
  );
};

// Diamond with inclusions
const ClarityDiamond = ({ 
  gradeIndex, 
  autoRotate, 
  microscopeMode,
  seed 
}: { 
  gradeIndex: number; 
  autoRotate: boolean;
  microscopeMode: boolean;
  seed: number;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  
  const inclusions = useMemo(() => 
    generateInclusions(Math.round(gradeIndex), seed), 
    [gradeIndex, seed]
  );

  useFrame((state) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  const diamondColor = microscopeMode ? "#f0f8ff" : "#ffffff";

  return (
    <group ref={groupRef}>
      {/* Crown */}
      <mesh position={[0, 0.3, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[1, 1.5, 32, 1]} />
        <meshPhysicalMaterial
          color={diamondColor}
          metalness={0.0}
          roughness={0.0}
          transmission={microscopeMode ? 0.7 : 0.92}
          thickness={1.5}
          envMapIntensity={microscopeMode ? 1.5 : 3}
          clearcoat={1}
          ior={2.417}
        />
      </mesh>
      
      {/* Pavilion */}
      <mesh position={[0, -0.4, 0]}>
        <coneGeometry args={[1, 0.8, 32, 1]} />
        <meshPhysicalMaterial
          color={diamondColor}
          metalness={0.0}
          roughness={0.0}
          transmission={microscopeMode ? 0.7 : 0.92}
          thickness={1.2}
          envMapIntensity={microscopeMode ? 1.5 : 3}
          clearcoat={1}
          ior={2.417}
        />
      </mesh>

      {/* Table */}
      <mesh position={[0, 0.31, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.6, 32]} />
        <meshPhysicalMaterial
          color={diamondColor}
          metalness={0.1}
          roughness={0.0}
          transmission={microscopeMode ? 0.75 : 0.95}
          thickness={0.2}
          envMapIntensity={2}
          clearcoat={1}
          ior={2.417}
        />
      </mesh>

      {/* Inclusions */}
      {inclusions.map((inc, i) => (
        <Inclusion 
          key={i} 
          position={inc.position} 
          size={inc.size} 
          type={inc.type}
          opacity={inc.opacity}
          microscopeMode={microscopeMode}
        />
      ))}
    </group>
  );
};

const LoadingFallback = () => (
  <Html center>
    <div className="flex items-center gap-2 text-muted-foreground">
      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <span className="text-sm">Loading...</span>
    </div>
  </Html>
);

const ClarityScene = ({ 
  gradeIndex, 
  autoRotate, 
  microscopeMode,
  seed 
}: { 
  gradeIndex: number; 
  autoRotate: boolean;
  microscopeMode: boolean;
  seed: number;
}) => {
  return (
    <Canvas 
      camera={{ position: [0, 0, microscopeMode ? 2.5 : 4], fov: microscopeMode ? 35 : 45 }} 
      dpr={[1, 2]}
    >
      <Suspense fallback={<LoadingFallback />}>
        <ambientLight intensity={microscopeMode ? 0.8 : 0.5} />
        <spotLight position={[5, 5, 5]} angle={0.3} penumbra={1} intensity={microscopeMode ? 3 : 2} castShadow />
        <spotLight position={[-5, 5, -5]} angle={0.3} penumbra={1} intensity={1.5} />
        <pointLight position={[0, 3, 0]} intensity={1.2} />
        
        {microscopeMode && (
          <>
            <pointLight position={[1, 0, 1]} intensity={2} color="#ffffff" />
            <pointLight position={[-1, 0, -1]} intensity={2} color="#ffffff" />
          </>
        )}
        
        <ClarityDiamond 
          gradeIndex={gradeIndex} 
          autoRotate={autoRotate}
          microscopeMode={microscopeMode}
          seed={seed}
        />
        
        <Environment preset={microscopeMode ? "warehouse" : "studio"} />
        <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2} />
        <OrbitControls 
          enableZoom={true} 
          enablePan={false} 
          autoRotate={autoRotate}
          autoRotateSpeed={1}
          minDistance={1.5}
          maxDistance={8}
        />
      </Suspense>
    </Canvas>
  );
};

export const DiamondClarityModule = () => {
  const [clarityIndex, setClarityIndex] = useState(4);
  const [autoRotate, setAutoRotate] = useState(true);
  const [microscopeMode, setMicroscopeMode] = useState(false);
  const [seed, setSeed] = useState(1);

  const currentGrade = useMemo(() => CLARITY_GRADES[Math.round(clarityIndex)], [clarityIndex]);

  const regenerateInclusions = useCallback(() => {
    setSeed(prev => prev + 1);
  }, []);

  const isEyeClean = useMemo(() => {
    return clarityIndex <= 6; // SI1 and above are generally eye-clean
  }, [clarityIndex]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center">
            <Search className="h-4 w-4 text-white" />
          </div>
          Diamond Clarity Interactive Chart
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="rotate"
                checked={autoRotate}
                onCheckedChange={setAutoRotate}
              />
              <Label htmlFor="rotate" className="flex items-center gap-1">
                <RotateCcw className="h-4 w-4" />
                360° Rotation
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="microscope"
                checked={microscopeMode}
                onCheckedChange={setMicroscopeMode}
              />
              <Label htmlFor="microscope" className="flex items-center gap-1">
                <Search className="h-4 w-4" />
                10× Loupe View
              </Label>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={regenerateInclusions}>
            Randomize Inclusions
          </Button>
        </div>

        {/* Diamond Visualization */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Clarity Slider (Vertical) */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">FL - Flawless</span>
            <div className="relative h-64 w-12 flex items-center justify-center">
              <div 
                className="absolute w-3 h-full rounded-full"
                style={{
                  background: `linear-gradient(to bottom, 
                    hsl(210, 100%, 95%), 
                    hsl(210, 80%, 90%), 
                    hsl(210, 60%, 80%), 
                    hsl(210, 40%, 70%), 
                    hsl(210, 20%, 60%), 
                    hsl(0, 0%, 50%)
                  )`
                }}
              />
              <input
                type="range"
                min="0"
                max={CLARITY_GRADES.length - 1}
                step="0.1"
                value={clarityIndex}
                onChange={(e) => setClarityIndex(parseFloat(e.target.value))}
                className="absolute h-full w-8 cursor-pointer opacity-0"
                style={{ writingMode: "vertical-lr", direction: "rtl" }}
              />
              <div 
                className="absolute w-6 h-6 rounded-full bg-primary border-2 border-white shadow-lg cursor-grab pointer-events-none"
                style={{ 
                  top: `${(clarityIndex / (CLARITY_GRADES.length - 1)) * 100}%`,
                  transform: "translateY(-50%)"
                }}
              />
            </div>
            <span className="text-xs font-medium text-muted-foreground">I3 - Included</span>
            
            <div className="mt-4 space-y-1 text-center">
              {CLARITY_GRADES.map((g, i) => (
                <TooltipProvider key={g.grade}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setClarityIndex(i)}
                        className={`block w-full text-xs px-2 py-0.5 rounded transition-all ${
                          Math.round(clarityIndex) === i 
                            ? "bg-primary text-primary-foreground font-bold" 
                            : "hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        {g.grade}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p className="font-medium">{g.name}</p>
                      <p className="text-xs">{g.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>

          {/* 3D Diamond View */}
          <div className="lg:col-span-2 relative">
            <motion.div 
              className="h-80 rounded-xl overflow-hidden"
              animate={{ 
                backgroundColor: microscopeMode ? "#1a1a2e" : undefined 
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <ClarityScene 
                  gradeIndex={clarityIndex}
                  autoRotate={autoRotate}
                  microscopeMode={microscopeMode}
                  seed={seed}
                />
              </div>
            </motion.div>
            
            <div className="absolute top-2 left-2 flex gap-2">
              <Badge className="bg-primary">
                {currentGrade.grade}
              </Badge>
              {microscopeMode && (
                <Badge variant="outline" className="bg-black/50 text-white border-white/30">
                  10× Magnification
                </Badge>
              )}
            </div>

            <div className="absolute top-2 right-2">
              <Badge 
                variant="outline" 
                className={`${isEyeClean ? "bg-green-500/20 text-green-400 border-green-400/30" : "bg-orange-500/20 text-orange-400 border-orange-400/30"}`}
              >
                <Eye className="h-3 w-3 mr-1" />
                {isEyeClean ? "Eye-Clean" : "Visible Inclusions"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Grade Information */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentGrade.grade}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-muted/50 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-white font-bold">
                  {currentGrade.grade}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{currentGrade.name}</h3>
                  <p className="text-sm text-muted-foreground">{currentGrade.rarity}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Badge variant="outline">
                  Inclusions: {currentGrade.inclusions}
                </Badge>
                <Badge variant="outline">
                  Visibility: {Math.round(currentGrade.visibility * 100)}%
                </Badge>
              </div>
            </div>

            <p className="text-sm text-muted-foreground flex items-start gap-2">
              <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              {currentGrade.description}
            </p>

            {/* Inclusion Types Legend */}
            <div className="border-t pt-3">
              <h4 className="text-sm font-medium mb-2">Possible Inclusion Types at this Grade:</h4>
              <div className="flex flex-wrap gap-2">
                {INCLUSION_TYPES.filter(t => t.minGrade <= Math.round(clarityIndex)).map(inc => (
                  <Badge key={inc.type} variant="secondary" className="capitalize">
                    {inc.type}
                  </Badge>
                ))}
                {INCLUSION_TYPES.filter(t => t.minGrade <= Math.round(clarityIndex)).length === 0 && (
                  <span className="text-sm text-muted-foreground italic">No visible inclusions at this grade</span>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default DiamondClarityModule;
