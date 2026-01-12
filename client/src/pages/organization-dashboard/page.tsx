import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { OrganizationDashboardLayout } from "@/components/dashboard/organization-dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  LayoutGrid,
  List,
  Plus,
  ExternalLink,
  Github,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock usage data
const usageMetrics = [
  {
    name: "Image Optimization - Transformations",
    current: 23,
    limit: 5000,
    unit: "",
    showUpgrade: true,
  },
  {
    name: "Edge Requests",
    current: 1500,
    limit: 1000000,
    unit: "",
  },
  {
    name: "Fluid Active CPU",
    current: 11,
    limit: 14400,
    unit: "s",
  },
  {
    name: "Image Optimization - Cache Writes",
    current: 28,
    limit: 100000,
    unit: "",
  },
];

// Mock projects data
const mockProjects = [
  {
    id: "1",
    name: "Product Documentation",
    url: "product-docs.vercel.app",
    repo: "org/product-docs",
    icon: "📚",
    lastCommit: "chore: Add Next.js configuration and enhance fo...",
    date: "12/31/25",
    branch: "main",
    hasAnalytics: true,
  },
  {
    id: "2",
    name: "Client Portal",
    url: "client-portal.vercel.app",
    repo: "org/client-portal",
    icon: "💼",
    lastCommit: "chore(homepage): removed sections",
    date: "9/17/24",
    branch: "production",
    hasAnalytics: true,
  },
  {
    id: "3",
    name: "Internal Tools",
    url: "internal-tools.vercel.app",
    repo: "org/internal-tools",
    icon: "🛠️",
    lastCommit: "docs: readme updates",
    date: "9/19/24",
    branch: "master",
    hasAnalytics: true,
  },
  {
    id: "4",
    name: "Knowledge Base",
    url: "knowledge-base.vercel.app",
    repo: "org/knowledge-base",
    icon: "📖",
    lastCommit: "chore: link updates",
    date: "2/15/25",
    branch: "master",
    hasAnalytics: true,
  },
  {
    id: "5",
    name: "Design System",
    url: "design-system.vercel.app",
    repo: "org/design-system",
    icon: "🎨",
    lastCommit: "fix(components): typescript Version and Err",
    date: "9/22/24",
    branch: "master",
    hasAnalytics: true,
  },
];

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

function ProjectCard({ project }: { project: (typeof mockProjects)[0] }) {
  // Use a deterministic value based on project ID instead of random
  const usagePercent = Math.min(
    (project.id === "1" ? 23 : parseInt(project.id) * 7) / 100,
    1
  );

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-xl shrink-0">
              {project.icon}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base truncate">
                {project.name}
              </CardTitle>
              <a
                href={`https://${project.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mt-1"
                onClick={(e) => e.stopPropagation()}
              >
                {project.url}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
          {project.hasAnalytics && (
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <TrendingUp className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Github className="h-4 w-4" />
          <span className="truncate">{project.repo}</span>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground line-clamp-1">
            {project.lastCommit}
          </p>
          <p className="text-xs text-muted-foreground">
            {project.date} on {project.branch}
          </p>
        </div>
        {usagePercent > 0 && (
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Usage</span>
              <span className="text-muted-foreground">
                {(usagePercent * 100).toFixed(0)}%
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${usagePercent * 100}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface User {
  organizationType?: string;
  name?: string;
  email?: string;
  organizationName?: string;
}

export default function OrganizationDashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("dkn_user");
    if (!userData) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(userData) as User;

    // Redirect if not organizational account
    if (parsedUser.organizationType !== "organizational") {
      console.log(
        "User organizationType:",
        parsedUser.organizationType,
        "Redirecting to /explore"
      );
      navigate("/explore");
      return;
    }

    // Use requestAnimationFrame to avoid synchronous setState in effect
    requestAnimationFrame(() => {
      setUser(parsedUser);
    });
  }, [navigate]);

  if (!user) return null;

  const filteredProjects = mockProjects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <OrganizationDashboardLayout user={user}>
      <div className="space-y-6">
        {/* Search and View Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search Projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-border rounded-md">
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 hover:bg-muted transition-colors",
                  viewMode === "list" && "bg-muted"
                )}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 hover:bg-muted transition-colors border-l border-border",
                  viewMode === "grid" && "bg-muted"
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New...
            </Button>
          </div>
        </div>

        {/* Quick Navigation Hint */}
        {searchQuery === "" && (
          <Card className="bg-muted/50 border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium mb-1">
                    Press F to find anything in the dashboard.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Dismiss
                  </Button>
                  <Button size="sm">Try it</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Usage and Alerts */}
          <div className="lg:col-span-1 space-y-6">
            {/* Usage Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Last 30 days</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {usageMetrics.map((metric, index) => {
                  const percent = Math.min(
                    (metric.current / metric.limit) * 100,
                    100
                  );

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {metric.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {formatNumber(metric.current)}
                            {metric.unit && ` ${metric.unit}`} /{" "}
                            {formatNumber(metric.limit)}
                            {metric.unit && ` ${metric.unit}`}
                          </span>
                          {metric.showUpgrade && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 text-xs"
                            >
                              Upgrade
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            percent > 80
                              ? "bg-red-500"
                              : percent > 50
                              ? "bg-yellow-500"
                              : "bg-primary"
                          )}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Alerts Section */}
            <Card className="bg-muted/30 border-border">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium mb-1">
                      Get alerted for anomalies
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Automatically monitor your projects for anomalies and get
                      notified.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Upgrade to Observability Plus
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Previews Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Previews</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent previews
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Projects */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-1">Projects</h2>
              <p className="text-sm text-muted-foreground">
                {filteredProjects.length} project
                {filteredProjects.length !== 1 ? "s" : ""}
              </p>
            </div>
            {filteredProjects.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No projects found</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div
                className={cn(
                  "gap-4",
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2"
                    : "flex flex-col"
                )}
              >
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </OrganizationDashboardLayout>
  );
}
