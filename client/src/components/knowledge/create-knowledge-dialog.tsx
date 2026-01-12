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
  AlertTriangle,
} from "lucide-react";
import { FileUpload } from "./file-upload";
import { RepositorySelect } from "./repository-select";
import { FilePreview } from "./file-preview";
import { DuplicateWarning } from "./duplicate-warning";
import { ComplianceWarning } from "./compliance-warning";
import {
  uploadKnowledgeItem,
  type UploadKnowledgeItemResponse,
  fetchProjects,
  type Project,
} from "@/lib/api";

interface CreateKnowledgeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateKnowledgeDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateKnowledgeDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("documentation");
  const [repositoryId, setRepositoryId] = useState("");
  const [originatingProjectId, setOriginatingProjectId] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [similarItems, setSimilarItems] = useState<
    Array<{ id: string; title: string; score: number }>
  >([]);
  const [complianceViolations, setComplianceViolations] = useState<string[]>(
    []
  );
  const [success, setSuccess] = useState(false);
  const [_uploadedItem, setUploadedItem] =
    useState<UploadKnowledgeItemResponse | null>(null);

  // Load projects when dialog opens
  useEffect(() => {
    if (open) {
      const loadProjects = async () => {
        try {
          const data = await fetchProjects({ status: "active" });
          setProjects(data);
        } catch (err) {
          console.error("Failed to load projects:", err);
        }
      };
      loadProjects();
    }
  }, [open]);

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
    setWarnings([]);
    setSuccess(false);
    setUploadProgress(0);

    // Validation
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!description.trim()) {
      setError("Description is required");
      return;
    }

    if (!file && !content.trim()) {
      setError("Either a file or content is required");
      return;
    }

    if (!type) {
      setError("Type is required");
      return;
    }

    setLoading(true);

    try {
      const result = await uploadKnowledgeItem(
        {
          title: title.trim(),
          description: description.trim(),
          content: content.trim() || undefined,
          type,
          repositoryId: repositoryId || undefined,
          originatingProjectId: originatingProjectId || undefined,
          tags: tags.length > 0 ? tags : undefined,
          file: file || undefined,
        },
        (progress) => {
          setUploadProgress(progress);
        }
      );

      // Show warnings if any
      if (result.warnings && result.warnings.length > 0) {
        setWarnings(result.warnings);
      }

      setSuccess(true);

      // Reset form
      setTimeout(() => {
        setTitle("");
        setDescription("");
        setContent("");
        setType("documentation");
        setRepositoryId("");
        setOriginatingProjectId("");
        setTags([]);
        setTagInput("");
        setFile(null);
        setUploadProgress(0);
        setSuccess(false);
        setWarnings([]);
        onOpenChange(false);
        if (onSuccess) {
          onSuccess();
        }
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to upload knowledge item"
      );
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setTitle("");
      setDescription("");
      setContent("");
      setType("documentation");
      setRepositoryId("");
      setTags([]);
      setTagInput("");
      setFile(null);
      setError(null);
      setWarnings([]);
      setSimilarItems([]);
      setComplianceViolations([]);
      setSuccess(false);
      setUploadProgress(0);
      setUploadedItem(null);
      onOpenChange(false);
    }
  };

  const handleViewSimilarItem = (id: string) => {
    // Note: Detail page navigation removed - items are now shown in explore page
    console.log("View similar item:", id);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Knowledge Item</DialogTitle>
          <DialogDescription>
            Add a new knowledge item to your organizational repository
          </DialogDescription>
        </DialogHeader>

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
              <span>
                Knowledge item uploaded successfully! Status: Pending Review
              </span>
            </div>
          )}

          {/* Upload Progress */}
          {loading && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Uploading...</span>
                <span className="text-muted-foreground">
                  {Math.round(uploadProgress)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Duplicate Warning */}
          {similarItems.length > 0 && (
            <DuplicateWarning
              similarItems={similarItems}
              onViewItem={handleViewSimilarItem}
            />
          )}

          {/* Compliance Warning */}
          {complianceViolations.length > 0 && (
            <ComplianceWarning
              violations={complianceViolations}
              checked={true}
            />
          )}

          {/* General Warnings */}
          {warnings.length > 0 &&
            similarItems.length === 0 &&
            complianceViolations.length === 0 && (
              <div className="rounded-lg bg-yellow-500/10 p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Warnings:</span>
                </div>
                <ul className="list-disc list-inside text-sm text-yellow-600 dark:text-yellow-400 space-y-1 ml-6">
                  {warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter a descriptive title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief summary of the knowledge item"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="bg-background min-h-20"
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>
              File Upload{" "}
              <span className="text-muted-foreground text-xs">
                (Optional if content is provided)
              </span>
            </Label>
            {file ? (
              <FilePreview
                fileName={file.name}
                fileSize={file.size}
                fileType={file.type}
                onRemove={() => setFile(null)}
              />
            ) : (
              <FileUpload file={file} onFileSelect={setFile} maxSize={50} />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">
                Type <span className="text-destructive">*</span>
              </Label>
              <Select value={type} onValueChange={setType} required>
                <SelectTrigger id="type" className="bg-background">
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

          {/* Originating Project Selection */}
          <div className="space-y-2">
            <Label>
              Originating Project
              <span className="text-muted-foreground text-xs ml-2">
                (Optional - project where this knowledge was created)
              </span>
            </Label>
            <Select
              value={originatingProjectId}
              onValueChange={setOriginatingProjectId}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select a project (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.projectCode ? `${project.projectCode} - ` : ""}
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">
              Content{" "}
              <span className="text-muted-foreground text-xs">
                (Optional if file is uploaded)
              </span>
            </Label>
            <Textarea
              id="content"
              placeholder="Enter the detailed content of your knowledge item (optional if uploading a file)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-background min-h-32"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
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

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Knowledge Item"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
