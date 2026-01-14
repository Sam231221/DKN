import { Response, NextFunction } from "express";
import { db } from "../db/connection.js";
import { comments, users, knowledgeItems, contributions } from "../db/schema/index.js";
import { eq, and, desc } from "drizzle-orm";
import { AppError } from "../middleware/errorHandler.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { sendCommentNotification } from "../services/notificationService.js";
import { createActivityFeedEntry } from "./activity.controller.js";

// Get all comments for a knowledge item
export const getCommentsByKnowledgeItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { knowledgeItemId } = req.params;

    if (!knowledgeItemId) {
      return next(new AppError("Knowledge item ID is required", 400));
    }

    // Verify knowledge item exists
    const [knowledgeItem] = await db
      .select()
      .from(knowledgeItems)
      .where(eq(knowledgeItems.id, knowledgeItemId))
      .limit(1);

    if (!knowledgeItem) {
      return next(new AppError("Knowledge item not found", 404));
    }

    // Get all comments with user information
    const commentsList = await db
      .select({
        id: comments.id,
        content: comments.content,
        parentCommentId: comments.parentCommentId,
        isEdited: comments.isEdited,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatar: users.avatar,
          role: users.role,
        },
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.knowledgeItemId, knowledgeItemId))
      .orderBy(desc(comments.createdAt));

    res.json({
      status: "success",
      data: commentsList,
    });
  } catch (error) {
    next(error);
  }
};

// Create a new comment
export const createComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { knowledgeItemId } = req.params;
    const { content, parentCommentId } = req.body;

    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    if (!content || content.trim().length === 0) {
      return next(new AppError("Comment content is required", 400));
    }

    // Verify knowledge item exists
    const [knowledgeItem] = await db
      .select()
      .from(knowledgeItems)
      .where(eq(knowledgeItems.id, knowledgeItemId))
      .limit(1);

    if (!knowledgeItem) {
      return next(new AppError("Knowledge item not found", 404));
    }

    // If parentCommentId is provided, verify it exists
    if (parentCommentId) {
      const [parentComment] = await db
        .select()
        .from(comments)
        .where(
          and(
            eq(comments.id, parentCommentId),
            eq(comments.knowledgeItemId, knowledgeItemId)
          )
        )
        .limit(1);

      if (!parentComment) {
        return next(new AppError("Parent comment not found", 404));
      }
    }

    // Create comment
    const [newComment] = await db
      .insert(comments)
      .values({
        knowledgeItemId,
        userId: req.user.id,
        content: content.trim(),
        parentCommentId: parentCommentId || null,
      })
      .returning();

    // Track contribution
    try {
      await db.insert(contributions).values({
        userId: req.user.id,
        knowledgeItemId,
        type: "commented",
        points: 5, // Award points for commenting
      });
    } catch (error) {
      console.error("Error tracking contribution:", error);
    }

    // Get comment with user information
    const [commentWithUser] = await db
      .select({
        id: comments.id,
        content: comments.content,
        parentCommentId: comments.parentCommentId,
        isEdited: comments.isEdited,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatar: users.avatar,
          role: users.role,
        },
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.id, newComment.id))
      .limit(1);

    // Send notification to knowledge item author (if not the commenter)
    try {
      if (knowledgeItem.authorId !== req.user.id) {
        await sendCommentNotification(
          knowledgeItem.authorId,
          knowledgeItem.id,
          knowledgeItem.title,
          req.user.id
        );
      }
    } catch (error) {
      console.error("Error sending comment notification:", error);
    }

    // Create activity feed entry
    try {
      await createActivityFeedEntry(
        req.user.id,
        "comment_added",
        knowledgeItem.title,
        `Commented on: ${knowledgeItem.title}`,
        newComment.id,
        "comment",
        knowledgeItem.originatingProjectId || undefined
      );
    } catch (error) {
      console.error("Error creating activity feed entry:", error);
    }

    res.status(201).json({
      status: "success",
      data: commentWithUser,
    });
  } catch (error) {
    next(error);
  }
};

// Update a comment
export const updateComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    if (!content || content.trim().length === 0) {
      return next(new AppError("Comment content is required", 400));
    }

    // Check if comment exists
    const [existingComment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, id))
      .limit(1);

    if (!existingComment) {
      return next(new AppError("Comment not found", 404));
    }

    // Check permissions (only author can update)
    if (existingComment.userId !== req.user.id) {
      return next(
        new AppError("You do not have permission to update this comment", 403)
      );
    }

    // Update comment
    await db
      .update(comments)
      .set({
        content: content.trim(),
        isEdited: true,
        updatedAt: new Date(),
      })
      .where(eq(comments.id, id))
      .returning();

    // Get comment with user information
    const [commentWithUser] = await db
      .select({
        id: comments.id,
        content: comments.content,
        parentCommentId: comments.parentCommentId,
        isEdited: comments.isEdited,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatar: users.avatar,
          role: users.role,
        },
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.id, id))
      .limit(1);

    res.json({
      status: "success",
      data: commentWithUser,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a comment
export const deleteComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    // Check if comment exists
    const [existingComment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, id))
      .limit(1);

    if (!existingComment) {
      return next(new AppError("Comment not found", 404));
    }

    // Check permissions (author or admin can delete)
    if (
      existingComment.userId !== req.user.id &&
      req.user.role !== "administrator" &&
      req.user.role !== "knowledge_champion"
    ) {
      return next(
        new AppError("You do not have permission to delete this comment", 403)
      );
    }

    // Delete comment (cascade will handle child comments)
    await db.delete(comments).where(eq(comments.id, id));

    res.status(204).json({
      status: "success",
      message: "Comment deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
