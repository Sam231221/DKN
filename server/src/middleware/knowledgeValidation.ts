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

// Middleware to parse JSON strings in FormData (like tags)
const parseFormDataJson = (req: Request, _res: Response, next: NextFunction) => {
  // Parse tags if it's a JSON string (from FormData)
  if (req.body.tags && typeof req.body.tags === "string") {
    try {
      req.body.tags = JSON.parse(req.body.tags);
    } catch (error) {
      return next(new AppError("Invalid tags format. Must be a JSON array.", 400));
    }
  }
  next();
};

// Validate knowledge item upload
export const validateKnowledgeUpload = [
  parseFormDataJson,
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),
  body("type")
    .isIn([
      "documentation",
      "best_practices",
      "procedure",
      "training",
      "project_knowledge",
      "client_content",
      "technical",
      "policy",
      "guideline",
    ])
    .withMessage("Invalid knowledge type"),
  body("repositoryId")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Repository ID must be valid if provided"),
  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array")
    .custom((tags) => {
      if (tags && tags.length > 10) {
        throw new Error("Maximum 10 tags allowed");
      }
      return true;
    }),
  body("tags.*")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Each tag must be between 1 and 50 characters"),
  body("content")
    .optional()
    .trim()
    .isLength({ max: 10000 })
    .withMessage("Content must be less than 10000 characters"),
  handleValidationErrors,
];

// Validate file upload (used as custom validator in controller)
export const validateFileUpload = (
  _req: Request,
  _res: Response,
  next: NextFunction
) => {
  // File validation is handled in the controller after multer processes the file
  // This middleware is a placeholder for any additional file validation logic
  next();
};

