import { AlertTriangle, ExternalLink, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SimilarItem {
  id: string;
  title: string;
  score: number;
}

interface DuplicateWarningProps {
  similarItems: SimilarItem[];
  onViewItem?: (id: string) => void;
  className?: string;
}

export function DuplicateWarning({
  similarItems,
  onViewItem,
  className,
}: DuplicateWarningProps) {
  if (!similarItems || similarItems.length === 0) {
    return null;
  }

  const formatScore = (score: number): string => {
    return (score * 100).toFixed(0) + "%";
  };

  const getScoreColor = (score: number): string => {
    if (score >= 0.8) return "text-red-600 dark:text-red-400";
    if (score >= 0.7) return "text-orange-600 dark:text-orange-400";
    return "text-yellow-600 dark:text-yellow-400";
  };

  const getScoreBadgeVariant = (score: number): "destructive" | "default" | "secondary" => {
    if (score >= 0.8) return "destructive";
    if (score >= 0.7) return "default";
    return "secondary";
  };

  return (
    <Card className={`p-4 bg-yellow-500/10 border-yellow-500/20 ${className || ""}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-sm text-yellow-600 dark:text-yellow-400">
              Potential Duplicate Detected
            </h4>
            <Badge variant="outline" className="text-xs border-yellow-500/50 text-yellow-600 dark:text-yellow-400">
              {similarItems.length} {similarItems.length === 1 ? "similar item" : "similar items"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Similar content has been found in the knowledge base. Please review to avoid duplicates.
          </p>
          <div className="space-y-2">
            {similarItems.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-2 p-2 rounded-md bg-background/50 border border-border/50"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm truncate">{item.title}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge
                    variant={getScoreBadgeVariant(item.score)}
                    className={`text-xs ${getScoreColor(item.score)}`}
                  >
                    {formatScore(item.score)} similar
                  </Badge>
                  {onViewItem && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewItem(item.id)}
                      className="h-7 px-2"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {similarItems.length > 3 && (
              <p className="text-xs text-muted-foreground text-center pt-1">
                +{similarItems.length - 3} more similar items
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

