import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Loader2,
  AtSign,
  Search,
  Eye,
  EyeOff,
  Check,
  Mail,
  Building2,
  Shield,
} from "lucide-react";
import { getInvitation, activateInvitation, type Invitation, type ActivationData } from "@/lib/api";

// Available interests based on Digital Knowledge Network domains
const AVAILABLE_INTERESTS = [
  "knowledge-management",
  "knowledge-sharing",
  "organizational-learning",
  "digital-transformation",
  "it-integration",
  "project-management",
  "client-deliverables",
  "best-practices",
  "documentation",
  "content-curation",
  "expertise-mapping",
  "collaboration",
  "cross-functional-teams",
  "team-workspace",
  "consulting",
  "logistics",
  "renewable-energy",
  "smart-manufacturing",
  "ai-recommendations",
  "nlp-tools",
  "data-protection",
  "gdpr-compliance",
  "cloud-platforms",
  "business-strategy",
  "organizational-change",
  "performance-management",
  "learning-organization",
  "knowledge-champion",
  "technical-resources",
  "framework-development",
  "process-improvement",
  "quality-assurance",
  "compliance-governance",
  "training-materials",
  "institutional-memory",
  "intellectual-capital",
];

const EXPERIENCE_LEVEL_OPTIONS = [
  { value: "aspiring_engineer", label: "Aspiring engineer (<1 year)" },
  { value: "entry_level", label: "Entry-level (1 year)" },
  { value: "mid_level", label: "Mid-level (2-3 years)" },
  { value: "experienced", label: "Experienced (4-5 years)" },
  { value: "highly_experienced", label: "Highly experienced (6-10 years)" },
  { value: "not_engineer", label: "I'm not an engineer" },
];

const ROLE_LABELS: Record<string, string> = {
  consultant: "Consultant",
  knowledge_champion: "Knowledge Champion",
  administrator: "Administrator",
  executive_leadership: "Executive Leadership",
  knowledge_council_member: "Knowledge Council Member",
};

export default function ActivateInvitationPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [interestSearch, setInterestSearch] = useState("");
  const [activationSuccess, setActivationSuccess] = useState(false);

  const [formData, setFormData] = useState<ActivationData & { confirmPassword: string }>({
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    username: "",
    address: "",
    experienceLevel: undefined,
    interests: [],
  });

  useEffect(() => {
    if (!token) {
      setError("Invalid invitation link");
      setLoading(false);
      return;
    }

    const fetchInvitation = async () => {
      try {
        const inv = await getInvitation(token);
        setInvitation(inv);
        setError("");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load invitation. The link may be invalid or expired."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const validateForm = (): boolean => {
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      setError(
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      );
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (!formData.firstName?.trim()) {
      setError("First name is required");
      return false;
    }
    if (!formData.lastName?.trim()) {
      setError("Last name is required");
      return false;
    }
    if (!formData.username || formData.username.trim().length < 3) {
      setError("Username must be at least 3 characters long");
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError("Username can only contain letters, numbers, and underscores");
      return false;
    }
    return true;
  };

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => {
      const interests = prev.interests || [];
      if (interests.includes(interest)) {
        return { ...prev, interests: interests.filter((i) => i !== interest) };
      } else {
        return { ...prev, interests: [...interests, interest] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    if (!token) {
      setError("Invalid invitation token");
      return;
    }

    setActivating(true);

    try {
      const activationData: ActivationData = {
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        address: formData.address || undefined,
        experienceLevel: formData.experienceLevel,
        interests: formData.interests && formData.interests.length > 0 ? formData.interests : undefined,
      };

      const result = await activateInvitation(token, activationData);

      // Store user data and token
      localStorage.setItem("dkn_token", result.token);
      localStorage.setItem("dkn_user", JSON.stringify(result.user));

      setActivationSuccess(true);

      // Redirect after a brief delay
      setTimeout(() => {
        if ((result.user as any).organizationType === "organizational") {
          navigate("/dashboard");
        } else {
          navigate("/explore");
        }
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to activate account. Please try again."
      );
    } finally {
      setActivating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 bg-card border-border max-w-2xl w-full">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading invitation...</span>
          </div>
        </Card>
      </div>
    );
  }

  if (activationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 bg-card border-border max-w-2xl w-full">
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Account Activated!</h2>
              <p className="text-muted-foreground">
                Your account has been successfully activated. Redirecting you to the dashboard...
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 bg-card border-border max-w-2xl w-full">
          <div className="text-center space-y-6">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <div>
              <h2 className="text-2xl font-bold mb-2">Invalid Invitation</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button asChild>
                <Link to="/login">Go to Login</Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="w-full px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">DKN</span>
          </div>
          <span className="text-lg font-semibold">Digital Knowledge Network</span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pb-16">
        <Card className="p-8 bg-card border-border max-w-2xl w-full">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Activate Your Account</h2>
              <p className="text-muted-foreground">
                Complete your account setup to get started
              </p>
            </div>

            {/* Invitation Details */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3 border border-border">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{invitation.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Role:</span>
                <span className="font-medium">
                  {ROLE_LABELS[invitation.role] || invitation.role}
                </span>
              </div>
              {invitation.organizationName && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Organization:</span>
                  <span className="font-medium">{invitation.organizationName}</span>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    required
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    required
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        username: e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9_]/g, ""),
                      })
                    }
                    required
                    className="bg-background pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                      className="bg-background pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                      className="bg-background pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address (Optional)</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="123 Main St, City, State, ZIP"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experienceLevel">Experience Level (Optional)</Label>
                <Select
                  value={formData.experienceLevel || ""}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      experienceLevel: value as any,
                    })
                  }
                >
                  <SelectTrigger id="experienceLevel" className="bg-background">
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERIENCE_LEVEL_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Interests (Optional)</Label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search interests..."
                    value={interestSearch}
                    onChange={(e) => setInterestSearch(e.target.value)}
                    className="pl-10 bg-background"
                  />
                </div>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-border rounded-md">
                  {AVAILABLE_INTERESTS.filter((interest) =>
                    interest.toLowerCase().includes(interestSearch.toLowerCase())
                  ).map((interest) => {
                    const isSelected =
                      formData.interests?.includes(interest) || false;
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => handleInterestToggle(interest)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          isSelected
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "bg-muted text-foreground hover:bg-muted/80 border border-border"
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
                {formData.interests && formData.interests.length > 0 && (
                  <div className="text-center text-sm text-muted-foreground pt-2">
                    {formData.interests.length} tag
                    {formData.interests.length !== 1 ? "s" : ""} selected
                  </div>
                )}
              </div>

              <Button type="submit" disabled={activating} className="w-full">
                {activating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Activating account...
                  </>
                ) : (
                  "Activate Account"
                )}
              </Button>
            </form>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link
                to="/login"
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
