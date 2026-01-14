import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  getRepositories,
  getRepositoryById,
} from "../controllers/repository.controller.js";

export const repositoryRoutes = Router();

// All repository routes require authentication
repositoryRoutes.use(authenticate);
repositoryRoutes.get("/", getRepositories);
repositoryRoutes.get("/:id", getRepositoryById);
