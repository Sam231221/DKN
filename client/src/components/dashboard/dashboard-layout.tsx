import type React from "react"
import { DailyDevTopbar } from "./daily-dev-topbar"
import { DailyDevSidebar } from "./daily-dev-sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
  user: any
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DailyDevTopbar user={user} />
      <div className="flex flex-1 overflow-hidden">
        <DailyDevSidebar user={user} />
        <main className="flex-1 overflow-auto bg-muted/20">
          <div className="container mx-auto p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
