import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FolderOpen, FileText, Users, MoreVertical } from "lucide-react"

const repositories = [
  {
    name: "Product Documentation",
    description: "Comprehensive product guides and technical documentation",
    items: 248,
    contributors: 24,
    category: "Documentation",
    lastUpdated: "2 hours ago",
  },
  {
    name: "Best Practices",
    description: "Organizational standards and recommended workflows",
    items: 156,
    contributors: 18,
    category: "Guidelines",
    lastUpdated: "5 hours ago",
  },
  {
    name: "Client Resources",
    description: "Client-facing materials and support documentation",
    items: 392,
    contributors: 31,
    category: "Client",
    lastUpdated: "1 day ago",
  },
  {
    name: "Training Materials",
    description: "Onboarding guides and training resources",
    items: 124,
    contributors: 12,
    category: "Training",
    lastUpdated: "3 days ago",
  },
]

export function KnowledgeRepositories() {
  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Knowledge Repositories</h2>
        <Button variant="ghost" size="sm">
          View All
        </Button>
      </div>

      <div className="space-y-4">
        {repositories.map((repo, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
          >
            <div className="p-2 rounded-lg bg-primary/10">
              <FolderOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-semibold mb-1">{repo.name}</h3>
                  <p className="text-sm text-muted-foreground">{repo.description}</p>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>{repo.items} items</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{repo.contributors} contributors</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {repo.category}
                </Badge>
                <span className="ml-auto">{repo.lastUpdated}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
