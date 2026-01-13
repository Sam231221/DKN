import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">
                  DKN
                </span>
              </div>
              <span className="text-lg font-semibold">
                Digital Knowledge Network
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <a
                href="#features"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </a>
              <a
                href="#solutions"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Solutions
              </a>
              <a
                href="#about"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </a>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated && user ? (
              <>
                <Button variant="ghost" asChild>
                  <Link to={user.organizationType === "organizational" ? "/dashboard" : "/explore"}>
                    Dashboard
                  </Link>
                </Button>
                <Button variant="ghost" onClick={handleLogout}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign in</Link>
                </Button>
                <span className="text-sm text-muted-foreground">
                  Invitation only
                </span>
              </>
            )}
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="space-y-1 px-4 pb-3 pt-2">
            <a
              href="#features"
              className="block rounded-md px-3 py-2 text-base text-muted-foreground hover:bg-muted"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#solutions"
              className="block rounded-md px-3 py-2 text-base text-muted-foreground hover:bg-muted"
              onClick={() => setMobileMenuOpen(false)}
            >
              Solutions
            </a>
            <a
              href="#about"
              className="block rounded-md px-3 py-2 text-base text-muted-foreground hover:bg-muted"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </a>
            <div className="flex flex-col gap-2 pt-4">
              {isAuthenticated && user ? (
                <>
                  <Button variant="ghost" asChild className="w-full">
                    <Link to={user.organizationType === "organizational" ? "/dashboard" : "/explore"}>
                      Dashboard
                    </Link>
                  </Button>
                  <Button variant="ghost" onClick={handleLogout} className="w-full">
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild className="w-full">
                    <Link to="/login">Sign in</Link>
                  </Button>
                  <p className="text-xs text-center text-muted-foreground px-3">
                    Access by invitation only
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
