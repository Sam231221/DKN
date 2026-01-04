import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  getKnowledgeItems,
  getKnowledgeItemById,
  createKnowledgeItem,
  updateKnowledgeItem,
  deleteKnowledgeItem,
} from "../controllers/knowledge.controller";

export const knowledgeRoutes = Router();

// Public routes (no authentication required)
knowledgeRoutes.get("/", getKnowledgeItems);
knowledgeRoutes.get("/:id", getKnowledgeItemById);

// Protected routes (authentication required)
knowledgeRoutes.use(authenticate);
knowledgeRoutes.post("/", createKnowledgeItem);
knowledgeRoutes.patch("/:id", updateKnowledgeItem);
knowledgeRoutes.delete("/:id", deleteKnowledgeItem);

