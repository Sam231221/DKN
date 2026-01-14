import { Response, NextFunction } from "express";
import { db } from "../db/connection.js";
import {
  projects,
  knowledgeItems,
  repositories,
  clients,
  users,
} from "../db/schema/index.js";
import { eq, and, or, ilike, isNull } from "drizzle-orm";
import { AppError } from "../middleware/errorHandler.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

export const unifiedSearch = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    if (!user) {
      throw new AppError("Unauthorized", 401);
    }

    const { q: query, regionId } = req.query;

    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return res.json({
        status: "success",
        data: {
          projects: [],
          knowledgeItems: [],
          repositories: [],
        },
      });
    }

    const searchQuery = query.trim();
    const searchPattern = `%${searchQuery}%`;

    // Get user's organization name and region
    const [userData] = await db
      .select({
        organizationName: users.organizationName,
        role: users.role,
        regionId: users.regionId,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (!userData) {
      throw new AppError("User not found", 404);
    }

    const userRole = userData.role;
    const canSeeAllRegions =
      userRole === "administrator" ||
      userRole === "knowledge_champion" ||
      userRole === "executive_leadership";

    // Determine region filter
    let effectiveRegionId: string | null = null;
    if (regionId) {
      if (regionId === "all") {
        if (!canSeeAllRegions) {
          return next(
            new AppError(
              "Access denied: Global view requires elevated permissions",
              403
            )
          );
        }
        effectiveRegionId = null; // No region filter
      } else {
        effectiveRegionId = regionId as string;
      }
    } else if (userData.regionId && !canSeeAllRegions) {
      effectiveRegionId = userData.regionId;
    }

    // ========================================================================
    // Search Projects
    // ========================================================================
    let projectsQuery = db
      .select({
        id: projects.id,
        projectCode: projects.projectCode,
        name: projects.name,
        clientId: projects.clientId,
        domain: projects.domain,
        status: projects.status,
      })
      .from(projects)
      .leftJoin(clients, eq(projects.clientId, clients.id))
      .leftJoin(users, eq(projects.leadConsultantId, users.id));

    const projectConditions = [
      or(
        ilike(projects.name, searchPattern),
        ilike(projects.projectCode, searchPattern),
        ilike(projects.domain, searchPattern),
        ilike(clients.name, searchPattern)
      )!,
    ];

    // Organization filtering for projects (only if lead consultant exists)
    if (userData.role !== "administrator" && userData.organizationName) {
      // Filter by lead consultant's organization, or show projects without lead consultants
      projectConditions.push(
        or(
          eq(users.organizationName, userData.organizationName),
          isNull(projects.leadConsultantId)
        )!
      );
    }

    // Region filtering for projects (only if lead consultant exists)
    if (effectiveRegionId) {
      // Filter by lead consultant's region, or show projects without lead consultants
      projectConditions.push(
        or(
          eq(users.regionId, effectiveRegionId),
          isNull(projects.leadConsultantId)
        )!
      );
    }

    if (projectConditions.length > 0) {
      projectsQuery = projectsQuery.where(and(...projectConditions)) as any;
    }

    const allProjects = await projectsQuery.limit(5);

    // Get client names for projects
    const clientIds = [...new Set(allProjects.map((p) => p.clientId))];
    const clientsData =
      clientIds.length > 0
        ? await db
            .select({
              id: clients.id,
              name: clients.name,
            })
            .from(clients)
            .where(or(...clientIds.map((id) => eq(clients.id, id)))!)
        : [];

    const projectsResults = allProjects.map((project) => {
      const client = clientsData.find((c) => c.id === project.clientId);
      return {
        type: "project" as const,
        id: project.id,
        title: project.name,
        subtitle: client?.name || project.projectCode || project.domain || "",
        url: `/dashboard/projects/${project.id}`,
      };
    });

    // ========================================================================
    // Search Knowledge Items
    // ========================================================================
    let knowledgeQuery = db
      .select({
        id: knowledgeItems.id,
        title: knowledgeItems.title,
        description: knowledgeItems.description,
        type: knowledgeItems.type,
        status: knowledgeItems.status,
        repositoryId: knowledgeItems.repositoryId,
        authorId: knowledgeItems.authorId,
      })
      .from(knowledgeItems)
      .leftJoin(users, eq(knowledgeItems.authorId, users.id))
      .leftJoin(repositories, eq(knowledgeItems.repositoryId, repositories.id));

    const knowledgeConditions = [
      or(
        ilike(knowledgeItems.title, searchPattern),
        ilike(knowledgeItems.description, searchPattern)
      )!,
    ];

    // Organization filtering for knowledge items
    if (userData.role !== "administrator" && userData.organizationName) {
      knowledgeConditions.push(
        eq(users.organizationName, userData.organizationName)
      );
    }

    // Region filtering for knowledge items
    if (effectiveRegionId) {
      knowledgeConditions.push(eq(users.regionId, effectiveRegionId));
    }

    if (knowledgeConditions.length > 0) {
      knowledgeQuery = knowledgeQuery.where(and(...knowledgeConditions)) as any;
    }

    const allKnowledgeItems = await knowledgeQuery.limit(5);

    // Get repository names for knowledge items
    const repositoryIds = [
      ...new Set(
        allKnowledgeItems
          .map((item) => item.repositoryId)
          .filter((id): id is string => id !== null)
      ),
    ];
    const repositoriesData =
      repositoryIds.length > 0
        ? await db
            .select({
              id: repositories.id,
              name: repositories.name,
            })
            .from(repositories)
            .where(or(...repositoryIds.map((id) => eq(repositories.id, id)))!)
        : [];

    const knowledgeResults = allKnowledgeItems.map((item) => {
      const repository = repositoriesData.find(
        (r) => r.id === item.repositoryId
      );
      return {
        type: "knowledge" as const,
        id: item.id,
        title: item.title,
        subtitle: repository?.name || item.description || "",
        url: `/dashboard/knowledge-items/${item.id}`,
      };
    });

    // ========================================================================
    // Search Repositories
    // ========================================================================
    let repositoriesQuery = db
      .select({
        id: repositories.id,
        name: repositories.name,
        description: repositories.description,
        ownerId: repositories.ownerId,
      })
      .from(repositories)
      .leftJoin(users, eq(repositories.ownerId, users.id));

    const repositoryConditions = [
      or(
        ilike(repositories.name, searchPattern),
        ilike(repositories.description, searchPattern)
      )!,
    ];

    // Region filtering for repositories (by owner's region)
    if (effectiveRegionId) {
      repositoryConditions.push(eq(users.regionId, effectiveRegionId));
    }

    if (repositoryConditions.length > 0) {
      repositoriesQuery = repositoriesQuery.where(
        and(...repositoryConditions)
      ) as any;
    }

    const allRepositories = await repositoriesQuery.limit(5);

    const repositoriesResults = allRepositories.map((repo) => ({
      type: "repository" as const,
      id: repo.id,
      title: repo.name,
      subtitle: repo.description || "",
      url: `/dashboard/repositories/${repo.id}`,
    }));

    // ========================================================================
    // Return Results
    // ========================================================================
    res.json({
      status: "success",
      data: {
        projects: projectsResults,
        knowledgeItems: knowledgeResults,
        repositories: repositoriesResults,
      },
    });
  } catch (error) {
    next(error);
  }
};
