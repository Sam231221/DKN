export type UserRole = "consultant" | "knowledge_champion" | "administrator" | "executive_leadership" | "knowledge_council_member"

export interface Permission {
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canValidate: boolean
  canManageUsers: boolean
  canAccessAnalytics: boolean
}

export const rolePermissions: Record<UserRole, Permission> = {
  consultant: {
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canValidate: false,
    canManageUsers: false,
    canAccessAnalytics: true,
  },
  knowledge_champion: {
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canValidate: true,
    canManageUsers: false,
    canAccessAnalytics: true,
  },
  administrator: {
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canValidate: true,
    canManageUsers: true,
    canAccessAnalytics: true,
  },
  executive_leadership: {
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canValidate: true,
    canManageUsers: false,
    canAccessAnalytics: true,
  },
  knowledge_council_member: {
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canValidate: true,
    canManageUsers: false,
    canAccessAnalytics: true,
  },
}

export function hasPermission(role: UserRole, permission: keyof Permission): boolean {
  return rolePermissions[role][permission]
}

export function getRoleBadgeColor(role: UserRole): string {
  const colors = {
    consultant: "bg-purple-500/10 text-purple-500",
    knowledge_champion: "bg-yellow-500/10 text-yellow-500",
    administrator: "bg-red-500/10 text-red-500",
    executive_leadership: "bg-indigo-500/10 text-indigo-500",
    knowledge_council_member: "bg-teal-500/10 text-teal-500",
  }
  return colors[role] || "bg-gray-500/10 text-gray-500"
}

export function getRoleDisplayName(role: UserRole): string {
  return role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
}
