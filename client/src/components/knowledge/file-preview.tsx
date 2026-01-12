import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FilePreviewProps {
  fileName: string;
  fileSize: number;
  fileType?: string;
  fileUrl?: string;
  onRemove?: () => void;
  className?: string;
}

export function FilePreview({
  fileName,
  fileSize,
  fileType,
  fileUrl,
  onRemove,
  className,
}: FilePreviewProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    const iconMap: Record<string, string> = {
      pdf: "📄",
      doc: "📝",
      docx: "📝",
      xls: "📊",
      xlsx: "📊",
      ppt: "📊",
      pptx: "📊",
      txt: "📄",
      md: "📝",
      zip: "📦",
      jpg: "🖼️",
      jpeg: "🖼️",
      png: "🖼️",
      gif: "🖼️",
      webp: "🖼️",
    };
    return iconMap[ext || ""] || "📎";
  };

  const getFileTypeDisplay = (fileType?: string): string => {
    if (!fileType) return "Unknown";
    if (fileType.includes("pdf")) return "PDF Document";
    if (fileType.includes("word") || fileType.includes("document")) return "Word Document";
    if (fileType.includes("excel") || fileType.includes("spreadsheet")) return "Excel Spreadsheet";
    if (fileType.includes("powerpoint") || fileType.includes("presentation")) return "PowerPoint Presentation";
    if (fileType.includes("image")) return "Image";
    if (fileType.includes("zip")) return "ZIP Archive";
    if (fileType.includes("text")) return "Text File";
    return fileType;
  };

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  return (
    <Card className={`p-4 bg-muted/30 ${className || ""}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="text-2xl flex-shrink-0">{getFileIcon(fileName)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium truncate">{fileName}</p>
              {fileType && (
                <Badge variant="outline" className="text-xs flex-shrink-0">
                  {getFileTypeDisplay(fileType)}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{formatFileSize(fileSize)}</span>
              {fileType && <span className="hidden sm:inline">{fileType}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {fileUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              asChild
              className="hidden sm:flex"
            >
              <a
                href={`${API_BASE_URL}${fileUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </a>
            </Button>
          )}
          {onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

