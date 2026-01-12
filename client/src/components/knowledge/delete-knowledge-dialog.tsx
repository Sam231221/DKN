
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import {
  deleteKnowledgeItem,
  fetchKnowledgeItemById,
  type KnowledgeItem,
} from "@/lib/api";

interface DeleteKnowledgeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string | null;
  onSuccess?: () => void;
}

export function DeleteKnowledgeDialog({
  open,
  onOpenChange,
  itemId,
  onSuccess,
}: DeleteKnowledgeDialogProps) {
  const [loading, setLoading] = useState(false);
  const [loadingItem, setLoadingItem] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [item, setItem] = useState<KnowledgeItem | null>(null);

  // Load item data when dialog opens
  useEffect(() => {
    if (open && itemId) {
      setLoadingItem(true);
      setError(null);
      fetchKnowledgeItemById(itemId)
        .then((data) => {
          setItem(data);
        })
        .catch((err) => {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load knowledge item"
          );
        })
        .finally(() => {
          setLoadingItem(false);
        });
    }
  }, [open, itemId]);

  const handleDelete = async () => {
    if (!itemId) {
      setError("Item ID is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await deleteKnowledgeItem(itemId);
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete knowledge item"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading && !loadingItem) {
      setError(null);
      setItem(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Knowledge Item</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the
            knowledge item.
          </DialogDescription>
        </DialogHeader>

        {loadingItem ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {/* Item Info */}
            {item && (
              <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm mb-1">
                    Are you sure you want to delete this item?
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">{item.title}</span>
                  </p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading || loadingItem}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={loading || loadingItem || !item}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
