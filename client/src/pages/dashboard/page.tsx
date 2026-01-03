import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { KnowledgeRepositories } from "@/components/dashboard/knowledge-repositories"
import { TrendingTopics } from "@/components/dashboard/trending-topics"

export default function DashboardPage() {
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

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.name || user.email.split("@")[0]}</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening in your knowledge network today</p>
        </div>
        <StatsCards user={user} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <KnowledgeRepositories />
          </div>
          <div className="space-y-6">
            <TrendingTopics />
            <RecentActivity />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
