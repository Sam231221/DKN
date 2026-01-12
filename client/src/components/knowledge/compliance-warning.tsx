import { AlertTriangle, Shield, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ComplianceWarningProps {
  violations: string[];
  checked: boolean;
  className?: string;
}

export function ComplianceWarning({
  violations,
  checked,
  className,
}: ComplianceWarningProps) {
  if (!checked && violations.length === 0) {
    return null;
  }

  if (violations.length === 0) {
    return (
      <Card className={`p-3 bg-green-500/10 border-green-500/20 ${className || ""}`}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
          <span className="text-sm text-green-600 dark:text-green-400 font-medium">
            Compliance check passed
          </span>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 bg-red-500/10 border-red-500/20 ${className || ""}`}>
      <div className="flex items-start gap-3">
        <Shield className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-sm text-red-600 dark:text-red-400">
              Compliance Violations Detected
            </h4>
            <Badge variant="destructive" className="text-xs">
              {violations.length} {violations.length === 1 ? "issue" : "issues"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            The following compliance issues were detected. Please review and address before submitting.
          </p>
          <ul className="space-y-1.5">
            {violations.map((violation, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{violation}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}

