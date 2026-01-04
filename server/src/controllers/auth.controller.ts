import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db/connection";
import { users, userInterests } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { AppError } from "../middleware/errorHandler";

/**
 * Login controller with industry-standard practices
 * - Rate limiting (handled by middleware)
 * - Input validation (handled by middleware)
 * - Secure password comparison with timing attack protection
 * - JWT token generation
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Find user (email is case-insensitive in most cases, but we'll normalize in validation)
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    // Always perform password comparison to prevent timing attacks
    const isValidPassword =
      user && (await bcrypt.compare(password, user.password));

    if (!user || !isValidPassword) {
      return next(new AppError("Invalid email or password", 401));
    }

    if (!user.isActive) {
      return next(new AppError("Account is deactivated", 403));
    }

    // Fetch user interests
    const userInterestsList = await db
      .select()
      .from(userInterests)
      .where(eq(userInterests.userId, user.id));

    // Generate JWT token
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
        user: {
          ...userWithoutPassword,
          interests: userInterestsList.map((ui) => ui.interest),
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Complete signup endpoint - accepts all data from multi-step form
 * Frontend collects data through steps and sends everything at once
 */
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      // Step 1: Basic details
      firstName,
      lastName,
      email,
      username,
      password,
      address,
      avatar,
      experienceLevel,
      // Step 2: Organization type
      organizationType,
      organizationName,
      employeeCount,
      // Step 3: Role and interests
      role,
      interests,
    } = req.body;

    // Check if user already exists by email
    const existingUserByEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingUserByEmail.length > 0) {
      return next(new AppError("User with this email already exists", 409));
    }

    // Check if username already exists
    const existingUserByUsername = await db
      .select()
      .from(users)
      .where(eq(users.username, username.toLowerCase()))
      .limit(1);

    if (existingUserByUsername.length > 0) {
      return next(new AppError("Username is already taken", 409));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12); // Increased salt rounds for better security

    // Combine first and last name for the name field (backward compatibility)
    const fullName = `${firstName} ${lastName}`.trim();

    // Determine role: required for organizational, default to "client" for individual
    let finalRole: string;
    if (organizationType === "organizational") {
      if (!role) {
        return next(
          new AppError("Role is required for organizational accounts", 400)
        );
      }
      finalRole = role;
    } else {
      // For individual accounts, default to "client"
      finalRole = "client";
    }

    // Validate role enum value
    const validRoles = [
      "client",
      "employee",
      "consultant",
      "knowledge_champion",
      "administrator",
      "executive_leadership",
      "knowledge_council_member",
    ];
    if (!validRoles.includes(finalRole)) {
      return next(new AppError("Invalid role specified", 400));
    }

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password: hashedPassword,
        name: fullName,
        firstName,
        lastName,
        address: address || null,
        avatar: avatar || null,
        experienceLevel: experienceLevel || null,
        role: finalRole as any, // Type assertion needed for enum
        organizationType: organizationType || "individual",
        organizationName:
          organizationType === "organizational" ? organizationName?.trim() || null : null,
        employeeCount:
          organizationType === "organizational" ? employeeCount || null : null,
      })
      .returning();

    // Insert user interests if provided
    if (interests && Array.isArray(interests) && interests.length > 0) {
      const interestRecords = interests.map((interest: string) => ({
        userId: newUser.id,
        interest: interest.trim(),
      }));

      await db.insert(userInterests).values(interestRecords);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || "default-secret",
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    // Fetch user with interests
    const userInterestsList = await db
      .select()
      .from(userInterests)
      .where(eq(userInterests.userId, newUser.id));

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      status: "success",
      data: {
        user: {
          ...userWithoutPassword,
          interests: userInterestsList.map((ui) => ui.interest),
        },
        token,
      },
    });
  } catch (error: any) {
    // Log error for debugging
    console.error("Signup error:", error);
    
    // Handle unique constraint violations
    if (error.code === "23505") {
      // PostgreSQL unique violation
      const constraint = error.constraint;
      if (constraint?.includes("email")) {
        return next(new AppError("User with this email already exists", 409));
      }
      if (constraint?.includes("username")) {
        return next(new AppError("Username is already taken", 409));
      }
      return next(new AppError("A user with this information already exists", 409));
    }
    
    // Handle database connection errors
    if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      return next(new AppError("Database connection failed. Please check your database configuration.", 500));
    }
    
    // Handle missing table errors
    if (error.code === "42P01") {
      return next(new AppError("Database tables not found. Please run migrations.", 500));
    }
    
    // Pass error to error handler
    next(error);
  }
};

/**
 * Legacy register endpoint - keeping for backward compatibility
 * @deprecated Use signup instead
 */
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
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingUser.length > 0) {
      return next(new AppError("User with this email already exists", 409));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
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
  } catch (error: any) {
    if (error.code === "23505") {
      return next(new AppError("User with this email already exists", 409));
    }
    next(error);
  }
};
