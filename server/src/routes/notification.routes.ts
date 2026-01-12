import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notification.controller";

export const notificationRoutes = Router();

// All notification routes require authentication
notificationRoutes.use(authenticate);

notificationRoutes.get("/", getNotifications);
notificationRoutes.patch("/:id/read", markAsRead);
notificationRoutes.patch("/read-all", markAllAsRead);

