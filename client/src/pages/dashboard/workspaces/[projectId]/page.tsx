import { useAuth } from "@/contexts/AuthContext";
import { OrganizationDashboardLayout } from "@/components/dashboard/organization-dashboard-layout";
import { WorkspaceDetail } from "@/components/workspace/workspace-detail";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function WorkspaceDetailPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Workspace</h1>
          <p className="text-muted-foreground">
            Manage team members and view activity
          </p>
        </div>
        <WorkspaceDetail />
      </div>
    </OrganizationDashboardLayout>
  );
}
