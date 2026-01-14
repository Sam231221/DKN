import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Users,
  Calendar,
  Loader2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import {
  fetchUserWorkspaces,
  formatDate,
  type Workspace,
} from "@/lib/api";
import { useNavigate } from "react-router-dom";

export function WorkspaceList() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedWorkspaces = await fetchUserWorkspaces();
      setWorkspaces(fetchedWorkspaces);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workspaces");
      console.error("Error fetching workspaces:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-600 dark:text-green-400";
      case "completed":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "on_hold":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case "cancelled":
        return "bg-red-500/10 text-red-600 dark:text-red-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getRoleBadge = (role?: string) => {
    if (!role) return null;
    const roleColors: Record<string, string> = {
      owner: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      admin: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      member: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
      viewer: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
    };
    return (
      <Badge className={roleColors[role] || "bg-muted text-muted-foreground"}>
        {role}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (workspaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No workspaces found</p>
        <p className="text-sm text-muted-foreground mt-2">
          Workspaces are created from projects. Join a project to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {workspaces.map((workspace) => (
        <Card
          key={workspace.id}
          className="p-6 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate(`/dashboard/workspaces/${workspace.id}`)}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-1">
                    {workspace.name}
                  </h3>
                  {workspace.projectCode && (
                    <p className="text-sm text-muted-foreground">
                      {workspace.projectCode}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge className={getStatusColor(workspace.status)}>
                  {workspace.status.replace("_", " ")}
                </Badge>
                {workspace.userRole && getRoleBadge(workspace.userRole)}
                {workspace.domain && (
                  <Badge variant="outline" className="text-xs">
                    {workspace.domain}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formatDate(workspace.startDate)}
                    {workspace.endDate && ` - ${formatDate(workspace.endDate)}`}
                  </span>
                </div>
                {workspace.joinedAt && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>Joined {formatDate(workspace.joinedAt)}</span>
                  </div>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
