import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  getUserWorkspaces,
  getWorkspaceMembers,
  addWorkspaceMember,
  removeWorkspaceMember,
  getWorkspaceActivity,
} from "../controllers/workspace.controller.js";

export const workspaceRoutes = Router();

// All workspace routes require authentication
workspaceRoutes.use(authenticate);

// Get user's workspaces
workspaceRoutes.get("/", getUserWorkspaces);

// Get workspace members
workspaceRoutes.get("/:projectId/members", getWorkspaceMembers);

// Add member to workspace
workspaceRoutes.post("/:projectId/members", addWorkspaceMember);

// Remove member from workspace
workspaceRoutes.delete("/:projectId/members/:memberId", removeWorkspaceMember);

// Get workspace activity
workspaceRoutes.get("/:projectId/activity", getWorkspaceActivity);
