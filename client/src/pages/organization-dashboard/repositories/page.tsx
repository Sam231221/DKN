import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";

interface User {
  organizationType?: string;
  name?: string;
  email?: string;
  organizationName?: string;
}

interface Repository {
  id: string;
  repositoryCode?: string;
  name: string;
  description: string;
  storageLocation?: string;
  encryptionEnabled: boolean;
  retentionPolicy?: string;
  searchIndexStatus?: string;
  itemCount: number;
  contributors: number;
  lastUpdated: string;
  isPublic: boolean;
}

// Mock data - replace with API call
// Repositories are persistent storage containers (very few in number, typically 1-3)
const mockRepositories: Repository[] = [
  {
    id: "1",
    repositoryCode: "REP-GLOBAL-01",
    name: "Global Knowledge Repository",
    description: "Primary repository for all organizational knowledge assets",
    storageLocation: "aws-eu-central-1",
    encryptionEnabled: true,
    retentionPolicy: "7 Years",
    searchIndexStatus: "active",
    itemCount: 1248,
    contributors: 124,
    lastUpdated: "2024-01-03",
    isPublic: false,
  },
  {
    id: "2",
    repositoryCode: "REP-ARCHIVE-01",
    name: "Archive Repository",
    description: "Long-term storage for archived knowledge items",
    storageLocation: "aws-us-east-1",
    encryptionEnabled: true,
    retentionPolicy: "Indefinite",
    searchIndexStatus: "active",
    itemCount: 856,
    contributors: 89,
    lastUpdated: "2024-01-02",
    isPublic: false,
  },
];

export default function RepositoriesPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>(mockRepositories);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("dkn_user");
    if (!userData) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(userData) as User;

    if (parsedUser.organizationType !== "organizational") {
      navigate("/explore");
      return;
    }

    requestAnimationFrame(() => {
      setUser(parsedUser);
    });
  }, [navigate]);

  if (!user) return null;

  const filteredRepositories = repositories.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.category.toLowerCase().includes(searchQuery.toLowerCase())
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
                {new Set(repositories.flatMap((r) => [r.contributors])).size}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Repositories List */}
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
              <Card key={repo.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                        <FolderOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">{repo.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {repo.category}
                        </Badge>
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
                        <span>{repo.itemCount} items</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{repo.contributors}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Updated {formatDate(repo.lastUpdated)}</span>
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
      </div>
    </OrganizationDashboardLayout>
  );
}

