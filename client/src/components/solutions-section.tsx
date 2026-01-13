import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Briefcase, GraduationCap } from "lucide-react"

const solutions = [
  {
    icon: Building2,
    title: "Centralization",
    description:
      "Unify all project documentation, client data, and technical resources into secure, searchable repositories accessible from any office.",
    benefits: ["Global access", "Single source of truth", "GDPR compliant"],
  },
  {
    icon: Briefcase,
    title: "Personalization",
    description: "AI-powered recommendations for content, experts, and communities based on ongoing projects and areas of expertise.",
    benefits: ["Smart recommendations", "Expertise mapping", "NLP-powered search"],
  },
  {
    icon: GraduationCap,
    title: "Collaboration",
    description: "Enable geographically dispersed teams to co-develop solutions and share updates through integrated digital workspaces.",
    benefits: ["Cross-office teams", "Real-time sharing", "Knowledge Champions"],
  },
]

export function SolutionsSection() {
  return (
    <section id="solutions" className="py-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Core Capabilities of DKN
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Supporting Velion's consulting operations in logistics, renewable energy, 
            and smart manufacturing across Europe, Asia, and North America.
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
