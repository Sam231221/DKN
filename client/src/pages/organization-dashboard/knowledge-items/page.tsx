import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { OrganizationDashboardLayout } from "@/components/dashboard/organization-dashboard-layout";
import { KnowledgeList } from "@/components/knowledge/knowledge-list";
import { KnowledgeFilters } from "@/components/knowledge/knowledge-filters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, CheckCircle2, Clock, XCircle } from "lucide-react";

interface User {
  organizationType?: string;
  name?: string;
  email?: string;
  organizationName?: string;
}

export default function KnowledgeItemsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState<string>("");

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

  // Mock stats - replace with API call
  const stats = {
    total: 124,
    approved: 98,
    pending: 18,
    rejected: 8,
  };

  return (
    <OrganizationDashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Knowledge Items</h1>
            <p className="text-muted-foreground mt-1">
              Browse and manage organizational knowledge items
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Item
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Total Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Rejected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <KnowledgeFilters
          type={typeFilter}
          search={searchQuery}
          onTypeChange={(value) => setTypeFilter(value)}
          onSearchChange={(value) => setSearchQuery(value)}
        />

        {/* Knowledge Items List */}
        <KnowledgeList type={typeFilter} search={searchQuery} />
      </div>
    </OrganizationDashboardLayout>
  );
}

