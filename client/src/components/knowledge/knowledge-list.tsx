import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Eye,
  Star,
  MoreVertical,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  fetchKnowledgeItems,
  getTypeDisplayName,
  formatDate,
  type KnowledgeItem,
} from "@/lib/api";

interface KnowledgeListProps {
  type?: string;
  status?: string;
  search?: string;
}

export function KnowledgeList({ type, status, search }: KnowledgeListProps) {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: { type?: string; status?: string; search?: string } = {};
        if (type) params.type = type;
        if (status) params.status = status;
        if (search && search.trim()) params.search = search.trim();
        const data = await fetchKnowledgeItems(params);
        setItems(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load knowledge items"
        );
        console.error("Error fetching knowledge items:", err);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [type, status, search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">No knowledge items found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card
          key={item.id}
          className="p-6 bg-card border-border hover:border-primary/50 transition-colors"
        >
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    {item.status === "approved" && item.validatedBy && (
                      <CheckCircle2
                        className="h-4 w-4 text-green-500"
                        title="Validated by Knowledge Champion"
                      />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.description || "No description available"}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {item.tags && item.tags.length > 0
                  ? item.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))
                  : null}
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {getTypeDisplayName(item.type)}
                </Badge>
                {item.author && <span>by {item.author.name}</span>}
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{item.views}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  <span>{item.likes}</span>
                </div>
                <span className="ml-auto">{formatDate(item.updatedAt)}</span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
