import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { OrganizationDashboardLayout } from "@/components/dashboard/organization-dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Building,
  User,
  Calendar,
  TrendingUp,
  MoreVertical,
} from "lucide-react";

interface User {
  organizationType?: string;
  name?: string;
  email?: string;
  organizationName?: string;
}

interface Project {
  id: string;
  projectCode?: string;
  name: string;
  clientName: string;
  domain?: string;
  startDate: string;
  endDate?: string;
  status: "planning" | "active" | "on_hold" | "completed" | "cancelled";
  leadConsultantName?: string;
  clientSatisfactionScore?: number;
}

// Mock data - replace with API call
const mockProjects: Project[] = [
  {
    id: "1",
    projectCode: "PRJ-2024-017",
    name: "Smart Factory Integration – Siemens DK",
    clientName: "Siemens Denmark",
    domain: "Smart Manufacturing",
    startDate: "2024-02-01",
    endDate: "2024-06-30",
    status: "active",
    leadConsultantName: "Alice Cooper",
    clientSatisfactionScore: 4.6,
  },
  {
    id: "2",
    projectCode: "PRJ-2024-015",
    name: "Cloud Migration Strategy",
    clientName: "Tech Corp",
    domain: "Cloud Infrastructure",
    startDate: "2024-01-15",
    endDate: "2024-05-31",
    status: "active",
    leadConsultantName: "David Wilson",
    clientSatisfactionScore: 4.8,
  },
  {
    id: "3",
    projectCode: "PRJ-2023-089",
    name: "Digital Transformation Initiative",
    clientName: "Global Industries",
    domain: "Digital Strategy",
    startDate: "2023-09-01",
    endDate: "2024-01-31",
    status: "completed",
    leadConsultantName: "Emma Brown",
    clientSatisfactionScore: 4.7,
  },
  {
    id: "4",
    projectCode: "PRJ-2024-019",
    name: "AI Implementation Roadmap",
    clientName: "Innovation Labs",
    domain: "Artificial Intelligence",
    startDate: "2024-03-01",
    endDate: "2024-08-31",
    status: "planning",
    leadConsultantName: "Michael Davis",
  },
  {
    id: "5",
    projectCode: "PRJ-2024-012",
    name: "Data Analytics Platform",
    clientName: "Data Solutions Inc",
    domain: "Data Analytics",
    startDate: "2024-01-10",
    endDate: "2024-07-15",
    status: "active",
    leadConsultantName: "Sarah Johnson",
    clientSatisfactionScore: 4.5,
  },
  {
    id: "6",
    projectCode: "PRJ-2023-076",
    name: "Legacy System Modernization",
    clientName: "Enterprise Solutions",
    domain: "System Modernization",
    startDate: "2023-06-01",
    endDate: "2023-12-31",
    status: "completed",
    leadConsultantName: "Robert Taylor",
    clientSatisfactionScore: 4.4,
  },
];

const ITEMS_PER_PAGE = 5;

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [projects] = useState<Project[]>(mockProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

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

  // Filter and search projects
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.projectCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.domain?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  // Paginate projects
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProjects.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  if (!user) return null;

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

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const activeProjects = projects.filter((p) => p.status === "active").length;
  const completedProjects = projects.filter((p) => p.status === "completed").length;

  return (
    <OrganizationDashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground mt-1">
              Manage client engagements and project timelines
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeProjects}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedProjects}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Satisfaction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projects
                  .filter((p) => p.clientSatisfactionScore)
                  .length > 0
                  ? (
                      projects
                        .filter((p) => p.clientSatisfactionScore)
                        .reduce(
                          (sum, p) => sum + (p.clientSatisfactionScore || 0),
                          0
                        ) /
                      projects.filter((p) => p.clientSatisfactionScore).length
                    ).toFixed(1)
                  : "—"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search projects by name, code, client, or domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Timeline</TableHead>
                  <TableHead>Lead Consultant</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Satisfaction</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      No projects found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-mono text-xs">
                        {project.projectCode || "—"}
                      </TableCell>
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          {project.clientName}
                        </div>
                      </TableCell>
                      <TableCell>
                        {project.domain || <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span>
                              {new Date(project.startDate).toLocaleDateString()}
                            </span>
                          </div>
                          {project.endDate && (
                            <span className="text-xs text-muted-foreground">
                              → {new Date(project.endDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {project.leadConsultantName ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {project.leadConsultantName}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(project.status)}>
                          {project.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {project.clientSatisfactionScore ? (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span>{project.clientSatisfactionScore}/5</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {paginatedProjects.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}{" "}
              to {Math.min(currentPage * ITEMS_PER_PAGE, filteredProjects.length)} of{" "}
              {filteredProjects.length} projects
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
                    }
                  />
                </PaginationItem>
                {getPageNumbers().map((page, index) => (
                  <PaginationItem key={index}>
                    {page === "ellipsis" ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </OrganizationDashboardLayout>
  );
}

