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
              Ready to transform your knowledge management?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Join thousands of organizations using DKN to collaborate better,
              share knowledge faster, and grow together.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#demo">Schedule Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
