import { useAuth } from "@/contexts/AuthContext";
import { OrganizationDashboardLayout } from "@/components/dashboard/organization-dashboard-layout";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { AccessDenied } from "@/components/auth/access-denied";
import type { UserRole } from "@/lib/permissions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, FileText, Award } from "lucide-react";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const userRole = (user?.role || "consultant") as UserRole;
  const { canViewPage, canAccessFeature } = useRoleAccess({ role: userRole });

  // Check access
  if (!canViewPage("analytics")) {
    return (
      <AccessDenied
        requiredRole={["knowledge_champion", "administrator", "executive_leadership", "knowledge_council_member"]}
        pageName="Analytics"
      />
    );
  }

  const canViewOrgStats = canAccessFeature("analytics", "viewOrgAnalytics");
  const canViewRegionalStats = canAccessFeature("analytics", "viewRegionalAnalytics");

  return (
    <OrganizationDashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Analytics & Insights
          </h1>
          <p className="text-muted-foreground mt-2">
            System analytics, knowledge metrics, and organizational insights
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Knowledge Items</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Contributors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">342</div>
              <p className="text-xs text-muted-foreground">+8% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45.2K</div>
              <p className="text-xs text-muted-foreground">+23% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
              <p className="text-xs text-muted-foreground">+5% from last month</p>
            </CardContent>
          </Card>
        </div>

        {canViewRegionalStats && (
          <Card>
            <CardHeader>
              <CardTitle>Regional Analytics</CardTitle>
              <CardDescription>Knowledge sharing metrics by region</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Regional analytics content will be displayed here
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {canViewOrgStats && (
          <Card>
            <CardHeader>
              <CardTitle>Organizational Analytics</CardTitle>
              <CardDescription>High-level organizational metrics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Organizational analytics content will be displayed here
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Knowledge Growth Trends</CardTitle>
            <CardDescription>Track knowledge base growth over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Chart visualization will be displayed here
            </div>
          </CardContent>
        </Card>
      </div>
    </OrganizationDashboardLayout>
  );
}
