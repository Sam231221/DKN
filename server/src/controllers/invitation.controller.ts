import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { db } from "../db/connection";
import { users, invitations, userInterests } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth.middleware";
import { sendInvitationEmail } from "../services/emailService";
import { createId } from "@paralleldrive/cuid2";

/**
 * Create a single invitation (admin/consultant creates account for employee)
 */
export const createInvitation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    // Only administrators and consultants can create invitations
    if (req.user.role !== "administrator" && req.user.role !== "consultant") {
      return next(
        new AppError("You do not have permission to create invitations", 403)
      );
    }

    const { email, role, organizationName } = req.body;

    if (!email) {
      return next(new AppError("Email is required", 400));
    }

    // Get inviter's organization name if not provided
    const [inviter] = await db
      .select({ organizationName: users.organizationName, name: users.name })
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1);

    const finalOrganizationName = organizationName || inviter?.organizationName || null;

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingUser.length > 0) {
      return next(new AppError("User with this email already exists", 409));
    }

    // Check if invitation already exists and is not accepted
    const existingInvitation = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.email, email.toLowerCase()),
          eq(invitations.accepted, false)
        )
      )
      .limit(1);

    if (existingInvitation.length > 0) {
      return next(
        new AppError("An active invitation already exists for this email", 409)
      );
    }

    // Generate invitation token
    const token = createId();

    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create invitation
    const [invitation] = await db
      .insert(invitations)
      .values({
        email: email.toLowerCase(),
        token,
        organizationName: finalOrganizationName,
        role: role || "employee",
        invitedBy: req.user.id,
        expiresAt,
      })
      .returning();

    // Send invitation email
    try {
      await sendInvitationEmail(
        email,
        token,
        finalOrganizationName || undefined,
        inviter?.name || undefined
      );
    } catch (error) {
      console.error("Error sending invitation email:", error);
      // Continue even if email fails
    }

    res.status(201).json({
      status: "success",
      data: {
        invitation: {
          id: invitation.id,
          email: invitation.email,
          expiresAt: invitation.expiresAt,
        },
      },
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Create multiple invitations (bulk invite)
 */
export const createBulkInvitations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    // Only administrators and consultants can create invitations
    if (req.user.role !== "administrator" && req.user.role !== "consultant") {
      return next(
        new AppError("You do not have permission to create invitations", 403)
      );
    }

    const { emails, role, organizationName } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return next(new AppError("Emails array is required", 400));
    }

    // Get inviter's organization name if not provided
    const [inviter] = await db
      .select({ organizationName: users.organizationName, name: users.name })
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1);

    const finalOrganizationName = organizationName || inviter?.organizationName || null;

    const results = {
      successful: [] as Array<{ email: string; invitationId: string }>,
      failed: [] as Array<{ email: string; reason: string }>,
    };

    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Process each email
    for (const email of emails) {
      try {
        const emailLower = email.toLowerCase().trim();

        if (!emailLower) {
          results.failed.push({ email, reason: "Invalid email format" });
          continue;
        }

        // Check if user already exists
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.email, emailLower))
          .limit(1);

        if (existingUser.length > 0) {
          results.failed.push({
            email,
            reason: "User already exists",
          });
          continue;
        }

        // Check if invitation already exists
        const existingInvitation = await db
          .select()
          .from(invitations)
          .where(
            and(
              eq(invitations.email, emailLower),
              eq(invitations.accepted, false)
            )
          )
          .limit(1);

        if (existingInvitation.length > 0) {
          results.failed.push({
            email,
            reason: "Active invitation already exists",
          });
          continue;
        }

        // Generate invitation token
        const token = createId();

        // Create invitation
        const [invitation] = await db
          .insert(invitations)
          .values({
            email: emailLower,
            token,
            organizationName: finalOrganizationName,
            role: role || "employee",
            invitedBy: req.user.id,
            expiresAt,
          })
          .returning();

        // Send invitation email
        try {
          await sendInvitationEmail(
            email,
            token,
            finalOrganizationName || undefined,
            inviter?.name || undefined
          );
        } catch (error) {
          console.error(`Error sending invitation email to ${email}:`, error);
          // Continue even if email fails
        }

        results.successful.push({
          email,
          invitationId: invitation.id,
        });
      } catch (error: any) {
        results.failed.push({
          email,
          reason: error.message || "Failed to create invitation",
        });
      }
    }

    res.status(201).json({
      status: "success",
      data: results,
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Activate account via invitation token
 */
export const activateAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;
    const { password, firstName, lastName, username, address, experienceLevel, interests } = req.body;

    if (!token) {
      return next(new AppError("Invitation token is required", 400));
    }

    if (!password) {
      return next(new AppError("Password is required", 400));
    }

    // Find invitation
    const [invitation] = await db
      .select()
      .from(invitations)
      .where(eq(invitations.token, token))
      .limit(1);

    if (!invitation) {
      return next(new AppError("Invalid invitation token", 404));
    }

    if (invitation.accepted) {
      return next(new AppError("This invitation has already been used", 409));
    }

    if (new Date(invitation.expiresAt) < new Date()) {
      return next(new AppError("This invitation has expired", 410));
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, invitation.email))
      .limit(1);

    if (existingUser.length > 0) {
      return next(new AppError("User with this email already exists", 409));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user account
    const [newUser] = await db
      .insert(users)
      .values({
        email: invitation.email,
        password: hashedPassword,
        name: `${firstName || ""} ${lastName || ""}`.trim() || invitation.email.split("@")[0],
        firstName: firstName || null,
        lastName: lastName || null,
        username: username || null,
        address: address || null,
        experienceLevel: experienceLevel || null,
        role: invitation.role || "employee",
        organizationType: invitation.organizationName ? "organizational" : "individual",
        organizationName: invitation.organizationName || null,
      })
      .returning();

    // Mark invitation as accepted
    await db
      .update(invitations)
      .set({
        accepted: true,
        acceptedAt: new Date(),
      })
      .where(eq(invitations.id, invitation.id));

    // Insert user interests if provided
    if (interests && Array.isArray(interests) && interests.length > 0) {
      const interestRecords = interests.map((interest: string) => ({
        userId: newUser.id,
        interest: interest.trim(),
      }));

      await db.insert(userInterests).values(interestRecords);
    }

    // Generate JWT token
    const jwtSecret: string = process.env.JWT_SECRET || "default-secret";
    const expiresIn = (process.env.JWT_EXPIRES_IN || "7d") as string;
    const signOptions: SignOptions = { expiresIn: expiresIn as any };
    const jwtToken = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      jwtSecret,
      signOptions
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
        token: jwtToken,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Get invitation by token (for validation before showing activation form)
 */
export const getInvitation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;

    const [invitation] = await db
      .select({
        id: invitations.id,
        email: invitations.email,
        organizationName: invitations.organizationName,
        role: invitations.role,
        expiresAt: invitations.expiresAt,
        accepted: invitations.accepted,
      })
      .from(invitations)
      .where(eq(invitations.token, token))
      .limit(1);

    if (!invitation) {
      return next(new AppError("Invalid invitation token", 404));
    }

    if (invitation.accepted) {
      return next(new AppError("This invitation has already been used", 409));
    }

    if (new Date(invitation.expiresAt) < new Date()) {
      return next(new AppError("This invitation has expired", 410));
    }

    res.json({
      status: "success",
      data: invitation,
    });
  } catch (error: any) {
    next(error);
  }
};

