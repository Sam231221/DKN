import { useState, useCallback } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ContributorsList } from "@/components/contributors/contributors-list"
import { ContributorsFilters } from "@/components/contributors/contributors-filters"
import { hasPermission } from "@/lib/permissions"

export default function ContributorsPage() {
  const { user } = useAuth()
  const [filters, setFilters] = useState<{ role?: string; status?: string; search?: string }>({})

  const handleFiltersChange = useCallback((newFilters: { role?: string; status?: string; search?: string }) => {
    setFilters(newFilters)
  }, [])

  if (!user) return null

  const canManageUsers = hasPermission(user.role as any, "canManageUsers")

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contributors</h1>
            <p className="text-muted-foreground">View and manage users across the organization</p>
          </div>
          {canManageUsers && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-primary">Administrator</span> access enabled
            </div>
          )}
        </div>

        <ContributorsFilters onFiltersChange={handleFiltersChange} />
        <ContributorsList canManageUsers={canManageUsers} filters={filters} />
      </div>
    </DashboardLayout>
  )
}
