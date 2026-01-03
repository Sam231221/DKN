import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  Award,
  Search,
  Settings,
  BookOpen,
  TrendingUp,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DashboardSidebarProps {
  user: any;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Repositories", href: "/dashboard/repositories", icon: FolderOpen },
  { name: "Knowledge", href: "/dashboard/knowledge", icon: BookOpen },
  { name: "Search", href: "/dashboard/search", icon: Search },
  { name: "Trending", href: "/dashboard/trending", icon: TrendingUp },
  { name: "Contributors", href: "/dashboard/contributors", icon: Users },
  { name: "Leaderboard", href: "/dashboard/leaderboard", icon: Award },
];

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <aside className="w-64 border-r border-border bg-background flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Logo Section */}
      <div className="p-4 border-b border-border">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">DKN</span>
          </div>
          <span className="text-lg font-semibold">Knowledge Network</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Input
            placeholder="Search knowledge items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/50 border-0 focus-visible:ring-1"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-border">
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => navigate("/dashboard/knowledge")}
            className="w-full justify-start"
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Knowledge
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
        <Link
          to="/dashboard/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            location.pathname === "/dashboard/settings"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </Link>
      </nav>

    </aside>
  );
}

