import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { OrganizationDashboardLayout } from "@/components/dashboard/organization-dashboard-layout";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { AccessDenied } from "@/components/auth/access-denied";
import type { UserRole } from "@/lib/permissions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Users,
  Search,
  RefreshCw,
  XCircle,
  TrendingUp,
  FileX,
  Sparkles,
  BarChart3,
  Eye,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  fetchKnowledgeItems,
  updateKnowledgeItem,
  type KnowledgeItem,
  getTypeDisplayName,
  formatDate,
} from "@/lib/api";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface GovernanceMetrics {
  pendingReviews: number;
  approvedThisMonth: number;
  qualityIssues: number;
  duplicatesDetected: number;
  outdatedContent: number;
  complianceViolations: number;
}

export default function GovernancePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userRole = (user?.role || "consultant") as UserRole;
  const { canViewPage, canCreate, canAccessFeature } = useRoleAccess({ role: userRole });

  const [auditQueue, setAuditQueue] = useState<KnowledgeItem[]>([]);
  const [duplicates, setDuplicates] = useState<KnowledgeItem[]>([]);
  const [outdatedContent, setOutdatedContent] = useState<KnowledgeItem[]>([]);
  const [metrics, setMetrics] = useState<GovernanceMetrics>({
    pendingReviews: 0,
    approvedThisMonth: 0,
    qualityIssues: 0,
    duplicatesDetected: 0,
    outdatedContent: 0,
    complianceViolations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [reviewing, setReviewing] = useState(false);

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

  const loadGovernanceData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch pending review items
      const pendingItems = await fetchKnowledgeItems({ status: "pending_review", limit: 50 });
      
      // Fetch all items for analysis
      const allItems = await fetchKnowledgeItems({ limit: 100 });
      
      // Filter items with duplicates detected
      const duplicateItems = allItems.data.filter(
        (item) => item.duplicateDetected === true
      );
      
      // Filter outdated content (items older than 1 year without updates)
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const outdatedItems = allItems.data.filter((item) => {
        const updatedAt = new Date(item.updatedAt);
        return updatedAt < oneYearAgo && item.status === "approved";
      });
      
      // Calculate metrics
      const approvedThisMonth = allItems.data.filter((item) => {
        if (item.status !== "approved" || !item.validatedAt) return false;
        const validatedDate = new Date(item.validatedAt);
        const now = new Date();
        return (
          validatedDate.getMonth() === now.getMonth() &&
          validatedDate.getFullYear() === now.getFullYear()
        );
      }).length;
      
      const complianceViolations = allItems.data.filter(
        (item) => item.complianceViolations && item.complianceViolations.length > 0
      ).length;
      
      setAuditQueue(pendingItems.data);
      setDuplicates(duplicateItems);
      setOutdatedContent(outdatedItems.slice(0, 10)); // Show top 10 outdated items
      setMetrics({
        pendingReviews: pendingItems.data.length,
        approvedThisMonth,
        qualityIssues: duplicateItems.length + outdatedItems.length + complianceViolations,
        duplicatesDetected: duplicateItems.length,
        outdatedContent: outdatedItems.length,
        complianceViolations,
      });
    } catch (error) {
      console.error("Failed to load governance data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadGovernanceData();
    }
  }, [user, loadGovernanceData]);

  const handleReview = (item: KnowledgeItem) => {
    setSelectedItem(item);
    setReviewDialogOpen(true);
    setRejectionReason("");
  };

  const handleApprove = async () => {
    if (!selectedItem) return;
    
    try {
      setReviewing(true);
      await updateKnowledgeItem(selectedItem.id, {
        status: "approved",
      });
      await loadGovernanceData();
      setReviewDialogOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Failed to approve item:", error);
      alert("Failed to approve item. Please try again.");
    } finally {
      setReviewing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedItem || !rejectionReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }
    
    try {
      setReviewing(true);
      await updateKnowledgeItem(selectedItem.id, {
        status: "rejected",
      });
      await loadGovernanceData();
      setReviewDialogOpen(false);
      setSelectedItem(null);
      setRejectionReason("");
    } catch (error) {
      console.error("Failed to reject item:", error);
      alert("Failed to reject item. Please try again.");
    } finally {
      setReviewing(false);
    }
  };

  const handleRunDuplicateDetection = async () => {
    // This would trigger a background job to detect duplicates
    // For now, we'll just refresh the data
    await loadGovernanceData();
  };

  const handleFlagOutdated = async (item: KnowledgeItem) => {
    // This would flag the item for review
    try {
      await updateKnowledgeItem(item.id, {
        status: "pending_review",
      });
      await loadGovernanceData();
    } catch (error) {
      console.error("Failed to flag outdated content:", error);
    }
  };

  const getPriority = (item: KnowledgeItem): "high" | "medium" | "low" => {
    if (item.complianceViolations && item.complianceViolations.length > 0) return "high";
    if (item.duplicateDetected) return "high";
    if (item.type === "policy" || item.type === "procedure") return "high";
    return "medium";
  };

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
              Curate, audit, and manage organizational knowledge resources. Maintain quality and relevance through the Knowledge Governance Council.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadGovernanceData} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            {canCreate("governance") && (
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Governance Rule
              </Button>
            )}
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{metrics.pendingReviews}</div>
                  <p className="text-xs text-muted-foreground">Items awaiting review</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved This Month</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{metrics.approvedThisMonth}</div>
                  <p className="text-xs text-muted-foreground">Items approved</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quality Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{metrics.qualityIssues}</div>
                  <p className="text-xs text-muted-foreground">Require attention</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Duplicates</CardTitle>
              <FileX className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{metrics.duplicatesDetected}</div>
                  <p className="text-xs text-muted-foreground">Potential duplicates</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outdated Content</CardTitle>
              <Clock className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{metrics.outdatedContent}</div>
                  <p className="text-xs text-muted-foreground">Needs update</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{metrics.complianceViolations}</div>
                  <p className="text-xs text-muted-foreground">Violations detected</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Content Audit Queue */}
        {canAudit && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5" />
                    Content Audit Queue
                  </CardTitle>
                  <CardDescription>
                    Knowledge items pending governance review and approval by the Knowledge Governance Council
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleRunDuplicateDetection}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Run NLP Analysis
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : auditQueue.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No items pending review
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Issues</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditQueue.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{getTypeDisplayName(item.type)}</Badge>
                        </TableCell>
                        <TableCell>{item.author?.name || "Unknown"}</TableCell>
                        <TableCell>{formatDate(item.createdAt)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              getPriority(item) === "high"
                                ? "destructive"
                                : getPriority(item) === "medium"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {getPriority(item)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {item.duplicateDetected && (
                              <Badge variant="outline" className="text-xs">
                                Duplicate
                              </Badge>
                            )}
                            {item.complianceViolations && item.complianceViolations.length > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                Compliance
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReview(item)}
                            >
                              <Eye className="mr-1 h-3 w-3" />
                              Review
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/dashboard/knowledge-items/${item.id}`)}
                            >
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* NLP Analysis Tools */}
        {canCurate && (
          <>
            {/* Duplicate Detection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Duplicate Detection (NLP Analysis)
                </CardTitle>
                <CardDescription>
                  Items flagged by NLP tools as potential duplicates. Review and merge or archive redundant content.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : duplicates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No duplicates detected
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Similarity Score</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {duplicates.slice(0, 10).map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{getTypeDisplayName(item.type)}</Badge>
                          </TableCell>
                          <TableCell>{item.author?.name || "Unknown"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">High</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/dashboard/knowledge-items/${item.id}`)}
                              >
                                Review
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Outdated Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Outdated Content Detection
                </CardTitle>
                <CardDescription>
                  Content that hasn't been updated in over a year. Flag for review and metadata correction.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : outdatedContent.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No outdated content detected
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {outdatedContent.map((item) => {
                        const lastUpdate = new Date(item.updatedAt);
                        const ageInDays = Math.floor(
                          (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)
                        );
                        return (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.title}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{getTypeDisplayName(item.type)}</Badge>
                            </TableCell>
                            <TableCell>{formatDate(item.updatedAt)}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{ageInDays} days</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleFlagOutdated(item)}
                                >
                                  Flag for Review
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/dashboard/knowledge-items/${item.id}`)}
                                >
                                  View
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Governance Council */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Knowledge Governance Council
            </CardTitle>
            <CardDescription>
              Council members responsible for curating and auditing key resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Governance Council members are responsible for:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Reviewing and approving knowledge items</li>
                <li>Maintaining quality and relevance of content</li>
                <li>Detecting and resolving duplicates</li>
                <li>Flagging outdated content for updates</li>
                <li>Ensuring compliance with organizational standards</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Review Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Knowledge Item</DialogTitle>
              <DialogDescription>
                {selectedItem?.title}
              </DialogDescription>
            </DialogHeader>
            {selectedItem && (
              <div className="space-y-4">
                <div>
                  <Label>Type</Label>
                  <p className="text-sm">{getTypeDisplayName(selectedItem.type)}</p>
                </div>
                <div>
                  <Label>Description</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedItem.description || "No description"}
                  </p>
                </div>
                {selectedItem.duplicateDetected && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      ⚠️ This item has been flagged as a potential duplicate
                    </p>
                  </div>
                )}
                {selectedItem.complianceViolations && selectedItem.complianceViolations.length > 0 && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                    <p className="text-sm text-red-800 dark:text-red-200">
                      ⚠️ Compliance violations detected: {selectedItem.complianceViolations.join(", ")}
                    </p>
                  </div>
                )}
                <div>
                  <Label htmlFor="rejection-reason">Rejection Reason (if rejecting)</Label>
                  <Textarea
                    id="rejection-reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide a reason for rejection..."
                    className="mt-1"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setReviewDialogOpen(false);
                      setSelectedItem(null);
                      setRejectionReason("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={reviewing}
                  >
                    {reviewing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </>
                    )}
                  </Button>
                  <Button onClick={handleApprove} disabled={reviewing}>
                    {reviewing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Approve
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </OrganizationDashboardLayout>
  );
}
