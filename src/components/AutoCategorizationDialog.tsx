import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, TrendingUp, CheckCircle2 } from "lucide-react";
import { CategorySuggestion, getSuggestionStats } from "@/utils/productCategorization";

interface AutoCategorizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestions: CategorySuggestion[];
  onApply: (selectedIds: string[]) => Promise<void>;
}

export function AutoCategorizationDialog({
  open,
  onOpenChange,
  suggestions,
  onApply,
}: AutoCategorizationDialogProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(suggestions.map(s => s.productId))
  );
  const [isApplying, setIsApplying] = useState(false);

  const stats = getSuggestionStats(suggestions);
  
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleAll = () => {
    if (selectedIds.size === suggestions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(suggestions.map(s => s.productId)));
    }
  };

  const handleApply = async () => {
    setIsApplying(true);
    try {
      await onApply(Array.from(selectedIds));
      onOpenChange(false);
    } finally {
      setIsApplying(false);
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case "high":
        return <Badge className="bg-green-500/20 text-green-700 dark:text-green-400">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">Medium</Badge>;
      case "low":
        return <Badge className="bg-orange-500/20 text-orange-700 dark:text-orange-400">Low</Badge>;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Smart Category Suggestions
          </DialogTitle>
          <DialogDescription>
            Found {stats.total} products that can be auto-categorized based on their names and SKUs
          </DialogDescription>
        </DialogHeader>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-4">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total Suggestions</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600">{stats.byConfidence.high || 0}</div>
            <div className="text-xs text-muted-foreground">High Confidence</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-yellow-600">{stats.byConfidence.medium || 0}</div>
            <div className="text-xs text-muted-foreground">Medium Confidence</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-orange-600">{stats.byConfidence.low || 0}</div>
            <div className="text-xs text-muted-foreground">Low Confidence</div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="py-2">
          <div className="text-sm font-medium mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Categories Found
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.byCategory).map(([category, count]) => (
              <Badge key={category} variant="secondary">
                {category}: {count}
              </Badge>
            ))}
          </div>
        </div>

        {/* Suggestions List */}
        <ScrollArea className="h-[300px] border rounded-lg">
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b sticky top-0 bg-background">
              <Checkbox
                checked={selectedIds.size === suggestions.length}
                onCheckedChange={toggleAll}
              />
              <span className="text-sm font-medium">
                Select All ({selectedIds.size}/{suggestions.length})
              </span>
            </div>
            
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.productId}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  checked={selectedIds.has(suggestion.productId)}
                  onCheckedChange={() => toggleSelection(suggestion.productId)}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{suggestion.productName}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">→</span>
                    <Badge variant="outline" className="text-xs">
                      {suggestion.suggestedCategory}
                    </Badge>
                    {getConfidenceBadge(suggestion.confidence)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={selectedIds.size === 0 || isApplying}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Apply {selectedIds.size} Categories
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
