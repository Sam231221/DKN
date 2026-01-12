import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { OrganizationDashboardLayout } from "@/components/dashboard/organization-dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { getRoleBadgeColor, getRoleDisplayName, rolePermissions } from "@/lib/permissions";
import type { UserRole } from "@/lib/permissions";
import { Check, X, Loader2, Save } from "lucide-react";
import { updateUser } from "@/lib/api";

interface User {
  id?: string;
  organizationType?: string;
  name?: string;
  email?: string;
  role?: string;
  organizationName?: string;
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    comments: true,
    validation: false,
    knowledgeUpdates: true,
  });

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

    setUser(parsedUser);
    setName(parsedUser.name || "");
  }, [navigate]);

  const handleSave = async () => {
    if (!user?.id) return;

    setLoading(true);
    setSaveSuccess(false);

    try {
      const updatedUser = await updateUser(user.id, { name });
      
      // Update local storage
      const updatedUserData = {
        ...user,
        name: updatedUser.name,
      };
      localStorage.setItem("dkn_user", JSON.stringify(updatedUserData));
      setUser(updatedUserData);
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const permissions = rolePermissions[user.role as UserRole] || rolePermissions.employee;

  return (
    <OrganizationDashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <div>
                <Badge className={getRoleBadgeColor(user.role as UserRole)}>
                  {getRoleDisplayName(user.role as UserRole)}
                </Badge>
              </div>
            </div>
            {user.organizationName && (
              <div className="space-y-2">
                <Label>Organization</Label>
                <Input
                  value={user.organizationName}
                  disabled
                  className="bg-muted"
                />
              </div>
            )}
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
            {saveSuccess && (
              <p className="text-sm text-green-600">Profile updated successfully!</p>
            )}
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card>
          <CardHeader>
            <CardTitle>Your Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(permissions).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <span className="text-sm font-medium">
                    {key
                      .replace("can", "")
                      .replace(/([A-Z])/g, " $1")
                      .trim()}
                  </span>
                  {value ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications" className="font-medium">
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates about knowledge items and activities
                </p>
              </div>
              <Checkbox
                id="email-notifications"
                checked={notifications.email}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, email: checked as boolean })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="comment-notifications" className="font-medium">
                  Comment Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when someone comments on your knowledge items
                </p>
              </div>
              <Checkbox
                id="comment-notifications"
                checked={notifications.comments}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, comments: checked as boolean })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="validation-notifications" className="font-medium">
                  Validation Requests
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive validation request notifications
                </p>
              </div>
              <Checkbox
                id="validation-notifications"
                checked={notifications.validation}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, validation: checked as boolean })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="knowledge-updates" className="font-medium">
                  Knowledge Updates
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about updates to knowledge items in your repositories
                </p>
              </div>
              <Checkbox
                id="knowledge-updates"
                checked={notifications.knowledgeUpdates}
                onCheckedChange={(checked) =>
                  setNotifications({
                    ...notifications,
                    knowledgeUpdates: checked as boolean,
                  })
                }
              />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                // TODO: Implement notification preferences save
                alert("Notification preferences saved!");
              }}
            >
              Save Notification Preferences
            </Button>
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card>
          <CardHeader>
            <CardTitle>Account Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Password</Label>
              <p className="text-sm text-muted-foreground">
                Last changed: Never
              </p>
              <Button variant="outline" onClick={() => navigate("/forgot-password")}>
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </OrganizationDashboardLayout>
  );
}
