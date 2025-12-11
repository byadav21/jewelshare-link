import { ShapeKey } from "@/constants/diamondData";

interface DiamondShapeSVGProps {
  shape: ShapeKey;
  size?: number;
  className?: string;
  fillColor?: string;
  strokeColor?: string;
  useGradient?: boolean;
}

export const DiamondShapeSVG = ({ 
  shape, 
  size = 100, 
  className,
  fillColor,
  strokeColor,
  useGradient = true
}: DiamondShapeSVGProps) => {
  const fill = fillColor || (useGradient ? "url(#diamondGradient)" : "currentColor");
  const stroke = strokeColor || (useGradient ? "url(#diamondGradient)" : "currentColor");
  const opacity = fillColor ? 1 : 0.3;

  const renderShape = () => {
    switch (shape) {
      case "round":
        return (
          <>
            <circle cx="50" cy="50" r="45" fill={fill} opacity={opacity} />
            <circle cx="50" cy="50" r="45" fill="none" stroke={stroke} strokeWidth="2" />
            <circle cx="50" cy="50" r="35" fill="none" stroke={stroke} strokeWidth="1" opacity="0.5" />
          </>
        );
      
      case "princess":
        return (
          <>
            <rect x="10" y="10" width="80" height="80" fill={fill} opacity={opacity} />
            <rect x="10" y="10" width="80" height="80" fill="none" stroke={stroke} strokeWidth="2" />
            <line x1="10" y1="10" x2="90" y2="90" stroke={stroke} strokeWidth="1" opacity="0.5" />
            <line x1="90" y1="10" x2="10" y2="90" stroke={stroke} strokeWidth="1" opacity="0.5" />
          </>
        );
      
      case "oval":
        return (
          <>
            <ellipse cx="50" cy="50" rx="40" ry="28" fill={fill} opacity={opacity} />
            <ellipse cx="50" cy="50" rx="40" ry="28" fill="none" stroke={stroke} strokeWidth="2" />
            <ellipse cx="50" cy="50" rx="30" ry="20" fill="none" stroke={stroke} strokeWidth="1" opacity="0.5" />
          </>
        );
      
      case "cushion":
        return (
          <>
            <rect x="10" y="10" width="80" height="80" rx="15" fill={fill} opacity={opacity} />
            <rect x="10" y="10" width="80" height="80" rx="15" fill="none" stroke={stroke} strokeWidth="2" />
            <rect x="20" y="20" width="60" height="60" rx="10" fill="none" stroke={stroke} strokeWidth="1" opacity="0.5" />
          </>
        );
      
      case "emerald":
        return (
          <>
            <polygon points="15,20 85,20 90,80 10,80" fill={fill} opacity={opacity} />
            <polygon points="15,20 85,20 90,80 10,80" fill="none" stroke={stroke} strokeWidth="2" />
            <line x1="25" y1="35" x2="75" y2="35" stroke={stroke} strokeWidth="1" opacity="0.5" />
            <line x1="20" y1="50" x2="80" y2="50" stroke={stroke} strokeWidth="1" opacity="0.5" />
            <line x1="18" y1="65" x2="82" y2="65" stroke={stroke} strokeWidth="1" opacity="0.5" />
          </>
        );
      
      case "pear":
        return (
          <>
            <path d="M50 10 C20 40, 15 65, 50 95 C85 65, 80 40, 50 10" fill={fill} opacity={opacity} />
            <path d="M50 10 C20 40, 15 65, 50 95 C85 65, 80 40, 50 10" fill="none" stroke={stroke} strokeWidth="2" />
          </>
        );
      
      case "marquise":
        return (
          <>
            <ellipse cx="50" cy="50" rx="45" ry="25" fill={fill} opacity={opacity} />
            <ellipse cx="50" cy="50" rx="45" ry="25" fill="none" stroke={stroke} strokeWidth="2" />
            <line x1="5" y1="50" x2="95" y2="50" stroke={stroke} strokeWidth="1" opacity="0.5" />
          </>
        );
      
      case "heart":
        return (
          <>
            <path d="M50 88 C20 60, 5 40, 25 20 C40 8, 50 20, 50 30 C50 20, 60 8, 75 20 C95 40, 80 60, 50 88" fill={fill} opacity={opacity} />
            <path d="M50 88 C20 60, 5 40, 25 20 C40 8, 50 20, 50 30 C50 20, 60 8, 75 20 C95 40, 80 60, 50 88" fill="none" stroke={stroke} strokeWidth="2" />
          </>
        );
      
      case "radiant":
        return (
          <>
            <polygon points="20,10 80,10 95,50 80,90 20,90 5,50" fill={fill} opacity={opacity} />
            <polygon points="20,10 80,10 95,50 80,90 20,90 5,50" fill="none" stroke={stroke} strokeWidth="2" />
          </>
        );
      
      case "asscher":
        return (
          <>
            <polygon points="20,5 80,5 95,20 95,80 80,95 20,95 5,80 5,20" fill={fill} opacity={opacity} />
            <polygon points="20,5 80,5 95,20 95,80 80,95 20,95 5,80 5,20" fill="none" stroke={stroke} strokeWidth="2" />
            <polygon points="30,15 70,15 85,30 85,70 70,85 30,85 15,70 15,30" fill="none" stroke={stroke} strokeWidth="1" opacity="0.5" />
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <svg viewBox="0 0 100 100" className={className} style={{ width: size, height: size }}>
      {useGradient && (
        <defs>
          <linearGradient id="diamondGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--diamond-from))" />
            <stop offset="100%" stopColor="hsl(var(--diamond-to))" />
          </linearGradient>
        </defs>
      )}
      {renderShape()}
    </svg>
  );
};
