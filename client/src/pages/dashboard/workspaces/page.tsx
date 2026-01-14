import { useAuth } from "@/contexts/AuthContext";
import { OrganizationDashboardLayout } from "@/components/dashboard/organization-dashboard-layout";
import { WorkspaceList } from "@/components/workspace/workspace-list";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function WorkspacesPage() {
  const { user } = useAuth();
  const userRole = (user?.role || "consultant") as any;
  const { canViewPage } = useRoleAccess({ role: userRole });

  if (!user) return null;

  // RBAC check
  if (!canViewPage("workspaces")) {
    return (
      <OrganizationDashboardLayout user={user}>
        <Card className="p-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>You do not have permission to view workspaces.</span>
          </div>
        </Card>
      </OrganizationDashboardLayout>
    );
  }

  return (
    <OrganizationDashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workspaces</h1>
          <p className="text-muted-foreground">
            Collaborate with your team on projects and knowledge sharing
          </p>
        </div>
        <WorkspaceList />
      </div>
    </OrganizationDashboardLayout>
  );
}
