const API_BASE_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:3000"
}/api`;

export interface ApiResponse<T> {
  status: "success" | "error";
  data?: T;
  message?: string;
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

export async function fetchKnowledgeItems(params?: {
  type?: string;
  status?: string;
  search?: string;
  repositoryId?: string;
}): Promise<KnowledgeItem[]> {
  const token = localStorage.getItem("dkn_token");
  if (!token) {
    throw new Error("Authentication required");
  }

  const queryParams = new URLSearchParams();
  if (params?.type) queryParams.append("type", params.type);
  if (params?.status) queryParams.append("status", params.status);
  if (params?.search) queryParams.append("search", params.search);
  if (params?.repositoryId)
    queryParams.append("repositoryId", params.repositoryId);

  const url = `${API_BASE_URL}/knowledge${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch knowledge items: ${response.statusText}`);
  }

  const result: ApiResponse<KnowledgeItem[]> = await response.json();
  return result.data || [];
}

export async function fetchKnowledgeItemById(
  id: string
): Promise<KnowledgeItem> {
  const token = localStorage.getItem("dkn_token");
  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_BASE_URL}/knowledge/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch knowledge item: ${response.statusText}`);
  }

  const result: ApiResponse<KnowledgeItem> = await response.json();
  if (!result.data) {
    throw new Error("Knowledge item not found");
  }
  return result.data;
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
  const token = localStorage.getItem("dkn_token");
  if (!token) {
    throw new Error("Authentication required");
  }

  // Fetch all items and calculate stats
  const items = await fetchKnowledgeItems();

  const stats: KnowledgeItemsStats = {
    total: items.length,
    approved: items.filter((item) => item.status === "approved").length,
    pending: items.filter((item) => item.status === "pending_review").length,
    rejected: items.filter((item) => item.status === "rejected").length,
    draft: items.filter((item) => item.status === "draft").length,
    archived: items.filter((item) => item.status === "archived").length,
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
  const token = localStorage.getItem("dkn_token");
  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_BASE_URL}/knowledge/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: response.statusText,
    }));
    throw new Error(error.message || "Failed to update knowledge item");
  }

  const result: ApiResponse<KnowledgeItem> = await response.json();
  if (!result.data) {
    throw new Error("Update failed: No data returned");
  }
  return result.data;
}

// Delete knowledge item
export async function deleteKnowledgeItem(id: string): Promise<void> {
  const token = localStorage.getItem("dkn_token");
  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_BASE_URL}/knowledge/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: response.statusText,
    }));
    throw new Error(error.message || "Failed to delete knowledge item");
  }
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

export async function fetchRepositories(): Promise<Repository[]> {
  const token = localStorage.getItem("dkn_token");
  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_BASE_URL}/repositories`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch repositories: ${response.statusText}`);
  }

  const result: ApiResponse<Repository[]> = await response.json();
  return result.data || [];
}

export async function fetchRepositoryById(id: string): Promise<Repository> {
  const token = localStorage.getItem("dkn_token");
  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_BASE_URL}/repositories/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch repository: ${response.statusText}`);
  }

  const result: ApiResponse<Repository> = await response.json();
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
}): Promise<Project[]> {
  const token = localStorage.getItem("dkn_token");
  if (!token) {
    throw new Error("Authentication required");
  }

  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append("status", params.status);
  if (params?.search) queryParams.append("search", params.search);
  if (params?.clientId) queryParams.append("clientId", params.clientId);

  const url = `${API_BASE_URL}/projects${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch projects: ${response.statusText}`);
  }

  const result: ApiResponse<Project[]> = await response.json();
  return result.data || [];
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
}): Promise<Client[]> {
  const token = localStorage.getItem("dkn_token");
  if (!token) {
    throw new Error("Authentication required");
  }

  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.append("search", params.search);

  const url = `${API_BASE_URL}/clients${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch clients: ${response.statusText}`);
  }

  const result: ApiResponse<Client[]> = await response.json();
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
  region?: string | null;
  industry?: string | null;
  isActive?: boolean | null;
  createdAt: string;
}

export async function fetchEmployees(params?: {
  status?: string;
  role?: string;
  search?: string;
}): Promise<Employee[]> {
  const token = localStorage.getItem("dkn_token");
  if (!token) {
    throw new Error("Authentication required");
  }

  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append("status", params.status);
  if (params?.role) queryParams.append("role", params.role);
  if (params?.search) queryParams.append("search", params.search);

  const url = `${API_BASE_URL}/users${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch employees: ${response.statusText}`);
  }

  const result: ApiResponse<Employee[]> = await response.json();
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
  const token = localStorage.getItem("dkn_token");
  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: response.statusText,
    }));
    throw new Error(error.message || "Failed to update user");
  }

  const result: ApiResponse<User> = await response.json();
  if (!result.data) {
    throw new Error("Update failed: No data returned");
  }
  return result.data;
}
