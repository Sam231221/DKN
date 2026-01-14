import { useMemo, useCallback } from "react";
import type { UserRole } from "@/lib/permissions";
import {
  getSidebarItemsForRole,
  canViewPage,
  canPerformAction,
  canAccessFeature,
  getAccessiblePages,
  type SidebarItem,
} from "@/lib/rbac";
import { hasPermission, rolePermissions, type Permission } from "@/lib/permissions";

interface UseRoleAccessOptions {
  role: UserRole | null | undefined;
}

interface UseRoleAccessReturn {
  // Role info
  role: UserRole | null;

  // Sidebar access
  sidebarItems: SidebarItem[];
  canAccessSidebarItem: (itemId: string) => boolean;

  // Page access
  canViewPage: (page: string) => boolean;
  accessiblePages: string[];

  // Action permissions
  canCreate: (page: string) => boolean;
  canEdit: (page: string) => boolean;
  canDelete: (page: string) => boolean;
  canManage: (page: string) => boolean;

  // Feature access
  canAccessFeature: (page: string, feature: string) => boolean;

  // Permission checks
  hasPermission: (permission: keyof Permission) => boolean;
  permissions: Permission | null;
}

/**
 * Custom hook for role-based access control
 * Provides easy access to RBAC functions and role-specific data
 */
export function useRoleAccess(
  options: UseRoleAccessOptions
): UseRoleAccessReturn {
  const { role } = options;

  // Define helper functions first (before useMemo that uses them)
  // Use useCallback to memoize so it can be safely used in dependency arrays
  const hasPermissionCheck = useCallback(
    (permission: keyof Permission): boolean => {
      if (!role) return false;
      return hasPermission(role, permission);
    },
    [role]
  );

  // Memoize sidebar items for performance
  const sidebarItems = useMemo(() => {
    if (!role) return [];
    return getSidebarItemsForRole(role, hasPermissionCheck);
  }, [role, hasPermissionCheck]);

  // Memoize accessible pages
  const accessiblePages = useMemo(() => {
    if (!role) return [];
    return getAccessiblePages(role);
  }, [role]);

  // Memoize permissions
  const permissions = useMemo(() => {
    if (!role) return null;
    return rolePermissions[role] || null;
  }, [role]);

  // Helper functions
  const canAccessSidebarItem = (itemId: string): boolean => {
    if (!role) return false;
    return sidebarItems.some((item) => item.id === itemId);
  };

  const canViewPageCheck = (page: string): boolean => {
    if (!role) return false;
    return canViewPage(role, page);
  };

  const canCreateCheck = (page: string): boolean => {
    if (!role) return false;
    return canPerformAction(role, page, "create");
  };

  const canEditCheck = (page: string): boolean => {
    if (!role) return false;
    return canPerformAction(role, page, "edit");
  };

  const canDeleteCheck = (page: string): boolean => {
    if (!role) return false;
    return canPerformAction(role, page, "delete");
  };

  const canManageCheck = (page: string): boolean => {
    if (!role) return false;
    return canPerformAction(role, page, "manage");
  };

  const canAccessFeatureCheck = (page: string, feature: string): boolean => {
    if (!role) return false;
    return canAccessFeature(role, page, feature);
  };

  return {
    role: role || null,
    sidebarItems,
    canAccessSidebarItem,
    canViewPage: canViewPageCheck,
    accessiblePages,
    canCreate: canCreateCheck,
    canEdit: canEditCheck,
    canDelete: canDeleteCheck,
    canManage: canManageCheck,
    canAccessFeature: canAccessFeatureCheck,
    hasPermission: hasPermissionCheck,
    permissions,
  };
}
