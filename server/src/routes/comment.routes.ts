import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  getCommentsByKnowledgeItem,
  createComment,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";

export const commentRoutes = Router();

// All comment routes require authentication
commentRoutes.use(authenticate);

// Get all comments for a knowledge item
commentRoutes.get("/knowledge-item/:knowledgeItemId", getCommentsByKnowledgeItem);

// Create a new comment
commentRoutes.post("/knowledge-item/:knowledgeItemId", createComment);

// Update a comment
commentRoutes.patch("/:id", updateComment);

// Delete a comment
commentRoutes.delete("/:id", deleteComment);
