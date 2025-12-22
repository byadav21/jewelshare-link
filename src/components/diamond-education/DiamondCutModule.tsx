import { useState, useCallback, useMemo, Suspense, lazy } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Sun, Zap, RotateCcw, ArrowUp, ArrowDown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const RealisticDiamond3D = lazy(() => import("./RealisticDiamond3D"));

interface CutParameters {
  tablePercentage: number;
  crownAngle: number;
  pavilionAngle: number;
  depthPercentage: number;
  girdleThickness: number;
}

interface CutGradeResult {
  grade: 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Poor';
  brilliance: number;
  fire: number;
  scintillation: number;
  description: string;
}

const IDEAL_CUT: CutParameters = {
  tablePercentage: 57,
  crownAngle: 34.5,
  pavilionAngle: 40.8,
  depthPercentage: 62,
  girdleThickness: 3.5,
};

const CUT_GRADE_PRESETS = {
  'Excellent': {
    tablePercentage: 57,
    crownAngle: 34.5,
    pavilionAngle: 40.8,
    depthPercentage: 62,
    girdleThickness: 3.5,
  },
  'Very Good': {
    tablePercentage: 60,
    crownAngle: 33,
    pavilionAngle: 41.5,
    depthPercentage: 63,
    girdleThickness: 4,
  },
  'Good': {
    tablePercentage: 64,
    crownAngle: 31,
    pavilionAngle: 42.5,
    depthPercentage: 65,
    girdleThickness: 5,
  },
  'Fair': {
    tablePercentage: 68,
    crownAngle: 28,
    pavilionAngle: 44,
    depthPercentage: 68,
    girdleThickness: 6,
  },
  'Poor': {
    tablePercentage: 72,
    crownAngle: 25,
    pavilionAngle: 46,
    depthPercentage: 72,
    girdleThickness: 8,
  },
};

const calculateCutGrade = (params: CutParameters): CutGradeResult => {
  // Calculate deviations from ideal
  const tableDeviation = Math.abs(params.tablePercentage - IDEAL_CUT.tablePercentage);
  const crownDeviation = Math.abs(params.crownAngle - IDEAL_CUT.crownAngle);
  const pavilionDeviation = Math.abs(params.pavilionAngle - IDEAL_CUT.pavilionAngle);
  const depthDeviation = Math.abs(params.depthPercentage - IDEAL_CUT.depthPercentage);

  // Calculate performance metrics (0-100)
  const brilliance = Math.max(0, 100 - (tableDeviation * 2) - (depthDeviation * 1.5) - (pavilionDeviation * 3));
  const fire = Math.max(0, 100 - (crownDeviation * 4) - (tableDeviation * 1.5) - (pavilionDeviation * 2));
  const scintillation = Math.max(0, 100 - (tableDeviation * 1.5) - (crownDeviation * 2) - (pavilionDeviation * 2));

  // Determine grade
  const avgScore = (brilliance + fire + scintillation) / 3;
  let grade: CutGradeResult['grade'];
  let description: string;

  if (avgScore >= 90) {
    grade = 'Excellent';
    description = 'Maximum light return with exceptional brilliance, fire, and scintillation. This represents the top tier of cut quality.';
  } else if (avgScore >= 75) {
    grade = 'Very Good';
    description = 'Superior light performance with minor deviations from ideal. Excellent value choice.';
  } else if (avgScore >= 60) {
    grade = 'Good';
    description = 'Good light performance. Some light leakage but still attractive.';
  } else if (avgScore >= 45) {
    grade = 'Fair';
    description = 'Noticeable light leakage and reduced brilliance. Budget-conscious option.';
  } else {
    grade = 'Poor';
    description = 'Significant light leakage. Diamond appears dull compared to better cuts.';
  }

  return { grade, brilliance, fire, scintillation, description };
};

const getGradeColor = (grade: CutGradeResult['grade']): string => {
  switch (grade) {
    case 'Excellent': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'Very Good': return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
    case 'Good': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'Fair': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'Poor': return 'bg-red-500/20 text-red-400 border-red-500/30';
  }
};

// Light path visualization
const LightPathVisualization = ({ params }: { params: CutParameters }) => {
  const grade = calculateCutGrade(params);
  const isIdeal = grade.grade === 'Excellent';
  const isDeep = params.depthPercentage > 65;
  const isShallow = params.depthPercentage < 58;

  return (
    <div className="relative h-64 bg-gradient-to-b from-muted/50 to-muted/20 rounded-xl overflow-hidden">
      {/* Diamond cross-section */}
      <svg viewBox="0 0 200 150" className="w-full h-full">
        {/* Incoming light rays */}
        <g stroke="#fbbf24" strokeWidth="1.5" opacity="0.8">
          <motion.line
            x1="70" y1="0" x2="100" y2="40"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
          />
          <motion.line
            x1="100" y1="0" x2="100" y2="40"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.1, repeat: Infinity, repeatDelay: 1 }}
          />
          <motion.line
            x1="130" y1="0" x2="100" y2="40"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.2, repeat: Infinity, repeatDelay: 1 }}
          />
        </g>

        {/* Diamond outline */}
        <polygon
          points={`
            ${100 - params.tablePercentage * 0.5},40
            ${100 + params.tablePercentage * 0.5},40
            170,55
            100,${55 + params.depthPercentage}
            30,55
          `}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-primary/50"
        />

        {/* Light behavior inside diamond */}
        {isIdeal && (
          <g stroke="#22c55e" strokeWidth="1.5">
            <motion.path
              d="M100,40 L130,70 L100,100 L100,40"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 0.5, repeat: Infinity, repeatDelay: 1 }}
            />
            <motion.line
              x1="100" y1="40" x2="80" y2="10"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3, delay: 1.5, repeat: Infinity, repeatDelay: 1.2 }}
            />
            <motion.line
              x1="100" y1="40" x2="120" y2="10"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3, delay: 1.6, repeat: Infinity, repeatDelay: 1.2 }}
            />
          </g>
        )}

        {isDeep && (
          <g stroke="#ef4444" strokeWidth="1.5">
            <motion.path
              d="M100,40 L130,80 L100,130 L100,150"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, delay: 0.5, repeat: Infinity, repeatDelay: 1 }}
            />
            {/* Light leaking through sides */}
            <motion.line
              x1="130" y1="80" x2="170" y2="100"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, delay: 1, repeat: Infinity, repeatDelay: 1.3 }}
            />
          </g>
        )}

        {isShallow && (
          <g stroke="#ef4444" strokeWidth="1.5">
            <motion.path
              d="M100,40 L110,50 L100,55 L90,50 L100,40"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.5, repeat: Infinity, repeatDelay: 1 }}
            />
            {/* Light leaking through bottom */}
            <motion.line
              x1="100" y1="55" x2="100" y2="130"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, delay: 0.8, repeat: Infinity, repeatDelay: 1.3 }}
            />
          </g>
        )}

        {/* Labels */}
        <text x="100" y="145" textAnchor="middle" className="fill-muted-foreground text-xs">
          {isIdeal ? '✓ Light returns through crown' : isDeep ? '✗ Light leaks through sides' : '✗ Light leaks through bottom'}
        </text>
      </svg>
    </div>
  );
};

// Performance meter component
const PerformanceMeter = ({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className={`text-sm font-bold ${color}`}>{value.toFixed(0)}%</span>
    </div>
    <div className="h-2 bg-muted rounded-full overflow-hidden">
      <motion.div
        className={`h-full bg-gradient-to-r ${
          value >= 80 ? 'from-emerald-500 to-emerald-400' :
          value >= 60 ? 'from-amber-500 to-amber-400' :
          'from-red-500 to-red-400'
        }`}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  </div>
);

export const DiamondCutModule = () => {
  const [params, setParams] = useState<CutParameters>(IDEAL_CUT);
  const [autoRotate, setAutoRotate] = useState(true);

  const gradeResult = useMemo(() => calculateCutGrade(params), [params]);

  const handleParamChange = useCallback((key: keyof CutParameters, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  }, []);

  const applyPreset = useCallback((preset: keyof typeof CUT_GRADE_PRESETS) => {
    setParams(CUT_GRADE_PRESETS[preset]);
  }, []);

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-background via-background to-emerald-500/5">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            Diamond Cut Quality
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            {(Object.keys(CUT_GRADE_PRESETS) as Array<keyof typeof CUT_GRADE_PRESETS>).map((preset) => (
              <Button
                key={preset}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(preset)}
                className={`text-xs ${gradeResult.grade === preset ? 'ring-2 ring-primary' : ''}`}
              >
                {preset}
              </Button>
            ))}
            <Button
              variant={autoRotate ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRotate(!autoRotate)}
            >
              <RotateCcw className={`h-3 w-3 ${autoRotate ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Grade Badge and 3D View */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative">
            <div className="absolute top-2 left-2 z-10">
              <Badge variant="outline" className={getGradeColor(gradeResult.grade)}>
                {gradeResult.grade} Cut
              </Badge>
            </div>
            <div className="h-[300px] rounded-xl overflow-hidden border-2 border-primary/30">
              <Suspense fallback={<div className="h-full flex items-center justify-center bg-muted/50">Loading...</div>}>
                <RealisticDiamond3D
                  colorGrade="G"
                  clarityGrade="VVS1"
                  autoRotate={autoRotate}
                  viewMode="faceUp"
                  showControls={true}
                />
              </Suspense>
            </div>
          </div>
          
          <LightPathVisualization params={params} />
        </div>

        {/* Performance Metrics */}
        <div className="grid md:grid-cols-3 gap-6 p-4 bg-muted/30 rounded-xl">
          <PerformanceMeter
            label="Brilliance"
            value={gradeResult.brilliance}
            icon={Sun}
            color="text-amber-400"
          />
          <PerformanceMeter
            label="Fire"
            value={gradeResult.fire}
            icon={Sparkles}
            color="text-red-400"
          />
          <PerformanceMeter
            label="Scintillation"
            value={gradeResult.scintillation}
            icon={Zap}
            color="text-sky-400"
          />
        </div>

        {/* Cut Parameters */}
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <ArrowUp className="h-4 w-4" />
            Adjust Cut Proportions
          </h4>
          
          <div className="grid md:grid-cols-2 gap-6">
            <TooltipProvider>
              {/* Table Percentage */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Tooltip>
                    <TooltipTrigger className="text-sm font-medium cursor-help underline decoration-dotted">
                      Table %
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">The table is the flat top facet. Ideal range: 54-58%</p>
                    </TooltipContent>
                  </Tooltip>
                  <span className="text-sm text-primary font-bold">{params.tablePercentage}%</span>
                </div>
                <Slider
                  value={[params.tablePercentage]}
                  onValueChange={([v]) => handleParamChange('tablePercentage', v)}
                  min={50}
                  max={75}
                  step={0.5}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Small (50%)</span>
                  <span className="text-emerald-400">Ideal</span>
                  <span>Large (75%)</span>
                </div>
              </div>

              {/* Crown Angle */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Tooltip>
                    <TooltipTrigger className="text-sm font-medium cursor-help underline decoration-dotted">
                      Crown Angle
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Angle of crown facets. Affects fire. Ideal: 34-35°</p>
                    </TooltipContent>
                  </Tooltip>
                  <span className="text-sm text-primary font-bold">{params.crownAngle}°</span>
                </div>
                <Slider
                  value={[params.crownAngle]}
                  onValueChange={([v]) => handleParamChange('crownAngle', v)}
                  min={22}
                  max={40}
                  step={0.5}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Flat (22°)</span>
                  <span className="text-emerald-400">Ideal</span>
                  <span>Steep (40°)</span>
                </div>
              </div>

              {/* Pavilion Angle */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Tooltip>
                    <TooltipTrigger className="text-sm font-medium cursor-help underline decoration-dotted">
                      Pavilion Angle
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Angle of pavilion facets. Critical for brilliance. Ideal: 40.6-41°</p>
                    </TooltipContent>
                  </Tooltip>
                  <span className="text-sm text-primary font-bold">{params.pavilionAngle}°</span>
                </div>
                <Slider
                  value={[params.pavilionAngle]}
                  onValueChange={([v]) => handleParamChange('pavilionAngle', v)}
                  min={38}
                  max={48}
                  step={0.2}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Shallow (38°)</span>
                  <span className="text-emerald-400">Ideal</span>
                  <span>Deep (48°)</span>
                </div>
              </div>

              {/* Depth Percentage */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Tooltip>
                    <TooltipTrigger className="text-sm font-medium cursor-help underline decoration-dotted">
                      Depth %
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Total depth relative to diameter. Ideal: 59-63%</p>
                    </TooltipContent>
                  </Tooltip>
                  <span className="text-sm text-primary font-bold">{params.depthPercentage}%</span>
                </div>
                <Slider
                  value={[params.depthPercentage]}
                  onValueChange={([v]) => handleParamChange('depthPercentage', v)}
                  min={55}
                  max={75}
                  step={0.5}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Shallow</span>
                  <span className="text-emerald-400">Ideal</span>
                  <span>Deep</span>
                </div>
              </div>
            </TooltipProvider>
          </div>
        </div>

        {/* Grade Description */}
        <motion.div
          key={gradeResult.grade}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-muted/50 border border-border/50"
        >
          <p className="text-sm text-muted-foreground">{gradeResult.description}</p>
        </motion.div>

        {/* Educational Cards */}
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="h-4 w-4 text-amber-400" />
              <h4 className="font-semibold text-amber-400">Brilliance</h4>
            </div>
            <p className="text-muted-foreground text-xs">
              White light reflected from the diamond. Affected by table size and pavilion angle.
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-red-400" />
              <h4 className="font-semibold text-red-400">Fire</h4>
            </div>
            <p className="text-muted-foreground text-xs">
              Rainbow spectral colors from light dispersion. Enhanced by proper crown angle.
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-sky-500/10 border border-sky-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-sky-400" />
              <h4 className="font-semibold text-sky-400">Scintillation</h4>
            </div>
            <p className="text-muted-foreground text-xs">
              Sparkle pattern when diamond moves. Balance of light and dark areas.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
