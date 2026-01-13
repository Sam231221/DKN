import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function CTASection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-primary/10 border border-primary/20 p-12 md:p-16">
          <div className="relative z-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Part of the Connect to Grow Program
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              DKN is Velion's strategic initiative to transform fragmented information 
              silos into a cohesive, adaptive knowledge ecosystem. Access is by invitation 
              through Knowledge Champions or administrators.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/login">
                  Sign In to DKN
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#features">Explore Features</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
