import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { authRoutes } from "./routes/auth.routes.js";
import { userRoutes } from "./routes/user.routes.js";
import { knowledgeRoutes } from "./routes/knowledge.routes.js";
import { repositoryRoutes } from "./routes/repository.routes.js";
import { notificationRoutes } from "./routes/notification.routes.js";
import { invitationRoutes } from "./routes/invitation.routes.js";
import { clientRoutes } from "./routes/client.routes.js";
import { projectRoutes } from "./routes/project.routes.js";
import { regionRoutes } from "./routes/region.routes.js";
import { searchRoutes } from "./routes/search.routes.js";
import { commentRoutes } from "./routes/comment.routes.js";
import { workspaceRoutes } from "./routes/workspace.routes.js";
import { activityRoutes } from "./routes/activity.routes.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy - Required for Vercel/serverless environments
// This allows Express to trust the X-Forwarded-For header from proxies
app.set("trust proxy", true);

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

// Root route - API documentation
app.get("/", (_req, res) => {
  const baseUrl = `${_req.protocol}://${_req.get("host")}`;

  const apiDocs = {
    name: "DKN Digital Knowledge Network API",
    version: "1.0.0",
    description:
      "Express.js backend server for the DKN Knowledge Management System",
    baseUrl: baseUrl,
    endpoints: {
      health: {
        method: "GET",
        path: "/health",
        description: "Health check endpoint",
        authentication: false,
      },
      authentication: {
        method: "POST",
        path: "/api/auth/login",
        description: "Login user",
        authentication: false,
      },
      emailVerification: [
        {
          method: "POST",
          path: "/api/auth/verify-email",
          description: "Verify email address",
          authentication: false,
        },
        {
          method: "POST",
          path: "/api/auth/resend-verification",
          description: "Resend verification email",
          authentication: false,
        },
      ],
      passwordReset: [
        {
          method: "POST",
          path: "/api/auth/forgot-password",
          description: "Request password reset",
          authentication: false,
        },
        {
          method: "POST",
          path: "/api/auth/reset-password",
          description: "Reset password with token",
          authentication: false,
        },
      ],
      users: [
        {
          method: "GET",
          path: "/api/users",
          description: "Get all users",
          authentication: true,
        },
        {
          method: "GET",
          path: "/api/users/:id",
          description: "Get user by ID",
          authentication: true,
        },
        {
          method: "PATCH",
          path: "/api/users/:id",
          description: "Update user",
          authentication: true,
        },
      ],
      knowledge: [
        {
          method: "GET",
          path: "/api/knowledge",
          description: "Get all knowledge items",
          authentication: true,
        },
        {
          method: "GET",
          path: "/api/knowledge/:id",
          description: "Get knowledge item by ID",
          authentication: true,
        },
        {
          method: "POST",
          path: "/api/knowledge",
          description: "Create knowledge item (with file upload)",
          authentication: true,
        },
        {
          method: "PATCH",
          path: "/api/knowledge/:id",
          description: "Update knowledge item",
          authentication: true,
        },
        {
          method: "DELETE",
          path: "/api/knowledge/:id",
          description: "Delete knowledge item",
          authentication: true,
        },
      ],
      repositories: [
        {
          method: "GET",
          path: "/api/repositories",
          description: "Get all repositories",
          authentication: true,
        },
        {
          method: "GET",
          path: "/api/repositories/:id",
          description: "Get repository by ID",
          authentication: true,
        },
      ],
      notifications: [
        {
          method: "GET",
          path: "/api/notifications",
          description: "Get all notifications for user",
          authentication: true,
        },
        {
          method: "PATCH",
          path: "/api/notifications/:id/read",
          description: "Mark notification as read",
          authentication: true,
        },
        {
          method: "PATCH",
          path: "/api/notifications/read-all",
          description: "Mark all notifications as read",
          authentication: true,
        },
      ],
      invitations: [
        {
          method: "GET",
          path: "/api/invitations/:token",
          description: "Get invitation by token (public)",
          authentication: false,
        },
        {
          method: "POST",
          path: "/api/invitations/activate/:token",
          description: "Activate account with invitation token (public)",
          authentication: false,
        },
        {
          method: "POST",
          path: "/api/invitations",
          description: "Create invitation (admin/consultant only)",
          authentication: true,
          authorization: ["administrator", "consultant"],
        },
        {
          method: "POST",
          path: "/api/invitations/bulk",
          description: "Create bulk invitations (admin/consultant only)",
          authentication: true,
          authorization: ["administrator", "consultant"],
        },
      ],
      clients: [
        {
          method: "GET",
          path: "/api/clients",
          description: "Get all clients",
          authentication: true,
        },
        {
          method: "GET",
          path: "/api/clients/:id",
          description: "Get client by ID",
          authentication: true,
        },
      ],
      projects: [
        {
          method: "GET",
          path: "/api/projects",
          description: "Get all projects",
          authentication: true,
        },
        {
          method: "GET",
          path: "/api/projects/:id",
          description: "Get project by ID",
          authentication: true,
        },
      ],
      regions: [
        {
          method: "GET",
          path: "/api/regions",
          description: "Get all regions (admin only)",
          authentication: true,
        },
        {
          method: "GET",
          path: "/api/regions/offices",
          description: "Get available regional offices for current user",
          authentication: true,
        },
        {
          method: "GET",
          path: "/api/regions/offices/:id",
          description: "Get regional office by ID",
          authentication: true,
        },
      ],
      search: [
        {
          method: "GET",
          path: "/api/search",
          description:
            "Unified search across projects, knowledge items, and repositories",
          authentication: true,
          queryParams: ["q", "regionId"],
        },
      ],
    },
    authentication: {
      type: "JWT Bearer Token",
      header: "Authorization: Bearer <token>",
      note: "Most endpoints require authentication. Get token by logging in at /api/auth/login",
    },
    staticFiles: {
      path: "/uploads",
      description: "Static file serving for uploaded files",
    },
  };

  // Return HTML for browser, JSON for API clients
  const acceptHeader = _req.get("accept") || "";
  if (acceptHeader.includes("text/html")) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DKN API Documentation</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        .header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .section {
            margin-bottom: 40px;
        }
        .section h2 {
            color: #667eea;
            font-size: 1.8em;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e0e0e0;
        }
        .endpoint {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 4px;
        }
        .endpoint-header {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 10px;
        }
        .method {
            padding: 5px 12px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 0.9em;
            text-transform: uppercase;
        }
        .method.get { background: #61affe; color: white; }
        .method.post { background: #49cc90; color: white; }
        .method.patch { background: #fca130; color: white; }
        .method.delete { background: #f93e3e; color: white; }
        .path {
            font-family: 'Courier New', monospace;
            font-size: 1.1em;
            color: #333;
            font-weight: 600;
        }
        .description {
            color: #666;
            margin-top: 8px;
        }
        .auth-badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 0.8em;
            margin-top: 8px;
        }
        .auth-badge.required {
            background: #ff6b6b;
            color: white;
        }
        .auth-badge.public {
            background: #51cf66;
            color: white;
        }
        .auth-badge.admin {
            background: #ffd43b;
            color: #333;
        }
        .info-box {
            background: #e7f5ff;
            border-left: 4px solid #339af0;
            padding: 20px;
            border-radius: 4px;
            margin-bottom: 30px;
        }
        .info-box h3 {
            color: #339af0;
            margin-bottom: 10px;
        }
        .info-box code {
            background: #fff;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            background: #f8f9fa;
            border-top: 1px solid #e0e0e0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 DKN API</h1>
            <p>Digital Knowledge Network - API Documentation</p>
            <p style="margin-top: 10px; font-size: 0.9em;">Base URL: ${baseUrl}</p>
        </div>
        <div class="content">
            <div class="info-box">
                <h3>🔐 Authentication</h3>
                <p>Most endpoints require JWT authentication. Include the token in the Authorization header:</p>
                <code>Authorization: Bearer &lt;your-token&gt;</code>
                <p style="margin-top: 10px;">Get your token by logging in at <code>POST /api/auth/login</code></p>
            </div>

            <div class="section">
                <h2>📊 System</h2>
                <div class="endpoint">
                    <div class="endpoint-header">
                        <span class="method get">GET</span>
                        <span class="path">/health</span>
                    </div>
                    <div class="description">Health check endpoint to verify server status</div>
                    <span class="auth-badge public">Public</span>
                </div>
            </div>

            <div class="section">
                <h2>🔑 Authentication</h2>
                <div class="endpoint">
                    <div class="endpoint-header">
                        <span class="method post">POST</span>
                        <span class="path">/api/auth/login</span>
                    </div>
                    <div class="description">Login user and receive JWT token</div>
                    <span class="auth-badge public">Public</span>
                </div>
                <div class="endpoint">
                    <div class="endpoint-header">
                        <span class="method post">POST</span>
                        <span class="path">/api/auth/verify-email</span>
                    </div>
                    <div class="description">Verify email address with verification code</div>
                    <span class="auth-badge public">Public</span>
                </div>
                <div class="endpoint">
                    <div class="endpoint-header">
                        <span class="method post">POST</span>
                        <span class="path">/api/auth/resend-verification</span>
                    </div>
                    <div class="description">Resend email verification code</div>
                    <span class="auth-badge public">Public</span>
                </div>
                <div class="endpoint">
                    <div class="endpoint-header">
                        <span class="method post">POST</span>
                        <span class="path">/api/auth/forgot-password</span>
                    </div>
                    <div class="description">Request password reset email</div>
                    <span class="auth-badge public">Public</span>
                </div>
                <div class="endpoint">
                    <div class="endpoint-header">
                        <span class="method post">POST</span>
                        <span class="path">/api/auth/reset-password</span>
                    </div>
                    <div class="description">Reset password with reset token</div>
                    <span class="auth-badge public">Public</span>
                </div>
            </div>

            <div class="section">
                <h2>👥 Users</h2>
                <div class="endpoint">
                    <div class="endpoint-header">
                        <span class="method get">GET</span>
                        <span class="path">/api/users</span>
                    </div>
                    <div class="description">Get all users (filtered by permissions)</div>
                    <span class="auth-badge required">Auth Required</span>
                </div>
                <div class="endpoint">
                    <div class="endpoint-header">
                        <span class="method get">GET</span>
                        <span class="path">/api/users/:id</span>
                    </div>
                    <div class="description">Get user by ID</div>
                    <span class="auth-badge required">Auth Required</span>
                </div>
                <div class="endpoint">
                    <div class="endpoint-header">
                        <span class="method patch">PATCH</span>
                        <span class="path">/api/users/:id</span>
                    </div>
                    <div class="description">Update user information</div>
                    <span class="auth-badge required">Auth Required</span>
                </div>
            </div>

            <div class="section">
                <h2>📚 Knowledge Items</h2>
                <div class="endpoint">
                    <div class="endpoint-header">
                        <span class="method get">GET</span>
                        <span class="path">/api/knowledge</span>
                    </div>
                    <div class="description">Get all knowledge items (with filtering options)</div>
                    <span class="auth-badge required">Auth Required</span>
                </div>
                <div class="endpoint">
                    <div class="endpoint-header">
                        <span class="method get">GET</span>
                        <span class="path">/api/knowledge/:id</span>
                    </div>
                    <div class="description">Get knowledge item by ID</div>
                    <span class="auth-badge required">Auth Required</span>
                </div>
                <div class="endpoint">
                    <div class="endpoint-header">
                        <span class="method post">POST</span>
                        <span class="path">/api/knowledge</span>
                    </div>
                    <div class="description">Create new knowledge item (supports file upload)</div>
                    <span class="auth-badge required">Auth Required</span>
                </div>
                <div class="endpoint">
                    <div class="endpoint-header">
                        <span class="method patch">PATCH</span>
                        <span class="path">/api/knowledge/:id</span>
                    </div>
                    <div class="description">Update knowledge item</div>
                    <span class="auth-badge required">Auth Required</span>
                </div>
                <div class="endpoint">
                    <div class="endpoint-header">
                        <span class="method delete">DELETE</span>
                        <span class="path">/api/knowledge/:id</span>
                    </div>
                    <div class="description">Delete knowledge item</div>
                    <span class="auth-badge required">Auth Required</span>
                </div>
            </div>

            <div class="section">
                <h2>📁 Repositories</h2>
                <div class="endpoint">
                    <div class="endpoint-header">
                        <span class="method get">GET</span>
                        <span class="path">/api/repositories</span>
                    </div>
                    <div class="description">Get all repositories</div>
                    <span class="auth-badge required">Auth Required</span>
                </div>
                <div class="endpoint">
                    <div class="endpoint-header">
                        <span class="method get">GET</span>
                        <span class="path">/api/repositories/:id</span>
                    </div>
                    <div class="description">Get repository by ID</div>
                    <span class="auth-badge required">Auth Required</span>
                </div>
            </div>

            <div class="section">
                <h2>🔔 Notifications</h2>
                <div class="endpoint">
                    <div class="endpoint-header">
                        <span class="method get">GET</span>
                        <span class="path">/api/notifications</span>
                    </div>
                    <div class="description">Get all notifications for authenticated user</div>
                    <span class="auth-badge required">Auth Required</span>
                </div>
                <div class="endpoint">
                    <div class="endpoint-header">
                        <span class="method patch">PATCH</span>
                        <span class="path">/api/notifications/:id/read</span>
                    </div>
                    <div class="description">Mark specific notification as read</div>
                    <span class="auth-badge required">Auth Required</span>
                </div>
                <div class="endpoint">
                    <div class="endpoint-header">
                        <span class="method patch">PATCH</span>
                        <span class="path">/api/notifications/read-all</span>
                    </div>
                    <div class="description">Mark all notifications as read</div>
                    <span class="auth-badge required">Auth Required</span>
                </div>
            </div>

            <div class="section">
                <h2>✉️ Invitations</h2>
                <div class="endpoint">
                    <div class="endpoint-header">
                        <span class="method get">GET</span>
                        <span class="path">/api/invitations/:token</span>
                    </div>
                    <div class="description">Get invitation details by token</div>
                    <span class="auth-badge public">Public</span>
                </div>
                <div class="endpoint">
                    <div class="endpoint-header">
                        <span class="method post">POST</span>
                        <span class="path">/api/invitations/activate/:token</span>
                    </div>
                    <div class="description">Activate account with invitation token</div>
                    <span class="auth-badge public">Public</span>
                </div>
                <div class="endpoint">
                    <div class="endpoint-header">
                        <span class="method post">POST</span>
                        <span class="path">/api/invitations</span>
                    </div>
                    <div class="description">Create new invitation</div>
                    <span class="auth-badge admin">Admin/Consultant Only</span>
                </div>
                <div class="endpoint">
                    <div class="endpoint-header">
                        <span class="method post">POST</span>
                        <span class="path">/api/invitations/bulk</span>
                    </div>
                    <div class="description">Create multiple invitations at once</div>
                    <span class="auth-badge admin">Admin/Consultant Only</span>
                </div>
            </div>

            <div class="section">
                <h2>🏢 Clients</h2>
                <div class="endpoint">
                    <div class="endpoint-header">
                        <span class="method get">GET</span>
                        <span class="path">/api/clients</span>
                    </div>
                    <div class="description">Get all clients</div>
                    <span class="auth-badge required">Auth Required</span>
                </div>
                <div class="endpoint">
                    <div class="endpoint-header">
                        <span class="method get">GET</span>
                        <span class="path">/api/clients/:id</span>
                    </div>
                    <div class="description">Get client by ID</div>
                    <span class="auth-badge required">Auth Required</span>
                </div>
            </div>

            <div class="section">
                <h2>📋 Projects</h2>
                <div class="endpoint">
                    <div class="endpoint-header">
                        <span class="method get">GET</span>
                        <span class="path">/api/projects</span>
                    </div>
                    <div class="description">Get all projects (filtered by user permissions)</div>
                    <span class="auth-badge required">Auth Required</span>
                </div>
                <div class="endpoint">
                    <div class="endpoint-header">
                        <span class="method get">GET</span>
                        <span class="path">/api/projects/:id</span>
                    </div>
                    <div class="description">Get project by ID</div>
                    <span class="auth-badge required">Auth Required</span>
                </div>
            </div>

            <div class="section">
                <h2>🌍 Regions</h2>
                <div class="endpoint">
                    <div class="endpoint-header">
                        <span class="method get">GET</span>
                        <span class="path">/api/regions</span>
                    </div>
                    <div class="description">Get all regions (admin only)</div>
                    <span class="auth-badge required">Auth Required</span>
                </div>
                <div class="endpoint">
                    <div class="endpoint-header">
                        <span class="method get">GET</span>
                        <span class="path">/api/regions/offices</span>
                    </div>
                    <div class="description">Get available regional offices for current user</div>
                    <span class="auth-badge required">Auth Required</span>
                </div>
                <div class="endpoint">
                    <div class="endpoint-header">
                        <span class="method get">GET</span>
                        <span class="path">/api/regions/offices/:id</span>
                    </div>
                    <div class="description">Get regional office by ID</div>
                    <span class="auth-badge required">Auth Required</span>
                </div>
            </div>
        </div>
        <div class="footer">
            <p>DKN Digital Knowledge Network API v1.0.0</p>
            <p style="margin-top: 5px; font-size: 0.9em;">For JSON response, use: <code>Accept: application/json</code> header</p>
        </div>
    </div>
</body>
</html>
    `;
    res.send(html);
  } else {
    res.json(apiDocs);
  }
});

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
app.use("/api/search", searchRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/activity", activityRoutes);

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
