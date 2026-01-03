import { pgTable, text, timestamp, boolean, integer, pgEnum } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

// Enums
export const userRoleEnum = pgEnum("user_role", [
  "client",
  "employee",
  "consultant",
  "knowledge_champion",
  "administrator",
]);

export const knowledgeStatusEnum = pgEnum("knowledge_status", [
  "draft",
  "pending_review",
  "approved",
  "rejected",
  "archived",
]);

export const contributionTypeEnum = pgEnum("contribution_type", [
  "created",
  "edited",
  "validated",
  "commented",
  "viewed",
]);

// Tables
export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull().default("client"),
  avatar: text("avatar"),
  points: integer("points").default(0),
  contributions: integer("contributions").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const repositories = pgTable("repositories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: text("owner_id").references(() => users.id).notNull(),
  itemCount: integer("item_count").default(0),
  contributorCount: integer("contributor_count").default(0),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const knowledgeItems = pgTable("knowledge_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content").notNull(),
  repositoryId: text("repository_id").references(() => repositories.id),
  authorId: text("author_id").references(() => users.id).notNull(),
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

export const contributions = pgTable("contributions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id").references(() => users.id).notNull(),
  knowledgeItemId: text("knowledge_item_id").references(() => knowledgeItems.id),
  type: contributionTypeEnum("type").notNull(),
  points: integer("points").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Repository = typeof repositories.$inferSelect;
export type NewRepository = typeof repositories.$inferInsert;

export type KnowledgeItem = typeof knowledgeItems.$inferSelect;
export type NewKnowledgeItem = typeof knowledgeItems.$inferInsert;

export type Contribution = typeof contributions.$inferSelect;
export type NewContribution = typeof contributions.$inferInsert;
