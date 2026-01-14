import { useEffect, useState, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { KnowledgeItemCard } from "@/components/explore/knowledge-item-card"
import { TrendingTopics } from "@/components/dashboard/trending-topics"
import { CreateKnowledgeDialog } from "@/components/knowledge/create-knowledge-dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Loader2, TrendingUp, Flame, Clock, Eye, Trophy, Award, Users, BarChart3 } from "lucide-react"
import { fetchKnowledgeItems, type KnowledgeItem } from "@/lib/api"
import { cn } from "@/lib/utils"

type TimePeriod = "today" | "week" | "month" | "all"

interface TrendingItemWithScore extends KnowledgeItem {
  accessScore: number
  trendingScore: number
}

export default function TrendingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [allItems, setAllItems] = useState<KnowledgeItem[]>([])
  const [trendingItems, setTrendingItems] = useState<TrendingItemWithScore[]>([])
  const [loading, setLoading] = useState(true)
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("week")
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const loadItems = useCallback(async () => {
    try {
      setLoading(true)
      const result = await fetchKnowledgeItems({ status: "approved" })
      setAllItems(result.data || [])
    } catch (error) {
      console.error("Failed to fetch knowledge items:", error)
      setAllItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      loadItems()
    }
  }, [user, loadItems])

  // Calculate access frequency score (most frequently accessed contributions)
  // Based on case study: "Knowledge Leaderboard highlights the most frequently accessed contributions"
  const calculateAccessScore = useCallback((item: KnowledgeItem, period: TimePeriod): number => {
    const now = new Date().getTime()
    const itemDate = new Date(item.createdAt).getTime()
    const itemUpdatedDate = new Date(item.updatedAt).getTime()
    
    // Time thresholds in milliseconds
    const thresholds = {
      today: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      all: Infinity,
    }

    const threshold = thresholds[period]
    const itemAge = now - itemDate
    const timeSinceUpdate = now - itemUpdatedDate

    // Filter items within the time period
    if (itemAge > threshold) {
      return 0
    }

    // Primary focus: Most frequently accessed (views are the main metric)
    // Views represent actual access frequency
    const accessFrequency = item.views * 2 // Higher weight for access frequency
    
    // Engagement metrics (likes indicate value/quality)
    const engagementScore = item.likes * 1.5
    
    // Recency boost - recently accessed items get priority
    const recencyFactor = Math.max(0, (threshold - itemAge) / threshold)
    const recencyBoost = recencyFactor * 50
    
    // Recent updates indicate active content
    const updateBoost = timeSinceUpdate < threshold / 3 ? 30 : 0

    return accessFrequency + engagementScore + recencyBoost + updateBoost
  }, [])

  // Calculate comprehensive trending score (includes access + other factors)
  const calculateTrendingScore = useCallback((item: KnowledgeItem, period: TimePeriod): number => {
    const accessScore = calculateAccessScore(item, period)
    
    // Additional trending factors
    const now = new Date().getTime()
    const itemDate = new Date(item.createdAt).getTime()
    const itemUpdatedDate = new Date(item.updatedAt).getTime()
    
    const thresholds = {
      today: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      all: Infinity,
    }

    const threshold = thresholds[period]
    const timeSinceUpdate = now - itemUpdatedDate
    
    // Validation boost (validated content is more trusted)
    const validationBoost = item.validatedBy ? 20 : 0
    
    // Repository association boost (organized content)
    const repositoryBoost = item.repositoryId ? 10 : 0

    return accessScore + validationBoost + repositoryBoost
  }, [calculateAccessScore])

  // Filter and sort items by access frequency (most frequently accessed first)
  useEffect(() => {
    const scoredItems = allItems
      .map((item) => {
        const accessScore = calculateAccessScore(item, timePeriod)
        const trendingScore = calculateTrendingScore(item, timePeriod)
        return {
          ...item,
          accessScore,
          trendingScore,
        }
      })
      .filter(({ accessScore }) => accessScore > 0)
      .sort((a, b) => b.accessScore - a.accessScore) // Sort by access frequency (most frequently accessed first)

    setTrendingItems(scoredItems)
  }, [allItems, timePeriod, calculateAccessScore, calculateTrendingScore])

  // Calculate top contributors (authors of most frequently accessed items)
  const topContributors = useMemo(() => {
    const contributorMap = new Map<string, { name: string; email: string; accessCount: number; itemCount: number }>()
    
    trendingItems.forEach((item) => {
      if (item.author) {
        const existing = contributorMap.get(item.author.id) || {
          name: item.author.name,
          email: item.author.email,
          accessCount: 0,
          itemCount: 0,
        }
        contributorMap.set(item.author.id, {
          ...existing,
          accessCount: existing.accessCount + item.views,
          itemCount: existing.itemCount + 1,
        })
      }
    })

    return Array.from(contributorMap.values())
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 5)
  }, [trendingItems])

  const handleCreateSuccess = useCallback(() => {
    setShowCreateDialog(false)
    loadItems()
  }, [loadItems])

  const handleItemClick = useCallback((item: KnowledgeItem) => {
    // For individual users, we might not have a detail page route, so we'll just log for now
    // In a real app, you'd navigate to a detail page
    console.log("View trending item:", item.id)
  }, [])

  const timePeriods: { id: TimePeriod; label: string; icon: typeof Clock }[] = [
    { id: "today", label: "Today", icon: Clock },
    { id: "week", label: "This Week", icon: TrendingUp },
    { id: "month", label: "This Month", icon: Flame },
    { id: "all", label: "All Time", icon: TrendingUp },
  ]

  if (!user) return null

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <h1 className="text-3xl font-bold tracking-tight">Knowledge Leaderboard</h1>
            </div>
            <p className="text-muted-foreground">
              Most frequently accessed contributions in the knowledge network
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Knowledge
          </Button>
        </div>

        {/* Time Period Filters */}
        <div className="flex items-center gap-2 border-b border-border">
          {timePeriods.map((period) => {
            const Icon = period.icon
            return (
              <Button
                key={period.id}
                variant="ghost"
                onClick={() => setTimePeriod(period.id)}
                className={cn(
                  "rounded-none border-b-2 border-transparent px-4 py-3 -mb-px font-medium",
                  timePeriod === period.id
                    ? "border-primary text-primary bg-transparent"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className="h-4 w-4 mr-2" />
                {period.label}
              </Button>
            )
          })}
        </div>

        {/* Stats Cards */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-card border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{trendingItems.length}</p>
                  <p className="text-sm text-muted-foreground">Frequently Accessed</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-card border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Eye className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {trendingItems.reduce((sum, item) => sum + item.views, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Accesses</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-card border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {trendingItems.reduce((sum, item) => sum + item.likes, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Engagement</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-card border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Users className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{topContributors.length}</p>
                  <p className="text-sm text-muted-foreground">Top Contributors</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* Empty State */}
            {!loading && trendingItems.length === 0 && (
              <Card className="p-12 text-center bg-card border-border">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Frequently Accessed Items</h3>
                <p className="text-muted-foreground mb-4">
                  No items have been frequently accessed for the selected time period. Create valuable content to get started!
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Knowledge
                </Button>
              </Card>
            )}

            {/* Most Frequently Accessed Items - Leaderboard Style */}
            {!loading && trendingItems.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Most Frequently Accessed Contributions</h2>
                </div>
                
                {/* Top 3 Items - Featured */}
                {trendingItems.slice(0, 3).length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {trendingItems.slice(0, 3).map((item, index) => (
                      <Card 
                        key={item.id} 
                        className={cn(
                          "relative overflow-hidden border-2 transition-all hover:shadow-lg cursor-pointer",
                          index === 0 && "border-yellow-500 bg-yellow-500/5",
                          index === 1 && "border-gray-400 bg-gray-400/5",
                          index === 2 && "border-orange-500 bg-orange-500/5"
                        )}
                        onClick={() => handleItemClick(item)}
                      >
                        {/* Rank Badge */}
                        <div className="absolute top-2 right-2 z-10">
                          <div className={cn(
                            "flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold text-white shadow-lg",
                            index === 0 && "bg-yellow-500",
                            index === 1 && "bg-gray-400",
                            index === 2 && "bg-orange-600"
                          )}>
                            <Trophy className="h-5 w-5" />
                          </div>
                        </div>
                        
                        <div className="p-4 pt-6">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              #{index + 1}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {item.views.toLocaleString()} accesses
                            </span>
                          </div>
                          <h3 className="font-semibold text-base mb-2 line-clamp-2">
                            {item.title}
                          </h3>
                          {item.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {item.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{item.author?.name || "Unknown"}</span>
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {item.views}
                              </span>
                              <span className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                {item.likes}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Remaining Items Grid */}
                {trendingItems.length > 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trendingItems.slice(3).map((item, index) => (
                      <div key={item.id} className="relative">
                        {/* Rank Badge */}
                        <div className="absolute -top-2 -right-2 z-10">
                          <Badge 
                            variant="secondary" 
                            className="w-8 h-8 rounded-full flex items-center justify-center p-0 font-bold"
                          >
                            {index + 4}
                          </Badge>
                        </div>
                        <KnowledgeItemCard
                          item={item}
                          onClick={() => handleItemClick(item)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Trending Topics */}
            <TrendingTopics />

            {/* Top Contributors */}
            {topContributors.length > 0 && (
              <Card className="p-6 bg-card border-border">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Top Contributors</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Authors of most frequently accessed content
                </p>
                <div className="space-y-3">
                  {topContributors.map((contributor, index) => (
                    <div key={contributor.email} className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white flex-shrink-0",
                          index === 0 && "bg-yellow-500",
                          index === 1 && "bg-gray-400",
                          index === 2 && "bg-orange-600",
                          index > 2 && "bg-muted text-muted-foreground"
                        )}>
                          {index < 3 ? <Trophy className="h-4 w-4" /> : index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{contributor.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {contributor.accessCount.toLocaleString()} accesses
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Create Dialog */}
        <CreateKnowledgeDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={handleCreateSuccess}
        />
      </div>
    </DashboardLayout>
  )
}
