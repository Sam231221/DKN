import { type ReactNode } from "react";
import { ProfileDropdown } from "./profile-dropdown";
import { TeamsDropdown } from "./teams-dropdown";
import { OrganizationSidebar } from "./organization-sidebar";
import { RegionalOfficeProvider } from "@/contexts/RegionalOfficeContext";
import { Search, Bell, Book, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface OrganizationDashboardLayoutProps {
  children: ReactNode;
  user: any;
}

export function OrganizationDashboardLayout({
  children,
  user,
}: OrganizationDashboardLayoutProps) {
  return (
    <RegionalOfficeProvider user={user}>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="flex h-16 items-center justify-between px-6">
            {/* Left side - Teams dropdown */}
            <div className="flex items-center gap-6 flex-1 min-w-0">
              <TeamsDropdown user={user} />
            </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Find..."
                className="w-64 pl-9 h-9 text-sm"
              />
              <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span className="text-xs">F</span>
              </kbd>
            </div>
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <HelpCircle className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Book className="h-5 w-5" />
            </Button>
            <div className="h-6 w-6 rounded-full bg-green-500/20 border border-green-500/30" />
            <ProfileDropdown user={user} />
          </div>
        </div>
      </header>

      {/* Main Layout with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <OrganizationSidebar user={user} />

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
      </div>
    </RegionalOfficeProvider>
  );
}

