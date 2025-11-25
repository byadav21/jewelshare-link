import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const AdminEmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: AdminEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
        <div className="relative bg-gradient-primary rounded-full p-6 shadow-glow">
          <Icon className="h-12 w-12 text-primary-foreground" />
        </div>
      </div>
      <h3 className="mt-6 text-2xl font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-center text-muted-foreground max-w-md">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-6 shadow-md hover:shadow-lg transition-shadow">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
