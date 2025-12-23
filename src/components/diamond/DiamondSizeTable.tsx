import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SizeData {
  readonly carat: number;
  readonly mm: string;
  readonly depth: string;
}

interface DiamondSizeTableProps {
  sizes: readonly SizeData[];
  selectedCaratIndex: number;
  onSelectIndex: (index: number) => void;
}

export const DiamondSizeTable = ({
  sizes,
  selectedCaratIndex,
  onSelectIndex,
}: DiamondSizeTableProps) => {
  return (
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
            {sizes.map((size, index) => (
              <tr
                key={size.carat}
                className={cn(
                  "border-t transition-colors cursor-pointer",
                  index === selectedCaratIndex ? "bg-primary/10" : "hover:bg-muted/30"
                )}
                onClick={() => onSelectIndex(index)}
              >
                <td className="px-4 py-3">
                  <Badge variant={index === selectedCaratIndex ? "default" : "outline"} className="font-mono">
                    {size.carat} ct
                  </Badge>
                </td>
                <td className="px-4 py-3 font-medium">{size.mm}</td>
                <td className="px-4 py-3 text-muted-foreground">{size.depth}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-center">
                    <div 
                      className="rounded-full bg-gradient-to-br from-primary/60 to-primary/40 opacity-60"
                      style={{ width: Math.max(8, size.carat * 12), height: Math.max(8, size.carat * 12) }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
