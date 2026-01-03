import { SignupForm } from "@/components/auth/signup-form";
import { Navigation } from "@/components/navigation";
import { Link } from "react-router-dom";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary mx-auto mb-4">
              <span className="text-xl font-bold text-primary-foreground">
                DKN
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Start managing organizational knowledge today
            </p>
          </div>

          <SignupForm />

          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              Already have an account?{" "}
            </span>
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
