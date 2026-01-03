import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Briefcase, GraduationCap } from "lucide-react"

const solutions = [
  {
    icon: Building2,
    title: "Enterprise Organizations",
    description:
      "Scale knowledge management across departments and regions with centralized governance and compliance.",
    benefits: ["Global collaboration", "Department-level control", "Compliance ready"],
  },
  {
    icon: Briefcase,
    title: "Consulting Firms",
    description: "Enable consultants to access and contribute client knowledge securely with granular permissions.",
    benefits: ["Client portals", "Project knowledge bases", "Secure sharing"],
  },
  {
    icon: GraduationCap,
    title: "Knowledge Champions",
    description: "Empower internal experts to curate, validate, and share their expertise organization-wide.",
    benefits: ["Expert recognition", "Content curation", "Quality assurance"],
  },
]

export function SolutionsSection() {
  return (
    <section id="solutions" className="py-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Solutions for every role in your organization
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From clients to administrators, DKN adapts to your organizational structure.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {solutions.map((solution, index) => (
            <Card key={index} className="p-8 bg-card border-border">
              <div className="mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <solution.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{solution.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{solution.description}</p>
              </div>

              <ul className="space-y-2 mb-6">
                {solution.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <Button variant="outline" className="w-full bg-transparent">
                Learn More
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
