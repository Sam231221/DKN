import { Request, Response, NextFunction } from "express";
import { db } from "../db/connection";
import { knowledgeItems } from "../db/schema";
import { eq } from "drizzle-orm";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth.middleware";

export const getKnowledgeItems = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const items = await db.select().from(knowledgeItems);

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
      .select()
      .from(knowledgeItems)
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
    const { title, description, content, repositoryId, tags } = req.body;

    if (!title || !content) {
      return next(new AppError("Title and content are required", 400));
    }

    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    const [newItem] = await db
      .insert(knowledgeItems)
      .values({
        title,
        description,
        content,
        repositoryId,
        authorId: req.user.id,
        tags: tags || [],
      })
      .returning();

    res.status(201).json({
      status: "success",
      data: newItem,
    });
  } catch (error) {
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
    if (status && (req.user.role === "administrator" || req.user.role === "knowledge_champion")) {
      updateData.status = status;
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

