import { Card } from "@/components/ui/card"

const stats = [
  {
    value: "33%",
    label: "reduction in project duplication",
    company: "Velion Dynamics",
  },
  {
    value: "40%",
    label: "increase in cross-office collaboration",
    company: "Global Teams",
  },
  {
    value: "50%",
    label: "faster onboarding time",
    company: "New Consultants",
  },
  {
    value: "1,200+",
    label: "consultants across regions",
    company: "Europe, Asia, Americas",
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
