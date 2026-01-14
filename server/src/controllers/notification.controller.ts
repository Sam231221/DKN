import { Response, NextFunction } from "express";
import { AppError } from "../middleware/errorHandler.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notificationService.js";

/**
 * Get all notifications for the authenticated user
 */
export const getNotifications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    const notifications = await getUserNotifications(req.user.id);

    res.json({
      status: "success",
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a notification as read
 */
export const markAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    const { id } = req.params;

    await markNotificationAsRead(id, req.user.id);

    res.json({
      status: "success",
      message: "Notification marked as read",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read for the authenticated user
 */
export const markAllAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    await markAllNotificationsAsRead(req.user.id);

    res.json({
      status: "success",
      message: "All notifications marked as read",
    });
  } catch (error) {
    next(error);
  }
};

