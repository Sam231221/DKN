import { useAuth } from "@/contexts/AuthContext"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getRoleBadgeColor, getRoleDisplayName, rolePermissions } from "@/lib/permissions"
import type { UserRole } from "@/lib/permissions"
import { Check, X } from "lucide-react"

export default function SettingsPage() {
  const { user } = useAuth()

  if (!user) return null

  const permissions = rolePermissions[user.role as UserRole]

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <Card className="p-6 bg-card border-border">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue={user.name} className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue={user.email} disabled className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <div>
                <Badge className={getRoleBadgeColor(user.role as UserRole)}>{getRoleDisplayName(user.role as UserRole)}</Badge>
              </div>
            </div>
            <Button>Save Changes</Button>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <h2 className="text-xl font-semibold mb-4">Your Permissions</h2>
          <div className="space-y-3">
            {Object.entries(permissions).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between py-2">
                <span className="text-sm">
                  {key
                    .replace("can", "")
                    .replace(/([A-Z])/g, " $1")
                    .trim()}
                </span>
                {value ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-muted-foreground" />}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive updates about knowledge items</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Comment Notifications</p>
                <p className="text-sm text-muted-foreground">Get notified when someone comments</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Validation Requests</p>
                <p className="text-sm text-muted-foreground">Receive validation request notifications</p>
              </div>
              <input type="checkbox" className="h-4 w-4" />
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
