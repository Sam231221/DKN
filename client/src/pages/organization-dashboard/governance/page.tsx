import { useAuth } from "@/contexts/AuthContext";
import { OrganizationDashboardLayout } from "@/components/dashboard/organization-dashboard-layout";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { AccessDenied } from "@/components/auth/access-denied";
import type { UserRole } from "@/lib/permissions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, FileCheck, AlertTriangle, CheckCircle2, Clock, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function GovernancePage() {
  const { user } = useAuth();
  const userRole = (user?.role || "consultant") as UserRole;
  const { canViewPage, canCreate, canAccessFeature } = useRoleAccess({ role: userRole });

  // Check access
  if (!canViewPage("governance")) {
    return (
      <AccessDenied
        requiredRole={["administrator", "executive_leadership", "knowledge_council_member"]}
        pageName="Governance"
      />
    );
  }

  const canAudit = canAccessFeature("governance", "auditContent");
  const canCurate = canAccessFeature("governance", "curateResources");

  // Mock data for governance queue
  const auditQueue = [
    {
      id: "1",
      title: "Digital Transformation Framework",
      type: "documentation",
      status: "pending_review",
      author: "Sarah Johnson",
      submittedDate: "2024-01-15",
      priority: "high",
    },
    {
      id: "2",
      title: "GDPR Compliance Checklist",
      type: "procedure",
      status: "pending_review",
      author: "Michael Andersen",
      submittedDate: "2024-01-14",
      priority: "medium",
    },
    {
      id: "3",
      title: "Cloud Migration Best Practices",
      type: "best_practices",
      status: "pending_review",
      author: "Emma Larsen",
      submittedDate: "2024-01-13",
      priority: "low",
    },
  ];

  return (
    <OrganizationDashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="h-8 w-8" />
              Knowledge Governance
            </h1>
            <p className="text-muted-foreground mt-2">
              Curate, audit, and manage organizational knowledge resources
            </p>
          </div>
          {canCreate("governance") && (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Governance Rule
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{auditQueue.length}</div>
              <p className="text-xs text-muted-foreground">Items awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved This Month</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">47</div>
              <p className="text-xs text-muted-foreground">+15% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quality Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>
        </div>

        {canAudit && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Content Audit Queue
              </CardTitle>
              <CardDescription>
                Knowledge items pending governance review and approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditQueue.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.type}</Badge>
                      </TableCell>
                      <TableCell>{item.author}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.priority === "high"
                              ? "destructive"
                              : item.priority === "medium"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {item.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Review
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {canCurate && (
          <Card>
            <CardHeader>
              <CardTitle>Content Curation Tools</CardTitle>
              <CardDescription>
                Tools for curating and organizing knowledge resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Content curation tools will be displayed here
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Governance Metrics</CardTitle>
            <CardDescription>Quality and compliance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Governance metrics and quality dashboards will be displayed here
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </OrganizationDashboardLayout>
  );
}
