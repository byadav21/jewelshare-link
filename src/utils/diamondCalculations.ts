// Parse mm value from string (handles "x.x x x.x" format)
export const parseMM = (mmString: string): { length: number; width: number } | null => {
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

// Calculate visual scale based on carat weight
export const getVisualScale = (carat: number): number => {
  const baseScale = 60;
  const scale = baseScale + (carat * 30);
  return Math.min(scale, 200);
};

// Get overlay scale (consistent across all shapes for comparison)
export const getOverlayScale = (mmString: string): number => {
  const parsed = parseMM(mmString);
  if (!parsed) return 80;
  // Use larger dimension for scaling
  const maxDim = Math.max(parsed.length, parsed.width);
  return maxDim * 10; // 10 pixels per mm
};

// Calculate face-up area for diamond
export const calculateFaceUpArea = (mmString: string): string => {
  const parsed = parseMM(mmString);
  if (!parsed) return "N/A";
  return (parsed.length * parsed.width * 0.785).toFixed(1);
};
