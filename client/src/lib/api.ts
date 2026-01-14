const API_BASE_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:3000"
}/api`;

export interface ApiResponse<T> {
  status: "success" | "error";
  data?: T;
  message?: string;
}

/**
 * Centralized API request function with global 401 error handling
 * Automatically handles token expiration and redirects to login
 */
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem("dkn_token");

  if (!token) {
    // Clear any stale user data
    localStorage.removeItem("dkn_user");
    // Redirect to login if not already there
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  // Handle 401 Unauthorized globally
  if (response.status === 401) {
    // Clear auth data
    localStorage.removeItem("dkn_token");
    localStorage.removeItem("dkn_user");
    localStorage.removeItem("dkn_selected_office");

    // Dispatch storage event to notify other tabs/components
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "dkn_token",
        newValue: null,
      })
    );

    // Redirect to login if not already there
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }

    throw new Error("Session expired. Please login again.");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: response.statusText,
    }));

    // Handle 404 "User not found" - clear auth and redirect to login
    if (
      response.status === 404 &&
      errorData.message?.includes("User not found")
    ) {
      localStorage.removeItem("dkn_token");
      localStorage.removeItem("dkn_user");
      localStorage.removeItem("dkn_selected_office");

      // Dispatch storage event to notify other tabs/components
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "dkn_token",
          newValue: null,
        })
      );

      // Redirect to login if not already there
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    throw new Error(errorData.message || `API error: ${response.statusText}`);
  }

  return response.json();
}

export interface KnowledgeItem {
  id: string;
  title: string;
  description: string | null;
  content: string;
  type: string;
  status: string;
  tags: string[] | null;
  views: number;
  likes: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  originatingProjectId?: string | null; // Project where this item was created
  repositoryId: string | null; // Repository where this item is stored
  authorId: string;
  validatedBy: string | null;
  validatedAt: string | null;
  accessLevel?: string;
  lifecycleStatus?: string;
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  fileType?: string | null;
  duplicateDetected?: boolean;
  complianceChecked?: boolean;
  complianceViolations?: string[] | null;
  author?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  repository?: {
    id: string;
    name: string;
    description: string | null;
  };
  originatingProject?: {
    id: string;
    name: string;
    projectCode?: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function fetchKnowledgeItemById(id: string): Promise<KnowledgeItem> {
  const endpoint = `/knowledge/${id}`;
  const result = await apiRequest<KnowledgeItem>(endpoint);
  if (!result.data) {
    throw new Error("Knowledge item not found");
  }
  return result.data;
}

export async function fetchKnowledgeItems(params?: {
  type?: string;
  status?: string;
  search?: string;
  repositoryId?: string;
  regionId?: string | "all";
  originatingProjectId?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<KnowledgeItem>> {
  const queryParams = new URLSearchParams();
  if (params?.type) queryParams.append("type", params.type);
  if (params?.status) queryParams.append("status", params.status);
  if (params?.search) queryParams.append("search", params.search);
  if (params?.repositoryId)
    queryParams.append("repositoryId", params.repositoryId);
  if (params?.regionId) queryParams.append("regionId", params.regionId);
  if (params?.originatingProjectId)
    queryParams.append("originatingProjectId", params.originatingProjectId);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const endpoint = `/knowledge${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const result = await apiRequest<PaginatedResponse<KnowledgeItem>>(endpoint);
  return result.data || { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
}

export function getTypeDisplayName(type: string): string {
  const typeMap: Record<string, string> = {
    documentation: "Documentation",
    best_practices: "Best Practices",
    procedure: "Procedure",
    training: "Training",
    project_knowledge: "Project Knowledge",
    client_content: "Client Content",
    technical: "Technical",
    policy: "Policy",
    guideline: "Guideline",
  };
  return typeMap[type] || type;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return date.toLocaleDateString();
}

// Knowledge Items Stats
export interface KnowledgeItemsStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  draft: number;
  archived: number;
}

export async function fetchKnowledgeItemsStats(): Promise<KnowledgeItemsStats> {
  // Fetch all items and calculate stats
  const response = await fetchKnowledgeItems();

  const stats: KnowledgeItemsStats = {
    total: response.data.length,
    approved: response.data.filter((item) => item.status === "approved").length,
    pending: response.data.filter((item) => item.status === "pending_review").length,
    rejected: response.data.filter((item) => item.status === "rejected").length,
    draft: response.data.filter((item) => item.status === "draft").length,
    archived: response.data.filter((item) => item.status === "archived").length,
  };

  return stats;
}

// Upload knowledge item with file
export interface UploadKnowledgeItemData {
  title: string;
  description: string;
  content?: string;
  type: string;
  repositoryId?: string;
  originatingProjectId?: string; // Project where this item is created
  accessLevel?: string;
  lifecycleStatus?: string;
  tags?: string[];
  file?: File;
}

export interface UploadKnowledgeItemResponse extends KnowledgeItem {
  warnings?: string[];
  similarItems?: Array<{ id: string; title: string; score: number }>;
  complianceViolations?: string[];
}

export async function uploadKnowledgeItem(
  data: UploadKnowledgeItemData,
  onProgress?: (progress: number) => void
): Promise<UploadKnowledgeItemResponse> {
  const token = localStorage.getItem("dkn_token");
  if (!token) {
    throw new Error("Authentication required");
  }

  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("description", data.description);
  if (data.content) formData.append("content", data.content);
  formData.append("type", data.type);
  if (data.repositoryId) formData.append("repositoryId", data.repositoryId);
  if (data.originatingProjectId)
    formData.append("originatingProjectId", data.originatingProjectId);
  if (data.accessLevel) formData.append("accessLevel", data.accessLevel);
  if (data.lifecycleStatus)
    formData.append("lifecycleStatus", data.lifecycleStatus);
  if (data.tags && data.tags.length > 0) {
    formData.append("tags", JSON.stringify(data.tags));
  }
  if (data.file) {
    formData.append("file", data.file);
  }

  const xhr = new XMLHttpRequest();

  return new Promise((resolve, reject) => {
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = (e.loaded / e.total) * 100;
        onProgress(progress);
      }
    });

    xhr.addEventListener("load", () => {
      // Handle 401 Unauthorized
      if (xhr.status === 401) {
        localStorage.removeItem("dkn_token");
        localStorage.removeItem("dkn_user");
        localStorage.removeItem("dkn_selected_office");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        reject(new Error("Session expired. Please login again."));
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result: ApiResponse<KnowledgeItem> & {
            warnings?: string[];
            similarItems?: Array<{ id: string; title: string; score: number }>;
            complianceViolations?: string[];
          } = JSON.parse(xhr.responseText);
          if (!result.data) {
            reject(new Error("Upload failed: No data returned"));
            return;
          }
          // Return data with warnings, similarItems, and complianceViolations from root level
          resolve({
            ...result.data,
            warnings: result.warnings,
            similarItems: result.similarItems,
            complianceViolations: result.complianceViolations,
          } as UploadKnowledgeItemResponse);
        } catch {
          reject(new Error("Failed to parse response"));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.message || "Upload failed"));
        } catch {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Network error during upload"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload aborted"));
    });

    xhr.open("POST", `${API_BASE_URL}/knowledge`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.send(formData);
  });
}

// Update knowledge item
export interface UpdateKnowledgeItemData {
  title?: string;
  description?: string;
  content?: string;
  type?: string;
  tags?: string[];
  status?: string;
}

export async function updateKnowledgeItem(
  id: string,
  data: UpdateKnowledgeItemData
): Promise<KnowledgeItem> {
  const result = await apiRequest<KnowledgeItem>(`/knowledge/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  if (!result.data) {
    throw new Error("Update failed: No data returned");
  }
  return result.data;
}

// Delete knowledge item
export async function deleteKnowledgeItem(id: string): Promise<void> {
  await apiRequest<void>(`/knowledge/${id}`, {
    method: "DELETE",
  });
}

// Fetch repositories
export interface Repository {
  id: string;
  repositoryCode?: string;
  name: string;
  description: string | null;
  ownerId: string;
  storageLocation?: string;
  encryptionEnabled?: boolean;
  retentionPolicy?: string;
  searchIndexStatus?: string;
  isPublic?: boolean;
  itemCount: number;
  contributorCount: number;
  tags: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export async function fetchRepositories(params?: {
  regionId?: string | "all";
}): Promise<Repository[]> {
  const queryParams = new URLSearchParams();
  if (params?.regionId) queryParams.append("regionId", params.regionId);

  const endpoint = `/repositories${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const result = await apiRequest<Repository[]>(endpoint);
  return result.data || [];
}

export async function fetchRepositoryById(id: string): Promise<Repository> {
  const result = await apiRequest<Repository>(`/repositories/${id}`);
  if (!result.data) {
    throw new Error("Repository not found");
  }
  return result.data;
}

// Projects API
export interface Project {
  id: string;
  projectCode?: string;
  name: string;
  clientId: string;
  clientName?: string;
  domain?: string;
  startDate: string;
  endDate?: string | null;
  status: "planning" | "active" | "on_hold" | "completed" | "cancelled";
  leadConsultantId?: string | null;
  leadConsultantName?: string;
  clientSatisfactionScore?: number | null;
  createdAt: string;
  updatedAt: string;
}

export async function fetchProjects(params?: {
  status?: string;
  search?: string;
  clientId?: string;
  regionId?: string | "all";
}): Promise<Project[]> {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append("status", params.status);
  if (params?.search) queryParams.append("search", params.search);
  if (params?.clientId) queryParams.append("clientId", params.clientId);
  if (params?.regionId) queryParams.append("regionId", params.regionId);

  const endpoint = `/projects${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const result = await apiRequest<Project[]>(endpoint);
  return result.data || [];
}

export async function fetchProjectById(id: string): Promise<Project> {
  const result = await apiRequest<Project>(`/projects/${id}`);
  if (!result.data) {
    throw new Error("Project not found");
  }
  return result.data;
}

// Unified Search API
export interface SearchResult {
  type: "project" | "knowledge" | "repository";
  id: string;
  title: string;
  subtitle: string;
  url: string;
}

export interface UnifiedSearchResponse {
  projects: SearchResult[];
  knowledgeItems: SearchResult[];
  repositories: SearchResult[];
}

export async function fetchUnifiedSearch(
  query: string,
  regionId?: string | "all"
): Promise<UnifiedSearchResponse> {
  const queryParams = new URLSearchParams();
  queryParams.append("q", query);
  if (regionId) {
    queryParams.append("regionId", regionId);
  }

  const endpoint = `/search?${queryParams.toString()}`;
  const result = await apiRequest<UnifiedSearchResponse>(endpoint);
  return result.data || { projects: [], knowledgeItems: [], repositories: [] };
}

// Clients API
export interface Client {
  id: string;
  name: string;
  email?: string | null;
  industry?: string | null;
  regionId?: string | null;
  userId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function fetchClients(params?: {
  search?: string;
  regionId?: string | "all";
}): Promise<Client[]> {
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.append("search", params.search);
  if (params?.regionId) queryParams.append("regionId", params.regionId);

  const endpoint = `/clients${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const result = await apiRequest<Client[]>(endpoint);
  return result.data || [];
}

// Employees API (uses /api/users endpoint)
export interface Employee {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string | null;
  points?: number;
  contributions?: number;
  organizationName?: string | null;
  organizationType?: string | null;
  hireDate?: string | null;
  regionId?: string | null;
  industry?: string | null;
  isActive?: boolean | null;
  createdAt: string;
}

export async function fetchEmployees(params?: {
  status?: string;
  role?: string;
  search?: string;
  regionId?: string | "all";
}): Promise<Employee[]> {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append("status", params.status);
  if (params?.role) queryParams.append("role", params.role);
  if (params?.search) queryParams.append("search", params.search);
  if (params?.regionId) queryParams.append("regionId", params.regionId);

  const endpoint = `/users${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const result = await apiRequest<Employee[]>(endpoint);
  return result.data || [];
}

// Contributors API (uses /api/users endpoint with enhanced fields)
export interface Contributor {
  id: string;
  name: string;
  email: string;
  role: string;
  contributions: number;
  points: number;
  comments: number;
  department: string | null;
  status: "active" | "inactive";
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
}

export async function fetchContributors(params?: {
  role?: string;
  status?: string;
  search?: string;
  regionId?: string | "all";
}): Promise<Contributor[]> {
  const queryParams = new URLSearchParams();
  if (params?.role) queryParams.append("role", params.role);
  if (params?.status) queryParams.append("status", params.status);
  if (params?.search) queryParams.append("search", params.search);
  if (params?.regionId) queryParams.append("regionId", params.regionId);

  const endpoint = `/users${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const result = await apiRequest<Contributor[]>(endpoint);
  return result.data || [];
}

// Comments API
export interface Comment {
  id: string;
  content: string;
  parentCommentId?: string | null;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    role: string;
  };
}

export async function fetchComments(knowledgeItemId: string): Promise<Comment[]> {
  const endpoint = `/comments/knowledge-item/${knowledgeItemId}`;
  const result = await apiRequest<Comment[]>(endpoint);
  return result.data || [];
}

export interface CreateCommentData {
  content: string;
  parentCommentId?: string;
}

export async function createComment(
  knowledgeItemId: string,
  data: CreateCommentData
): Promise<Comment> {
  const endpoint = `/comments/knowledge-item/${knowledgeItemId}`;
  const result = await apiRequest<Comment>(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!result.data) {
    throw new Error("Failed to create comment");
  }
  return result.data;
}

export interface UpdateCommentData {
  content: string;
}

export async function updateComment(
  commentId: string,
  data: UpdateCommentData
): Promise<Comment> {
  const endpoint = `/comments/${commentId}`;
  const result = await apiRequest<Comment>(endpoint, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!result.data) {
    throw new Error("Failed to update comment");
  }
  return result.data;
}

export async function deleteComment(commentId: string): Promise<void> {
  const endpoint = `/comments/${commentId}`;
  await apiRequest<void>(endpoint, {
    method: "DELETE",
  });
}

// Workspaces API
export interface Workspace {
  id: string;
  projectCode?: string | null;
  name: string;
  clientId: string;
  domain?: string | null;
  startDate: string;
  endDate?: string | null;
  status: string;
  leadConsultantId?: string | null;
  userRole?: string;
  joinedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  id: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    role: string;
  };
}

export interface WorkspaceActivity {
  id: string;
  type: string;
  title: string;
  description?: string;
  content?: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string | null;
  };
  knowledgeItemId?: string;
}

export async function fetchUserWorkspaces(): Promise<Workspace[]> {
  const endpoint = `/workspaces`;
  const result = await apiRequest<Workspace[]>(endpoint);
  return result.data || [];
}

export async function fetchWorkspaceMembers(
  projectId: string
): Promise<WorkspaceMember[]> {
  const endpoint = `/workspaces/${projectId}/members`;
  const result = await apiRequest<WorkspaceMember[]>(endpoint);
  return result.data || [];
}

export interface AddWorkspaceMemberData {
  userId: string;
  role?: string;
}

export async function addWorkspaceMember(
  projectId: string,
  data: AddWorkspaceMemberData
): Promise<WorkspaceMember> {
  const endpoint = `/workspaces/${projectId}/members`;
  const result = await apiRequest<WorkspaceMember>(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!result.data) {
    throw new Error("Failed to add workspace member");
  }
  return result.data;
}

export async function removeWorkspaceMember(
  projectId: string,
  memberId: string
): Promise<void> {
  const endpoint = `/workspaces/${projectId}/members/${memberId}`;
  await apiRequest<void>(endpoint, {
    method: "DELETE",
  });
}

export async function fetchWorkspaceActivity(
  projectId: string,
  limit?: number
): Promise<WorkspaceActivity[]> {
  const queryParams = new URLSearchParams();
  if (limit) queryParams.append("limit", limit.toString());
  const endpoint = `/workspaces/${projectId}/activity${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  const result = await apiRequest<WorkspaceActivity[]>(endpoint);
  return result.data || [];
}

// Activity Feed API
export interface ActivityFeedItem {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  relatedId?: string | null;
  relatedType?: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    role: string;
  };
}

export async function fetchActivityFeed(params?: {
  limit?: number;
  projectId?: string;
}): Promise<ActivityFeedItem[]> {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.projectId) queryParams.append("projectId", params.projectId);
  const endpoint = `/activity${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  const result = await apiRequest<ActivityFeedItem[]>(endpoint);
  return result.data || [];
}

export async function fetchUserActivityFeed(
  limit?: number
): Promise<ActivityFeedItem[]> {
  const queryParams = new URLSearchParams();
  if (limit) queryParams.append("limit", limit.toString());
  const endpoint = `/activity/user${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  const result = await apiRequest<ActivityFeedItem[]>(endpoint);
  return result.data || [];
}

// Auth API functions
export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  address?: string;
  avatar?: string;
  experienceLevel?:
    | "aspiring_engineer"
    | "entry_level"
    | "mid_level"
    | "experienced"
    | "highly_experienced"
    | "not_engineer";
  organizationType: "individual" | "organizational";
  organizationName?: string;
  employeeCount?: string;
  role: "knowledge_champion" | "consultant" | "executive_leadership";
  interests: string[];
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username?: string;
    name: string;
    firstName?: string;
    lastName?: string;
    role: string;
    avatar?: string;
    experienceLevel?: string;
    interests?: string[];
    organizationType?: "individual" | "organizational";
    organizationName?: string;
  };
  token: string;
}

export async function signup(data: SignupData): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.message || "Failed to sign up");
    } catch {
      // If JSON parsing fails, use a generic error message
      throw new Error("Failed to sign up. Please try again later.");
    }
  }

  const result: ApiResponse<AuthResponse> = await response.json();
  if (!result.data) {
    throw new Error("Signup failed");
  }
  return result.data;
}

export async function login(data: LoginData): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to login");
  }

  const result: ApiResponse<AuthResponse> = await response.json();
  if (!result.data) {
    throw new Error("Login failed");
  }
  return result.data;
}

// Email verification API functions
export async function verifyEmail(token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to verify email");
  }

  const result: ApiResponse<void> = await response.json();
  if (result.status === "error") {
    throw new Error(result.message || "Failed to verify email");
  }
}

export async function resendVerificationEmail(email: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to resend verification email");
  }

  const result: ApiResponse<void> = await response.json();
  if (result.status === "error") {
    throw new Error(result.message || "Failed to resend verification email");
  }
}

// Password reset API functions
export async function forgotPassword(email: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to send password reset email");
  }

  const result: ApiResponse<void> = await response.json();
  if (result.status === "error") {
    throw new Error(result.message || "Failed to send password reset email");
  }
}

export async function resetPassword(
  token: string,
  password: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to reset password");
  }

  const result: ApiResponse<void> = await response.json();
  if (result.status === "error") {
    throw new Error(result.message || "Failed to reset password");
  }
}

// Invitation API functions
export interface Invitation {
  id: string;
  email: string;
  organizationName: string | null;
  role: string;
  expiresAt: string;
  accepted: boolean;
}

export interface ActivationData {
  password: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  address?: string;
  experienceLevel?: string;
  interests?: string[];
}

export async function getInvitation(token: string): Promise<Invitation> {
  const response = await fetch(`${API_BASE_URL}/invitations/${token}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: response.statusText,
    }));
    throw new Error(error.message || "Failed to fetch invitation");
  }

  const result: ApiResponse<Invitation> = await response.json();
  if (result.status === "error" || !result.data) {
    throw new Error(result.message || "Failed to fetch invitation");
  }
  return result.data;
}

export async function activateInvitation(
  token: string,
  data: ActivationData
): Promise<{ user: User; token: string }> {
  const response = await fetch(
    `${API_BASE_URL}/invitations/activate/${token}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: response.statusText,
    }));
    throw new Error(error.message || "Failed to activate invitation");
  }

  const result: ApiResponse<{ user: User; token: string }> =
    await response.json();
  if (result.status === "error" || !result.data) {
    throw new Error(result.message || "Failed to activate invitation");
  }
  return result.data;
}

// User API functions
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string | null;
  points?: number;
  contributions?: number;
}

export interface UpdateUserData {
  name?: string;
  avatar?: string;
  role?: string;
}

export async function updateUser(
  id: string,
  data: UpdateUserData
): Promise<User> {
  const result = await apiRequest<User>(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  if (!result.data) {
    throw new Error("Update failed: No data returned");
  }
  return result.data;
}

// Regional Office API functions
export interface RegionalOffice {
  id: string;
  name: string;
  region?: string;
  connectivityStatus?: "online" | "offline" | "limited";
  dataProtectionLaws?: string[];
}

export async function fetchAvailableRegionalOffices(): Promise<
  RegionalOffice[]
> {
  const result = await apiRequest<RegionalOffice[]>("/regions/offices");
  if (result.status === "error" || !result.data) {
    throw new Error(result.message || "Failed to fetch regional offices");
  }
  return result.data;
}

export async function fetchRegionalOfficeById(
  id: string
): Promise<RegionalOffice> {
  const result = await apiRequest<RegionalOffice>(`/regions/offices/${id}`);
  if (result.status === "error" || !result.data) {
    throw new Error(result.message || "Failed to fetch regional office");
  }
  return result.data;
}
