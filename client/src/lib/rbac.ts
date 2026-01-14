import type { ComponentType } from "react";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FileText,
  FolderKanban,
  Briefcase,
  Settings,
  Search,
  TrendingUp,
  Award,
  Shield,
} from "lucide-react";
import type { UserRole, Permission } from "./permissions";

// ============================================================================
// TYPES
// ============================================================================

export interface SidebarItem {
  id: string;
  label: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
  roles: UserRole[] | "all";
  badge?: string;
  requiresPermission?: keyof Permission;
  description?: string;
}

export interface ContentAccess {
  page: string;
  canView: UserRole[];
  canCreate: UserRole[];
  canEdit: UserRole[];
  canDelete: UserRole[];
  canManage: UserRole[];
  features: Record<string, UserRole[]>;
}

// ============================================================================
// SIDEBAR NAVIGATION CONFIGURATION
// ============================================================================

export const sidebarItems: SidebarItem[] = [
  {
    id: "overview",
    label: "Overview",
    path: "/dashboard",
    icon: LayoutDashboard,
    roles: "all",
    description: "Dashboard overview and key metrics",
  },
  {
    id: "clients",
    label: "Clients",
    path: "/dashboard/clients",
    icon: Users,
    roles: ["administrator", "executive_leadership"],
    description: "Manage client companies and relationships",
  },
  {
    id: "employees",
    label: "Employees",
    path: "/dashboard/employees",
    icon: UserCheck,
    roles: ["administrator", "executive_leadership", "knowledge_champion"],
    description: "View and manage employee information",
  },
  {
    id: "projects",
    label: "Projects",
    path: "/dashboard/projects",
    icon: Briefcase,
    roles: "all",
    description: "View and manage projects",
  },
  {
    id: "workspaces",
    label: "Workspaces",
    path: "/dashboard/workspaces",
    icon: Users,
    roles: "all",
    description: "Collaborative workspaces for team projects",
  },
  {
    id: "knowledge-items",
    label: "Knowledge Items",
    path: "/dashboard/knowledge-items",
    icon: FileText,
    roles: "all",
    description: "Browse and manage knowledge items",
  },
  {
    id: "repositories",
    label: "Repositories",
    path: "/dashboard/repositories",
    icon: FolderKanban,
    roles: "all",
    description: "Manage knowledge repositories",
  },
  {
    id: "search",
    label: "Search",
    path: "/dashboard/search",
    icon: Search,
    roles: "all",
    description: "AI-powered knowledge search",
  },
  {
    id: "trending",
    label: "Trending",
    path: "/dashboard/trending",
    icon: TrendingUp,
    roles: "all",
    description: "Trending knowledge items and topics",
  },
  {
    id: "contributors",
    label: "Contributors",
    path: "/dashboard/contributors",
    icon: Users,
    roles: "all",
    description: "View knowledge contributors",
  },
  {
    id: "leaderboard",
    label: "Leaderboard",
    path: "/dashboard/leaderboard",
    icon: Award,
    roles: "all",
    description: "Gamification leaderboard",
  },
  {
    id: "governance",
    label: "Governance",
    path: "/dashboard/governance",
    icon: Shield,
    roles: [
      "administrator",
      "executive_leadership",
      "knowledge_council_member",
    ],
    description: "Knowledge governance and curation",
  },
  {
    id: "settings",
    label: "Settings",
    path: "/dashboard/settings",
    icon: Settings,
    roles: "all",
    description: "User and system settings",
  },
];

// ============================================================================
// CONTENT ACCESS CONFIGURATION
// ============================================================================

export const contentAccess: Record<string, ContentAccess> = {
  overview: {
    page: "overview",
    canView: [
      "consultant",
      "knowledge_champion",
      "administrator",
      "executive_leadership",
      "knowledge_council_member",
    ],
    canCreate: [],
    canEdit: [],
    canDelete: [],
    canManage: [],
    features: {
      viewPersonalStats: [
        "consultant",
        "knowledge_champion",
        "administrator",
        "executive_leadership",
        "knowledge_council_member",
      ],
      viewTeamStats: [
        "knowledge_champion",
        "administrator",
        "executive_leadership",
        "knowledge_council_member",
      ],
      viewOrgStats: ["administrator", "executive_leadership"],
    },
  },
  clients: {
    page: "clients",
    canView: ["administrator", "executive_leadership"],
    canCreate: ["administrator"],
    canEdit: ["administrator"],
    canDelete: ["administrator"],
    canManage: ["administrator", "executive_leadership"],
    features: {
      viewClientDetails: ["administrator", "executive_leadership"],
      manageClientRelations: ["administrator"],
    },
  },
  employees: {
    page: "employees",
    canView: ["administrator", "executive_leadership", "knowledge_champion"],
    canCreate: ["administrator"],
    canEdit: ["administrator"],
    canDelete: ["administrator"],
    canManage: ["administrator", "executive_leadership"],
    features: {
      viewEmployeeList: [
        "administrator",
        "executive_leadership",
        "knowledge_champion",
      ],
      manageEmployees: ["administrator"],
      viewEmployeeDetails: [
        "administrator",
        "executive_leadership",
        "knowledge_champion",
      ],
    },
  },
  projects: {
    page: "projects",
    canView: [
      "consultant",
      "knowledge_champion",
      "administrator",
      "executive_leadership",
      "knowledge_council_member",
    ],
    canCreate: [
      "consultant",
      "knowledge_champion",
      "administrator",
      "executive_leadership",
    ],
    canEdit: [
      "consultant",
      "knowledge_champion",
      "administrator",
      "executive_leadership",
    ],
    canDelete: ["administrator"],
    canManage: ["administrator", "executive_leadership"],
    features: {
      viewAllProjects: [
        "consultant",
        "knowledge_champion",
        "administrator",
        "executive_leadership",
        "knowledge_council_member",
      ],
      createProjects: [
        "consultant",
        "knowledge_champion",
        "administrator",
        "executive_leadership",
      ],
      manageProjects: ["administrator", "executive_leadership"],
    },
  },
  workspaces: {
    page: "workspaces",
    canView: [
      "consultant",
      "knowledge_champion",
      "administrator",
      "executive_leadership",
      "knowledge_council_member",
    ],
    canCreate: [
      "consultant",
      "knowledge_champion",
      "administrator",
      "executive_leadership",
    ],
    canEdit: [
      "consultant",
      "knowledge_champion",
      "administrator",
      "executive_leadership",
    ],
    canDelete: ["administrator"],
    canManage: [
      "consultant",
      "knowledge_champion",
      "administrator",
      "executive_leadership",
    ],
    features: {
      viewWorkspaces: [
        "consultant",
        "knowledge_champion",
        "administrator",
        "executive_leadership",
        "knowledge_council_member",
      ],
      addWorkspaceMembers: [
        "consultant",
        "knowledge_champion",
        "administrator",
        "executive_leadership",
      ],
      removeWorkspaceMembers: [
        "consultant",
        "knowledge_champion",
        "administrator",
        "executive_leadership",
      ],
      viewWorkspaceActivity: [
        "consultant",
        "knowledge_champion",
        "administrator",
        "executive_leadership",
        "knowledge_council_member",
      ],
      manageWorkspaceSettings: ["administrator", "executive_leadership"],
    },
  },
  "knowledge-items": {
    page: "knowledge-items",
    canView: [
      "consultant",
      "knowledge_champion",
      "administrator",
      "executive_leadership",
      "knowledge_council_member",
    ],
    canCreate: [
      "consultant",
      "knowledge_champion",
      "administrator",
      "executive_leadership",
      "knowledge_council_member",
    ],
    canEdit: [
      "consultant",
      "knowledge_champion",
      "administrator",
      "executive_leadership",
      "knowledge_council_member",
    ],
    canDelete: ["knowledge_champion", "administrator"],
    canManage: [
      "knowledge_champion",
      "administrator",
      "executive_leadership",
      "knowledge_council_member",
    ],
    features: {
      validateContent: [
        "knowledge_champion",
        "administrator",
        "executive_leadership",
        "knowledge_council_member",
      ],
      viewDrafts: [
        "consultant",
        "knowledge_champion",
        "administrator",
        "executive_leadership",
        "knowledge_council_member",
      ],
      viewPendingReview: [
        "knowledge_champion",
        "administrator",
        "executive_leadership",
        "knowledge_council_member",
      ],
    },
  },
  repositories: {
    page: "repositories",
    canView: [
      "consultant",
      "knowledge_champion",
      "administrator",
      "executive_leadership",
      "knowledge_council_member",
    ],
    canCreate: [
      "knowledge_champion",
      "administrator",
      "executive_leadership",
      "knowledge_council_member",
    ],
    canEdit: [
      "knowledge_champion",
      "administrator",
      "executive_leadership",
      "knowledge_council_member",
    ],
    canDelete: ["administrator"],
    canManage: [
      "knowledge_champion",
      "administrator",
      "executive_leadership",
      "knowledge_council_member",
    ],
    features: {
      manageRepositories: [
        "knowledge_champion",
        "administrator",
        "executive_leadership",
        "knowledge_council_member",
      ],
    },
  },
  search: {
    page: "search",
    canView: [
      "consultant",
      "knowledge_champion",
      "administrator",
      "executive_leadership",
      "knowledge_council_member",
    ],
    canCreate: [],
    canEdit: [],
    canDelete: [],
    canManage: [],
    features: {},
  },
  trending: {
    page: "trending",
    canView: [
      "consultant",
      "knowledge_champion",
      "administrator",
      "executive_leadership",
      "knowledge_council_member",
    ],
    canCreate: [],
    canEdit: [],
    canDelete: [],
    canManage: [],
    features: {},
  },
  contributors: {
    page: "contributors",
    canView: [
      "consultant",
      "knowledge_champion",
      "administrator",
      "executive_leadership",
      "knowledge_council_member",
    ],
    canCreate: [],
    canEdit: [],
    canDelete: [],
    canManage: [],
    features: {},
  },
  leaderboard: {
    page: "leaderboard",
    canView: [
      "consultant",
      "knowledge_champion",
      "administrator",
      "executive_leadership",
      "knowledge_council_member",
    ],
    canCreate: [],
    canEdit: [],
    canDelete: [],
    canManage: [],
    features: {},
  },
  analytics: {
    page: "analytics",
    canView: [
      "knowledge_champion",
      "administrator",
      "executive_leadership",
      "knowledge_council_member",
    ],
    canCreate: [],
    canEdit: [],
    canDelete: [],
    canManage: ["administrator"],
    features: {
      viewSystemAnalytics: [
        "knowledge_champion",
        "administrator",
        "executive_leadership",
        "knowledge_council_member",
      ],
      viewRegionalAnalytics: [
        "knowledge_champion",
        "administrator",
        "executive_leadership",
      ],
      viewOrgAnalytics: ["administrator", "executive_leadership"],
    },
  },
  governance: {
    page: "governance",
    canView: [
      "administrator",
      "executive_leadership",
      "knowledge_council_member",
    ],
    canCreate: [
      "administrator",
      "executive_leadership",
      "knowledge_council_member",
    ],
    canEdit: [
      "administrator",
      "executive_leadership",
      "knowledge_council_member",
    ],
    canDelete: ["administrator"],
    canManage: [
      "administrator",
      "executive_leadership",
      "knowledge_council_member",
    ],
    features: {
      auditContent: [
        "administrator",
        "executive_leadership",
        "knowledge_council_member",
      ],
      curateResources: [
        "administrator",
        "executive_leadership",
        "knowledge_council_member",
      ],
      manageGovernance: ["administrator", "executive_leadership"],
    },
  },
  "user-management": {
    page: "user-management",
    canView: ["administrator"],
    canCreate: ["administrator"],
    canEdit: ["administrator"],
    canDelete: ["administrator"],
    canManage: ["administrator"],
    features: {
      manageUsers: ["administrator"],
      manageRoles: ["administrator"],
      managePermissions: ["administrator"],
    },
  },
  settings: {
    page: "settings",
    canView: [
      "consultant",
      "knowledge_champion",
      "administrator",
      "executive_leadership",
      "knowledge_council_member",
    ],
    canCreate: [],
    canEdit: [
      "consultant",
      "knowledge_champion",
      "administrator",
      "executive_leadership",
      "knowledge_council_member",
    ],
    canDelete: [],
    canManage: ["administrator"],
    features: {
      editProfile: [
        "consultant",
        "knowledge_champion",
        "administrator",
        "executive_leadership",
        "knowledge_council_member",
      ],
      manageSystemSettings: ["administrator"],
    },
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a role has access to a sidebar item
 */
export function canAccessSidebarItem(
  role: UserRole,
  item: SidebarItem,
  hasPermissionCheck?: (permission: keyof Permission) => boolean
): boolean {
  if (item.roles === "all") return true;
  if (item.requiresPermission && hasPermissionCheck) {
    if (!hasPermissionCheck(item.requiresPermission)) {
      return false;
    }
  }
  if (Array.isArray(item.roles)) {
    return item.roles.includes(role);
  }
  return true;
}

/**
 * Get filtered sidebar items for a specific role
 */
export function getSidebarItemsForRole(
  role: UserRole,
  hasPermissionCheck?: (permission: keyof Permission) => boolean
): SidebarItem[] {
  return sidebarItems.filter((item) =>
    canAccessSidebarItem(role, item, hasPermissionCheck)
  );
}

/**
 * Check if a role can view a page
 */
export function canViewPage(role: UserRole, page: string): boolean {
  const access = contentAccess[page];
  if (!access) return false;
  return access.canView.includes(role);
}

/**
 * Check if a role can perform an action on a page
 */
export function canPerformAction(
  role: UserRole,
  page: string,
  action: "create" | "edit" | "delete" | "manage"
): boolean {
  const access = contentAccess[page];
  if (!access) return false;

  const actionMap = {
    create: access.canCreate,
    edit: access.canEdit,
    delete: access.canDelete,
    manage: access.canManage,
  };

  const allowedRoles = actionMap[action];
  return allowedRoles.includes(role);
}

/**
 * Check if a role can access a specific feature
 */
export function canAccessFeature(
  role: UserRole,
  page: string,
  feature: string
): boolean {
  const access = contentAccess[page];
  if (!access) return false;

  const featureRoles = access.features[feature];
  if (!featureRoles) return false;
  return featureRoles.includes(role);
}

/**
 * Get all accessible pages for a role
 */
export function getAccessiblePages(role: UserRole): string[] {
  return Object.keys(contentAccess).filter((page) => canViewPage(role, page));
}
