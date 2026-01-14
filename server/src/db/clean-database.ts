import { db } from "./connection.js";
import {
  knowledgeItems,
  contributions,
  projects,
  clients,
  repositories,
  invitations,
  notifications,
  userInterests,
  consultantExpertise,
  consultantProjects,
  governanceCouncilMembers,
  knowledgeChampions,
  users,
  complianceRules,
  regions,
} from "./schema/index.js";
import * as dotenv from "dotenv";

dotenv.config();

async function cleanDatabase() {
  try {
    console.log("🧹 Starting database cleanup...");
    console.log("⚠️  This will delete ALL data from the database!");

    // Delete in order to respect foreign key constraints
    console.log("📝 Deleting knowledge items...");
    await db.delete(knowledgeItems);
    console.log("  ✓ Deleted knowledge items");

    console.log("📝 Deleting contributions...");
    await db.delete(contributions);
    console.log("  ✓ Deleted contributions");

    console.log("📝 Deleting projects...");
    await db.delete(projects);
    console.log("  ✓ Deleted projects");

    console.log("📝 Deleting clients...");
    await db.delete(clients);
    console.log("  ✓ Deleted clients");

    console.log("📝 Deleting repositories...");
    await db.delete(repositories);
    console.log("  ✓ Deleted repositories");

    console.log("📝 Deleting invitations...");
    await db.delete(invitations);
    console.log("  ✓ Deleted invitations");

    console.log("📝 Deleting notifications...");
    await db.delete(notifications);
    console.log("  ✓ Deleted notifications");

    // Delete user-related junction tables first
    console.log("📝 Deleting user interests...");
    await db.delete(userInterests);
    console.log("  ✓ Deleted user interests");

    console.log("📝 Deleting consultant expertise...");
    await db.delete(consultantExpertise);
    console.log("  ✓ Deleted consultant expertise");

    console.log("📝 Deleting consultant projects...");
    await db.delete(consultantProjects);
    console.log("  ✓ Deleted consultant projects");

    console.log("📝 Deleting governance council members...");
    await db.delete(governanceCouncilMembers);
    console.log("  ✓ Deleted governance council members");

    console.log("📝 Deleting knowledge champions...");
    await db.delete(knowledgeChampions);
    console.log("  ✓ Deleted knowledge champions");

    console.log("📝 Deleting users...");
    await db.delete(users);
    console.log("  ✓ Deleted users");

    console.log("📝 Deleting compliance rules...");
    await db.delete(complianceRules);
    console.log("  ✓ Deleted compliance rules");

    // Optionally delete regions (comment out if you want to keep them)
    console.log("📝 Deleting regions...");
    await db.delete(regions);
    console.log("  ✓ Deleted regions");

    console.log("✅ Database cleanup completed successfully!");
  } catch (error) {
    console.error("❌ Error cleaning database:", error);
    throw error;
  }
}

cleanDatabase()
  .then(() => {
    console.log("🎉 Cleanup script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Cleanup script failed:", error);
    process.exit(1);
  });
