import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateKnowledgeUpload } from "../middleware/knowledgeValidation.js";
import { uploadSingle } from "../middleware/upload.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  getKnowledgeItems,
  getKnowledgeItemById,
  createKnowledgeItem,
  updateKnowledgeItem,
  deleteKnowledgeItem,
} from "../controllers/knowledge.controller.js";

export const knowledgeRoutes = Router();

// Public routes (no authentication required) - Actually, knowledge items should require authentication
// knowledgeRoutes.get("/", getKnowledgeItems);
// knowledgeRoutes.get("/:id", getKnowledgeItemById);

// Wrapper to handle multer/file upload errors
const handleUpload = (req: any, res: any, next: any) => {
  uploadSingle(req, res, (err: any) => {
    if (err) {
      // Handle multer errors
      if (err.name === "MulterError") {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(new AppError("File size exceeds the maximum allowed size of 50MB", 413));
        }
        return next(new AppError(err.message || "File upload error", 400));
      }
      // Handle fileFilter errors (validation errors)
      if (err.message && (err.message.includes("size") || err.message.includes("File size"))) {
        return next(new AppError(err.message, 413));
      }
      if (err.message && (err.message.includes("type") || err.message.includes("File type") || err.message.includes("extension"))) {
        return next(new AppError(err.message, 400));
      }
      // Generic file upload error
      return next(new AppError(err.message || "File upload error", 400));
    }
    next();
  });
};

// Protected routes (authentication required)
knowledgeRoutes.use(authenticate);
knowledgeRoutes.get("/", getKnowledgeItems);
knowledgeRoutes.get("/:id", getKnowledgeItemById);
knowledgeRoutes.post(
  "/",
  handleUpload,
  validateKnowledgeUpload,
  createKnowledgeItem
);
knowledgeRoutes.patch("/:id", updateKnowledgeItem);
knowledgeRoutes.delete("/:id", deleteKnowledgeItem);

