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

    // Get user's organization name
    const [userData] = await db
      .select({
        organizationName: users.organizationName,
        role: users.role,
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

    // Filter by organization if user is not administrator
    if (userData.role !== "administrator" && userData.organizationName) {
      query = query.where(
        eq(users.organizationName, userData.organizationName)
      ) as any;
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
