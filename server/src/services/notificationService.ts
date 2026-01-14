import { db } from "../db/connection.js";
import { notifications, users } from "../db/schema/index.js";
import { eq, and, or } from "drizzle-orm";

export type NotificationType =
  | "upload"
  | "review"
  | "approval"
  | "rejection"
  | "comment"
  | "update"
  | "organization"
  | "workspace_member_added"
  | "workspace_activity"
  | "knowledge_shared";

/**
 * Send upload notification to the contributor
 */
export async function sendUploadNotification(
  userId: string,
  knowledgeItemId: string,
  title: string
): Promise<void> {
  await db.insert(notifications).values({
    userId,
    type: "upload",
    message: `Your knowledge item "${title}" has been uploaded and is pending review.`,
    relatedId: knowledgeItemId,
    read: false,
  });
}

/**
 * Send review notification to reviewers (knowledge champions, administrators)
 */
export async function sendReviewNotification(
  knowledgeItemId: string,
  title: string,
  authorName: string
): Promise<void> {
  // Get all users who should review (knowledge champions, administrators, knowledge council members)
  const reviewers = await db
    .select({ id: users.id })
    .from(users)
    .where(
      or(
        eq(users.role, "knowledge_champion"),
        eq(users.role, "administrator"),
        eq(users.role, "knowledge_council_member")
      )
    );

  // Send notification to each reviewer
  const notificationRecords = reviewers.map((reviewer) => ({
    userId: reviewer.id,
    type: "review" as NotificationType,
    message: `New knowledge item "${title}" by ${authorName} requires review.`,
    relatedId: knowledgeItemId,
    read: false,
  }));

  if (notificationRecords.length > 0) {
    await db.insert(notifications).values(notificationRecords);
  }
}

/**
 * Send approval notification
 */
export async function sendApprovalNotification(
  userId: string,
  knowledgeItemId: string,
  title: string
): Promise<void> {
  await db.insert(notifications).values({
    userId,
    type: "approval",
    message: `Your knowledge item "${title}" has been approved and published.`,
    relatedId: knowledgeItemId,
    read: false,
  });
}

/**
 * Send rejection notification
 */
export async function sendRejectionNotification(
  userId: string,
  knowledgeItemId: string,
  title: string,
  reason?: string
): Promise<void> {
  const message = reason
    ? `Your knowledge item "${title}" has been rejected. Reason: ${reason}`
    : `Your knowledge item "${title}" has been rejected.`;

  await db.insert(notifications).values({
    userId,
    type: "rejection",
    message,
    relatedId: knowledgeItemId,
    read: false,
  });
}

/**
 * Send organization-based notification (notify all users in the same organization)
 */
export async function sendOrganizationNotification(
  organizationName: string,
  knowledgeItemId: string,
  _title: string,
  message: string
): Promise<void> {
  if (!organizationName) {
    return; // Skip if no organization name
  }

  // Get all users in the same organization
  const orgUsers = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.organizationName, organizationName));

  // Send notification to each user in the organization
  const notificationRecords = orgUsers.map((user) => ({
    userId: user.id,
    type: "organization" as NotificationType,
    message,
    relatedId: knowledgeItemId,
    read: false,
  }));

  if (notificationRecords.length > 0) {
    await db.insert(notifications).values(notificationRecords);
  }
}

/**
 * Send comment notification to knowledge item author
 */
export async function sendCommentNotification(
  userId: string,
  knowledgeItemId: string,
  title: string,
  commenterId: string
): Promise<void> {
  // Get commenter's name
  const [commenter] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, commenterId))
    .limit(1);

  const commenterName = commenter?.name || "Someone";

  await db.insert(notifications).values({
    userId,
    type: "comment",
    message: `${commenterName} commented on your knowledge item "${title}".`,
    relatedId: knowledgeItemId,
    read: false,
  });
}

/**
 * Get notifications for a user
 */
export async function getUserNotifications(userId: string): Promise<any[]> {
  const result = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId));
  
  // Sort by createdAt descending (drizzle doesn't support desc directly on timestamp in all versions)
  return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(
  notificationId: string,
  userId: string
): Promise<void> {
  await db
    .update(notifications)
    .set({ read: true })
    .where(
      and(eq(notifications.id, notificationId), eq(notifications.userId, userId))
    );
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  await db
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.userId, userId));
}

/**
 * Send workspace member added notification
 */
export async function sendWorkspaceMemberNotification(
  userId: string,
  projectId: string,
  projectName: string,
  addedByName: string
): Promise<void> {
  await db.insert(notifications).values({
    userId,
    type: "workspace_member_added",
    message: `${addedByName} added you to workspace "${projectName}".`,
    relatedId: projectId,
    read: false,
  });
}

/**
 * Send workspace activity notification to all members
 */
export async function sendWorkspaceActivityNotification(
  projectId: string,
  _activityType: string,
  _activityTitle: string,
  activityDescription: string,
  userId: string
): Promise<void> {
  // Get all workspace members
  const { workspaceMembers } = await import("../db/schema/index.js");
  const members = await db
    .select({ userId: workspaceMembers.userId })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.projectId, projectId));

  // Get project name
  const { projects } = await import("../db/schema/index.js");
  const [project] = await db
    .select({ name: projects.name })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project) return;

  // Send notification to all members except the one who created the activity
  const notificationRecords = members
    .filter((m) => m.userId !== userId)
    .map((m) => ({
      userId: m.userId,
      type: "workspace_activity" as NotificationType,
      message: `${activityDescription} in workspace "${project.name}".`,
      relatedId: projectId,
      read: false,
    }));

  if (notificationRecords.length > 0) {
    await db.insert(notifications).values(notificationRecords);
  }
}
