import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FileText,
  FolderKanban,
  Briefcase,
  Settings,
  Search,
  TrendingUp,
  Award,
} from "lucide-react";
import { useRegionalOffice } from "@/contexts/RegionalOfficeContext";

interface OrganizationSidebarProps {
  className?: string;
  user?: any;
}

const allNavItems = [
  { id: "overview", label: "Overview", path: "/dashboard", icon: LayoutDashboard, roles: ["all"] },
  { id: "clients", label: "Clients", path: "/dashboard/clients", icon: Users, roles: ["administrator", "executive_leadership"] },
  { id: "employees", label: "Employees", path: "/dashboard/employees", icon: UserCheck, roles: ["administrator", "executive_leadership", "knowledge_champion"] },
  { id: "projects", label: "Projects", path: "/dashboard/projects", icon: Briefcase, roles: ["all"] },
  { id: "knowledge-items", label: "Knowledge Items", path: "/dashboard/knowledge-items", icon: FileText, roles: ["all"] },
  { id: "repositories", label: "Repositories", path: "/dashboard/repositories", icon: FolderKanban, roles: ["all"] },
  { id: "search", label: "Search", path: "/dashboard/search", icon: Search, roles: ["all"] },
  { id: "trending", label: "Trending", path: "/dashboard/trending", icon: TrendingUp, roles: ["all"] },
  { id: "contributors", label: "Contributors", path: "/dashboard/contributors", icon: Users, roles: ["all"] },
  { id: "leaderboard", label: "Leaderboard", path: "/dashboard/leaderboard", icon: Award, roles: ["all"] },
  { id: "settings", label: "Settings", path: "/dashboard/settings", icon: Settings, roles: ["all"] },
];

export function OrganizationSidebar({ className, user }: OrganizationSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const { selectedOffice, isGlobalView } = useRegionalOffice();

  // Get user from localStorage if not provided
  const currentUser = user || (typeof window !== "undefined" ? JSON.parse(localStorage.getItem("dkn_user") || "{}") : null);
  const userRole = currentUser?.role || "client";

  // Filter nav items based on role
  const navItems = allNavItems.filter((item) => {
    if (item.roles.includes("all")) return true;
    return item.roles.includes(userRole);
  });

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

