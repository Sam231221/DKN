import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  getAvailableRegionalOffices,
  getRegionalOfficeById,
  getAllRegions,
} from "../controllers/region.controller.js";

export const regionRoutes = Router();

regionRoutes.use(authenticate);

// Get available regional offices for current user
regionRoutes.get("/offices", getAvailableRegionalOffices);

// Get all regions (admin only)
regionRoutes.get("/", getAllRegions);

// Get regional office by ID
regionRoutes.get("/offices/:id", getRegionalOfficeById);
