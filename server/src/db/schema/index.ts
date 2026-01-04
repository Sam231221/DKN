import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  pgEnum,
  date,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

// ============================================================================
// ENUMS
// ============================================================================

export const userRoleEnum = pgEnum("user_role", [
  "client",
  "employee",
  "consultant",
  "knowledge_champion",
  "administrator",
  "executive_leadership",
  "knowledge_council_member",
]);

export const organizationTypeEnum = pgEnum("organization_type", [
  "individual",
  "organizational",
]);

export const knowledgeStatusEnum = pgEnum("knowledge_status", [
  "draft",
  "pending_review",
  "approved",
  "rejected",
  "archived",
]);

export const knowledgeTypeEnum = pgEnum("knowledge_type", [
  "documentation",
  "best_practices",
  "procedure",
  "training",
  "project_knowledge",
  "client_content",
  "technical",
  "policy",
  "guideline",
]);

export const contributionTypeEnum = pgEnum("contribution_type", [
  "created",
  "edited",
  "validated",
  "commented",
  "viewed",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "planning",
  "active",
  "on_hold",
  "completed",
  "cancelled",
]);

export const accessLevelEnum = pgEnum("access_level", [
  "public",
  "internal",
  "confidential",
  "restricted",
]);

export const connectivityStatusEnum = pgEnum("connectivity_status", [
  "online",
  "offline",
  "limited",
]);

export const complianceLevelEnum = pgEnum("compliance_level", [
  "low",
  "medium",
  "high",
  "critical",
]);

export const expertiseLevelEnum = pgEnum("expertise_level", [
  "beginner",
  "intermediate",
  "advanced",
  "expert",
]);

// ============================================================================
// CORE BUSINESS ENTITIES
// ============================================================================

// Users/Consultants - Enhanced to support ConsultantType from UML
export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  email: text("email").notNull().unique(),
  username: text("username").unique(), // Username for user profile
  password: text("password").notNull(),
  name: text("name").notNull(), // Full name (keeping for backward compatibility)
  firstName: text("first_name"),
  lastName: text("last_name"),
  address: text("address"),
  avatar: text("avatar"), // Image URL or path
  experienceLevel: text("experience_level"), // e.g., "aspiring_engineer", "entry_level", "mid_level", "experienced", "highly_experienced", "not_engineer"
  role: userRoleEnum("role").notNull().default("client"),
  organizationType:
    organizationTypeEnum("organization_type").default("individual"),
  organizationName: text("organization_name"), // Organization name for organizational accounts
  employeeCount: text("employee_count"), // e.g., "1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"
  points: integer("points").default(0),
  contributions: integer("contributions").default(0),
  // ConsultantType attributes from UML
  hireDate: date("hire_date"), // For consultants
  region: text("region"), // Region reference
  // ClientType attributes from UML
  industry: text("industry"), // For clients
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Clients - Separate table for ClientType from UML
export const clients = pgTable("clients", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  industry: text("industry"),
  regionId: text("region_id").references(() => regions.id),
  userId: text("user_id").references(() => users.id), // Link to user account
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Projects - ProjectType from UML
export const projects = pgTable("projects", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  clientId: text("client_id")
    .references(() => clients.id)
    .notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  status: projectStatusEnum("status").notNull().default("planning"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Knowledge Assets - KnowledgeAssetType from UML (enhanced knowledgeItems)
export const knowledgeAssets = pgTable("knowledge_assets", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text("title").notNull(),
  content: text("content").notNull(),
  uploadDate: timestamp("upload_date").defaultNow().notNull(),
  status: knowledgeStatusEnum("status").notNull().default("draft"),
  tags: text("tags").array(),
  accessLevel: accessLevelEnum("access_level").notNull().default("internal"),
  // Relationships
  clientId: text("client_id").references(() => clients.id), // belongs to ClientType
  projectId: text("project_id").references(() => projects.id), // created by ProjectType
  curatorId: text("curator_id").references(() => users.id), // curated by ConsultantType
  repositoryId: text("repository_id").references(() => repositories.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Legacy knowledgeItems table (keeping for backward compatibility)
export const knowledgeItems = pgTable("knowledge_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content").notNull(),
  type: knowledgeTypeEnum("type").notNull().default("documentation"),
  repositoryId: text("repository_id").references(() => repositories.id),
  authorId: text("author_id")
    .references(() => users.id)
    .notNull(),
  status: knowledgeStatusEnum("status").notNull().default("draft"),
  tags: text("tags").array(),
  views: integer("views").default(0),
  likes: integer("likes").default(0),
  isPublished: boolean("is_published").default(false),
  validatedBy: text("validated_by").references(() => users.id),
  validatedAt: timestamp("validated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Repositories
export const repositories = pgTable("repositories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: text("owner_id")
    .references(() => users.id)
    .notNull(),
  itemCount: integer("item_count").default(0),
  contributorCount: integer("contributor_count").default(0),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Contributions
export const contributions = pgTable("contributions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .references(() => users.id)
    .notNull(),
  knowledgeItemId: text("knowledge_item_id").references(
    () => knowledgeItems.id
  ),
  type: contributionTypeEnum("type").notNull(),
  points: integer("points").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// REGIONAL & COMPLIANCE
// ============================================================================

// Regions - RegionType from UML
export const regions = pgTable("regions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull().unique(),
  dataProtectionLaws: text("data_protection_laws").array(), // Array of law descriptions
  connectivityStatus: connectivityStatusEnum("connectivity_status")
    .notNull()
    .default("online"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Compliance Rules - ComplianceRuleType from UML
export const complianceRules = pgTable("compliance_rules", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  regionId: text("region_id")
    .references(() => regions.id)
    .notNull(),
  lawDescription: text("law_description").notNull(),
  complianceLevel: complianceLevelEnum("compliance_level")
    .notNull()
    .default("medium"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================================
// KNOWLEDGE MANAGEMENT
// ============================================================================

// Training Sessions - TrainingSessionType from UML
export const trainingSessions = pgTable("training_sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  date: date("date").notNull(),
  topic: text("topic").notNull(),
  attendees: integer("attendees").default(0),
  knowledgeChampionId: text("knowledge_champion_id")
    .references(() => users.id)
    .notNull(), // conducts
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Content Recommendations - ContentRecommendationType from UML
export const contentRecommendations = pgTable("content_recommendations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  consultantId: text("consultant_id")
    .references(() => users.id)
    .notNull(), // generated_for
  effectivenessScore: integer("effectiveness_score").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Knowledge Champions - KnowledgeChampionType from UML (role-based, stored in users)
// Additional table for champion-specific attributes
export const knowledgeChampions = pgTable("knowledge_champions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  championId: text("champion_id")
    .references(() => users.id)
    .notNull()
    .unique(),
  appointmentDate: date("appointment_date").notNull(),
  region: text("region"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Governance Council - GovernanceCouncilType from UML
export const governanceCouncil = pgTable("governance_council", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================================
// DATA TYPES
// ============================================================================

// Expertise - ExpertiseType from UML
export const expertise = pgTable("expertise", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  description: text("description"),
  level: expertiseLevelEnum("level").notNull().default("intermediate"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Metadata - MetadataType from UML
export const metadata = pgTable("metadata", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  knowledgeAssetId: text("knowledge_asset_id")
    .references(() => knowledgeAssets.id)
    .notNull(),
  tags: text("tags").array(),
  category: text("category"),
  language: text("language").default("en"),
  version: text("version").default("1.0"),
  lastReviewed: date("last_reviewed"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================================
// JUNCTION TABLES (Many-to-Many Relationships)
// ============================================================================

// Consultant works on Projects
export const consultantProjects = pgTable("consultant_projects", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  consultantId: text("consultant_id")
    .references(() => users.id)
    .notNull(),
  projectId: text("project_id")
    .references(() => projects.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Consultant has Expertise
export const consultantExpertise = pgTable("consultant_expertise", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  consultantId: text("consultant_id")
    .references(() => users.id)
    .notNull(),
  expertiseId: text("expertise_id")
    .references(() => expertise.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Knowledge Assets must comply with Compliance Rules
export const knowledgeAssetCompliance = pgTable("knowledge_asset_compliance", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  knowledgeAssetId: text("knowledge_asset_id")
    .references(() => knowledgeAssets.id)
    .notNull(),
  complianceRuleId: text("compliance_rule_id")
    .references(() => complianceRules.id)
    .notNull(),
  isCompliant: boolean("is_compliant").default(false),
  checkedAt: timestamp("checked_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Training Sessions recommend Knowledge Assets
export const trainingSessionRecommendations = pgTable(
  "training_session_recommendations",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    trainingSessionId: text("training_session_id")
      .references(() => trainingSessions.id)
      .notNull(),
    knowledgeAssetId: text("knowledge_asset_id")
      .references(() => knowledgeAssets.id)
      .notNull(),
    recommendationType: text("recommendation_type")
      .notNull()
      .default("recommends"), // "recommends" or "uses_materials_from"
    createdAt: timestamp("created_at").defaultNow().notNull(),
  }
);

// Content Recommendations consider Knowledge Assets
export const contentRecommendationAssets = pgTable(
  "content_recommendation_assets",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    recommendationId: text("recommendation_id")
      .references(() => contentRecommendations.id)
      .notNull(),
    knowledgeAssetId: text("knowledge_asset_id")
      .references(() => knowledgeAssets.id)
      .notNull(),
    rank: integer("rank").default(0), // For ordering recommendations
    createdAt: timestamp("created_at").defaultNow().notNull(),
  }
);

// Content Recommendations consider Expertise
export const contentRecommendationExpertise = pgTable(
  "content_recommendation_expertise",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    recommendationId: text("recommendation_id")
      .references(() => contentRecommendations.id)
      .notNull(),
    expertiseId: text("expertise_id")
      .references(() => expertise.id)
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  }
);

// Governance Council Members (Consultants)
export const governanceCouncilMembers = pgTable("governance_council_members", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  councilId: text("council_id")
    .references(() => governanceCouncil.id)
    .notNull(),
  consultantId: text("consultant_id")
    .references(() => users.id)
    .notNull(),
  role: text("role"), // e.g., "chair", "member", "secretary"
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Interests - Tags/Categories users are interested in
export const userInterests = pgTable("user_interests", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .references(() => users.id)
    .notNull(),
  interest: text("interest").notNull(), // e.g., "Technology", "Design", "Marketing", etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type KnowledgeAsset = typeof knowledgeAssets.$inferSelect;
export type NewKnowledgeAsset = typeof knowledgeAssets.$inferInsert;

export type Repository = typeof repositories.$inferSelect;
export type NewRepository = typeof repositories.$inferInsert;

export type KnowledgeItem = typeof knowledgeItems.$inferSelect;
export type NewKnowledgeItem = typeof knowledgeItems.$inferInsert;

export type Contribution = typeof contributions.$inferSelect;
export type NewContribution = typeof contributions.$inferInsert;

export type Region = typeof regions.$inferSelect;
export type NewRegion = typeof regions.$inferInsert;

export type ComplianceRule = typeof complianceRules.$inferSelect;
export type NewComplianceRule = typeof complianceRules.$inferInsert;

export type TrainingSession = typeof trainingSessions.$inferSelect;
export type NewTrainingSession = typeof trainingSessions.$inferInsert;

export type ContentRecommendation = typeof contentRecommendations.$inferSelect;
export type NewContentRecommendation =
  typeof contentRecommendations.$inferInsert;

export type KnowledgeChampion = typeof knowledgeChampions.$inferSelect;
export type NewKnowledgeChampion = typeof knowledgeChampions.$inferInsert;

export type GovernanceCouncil = typeof governanceCouncil.$inferSelect;
export type NewGovernanceCouncil = typeof governanceCouncil.$inferInsert;

export type Expertise = typeof expertise.$inferSelect;
export type NewExpertise = typeof expertise.$inferInsert;

export type Metadata = typeof metadata.$inferSelect;
export type NewMetadata = typeof metadata.$inferInsert;

export type UserInterest = typeof userInterests.$inferSelect;
export type NewUserInterest = typeof userInterests.$inferInsert;
