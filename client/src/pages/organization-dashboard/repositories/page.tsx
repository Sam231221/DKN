import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRegionalOfficeSafe } from "@/contexts/RegionalOfficeContext";
import { OrganizationDashboardLayout } from "@/components/dashboard/organization-dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  FolderOpen,
  FileText,
  Users,
  Calendar,
  MoreVertical,
  Database,
  Lock,
  Search as SearchIcon,
  Shield,
  Loader2,
} from "lucide-react";
import { fetchRepositories, type Repository } from "@/lib/api";

export default function RepositoriesPage() {
  const { user } = useAuth();
  const { selectedOffice, isGlobalView } = useRegionalOfficeSafe();
  const navigate = useNavigate();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRepositories = async () => {
      try {
        setLoading(true);
        setError(null);
        const regionId = isGlobalView ? "all" : selectedOffice?.id;
        const data = await fetchRepositories({ regionId });
        setRepositories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load repositories");
        console.error("Error fetching repositories:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadRepositories();
    }
  }, [user, selectedOffice, isGlobalView]);

  if (!user) return null;

  const filteredRepositories = repositories.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (repo.repositoryCode && repo.repositoryCode.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleRepositoryClick = (repositoryId: string) => {
    navigate(`/dashboard/repositories/${repositoryId}`);
  };

  return (
    <OrganizationDashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Repositories</h1>
            <p className="text-muted-foreground mt-1">
              Persistent knowledge storage containers and their configuration
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Repository
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search repositories by name, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Repositories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{repositories.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {repositories.reduce((sum, repo) => sum + repo.itemCount, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Contributors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {repositories.reduce((sum, repo) => sum + (repo.contributorCount || 0), 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Repositories List */}
        {loading ? (
          <Card className="col-span-full">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Loading repositories...</p>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="col-span-full">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-destructive mb-2">Error loading repositories</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRepositories.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No repositories found</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredRepositories.map((repo) => (
                <Card 
                  key={repo.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleRepositoryClick(repo.id)}
                >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                        <FolderOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">{repo.name}</CardTitle>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {repo.repositoryCode && (
                    <div className="text-xs font-mono text-muted-foreground">
                      {repo.repositoryCode}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {repo.description}
                  </p>
                  
                  {/* Storage Configuration */}
                  <div className="space-y-2 pt-2 border-t border-border">
                    {repo.storageLocation && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Database className="h-3 w-3" />
                        <span>{repo.storageLocation}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs">
                      {repo.encryptionEnabled && (
                        <div className="flex items-center gap-1 text-green-600">
                          <Lock className="h-3 w-3" />
                          <span>Encrypted</span>
                        </div>
                      )}
                      {repo.searchIndexStatus && (
                        <div className="flex items-center gap-1 text-blue-600">
                          <SearchIcon className="h-3 w-3" />
                          <span className="capitalize">{repo.searchIndexStatus}</span>
                        </div>
                      )}
                      {repo.retentionPolicy && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Shield className="h-3 w-3" />
                          <span>{repo.retentionPolicy}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t border-border">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>{repo.itemCount || 0} items</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{repo.contributorCount || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Updated {formatDate(repo.updatedAt || repo.createdAt)}</span>
                    </div>
                    {repo.isPublic ? (
                      <Badge variant="outline" className="text-xs">
                        Public
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Private
                      </Badge>
                    )}
                  </div>
                </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </OrganizationDashboardLayout>
  );
}

