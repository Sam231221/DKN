import type React from "react";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  X,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { RepositorySelect } from "./repository-select";
import {
  updateKnowledgeItem,
  fetchKnowledgeItemById,
  type KnowledgeItem,
} from "@/lib/api";

interface EditKnowledgeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string | null;
  onSuccess?: () => void;
  user?: {
    id: string;
    role: string;
  };
}

export function EditKnowledgeDialog({
  open,
  onOpenChange,
  itemId,
  onSuccess,
  user,
}: EditKnowledgeDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("documentation");
  const [repositoryId, setRepositoryId] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [status, setStatus] = useState("draft");
  const [loading, setLoading] = useState(false);
  const [loadingItem, setLoadingItem] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [item, setItem] = useState<KnowledgeItem | null>(null);

  // Check if user can change status
  const canChangeStatus =
    user?.role === "administrator" || user?.role === "knowledge_champion";

  // Load item data when dialog opens
  useEffect(() => {
    if (open && itemId) {
      setLoadingItem(true);
      setError(null);
      fetchKnowledgeItemById(itemId)
        .then((data) => {
          setItem(data);
          setTitle(data.title);
          setDescription(data.description || "");
          setContent(data.content);
          setType(data.type);
          setRepositoryId(data.repositoryId || "");
          setTags(data.tags || []);
          setStatus(data.status);
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

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!itemId) {
      setError("Item ID is required");
      return;
    }

    setLoading(true);

    try {
      const updateData: {
        title?: string;
        description?: string;
        content?: string;
        type?: string;
        tags?: string[];
        status?: string;
      } = {
        title: title.trim(),
        description: description.trim() || undefined,
        content: content.trim(),
        type,
        tags: tags.length > 0 ? tags : [],
      };

      // Only include status if user has permission
      if (canChangeStatus) {
        updateData.status = status;
      }

      await updateKnowledgeItem(itemId, updateData);

      setSuccess(true);

      // Reset form and close
      setTimeout(() => {
        setTitle("");
        setDescription("");
        setContent("");
        setType("documentation");
        setRepositoryId("");
        setTags([]);
        setTagInput("");
        setStatus("draft");
        setSuccess(false);
        setItem(null);
        onOpenChange(false);
        if (onSuccess) {
          onSuccess();
        }
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update knowledge item"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading && !loadingItem) {
      setTitle("");
      setDescription("");
      setContent("");
      setType("documentation");
      setRepositoryId("");
      setTags([]);
      setTagInput("");
      setStatus("draft");
      setError(null);
      setSuccess(false);
      setItem(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Knowledge Item</DialogTitle>
          <DialogDescription>
            Update the knowledge item details
          </DialogDescription>
        </DialogHeader>

        {loadingItem ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Knowledge item updated successfully!</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                placeholder="Enter a descriptive title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Brief summary of the knowledge item"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-background min-h-20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">
                  Type <span className="text-destructive">*</span>
                </Label>
                <Select value={type} onValueChange={setType} required>
                  <SelectTrigger id="edit-type" className="bg-background">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="documentation">Documentation</SelectItem>
                    <SelectItem value="best_practices">Best Practices</SelectItem>
                    <SelectItem value="procedure">Procedure</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="project_knowledge">
                      Project Knowledge
                    </SelectItem>
                    <SelectItem value="client_content">Client Content</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="policy">Policy</SelectItem>
                    <SelectItem value="guideline">Guideline</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <RepositorySelect
                value={repositoryId}
                onValueChange={setRepositoryId}
              />
            </div>

            {/* Status field - only if user has permission */}
            {canChangeStatus && (
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="edit-status" className="bg-background">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending_review">Pending Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                placeholder="Enter the detailed content of your knowledge item"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="bg-background min-h-32"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="edit-tags"
                  placeholder="Add tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="bg-background"
                />
                <Button type="button" variant="outline" onClick={handleAddTag}>
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Show current file info if exists */}
            {item?.fileUrl && (
              <div className="space-y-2">
                <Label>Current File</Label>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">
                    {item.fileName || "File attached"}
                    {item.fileSize && (
                      <span className="ml-2">
                        ({(item.fileSize / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    )}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Note: File replacement is not supported. To change the file,
                  please delete and recreate the item.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading || loadingItem}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || loadingItem}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Knowledge Item"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
