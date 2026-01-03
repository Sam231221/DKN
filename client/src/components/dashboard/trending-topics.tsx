import { Card } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

const topics = [
  { name: "API Integration", count: 48, trend: "+12" },
  { name: "Security Best Practices", count: 42, trend: "+8" },
  { name: "Onboarding Process", count: 38, trend: "+15" },
  { name: "Client Communication", count: 35, trend: "+6" },
  { name: "Project Management", count: 29, trend: "+4" },
]

export function TrendingTopics() {
  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Trending Topics</h2>
      </div>

      <div className="space-y-3">
        {topics.map((topic, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium">{topic.name}</p>
              <p className="text-xs text-muted-foreground">{topic.count} items</p>
            </div>
            <span className="text-xs font-medium text-green-500">{topic.trend}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
