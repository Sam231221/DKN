import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2 text-sm mb-8">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">
              AI-Powered Knowledge Management
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-balance mb-6">
            The complete platform to{" "}
            <span className="text-primary">build organizational knowledge</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-10">
            Transform how your team collaborates and shares knowledge. Securely
            store, manage, and scale organizational knowledge with AI-powered
            insights and validation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="text-base">
              <Link to="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="text-base bg-transparent"
            >
              <Link href="#demo">Watch Demo</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
