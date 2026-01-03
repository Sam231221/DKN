import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, TrendingUp, Medal } from "lucide-react"

interface LeaderboardListProps {
  currentUserId: string
}

const leaderboard = [
  {
    rank: 1,
    name: "Sarah Chen",
    email: "sarah.chen@company.com",
    points: 5280,
    contributions: 145,
    trend: "+245",
    badges: 24,
  },
  {
    rank: 2,
    name: "James Wilson",
    email: "james.wilson@company.com",
    points: 4650,
    contributions: 124,
    trend: "+198",
    badges: 21,
  },
  {
    rank: 3,
    name: "Michael Brown",
    email: "michael.brown@company.com",
    points: 3890,
    contributions: 98,
    trend: "+156",
    badges: 18,
  },
  {
    rank: 4,
    name: "Emily Davis",
    email: "emily.davis@company.com",
    points: 3420,
    contributions: 72,
    trend: "+132",
    badges: 15,
  },
  {
    rank: 5,
    name: "David Lee",
    email: "david.lee@company.com",
    points: 3180,
    contributions: 89,
    trend: "+124",
    badges: 14,
  },
  {
    rank: 6,
    name: "Rachel Green",
    email: "rachel.green@company.com",
    points: 2950,
    contributions: 67,
    trend: "+118",
    badges: 13,
  },
  {
    rank: 7,
    name: "Tom Anderson",
    email: "tom.anderson@company.com",
    points: 2780,
    contributions: 54,
    trend: "+95",
    badges: 12,
  },
  {
    rank: 8,
    name: "You",
    email: "you@company.com",
    points: 2450,
    contributions: 48,
    trend: "+88",
    badges: 12,
  },
]

export function LeaderboardList({ currentUserId }: LeaderboardListProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-500/10 border-yellow-500/30"
    if (rank === 2) return "bg-gray-400/10 border-gray-400/30"
    if (rank === 3) return "bg-amber-600/10 border-amber-600/30"
    return ""
  }

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Top Contributors</h2>
      </div>

      <div className="space-y-3">
        {leaderboard.map((entry) => {
          const isCurrentUser = entry.name === "You"
          return (
            <div
              key={entry.rank}
              className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                getRankColor(entry.rank) || "border-border hover:bg-muted/50"
              } ${isCurrentUser ? "bg-primary/5 border-primary/30" : ""}`}
            >
              <div className="flex h-10 w-10 items-center justify-center shrink-0">{getRankIcon(entry.rank)}</div>

              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-primary">{entry.name[0]}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold truncate">{entry.name}</p>
                  {isCurrentUser && (
                    <Badge variant="secondary" className="text-xs">
                      You
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{entry.contributions} contributions</p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-lg font-bold">{entry.points.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-xs text-green-500">
                  <TrendingUp className="h-3 w-3" />
                  <span>{entry.trend}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
