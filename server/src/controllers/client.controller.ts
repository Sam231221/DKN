import { Request, Response, NextFunction } from "express";
import { db } from "../db/connection";
import { clients, users } from "../db/schema";
import { eq, and, or, ilike } from "drizzle-orm";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth.middleware";

export const getClients = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    if (!user) {
      throw new AppError("Unauthorized", 401);
    }

    const { regionId } = req.query;

    // Get user's organization name and region
    const [userData] = await db
      .select({
        organizationName: users.organizationName,
        role: users.role,
        regionId: users.regionId,
      })
      .from(users)
      .where(eq(users.id, user.id));

    if (!userData) {
      throw new AppError("User not found", 404);
    }

    // Build query with organization filtering
    let query = db
      .select({
        id: clients.id,
        name: clients.name,
        industry: clients.industry,
        regionId: clients.regionId,
        userId: clients.userId,
        createdAt: clients.createdAt,
        updatedAt: clients.updatedAt,
        // Get user email from related user
        email: users.email,
      })
      .from(clients)
      .leftJoin(users, eq(clients.userId, users.id));

    const conditions = [];

    // Filter by organization if user is not administrator
    if (userData.role !== "administrator" && userData.organizationName) {
      conditions.push(eq(users.organizationName, userData.organizationName));
    }

    // Region-based filtering
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
        // Show all clients - no region filter
      } else {
        // Filter by specific region
        conditions.push(eq(clients.regionId, regionId as string));
      }
    } else if (userData.regionId) {
      // Default to user's region if no regionId specified
      const userRole = userData.role;
      const canSeeAllRegions = 
        userRole === "administrator" || 
        userRole === "knowledge_champion" || 
        userRole === "executive_leadership";
      
      if (!canSeeAllRegions) {
        conditions.push(eq(clients.regionId, userData.regionId));
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const allClients = await query;

    res.json({
      status: "success",
      data: allClients,
    });
  } catch (error) {
    next(error);
  }
};

export const getClientById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const [client] = await db
      .select({
        id: clients.id,
        name: clients.name,
        industry: clients.industry,
        regionId: clients.regionId,
        userId: clients.userId,
        createdAt: clients.createdAt,
        updatedAt: clients.updatedAt,
      })
      .from(clients)
      .where(eq(clients.id, id));

    if (!client) {
      throw new AppError("Client not found", 404);
    }

    res.json({
      status: "success",
      data: client,
    });
  } catch (error) {
    next(error);
  }
};
