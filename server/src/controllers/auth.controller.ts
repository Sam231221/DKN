import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db/connection";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { AppError } from "../middleware/errorHandler";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      return next(new AppError("Email, password, and name are required", 400));
    }

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return next(new AppError("User with this email already exists", 409));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        name,
        role: role || "client",
      })
      .returning();

    // Generate token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || "default-secret",
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      status: "success",
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("Email and password are required", 400));
    }

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new AppError("Invalid email or password", 401));
    }

    if (!user.isActive) {
      return next(new AppError("Account is deactivated", 403));
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "default-secret",
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      status: "success",
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

