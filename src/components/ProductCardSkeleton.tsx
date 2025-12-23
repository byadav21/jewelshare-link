import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ProductCardSkeleton = () => {
  return (
    <Card className="overflow-hidden bg-gradient-to-b from-card to-card/95 border-border/50 shadow-lg">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 sm:p-6 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="space-y-2 border-t border-border/50 pt-3">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        <div className="border-t border-border/50 pt-4">
          <Skeleton className="h-10 w-full mb-3" />
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="space-y-2 text-right">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-8 w-12" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
