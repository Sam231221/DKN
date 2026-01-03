import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Eye, Star, MessageSquare, MoreVertical, CheckCircle2 } from "lucide-react"

const knowledgeItems = [
  {
    id: 1,
    title: "API Integration Best Practices",
    description: "Comprehensive guide for integrating third-party APIs securely and efficiently",
    category: "Documentation",
    author: "Sarah Chen",
    views: 342,
    stars: 28,
    comments: 12,
    validated: true,
    lastUpdated: "2 hours ago",
    tags: ["API", "Security", "Integration"],
  },
  {
    id: 2,
    title: "Client Onboarding Checklist",
    description: "Step-by-step process for onboarding new clients and ensuring smooth transitions",
    category: "Guidelines",
    author: "Michael Brown",
    views: 521,
    stars: 45,
    comments: 18,
    validated: true,
    lastUpdated: "5 hours ago",
    tags: ["Onboarding", "Client", "Process"],
  },
  {
    id: 3,
    title: "Security Incident Response Protocol",
    description: "Detailed procedures for handling security incidents and data breaches",
    category: "Security",
    author: "Emily Davis",
    views: 289,
    stars: 34,
    comments: 8,
    validated: true,
    lastUpdated: "1 day ago",
    tags: ["Security", "Protocol", "Emergency"],
  },
  {
    id: 4,
    title: "React Component Library Guidelines",
    description: "Standards and best practices for building reusable React components",
    category: "Documentation",
    author: "James Wilson",
    views: 412,
    stars: 52,
    comments: 24,
    validated: true,
    lastUpdated: "2 days ago",
    tags: ["React", "Components", "Frontend"],
  },
  {
    id: 5,
    title: "Database Migration Strategy",
    description: "Guide for planning and executing database schema migrations safely",
    category: "Technical",
    author: "Lisa Anderson",
    views: 198,
    stars: 19,
    comments: 6,
    validated: false,
    lastUpdated: "3 days ago",
    tags: ["Database", "Migration", "Backend"],
  },
]

export function KnowledgeList() {
  return (
    <div className="space-y-4">
      {knowledgeItems.map((item) => (
        <Card key={item.id} className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    {item.validated && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" title="Validated by Knowledge Champion" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {item.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  {item.category}
                </Badge>
                <span>by {item.author}</span>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{item.views}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  <span>{item.stars}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{item.comments}</span>
                </div>
                <span className="ml-auto">{item.lastUpdated}</span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
