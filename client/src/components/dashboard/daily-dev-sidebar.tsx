import { useState, useEffect } from "react";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DailyDevSidebarProps {
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

export function DailyDevSidebar({ user }: DailyDevSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside
      className={cn(
        "border-r border-border bg-background flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden transition-all duration-300 relative",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Search Bar */}
      {!isCollapsed && (
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
      )}
      
      {isCollapsed && (
        <div className="p-4 border-b border-border flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard/search")}
            className="h-9 w-9"
            title="Search"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Quick Actions */}
      <div className={cn("p-4 border-b border-border", isCollapsed && "px-2")}>
        {isCollapsed ? (
          <Button
            onClick={() => navigate("/dashboard/knowledge")}
            variant="ghost"
            size="icon"
            className="w-full h-9"
            title="Create Knowledge"
          >
            <Plus className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={() => navigate("/dashboard/knowledge")}
            className="w-full justify-start"
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Knowledge
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 overflow-y-auto space-y-1", isCollapsed ? "p-2" : "p-4")}>
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              title={isCollapsed ? item.name : undefined}
              className={cn(
                "flex items-center rounded-lg text-sm font-medium transition-colors",
                isCollapsed
                  ? "justify-center px-2 py-2"
                  : "gap-3 px-3 py-2",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn("flex-shrink-0", isCollapsed ? "h-5 w-5" : "h-5 w-5")} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
        <Link
          to="/dashboard/settings"
          title={isCollapsed ? "Settings" : undefined}
          className={cn(
            "flex items-center rounded-lg text-sm font-medium transition-colors",
            isCollapsed
              ? "justify-center px-2 py-2"
              : "gap-3 px-3 py-2",
            location.pathname === "/dashboard/settings"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Settings className={cn("flex-shrink-0", isCollapsed ? "h-5 w-5" : "h-5 w-5")} />
          {!isCollapsed && <span>Settings</span>}
        </Link>
        
        {/* Toggle Button - Aligned with navigation items at the bottom */}
        <button
          onClick={toggleSidebar}
          className={cn(
            "flex items-center rounded-lg text-sm font-medium transition-colors mt-1",
            isCollapsed
              ? "justify-center px-2 py-2"
              : "gap-3 px-3 py-2",
            "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </nav>
    </aside>
  );
}

