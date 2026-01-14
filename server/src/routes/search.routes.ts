import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { unifiedSearch } from "../controllers/search.controller.js";

export const searchRoutes = Router();

searchRoutes.use(authenticate);

searchRoutes.get("/", unifiedSearch);
