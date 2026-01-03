import { Card } from "@/components/ui/card"

const stats = [
  {
    value: "98%",
    label: "faster knowledge retrieval",
    company: "Enterprise Teams",
  },
  {
    value: "300%",
    label: "increase in collaboration",
    company: "Global Organizations",
  },
  {
    value: "24/7",
    label: "AI-powered assistance",
    company: "Knowledge Champions",
  },
  {
    value: "100+",
    label: "integrations available",
    company: "Tech Stacks",
  },
]

export function StatsSection() {
  return (
    <section className="py-20 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 bg-card border-border">
              <div className="space-y-2">
                <div className="text-4xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-foreground">{stat.label}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">{stat.company}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
