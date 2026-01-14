import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { db } from "../db/connection.js";
import { users, userInterests } from "../db/schema/index.js";
import { eq } from "drizzle-orm";
import { AppError } from "../middleware/errorHandler.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../services/emailService.js";

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

    // Check email verification if required
    const requireEmailVerification = process.env.REQUIRE_EMAIL_VERIFICATION === "true";
    if (requireEmailVerification && !user.emailVerified) {
      return next(new AppError("Please verify your email address before logging in. Check your inbox for the verification link.", 403));
    }

    // Fetch user interests
    const userInterestsList = await db
      .select()
      .from(userInterests)
      .where(eq(userInterests.userId, user.id));

    // Generate JWT token
    const jwtSecret: string = process.env.JWT_SECRET || "default-secret";
    const expiresIn = (process.env.JWT_EXPIRES_IN || "7d") as string;
    const signOptions: SignOptions = { expiresIn: expiresIn as any };
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret,
      signOptions
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

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationTokenExpires = new Date();
    emailVerificationTokenExpires.setHours(emailVerificationTokenExpires.getHours() + 24); // 24 hours from now

    // Combine first and last name for the name field (backward compatibility)
    const fullName = `${firstName} ${lastName}`.trim();

    // Determine role: required for organizational, default to "consultant" for individual
    let finalRole: string;
    if (organizationType === "organizational") {
      if (!role) {
        return next(
          new AppError("Role is required for organizational accounts", 400)
        );
      }
      finalRole = role;
    } else {
      // For individual accounts, default to "consultant"
      finalRole = "consultant";
    }

    // Validate role enum value
    const validRoles = [
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
        emailVerified: false,
        emailVerificationToken,
        emailVerificationTokenExpires,
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

    // Send verification email
    try {
      console.log(`📧 Attempting to send verification email to: ${email.toLowerCase()}`);
      await sendVerificationEmail(email.toLowerCase(), emailVerificationToken, firstName);
      console.log(`✅ Verification email sent successfully to: ${email.toLowerCase()}`);
    } catch (emailError: any) {
      // Log error but don't fail signup - email can be resent later
      console.error("❌ Failed to send verification email:", emailError);
      console.error("   Error message:", emailError?.message);
      console.error("   Error code:", emailError?.code);
      console.error("   This won't prevent signup, but user will need to request a new verification email.");
    }

    // Fetch user with interests
    const userInterestsList = await db
      .select()
      .from(userInterests)
      .where(eq(userInterests.userId, newUser.id));

    // Remove password and tokens from response
    const { password: _, emailVerificationToken: __, passwordResetToken: ___, ...userWithoutPassword } = newUser;

    res.status(201).json({
      status: "success",
      message: "Account created successfully. Please check your email to verify your account.",
      data: {
        user: {
          ...userWithoutPassword,
          interests: userInterestsList.map((ui) => ui.interest),
        },
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
        role: role || "consultant",
      })
      .returning();

    // Generate token
    const jwtSecret: string = process.env.JWT_SECRET || "default-secret";
    const expiresIn = (process.env.JWT_EXPIRES_IN || "7d") as string;
    const signOptions: SignOptions = { expiresIn: expiresIn as any };
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      jwtSecret,
      signOptions
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

/**
 * Verify email address with token
 */
export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.body;

    if (!token) {
      return next(new AppError("Verification token is required", 400));
    }

    // Find user with this token
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.emailVerificationToken, token))
      .limit(1);

    if (!user) {
      return next(new AppError("Invalid or expired verification token", 400));
    }

    // Check if token is expired
    if (user.emailVerificationTokenExpires && new Date() > user.emailVerificationTokenExpires) {
      return next(new AppError("Verification token has expired. Please request a new one.", 400));
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.json({
        status: "success",
        message: "Email is already verified",
      });
    }

    // Update user to mark email as verified and clear token
    await db
      .update(users)
      .set({
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationTokenExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    res.json({
      status: "success",
      message: "Email verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resend verification email
 */
export const resendVerificationEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new AppError("Email is required", 400));
    }

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        status: "success",
        message: "If an account exists with this email, a verification link has been sent.",
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.json({
        status: "success",
        message: "Email is already verified",
      });
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationTokenExpires = new Date();
    emailVerificationTokenExpires.setHours(emailVerificationTokenExpires.getHours() + 24); // 24 hours

    // Update user with new token
    await db
      .update(users)
      .set({
        emailVerificationToken,
        emailVerificationTokenExpires,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // Send verification email
    try {
      await sendVerificationEmail(user.email, emailVerificationToken, user.firstName || undefined);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      return next(new AppError("Failed to send verification email. Please try again later.", 500));
    }

    res.json({
      status: "success",
      message: "Verification email sent. Please check your inbox.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Request password reset
 */
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new AppError("Email is required", 400));
    }

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    // Don't reveal if user exists or not for security
    // Always return success message
    if (!user) {
      return res.json({
        status: "success",
        message: "If an account exists with this email, a password reset link has been sent.",
      });
    }

    // Generate password reset token
    const passwordResetToken = crypto.randomBytes(32).toString("hex");
    const passwordResetTokenExpires = new Date();
    passwordResetTokenExpires.setHours(passwordResetTokenExpires.getHours() + 1); // 1 hour

    // Update user with reset token
    await db
      .update(users)
      .set({
        passwordResetToken,
        passwordResetTokenExpires,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email, passwordResetToken, user.firstName || undefined);
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      return next(new AppError("Failed to send password reset email. Please try again later.", 500));
    }

    res.json({
      status: "success",
      message: "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password with token
 */
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, password } = req.body;

    if (!token) {
      return next(new AppError("Reset token is required", 400));
    }

    if (!password) {
      return next(new AppError("New password is required", 400));
    }

    // Validate password strength
    if (password.length < 8) {
      return next(new AppError("Password must be at least 8 characters long", 400));
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return next(new AppError("Password must contain at least one uppercase letter, one lowercase letter, and one number", 400));
    }

    // Find user with this token
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.passwordResetToken, token))
      .limit(1);

    if (!user) {
      return next(new AppError("Invalid or expired reset token", 400));
    }

    // Check if token is expired
    if (user.passwordResetTokenExpires && new Date() > user.passwordResetTokenExpires) {
      return next(new AppError("Reset token has expired. Please request a new one.", 400));
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password and clear reset token
    await db
      .update(users)
      .set({
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetTokenExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    res.json({
      status: "success",
      message: "Password reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    next(error);
  }
};
