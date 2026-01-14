import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { AppError } from "./errorHandler.js";

export const handleValidationErrors = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors
      .array()
      .map((err) => `${err.type === "field" ? err.path : ""}: ${err.msg}`)
      .join(", ");
    return next(new AppError(errorMessages, 400));
  }
  next();
};

// Login validation
export const validateLogin = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  handleValidationErrors,
];

// Step 1: Basic details validation
export const validateSignupStep1 = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores")
    .toLowerCase(),
  body("experienceLevel")
    .optional()
    .isIn([
      "aspiring_engineer",
      "entry_level",
      "mid_level",
      "experienced",
      "highly_experienced",
      "not_engineer",
    ])
    .withMessage(
      "Experience level must be one of: aspiring_engineer, entry_level, mid_level, experienced, highly_experienced, not_engineer"
    ),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  body("address")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Address must be less than 200 characters"),
  body("avatar")
    .optional()
    .custom((value) => {
      if (!value || value === "") return true;
      // Basic URL validation
      try {
        new URL(value);
        return true;
      } catch {
        throw new Error("Avatar must be a valid URL");
      }
    }),
  handleValidationErrors,
];

// Step 2: Organization type validation
export const validateSignupStep2 = [
  body("organizationType")
    .isIn(["individual", "organizational"])
    .withMessage(
      "Organization type must be either 'individual' or 'organizational'"
    ),
  body("organizationName").custom((value, { req }) => {
    if (req.body.organizationType === "organizational") {
      if (!value || !value.trim()) {
        throw new Error(
          "Organization name is required for organizational accounts"
        );
      }
      if (value.trim().length < 2) {
        throw new Error("Organization name must be at least 2 characters long");
      }
      if (value.trim().length > 100) {
        throw new Error("Organization name must be less than 100 characters");
      }
    }
    return true;
  }),
  body("employeeCount").custom((value, { req }) => {
    if (req.body.organizationType === "organizational") {
      if (!value) {
        throw new Error(
          "Employee count is required for organizational accounts"
        );
      }
      const validCounts = [
        "1-10",
        "11-50",
        "51-200",
        "201-500",
        "501-1000",
        "1000+",
      ];
      if (!validCounts.includes(value)) {
        throw new Error(
          "Employee count must be one of: 1-10, 11-50, 51-200, 201-500, 501-1000, 1000+"
        );
      }
    }
    return true;
  }),
  handleValidationErrors,
];

// Step 3: Role and interests validation
export const validateSignupStep3 = [
  body("role").custom((value, { req }) => {
    // Role is required only for organizational accounts
    if (req.body.organizationType === "organizational") {
      if (!value) {
        throw new Error("Role is required for organizational accounts");
      }
      const validRoles = [
        "knowledge_champion",
        "consultant",
        "executive_leadership",
      ];
      if (!validRoles.includes(value)) {
        throw new Error(
          "Role must be one of: knowledge_champion, consultant, executive_leadership"
        );
      }
    }
    // For individual accounts, role is optional (will default to "client")
    return true;
  }),
  body("interests")
    .isArray({ min: 1 })
    .withMessage("At least one interest is required")
    .custom((interests) => {
      if (interests.length > 10) {
        throw new Error("Maximum 10 interests allowed");
      }
      return true;
    }),
  body("interests.*")
    .trim()
    .notEmpty()
    .withMessage("Interest cannot be empty")
    .isLength({ max: 50 })
    .withMessage("Each interest must be less than 50 characters"),
  handleValidationErrors,
];

// Email verification validation
export const validateEmailVerification = [
  body("token")
    .trim()
    .notEmpty()
    .withMessage("Verification token is required")
    .isLength({ min: 32, max: 200 })
    .withMessage("Invalid token format"),
  handleValidationErrors,
];

// Resend verification email validation
export const validateResendVerification = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  handleValidationErrors,
];

// Forgot password validation
export const validatePasswordReset = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  handleValidationErrors,
];

// Reset password validation
export const validateResetPassword = [
  body("token")
    .trim()
    .notEmpty()
    .withMessage("Reset token is required")
    .isLength({ min: 32, max: 200 })
    .withMessage("Invalid token format"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  handleValidationErrors,
];
