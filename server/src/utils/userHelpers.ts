import { db } from "../db/connection.js";
import { users } from "../db/schema/index.js";
import { eq } from "drizzle-orm";
import { AppError } from "../middleware/errorHandler.js";

/**
 * Get user's organization name from database
 * This is needed because JWT tokens don't include organizationName
 */
export async function getUserOrganizationName(userId: string): Promise<string | null> {
  try {
    const [user] = await db
      .select({ organizationName: users.organizationName })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return user?.organizationName || null;
  } catch (error) {
    console.error("Error fetching user organization:", error);
    return null;
  }
}

/**
 * Get full user data from database
 */
export async function getUserData(userId: string) {
  try {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        organizationName: users.organizationName,
        organizationType: users.organizationType,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error("Error fetching user data:", error);
    throw new AppError("Failed to fetch user data", 500);
  }
}

