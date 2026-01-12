import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/auth.middleware";
import {
  createInvitation,
  createBulkInvitations,
  activateAccount,
  getInvitation,
} from "../controllers/invitation.controller";

export const invitationRoutes = Router();

// Public routes (no authentication required)
invitationRoutes.get("/:token", getInvitation);
invitationRoutes.post("/activate/:token", activateAccount);

// Protected routes (authentication required)
invitationRoutes.use(authenticate);

// Only administrators and consultants can create invitations
invitationRoutes.post("/", authorize("administrator", "consultant"), createInvitation);
invitationRoutes.post("/bulk", authorize("administrator", "consultant"), createBulkInvitations);

