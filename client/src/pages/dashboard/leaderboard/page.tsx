import { useAuth } from "@/contexts/AuthContext"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { LeaderboardList } from "@/components/gamification/leaderboard-list"
import { AchievementsPanel } from "@/components/gamification/achievements-panel"
import { Card } from "@/components/ui/card"
import { Trophy, TrendingUp, Award } from "lucide-react"

export default function LeaderboardPage() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-muted-foreground">Top contributors and achievers in the knowledge network</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-500/10">
                <Trophy className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">2,450</p>
                <p className="text-sm text-muted-foreground">Your Total Points</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">#8</p>
                <p className="text-sm text-muted-foreground">Your Rank</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/10">
                <Award className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">Badges Earned</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LeaderboardList currentUserId={user.email} />
          </div>
          <div>
            <AchievementsPanel />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
