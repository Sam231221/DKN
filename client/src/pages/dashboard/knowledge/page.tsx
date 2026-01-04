import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { KnowledgeList } from "@/components/knowledge/knowledge-list"
import { KnowledgeFilters } from "@/components/knowledge/knowledge-filters"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreateKnowledgeDialog } from "@/components/knowledge/create-knowledge-dialog"

export default function KnowledgePage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
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
        <KnowledgeList type={typeFilter} search={searchQuery} />
        <CreateKnowledgeDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
      </div>
    </DashboardLayout>
  )
}
