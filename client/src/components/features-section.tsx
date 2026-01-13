import { Card } from "@/components/ui/card"
import { Brain, Users, Shield, Zap, Award, Search } from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "AI-Powered Intelligence",
    description:
      "Advanced NLP and AI engine for relevant knowledge discovery, redundancy detection, and smart recommendations.",
  },
  {
    icon: Users,
    title: "Seamless Collaboration",
    description: "Connect teams globally with real-time knowledge sharing and integrated communication tools.",
  },
  {
    icon: Shield,
    title: "Secure Access Control",
    description:
      "Role-based permissions for clients, consultants, employees, and administrators with enterprise-grade security.",
  },
  {
    icon: Search,
    title: "Smart Knowledge Search",
    description: "Find exactly what you need with AI-powered search that understands context and intent.",
  },
  {
    icon: Award,
    title: "Gamification System",
    description: "Motivate contributions with points, badges, and leaderboards that recognize knowledge champions.",
  },
  {
    icon: Zap,
    title: "Knowledge Validation",
    description: "Maintain accuracy and relevance with automated validation workflows and expert review systems.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Three Pillars of Knowledge Management
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            DKN is structured around centralization, personalization, and collaboration 
            to support Velion's global consulting operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
