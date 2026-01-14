import { Response, NextFunction } from "express";
import { db } from "../db/connection.js";
import { regions, users } from "../db/schema/index.js";
import { eq } from "drizzle-orm";
import { AppError } from "../middleware/errorHandler.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

/**
 * Get available regional offices for the current user
 * - Administrators and Knowledge Champions see all regions
 * - Others see only their assigned region
 */
export const getAvailableRegionalOffices = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    // Get user's role and region
    const [userData] = await db
      .select({
        role: users.role,
        regionId: users.regionId,
      })
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1);

    if (!userData) {
      return next(new AppError("User not found in database. Please log in again or ensure the database is seeded.", 404));
    }

    // Administrators, Knowledge Champions, and Executive Leadership can see all regions
    const canSeeAllRegions = 
      userData.role === "administrator" ||
      userData.role === "knowledge_champion" ||
      userData.role === "executive_leadership";

    let query = db.select().from(regions);

    // Filter by user's region if they can't see all regions
    if (!canSeeAllRegions && userData.regionId) {
      query = query.where(eq(regions.id, userData.regionId)) as any;
    }

    const availableRegions = await query;

    // Transform to RegionalOffice format
    // name is the branch name, region is the region name
    const regionalOffices = availableRegions.map((region) => ({
      id: region.id,
      name: region.name, // Branch name
      region: region.region || region.name, // Region name, fallback to name if not set
      connectivityStatus: region.connectivityStatus,
      dataProtectionLaws: region.dataProtectionLaws || [],
    }));

    res.json({
      status: "success",
      data: regionalOffices,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get regional office details by ID
 */
export const getRegionalOfficeById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    const { id } = req.params;

    const [region] = await db
      .select()
      .from(regions)
      .where(eq(regions.id, id))
      .limit(1);

    if (!region) {
      return next(new AppError("Regional office not found", 404));
    }

    // Check if user has access to this region
    const [userData] = await db
      .select({
        role: users.role,
        regionId: users.regionId,
      })
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1);

    if (!userData) {
      return next(new AppError("User not found in database. Please log in again or ensure the database is seeded.", 404));
    }

    const canSeeAllRegions = 
      userData.role === "administrator" ||
      userData.role === "knowledge_champion" ||
      userData.role === "executive_leadership";

    // Check access
    if (!canSeeAllRegions && userData.regionId !== region.id) {
      return next(new AppError("Access denied to this regional office", 403));
    }

    const regionalOffice = {
      id: region.id,
      name: region.name, // Branch name
      region: region.region || region.name, // Region name, fallback to name if not set
      connectivityStatus: region.connectivityStatus,
      dataProtectionLaws: region.dataProtectionLaws || [],
    };

    res.json({
      status: "success",
      data: regionalOffice,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all regions (admin only)
 */
export const getAllRegions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    // Check if user is administrator
    const [userData] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1);

    if (!userData || userData.role !== "administrator") {
      return next(new AppError("Administrator access required", 403));
    }

    const allRegions = await db.select().from(regions);

    res.json({
      status: "success",
      data: allRegions,
    });
  } catch (error) {
    next(error);
  }
};
