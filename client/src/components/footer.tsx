import { Link } from "react-router-dom";

const footerLinks = {
  product: [
    { label: "Features", to: "#features" },
    { label: "Solutions", to: "#solutions" },
    { label: "Pricing", to: "#" },
    { label: "Security", to: "#" },
  ],
  company: [
    { label: "About", to: "#about" },
    { label: "Blog", to: "#" },
    { label: "Careers", to: "#" },
    { label: "Contact", to: "#" },
  ],
  resources: [
    { label: "Documentation", to: "#" },
    { label: "Help Center", to: "#" },
    { label: "Community", to: "#" },
    { label: "API", to: "#" },
  ],
  legal: [
    { label: "Privacy", to: "#" },
    { label: "Terms", to: "#" },
    { label: "Cookie Policy", to: "#" },
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
            Built with knowledge, powered by AI
          </div>
        </div>
      </div>
    </footer>
  );
}
