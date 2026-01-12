import { Request, Response, NextFunction } from "express";
import { db } from "../db/connection";
import { repositories } from "../db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth.middleware";

export const getRepositories = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const allRepositories = await db
      .select()
      .from(repositories)
      .orderBy(desc(repositories.createdAt));

    res.json({
      status: "success",
      data: allRepositories,
    });
  } catch (error) {
    next(error);
  }
};

export const getRepositoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const [repository] = await db
      .select()
      .from(repositories)
      .where(eq(repositories.id, id))
      .limit(1);

    if (!repository) {
      return next(new AppError("Repository not found", 404));
    }

    res.json({
      status: "success",
      data: repository,
    });
  } catch (error) {
    next(error);
  }
};

