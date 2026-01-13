import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Award, FileText, MessageSquare, MoreVertical, Shield, Loader2 } from "lucide-react"
import { getRoleBadgeColor, getRoleDisplayName } from "@/lib/permissions"
import type { UserRole } from "@/lib/permissions"
import { fetchContributors, type Contributor } from "@/lib/api"
import { useRegionalOffice } from "@/contexts/RegionalOfficeContext"

interface ContributorsListProps {
  canManageUsers: boolean
  filters?: {
    role?: string
    status?: string
    search?: string
  }
}

export function ContributorsList({ canManageUsers, filters }: ContributorsListProps) {
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { selectedOffice } = useRegionalOffice()

  useEffect(() => {
    async function loadContributors() {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchContributors({
          role: filters?.role,
          status: filters?.status,
          search: filters?.search,
          regionId: selectedOffice?.id || "all",
        })
        setContributors(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load contributors")
        console.error("Error loading contributors:", err)
      } finally {
        setLoading(false)
      }
    }

    loadContributors()
  }, [filters?.role, filters?.status, filters?.search, selectedOffice?.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  if (contributors.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">No contributors found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {contributors.map((contributor) => (
        <Card key={contributor.id} className="p-6 bg-card border-border">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <span className="text-lg font-semibold text-primary">{contributor.name[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold">{contributor.name}</h3>
                    {(contributor.role === "administrator" || contributor.role === "knowledge_champion") && (
                      <span title="Elevated permissions">
                        <Shield className="h-4 w-4 text-primary" />
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{contributor.email}</p>
                </div>
                {canManageUsers && (
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm mb-3">
                <Badge className={getRoleBadgeColor(contributor.role as UserRole)}>{getRoleDisplayName(contributor.role as UserRole)}</Badge>
                {contributor.department && (
                  <Badge variant="secondary">{contributor.department}</Badge>
                )}
                <Badge variant="outline" className={contributor.status === "active" ? "text-green-500 border-green-500" : "text-muted-foreground border-muted-foreground"}>
                  {contributor.status}
                </Badge>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>{contributor.contributions} contributions</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  <span>{contributor.points} points</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{contributor.comments} comments</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
