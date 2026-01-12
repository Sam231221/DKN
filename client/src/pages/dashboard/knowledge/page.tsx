import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { KnowledgeList } from "@/components/knowledge/knowledge-list"
import { KnowledgeFilters } from "@/components/knowledge/knowledge-filters"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreateKnowledgeDialog } from "@/components/knowledge/create-knowledge-dialog"
import { EditKnowledgeDialog } from "@/components/knowledge/edit-knowledge-dialog"
import { DeleteKnowledgeDialog } from "@/components/knowledge/delete-knowledge-dialog"
import type { KnowledgeItem } from "@/lib/api"

export default function KnowledgePage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [typeFilter, setTypeFilter] = useState<string | undefined>()
  const [searchQuery, setSearchQuery] = useState<string>("")

  useEffect(() => {
    const userData = localStorage.getItem("dkn_user")
    if (!userData) {
      navigate("/login")
    } else {
      setUser(JSON.parse(userData))
    }
  }, [navigate])

  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1)
  }, [])

  const handleEdit = useCallback((item: KnowledgeItem) => {
    setSelectedItem(item)
    setShowEditDialog(true)
  }, [])

  const handleDelete = useCallback((item: KnowledgeItem) => {
    setSelectedItem(item)
    setShowDeleteDialog(true)
  }, [])

  const handleEditSuccess = useCallback(() => {
    setShowEditDialog(false)
    setSelectedItem(null)
    handleRefresh()
  }, [handleRefresh])

  const handleDeleteSuccess = useCallback(() => {
    setShowDeleteDialog(false)
    setSelectedItem(null)
    handleRefresh()
  }, [handleRefresh])

  const handleCreateSuccess = useCallback(() => {
    handleRefresh()
  }, [handleRefresh])

  if (!user) return null

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Knowledge Items</h1>
            <p className="text-muted-foreground">Browse and manage organizational knowledge</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Item
          </Button>
        </div>

        <KnowledgeFilters 
          type={typeFilter}
          search={searchQuery}
          onTypeChange={(value) => setTypeFilter(value)}
          onSearchChange={(value) => setSearchQuery(value)}
        />
        <KnowledgeList
          key={refreshKey}
          type={typeFilter}
          search={searchQuery}
          user={user}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        <CreateKnowledgeDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={handleCreateSuccess}
        />
        <EditKnowledgeDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          itemId={selectedItem?.id || null}
          onSuccess={handleEditSuccess}
          user={user}
        />
        <DeleteKnowledgeDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          itemId={selectedItem?.id || null}
          onSuccess={handleDeleteSuccess}
        />
      </div>
    </DashboardLayout>
  )
}
