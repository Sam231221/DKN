import type React from "react";
import { useState } from "react";
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
  ChevronRight,
  ChevronLeft,
  AtSign,
  User,
  Search,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { signup, type SignupData, resendVerificationEmail } from "@/lib/api";

// Available interests based on Digital Knowledge Network domains (lowercase with hyphens)
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

const EMPLOYEE_COUNT_OPTIONS = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "501-1000", label: "501-1000 employees" },
  { value: "1000+", label: "1000+ employees" },
];

const ROLE_OPTIONS = [
  { value: "knowledge_champion", label: "Knowledge Champion" },
  { value: "consultant", label: "Consultant" },
  { value: "executive_leadership", label: "Executive Leadership" },
];

const EXPERIENCE_LEVEL_OPTIONS = [
  { value: "aspiring_engineer", label: "Aspiring engineer (<1 year)" },
  { value: "entry_level", label: "Entry-level (1 year)" },
  { value: "mid_level", label: "Mid-level (2-3 years)" },
  { value: "experienced", label: "Experienced (4-5 years)" },
  { value: "highly_experienced", label: "Highly experienced (6-10 years)" },
  { value: "not_engineer", label: "I'm not an engineer" },
];

export function SignupForm() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [interestSearch, setInterestSearch] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);

  const [formData, setFormData] = useState<
    SignupData & { confirmPassword: string }
  >({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    address: "",
    experienceLevel: undefined,
    organizationType: "individual",
    organizationName: "",
    employeeCount: "",
    role: "consultant",
    interests: [],
  });

  const validateStep1 = (): boolean => {
    if (!formData.firstName.trim()) {
      setError("First name is required");
      return false;
    }
    if (!formData.lastName.trim()) {
      setError("Last name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
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
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!formData.organizationType) {
      setError("Please select organization type");
      return false;
    }
    if (formData.organizationType === "organizational") {
      if (!formData.organizationName || !formData.organizationName.trim()) {
        setError("Organization name is required for organizational accounts");
        return false;
      }
      if (formData.organizationName.trim().length < 2) {
        setError("Organization name must be at least 2 characters long");
        return false;
      }
      if (!formData.employeeCount) {
        setError("Please select employee count for organizational accounts");
        return false;
      }
      if (!formData.role) {
        setError("Please select your role for organizational accounts");
        return false;
      }
    }
    return true;
  };

  const validateStep3 = (): boolean => {
    if (!formData.interests || formData.interests.length === 0) {
      setError("Please select at least one interest");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError("");
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setError("");
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
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

    if (!validateStep3()) return;

    setLoading(true);

    try {
      const signupPayload: SignupData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        address: formData.address || undefined,
        experienceLevel: formData.experienceLevel,
        organizationType: formData.organizationType as
          | "individual"
          | "organizational",
        organizationName:
          formData.organizationType === "organizational"
            ? formData.organizationName
            : undefined,
        employeeCount:
          formData.organizationType === "organizational"
            ? formData.employeeCount
            : undefined,
        role: formData.role as
          | "knowledge_champion"
          | "consultant"
          | "executive_leadership",
        interests: formData.interests,
      };

      await signup(signupPayload);

      // Show success message - user needs to verify email
      setSignupSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendingEmail(true);
    setError("");
    try {
      await resendVerificationEmail(formData.email);
      setError(""); // Clear any previous errors
      // Show success message
      alert("Verification email sent! Please check your inbox.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to resend verification email. Please try again."
      );
    } finally {
      setResendingEmail(false);
    }
  };

  const progressPercentage = (currentStep / 3) * 100;

  // Show success message if signup was successful
  if (signupSuccess) {
    return (
      <Card className="p-8 bg-card border-border max-w-2xl w-full overflow-hidden">
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Check your email</h2>
            <p className="text-muted-foreground mb-4">
              We've sent a verification link to <strong>{formData.email}</strong>
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Please click the link in the email to verify your account before logging in.
            </p>
          </div>
          <div className="space-y-4">
            <Button
              onClick={handleResendVerification}
              disabled={resendingEmail}
              variant="outline"
              className="w-full"
            >
              {resendingEmail ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Resend verification email"
              )}
            </Button>
            <Button
              onClick={() => navigate("/login")}
              variant="ghost"
              className="w-full"
            >
              Back to login
            </Button>
          </div>
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8 bg-card border-border max-w-2xl w-full overflow-hidden">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Step {currentStep} of 3
          </span>
          <span className="text-sm font-medium text-muted-foreground">
            {Math.round(progressPercentage)}% complete
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
      </div>

      <form
        onSubmit={currentStep === 3 ? handleSubmit : (e) => e.preventDefault()}
      >
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive mb-6">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Basic Details */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Create your account</h2>
              <p className="text-muted-foreground">
                Let's start with your basic information
              </p>
            </div>

            {/* Google OAuth Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full bg-background border-border hover:bg-muted/50"
              onClick={() => {
                // Google OAuth handler - to be connected to backend
                window.location.href = `${
                  import.meta.env.VITE_API_URL || "http://localhost:3000"
                }/api/auth/google`;
              }}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
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
                <Label htmlFor="lastName">Last Name</Label>
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
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="bg-background pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Enter a username</Label>
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
                <Label htmlFor="password">Password</Label>
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
                <Label htmlFor="confirmPassword">Confirm Password</Label>
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
              <Label htmlFor="experienceLevel">Experience level</Label>
              <Select
                value={formData.experienceLevel || ""}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    experienceLevel: value as
                      | "aspiring_engineer"
                      | "entry_level"
                      | "mid_level"
                      | "experienced"
                      | "highly_experienced"
                      | "not_engineer"
                      | undefined,
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
          </div>
        )}

        {/* Step 2: Organization Type */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Account Type</h2>
              <p className="text-muted-foreground">
                Are you setting up for an organization or individual use?
              </p>
            </div>

            <div className="space-y-4">
              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                  formData.organizationType === "individual"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() =>
                  setFormData({
                    ...formData,
                    organizationType: "individual",
                    organizationName: "",
                    employeeCount: "",
                    role: "consultant",
                  })
                }
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.organizationType === "individual"
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    }`}
                  >
                    {formData.organizationType === "individual" && (
                      <Check className="h-3 w-3 text-primary-foreground" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">Individual</h3>
                    <p className="text-sm text-muted-foreground">
                      For personal use
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                  formData.organizationType === "organizational"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() =>
                  setFormData({
                    ...formData,
                    organizationType: "organizational",
                  })
                }
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.organizationType === "organizational"
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    }`}
                  >
                    {formData.organizationType === "organizational" && (
                      <Check className="h-3 w-3 text-primary-foreground" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">Organizational</h3>
                    <p className="text-sm text-muted-foreground">
                      For teams and companies
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {formData.organizationType === "organizational" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="organizationName">Organization Name</Label>
                  <Input
                    id="organizationName"
                    type="text"
                    placeholder="Enter your organization name"
                    value={formData.organizationName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        organizationName: e.target.value,
                      })
                    }
                    required
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employeeCount">Number of Employees</Label>
                  <Select
                    value={formData.employeeCount}
                    onValueChange={(value) =>
                      setFormData({ ...formData, employeeCount: value })
                    }
                  >
                    <SelectTrigger id="employeeCount" className="bg-background">
                      <SelectValue placeholder="Select employee count" />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYEE_COUNT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Your Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        role: value as
                          | "knowledge_champion"
                          | "consultant"
                          | "executive_leadership",
                      })
                    }
                  >
                    <SelectTrigger id="role" className="bg-background">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 3: Pick tags/interests - daily.dev style */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Pick tags that are relevant to you
              </h2>
            </div>

            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search knowledge-management, digital-transformation, etc..."
                value={interestSearch}
                onChange={(e) => setInterestSearch(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>

            {/* Tags grid */}
            <div className="flex flex-wrap gap-2 max-h-96 overflow-y-auto p-2">
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
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
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

            {/* Progress indicator */}
            {formData.interests && formData.interests.length > 0 && (
              <div className="text-center text-sm text-muted-foreground pt-2">
                {formData.interests.length} tag
                {formData.interests.length !== 1 ? "s" : ""} selected
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || loading}
            className="bg-transparent"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {currentStep < 3 ? (
            <Button type="button" onClick={handleNext} disabled={loading}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          )}
        </div>

        <p className="text-xs text-center text-muted-foreground mt-6">
          By creating an account, you agree to our{" "}
          <button type="button" className="text-primary hover:underline">
            Terms of Service
          </button>{" "}
          and{" "}
          <button type="button" className="text-primary hover:underline">
            Privacy Policy
          </button>
        </p>
      </form>
    </Card>
  );
}
