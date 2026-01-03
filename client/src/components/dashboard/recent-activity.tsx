import { Card } from "@/components/ui/card"
import { Clock, MessageSquare, Star, FileEdit } from "lucide-react"

const activities = [
  {
    type: "comment",
    user: "Sarah Chen",
    action: "commented on",
    target: "API Guidelines",
    time: "5 min ago",
    icon: MessageSquare,
  },
  {
    type: "star",
    user: "Michael Brown",
    action: "starred",
    target: "Onboarding Checklist",
    time: "1 hour ago",
    icon: Star,
  },
  {
    type: "edit",
    user: "Emily Davis",
    action: "updated",
    target: "Security Protocol",
    time: "3 hours ago",
    icon: FileEdit,
  },
  {
    type: "comment",
    user: "James Wilson",
    action: "commented on",
    target: "Client FAQ",
    time: "5 hours ago",
    icon: MessageSquare,
  },
]

export function RecentActivity() {
  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Recent Activity</h2>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-muted">
              <activity.icon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-medium">{activity.user}</span>{" "}
                <span className="text-muted-foreground">{activity.action}</span>{" "}
                <span className="font-medium">{activity.target}</span>
              </p>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
