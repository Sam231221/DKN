import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { OrganizationDashboardLayout } from "@/components/dashboard/organization-dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  FileText,
  Users,
  Calendar,
  Database,
  Lock,
  Search as SearchIcon,
  Shield,
  Loader2,
  Edit,
  Settings,
} from "lucide-react";
import { fetchRepositoryById, fetchKnowledgeItems, type Repository, type KnowledgeItem } from "@/lib/api";
import { KnowledgeList } from "@/components/knowledge/knowledge-list";

export default function RepositoryDetailPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [repository, setRepository] = useState<Repository | null>(null);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRepository = async () => {
      if (!id || !user) return;

      try {
        setLoading(true);
        setError(null);
        const repoData = await fetchRepositoryById(id);
        setRepository(repoData);

        // Fetch knowledge items for this repository
        const items = await fetchKnowledgeItems({ repositoryId: id });
        setKnowledgeItems(items);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load repository");
        console.error("Error fetching repository:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user && id) {
      loadRepository();
    }
  }, [user, id]);

  if (!user) return null;

  if (!id) {
    navigate("/dashboard/repositories");
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <OrganizationDashboardLayout user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading repository...</p>
          </div>
        </div>
      </OrganizationDashboardLayout>
    );
  }

  if (error || !repository) {
    return (
      <OrganizationDashboardLayout user={user}>
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => navigate("/dashboard/repositories")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Repositories
          </Button>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-destructive mb-2">Error loading repository</p>
                <p className="text-sm text-muted-foreground">{error || "Repository not found"}</p>
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
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/repositories")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{repository.name}</h1>
              {repository.repositoryCode && (
                <p className="text-muted-foreground mt-1 font-mono text-sm">
                  {repository.repositoryCode}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

        {/* Repository Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {repository.description || "No description provided."}
                </p>
              </CardContent>
            </Card>

            {/* Knowledge Items */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Knowledge Items</CardTitle>
                  <Badge variant="secondary">{knowledgeItems.length} items</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {knowledgeItems.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No knowledge items in this repository</p>
                  </div>
                ) : (
                  <KnowledgeList
                    type={undefined}
                    status={undefined}
                    search={undefined}
                    repositoryId={repository.id}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>Items</span>
                  </div>
                  <span className="font-semibold">{repository.itemCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Contributors</span>
                  </div>
                  <span className="font-semibold">{repository.contributorCount || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {repository.storageLocation && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Database className="h-4 w-4" />
                      <span>Storage Location</span>
                    </div>
                    <p className="text-sm font-medium">{repository.storageLocation}</p>
                  </div>
                )}

                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    {repository.encryptionEnabled ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <Lock className="h-4 w-4" />
                        <span className="text-sm">Encrypted</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Lock className="h-4 w-4" />
                        <span className="text-sm">Not Encrypted</span>
                      </div>
                    )}
                  </div>

                  {repository.searchIndexStatus && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-blue-600">
                        <SearchIcon className="h-4 w-4" />
                        <span className="text-sm capitalize">{repository.searchIndexStatus}</span>
                      </div>
                    </div>
                  )}

                  {repository.retentionPolicy && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Shield className="h-4 w-4" />
                        <span className="text-sm">{repository.retentionPolicy}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-border">
                  {repository.isPublic ? (
                    <Badge variant="outline" className="w-full justify-center">
                      Public
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="w-full justify-center">
                      Private
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Created</span>
                  </div>
                  <p className="text-sm">{formatDate(repository.createdAt)}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Last Updated</span>
                  </div>
                  <p className="text-sm">{formatDate(repository.updatedAt)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </OrganizationDashboardLayout>
  );
}
