import { useState, useMemo, lazy, Suspense } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { cn } from "@/lib/utils";
import { 
  Diamond, 
  Ruler, 
  Scale, 
  Sparkles, 
  Info,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Hand,
  Search,
  ArrowRightLeft,
  CircleDot,
  Layers,
  RotateCcw,
  Box
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Lazy load 3D viewer for performance
const Diamond3DViewer = lazy(() => import("@/components/Diamond3DViewer"));

// Ring size data with inner diameter in mm
const RING_SIZES = [
  { size: 4, diameterMM: 14.9, circumference: 46.8 },
  { size: 5, diameterMM: 15.7, circumference: 49.3 },
  { size: 6, diameterMM: 16.5, circumference: 51.9 },
  { size: 7, diameterMM: 17.3, circumference: 54.4 },
  { size: 8, diameterMM: 18.1, circumference: 56.9 },
  { size: 9, diameterMM: 19.0, circumference: 59.5 },
  { size: 10, diameterMM: 19.8, circumference: 62.1 },
];

// Diamond shape data with mm sizes for different carat weights
const DIAMOND_SHAPES = {
  round: {
    name: "Round Brilliant",
    description: "The most popular and brilliant diamond shape",
    icon: "●",
    sizes: [
      { carat: 0.25, mm: "4.1", depth: "2.5" },
      { carat: 0.50, mm: "5.2", depth: "3.1" },
      { carat: 0.75, mm: "5.8", depth: "3.5" },
      { carat: 1.00, mm: "6.5", depth: "3.9" },
      { carat: 1.25, mm: "6.9", depth: "4.2" },
      { carat: 1.50, mm: "7.4", depth: "4.5" },
      { carat: 1.75, mm: "7.8", depth: "4.7" },
      { carat: 2.00, mm: "8.2", depth: "4.9" },
      { carat: 2.50, mm: "8.8", depth: "5.3" },
      { carat: 3.00, mm: "9.3", depth: "5.6" },
      { carat: 4.00, mm: "10.2", depth: "6.1" },
      { carat: 5.00, mm: "11.0", depth: "6.6" },
    ],
  },
  princess: {
    name: "Princess Cut",
    description: "Square shape with brilliant faceting",
    icon: "◆",
    sizes: [
      { carat: 0.25, mm: "3.3 x 3.3", depth: "2.4" },
      { carat: 0.50, mm: "4.2 x 4.2", depth: "3.0" },
      { carat: 0.75, mm: "4.8 x 4.8", depth: "3.4" },
      { carat: 1.00, mm: "5.5 x 5.5", depth: "3.9" },
      { carat: 1.25, mm: "5.9 x 5.9", depth: "4.2" },
      { carat: 1.50, mm: "6.2 x 6.2", depth: "4.5" },
      { carat: 1.75, mm: "6.5 x 6.5", depth: "4.7" },
      { carat: 2.00, mm: "7.0 x 7.0", depth: "5.0" },
      { carat: 2.50, mm: "7.5 x 7.5", depth: "5.4" },
      { carat: 3.00, mm: "8.0 x 8.0", depth: "5.7" },
      { carat: 4.00, mm: "8.8 x 8.8", depth: "6.3" },
      { carat: 5.00, mm: "9.5 x 9.5", depth: "6.8" },
    ],
  },
  oval: {
    name: "Oval",
    description: "Elongated shape with brilliant sparkle",
    icon: "⬭",
    sizes: [
      { carat: 0.25, mm: "5.0 x 3.5", depth: "2.2" },
      { carat: 0.50, mm: "6.0 x 4.0", depth: "2.6" },
      { carat: 0.75, mm: "7.0 x 5.0", depth: "3.0" },
      { carat: 1.00, mm: "8.0 x 5.5", depth: "3.4" },
      { carat: 1.25, mm: "8.5 x 5.8", depth: "3.6" },
      { carat: 1.50, mm: "9.0 x 6.0", depth: "3.8" },
      { carat: 1.75, mm: "9.5 x 6.3", depth: "4.0" },
      { carat: 2.00, mm: "10.0 x 6.5", depth: "4.2" },
      { carat: 2.50, mm: "10.5 x 7.0", depth: "4.5" },
      { carat: 3.00, mm: "11.0 x 7.5", depth: "4.8" },
      { carat: 4.00, mm: "12.0 x 8.0", depth: "5.2" },
      { carat: 5.00, mm: "13.0 x 8.5", depth: "5.6" },
    ],
  },
  cushion: {
    name: "Cushion Cut",
    description: "Soft square with rounded corners",
    icon: "▢",
    sizes: [
      { carat: 0.25, mm: "3.5 x 3.5", depth: "2.3" },
      { carat: 0.50, mm: "4.5 x 4.5", depth: "2.9" },
      { carat: 0.75, mm: "5.0 x 5.0", depth: "3.3" },
      { carat: 1.00, mm: "5.5 x 5.5", depth: "3.6" },
      { carat: 1.25, mm: "6.0 x 6.0", depth: "3.9" },
      { carat: 1.50, mm: "6.5 x 6.5", depth: "4.2" },
      { carat: 1.75, mm: "6.8 x 6.8", depth: "4.5" },
      { carat: 2.00, mm: "7.0 x 7.0", depth: "4.6" },
      { carat: 2.50, mm: "7.5 x 7.5", depth: "5.0" },
      { carat: 3.00, mm: "8.0 x 8.0", depth: "5.3" },
      { carat: 4.00, mm: "8.8 x 8.8", depth: "5.8" },
      { carat: 5.00, mm: "9.5 x 9.5", depth: "6.2" },
    ],
  },
  emerald: {
    name: "Emerald Cut",
    description: "Elegant rectangular step-cut",
    icon: "▭",
    sizes: [
      { carat: 0.25, mm: "4.5 x 3.0", depth: "2.0" },
      { carat: 0.50, mm: "5.5 x 4.0", depth: "2.6" },
      { carat: 0.75, mm: "6.0 x 4.5", depth: "2.9" },
      { carat: 1.00, mm: "7.0 x 5.0", depth: "3.2" },
      { carat: 1.25, mm: "7.5 x 5.3", depth: "3.5" },
      { carat: 1.50, mm: "8.0 x 5.5", depth: "3.7" },
      { carat: 1.75, mm: "8.3 x 5.8", depth: "3.9" },
      { carat: 2.00, mm: "8.5 x 6.0", depth: "4.0" },
      { carat: 2.50, mm: "9.0 x 6.5", depth: "4.3" },
      { carat: 3.00, mm: "9.5 x 7.0", depth: "4.6" },
      { carat: 4.00, mm: "10.5 x 7.5", depth: "5.0" },
      { carat: 5.00, mm: "11.5 x 8.0", depth: "5.4" },
    ],
  },
  pear: {
    name: "Pear Shape",
    description: "Teardrop shape combining round and marquise",
    icon: "◇",
    sizes: [
      { carat: 0.25, mm: "5.0 x 3.5", depth: "2.1" },
      { carat: 0.50, mm: "6.5 x 4.5", depth: "2.7" },
      { carat: 0.75, mm: "7.5 x 5.0", depth: "3.1" },
      { carat: 1.00, mm: "8.5 x 5.5", depth: "3.4" },
      { carat: 1.25, mm: "9.0 x 5.8", depth: "3.6" },
      { carat: 1.50, mm: "9.5 x 6.0", depth: "3.8" },
      { carat: 1.75, mm: "10.0 x 6.3", depth: "4.0" },
      { carat: 2.00, mm: "10.5 x 6.5", depth: "4.2" },
      { carat: 2.50, mm: "11.0 x 7.0", depth: "4.5" },
      { carat: 3.00, mm: "12.0 x 7.5", depth: "4.8" },
      { carat: 4.00, mm: "13.0 x 8.0", depth: "5.2" },
      { carat: 5.00, mm: "14.0 x 8.5", depth: "5.6" },
    ],
  },
  marquise: {
    name: "Marquise",
    description: "Football-shaped with pointed ends",
    icon: "◇",
    sizes: [
      { carat: 0.25, mm: "6.0 x 3.0", depth: "1.9" },
      { carat: 0.50, mm: "8.0 x 4.0", depth: "2.5" },
      { carat: 0.75, mm: "9.0 x 4.5", depth: "2.8" },
      { carat: 1.00, mm: "10.0 x 5.0", depth: "3.1" },
      { carat: 1.25, mm: "10.5 x 5.3", depth: "3.3" },
      { carat: 1.50, mm: "11.0 x 5.5", depth: "3.5" },
      { carat: 1.75, mm: "11.5 x 5.8", depth: "3.7" },
      { carat: 2.00, mm: "12.0 x 6.0", depth: "3.8" },
      { carat: 2.50, mm: "13.0 x 6.5", depth: "4.1" },
      { carat: 3.00, mm: "14.0 x 7.0", depth: "4.4" },
      { carat: 4.00, mm: "15.0 x 7.5", depth: "4.8" },
      { carat: 5.00, mm: "16.0 x 8.0", depth: "5.1" },
    ],
  },
  heart: {
    name: "Heart Shape",
    description: "Romantic symbol of love",
    icon: "♥",
    sizes: [
      { carat: 0.25, mm: "4.0 x 4.0", depth: "2.4" },
      { carat: 0.50, mm: "5.0 x 5.0", depth: "3.0" },
      { carat: 0.75, mm: "5.5 x 5.5", depth: "3.4" },
      { carat: 1.00, mm: "6.5 x 6.5", depth: "3.9" },
      { carat: 1.25, mm: "7.0 x 7.0", depth: "4.2" },
      { carat: 1.50, mm: "7.5 x 7.5", depth: "4.5" },
      { carat: 1.75, mm: "7.8 x 7.8", depth: "4.7" },
      { carat: 2.00, mm: "8.0 x 8.0", depth: "4.8" },
      { carat: 2.50, mm: "8.5 x 8.5", depth: "5.2" },
      { carat: 3.00, mm: "9.0 x 9.0", depth: "5.5" },
      { carat: 4.00, mm: "10.0 x 10.0", depth: "6.0" },
      { carat: 5.00, mm: "11.0 x 11.0", depth: "6.5" },
    ],
  },
  radiant: {
    name: "Radiant Cut",
    description: "Trimmed corners with brilliant facets",
    icon: "◈",
    sizes: [
      { carat: 0.25, mm: "3.5 x 3.0", depth: "2.2" },
      { carat: 0.50, mm: "4.5 x 4.0", depth: "2.8" },
      { carat: 0.75, mm: "5.0 x 4.5", depth: "3.2" },
      { carat: 1.00, mm: "5.5 x 5.0", depth: "3.5" },
      { carat: 1.25, mm: "6.0 x 5.5", depth: "3.8" },
      { carat: 1.50, mm: "6.5 x 5.8", depth: "4.0" },
      { carat: 1.75, mm: "7.0 x 6.0", depth: "4.2" },
      { carat: 2.00, mm: "7.3 x 6.5", depth: "4.5" },
      { carat: 2.50, mm: "7.8 x 7.0", depth: "4.8" },
      { carat: 3.00, mm: "8.3 x 7.5", depth: "5.1" },
      { carat: 4.00, mm: "9.0 x 8.0", depth: "5.5" },
      { carat: 5.00, mm: "9.8 x 8.5", depth: "5.9" },
    ],
  },
  asscher: {
    name: "Asscher Cut",
    description: "Square step-cut with cropped corners",
    icon: "◇",
    sizes: [
      { carat: 0.25, mm: "3.3 x 3.3", depth: "2.3" },
      { carat: 0.50, mm: "4.2 x 4.2", depth: "2.9" },
      { carat: 0.75, mm: "4.8 x 4.8", depth: "3.3" },
      { carat: 1.00, mm: "5.5 x 5.5", depth: "3.8" },
      { carat: 1.25, mm: "5.9 x 5.9", depth: "4.1" },
      { carat: 1.50, mm: "6.2 x 6.2", depth: "4.3" },
      { carat: 1.75, mm: "6.5 x 6.5", depth: "4.5" },
      { carat: 2.00, mm: "7.0 x 7.0", depth: "4.8" },
      { carat: 2.50, mm: "7.5 x 7.5", depth: "5.2" },
      { carat: 3.00, mm: "8.0 x 8.0", depth: "5.5" },
      { carat: 4.00, mm: "8.8 x 8.8", depth: "6.0" },
      { carat: 5.00, mm: "9.5 x 9.5", depth: "6.5" },
    ],
  },
};

type ShapeKey = keyof typeof DIAMOND_SHAPES;

// Diamond shape SVG components
const DiamondShapeSVG = ({ shape, size = 100, className }: { shape: ShapeKey; size?: number; className?: string }) => {
  const shapes: Record<ShapeKey, JSX.Element> = {
    round: (
      <svg viewBox="0 0 100 100" className={className} style={{ width: size, height: size }}>
        <defs>
          <linearGradient id="diamondGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--diamond-from))" />
            <stop offset="100%" stopColor="hsl(var(--diamond-to))" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="45" fill="url(#diamondGradient)" opacity="0.3" />
        <circle cx="50" cy="50" r="45" fill="none" stroke="url(#diamondGradient)" strokeWidth="2" />
        <circle cx="50" cy="50" r="35" fill="none" stroke="url(#diamondGradient)" strokeWidth="1" opacity="0.5" />
      </svg>
    ),
    princess: (
      <svg viewBox="0 0 100 100" className={className} style={{ width: size, height: size }}>
        <rect x="10" y="10" width="80" height="80" fill="url(#diamondGradient)" opacity="0.3" />
        <rect x="10" y="10" width="80" height="80" fill="none" stroke="url(#diamondGradient)" strokeWidth="2" />
        <line x1="10" y1="10" x2="90" y2="90" stroke="url(#diamondGradient)" strokeWidth="1" opacity="0.5" />
        <line x1="90" y1="10" x2="10" y2="90" stroke="url(#diamondGradient)" strokeWidth="1" opacity="0.5" />
      </svg>
    ),
    oval: (
      <svg viewBox="0 0 100 100" className={className} style={{ width: size, height: size }}>
        <ellipse cx="50" cy="50" rx="40" ry="28" fill="url(#diamondGradient)" opacity="0.3" />
        <ellipse cx="50" cy="50" rx="40" ry="28" fill="none" stroke="url(#diamondGradient)" strokeWidth="2" />
        <ellipse cx="50" cy="50" rx="30" ry="20" fill="none" stroke="url(#diamondGradient)" strokeWidth="1" opacity="0.5" />
      </svg>
    ),
    cushion: (
      <svg viewBox="0 0 100 100" className={className} style={{ width: size, height: size }}>
        <rect x="10" y="10" width="80" height="80" rx="15" fill="url(#diamondGradient)" opacity="0.3" />
        <rect x="10" y="10" width="80" height="80" rx="15" fill="none" stroke="url(#diamondGradient)" strokeWidth="2" />
        <rect x="20" y="20" width="60" height="60" rx="10" fill="none" stroke="url(#diamondGradient)" strokeWidth="1" opacity="0.5" />
      </svg>
    ),
    emerald: (
      <svg viewBox="0 0 100 100" className={className} style={{ width: size, height: size }}>
        <polygon points="15,20 85,20 90,80 10,80" fill="url(#diamondGradient)" opacity="0.3" />
        <polygon points="15,20 85,20 90,80 10,80" fill="none" stroke="url(#diamondGradient)" strokeWidth="2" />
        <line x1="25" y1="35" x2="75" y2="35" stroke="url(#diamondGradient)" strokeWidth="1" opacity="0.5" />
        <line x1="20" y1="50" x2="80" y2="50" stroke="url(#diamondGradient)" strokeWidth="1" opacity="0.5" />
        <line x1="18" y1="65" x2="82" y2="65" stroke="url(#diamondGradient)" strokeWidth="1" opacity="0.5" />
      </svg>
    ),
    pear: (
      <svg viewBox="0 0 100 100" className={className} style={{ width: size, height: size }}>
        <path d="M50 10 C20 40, 15 65, 50 95 C85 65, 80 40, 50 10" fill="url(#diamondGradient)" opacity="0.3" />
        <path d="M50 10 C20 40, 15 65, 50 95 C85 65, 80 40, 50 10" fill="none" stroke="url(#diamondGradient)" strokeWidth="2" />
      </svg>
    ),
    marquise: (
      <svg viewBox="0 0 100 100" className={className} style={{ width: size, height: size }}>
        <ellipse cx="50" cy="50" rx="45" ry="25" fill="url(#diamondGradient)" opacity="0.3" />
        <ellipse cx="50" cy="50" rx="45" ry="25" fill="none" stroke="url(#diamondGradient)" strokeWidth="2" />
        <line x1="5" y1="50" x2="95" y2="50" stroke="url(#diamondGradient)" strokeWidth="1" opacity="0.5" />
      </svg>
    ),
    heart: (
      <svg viewBox="0 0 100 100" className={className} style={{ width: size, height: size }}>
        <path d="M50 88 C20 60, 5 40, 25 20 C40 8, 50 20, 50 30 C50 20, 60 8, 75 20 C95 40, 80 60, 50 88" fill="url(#diamondGradient)" opacity="0.3" />
        <path d="M50 88 C20 60, 5 40, 25 20 C40 8, 50 20, 50 30 C50 20, 60 8, 75 20 C95 40, 80 60, 50 88" fill="none" stroke="url(#diamondGradient)" strokeWidth="2" />
      </svg>
    ),
    radiant: (
      <svg viewBox="0 0 100 100" className={className} style={{ width: size, height: size }}>
        <polygon points="20,10 80,10 95,50 80,90 20,90 5,50" fill="url(#diamondGradient)" opacity="0.3" />
        <polygon points="20,10 80,10 95,50 80,90 20,90 5,50" fill="none" stroke="url(#diamondGradient)" strokeWidth="2" />
      </svg>
    ),
    asscher: (
      <svg viewBox="0 0 100 100" className={className} style={{ width: size, height: size }}>
        <polygon points="20,5 80,5 95,20 95,80 80,95 20,95 5,80 5,20" fill="url(#diamondGradient)" opacity="0.3" />
        <polygon points="20,5 80,5 95,20 95,80 80,95 20,95 5,80 5,20" fill="none" stroke="url(#diamondGradient)" strokeWidth="2" />
        <polygon points="30,15 70,15 85,30 85,70 70,85 30,85 15,70 15,30" fill="none" stroke="url(#diamondGradient)" strokeWidth="1" opacity="0.5" />
      </svg>
    ),
  };

  return shapes[shape] || null;
};

// Shape colors for multi-overlay comparison
const SHAPE_COLORS: Record<ShapeKey, string> = {
  round: "hsl(var(--primary))",
  princess: "hsl(280, 70%, 50%)",
  oval: "hsl(200, 70%, 50%)",
  cushion: "hsl(340, 70%, 50%)",
  emerald: "hsl(160, 70%, 50%)",
  pear: "hsl(30, 70%, 50%)",
  marquise: "hsl(60, 70%, 50%)",
  heart: "hsl(0, 70%, 50%)",
  radiant: "hsl(220, 70%, 50%)",
  asscher: "hsl(120, 70%, 50%)",
};

const DiamondSizingChart = () => {
  const [selectedShape, setSelectedShape] = useState<ShapeKey>("round");
  const [selectedCaratIndex, setSelectedCaratIndex] = useState(3); // Default to 1.00 carat
  const [compareMode, setCompareMode] = useState(false);
  const [compareShape, setCompareShape] = useState<ShapeKey>("princess");
  
  // MM to Carat lookup state
  const [mmInput, setMmInput] = useState("");
  const [mmWidthInput, setMmWidthInput] = useState("");
  
  // Ring size overlay state
  const [selectedRingSize, setSelectedRingSize] = useState(6);
  const [showRingOverlay, setShowRingOverlay] = useState(false);

  // Multi-shape overlay state
  const [multiOverlayMode, setMultiOverlayMode] = useState(false);
  const [selectedShapesForOverlay, setSelectedShapesForOverlay] = useState<ShapeKey[]>(["round", "oval", "princess"]);
  const [overlayCaratIndex, setOverlayCaratIndex] = useState(3); // Default to 1.00 carat

  // 3D Viewer state
  const [autoRotate3D, setAutoRotate3D] = useState(true);

  const shapeData = DIAMOND_SHAPES[selectedShape];
  const compareShapeData = DIAMOND_SHAPES[compareShape];
  const selectedSize = shapeData.sizes[selectedCaratIndex];
  const compareSize = compareShapeData.sizes[selectedCaratIndex];

  // Calculate visual scale based on carat weight
  const getVisualScale = (carat: number) => {
    const baseScale = 60;
    const scale = baseScale + (carat * 30);
    return Math.min(scale, 200);
  };

  // Toggle shape in multi-overlay selection
  const toggleShapeForOverlay = (shape: ShapeKey) => {
    setSelectedShapesForOverlay(prev => {
      if (prev.includes(shape)) {
        // Don't allow removing if only 2 shapes selected
        if (prev.length <= 2) return prev;
        return prev.filter(s => s !== shape);
      }
      // Max 5 shapes
      if (prev.length >= 5) return prev;
      return [...prev, shape];
    });
  };

  // Get overlay scale (consistent across all shapes for comparison)
  const getOverlayScale = (mmString: string) => {
    const parsed = parseMM(mmString);
    if (!parsed) return 80;
    // Use larger dimension for scaling
    const maxDim = Math.max(parsed.length, parsed.width);
    return maxDim * 10; // 10 pixels per mm
  };

  // Parse mm value from string (handles "x.x x x.x" format)
  const parseMM = (mmString: string): { length: number; width: number } | null => {
    const cleaned = mmString.replace(/\s+/g, "");
    if (cleaned.includes("x")) {
      const parts = cleaned.split("x").map(p => parseFloat(p));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return { length: parts[0], width: parts[1] };
      }
    } else {
      const val = parseFloat(cleaned);
      if (!isNaN(val)) {
        return { length: val, width: val };
      }
    }
    return null;
  };

  // MM to Carat reverse lookup
  const mmToCaratResults = useMemo(() => {
    const searchLength = parseFloat(mmInput);
    const searchWidth = mmWidthInput ? parseFloat(mmWidthInput) : searchLength;
    
    if (isNaN(searchLength) || searchLength <= 0) return [];
    
    const results: Array<{
      shape: ShapeKey;
      shapeName: string;
      carat: number;
      mm: string;
      matchScore: number;
    }> = [];
    
    (Object.keys(DIAMOND_SHAPES) as ShapeKey[]).forEach(shape => {
      const shapeInfo = DIAMOND_SHAPES[shape];
      
      shapeInfo.sizes.forEach(size => {
        const parsed = parseMM(size.mm);
        if (!parsed) return;
        
        // Calculate match score (lower is better)
        const lengthDiff = Math.abs(parsed.length - searchLength);
        const widthDiff = Math.abs(parsed.width - searchWidth);
        const matchScore = lengthDiff + widthDiff;
        
        // Only include if reasonably close (within 2mm)
        if (matchScore <= 4) {
          results.push({
            shape,
            shapeName: shapeInfo.name,
            carat: size.carat,
            mm: size.mm,
            matchScore
          });
        }
      });
    });
    
    // Sort by match score
    return results.sort((a, b) => a.matchScore - b.matchScore).slice(0, 10);
  }, [mmInput, mmWidthInput]);

  // Get ring diameter for visual
  const getRingDiameter = (ringSize: number) => {
    const ring = RING_SIZES.find(r => r.size === ringSize);
    return ring?.diameterMM || 16.5;
  };

  // Scale for ring overlay visualization (pixels per mm)
  const ringScale = 8;

  // Get carat weight for overlay
  const overlayCaratWeight = DIAMOND_SHAPES.round.sizes[overlayCaratIndex]?.carat || 1;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-diamond-from/10 via-background to-gemstone-from/10 py-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-diamond-from/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-gemstone-from/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-sm mb-6">
                <Diamond className="h-4 w-4 text-primary" />
                <span className="text-primary font-medium">Interactive Size Guide</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Diamond Sizing Chart
              </h1>
              <p className="text-lg text-muted-foreground">
                Explore diamond dimensions across all shapes. Compare carat weights, 
                millimeter sizes, and visualize how each shape looks at different sizes.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        {/* Shape Selector */}
        <ScrollReveal>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Select Diamond Shape
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3">
              {(Object.keys(DIAMOND_SHAPES) as ShapeKey[]).map((shape) => (
                <motion.button
                  key={shape}
                  onClick={() => setSelectedShape(shape)}
                  className={cn(
                    "relative p-4 rounded-xl border-2 transition-all duration-300",
                    selectedShape === shape
                      ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <DiamondShapeSVG shape={shape} size={40} className="mx-auto mb-2" />
                  <span className="text-xs font-medium block text-center">
                    {DIAMOND_SHAPES[shape].name.split(" ")[0]}
                  </span>
                  {selectedShape === shape && (
                    <motion.div
                      layoutId="shapeIndicator"
                      className="absolute inset-0 border-2 border-primary rounded-xl"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Visual Preview */}
          <ScrollReveal delay={0.1}>
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-diamond-from/10 to-gemstone-from/10">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ZoomIn className="h-5 w-5" />
                      {shapeData.name}
                    </CardTitle>
                    <CardDescription>{shapeData.description}</CardDescription>
                  </div>
                  <Button
                    variant={compareMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCompareMode(!compareMode)}
                  >
                    Compare
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Size Preview */}
                <div className="relative h-64 flex items-center justify-center bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl mb-6">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-px border-t border-dashed border-muted-foreground/30" />
                    <div className="absolute h-full w-px border-l border-dashed border-muted-foreground/30" />
                  </div>
                  
                  <div className={cn("flex items-center gap-8", compareMode && "gap-16")}>
                    <motion.div
                      key={`${selectedShape}-${selectedCaratIndex}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      className="flex flex-col items-center"
                    >
                      <DiamondShapeSVG 
                        shape={selectedShape} 
                        size={getVisualScale(selectedSize.carat)} 
                      />
                      <Badge variant="secondary" className="mt-3">
                        {selectedSize.carat} ct
                      </Badge>
                    </motion.div>

                    <AnimatePresence>
                      {compareMode && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0, x: -20 }}
                          animate={{ scale: 1, opacity: 1, x: 0 }}
                          exit={{ scale: 0, opacity: 0, x: -20 }}
                          className="flex flex-col items-center"
                        >
                          <DiamondShapeSVG 
                            shape={compareShape} 
                            size={getVisualScale(compareSize.carat)} 
                          />
                          <Badge variant="outline" className="mt-3">
                            {compareSize.carat} ct
                          </Badge>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Compare Shape Selector */}
                <AnimatePresence>
                  {compareMode && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mb-6 overflow-hidden"
                    >
                      <p className="text-sm text-muted-foreground mb-3">Compare with:</p>
                      <div className="flex flex-wrap gap-2">
                        {(Object.keys(DIAMOND_SHAPES) as ShapeKey[])
                          .filter((s) => s !== selectedShape)
                          .map((shape) => (
                            <Button
                              key={shape}
                              variant={compareShape === shape ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCompareShape(shape)}
                              className="gap-2"
                            >
                              <DiamondShapeSVG shape={shape} size={16} />
                              {DIAMOND_SHAPES[shape].name.split(" ")[0]}
                            </Button>
                          ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Carat Slider */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Scale className="h-4 w-4" />
                      Carat Weight
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      {selectedSize.carat} ct
                    </span>
                  </div>
                  <Slider
                    value={[selectedCaratIndex]}
                    onValueChange={(value) => setSelectedCaratIndex(value[0])}
                    max={shapeData.sizes.length - 1}
                    step={1}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{shapeData.sizes[0].carat} ct</span>
                    <span>{shapeData.sizes[shapeData.sizes.length - 1].carat} ct</span>
                  </div>
                </div>

                {/* Size Details */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <Ruler className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">Dimensions</p>
                    <p className="text-lg font-semibold">{selectedSize.mm} mm</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <Diamond className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">Depth</p>
                    <p className="text-lg font-semibold">{selectedSize.depth} mm</p>
                  </div>
                </div>

                {/* Finger Reference */}
                <div className="mt-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
                  <div className="flex items-start gap-3">
                    <Hand className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">On-Finger Reference</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        A {selectedSize.carat} carat {shapeData.name.toLowerCase()} measures approximately {selectedSize.mm} mm, 
                        which appears {selectedSize.carat >= 1.5 ? "substantial" : selectedSize.carat >= 1 ? "elegant" : "delicate"} on an average ring finger.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Size Table */}
          <ScrollReveal delay={0.2}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="h-5 w-5" />
                  Complete Size Chart - {shapeData.name}
                </CardTitle>
                <CardDescription>
                  All measurements are approximate and may vary based on cut quality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-4 py-3 text-left text-sm font-semibold">Carat</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Dimensions (mm)</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Depth (mm)</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold">Visual</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shapeData.sizes.map((size, index) => (
                          <motion.tr
                            key={size.carat}
                            className={cn(
                              "border-t transition-colors cursor-pointer",
                              index === selectedCaratIndex
                                ? "bg-primary/10"
                                : "hover:bg-muted/30"
                            )}
                            onClick={() => setSelectedCaratIndex(index)}
                            whileHover={{ backgroundColor: "rgba(var(--primary), 0.05)" }}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={index === selectedCaratIndex ? "default" : "outline"}
                                  className="font-mono"
                                >
                                  {size.carat} ct
                                </Badge>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-medium">{size.mm}</td>
                            <td className="px-4 py-3 text-muted-foreground">{size.depth}</td>
                            <td className="px-4 py-3">
                              <div className="flex justify-center">
                                <div 
                                  className="rounded-full bg-gradient-to-br from-diamond-from to-diamond-to opacity-60"
                                  style={{ 
                                    width: Math.max(8, size.carat * 12),
                                    height: Math.max(8, size.carat * 12)
                                  }}
                                />
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Info Note */}
                <div className="mt-4 p-4 rounded-lg bg-muted/30 border">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground mb-1">Important Notes:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Dimensions vary based on cut depth and proportions</li>
                        <li>Fancy shapes may appear larger than rounds at same carat weight</li>
                        <li>Length-to-width ratios affect perceived size</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>

        {/* 3D Diamond Viewer */}
        <ScrollReveal delay={0.25}>
          <Card className="mt-8">
            <CardHeader className="bg-gradient-to-r from-slate-900/10 via-primary/10 to-slate-900/10">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Box className="h-5 w-5" />
                    3D Diamond Viewer
                  </CardTitle>
                  <CardDescription>
                    Rotate and explore diamond shapes in 3D - click and drag to rotate
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="auto-rotate"
                      checked={autoRotate3D}
                      onCheckedChange={setAutoRotate3D}
                    />
                    <Label htmlFor="auto-rotate" className="text-sm">
                      Auto-rotate
                    </Label>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid lg:grid-cols-2">
                {/* 3D Viewer */}
                <div className="h-[400px] relative">
                  <Suspense fallback={
                    <div className="w-full h-full flex items-center justify-center bg-slate-900">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span>Loading 3D viewer...</span>
                      </div>
                    </div>
                  }>
                    <Diamond3DViewer 
                      shape={selectedShape} 
                      autoRotate={autoRotate3D}
                      color="#ffffff"
                    />
                  </Suspense>
                  
                  {/* Shape Badge Overlay */}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-background/80 backdrop-blur-sm text-foreground border">
                      {shapeData.name}
                    </Badge>
                  </div>
                  
                  {/* Controls Hint */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-center gap-4 text-xs text-white/60">
                      <span className="flex items-center gap-1">
                        <RotateCcw className="h-3 w-3" /> Drag to rotate
                      </span>
                      <span>Scroll to zoom</span>
                    </div>
                  </div>
                </div>
                
                {/* Shape Quick Selector */}
                <div className="p-6 bg-muted/30">
                  <h3 className="text-sm font-medium mb-4">Select Shape to View</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {(Object.keys(DIAMOND_SHAPES) as ShapeKey[]).map((shape) => (
                      <motion.button
                        key={shape}
                        onClick={() => setSelectedShape(shape)}
                        className={cn(
                          "p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2",
                          selectedShape === shape
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <DiamondShapeSVG shape={shape} size={32} />
                        <span className="text-[10px] font-medium">
                          {DIAMOND_SHAPES[shape].name.split(" ")[0]}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 rounded-lg bg-background border">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Info className="h-4 w-4 text-primary" />
                      About {shapeData.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {shapeData.description}. At 1 carat, this shape measures approximately {DIAMOND_SHAPES[selectedShape].sizes.find(s => s.carat === 1)?.mm} mm.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* MM to Carat Reverse Lookup */}
        <ScrollReveal delay={0.3}>
          <Card className="mt-8">
            <CardHeader className="bg-gradient-to-r from-gemstone-from/10 to-diamond-from/10">
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5" />
                MM to Carat Lookup
              </CardTitle>
              <CardDescription>
                Enter millimeter dimensions to find approximate carat weight
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mm-length" className="text-sm font-medium">
                        Length (mm)
                      </Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="mm-length"
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder="e.g., 6.5"
                          value={mmInput}
                          onChange={(e) => setMmInput(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mm-width" className="text-sm font-medium">
                        Width (mm) <span className="text-muted-foreground text-xs">(optional)</span>
                      </Label>
                      <Input
                        id="mm-width"
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="Same as length"
                        value={mmWidthInput}
                        onChange={(e) => setMmWidthInput(e.target.value)}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter length for round diamonds, or both length and width for fancy shapes
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium">Matching Results</p>
                  {mmToCaratResults.length > 0 ? (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                      {mmToCaratResults.map((result, index) => (
                        <motion.div
                          key={`${result.shape}-${result.carat}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                            result.matchScore < 0.5 
                              ? "bg-primary/10 border-primary/30" 
                              : "bg-muted/30 hover:bg-muted/50"
                          )}
                          onClick={() => {
                            setSelectedShape(result.shape);
                            const idx = DIAMOND_SHAPES[result.shape].sizes.findIndex(s => s.carat === result.carat);
                            if (idx !== -1) setSelectedCaratIndex(idx);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <DiamondShapeSVG shape={result.shape} size={24} />
                            <div>
                              <p className="font-medium text-sm">{result.shapeName}</p>
                              <p className="text-xs text-muted-foreground">{result.mm} mm</p>
                            </div>
                          </div>
                          <Badge variant={result.matchScore < 0.5 ? "default" : "secondary"}>
                            ~{result.carat} ct
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  ) : mmInput ? (
                    <div className="p-4 rounded-lg bg-muted/30 text-center text-muted-foreground">
                      <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No matching sizes found</p>
                      <p className="text-xs mt-1">Try adjusting your measurements</p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-muted/30 text-center text-muted-foreground">
                      <Ruler className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Enter dimensions to search</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Ring Size Overlay */}
        <ScrollReveal delay={0.4}>
          <Card className="mt-8">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-gemstone-from/10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CircleDot className="h-5 w-5" />
                    Ring Size Overlay
                  </CardTitle>
                  <CardDescription>
                    See how diamonds look on different finger sizes
                  </CardDescription>
                </div>
                <Button
                  variant={showRingOverlay ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowRingOverlay(!showRingOverlay)}
                >
                  {showRingOverlay ? "Hide Overlay" : "Show Overlay"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <AnimatePresence mode="wait">
                {showRingOverlay ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-6"
                  >
                    {/* Ring Size Selector */}
                    <div className="flex flex-wrap gap-2 justify-center">
                      {RING_SIZES.map((ring) => (
                        <Button
                          key={ring.size}
                          variant={selectedRingSize === ring.size ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedRingSize(ring.size)}
                          className="min-w-[60px]"
                        >
                          Size {ring.size}
                        </Button>
                      ))}
                    </div>

                    {/* Visual Overlay */}
                    <div className="relative flex items-center justify-center py-8">
                      {/* Finger representation */}
                      <div className="relative">
                        {/* Finger shape */}
                        <motion.div
                          className="relative bg-gradient-to-b from-amber-200/60 to-amber-300/60 dark:from-amber-800/40 dark:to-amber-900/40 rounded-t-full"
                          style={{
                            width: getRingDiameter(selectedRingSize) * ringScale + 20,
                            height: 200,
                          }}
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring" }}
                        >
                          {/* Ring band */}
                          <div 
                            className="absolute top-8 left-1/2 -translate-x-1/2 rounded-full border-4 border-yellow-500/80 dark:border-yellow-400/60"
                            style={{
                              width: getRingDiameter(selectedRingSize) * ringScale + 16,
                              height: 24,
                            }}
                          />
                          
                          {/* Diamond on ring */}
                          <motion.div
                            className="absolute left-1/2 -translate-x-1/2"
                            style={{ top: -10 }}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                          >
                            <DiamondShapeSVG 
                              shape={selectedShape} 
                              size={parseFloat(selectedSize.mm.split("x")[0] || selectedSize.mm) * ringScale}
                            />
                          </motion.div>
                        </motion.div>

                        {/* Size info */}
                        <div className="absolute -right-32 top-1/2 -translate-y-1/2 text-sm space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-primary/60" />
                            <span className="text-muted-foreground">Ring Size {selectedRingSize}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                            <span className="text-muted-foreground">{getRingDiameter(selectedRingSize)} mm</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ring Size Reference Table */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                      {RING_SIZES.map((ring) => (
                        <motion.div
                          key={ring.size}
                          className={cn(
                            "p-3 rounded-lg text-center border transition-all cursor-pointer",
                            selectedRingSize === ring.size
                              ? "bg-primary/10 border-primary"
                              : "bg-muted/30 hover:bg-muted/50"
                          )}
                          onClick={() => setSelectedRingSize(ring.size)}
                          whileHover={{ scale: 1.02 }}
                        >
                          <p className="font-semibold">Size {ring.size}</p>
                          <p className="text-xs text-muted-foreground">{ring.diameterMM} mm</p>
                        </motion.div>
                      ))}
                    </div>

                    {/* Comparison Info */}
                    <div className="p-4 rounded-lg bg-muted/30 border">
                      <div className="flex items-start gap-3">
                        <Hand className="h-5 w-5 text-primary mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium mb-1">
                            {selectedSize.carat} ct {shapeData.name} on Size {selectedRingSize} Finger
                          </p>
                          <p className="text-muted-foreground">
                            Diamond measures {selectedSize.mm} mm on a finger with {getRingDiameter(selectedRingSize)} mm diameter. 
                            {" "}
                            {parseFloat(selectedSize.mm.split("x")[0] || selectedSize.mm) / getRingDiameter(selectedRingSize) > 0.45
                              ? "The diamond will appear substantial and eye-catching."
                              : parseFloat(selectedSize.mm.split("x")[0] || selectedSize.mm) / getRingDiameter(selectedRingSize) > 0.35
                              ? "The diamond will have a balanced, elegant appearance."
                              : "The diamond will appear delicate and subtle."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 text-muted-foreground"
                  >
                    <Hand className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Click "Show Overlay" to visualize diamond sizes on different ring sizes</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Multi-Shape Overlay Comparison */}
        <ScrollReveal delay={0.45}>
          <Card className="mt-8">
            <CardHeader className="bg-gradient-to-r from-diamond-from/10 via-primary/10 to-gemstone-from/10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    Multi-Shape Overlay
                  </CardTitle>
                  <CardDescription>
                    Compare multiple diamond shapes at the same carat weight overlaid on each other
                  </CardDescription>
                </div>
                <Button
                  variant={multiOverlayMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMultiOverlayMode(!multiOverlayMode)}
                >
                  {multiOverlayMode ? "Hide Overlay" : "Compare Shapes"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <AnimatePresence mode="wait">
                {multiOverlayMode ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-6"
                  >
                    {/* Shape Selection */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Select shapes to compare (2-5)</p>
                        <Badge variant="secondary">{selectedShapesForOverlay.length} selected</Badge>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2">
                        {(Object.keys(DIAMOND_SHAPES) as ShapeKey[]).map((shape) => {
                          const isSelected = selectedShapesForOverlay.includes(shape);
                          return (
                            <motion.button
                              key={shape}
                              onClick={() => toggleShapeForOverlay(shape)}
                              className={cn(
                                "relative p-3 rounded-lg border-2 transition-all",
                                isSelected
                                  ? "border-primary bg-primary/10"
                                  : "border-border hover:border-primary/50"
                              )}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <DiamondShapeSVG shape={shape} size={28} className="mx-auto" />
                              <span className="text-[10px] block text-center mt-1 font-medium">
                                {DIAMOND_SHAPES[shape].name.split(" ")[0]}
                              </span>
                              {isSelected && (
                                <div 
                                  className="absolute top-1 right-1 w-2 h-2 rounded-full"
                                  style={{ backgroundColor: SHAPE_COLORS[shape] }}
                                />
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Carat Weight Slider */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium flex items-center gap-2">
                          <Scale className="h-4 w-4" />
                          Carat Weight
                        </span>
                        <Badge className="text-lg px-3 py-1">{overlayCaratWeight} ct</Badge>
                      </div>
                      <Slider
                        value={[overlayCaratIndex]}
                        onValueChange={(value) => setOverlayCaratIndex(value[0])}
                        max={DIAMOND_SHAPES.round.sizes.length - 1}
                        step={1}
                        className="py-4"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{DIAMOND_SHAPES.round.sizes[0].carat} ct</span>
                        <span>{DIAMOND_SHAPES.round.sizes[DIAMOND_SHAPES.round.sizes.length - 1].carat} ct</span>
                      </div>
                    </div>

                    {/* Overlay Visualization */}
                    <div className="relative h-80 flex items-center justify-center bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl overflow-hidden">
                      {/* Grid lines */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-full h-px border-t border-dashed border-muted-foreground/20" />
                        <div className="absolute h-full w-px border-l border-dashed border-muted-foreground/20" />
                      </div>

                      {/* Overlaid shapes */}
                      <div className="relative">
                        {selectedShapesForOverlay.map((shape, index) => {
                          const shapeInfo = DIAMOND_SHAPES[shape];
                          const sizeData = shapeInfo.sizes[overlayCaratIndex];
                          if (!sizeData) return null;
                          
                          const parsed = parseMM(sizeData.mm);
                          if (!parsed) return null;
                          
                          const width = parsed.length * 12;
                          const height = parsed.width * 12;
                          
                          return (
                            <motion.div
                              key={shape}
                              className="absolute"
                              style={{
                                left: "50%",
                                top: "50%",
                                transform: "translate(-50%, -50%)",
                                zIndex: selectedShapesForOverlay.length - index,
                              }}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 0.7 }}
                              transition={{ delay: index * 0.1, type: "spring" }}
                            >
                              <svg 
                                viewBox="0 0 100 100" 
                                style={{ 
                                  width: width, 
                                  height: height,
                                  filter: `drop-shadow(0 0 8px ${SHAPE_COLORS[shape]}40)`
                                }}
                              >
                                <defs>
                                  <linearGradient id={`overlay-gradient-${shape}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor={SHAPE_COLORS[shape]} stopOpacity="0.6" />
                                    <stop offset="100%" stopColor={SHAPE_COLORS[shape]} stopOpacity="0.3" />
                                  </linearGradient>
                                </defs>
                                {shape === "round" && (
                                  <circle cx="50" cy="50" r="45" fill={`url(#overlay-gradient-${shape})`} stroke={SHAPE_COLORS[shape]} strokeWidth="2" />
                                )}
                                {shape === "princess" && (
                                  <rect x="5" y="5" width="90" height="90" fill={`url(#overlay-gradient-${shape})`} stroke={SHAPE_COLORS[shape]} strokeWidth="2" />
                                )}
                                {shape === "oval" && (
                                  <ellipse cx="50" cy="50" rx="45" ry="35" fill={`url(#overlay-gradient-${shape})`} stroke={SHAPE_COLORS[shape]} strokeWidth="2" />
                                )}
                                {shape === "cushion" && (
                                  <rect x="5" y="5" width="90" height="90" rx="20" fill={`url(#overlay-gradient-${shape})`} stroke={SHAPE_COLORS[shape]} strokeWidth="2" />
                                )}
                                {shape === "emerald" && (
                                  <polygon points="10,15 90,15 95,85 5,85" fill={`url(#overlay-gradient-${shape})`} stroke={SHAPE_COLORS[shape]} strokeWidth="2" />
                                )}
                                {shape === "pear" && (
                                  <path d="M50 5 C15 35, 10 65, 50 95 C90 65, 85 35, 50 5" fill={`url(#overlay-gradient-${shape})`} stroke={SHAPE_COLORS[shape]} strokeWidth="2" />
                                )}
                                {shape === "marquise" && (
                                  <ellipse cx="50" cy="50" rx="48" ry="28" fill={`url(#overlay-gradient-${shape})`} stroke={SHAPE_COLORS[shape]} strokeWidth="2" />
                                )}
                                {shape === "heart" && (
                                  <path d="M50 90 C15 55, 0 35, 22 15 C38 3, 50 18, 50 28 C50 18, 62 3, 78 15 C100 35, 85 55, 50 90" fill={`url(#overlay-gradient-${shape})`} stroke={SHAPE_COLORS[shape]} strokeWidth="2" />
                                )}
                                {shape === "radiant" && (
                                  <polygon points="15,5 85,5 98,50 85,95 15,95 2,50" fill={`url(#overlay-gradient-${shape})`} stroke={SHAPE_COLORS[shape]} strokeWidth="2" />
                                )}
                                {shape === "asscher" && (
                                  <polygon points="15,5 85,5 95,15 95,85 85,95 15,95 5,85 5,15" fill={`url(#overlay-gradient-${shape})`} stroke={SHAPE_COLORS[shape]} strokeWidth="2" />
                                )}
                              </svg>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap justify-center gap-3">
                      {selectedShapesForOverlay.map((shape) => {
                        const sizeData = DIAMOND_SHAPES[shape].sizes[overlayCaratIndex];
                        return (
                          <motion.div
                            key={shape}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: SHAPE_COLORS[shape] }}
                            />
                            <span className="text-sm font-medium">{DIAMOND_SHAPES[shape].name.split(" ")[0]}</span>
                            <span className="text-xs text-muted-foreground">{sizeData?.mm} mm</span>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Size Comparison Table */}
                    <div className="rounded-lg border overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="px-4 py-3 text-left text-sm font-semibold">Shape</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Dimensions</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Depth</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Face-Up Area</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedShapesForOverlay.map((shape, index) => {
                            const sizeData = DIAMOND_SHAPES[shape].sizes[overlayCaratIndex];
                            const parsed = parseMM(sizeData?.mm || "0");
                            const area = parsed ? (parsed.length * parsed.width * 0.785).toFixed(1) : "N/A";
                            
                            return (
                              <tr key={shape} className={cn("border-t", index % 2 === 0 && "bg-muted/20")}>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-3 h-3 rounded-full" 
                                      style={{ backgroundColor: SHAPE_COLORS[shape] }}
                                    />
                                    <span className="font-medium">{DIAMOND_SHAPES[shape].name}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">{sizeData?.mm} mm</td>
                                <td className="px-4 py-3 text-muted-foreground">{sizeData?.depth} mm</td>
                                <td className="px-4 py-3">~{area} mm²</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Insight */}
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-primary mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium mb-1">Size Comparison Insight</p>
                          <p className="text-muted-foreground">
                            At {overlayCaratWeight} carat, different shapes appear to have different sizes due to varying depth and proportions. 
                            Elongated shapes like Marquise and Pear typically look larger face-up, while deeper cuts like Round and Cushion 
                            carry more weight in their depth.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 text-muted-foreground"
                  >
                    <Layers className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Click "Compare Shapes" to see multiple diamond shapes overlaid at the same carat weight</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Quick Reference Grid */}
        <ScrollReveal delay={0.5}>
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Diamond className="h-6 w-6 text-primary" />
              Quick Reference: 1 Carat Comparison
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {(Object.keys(DIAMOND_SHAPES) as ShapeKey[]).map((shape) => {
                const oneCaratSize = DIAMOND_SHAPES[shape].sizes.find(s => s.carat === 1);
                return (
                  <motion.div
                    key={shape}
                    className="p-4 rounded-xl border bg-card hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer"
                    onClick={() => {
                      setSelectedShape(shape);
                      setSelectedCaratIndex(DIAMOND_SHAPES[shape].sizes.findIndex(s => s.carat === 1));
                    }}
                    whileHover={{ y: -4 }}
                  >
                    <DiamondShapeSVG shape={shape} size={60} className="mx-auto mb-3" />
                    <h3 className="font-semibold text-center text-sm mb-2">
                      {DIAMOND_SHAPES[shape].name}
                    </h3>
                    <div className="text-center text-xs text-muted-foreground space-y-1">
                      <p className="font-medium text-foreground">{oneCaratSize?.mm} mm</p>
                      <p>Depth: {oneCaratSize?.depth} mm</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      </main>

      <ThemeSwitcher />
    </div>
  );
};

export default DiamondSizingChart;
