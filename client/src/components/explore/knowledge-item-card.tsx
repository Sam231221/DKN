import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp, MessageCircle, Clock, FileText, BookOpen, GraduationCap, Briefcase, Users, Code, FileCheck, Eye } from "lucide-react"
import type { KnowledgeItem } from "@/lib/api"
import { formatDistanceToNow } from "date-fns"

interface KnowledgeItemCardProps {
  item: KnowledgeItem
  onClick?: () => void
}

const typeConfig = {
  documentation: {
    icon: FileText,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    label: "Documentation",
    borderColor: "border-blue-500/20",
  },
  best_practices: {
    icon: FileCheck,
    color: "bg-green-500/10 text-green-600 dark:text-green-400",
    label: "Best Practices",
    borderColor: "border-green-500/20",
  },
  procedure: {
    icon: BookOpen,
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    label: "Procedure",
    borderColor: "border-purple-500/20",
  },
  training: {
    icon: GraduationCap,
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    label: "Training",
    borderColor: "border-orange-500/20",
  },
  project_knowledge: {
    icon: Briefcase,
    color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    label: "Project Knowledge",
    borderColor: "border-indigo-500/20",
  },
  client_content: {
    icon: Users,
    color: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
    label: "Client Content",
    borderColor: "border-pink-500/20",
  },
  technical: {
    icon: Code,
    color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    label: "Technical",
    borderColor: "border-cyan-500/20",
  },
}

export function KnowledgeItemCard({ item, onClick }: KnowledgeItemCardProps) {
  const config = typeConfig[item.type as keyof typeof typeConfig] || typeConfig.documentation
  const Icon = config.icon
  const authorInitial = item.author?.name?.[0]?.toUpperCase() || "?"
  const authorName = item.author?.name || "Unknown"
  const publishedDate = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })
  
  // Estimate read time from content length (average reading speed: 200 words/min)
  const wordCount = item.content?.split(/\s+/).length || 0
  const readTime = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <Card 
      className={`group overflow-hidden hover:shadow-lg transition-all duration-200 border-border bg-card cursor-pointer ${config.borderColor} hover:border-opacity-40`}
      onClick={onClick}
    >
      {/* Header with Type Badge */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className={config.color}>
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
          {item.validatedBy && (
            <Badge variant="outline" className="text-xs">
              ✓ Validated
            </Badge>
          )}
        </div>
        {item.originatingProject && (
          <div className="text-xs text-muted-foreground">
            From: {item.originatingProject.name}
            {item.originatingProject.projectCode && ` (${item.originatingProject.projectCode})`}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors">
          {item.title}
        </h3>

        {/* Description */}
        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Author */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-xs font-semibold text-primary">{authorInitial}</span>
          </div>
          <span className="text-sm text-muted-foreground">{authorName}</span>
        </div>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs font-normal"
              >
                #{tag}
              </Badge>
            ))}
            {item.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs font-normal">
                +{item.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* File Info */}
        {item.fileName && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="h-3 w-3" />
            <span className="truncate">{item.fileName}</span>
            {item.fileSize && (
              <span className="ml-auto">
                {(item.fileSize / 1024).toFixed(1)} KB
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{publishedDate}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{readTime}m read</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Eye className="h-3.5 w-3.5" />
              <span>{item.views}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ThumbsUp className="h-3.5 w-3.5" />
              <span>{item.likes}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageCircle className="h-3.5 w-3.5" />
              <span>0</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
