import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Award, Star, Zap, Target, Heart, BookOpen, Users, TrendingUp } from "lucide-react"

const achievements = [
  {
    id: 1,
    name: "First Contribution",
    description: "Created your first knowledge item",
    icon: Star,
    earned: true,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  {
    id: 2,
    name: "Knowledge Champion",
    description: "Validated 50 knowledge items",
    icon: Award,
    earned: true,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    id: 3,
    name: "Speed Demon",
    description: "Contributed 10 items in one day",
    icon: Zap,
    earned: true,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    id: 4,
    name: "Team Player",
    description: "Helped 25 colleagues with comments",
    icon: Users,
    earned: true,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    id: 5,
    name: "Trending Creator",
    description: "Created a trending knowledge item",
    icon: TrendingUp,
    earned: true,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },
  {
    id: 6,
    name: "Perfectionist",
    description: "Maintain 100% validation rate",
    icon: Target,
    earned: false,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
  {
    id: 7,
    name: "Bookworm",
    description: "Read 100 knowledge items",
    icon: BookOpen,
    earned: false,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
  {
    id: 8,
    name: "Loved by All",
    description: "Receive 100 stars on your content",
    icon: Heart,
    earned: false,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
]

export function AchievementsPanel() {
  const earnedCount = achievements.filter((a) => a.earned).length

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Achievements</h2>
        </div>
        <Badge variant="secondary">
          {earnedCount}/{achievements.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`flex items-start gap-3 p-3 rounded-lg border ${
              achievement.earned ? "border-border bg-muted/30" : "border-border/50 opacity-50"
            }`}
          >
            <div className={`p-2 rounded-lg ${achievement.bgColor} shrink-0`}>
              <achievement.icon className={`h-4 w-4 ${achievement.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{achievement.name}</p>
              <p className="text-xs text-muted-foreground">{achievement.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
