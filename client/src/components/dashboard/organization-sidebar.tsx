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
} from "lucide-react";

interface OrganizationSidebarProps {
  className?: string;
}

const navItems = [
  { id: "overview", label: "Overview", path: "/dashboard", icon: LayoutDashboard },
  { id: "clients", label: "Clients", path: "/dashboard/clients", icon: Users },
  { id: "employees", label: "Employees", path: "/dashboard/employees", icon: UserCheck },
  { id: "projects", label: "Projects", path: "/dashboard/projects", icon: Briefcase },
  { id: "knowledge-items", label: "Knowledge Items", path: "/dashboard/knowledge-items", icon: FileText },
  { id: "repositories", label: "Repositories", path: "/dashboard/repositories", icon: FolderKanban },
  { id: "settings", label: "Settings", path: "/dashboard/settings", icon: Settings },
];

export function OrganizationSidebar({ className }: OrganizationSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

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
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

