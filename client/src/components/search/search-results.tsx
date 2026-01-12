import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Star, Eye, Sparkles, CheckCircle2 } from "lucide-react"

interface SearchResultsProps {
  query: string
}

const mockResults = [
  {
    id: 1,
    title: "Client Onboarding Process - Complete Guide",
    description:
      "Step-by-step documentation for onboarding new clients, including initial contact, contract setup, and system access provisioning",
    content:
      "Our client onboarding process begins with an initial discovery call to understand client needs and expectations...",
    category: "Guidelines",
    author: "Michael Brown",
    relevance: 98,
    views: 521,
    stars: 45,
    validated: true,
    tags: ["Onboarding", "Client", "Process"],
  },
  {
    id: 2,
    title: "New Client Setup Checklist",
    description: "Comprehensive checklist for setting up new client accounts and ensuring smooth transitions",
    content:
      "Before starting with a new client, ensure all these items are completed: 1. Contract signed 2. Payment setup...",
    category: "Documentation",
    author: "Sarah Chen",
    relevance: 95,
    views: 412,
    stars: 38,
    validated: true,
    tags: ["Checklist", "Client", "Setup"],
  },
  {
    id: 3,
    title: "Client Communication Guidelines",
    description: "Best practices for maintaining professional and effective communication with clients",
    content: "Effective client communication is key to successful partnerships. Always respond within 24 hours...",
    category: "Guidelines",
    author: "Emily Davis",
    relevance: 87,
    views: 289,
    stars: 34,
    validated: true,
    tags: ["Communication", "Client", "Best Practices"],
  },
  {
    id: 4,
    title: "Client Success Metrics and KPIs",
    description: "How to measure and track client satisfaction and project success",
    content: "We track client success through several key metrics including satisfaction scores, project milestones...",
    category: "Analytics",
    author: "James Wilson",
    relevance: 82,
    views: 198,
    stars: 28,
    validated: false,
    tags: ["Metrics", "KPI", "Client Success"],
  },
]

export function SearchResults({ query }: SearchResultsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <p className="text-sm text-muted-foreground">
            Found {mockResults.length} AI-powered results for{" "}
            <span className="font-medium text-foreground">"{query}"</span>
          </p>
        </div>
      </div>

      {mockResults.map((result) => (
        <Card key={result.id} className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold">{result.title}</h3>
                    {result.validated && (
                      <span title="Validated by Knowledge Champion">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      </span>
                    )}
                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
                      {result.relevance}% match
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{result.description}</p>
                  <p className="text-sm text-foreground/70 line-clamp-2">{result.content}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {result.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {result.category}
                  </Badge>
                  <span>by {result.author}</span>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{result.views}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    <span>{result.stars}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  View Details
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
