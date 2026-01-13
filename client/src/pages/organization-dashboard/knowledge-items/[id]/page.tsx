import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { OrganizationDashboardLayout } from "@/components/dashboard/organization-dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  FileText,
  Eye,
  Star,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Briefcase,
  FolderOpen,
} from "lucide-react";
import {
  fetchKnowledgeItemById,
  getTypeDisplayName,
  formatDate,
  type KnowledgeItem,
} from "@/lib/api";
import { EditKnowledgeDialog } from "@/components/knowledge/edit-knowledge-dialog";
import { DeleteKnowledgeDialog } from "@/components/knowledge/delete-knowledge-dialog";
import { Loader2, AlertCircle } from "lucide-react";

export default function KnowledgeItemDetailPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<KnowledgeItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const loadItem = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const data = await fetchKnowledgeItemById(id);
      setItem(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load knowledge item"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && user) {
      loadItem();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  const handleEditSuccess = () => {
    loadItem();
  };

  const handleDeleteSuccess = () => {
    navigate("/dashboard/knowledge-items");
  };

  const canEdit =
    item &&
    user &&
    (item.authorId === user.id ||
      user.role === "administrator" ||
      user.role === "knowledge_champion");

  const canDelete =
    item &&
    user &&
    (item.authorId === user.id || user.role === "administrator");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_review":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case "approved":
        return "bg-green-500/10 text-green-600 dark:text-green-400";
      case "rejected":
        return "bg-red-500/10 text-red-600 dark:text-red-400";
      case "draft":
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending_review":
        return <Clock className="h-4 w-4" />;
      case "approved":
        return <CheckCircle2 className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  if (!user) return null;

  if (loading) {
    return (
      <OrganizationDashboardLayout user={user}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </OrganizationDashboardLayout>
    );
  }

  if (error || !item) {
    return (
      <OrganizationDashboardLayout user={user}>
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard/knowledge-items")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Knowledge Items
          </Button>
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <span>{error || "Knowledge item not found"}</span>
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
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard/knowledge-items")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Knowledge Items
          </Button>
          <div className="flex gap-2">
            {canEdit && (
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(true)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
            {canDelete && (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Status */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{item.title}</CardTitle>
                    {item.description && (
                      <p className="text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                  <Badge className={`${getStatusColor(item.status)} flex items-center gap-1`}>
                    {getStatusIcon(item.status)}
                    {item.status.replace("_", " ")}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Content */}
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none dark:prose-invert">
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {item.content}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* File Download */}
            {item.fileUrl && (
              <Card>
                <CardHeader>
                  <CardTitle>Attached File</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{item.fileName || "File"}</p>
                        {item.fileSize && (
                          <p className="text-sm text-muted-foreground">
                            {(item.fileSize / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        window.open(`${API_BASE_URL}${item.fileUrl}`, "_blank");
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Compliance and Duplicate Warnings */}
            {(item.complianceViolations?.length || item.duplicateDetected) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    Warnings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {item.duplicateDetected && (
                    <div className="p-3 bg-yellow-500/10 rounded-lg">
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        <AlertTriangle className="h-4 w-4 inline mr-2" />
                        Potential duplicate detected
                      </p>
                    </div>
                  )}
                  {item.complianceViolations && item.complianceViolations.length > 0 && (
                    <div className="p-3 bg-red-500/10 rounded-lg">
                      <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                        Compliance Violations:
                      </p>
                      <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-400 space-y-1">
                        {item.complianceViolations.map((violation, index) => (
                          <li key={index}>{violation}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant="outline">
                    {getTypeDisplayName(item.type)}
                  </Badge>
                </div>

                {item.repository && (
                  <div className="flex items-center gap-2 text-sm">
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Repository:</span>
                    <span className="font-medium">{item.repository.name}</span>
                  </div>
                )}

                {item.originatingProject && (
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Project:</span>
                    <span className="font-medium">
                      {item.originatingProject.projectCode || item.originatingProject.name}
                    </span>
                  </div>
                )}

                {item.author && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Author:</span>
                    <span className="font-medium">{item.author.name}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">{formatDate(item.createdAt)}</span>
                </div>

                {item.updatedAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Updated:</span>
                    <span className="font-medium">{formatDate(item.updatedAt)}</span>
                  </div>
                )}

                {item.validatedBy && item.validatedAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Validated:</span>
                    <span className="font-medium">{formatDate(item.validatedAt)}</span>
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{item.views}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{item.likes}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <EditKnowledgeDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        itemId={id || null}
        onSuccess={handleEditSuccess}
        user={user ? { id: user.id || "", role: user.role || "employee" } : undefined}
      />
      <DeleteKnowledgeDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        itemId={id || null}
        onSuccess={handleDeleteSuccess}
      />
    </OrganizationDashboardLayout>
  );
}
