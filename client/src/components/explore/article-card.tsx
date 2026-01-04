import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp, MessageCircle, Clock } from "lucide-react"

interface ArticleCardProps {
  id: string
  title: string
  author: string
  authorAvatar?: string
  tags: string[]
  image?: string
  readTime: string
  publishedAt: string
  upvotes: number
  comments: number
  isPromoted?: boolean
}

export function ArticleCard({
  title,
  author,
  authorAvatar,
  tags,
  image,
  readTime,
  publishedAt,
  upvotes,
  comments,
  isPromoted,
}: ArticleCardProps) {
  const authorInitial = author[0]?.toUpperCase() || "?"

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-200 border-border bg-card">
      {/* Image */}
      {image ? (
        <div className="relative w-full h-48 bg-muted overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          {isPromoted && (
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="text-xs">
                Promoted
              </Badge>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary">{authorInitial}</span>
          </div>
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Author */}
        <div className="flex items-center gap-2">
          {authorAvatar ? (
            <img
              src={authorAvatar}
              alt={author}
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">{authorInitial}</span>
            </div>
          )}
          <span className="text-sm text-muted-foreground">{author}</span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs font-normal"
              >
                #{tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="secondary" className="text-xs font-normal">
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{publishedAt}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{readTime} read</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ThumbsUp className="h-3.5 w-3.5" />
              <span>{upvotes}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageCircle className="h-3.5 w-3.5" />
              <span>{comments}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

