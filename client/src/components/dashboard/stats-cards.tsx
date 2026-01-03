import { Card } from "@/components/ui/card"
import { BookOpen, Users, Award, TrendingUp } from "lucide-react"

interface StatsCardsProps {
  user: {
    points?: number
    contributions?: number
    role?: string
  }
}

export function StatsCards({ user }: StatsCardsProps) {
  const stats = [
    {
      title: "Knowledge Items",
      value: "1,284",
      change: "+12.5%",
      icon: BookOpen,
      color: "text-blue-500",
    },
    {
      title: "Active Contributors",
      value: "342",
      change: "+8.2%",
      icon: Users,
      color: "text-green-500",
    },
    {
      title: "Your Points",
      value: user.points?.toLocaleString() || "0",
      change: "+125",
      icon: Award,
      color: "text-yellow-500",
    },
    {
      title: "Your Contributions",
      value: user.contributions?.toString() || "0",
      change: "+5",
      icon: TrendingUp,
      color: "text-purple-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="p-6 bg-card border-border">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-green-500">{stat.change}</span>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        </Card>
      ))}
    </div>
  )
}
