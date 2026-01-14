import { useNavigate } from "react-router-dom";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getRoleDisplayName } from "@/lib/permissions";
import type { UserRole } from "@/lib/permissions";

interface AccessDeniedProps {
  requiredRole?: UserRole | UserRole[];
  requiredPermission?: string;
  pageName?: string;
  message?: string;
}

export function AccessDenied({
  requiredRole,
  requiredPermission,
  pageName,
  message,
}: AccessDeniedProps) {
  const navigate = useNavigate();

  const getRoleMessage = () => {
    if (Array.isArray(requiredRole)) {
      const roleNames = requiredRole.map((r) => getRoleDisplayName(r)).join(", ");
      return `This page requires one of the following roles: ${roleNames}`;
    }
    if (requiredRole) {
      return `This page requires the ${getRoleDisplayName(requiredRole)} role`;
    }
    return "You don't have permission to access this page";
  };

  const getPermissionMessage = () => {
    if (requiredPermission) {
      return `This action requires the "${requiredPermission}" permission`;
    }
    return null;
  };

  const defaultMessage = message || 
    getPermissionMessage() || 
    getRoleMessage() ||
    "You don't have sufficient permissions to access this content.";

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <Shield className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription className="text-base mt-2">
            {pageName && (
              <span className="block mb-2 font-medium text-foreground">
                {pageName}
              </span>
            )}
            {defaultMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>If you believe you should have access to this page, please contact your administrator.</p>
            {requiredRole && (
              <p className="text-xs">
                Required role: {Array.isArray(requiredRole) 
                  ? requiredRole.map(r => getRoleDisplayName(r)).join(", ")
                  : getRoleDisplayName(requiredRole)}
              </p>
            )}
            {requiredPermission && (
              <p className="text-xs">
                Required permission: {requiredPermission}
              </p>
            )}
          </div>
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Button
            onClick={() => navigate("/dashboard")}
            className="w-full"
          >
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
