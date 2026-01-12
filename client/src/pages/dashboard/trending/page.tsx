import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { KnowledgeItemCard } from "@/components/explore/knowledge-item-card"
import { TrendingTopics } from "@/components/dashboard/trending-topics"
import { CreateKnowledgeDialog } from "@/components/knowledge/create-knowledge-dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Loader2, TrendingUp, Flame, Clock } from "lucide-react"
import { fetchKnowledgeItems, type KnowledgeItem } from "@/lib/api"
import { cn } from "@/lib/utils"

type TimePeriod = "today" | "week" | "month" | "all"

export default function TrendingPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [allItems, setAllItems] = useState<KnowledgeItem[]>([])
  const [trendingItems, setTrendingItems] = useState<KnowledgeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("week")
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem("dkn_user")
    if (!userData) {
      navigate("/login")
    } else {
      const parsedUser = JSON.parse(userData)
      // Redirect organizational users to their dashboard
      if (parsedUser.organizationType === "organizational") {
        navigate("/dashboard")
        return
      }
      setUser(parsedUser)
    }
  }, [navigate])

  const loadItems = useCallback(async () => {
    try {
      setLoading(true)
      const fetchedItems = await fetchKnowledgeItems({ status: "approved" })
      setAllItems(fetchedItems)
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

  // Calculate trending score based on recent activity
  const calculateTrendingScore = useCallback((item: KnowledgeItem, period: TimePeriod): number => {
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

    // Calculate trending score
    // Factors: views, likes, recency (recent items get boost), updates
    const viewsWeight = item.views * 1
    const likesWeight = item.likes * 3
    const recencyBoost = Math.max(0, (threshold - itemAge) / threshold) * 100
    const updateBoost = timeSinceUpdate < threshold / 2 ? 50 : 0
    
    // Items with recent updates get extra boost
    const isRecentlyUpdated = timeSinceUpdate < threshold / 3
    const updateRecencyBoost = isRecentlyUpdated ? 30 : 0

    return viewsWeight + likesWeight + recencyBoost + updateBoost + updateRecencyBoost
  }, [])

  // Filter and sort items by trending score
  useEffect(() => {
    const scoredItems = allItems
      .map((item) => ({
        item,
        score: calculateTrendingScore(item, timePeriod),
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item)

    setTrendingItems(scoredItems)
  }, [allItems, timePeriod, calculateTrendingScore])

  const handleCreateSuccess = useCallback(() => {
    setShowCreateDialog(false)
    loadItems()
  }, [loadItems])

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
              <Flame className="h-6 w-6 text-orange-500" />
              <h1 className="text-3xl font-bold tracking-tight">Trending</h1>
            </div>
            <p className="text-muted-foreground">
              Discover the most popular and engaging knowledge items
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-card border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Flame className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{trendingItems.length}</p>
                  <p className="text-sm text-muted-foreground">Trending Items</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-card border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {trendingItems.reduce((sum, item) => sum + item.views, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Views</p>
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
                  <p className="text-sm text-muted-foreground">Total Likes</p>
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
                <Flame className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Trending Items</h3>
                <p className="text-muted-foreground mb-4">
                  No items are trending for the selected time period. Try a different period or create new content!
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Knowledge
                </Button>
              </Card>
            )}

            {/* Trending Items Grid */}
            {!loading && trendingItems.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {trendingItems.map((item, index) => (
                  <div key={item.id} className="relative">
                    {/* Trending Badge for top items */}
                    {index < 3 && (
                      <div className="absolute -top-2 -right-2 z-10">
                        <div className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white",
                          index === 0 && "bg-yellow-500",
                          index === 1 && "bg-gray-400",
                          index === 2 && "bg-orange-600"
                        )}>
                          {index + 1}
                        </div>
                      </div>
                    )}
                    <KnowledgeItemCard
                      item={item}
                      onClick={() => {
                        // Navigate to item detail or open in modal
                        console.log("View trending item:", item.id)
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <TrendingTopics />
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
