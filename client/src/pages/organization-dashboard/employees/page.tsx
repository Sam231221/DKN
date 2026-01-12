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
import { Search, Plus, Mail, Shield, Calendar, MoreVertical } from "lucide-react";

interface User {
  organizationType?: string;
  name?: string;
  email?: string;
  organizationName?: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  status: "active" | "inactive" | "on_leave";
  joinedDate: string;
}

// Mock data - replace with API call
const mockEmployees: Employee[] = [
  {
    id: "1",
    name: "Alice Cooper",
    email: "alice.cooper@company.com",
    role: "Consultant",
    department: "Engineering",
    status: "active",
    joinedDate: "2023-06-15",
  },
  {
    id: "2",
    name: "David Wilson",
    email: "david.wilson@company.com",
    role: "Knowledge Champion",
    department: "Operations",
    status: "active",
    joinedDate: "2023-08-20",
  },
  {
    id: "3",
    name: "Emma Brown",
    email: "emma.brown@company.com",
    role: "Executive Leadership",
    department: "Management",
    status: "active",
    joinedDate: "2022-01-10",
  },
  {
    id: "4",
    name: "Michael Davis",
    email: "michael.davis@company.com",
    role: "Employee",
    department: "Sales",
    status: "on_leave",
    joinedDate: "2023-11-05",
  },
  {
    id: "5",
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    role: "Consultant",
    department: "Marketing",
    status: "active",
    joinedDate: "2023-09-12",
  },
  {
    id: "6",
    name: "Robert Taylor",
    email: "robert.taylor@company.com",
    role: "Knowledge Champion",
    department: "Engineering",
    status: "active",
    joinedDate: "2022-05-20",
  },
  {
    id: "7",
    name: "Lisa Anderson",
    email: "lisa.anderson@company.com",
    role: "Employee",
    department: "HR",
    status: "inactive",
    joinedDate: "2023-03-18",
  },
  {
    id: "8",
    name: "James Martinez",
    email: "james.martinez@company.com",
    role: "Consultant",
    department: "Engineering",
    status: "active",
    joinedDate: "2024-01-08",
  },
  {
    id: "9",
    name: "Patricia White",
    email: "patricia.white@company.com",
    role: "Employee",
    department: "Finance",
    status: "on_leave",
    joinedDate: "2023-07-22",
  },
  {
    id: "10",
    name: "Christopher Lee",
    email: "christopher.lee@company.com",
    role: "Executive Leadership",
    department: "Management",
    status: "active",
    joinedDate: "2021-11-30",
  },
  {
    id: "11",
    name: "Nancy Garcia",
    email: "nancy.garcia@company.com",
    role: "Knowledge Champion",
    department: "Operations",
    status: "active",
    joinedDate: "2023-04-14",
  },
  {
    id: "12",
    name: "Daniel Rodriguez",
    email: "daniel.rodriguez@company.com",
    role: "Employee",
    department: "Sales",
    status: "inactive",
    joinedDate: "2022-12-05",
  },
];

const ITEMS_PER_PAGE = 5;

export default function EmployeesPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [employees] = useState<Employee[]>(mockEmployees);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
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

  // Filter and search employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesSearch =
        employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.role.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || employee.status === statusFilter;
      const matchesRole = roleFilter === "all" || employee.role === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [employees, searchQuery, statusFilter, roleFilter]);

  // Paginate employees
  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEmployees.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredEmployees, currentPage]);

  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, roleFilter]);

  if (!user) return null;

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "inactive":
        return "secondary";
      case "on_leave":
        return "outline";
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

  const uniqueRoles = Array.from(new Set(employees.map((e) => e.role)));

  return (
    <OrganizationDashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
            <p className="text-muted-foreground mt-1">
              Manage your organization's employees and their roles
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Employees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employees.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {employees.filter((e) => e.status === "active").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                On Leave
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {employees.filter((e) => e.status === "on_leave").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Inactive
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {employees.filter((e) => e.status === "inactive").length}
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
              placeholder="Search employees by name, email, role, or department..."
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on_leave">On Leave</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {uniqueRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No employees found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {employee.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <span className="capitalize">{employee.role.replace("_", " ")}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {employee.department || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(employee.status)}>
                          {employee.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(employee.joinedDate).toLocaleDateString()}
                        </div>
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
              Showing{" "}
              {paginatedEmployees.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredEmployees.length)} of{" "}
              {filteredEmployees.length} employees
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
