import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { getUsers, getUserById, updateUser } from "../controllers/user.controller";

export const userRoutes = Router();

userRoutes.use(authenticate);

userRoutes.get("/", getUsers);
userRoutes.get("/:id", getUserById);
userRoutes.patch("/:id", updateUser);

