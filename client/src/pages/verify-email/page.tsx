import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navigation } from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { verifyEmail } from "@/lib/api";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setError("Verification token is missing");
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        await verifyEmail(token);
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to verify email. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16">
        <Card className="p-8 bg-card border-border max-w-md w-full">
          <div className="text-center space-y-6">
            {loading && (
              <>
                <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
                <h2 className="text-2xl font-bold">Verifying your email...</h2>
                <p className="text-muted-foreground">
                  Please wait while we verify your email address.
                </p>
              </>
            )}

            {success && (
              <>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold">Email verified!</h2>
                <p className="text-muted-foreground">
                  Your email address has been successfully verified. You can now log in to your account.
                </p>
                <p className="text-sm text-muted-foreground">
                  Redirecting to login page...
                </p>
                <Button onClick={() => navigate("/login")} className="w-full">
                  Go to login
                </Button>
              </>
            )}

            {error && (
              <>
                <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <h2 className="text-2xl font-bold">Verification failed</h2>
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
                <div className="space-y-2">
                  <Button onClick={() => navigate("/login")} className="w-full">
                    Go to login
                  </Button>
                  <Button
                    onClick={() => navigate("/signup")}
                    variant="outline"
                    className="w-full"
                  >
                    Sign up again
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
