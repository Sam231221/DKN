import { Link } from "react-router-dom";

const footerLinks = {
  product: [
    { label: "Features", to: "#features" },
    { label: "Solutions", to: "#solutions" },
    { label: "Knowledge Repositories", to: "#" },
    { label: "Security & Compliance", to: "#" },
  ],
  company: [
    { label: "About Velion", to: "#about" },
    { label: "Connect to Grow", to: "#" },
    { label: "Knowledge Champions", to: "#" },
    { label: "Governance Council", to: "#" },
  ],
  resources: [
    { label: "Documentation", to: "#" },
    { label: "Training Materials", to: "#" },
    { label: "Best Practices", to: "#" },
    { label: "Support", to: "#" },
  ],
  legal: [
    { label: "Privacy Policy", to: "#" },
    { label: "Data Protection", to: "#" },
    { label: "GDPR Compliance", to: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <span className="text-xs font-bold text-primary-foreground">
                DKN
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              © 2025 Velion Dynamics. All rights reserved.
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Transforming knowledge flow since 2021 • Powered by IntraCore Technologies
          </div>
        </div>
      </div>
    </footer>
  );
}
