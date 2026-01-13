import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
  requiredOrganizationType?: "individual" | "organizational";
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredOrganizationType,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check role requirement
  if (requiredRole && user.role !== requiredRole) {
    // Redirect based on organization type
    if (user.organizationType === "organizational") {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/explore" replace />;
  }

  // Check organization type requirement
  if (requiredOrganizationType) {
    if (requiredOrganizationType === "organizational" && user.organizationType !== "organizational") {
      return <Navigate to="/explore" replace />;
    }
    if (requiredOrganizationType === "individual" && user.organizationType !== "individual") {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
