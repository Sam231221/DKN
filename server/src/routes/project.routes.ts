import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { getProjects, getProjectById } from "../controllers/project.controller";

export const projectRoutes = Router();

projectRoutes.use(authenticate);

projectRoutes.get("/", getProjects);
projectRoutes.get("/:id", getProjectById);
