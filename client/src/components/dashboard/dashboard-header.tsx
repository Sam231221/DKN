import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, Plus, Search } from "lucide-react"

interface DashboardHeaderProps {
  user: any
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.name || user.email.split("@")[0]}</h1>
          <p className="text-muted-foreground">{"Here's what's happening in your knowledge network today"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="bg-transparent">
            <Bell className="h-5 w-5" />
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Knowledge
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search knowledge items, repositories, or people..." className="pl-10 bg-background" />
      </div>
    </div>
  )
}
