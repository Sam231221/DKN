import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  Award,
  Search,
  Settings,
  LogOut,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardSidebarProps {
  user: any;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Repositories", href: "/dashboard/repositories", icon: FolderOpen },
  { name: "Knowledge Items", href: "/dashboard/knowledge", icon: BookOpen },
  { name: "Search", href: "/dashboard/search", icon: Search },
  { name: "Trending", href: "/dashboard/trending", icon: TrendingUp },
  { name: "Contributors", href: "/dashboard/contributors", icon: Users },
  { name: "Leaderboard", href: "/dashboard/leaderboard", icon: Award },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("dkn_user");
    navigate("/");
  };

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col">
      <div className="p-6 border-b border-border">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">
              DKN
            </span>
          </div>
          <span className="text-lg font-semibold">Knowledge Network</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">
              {user.name?.[0]?.toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate capitalize">
              {user.role?.replace("_", " ")}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
