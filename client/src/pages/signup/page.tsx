import { SignupForm } from "@/components/auth/signup-form";
import { Link } from "react-router-dom";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Minimal header with just logo/brand */}
      <header className="w-full px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">
              DKN
            </span>
          </div>
          <span className="text-lg font-semibold">
            Digital Knowledge Network
          </span>
        </Link>
      </header>

      {/* Signup form centered */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pb-16">
        <div className="w-full max-w-3xl space-y-6">
          <SignupForm />

          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              Already have an account?{" "}
            </span>
            <Link
              to="/login"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
