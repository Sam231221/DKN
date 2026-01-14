import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { KnowledgeItemCard } from "@/components/explore/knowledge-item-card"
import { FilterTabs } from "@/components/explore/filter-tabs"
import { CreateKnowledgeDialog } from "@/components/knowledge/create-knowledge-dialog"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import type { FilterType } from "@/components/explore/filter-tabs"
import { fetchKnowledgeItems, type KnowledgeItem } from "@/lib/api"

export default function DashboardPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeFilter, setActiveFilter] = useState<FilterType>("popular")
  const [allItems, setAllItems] = useState<KnowledgeItem[]>([])
  const [items, setItems] = useState<KnowledgeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  useEffect(() => {
    // Check if create dialog should be opened from URL
    const createParam = searchParams.get("create")
    if (createParam === "true") {
      setShowCreateDialog(true)
      // Remove the query param from URL
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const loadItems = useCallback(async () => {
    try {
      setLoading(true)
      const fetchedItems = await fetchKnowledgeItems({ status: "approved" })
      setAllItems(fetchedItems.data)
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

  useEffect(() => {
    // Sort items based on active filter
    const sorted = [...allItems].sort((a, b) => {
      switch (activeFilter) {
        case "popular":
          return (b.likes + b.views) - (a.likes + a.views)
        case "upvotes":
          return b.likes - a.likes
        case "comments":
          // For now, we don't have comments count, so use views as proxy
          return b.views - a.views
        case "date":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          return 0
      }
    })
    setItems(sorted)
  }, [activeFilter, allItems])

  const handleCreateSuccess = useCallback(() => {
    setShowCreateDialog(false)
    loadItems()
  }, [loadItems])

  if (!user) return null

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Explore</h1>
            <p className="text-muted-foreground mt-1">Discover knowledge repositories and trending topics</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Knowledge
          </Button>
        </div>

        {/* Filter Tabs */}
        <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Items Grid */}
        {!loading && items.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No knowledge items found. Create your first item to get started!</p>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <KnowledgeItemCard 
                key={item.id} 
                item={item}
                onClick={() => {
                  // Navigate to item detail or open in modal
                  console.log("View item:", item.id)
                }}
              />
            ))}
          </div>
        )}

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
