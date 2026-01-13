import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { OrganizationDashboardLayout } from "@/components/dashboard/organization-dashboard-layout";
import { KnowledgeList } from "@/components/knowledge/knowledge-list";
import { KnowledgeFilters } from "@/components/knowledge/knowledge-filters";
import { RegionFilterToggle } from "@/components/dashboard/region-filter-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, CheckCircle2, Clock, XCircle } from "lucide-react";
import { CreateKnowledgeDialog } from "@/components/knowledge/create-knowledge-dialog";
import { EditKnowledgeDialog } from "@/components/knowledge/edit-knowledge-dialog";
import { DeleteKnowledgeDialog } from "@/components/knowledge/delete-knowledge-dialog";
import {
  type KnowledgeItem,
  fetchKnowledgeItemsStats,
  type KnowledgeItemsStats,
} from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useRegionalOfficeSafe } from "@/contexts/RegionalOfficeContext";

export default function KnowledgeItemsPage() {
  const { user } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [stats, setStats] = useState<KnowledgeItemsStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const { selectedOffice, isGlobalView } = useRegionalOfficeSafe();

  // Load stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoadingStats(true);
        const data = await fetchKnowledgeItemsStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load stats:", err);
        // Set default stats on error
        setStats({
          total: 0,
          approved: 0,
          pending: 0,
          rejected: 0,
          draft: 0,
          archived: 0,
        });
      } finally {
        setLoadingStats(false);
      }
    };

    if (user) {
      loadStats();
    }
  }, [user, refreshKey]);

  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const handleEdit = useCallback((item: KnowledgeItem) => {
    setSelectedItem(item);
    setShowEditDialog(true);
  }, []);

  const handleDelete = useCallback((item: KnowledgeItem) => {
    setSelectedItem(item);
    setShowDeleteDialog(true);
  }, []);

  const handleEditSuccess = useCallback(() => {
    setShowEditDialog(false);
    setSelectedItem(null);
    handleRefresh();
  }, [handleRefresh]);

  const handleDeleteSuccess = useCallback(() => {
    setShowDeleteDialog(false);
    setSelectedItem(null);
    handleRefresh();
  }, [handleRefresh]);

  const handleCreateSuccess = useCallback(() => {
    handleRefresh();
  }, [handleRefresh]);

  // Show loading state while user is being loaded
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const displayStats = stats || {
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    draft: 0,
    archived: 0,
  };

  return (
    <OrganizationDashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">Knowledge Items</h1>
              <RegionFilterToggle />
            </div>
            <p className="text-muted-foreground mt-1">
              Browse and manage organizational knowledge items
              {selectedOffice && !isGlobalView && ` • ${selectedOffice.region ? `${selectedOffice.name} - ${selectedOffice.region}` : selectedOffice.name}`}
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
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
              {loadingStats ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-2xl font-bold">{displayStats.total}</div>
              )}
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
              {loadingStats ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-2xl font-bold">{displayStats.approved}</div>
              )}
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
              {loadingStats ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-2xl font-bold">{displayStats.pending}</div>
              )}
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
              {loadingStats ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-2xl font-bold">{displayStats.rejected}</div>
              )}
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
        <KnowledgeList
          key={refreshKey}
          type={typeFilter}
          search={searchQuery}
          user={user ? { id: user.id || "", role: user.role || "employee" } : undefined}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Dialogs */}
        <CreateKnowledgeDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={handleCreateSuccess}
        />
        <EditKnowledgeDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          itemId={selectedItem?.id || null}
          onSuccess={handleEditSuccess}
          user={user ? { id: user.id || "", role: user.role || "employee" } : undefined}
        />
        <DeleteKnowledgeDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          itemId={selectedItem?.id || null}
          onSuccess={handleDeleteSuccess}
        />
      </div>
    </OrganizationDashboardLayout>
  );
}

