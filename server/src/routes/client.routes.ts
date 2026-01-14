import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { getClients, getClientById } from "../controllers/client.controller.js";

export const clientRoutes = Router();

clientRoutes.use(authenticate);

clientRoutes.get("/", getClients);
clientRoutes.get("/:id", getClientById);
