import { Request, Response, NextFunction } from "express";
import { db } from "../db/connection";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth.middleware";

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const allUsers = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      avatar: users.avatar,
      points: users.points,
      contributions: users.contributions,
      createdAt: users.createdAt,
    }).from(users);

    res.json({
      status: "success",
      data: allUsers,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        avatar: users.avatar,
        points: users.points,
        contributions: users.contributions,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    res.json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, avatar, role } = req.body;

    // Check if user exists and has permission
    if (req.user?.id !== id && req.user?.role !== "administrator") {
      return next(new AppError("You can only update your own profile", 403));
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (avatar) updateData.avatar = avatar;
    if (role && req.user?.role === "administrator") updateData.role = role;
    updateData.updatedAt = new Date();

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        avatar: users.avatar,
        points: users.points,
        contributions: users.contributions,
      });

    if (!updatedUser) {
      return next(new AppError("User not found", 404));
    }

    res.json({
      status: "success",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

