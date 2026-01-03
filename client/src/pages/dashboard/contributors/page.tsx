import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ContributorsList } from "@/components/contributors/contributors-list"
import { ContributorsFilters } from "@/components/contributors/contributors-filters"
import { hasPermission } from "@/lib/permissions"

export default function ContributorsPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem("dkn_user")
    if (!userData) {
      navigate("/login")
    } else {
      setUser(JSON.parse(userData))
    }
  }, [navigate])

  if (!user) return null

  const canManageUsers = hasPermission(user.role, "canManageUsers")

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

        <ContributorsFilters />
        <ContributorsList canManageUsers={canManageUsers} />
      </div>
    </DashboardLayout>
  )
}
