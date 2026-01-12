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
  Download,
  AlertTriangle,
  Briefcase,
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

  const getFileIcon = (fileType?: string | null) => {
    if (!fileType) return null;
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("word") || fileType.includes("document")) return "📝";
    if (fileType.includes("excel") || fileType.includes("spreadsheet")) return "📊";
    if (fileType.includes("powerpoint") || fileType.includes("presentation")) return "📊";
    if (fileType.includes("image")) return "🖼️";
    if (fileType.includes("zip")) return "📦";
    return "📎";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_review":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case "approved":
        return "bg-green-500/10 text-green-600 dark:text-green-400";
      case "rejected":
        return "bg-red-500/10 text-red-600 dark:text-red-400";
      case "draft":
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card
          key={item.id}
          className="p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3 mb-2">
                {item.fileUrl && (
                  <div className="text-2xl flex-shrink-0">
                    {getFileIcon(item.fileType) || <FileText className="h-6 w-6" />}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-1 line-clamp-2">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="outline" className="text-xs">
                  {getTypeDisplayName(item.type)}
                </Badge>
                <Badge className={`text-xs ${getStatusColor(item.status)}`}>
                  {item.status.replace("_", " ")}
                </Badge>
                {item.originatingProject && (
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {item.originatingProject.projectCode || item.originatingProject.name}
                  </Badge>
                )}
                {item.duplicateDetected && (
                  <Badge variant="outline" className="text-xs text-yellow-600 dark:text-yellow-400">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Duplicate detected
                  </Badge>
                )}
                {item.complianceViolations && item.complianceViolations.length > 0 && (
                  <Badge variant="outline" className="text-xs text-red-600 dark:text-red-400">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Compliance issues
                  </Badge>
                )}
              </div>

              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {item.tags.slice(0, 5).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                  {item.tags.length > 5 && (
                    <Badge variant="secondary" className="text-xs">
                      +{item.tags.length - 5}
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {item.fileUrl && (
                  <a
                    href={`${API_BASE_URL}${item.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <Download className="h-3 w-3" />
                    <span>Download</span>
                  </a>
                )}
                {item.fileSize && (
                  <span>{(item.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                )}
                <span>{item.views} views</span>
                <span>{item.likes} likes</span>
                {item.author && <span>by {item.author.name}</span>}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
