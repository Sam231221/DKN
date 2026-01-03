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

knowledgeRoutes.use(authenticate);

knowledgeRoutes.get("/", getKnowledgeItems);
knowledgeRoutes.get("/:id", getKnowledgeItemById);
knowledgeRoutes.post("/", createKnowledgeItem);
knowledgeRoutes.patch("/:id", updateKnowledgeItem);
knowledgeRoutes.delete("/:id", deleteKnowledgeItem);

