import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { getClients, getClientById } from "../controllers/client.controller";

export const clientRoutes = Router();

clientRoutes.use(authenticate);

clientRoutes.get("/", getClients);
clientRoutes.get("/:id", getClientById);
