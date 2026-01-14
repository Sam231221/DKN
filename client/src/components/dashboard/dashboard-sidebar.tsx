import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import type { UserRole } from "@/lib/permissions";
import { sidebarItems } from "@/lib/rbac";

interface DashboardSidebarProps {
  user: any;
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = (user?.role || "consultant") as UserRole;

  // Use RBAC hook for role-based access
  // Filter to only show explore-related items (not organization dashboard items)
  const { sidebarItems } = useRoleAccess({ role: userRole });
  const navigation = sidebarItems.filter((item) => 
    item.path.startsWith("/explore") || 
    item.id === "search" || 
    item.id === "trending" || 
    item.id === "contributors" || 
    item.id === "leaderboard" || 
    item.id === "settings"
  );

  const handleLogout = () => {
    // Clear both token and user
    localStorage.removeItem("dkn_token");
    localStorage.removeItem("dkn_user");
    localStorage.removeItem("dkn_selected_office");
    navigate("/login");
  };

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col">
      <div className="p-6 border-b border-border">
        <Link to="/explore" className="flex items-center gap-2">
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
            const isActive = location.pathname === item.path || location.pathname === item.path.replace("/dashboard", "/explore");
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.path.startsWith("/dashboard") ? item.path.replace("/dashboard", "/explore") : item.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
                {item.badge && (
                  <span className="ml-auto text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                    {item.badge}
                  </span>
                )}
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
