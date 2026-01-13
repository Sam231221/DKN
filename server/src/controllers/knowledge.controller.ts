import { Request, Response, NextFunction } from "express";
import { db } from "../db/connection";
import {
  knowledgeItems,
  users,
  repositories,
  contributions,
} from "../db/schema";
import { eq, and, or, ilike, sql, isNull } from "drizzle-orm";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  uploadFile,
  generateFileName,
  validateFile as validateFileUtil,
} from "../utils/fileStorage";
import { detectDuplicates } from "../services/nlpService";
import { checkCompliance } from "../services/complianceService";
import {
  sendUploadNotification,
  sendReviewNotification,
  sendApprovalNotification,
  sendRejectionNotification,
  sendOrganizationNotification,
} from "../services/notificationService";
import { getUserOrganizationName } from "../utils/userHelpers";

export const getKnowledgeItems = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { type, status, search, repositoryId, regionId } = req.query;

    // Get user's organization name and region for filtering
    let userOrganizationName: string | null = null;
    let userRegionId: string | null = null;
    if (req.user) {
      userOrganizationName = await getUserOrganizationName(req.user.id);
      const [userData] = await db
        .select({ regionId: users.regionId, role: users.role })
        .from(users)
        .where(eq(users.id, req.user.id))
        .limit(1);
      userRegionId = userData?.regionId || null;
    }

    let query = db
      .select({
        id: knowledgeItems.id,
        title: knowledgeItems.title,
        description: knowledgeItems.description,
        content: knowledgeItems.content,
        type: knowledgeItems.type,
        status: knowledgeItems.status,
        tags: knowledgeItems.tags,
        views: knowledgeItems.views,
        likes: knowledgeItems.likes,
        isPublished: knowledgeItems.isPublished,
        createdAt: knowledgeItems.createdAt,
        updatedAt: knowledgeItems.updatedAt,
        repositoryId: knowledgeItems.repositoryId,
        authorId: knowledgeItems.authorId,
        validatedBy: knowledgeItems.validatedBy,
        validatedAt: knowledgeItems.validatedAt,
        fileUrl: knowledgeItems.fileUrl,
        fileName: knowledgeItems.fileName,
        fileSize: knowledgeItems.fileSize,
        fileType: knowledgeItems.fileType,
        duplicateDetected: knowledgeItems.duplicateDetected,
        similarItems: knowledgeItems.similarItems,
        complianceChecked: knowledgeItems.complianceChecked,
        complianceViolations: knowledgeItems.complianceViolations,
        author: {
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          organizationName: users.organizationName,
        },
        repository: {
          id: repositories.id,
          name: repositories.name,
          description: repositories.description,
        },
      })
      .from(knowledgeItems)
      .leftJoin(users, eq(knowledgeItems.authorId, users.id))
      .leftJoin(repositories, eq(knowledgeItems.repositoryId, repositories.id));

    const conditions = [];

    // Organization-based filtering
    // Only show items from user's organization (unless user is administrator)
    if (req.user && userOrganizationName) {
      const userRole = req.user.role;
      // Administrators can see all items
      if (userRole !== "administrator" && userRole !== "knowledge_champion" && userRole !== "executive_leadership") {
        // Filter by organization name - items created by users in the same organization
        conditions.push(eq(users.organizationName, userOrganizationName));
      }
    } else if (req.user) {
      // If user has no organization, they can only see items from users with no organization
      conditions.push(isNull(users.organizationName));
    }

    // Region-based filtering
    if (req.user && regionId) {
      const userRole = req.user.role;
      const canSeeAllRegions = 
        userRole === "administrator" || 
        userRole === "knowledge_champion" || 
        userRole === "executive_leadership";
      
      if (regionId === "all") {
        // Only admins, knowledge champions, and executive leadership can see all regions
        if (!canSeeAllRegions) {
          return next(new AppError("Access denied: Global view requires elevated permissions", 403));
        }
        // No region filter applied - show all regions
      } else {
        // Filter by specific region using regionId directly
        conditions.push(eq(users.regionId, regionId as string));
      }
    } else if (req.user && userRegionId) {
      // Default to user's region if no regionId specified
      const userRole = req.user.role;
      const canSeeAllRegions = 
        userRole === "administrator" || 
        userRole === "knowledge_champion" || 
        userRole === "executive_leadership";
      
      if (!canSeeAllRegions) {
        conditions.push(eq(users.regionId, userRegionId));
      }
    }

    // Type filter with proper enum casting
    if (type) {
      conditions.push(
        eq(
          knowledgeItems.type,
          type as (typeof knowledgeItems.type.enumValues)[number]
        )
      );
    }

    // Status filter with proper enum casting
    if (status) {
      conditions.push(
        eq(
          knowledgeItems.status,
          status as (typeof knowledgeItems.status.enumValues)[number]
        )
      );
    }

    if (repositoryId) {
      conditions.push(eq(knowledgeItems.repositoryId, repositoryId as string));
    }

    if (search) {
      conditions.push(
        or(
          ilike(knowledgeItems.title, `%${search}%`),
          ilike(knowledgeItems.description, `%${search}%`)
        )!
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const items = await query.orderBy(sql`${knowledgeItems.createdAt} DESC`);

    res.json({
      status: "success",
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

export const getKnowledgeItemById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const [item] = await db
      .select({
        id: knowledgeItems.id,
        title: knowledgeItems.title,
        description: knowledgeItems.description,
        content: knowledgeItems.content,
        type: knowledgeItems.type,
        status: knowledgeItems.status,
        tags: knowledgeItems.tags,
        views: knowledgeItems.views,
        likes: knowledgeItems.likes,
        isPublished: knowledgeItems.isPublished,
        createdAt: knowledgeItems.createdAt,
        updatedAt: knowledgeItems.updatedAt,
        repositoryId: knowledgeItems.repositoryId,
        authorId: knowledgeItems.authorId,
        validatedBy: knowledgeItems.validatedBy,
        validatedAt: knowledgeItems.validatedAt,
        fileUrl: knowledgeItems.fileUrl,
        fileName: knowledgeItems.fileName,
        fileSize: knowledgeItems.fileSize,
        fileType: knowledgeItems.fileType,
        duplicateDetected: knowledgeItems.duplicateDetected,
        complianceChecked: knowledgeItems.complianceChecked,
        complianceViolations: knowledgeItems.complianceViolations,
        similarItems: knowledgeItems.similarItems,
        author: {
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
        },
        repository: {
          id: repositories.id,
          name: repositories.name,
          description: repositories.description,
        },
      })
      .from(knowledgeItems)
      .leftJoin(users, eq(knowledgeItems.authorId, users.id))
      .leftJoin(repositories, eq(knowledgeItems.repositoryId, repositories.id))
      .where(eq(knowledgeItems.id, id))
      .limit(1);

    if (!item) {
      return next(new AppError("Knowledge item not found", 404));
    }

    res.json({
      status: "success",
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export const createKnowledgeItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, description, content, type, repositoryId, tags } = req.body;
    const file = (req as any).file; // File from multer

    if (!title || (!content && !file)) {
      return next(
        new AppError("Title and either content or file are required", 400)
      );
    }

    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    let fileUrl: string | null = null;
    let fileName: string | null = null;
    let fileSize: number | null = null;
    let fileType: string | null = null;

    // Handle file upload if file is provided
    if (file) {
      // Validate file
      const validation = validateFileUtil(
        file.size,
        file.mimetype,
        file.originalname
      );

      if (!validation.valid) {
        return next(new AppError(validation.error || "Invalid file", 400));
      }

      try {
        // Generate unique filename
        fileName = generateFileName(file.originalname, req.user.id);

        // Upload file
        fileUrl = await uploadFile(file.buffer, fileName);
        fileSize = file.size;
        fileType = file.mimetype;
      } catch (error: any) {
        return next(new AppError(`File upload failed: ${error.message}`, 500));
      }
    }

    // Prepare content (use file content or text content)
    const itemContent = content || (file ? file.originalname : "");

    // Run duplicate detection (async, don't block)
    let duplicateResult: {
      isDuplicate: boolean;
      similarItems: string[];
      similarityScores: Array<{ id: string; title: string; score: number }>;
    } = { isDuplicate: false, similarItems: [], similarityScores: [] };
    let complianceResult: { compliant: boolean; violations: string[] } = {
      compliant: true,
      violations: [],
    };

    try {
      duplicateResult = await detectDuplicates(title, itemContent);
    } catch (error) {
      console.error("Duplicate detection error:", error);
      // Continue even if duplicate detection fails
    }

    try {
      // Get user's region for compliance check
      let userRegionName: string | null = null;
      if (req.user) {
        const [userData] = await db
          .select({ regionId: users.regionId })
          .from(users)
          .where(eq(users.id, req.user.id))
          .limit(1);
        
        if (userData?.regionId) {
          const { regions } = await import("../db/schema");
          const [region] = await db
            .select({ name: regions.name })
            .from(regions)
            .where(eq(regions.id, userData.regionId))
            .limit(1);
          userRegionName = region?.name || null;
        }
      }
      
      // Check compliance (async, don't block)
      complianceResult = await checkCompliance(
        title,
        itemContent,
        userRegionName
      );
    } catch (error) {
      console.error("Compliance check error:", error);
      // Continue even if compliance check fails
    }

    // Create knowledge item with status 'pending_review'
    const [newItem] = await db
      .insert(knowledgeItems)
      .values({
        title,
        description: description || null,
        content: itemContent,
        type: type || "documentation",
        repositoryId: repositoryId || null,
        authorId: req.user.id,
        tags: tags || [],
        status: "pending_review", // Set status to pending_review as per use case
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        fileSize: fileSize || null,
        fileType: fileType || null,
        duplicateDetected: duplicateResult.isDuplicate,
        similarItems: duplicateResult.similarItems,
        complianceChecked: true,
        complianceViolations:
          complianceResult.violations.length > 0
            ? complianceResult.violations
            : null,
      })
      .returning();

    // Track contribution
    try {
      await db.insert(contributions).values({
        userId: req.user.id,
        knowledgeItemId: newItem.id,
        type: "created",
        points: 10, // Award points for creating knowledge item
      });
    } catch (error) {
      console.error("Error tracking contribution:", error);
      // Continue even if contribution tracking fails
    }

    // Send notifications (async, don't block)
    try {
      await sendUploadNotification(req.user.id, newItem.id, title);

      // Get user data for notifications
      const [userData] = await db
        .select({
          name: users.name,
          organizationName: users.organizationName,
        })
        .from(users)
        .where(eq(users.id, req.user.id))
        .limit(1);

      if (userData) {
        // Send review notification to knowledge champions/administrators
        await sendReviewNotification(newItem.id, title, userData.name);

        // Send organization notification if user belongs to an organization
        if (userData.organizationName) {
          await sendOrganizationNotification(
            userData.organizationName,
            newItem.id,
            title,
            `New knowledge item "${title}" has been created in your organization and is pending review.`
          );
        }
      }
    } catch (error) {
      console.error("Error sending notifications:", error);
      // Continue even if notifications fail
    }

    // Prepare response with warnings and similar items
    const warnings: string[] = [];
    const response: any = {
      status: "success",
      data: newItem,
    };

    if (
      duplicateResult.isDuplicate &&
      duplicateResult.similarItems.length > 0
    ) {
      warnings.push(
        `Potential duplicate detected. ${duplicateResult.similarItems.length} similar item(s) found.`
      );
      // Include similar items with their details
      response.similarItems = duplicateResult.similarityScores
        .slice(0, 5)
        .map((item) => ({
          id: item.id,
          title: item.title,
          score: item.score,
        }));
    }
    if (!complianceResult.compliant && complianceResult.violations.length > 0) {
      warnings.push(
        `Compliance violations detected: ${complianceResult.violations.length} issue(s) found.`
      );
      response.complianceViolations = complianceResult.violations;
    }

    if (warnings.length > 0) {
      response.warnings = warnings;
    }

    res.status(201).json(response);
  } catch (error: any) {
    next(error);
  }
};

export const updateKnowledgeItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { title, description, content, tags, status } = req.body;

    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    // Check if item exists
    const [existingItem] = await db
      .select()
      .from(knowledgeItems)
      .where(eq(knowledgeItems.id, id))
      .limit(1);

    if (!existingItem) {
      return next(new AppError("Knowledge item not found", 404));
    }

    // Check permissions
    if (
      existingItem.authorId !== req.user.id &&
      req.user.role !== "administrator" &&
      req.user.role !== "knowledge_champion"
    ) {
      return next(
        new AppError("You do not have permission to update this item", 403)
      );
    }

    const updateData: any = {
      updatedAt: new Date(),
    };
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (content) updateData.content = content;
    if (tags) updateData.tags = tags;

    // Handle status changes (only administrators and knowledge champions can change status)
    if (
      status &&
      (req.user.role === "administrator" ||
        req.user.role === "knowledge_champion")
    ) {
      const oldStatus = existingItem.status;
      updateData.status =
        status as (typeof knowledgeItems.status.enumValues)[number];

      // If status is being changed to approved, set validatedBy and validatedAt
      if (status === "approved" && oldStatus !== "approved") {
        updateData.validatedBy = req.user.id;
        updateData.validatedAt = new Date();

        // Get author's organization name for organization notification
        const [authorData] = await db
          .select({ organizationName: users.organizationName })
          .from(users)
          .where(eq(users.id, existingItem.authorId))
          .limit(1);

        // Send approval notification to the author
        try {
          await sendApprovalNotification(
            existingItem.authorId,
            existingItem.id,
            existingItem.title
          );

          // Send organization notification if author belongs to an organization
          if (authorData?.organizationName) {
            await sendOrganizationNotification(
              authorData.organizationName,
              existingItem.id,
              existingItem.title,
              `Knowledge item "${existingItem.title}" has been approved and published in your organization.`
            );
          }
        } catch (error) {
          console.error("Error sending approval notification:", error);
          // Continue even if notification fails
        }
      }

      // If status is being changed to rejected, set validatedBy and validatedAt
      if (status === "rejected" && oldStatus !== "rejected") {
        updateData.validatedBy = req.user.id;
        updateData.validatedAt = new Date();

        // Send rejection notification to the author
        try {
          await sendRejectionNotification(
            existingItem.authorId,
            existingItem.id,
            existingItem.title
          );
        } catch (error) {
          console.error("Error sending rejection notification:", error);
          // Continue even if notification fails
        }
      }
    }

    const [updatedItem] = await db
      .update(knowledgeItems)
      .set(updateData)
      .where(eq(knowledgeItems.id, id))
      .returning();

    res.json({
      status: "success",
      data: updatedItem,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteKnowledgeItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    // Check if item exists
    const [existingItem] = await db
      .select()
      .from(knowledgeItems)
      .where(eq(knowledgeItems.id, id))
      .limit(1);

    if (!existingItem) {
      return next(new AppError("Knowledge item not found", 404));
    }

    // Check permissions
    if (
      existingItem.authorId !== req.user.id &&
      req.user.role !== "administrator"
    ) {
      return next(
        new AppError("You do not have permission to delete this item", 403)
      );
    }

    await db.delete(knowledgeItems).where(eq(knowledgeItems.id, id));

    res.status(204).json({
      status: "success",
      message: "Knowledge item deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
