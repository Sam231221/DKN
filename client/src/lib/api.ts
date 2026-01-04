const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

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
  repositoryId: string | null;
  authorId: string;
  validatedBy: string | null;
  validatedAt: string | null;
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
}

export async function fetchKnowledgeItems(params?: {
  type?: string;
  status?: string;
  search?: string;
  repositoryId?: string;
}): Promise<KnowledgeItem[]> {
  const queryParams = new URLSearchParams();
  if (params?.type) queryParams.append("type", params.type);
  if (params?.status) queryParams.append("status", params.status);
  if (params?.search) queryParams.append("search", params.search);
  if (params?.repositoryId) queryParams.append("repositoryId", params.repositoryId);

  const url = `${API_BASE_URL}/knowledge${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch knowledge items: ${response.statusText}`);
  }

  const result: ApiResponse<KnowledgeItem[]> = await response.json();
  return result.data || [];
}

export async function fetchKnowledgeItemById(id: string): Promise<KnowledgeItem> {
  const response = await fetch(`${API_BASE_URL}/knowledge/${id}`);
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
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return date.toLocaleDateString();
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
  experienceLevel?: "aspiring_engineer" | "entry_level" | "mid_level" | "experienced" | "highly_experienced" | "not_engineer";
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
    const error = await response.json();
    throw new Error(error.message || "Failed to sign up");
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

