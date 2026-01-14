import { Request, Response, NextFunction } from "express";
import { db } from "../db/connection.js";
import {
  workspaceMembers,
  projects,
  users,
  knowledgeItems,
  comments,
} from "../db/schema/index.js";
import { eq, and, or, desc, sql } from "drizzle-orm";
import { AppError } from "../middleware/errorHandler.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
  sendWorkspaceMemberNotification,
  sendWorkspaceActivityNotification,
} from "../services/notificationService.js";

// Get all workspaces (projects) for a user
export const getUserWorkspaces = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    // Get projects where user is lead consultant
    let leadProjects: any[] = [];
    try {
      leadProjects = await db
        .select()
        .from(projects)
        .where(eq(projects.leadConsultantId, req.user.id));
    } catch (error) {
      console.error("Error fetching lead projects:", error);
      // Continue even if this fails
    }

    // Get projects where user is a workspace member
    let memberProjects: any[] = [];
    try {
      memberProjects = await db
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
          role: workspaceMembers.role,
          joinedAt: workspaceMembers.joinedAt,
        })
        .from(workspaceMembers)
        .innerJoin(projects, eq(workspaceMembers.projectId, projects.id))
        .where(eq(workspaceMembers.userId, req.user.id));
    } catch (error: any) {
      console.error("Error fetching member projects:", error);
      // If workspace_members table doesn't exist, just return lead projects
      if (error?.message?.includes("does not exist") || error?.message?.includes("relation")) {
        // Return only lead consultant projects
        const workspaces = leadProjects.map((project) => ({
          ...project,
          userRole: "owner",
          joinedAt: project.createdAt,
        }));
        return res.json({
          status: "success",
          data: workspaces,
        });
      }
      // For other errors, continue and try to return what we have
    }

    // Combine and deduplicate
    const workspaceMap = new Map();

    // Add lead consultant projects
    leadProjects.forEach((project) => {
      workspaceMap.set(project.id, {
        ...project,
        userRole: "owner",
        joinedAt: project.createdAt,
      });
    });

    // Add member projects (will override if user is both lead and member)
    memberProjects.forEach((item) => {
      workspaceMap.set(item.id, {
        id: item.id,
        projectCode: item.projectCode,
        name: item.name,
        clientId: item.clientId,
        domain: item.domain,
        startDate: item.startDate,
        endDate: item.endDate,
        status: item.status,
        leadConsultantId: item.leadConsultantId,
        clientSatisfactionScore: item.clientSatisfactionScore,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        userRole: item.role || "member",
        joinedAt: item.joinedAt || item.createdAt,
      });
    });

    const allWorkspaces = Array.from(workspaceMap.values());

    res.json({
      status: "success",
      data: allWorkspaces,
    });
  } catch (error: any) {
    console.error("Error in getUserWorkspaces:", error);
    next(error);
  }
};

// Get workspace members
export const getWorkspaceMembers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId } = req.params;

    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    // Verify user has access to this workspace
    let member = null;
    try {
      const memberResult = await db
        .select()
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.projectId, projectId),
            eq(workspaceMembers.userId, req.user.id)
          )
        )
        .limit(1);
      member = memberResult[0] || null;
    } catch (error: any) {
      // If workspace_members table doesn't exist or query fails, continue
      // We'll check project access instead
      console.warn("Error checking workspace membership:", error?.message);
    }

    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!project) {
      return next(new AppError("Workspace not found", 404));
    }

    // Check if user is lead consultant or member
    if (
      project.leadConsultantId !== req.user.id &&
      !member &&
      req.user.role !== "administrator"
    ) {
      return next(
        new AppError("You do not have access to this workspace", 403)
      );
    }

    // Get all members
    let members: any[] = [];
    try {
      const membersData = await db
        .select({
          id: workspaceMembers.id,
          role: workspaceMembers.role,
          joinedAt: workspaceMembers.joinedAt,
          userId: workspaceMembers.userId,
          userName: users.name,
          userEmail: users.email,
          userAvatar: users.avatar,
          userRole: users.role,
        })
        .from(workspaceMembers)
        .leftJoin(users, eq(workspaceMembers.userId, users.id))
        .where(eq(workspaceMembers.projectId, projectId));

      // Transform to expected format
      members = membersData
        .filter((m) => m.userId) // Filter out null users
        .map((m) => ({
          id: m.id,
          role: m.role,
          joinedAt: m.joinedAt,
          user: {
            id: m.userId!,
            name: m.userName || "Unknown",
            email: m.userEmail || "",
            avatar: m.userAvatar,
            role: m.userRole || "consultant",
          },
        }));
    } catch (error: any) {
      // If workspace_members table doesn't exist, return empty array
      // The lead consultant will still be added below
      console.warn("Error fetching workspace members:", error?.message);
      members = [];
    }

    // Add lead consultant if not already in members
    if (project.leadConsultantId) {
      const [leadConsultant] = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          avatar: users.avatar,
          role: users.role,
        })
        .from(users)
        .where(eq(users.id, project.leadConsultantId))
        .limit(1);

      if (
        leadConsultant &&
        !members.some((m) => m.user.id === leadConsultant.id)
      ) {
        members.unshift({
          id: "",
          role: "owner",
          joinedAt: project.createdAt,
          user: leadConsultant,
        });
      }
    }

    res.json({
      status: "success",
      data: members,
    });
  } catch (error) {
    next(error);
  }
};

// Add member to workspace
export const addWorkspaceMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId } = req.params;
    const { userId, role = "member" } = req.body;

    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    if (!userId) {
      return next(new AppError("User ID is required", 400));
    }

    // Verify project exists
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!project) {
      return next(new AppError("Workspace not found", 404));
    }

    // Check permissions (only lead consultant or admin can add members)
    if (
      project.leadConsultantId !== req.user.id &&
      req.user.role !== "administrator"
    ) {
      return next(
        new AppError("You do not have permission to add members", 403)
      );
    }

    // Check if user is already a member
    const [existingMember] = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.projectId, projectId),
          eq(workspaceMembers.userId, userId)
        )
      )
      .limit(1);

    if (existingMember) {
      return next(new AppError("User is already a member", 400));
    }

    // Add member
    const [newMember] = await db
      .insert(workspaceMembers)
      .values({
        projectId,
        userId,
        role: role as string,
      })
      .returning();

    // Send notification to the added member
    try {
      const [addedUser] = await db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, req.user.id))
        .limit(1);

      if (addedUser) {
        await sendWorkspaceMemberNotification(
          userId,
          projectId,
          project.name,
          addedUser.name
        );
      }
    } catch (error) {
      console.error("Error sending workspace member notification:", error);
    }

    res.status(201).json({
      status: "success",
      data: newMember,
    });
  } catch (error) {
    next(error);
  }
};

// Remove member from workspace
export const removeWorkspaceMember = async (
  req: AuthRequest,
  res: Response,
  next: Function
) => {
  try {
    const { projectId, memberId } = req.params;

    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    // Verify project exists
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!project) {
      return next(new AppError("Workspace not found", 404));
    }

    // Check permissions
    if (
      project.leadConsultantId !== req.user.id &&
      req.user.role !== "administrator"
    ) {
      return next(
        new AppError("You do not have permission to remove members", 403)
      );
    }

    // Remove member
    await db
      .delete(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.projectId, projectId),
          eq(workspaceMembers.id, memberId)
        )
      );

    res.json({
      status: "success",
      message: "Member removed successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get workspace activity (knowledge items, comments, etc.)
export const getWorkspaceActivity = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId } = req.params;
    const { limit = 50 } = req.query;

    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    // Verify user has access
    let member = null;
    try {
      const memberResult = await db
        .select()
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.projectId, projectId),
            eq(workspaceMembers.userId, req.user.id)
          )
        )
        .limit(1);
      member = memberResult[0] || null;
    } catch (error: any) {
      // If workspace_members table doesn't exist, continue with project check
      console.warn("Error checking workspace membership:", error?.message);
    }

    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!project) {
      return next(new AppError("Workspace not found", 404));
    }

    if (
      project.leadConsultantId !== req.user.id &&
      !member &&
      req.user.role !== "administrator"
    ) {
      return next(
        new AppError("You do not have access to this workspace", 403)
      );
    }

    // Get knowledge items created in this project
    let knowledgeItemsList: any[] = [];
    try {
      const knowledgeItemsData = await db
        .select({
          id: knowledgeItems.id,
          title: knowledgeItems.title,
          type: knowledgeItems.type,
          createdAt: knowledgeItems.createdAt,
          authorId: knowledgeItems.authorId,
          authorName: users.name,
          authorAvatar: users.avatar,
        })
        .from(knowledgeItems)
        .leftJoin(users, eq(knowledgeItems.authorId, users.id))
        .where(eq(knowledgeItems.originatingProjectId, projectId))
        .limit(Number(limit));

      knowledgeItemsList = knowledgeItemsData.map((item) => ({
        id: item.id,
        title: item.title,
        type: item.type,
        createdAt: item.createdAt,
        author: {
          id: item.authorId,
          name: item.authorName || "Unknown",
          avatar: item.authorAvatar,
        },
        activityType: "knowledge_created",
      }));
    } catch (error: any) {
      console.warn("Error fetching knowledge items for activity:", error?.message);
    }

    // Get comments on knowledge items in this project
    let commentsList: any[] = [];
    try {
      const commentsData = await db
        .select({
          id: comments.id,
          content: comments.content,
          createdAt: comments.createdAt,
          knowledgeItemId: comments.knowledgeItemId,
          knowledgeItemTitle: knowledgeItems.title,
          authorId: comments.userId,
          authorName: users.name,
          authorAvatar: users.avatar,
        })
        .from(comments)
        .leftJoin(users, eq(comments.userId, users.id))
        .leftJoin(
          knowledgeItems,
          eq(comments.knowledgeItemId, knowledgeItems.id)
        )
        .where(eq(knowledgeItems.originatingProjectId, projectId))
        .limit(Number(limit));

      commentsList = commentsData.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        knowledgeItemId: comment.knowledgeItemId,
        knowledgeItemTitle: comment.knowledgeItemTitle,
        author: {
          id: comment.authorId,
          name: comment.authorName || "Unknown",
          avatar: comment.authorAvatar,
        },
        activityType: "comment_added",
      }));
    } catch (error: any) {
      console.warn("Error fetching comments for activity:", error?.message);
    }

    // Combine and sort by date
    const activities = [
      ...knowledgeItemsList.map((item) => ({
        id: item.id,
        type: item.activityType,
        title: item.title,
        description: `Created knowledge item: ${item.title}`,
        createdAt: item.createdAt,
        author: item.author,
        knowledgeItemId: item.id,
      })),
      ...commentsList.map((comment) => ({
        id: comment.id,
        type: comment.activityType,
        title: comment.knowledgeItemTitle || "Unknown",
        description: `Commented on: ${comment.knowledgeItemTitle || "knowledge item"}`,
        content: comment.content,
        createdAt: comment.createdAt,
        author: comment.author,
        knowledgeItemId: comment.knowledgeItemId,
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, Number(limit));

    res.json({
      status: "success",
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};
