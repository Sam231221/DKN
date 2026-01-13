import { Request, Response, NextFunction } from "express";
import { db } from "../db/connection";
import { repositories, users } from "../db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth.middleware";

export const getRepositories = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { regionId } = req.query;
    const user = req.user;
    
    if (!user) {
      throw new AppError("Unauthorized", 401);
    }

    // Get user's region and role
    const [userData] = await db
      .select({
        role: users.role,
        regionId: users.regionId,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (!userData) {
      throw new AppError("User not found", 404);
    }

    // Build query with join to filter by owner's region
    let query = db
      .select({
        id: repositories.id,
        repositoryCode: repositories.repositoryCode,
        name: repositories.name,
        description: repositories.description,
        ownerId: repositories.ownerId,
        storageLocation: repositories.storageLocation,
        encryptionEnabled: repositories.encryptionEnabled,
        retentionPolicy: repositories.retentionPolicy,
        searchIndexStatus: repositories.searchIndexStatus,
        isPublic: repositories.isPublic,
        tags: repositories.tags,
        createdAt: repositories.createdAt,
        updatedAt: repositories.updatedAt,
      })
      .from(repositories)
      .leftJoin(users, eq(repositories.ownerId, users.id));

    const conditions = [];

    // Region-based filtering by owner's region
    if (regionId) {
      const userRole = userData.role;
      const canSeeAllRegions = 
        userRole === "administrator" || 
        userRole === "knowledge_champion" || 
        userRole === "executive_leadership";
      
      if (regionId === "all") {
        if (!canSeeAllRegions) {
          return next(new AppError("Access denied: Global view requires elevated permissions", 403));
        }
        // Show all repositories - no region filter
      } else {
        // Filter by owner's region
        conditions.push(eq(users.regionId, regionId as string));
      }
    } else if (userData.regionId) {
      // Default to user's region if no regionId specified
      const userRole = userData.role;
      const canSeeAllRegions = 
        userRole === "administrator" || 
        userRole === "knowledge_champion" || 
        userRole === "executive_leadership";
      
      if (!canSeeAllRegions) {
        conditions.push(eq(users.regionId, userData.regionId));
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    query = query.orderBy(desc(repositories.createdAt)) as any;
    const allRepositories = await query;

    res.json({
      status: "success",
      data: allRepositories,
    });
  } catch (error: any) {
    console.error("Error fetching repositories:", error);
    // Provide more detailed error information
    if (error?.message?.includes("does not exist") || error?.code === "42P01") {
      return next(
        new AppError(
          "Repositories table does not exist. Please run database migrations: npm run db:migrate",
          500
        )
      );
    }
    next(error);
  }
};

export const getRepositoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const [repository] = await db
      .select()
      .from(repositories)
      .where(eq(repositories.id, id))
      .limit(1);

    if (!repository) {
      return next(new AppError("Repository not found", 404));
    }

    res.json({
      status: "success",
      data: repository,
    });
  } catch (error: any) {
    console.error("Error fetching repository by ID:", error);
    if (error?.message?.includes("does not exist") || error?.code === "42P01") {
      return next(
        new AppError(
          "Repositories table does not exist. Please run database migrations: npm run db:migrate",
          500
        )
      );
    }
    next(error);
  }
};

