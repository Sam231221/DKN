import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { OrganizationDashboardLayout } from "@/components/dashboard/organization-dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  Building,
  User,
  Calendar,
  TrendingUp,
  Briefcase,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { fetchProjectById, type Project } from "@/lib/api";

export default function ProjectDetailPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProject = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const data = await fetchProjectById(id);
      setProject(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load project"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && user) {
      loadProject();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "completed":
        return "secondary";
      case "planning":
        return "outline";
      case "on_hold":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!user) return null;

  if (loading) {
    return (
      <OrganizationDashboardLayout user={user}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </OrganizationDashboardLayout>
    );
  }

  if (error || !project) {
    return (
      <OrganizationDashboardLayout user={user}>
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard/projects")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <span>{error || "Project not found"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </OrganizationDashboardLayout>
    );
  }

  return (
    <OrganizationDashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard/projects")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/dashboard/projects/${project.id}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Status */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{project.name}</CardTitle>
                    {project.projectCode && (
                      <p className="text-muted-foreground font-mono text-sm">
                        {project.projectCode}
                      </p>
                    )}
                  </div>
                  <Badge variant={getStatusBadgeVariant(project.status)}>
                    {project.status.replace("_", " ")}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Project Details */}
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.clientName && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Client:</span>
                    <span className="font-medium">{project.clientName}</span>
                  </div>
                )}

                {project.domain && (
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Domain:</span>
                    <span className="font-medium">{project.domain}</span>
                  </div>
                )}

                {project.leadConsultantName && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Lead Consultant:</span>
                    <span className="font-medium">{project.leadConsultantName}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Start Date:</span>
                  <span className="font-medium">{formatDate(project.startDate)}</span>
                </div>

                {project.endDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">End Date:</span>
                    <span className="font-medium">{formatDate(project.endDate)}</span>
                  </div>
                )}

                {project.clientSatisfactionScore && (
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-muted-foreground">Satisfaction Score:</span>
                    <span className="font-medium">{project.clientSatisfactionScore}/5</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant={getStatusBadgeVariant(project.status)}>
                    {project.status.replace("_", " ")}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">{formatDate(project.createdAt)}</span>
                </div>

                {project.updatedAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Updated:</span>
                    <span className="font-medium">{formatDate(project.updatedAt)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </OrganizationDashboardLayout>
  );
}
