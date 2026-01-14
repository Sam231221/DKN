import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  getActivityFeed,
  getUserActivityFeed,
} from "../controllers/activity.controller.js";

export const activityRoutes = Router();

// All activity routes require authentication
activityRoutes.use(authenticate);

// Get global activity feed
activityRoutes.get("/", getActivityFeed);

// Get user's activity feed
activityRoutes.get("/user", getUserActivityFeed);
