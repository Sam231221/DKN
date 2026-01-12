import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  getRepositories,
  getRepositoryById,
} from "../controllers/repository.controller";

export const repositoryRoutes = Router();

// All repository routes require authentication
repositoryRoutes.use(authenticate);
repositoryRoutes.get("/", getRepositories);
repositoryRoutes.get("/:id", getRepositoryById);
