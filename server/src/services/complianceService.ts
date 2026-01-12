import { db } from "../db/connection";
import { complianceRules, regions } from "../db/schema";
import { eq } from "drizzle-orm";

interface ComplianceCheckResult {
  compliant: boolean;
  violations: string[];
}

// Patterns for sensitive data detection
const SENSITIVE_PATTERNS = {
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g, // Social Security Number
  creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, // Credit Card
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email (for bulk emails)
  phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // Phone number
};

/**
 * Check compliance for a knowledge item
 */
export async function checkCompliance(
  title: string,
  content: string,
  userRegion?: string
): Promise<ComplianceCheckResult> {
  const violations: string[] = [];

  // Check for sensitive data patterns
  const fullText = `${title} ${content}`.toLowerCase();

  // Check for SSN
  if (SENSITIVE_PATTERNS.ssn.test(fullText)) {
    violations.push("Potential Social Security Number detected");
  }

  // Check for credit card numbers
  if (SENSITIVE_PATTERNS.creditCard.test(fullText)) {
    violations.push("Potential credit card number detected");
  }

  // Check for bulk email addresses (potential privacy issue)
  const emailMatches = fullText.match(SENSITIVE_PATTERNS.email);
  if (emailMatches && emailMatches.length > 5) {
    violations.push("Multiple email addresses detected - potential privacy concern");
  }

  // Check for phone numbers (potential privacy issue)
  const phoneMatches = fullText.match(SENSITIVE_PATTERNS.phone);
  if (phoneMatches && phoneMatches.length > 3) {
    violations.push("Multiple phone numbers detected - potential privacy concern");
  }

  // If user region is provided, check regional compliance rules
  if (userRegion) {
    try {
      const [region] = await db
        .select()
        .from(regions)
        .where(eq(regions.name, userRegion))
        .limit(1);

      if (region) {
        const [complianceRule] = await db
          .select()
          .from(complianceRules)
          .where(eq(complianceRules.regionId, region.id))
          .limit(1);

        if (complianceRule) {
          // Check compliance level and add warnings if needed
          if (complianceRule.complianceLevel === "high") {
            // High compliance regions might have stricter rules
            // Add specific checks based on compliance rules
            if (complianceRule.lawDescription.toLowerCase().includes("gdpr")) {
              // GDPR-specific checks
              if (fullText.includes("personal data") || fullText.includes("pii")) {
                violations.push(
                  "Potential GDPR violation: Personal data mentioned without proper handling"
                );
              }
            }
          }
        }
      }
    } catch (error) {
      // If region lookup fails, continue without regional checks
      console.error("Error checking regional compliance:", error);
    }
  }

  return {
    compliant: violations.length === 0,
    violations,
  };
}

/**
 * Check if content violates compliance rules (simplified check)
 */
export async function checkContentCompliance(
  content: string,
  userRegion?: string
): Promise<ComplianceCheckResult> {
  return checkCompliance("", content, userRegion);
}

