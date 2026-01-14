import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Download,
  Calendar,
  User,
  Tag,
  AlertTriangle,
  X,
  Edit,
  Trash2,
} from "lucide-react";
import { fetchKnowledgeItemById, getTypeDisplayName, type KnowledgeItem } from "@/lib/api";
import { CommentsSection } from "./comments-section";
import { formatDate } from "@/lib/api";

interface KnowledgeItemDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  knowledgeItemId: string;
  onEdit?: (item: KnowledgeItem) => void;
  onDelete?: (item: KnowledgeItem) => void;
}

export function KnowledgeItemDetailDialog({
  open,
  onOpenChange,
  knowledgeItemId,
  onEdit,
  onDelete,
}: KnowledgeItemDetailDialogProps) {
  const { user } = useAuth();
  const [item, setItem] = useState<KnowledgeItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && knowledgeItemId) {
      loadItem();
    }
  }, [open, knowledgeItemId]);

  const loadItem = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedItem = await fetchKnowledgeItemById(knowledgeItemId);
      setItem(fetchedItem);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load knowledge item");
      console.error("Error fetching knowledge item:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!item && !loading && !error) {
    return null;
  }

  const canEdit = user && item && (
    user.id === item.authorId ||
    user.role === "administrator" ||
    user.role === "knowledge_champion"
  );

  const canDelete = user && item && (
    user.id === item.authorId ||
    user.role === "administrator"
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-12">
            <div className="text-destructive">{error}</div>
          </div>
        )}

        {item && (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <DialogTitle className="text-2xl mb-2">{item.title}</DialogTitle>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <Badge variant="outline">
                      {getTypeDisplayName(item.type)}
                    </Badge>
                    <Badge
                      className={
                        item.status === "approved"
                          ? "bg-green-500/10 text-green-600 dark:text-green-400"
                          : item.status === "pending_review"
                          ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                          : item.status === "rejected"
                          ? "bg-red-500/10 text-red-600 dark:text-red-400"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {item.status.replace("_", " ")}
                    </Badge>
                    {item.duplicateDetected && (
                      <Badge variant="outline" className="text-yellow-600 dark:text-yellow-400">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Duplicate detected
                      </Badge>
                    )}
                    {item.complianceViolations && item.complianceViolations.length > 0 && (
                      <Badge variant="outline" className="text-red-600 dark:text-red-400">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Compliance issues
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {canEdit && onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onEdit(item);
                        onOpenChange(false);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                  {canDelete && onDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onDelete(item);
                        onOpenChange(false);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onOpenChange(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              {/* Description */}
              {item.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              )}

              {/* Content */}
              <div>
                <h3 className="font-semibold mb-2">Content</h3>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                    {item.content}
                  </pre>
                </div>
              </div>

              {/* File */}
              {item.fileUrl && (
                <div>
                  <h3 className="font-semibold mb-2">Attached File</h3>
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <span className="text-sm">{item.fileName || "Download file"}</span>
                    {item.fileSize && (
                      <span className="text-xs text-muted-foreground">
                        ({(item.fileSize / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="ml-auto"
                    >
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </a>
                    </Button>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Author:</span>
                  <span className="font-medium">
                    {item.author?.name || "Unknown"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
                {item.repository && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Repository:</span>
                    <span className="font-medium">{item.repository.name}</span>
                  </div>
                )}
                {item.views !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Views:</span>
                    <span className="font-medium">{item.views}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Comments Section */}
              <CommentsSection knowledgeItemId={item.id} />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
