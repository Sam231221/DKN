import { Request, Response, NextFunction } from "express";
import { db } from "../db/connection.js";
import {
  activityFeed,
  users,
  knowledgeItems,
  comments,
  projects,
} from "../db/schema/index.js";
import { eq, and, desc, sql } from "drizzle-orm";
import { AppError } from "../middleware/errorHandler.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

// Get global activity feed
export const getActivityFeed = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    const { limit = 50, projectId } = req.query;

    let query = db
      .select({
        id: activityFeed.id,
        type: activityFeed.type,
        title: activityFeed.title,
        description: activityFeed.description,
        relatedId: activityFeed.relatedId,
        relatedType: activityFeed.relatedType,
        createdAt: activityFeed.createdAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatar: users.avatar,
          role: users.role,
        },
      })
      .from(activityFeed)
      .leftJoin(users, eq(activityFeed.userId, users.id))
      .orderBy(desc(activityFeed.createdAt))
      .limit(Number(limit));

    // Filter by project if provided
    if (projectId) {
      query = query.where(eq(activityFeed.projectId, projectId as string)) as any;
    }

    const activities = await query;

    res.json({
      status: "success",
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

// Create activity feed entry (helper function, can be called from other controllers)
export const createActivityFeedEntry = async (
  userId: string,
  type: string,
  title: string,
  description: string,
  relatedId?: string,
  relatedType?: string,
  projectId?: string
) => {
  try {
    await db.insert(activityFeed).values({
      userId,
      type,
      title,
      description,
      relatedId: relatedId || null,
      relatedType: relatedType || null,
      projectId: projectId || null,
    });
  } catch (error) {
    console.error("Error creating activity feed entry:", error);
    // Don't throw - activity feed is non-critical
  }
};

// Get user's activity feed
export const getUserActivityFeed = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    const { limit = 50 } = req.query;

    const activities = await db
      .select({
        id: activityFeed.id,
        type: activityFeed.type,
        title: activityFeed.title,
        description: activityFeed.description,
        relatedId: activityFeed.relatedId,
        relatedType: activityFeed.relatedType,
        createdAt: activityFeed.createdAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatar: users.avatar,
          role: users.role,
        },
      })
      .from(activityFeed)
      .leftJoin(users, eq(activityFeed.userId, users.id))
      .where(eq(activityFeed.userId, req.user.id))
      .orderBy(desc(activityFeed.createdAt))
      .limit(Number(limit));

    res.json({
      status: "success",
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};
