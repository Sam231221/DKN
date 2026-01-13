import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { OrganizationDashboardLayout } from "@/components/dashboard/organization-dashboard-layout"
import { AISearchBar } from "@/components/search/ai-search-bar"
import { SearchResults } from "@/components/search/search-results"
import { SearchFilters } from "@/components/search/search-filters"
import { RecommendedTopics } from "@/components/search/recommended-topics"
import { Card } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

export default function OrganizationSearchPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setHasSearched(true)
  }

  if (!user) return null

  return (
    <OrganizationDashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">AI-Powered Search</h1>
          </div>
          <p className="text-muted-foreground">
            Find knowledge items using natural language and semantic understanding
          </p>
        </div>

        <AISearchBar onSearch={handleSearch} />

        {!hasSearched ? (
          <div className="space-y-6">
            <Card className="p-8 bg-card border-border text-center">
              <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Search with Natural Language</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Ask questions naturally, and our AI will understand context and intent to find the most relevant
                knowledge items. Try asking about procedures, best practices, or specific topics.
              </p>
            </Card>

            <RecommendedTopics onTopicClick={handleSearch} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <SearchFilters />
            </div>
            <div className="lg:col-span-3">
              <SearchResults query={searchQuery} />
            </div>
          </div>
        )}
      </div>
    </OrganizationDashboardLayout>
  )
}
