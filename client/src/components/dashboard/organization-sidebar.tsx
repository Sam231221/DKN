import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useRegionalOffice } from "@/contexts/RegionalOfficeContext";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import type { UserRole } from "@/lib/permissions";
import type { User } from "@/lib/api";

interface OrganizationSidebarProps {
  className?: string;
  user?: User | null;
}

export function OrganizationSidebar({ className, user }: OrganizationSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const { selectedOffice, isGlobalView } = useRegionalOffice();

  // Get user from localStorage if not provided
  const currentUser = user || (typeof window !== "undefined" ? JSON.parse(localStorage.getItem("dkn_user") || "{}") : null);
  const userRole = (currentUser?.role || "consultant") as UserRole;

  // Use RBAC hook for role-based access
  const { sidebarItems: navItems } = useRoleAccess({ role: userRole });

  // Determine active tab based on current path
  const activeTab = navItems.find((item) => currentPath === item.path) || navItems[0];

  return (
    <aside
      className={cn(
        "w-64 border-r border-border bg-background flex flex-col",
        className
      )}
    >
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab.id === item.id;
          const showRegionalBadge = selectedOffice && !isGlobalView && 
            (item.id === "knowledge-items" || item.id === "projects" || item.id === "repositories" || item.id === "employees");

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                "hover:bg-muted",
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                  {item.badge}
                </span>
              )}
              {showRegionalBadge && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                  {selectedOffice.name.substring(0, 3)}
                </span>
              )}
              {isGlobalView && showRegionalBadge && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  All
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

