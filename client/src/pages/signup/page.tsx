import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Shield, AlertCircle } from "lucide-react";

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

      {/* Invitation-only message */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pb-16">
        <Card className="p-8 bg-card border-border max-w-2xl w-full">
          <div className="space-y-6 text-center">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-muted-foreground" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Invitation Required</h2>
              <p className="text-muted-foreground">
                The Digital Knowledge Network is an invitation-only platform.
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 space-y-4 text-left border border-border">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">How to Get Access</h3>
                  <p className="text-sm text-muted-foreground">
                    To create an account, you need to be invited by an administrator or consultant.
                    If you're part of an organization using DKN, contact your Knowledge Champion or
                    system administrator to request an invitation.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Already Have an Invitation?</h3>
                  <p className="text-sm text-muted-foreground">
                    Check your email for an invitation link. Click the link to activate your account
                    and set up your profile.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/">Back to Home</Link>
              </Button>
            </div>

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
        </Card>
      </div>
    </div>
  );
}
