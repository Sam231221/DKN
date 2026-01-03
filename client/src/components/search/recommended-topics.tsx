import { Card } from "@/components/ui/card"
import { TrendingUp, FileText, Users, Shield, Zap, BookOpen } from "lucide-react"

interface RecommendedTopicsProps {
  onTopicClick: (topic: string) => void
}

const topics = [
  {
    icon: Shield,
    title: "Security Best Practices",
    description: "Learn about organizational security protocols",
    query: "What are our security best practices?",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Effective ways to work with your team",
    query: "How to collaborate effectively with team members?",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Zap,
    title: "Quick Start Guides",
    description: "Get started quickly with common tasks",
    query: "Show me quick start guides",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  {
    icon: FileText,
    title: "Documentation Standards",
    description: "How to create proper documentation",
    query: "What are our documentation standards?",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    icon: TrendingUp,
    title: "Trending Topics",
    description: "Most searched knowledge items this week",
    query: "Show me trending topics",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: BookOpen,
    title: "Training Materials",
    description: "Access onboarding and training resources",
    query: "Find training materials",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },
]

export function RecommendedTopics({ onTopicClick }: RecommendedTopicsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Recommended Topics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topics.map((topic, index) => (
          <Card
            key={index}
            className="p-6 bg-card border-border hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => onTopicClick(topic.query)}
          >
            <div className={`p-3 rounded-lg ${topic.bgColor} w-fit mb-4`}>
              <topic.icon className={`h-6 w-6 ${topic.color}`} />
            </div>
            <h3 className="font-semibold mb-2">{topic.title}</h3>
            <p className="text-sm text-muted-foreground">{topic.description}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
