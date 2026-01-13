import { useAuth } from "@/contexts/AuthContext"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentActivity } from "@/components/dashboard/recent-activity"

export default function ProfilePage() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user.name || user.email.split("@")[0]}</p>
        </div>
        <StatsCards user={user} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity />
        </div>
      </div>
    </DashboardLayout>
  )
}

