import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { login as apiLogin, type LoginData } from "@/lib/api";

export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string | null;
  lastName?: string | null;
  role: string;
  organizationType?: "individual" | "organizational";
  organizationName?: string | null;
  regionId?: string | null;
  avatar?: string | null;
  points?: number;
  contributions?: number;
  interests?: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("dkn_token");
        const storedUser = localStorage.getItem("dkn_user");

        if (storedToken && storedUser) {
          // Validate token by checking if it's expired
          try {
            const payload = JSON.parse(atob(storedToken.split(".")[1]));
            const expirationTime = payload.exp * 1000; // Convert to milliseconds

            if (Date.now() < expirationTime) {
              // Token is valid
              setToken(storedToken);
              setUser(JSON.parse(storedUser));
            } else {
              // Token expired, clear storage
              localStorage.removeItem("dkn_token");
              localStorage.removeItem("dkn_user");
            }
          } catch (error) {
            // Invalid token format, clear storage
            localStorage.removeItem("dkn_token");
            localStorage.removeItem("dkn_user");
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        localStorage.removeItem("dkn_token");
        localStorage.removeItem("dkn_user");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for storage changes (cross-tab synchronization)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "dkn_token" || e.key === "dkn_user") {
        if (e.newValue) {
          if (e.key === "dkn_token") {
            setToken(e.newValue);
          } else if (e.key === "dkn_user") {
            setUser(JSON.parse(e.newValue));
          }
        } else {
          // Cleared in another tab
          setToken(null);
          setUser(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const loginData: LoginData = { email, password };
      const response = await apiLogin(loginData);

      const userData = response.user as User;
      const authToken = response.token;

      // Store in localStorage
      localStorage.setItem("dkn_token", authToken);
      localStorage.setItem("dkn_user", JSON.stringify(userData));

      // Update state
      setToken(authToken);
      setUser(userData);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem("dkn_token");
    localStorage.removeItem("dkn_user");
    localStorage.removeItem("dkn_selected_office"); // Also clear regional office selection

    // Clear state
    setToken(null);
    setUser(null);

    // Navigate to login using window.location to avoid router context issues
    window.location.href = "/login";
  };

  const refreshUser = async () => {
    // This could fetch fresh user data from the API
    // For now, just reload from localStorage
    const storedUser = localStorage.getItem("dkn_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("dkn_user", JSON.stringify(updatedUser));
    }
  };

  // Ensure value is always defined - create functions with stable references
  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    refreshUser,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
