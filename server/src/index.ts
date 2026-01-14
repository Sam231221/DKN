import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFoundHandler";
import { authRoutes } from "./routes/auth.routes";
import { userRoutes } from "./routes/user.routes";
import { knowledgeRoutes } from "./routes/knowledge.routes";
import { repositoryRoutes } from "./routes/repository.routes";
import { notificationRoutes } from "./routes/notification.routes";
import { invitationRoutes } from "./routes/invitation.routes";
import { clientRoutes } from "./routes/client.routes";
import { projectRoutes } from "./routes/project.routes";
import { regionRoutes } from "./routes/region.routes";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "DKN Server is running" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/knowledge", knowledgeRoutes);
app.use("/api/repositories", repositoryRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/regions", regionRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server only if not in serverless environment (Vercel)
if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

export default app;
