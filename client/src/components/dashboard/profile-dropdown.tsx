import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  User,
  Settings,
  LogOut,
  Bell,
  HelpCircle,
  Moon,
  Sun,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";
import { getRoleBadgeColor, getRoleDisplayName } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";

interface ProfileDropdownProps {
  user: any;
}

export function ProfileDropdown({ user }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    // Clear both token and user via AuthContext
    localStorage.removeItem("dkn_token");
    localStorage.removeItem("dkn_user");
    localStorage.removeItem("dkn_selected_office");
    navigate("/login");
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const userInitial = user.name?.[0]?.toUpperCase() || user.email[0]?.toUpperCase() || "U";
  const userRole = user.role || "client";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted transition-colors"
      >
        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-semibold text-primary">{userInitial}</span>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 rounded-lg border border-border bg-background shadow-lg z-50 max-h-[calc(100vh-120px)] overflow-y-auto">
          {/* Profile Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-semibold text-primary">{userInitial}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{user.name || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                <div className="mt-2">
                  <Badge className={cn("text-xs", getRoleBadgeColor(userRole))}>
                    {getRoleDisplayName(userRole)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Completion */}
          <div className="p-4 border-b border-border bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Profile Completion</span>
              <span className="text-xs text-muted-foreground">60%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: "60%" }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Add headline, work experience and education to complete your profile.
            </p>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            {user.organizationType === "organizational" && (
              <button
                onClick={() => {
                  navigate("/dashboard");
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
              >
                <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                <span>Go to Dashboard</span>
              </button>
            )}
            <button
              onClick={() => {
                navigate("/explore/profile");
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
            >
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Your Profile</span>
            </button>
            <button
              onClick={() => {
                navigate("/explore/settings");
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span>Settings</span>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
            >
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span>Notifications</span>
            </button>
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Sun className="h-4 w-4 text-muted-foreground" />
              )}
              <span>Theme</span>
              <span className="ml-auto text-xs text-muted-foreground capitalize">{theme}</span>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
            >
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
              <span>Help & Support</span>
            </button>
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-border">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-destructive/10 hover:text-destructive transition-colors text-left"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

