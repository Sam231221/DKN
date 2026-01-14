import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Briefcase,
  Users,
  Calendar,
  Loader2,
  AlertCircle,
  UserPlus,
  X,
  MessageSquare,
  FileText,
  Building2,
  Target,
  TrendingUp,
  ExternalLink,
} from "lucide-react";
import {
  fetchWorkspaceMembers,
  addWorkspaceMember,
  removeWorkspaceMember,
  fetchWorkspaceActivity,
  fetchEmployees,
  fetchProjectById,
  fetchKnowledgeItems,
  formatDate,
  getTypeDisplayName,
  type WorkspaceMember,
  type WorkspaceActivity,
  type Employee,
  type Project,
  type KnowledgeItem,
} from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActivityFeed } from "../activity/activity-feed";

export function WorkspaceDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userRole = (user?.role || "consultant") as any;
  const { canAccessFeature } = useRoleAccess({ role: userRole });
  
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [activities, setActivities] = useState<WorkspaceActivity[]>([]);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<Employee[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("member");
  const [submitting, setSubmitting] = useState(false);

  // RBAC checks
  const canAddMembers = canAccessFeature("workspaces", "addWorkspaceMembers");
  const canRemoveMembers = canAccessFeature("workspaces", "removeWorkspaceMembers");
  const canViewActivity = canAccessFeature("workspaces", "viewWorkspaceActivity");

  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  const loadData = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError(null);
      const [projectData, membersData, activitiesData, knowledgeData] = await Promise.all([
        fetchProjectById(projectId),
        fetchWorkspaceMembers(projectId),
        fetchWorkspaceActivity(projectId, 20),
        fetchKnowledgeItems({ originatingProjectId: projectId, limit: 10 }),
      ]);
      setProject(projectData);
      setMembers(membersData);
      setActivities(activitiesData);
      setKnowledgeItems(knowledgeData.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workspace");
      console.error("Error loading workspace:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!projectId || !selectedUserId) return;

    try {
      setSubmitting(true);
      await addWorkspaceMember(projectId, {
        userId: selectedUserId,
        role: selectedRole,
      });
      setShowAddMember(false);
      setSelectedUserId("");
      setSelectedRole("member");
      await loadData();
      
      // Load available users for next time
      const users = await fetchEmployees();
      setAvailableUsers(users.filter(u => !members.some(m => m.user.id === u.id)));
    } catch (err) {
      console.error("Failed to add member:", err);
      alert("Failed to add member");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!projectId) return;
    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      await removeWorkspaceMember(projectId, memberId);
      await loadData();
    } catch (err) {
      console.error("Failed to remove member:", err);
      alert("Failed to remove member");
    }
  };

  const loadAvailableUsers = async () => {
    try {
      const users = await fetchEmployees();
      setAvailableUsers(
        users.filter((u) => !members.some((m) => m.user.id === u.id))
      );
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  };

  const canManageMembers =
    canAddMembers &&
    user &&
    members.some(
      (m) =>
        m.user.id === user.id &&
        (m.role === "owner" || m.role === "admin")
    );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "completed":
        return "bg-blue-500";
      case "on_hold":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");
  };

  return (
    <div className="space-y-6">
      {/* Project Information */}
      {project && (
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Briefcase className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="text-2xl font-bold">{project.name}</h2>
                  {project.projectCode && (
                    <p className="text-sm text-muted-foreground">
                      {project.projectCode}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                className={`${getStatusColor(project.status)} text-white`}
              >
                {getStatusLabel(project.status)}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/dashboard/projects/${project.id}`)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Project
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Client</p>
                <p className="font-medium">{project.clientName || "Unknown"}</p>
              </div>
            </div>
            {project.domain && (
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Domain</p>
                  <p className="font-medium">{project.domain}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-medium">
                  {new Date(project.startDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            {project.endDate && (
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="font-medium">
                    {new Date(project.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {project.leadConsultantName && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-1">Lead Consultant</p>
              <p className="font-medium">{project.leadConsultantName}</p>
            </div>
          )}

          {project.clientSatisfactionScore && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Client Satisfaction</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{project.clientSatisfactionScore}/5</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <div
                          key={star}
                          className={`h-3 w-3 rounded-full ${
                            star <= project.clientSatisfactionScore!
                              ? "bg-yellow-400"
                              : "bg-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Team Members</p>
              <p className="text-2xl font-bold">{members.length}</p>
            </div>
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Knowledge Items</p>
              <p className="text-2xl font-bold">{knowledgeItems.length}</p>
            </div>
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Activities</p>
              <p className="text-2xl font-bold">{activities.length}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
      </div>

      {/* Knowledge Items */}
      {knowledgeItems.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Knowledge Items</h2>
              <Badge variant="secondary">{knowledgeItems.length}</Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigate(
                  `/dashboard/knowledge-items?project=${projectId}`
                )
              }
            >
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {knowledgeItems.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                onClick={() =>
                  navigate(`/dashboard/knowledge-items/${item.id}`)
                }
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{item.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {getTypeDisplayName(item.type)}
                    </Badge>
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {item.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{formatDate(item.createdAt)}</span>
                  <ExternalLink className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Members Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Team Members</h2>
            <Badge variant="secondary">{members.length}</Badge>
          </div>
          {canManageMembers && (
            <Dialog
              open={showAddMember}
              onOpenChange={(open) => {
                setShowAddMember(open);
                if (open) {
                  loadAvailableUsers();
                }
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Team Member</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      User
                    </label>
                    <Select
                      value={selectedUserId}
                      onValueChange={setSelectedUserId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUsers.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name} ({u.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Role
                    </label>
                    <Select
                      value={selectedRole}
                      onValueChange={setSelectedRole}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleAddMember}
                    disabled={submitting || !selectedUserId}
                    className="w-full"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Add Member"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 rounded-lg border"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={member.user.avatar || undefined} />
                  <AvatarFallback>
                    {member.user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{member.user.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {member.role}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {member.user.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Joined {formatDate(member.joinedAt)}
                </span>
                {canRemoveMembers &&
                  canManageMembers &&
                  member.user.id !== user?.id &&
                  member.role !== "owner" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Activity Feed */}
      {canViewActivity && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Workspace Activity</h2>
          </div>
          <ActivityFeed activities={activities} />
        </Card>
      )}
    </div>
  );
}
