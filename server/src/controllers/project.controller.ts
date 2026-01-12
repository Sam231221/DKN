import { Request, Response, NextFunction } from "express";
import { db } from "../db/connection";
import { projects, clients, users } from "../db/schema";
import { eq, and, or, ilike } from "drizzle-orm";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth.middleware";

export const getProjects = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    if (!user) {
      throw new AppError("Unauthorized", 401);
    }

    // Get user's organization name
    const [userData] = await db
      .select({
        organizationName: users.organizationName,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, user.id));

    if (!userData) {
      throw new AppError("User not found", 404);
    }

    // Get all projects with related data
    const allProjectsRaw = await db
      .select({
        id: projects.id,
        projectCode: projects.projectCode,
        name: projects.name,
        clientId: projects.clientId,
        domain: projects.domain,
        startDate: projects.startDate,
        endDate: projects.endDate,
        status: projects.status,
        leadConsultantId: projects.leadConsultantId,
        clientSatisfactionScore: projects.clientSatisfactionScore,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
      })
      .from(projects);

    // Get client names
    const clientIds = [...new Set(allProjectsRaw.map((p) => p.clientId))];
    const clientsData = await db
      .select({
        id: clients.id,
        name: clients.name,
      })
      .from(clients)
      .where(
        clientIds.length > 0
          ? or(...clientIds.map((id) => eq(clients.id, id)))!
          : eq(clients.id, "")
      );

    // Get lead consultant names
    const consultantIds = [
      ...new Set(
        allProjectsRaw
          .map((p) => p.leadConsultantId)
          .filter((id): id is string => id !== null)
      ),
    ];
    const consultantsData =
      consultantIds.length > 0
        ? await db
            .select({
              id: users.id,
              name: users.name,
              organizationName: users.organizationName,
            })
            .from(users)
            .where(or(...consultantIds.map((id) => eq(users.id, id)))!)
        : [];

    // Filter by organization if needed
    let filteredProjects = allProjectsRaw;
    if (userData.role !== "administrator" && userData.organizationName) {
      const orgConsultantIds = new Set(
        consultantsData
          .filter((c) => c.organizationName === userData.organizationName)
          .map((c) => c.id)
      );
      filteredProjects = allProjectsRaw.filter(
        (p) => p.leadConsultantId && orgConsultantIds.has(p.leadConsultantId)
      );
    }

    // Combine data
    const allProjects = filteredProjects.map((project) => {
      const client = clientsData.find((c) => c.id === project.clientId);
      const consultant = consultantsData.find(
        (c) => c.id === project.leadConsultantId
      );
      return {
        ...project,
        clientName: client?.name || null,
        leadConsultantName: consultant?.name || null,
      };
    });

    res.json({
      status: "success",
      data: allProjects,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const [project] = await db
      .select({
        id: projects.id,
        projectCode: projects.projectCode,
        name: projects.name,
        clientId: projects.clientId,
        domain: projects.domain,
        startDate: projects.startDate,
        endDate: projects.endDate,
        status: projects.status,
        leadConsultantId: projects.leadConsultantId,
        clientSatisfactionScore: projects.clientSatisfactionScore,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
      })
      .from(projects)
      .where(eq(projects.id, id));

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    res.json({
      status: "success",
      data: project,
    });
  } catch (error) {
    next(error);
  }
};
