import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Award, FileText, MessageSquare, MoreVertical, Shield } from "lucide-react"
import { getRoleBadgeColor, getRoleDisplayName } from "@/lib/permissions"
import type { UserRole } from "@/lib/permissions"

interface ContributorsListProps {
  canManageUsers: boolean
}

const contributors = [
  {
    id: 1,
    name: "Sarah Chen",
    email: "sarah.chen@company.com",
    role: "knowledge_champion" as UserRole,
    contributions: 145,
    points: 3250,
    comments: 89,
    department: "Engineering",
    status: "active",
  },
  {
    id: 2,
    name: "Michael Brown",
    email: "michael.brown@company.com",
    role: "employee" as UserRole,
    contributions: 98,
    points: 2180,
    comments: 54,
    department: "Product",
    status: "active",
  },
  {
    id: 3,
    name: "Emily Davis",
    email: "emily.davis@company.com",
    role: "consultant" as UserRole,
    contributions: 72,
    points: 1890,
    comments: 41,
    department: "Consulting",
    status: "active",
  },
  {
    id: 4,
    name: "James Wilson",
    email: "james.wilson@company.com",
    role: "administrator" as UserRole,
    contributions: 124,
    points: 2850,
    comments: 67,
    department: "IT",
    status: "active",
  },
  {
    id: 5,
    name: "Lisa Anderson",
    email: "lisa.anderson@client.com",
    role: "client" as UserRole,
    contributions: 12,
    points: 340,
    comments: 28,
    department: "External",
    status: "active",
  },
]

export function ContributorsList({ canManageUsers }: ContributorsListProps) {
  return (
    <div className="space-y-4">
      {contributors.map((contributor) => (
        <Card key={contributor.id} className="p-6 bg-card border-border">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <span className="text-lg font-semibold text-primary">{contributor.name[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold">{contributor.name}</h3>
                    {(contributor.role === "administrator" || contributor.role === "knowledge_champion") && (
                      <Shield className="h-4 w-4 text-primary" title="Elevated permissions" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{contributor.email}</p>
                </div>
                {canManageUsers && (
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm mb-3">
                <Badge className={getRoleBadgeColor(contributor.role)}>{getRoleDisplayName(contributor.role)}</Badge>
                <Badge variant="secondary">{contributor.department}</Badge>
                <Badge variant="outline" className="text-green-500 border-green-500">
                  {contributor.status}
                </Badge>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>{contributor.contributions} contributions</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  <span>{contributor.points} points</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{contributor.comments} comments</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
