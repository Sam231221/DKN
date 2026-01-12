import { db } from "./connection";
import {
  users,
  clients,
  projects,
  repositories,
  knowledgeItems,
} from "./schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

// Sample data arrays for generating realistic content
const organizationNames = [
  "TechCorp Solutions",
  "Global Innovations Inc",
  "Digital Dynamics Ltd",
  "Enterprise Systems Group",
  "Cloud Services Co",
  "Data Analytics Pro",
  "Software Solutions Hub",
  "Business Intelligence Corp",
  "Innovation Labs",
  "Strategic Consulting Group",
];

const clientNames = [
  "Acme Corporation",
  "Beta Industries",
  "Gamma Systems",
  "Delta Technologies",
  "Epsilon Solutions",
  "Zeta Enterprises",
  "Eta Manufacturing",
  "Theta Services",
  "Iota Consulting",
  "Kappa Holdings",
];

const industries = [
  "Technology",
  "Manufacturing",
  "Healthcare",
  "Finance",
  "Retail",
  "Education",
  "Energy",
  "Telecommunications",
  "Transportation",
  "Real Estate",
];

const projectDomains = [
  "Smart Manufacturing",
  "Digital Transformation",
  "Cloud Migration",
  "Data Analytics",
  "AI/ML Implementation",
  "IoT Integration",
  "Cybersecurity",
  "Process Automation",
  "Customer Experience",
  "Supply Chain Optimization",
];

const projectStatuses = ["planning", "active", "on_hold", "completed"] as const;
const knowledgeTypes = [
  "documentation",
  "best_practices",
  "procedure",
  "training",
  "project_knowledge",
  "client_content",
  "technical",
  "policy",
  "guideline",
] as const;
const knowledgeStatuses = ["draft", "pending_review", "approved"] as const;
const accessLevels = ["public", "internal", "confidential"] as const;

const repositoryNames = [
  "Technical Documentation",
  "Best Practices Library",
  "Project Knowledge Base",
  "Training Materials",
  "Client Resources",
  "Policy & Guidelines",
  "Process Documentation",
  "Research & Development",
];

const knowledgeItemTitles = [
  "Implementation Guide",
  "Best Practices Documentation",
  "Technical Specifications",
  "User Manual",
  "Training Materials",
  "Process Workflow",
  "Troubleshooting Guide",
  "API Documentation",
  "Security Guidelines",
  "Deployment Procedures",
];

const knowledgeItemDescriptions = [
  "Comprehensive guide covering all aspects",
  "Detailed documentation for reference",
  "Step-by-step instructions and procedures",
  "Best practices and recommendations",
  "Technical reference material",
  "Training and educational content",
  "Operational procedures and guidelines",
];

// Helper function to get random element from array
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to get random number between min and max (inclusive)
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to generate date
function getRandomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

// Helper function to generate project code
function generateProjectCode(index: number): string {
  const year = new Date().getFullYear();
  return `PRJ-${year}-${String(index).padStart(3, "0")}`;
}

// Helper function to generate repository code
function generateRepositoryCode(orgIndex: number, repoIndex: number): string {
  return `REP-ORG${String(orgIndex).padStart(2, "0")}-${String(
    repoIndex
  ).padStart(2, "0")}`;
}

// Helper function to generate knowledge item content
function generateKnowledgeItemContent(
  title: string,
  type: (typeof knowledgeTypes)[number]
): string {
  const baseContent = `# ${title}

## Overview
This document provides comprehensive information about ${title.toLowerCase()}.

## Key Points
- Important concept or procedure
- Best practices and recommendations
- Implementation details
- Common use cases

## Details
This section contains detailed information relevant to the topic.

## Conclusion
Summary and next steps.`;

  if (type === "technical") {
    return `${baseContent}

## Technical Specifications
- Architecture details
- Integration points
- Performance considerations
- Security requirements`;
  } else if (type === "procedure") {
    return `${baseContent}

## Step-by-Step Process
1. Initial setup
2. Configuration
3. Execution
4. Verification
5. Completion`;
  } else if (type === "training") {
    return `${baseContent}

## Learning Objectives
- Understand key concepts
- Apply knowledge in practice
- Evaluate outcomes

## Training Modules
- Module 1: Introduction
- Module 2: Core Concepts
- Module 3: Advanced Topics`;
  }

  return baseContent;
}

async function seedOrganizational() {
  try {
    console.log("🌱 Starting organizational user seeding...");

    const hashedPassword = await bcrypt.hash("password123", 10);
    const organizationalUsers: (typeof users.$inferSelect)[] = [];
    const allClients: (typeof clients.$inferSelect)[] = [];
    const allProjects: (typeof projects.$inferSelect)[] = [];
    const allRepositories: (typeof repositories.$inferSelect)[] = [];

    // Step 1: Create 10 Organizational Users
    console.log("📝 Creating 10 organizational users...");
    for (let i = 0; i < 10; i++) {
      const email = `org${i + 1}@example.com`;
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser.length > 0) {
        console.log(`  ✓ User ${email} already exists, skipping...`);
        organizationalUsers.push(existingUser[0]);
        continue;
      }

      const orgUser = await db
        .insert(users)
        .values({
          email,
          password: hashedPassword,
          name: `${organizationNames[i]} Admin`,
          organizationType: "organizational",
          organizationName: organizationNames[i],
          role: i % 2 === 0 ? "administrator" : "employee",
          industry: getRandomElement(industries),
          employeeCount: getRandomElement([
            "11-50",
            "51-200",
            "201-500",
            "501-1000",
          ]),
          points: getRandomInt(100, 1000),
          contributions: getRandomInt(10, 100),
          isActive: true,
        })
        .returning();

      organizationalUsers.push(orgUser[0]);
      console.log(`  ✓ Created organizational user: ${email}`);
    }

    // Step 2: For each organizational user, create 10 clients
    console.log("📝 Creating clients for each organizational user...");
    for (let orgIndex = 0; orgIndex < organizationalUsers.length; orgIndex++) {
      const orgUser = organizationalUsers[orgIndex];

      for (let clientIndex = 0; clientIndex < 10; clientIndex++) {
        const clientName = `${getRandomElement(clientNames)} ${
          clientIndex + 1
        }`;
        const existingClient = await db
          .select()
          .from(clients)
          .where(
            and(eq(clients.name, clientName), eq(clients.userId, orgUser.id))
          )
          .limit(1);

        if (existingClient.length > 0) {
          allClients.push(existingClient[0]);
          continue;
        }

        const client = await db
          .insert(clients)
          .values({
            name: clientName,
            industry: getRandomElement(industries),
            userId: orgUser.id,
          })
          .returning();

        allClients.push(client[0]);
      }
      console.log(`  ✓ Created 10 clients for user ${orgUser.email}`);
    }

    // Step 3: For each client, create 2-3 projects
    console.log("📝 Creating projects for each client...");
    for (const client of allClients) {
      const numProjects = getRandomInt(2, 3); // Randomly 2 or 3 projects

      for (let i = 0; i < numProjects; i++) {
        const projectName = `${getRandomElement(projectDomains)} - ${
          client.name
        }`;

        const startDate = getRandomDate(
          new Date(2023, 0, 1),
          new Date(2024, 11, 31)
        );
        const endDate = getRandomDate(startDate, new Date(2025, 11, 31));

        // Find the organizational user who owns this client
        const orgUser = organizationalUsers.find(
          (u) => u.id === client.userId
        )!;

        // Insert project (skip duplicate check since projectCode column may not exist)
        const project = await db
          .insert(projects)
          .values({
            name: projectName,
            clientId: client.id,
            domain: getRandomElement(projectDomains),
            startDate: startDate.toISOString().split("T")[0],
            endDate: endDate.toISOString().split("T")[0],
            status: getRandomElement(projectStatuses),
            leadConsultantId: orgUser.id,
            clientSatisfactionScore: getRandomInt(3, 5),
          })
          .returning();

        allProjects.push(project[0]);
      }
    }
    console.log(`  ✓ Created ${allProjects.length} projects`);

    // Step 4: For each organizational user, create 3-4 repositories
    console.log("📝 Creating repositories for each organizational user...");
    for (let orgIndex = 0; orgIndex < organizationalUsers.length; orgIndex++) {
      const orgUser = organizationalUsers[orgIndex];
      const numRepos = getRandomInt(3, 4); // Randomly 3 or 4 repositories

      for (let repoIndex = 0; repoIndex < numRepos; repoIndex++) {
        const repoName = `${getRandomElement(repositoryNames)} - ${
          orgUser.organizationName
        }`;

        // Insert repository (skip duplicate check since repositoryCode column may not exist)
        const repository = await db
          .insert(repositories)
          .values({
            name: repoName,
            description: `Repository for ${
              orgUser.organizationName
            } containing ${getRandomElement(repositoryNames).toLowerCase()}`,
            ownerId: orgUser.id,
            tags: [
              getRandomElement(industries),
              getRandomElement(["Documentation", "Knowledge", "Resources"]),
            ],
            itemCount: 0,
            contributorCount: 0,
            isPublic: false,
            encryptionEnabled: true,
            searchIndexStatus: "active",
          })
          .returning();

        allRepositories.push(repository[0]);
      }
      console.log(
        `  ✓ Created ${numRepos} repositories for user ${orgUser.email}`
      );
    }

    // Step 5: For each repository, create minimum 6 knowledge items
    console.log("📝 Creating knowledge items for each repository...");
    let knowledgeItemCount = 0;
    for (const repository of allRepositories) {
      // Find the organizational user who owns this repository
      const orgUser = organizationalUsers.find(
        (u) => u.id === repository.ownerId
      )!;

      // Get all projects owned by this organizational user (through their clients)
      const userProjects = allProjects.filter((p) => {
        const projectClient = allClients.find((c) => c.id === p.clientId);
        return projectClient?.userId === orgUser.id;
      });

      // Create at least 6 knowledge items per repository
      const numItems = getRandomInt(6, 10); // Minimum 6, up to 10

      for (let i = 0; i < numItems; i++) {
        const type = getRandomElement(knowledgeTypes);
        const title = `${getRandomElement(knowledgeItemTitles)} - ${
          repository.name
        }`;
        const description = getRandomElement(knowledgeItemDescriptions);
        const originatingProject =
          userProjects.length > 0 ? getRandomElement(userProjects) : null;

        const knowledgeItem = await db
          .insert(knowledgeItems)
          .values({
            title,
            description,
            content: generateKnowledgeItemContent(title, type),
            type,
            repositoryId: repository.id,
            authorId: orgUser.id,
            originatingProjectId: originatingProject?.id || null,
            status: getRandomElement(knowledgeStatuses),
            accessLevel: getRandomElement(accessLevels),
            tags: [
              getRandomElement(industries),
              type,
              getRandomElement(["Important", "Reference", "Guide"]),
            ],
            views: getRandomInt(0, 500),
            likes: getRandomInt(0, 50),
            isPublished: Math.random() > 0.3, // 70% published
            lifecycleStatus: getRandomElement([
              "draft",
              "approved",
              "archived",
            ]),
          })
          .returning();

        knowledgeItemCount++;
      }
    }
    console.log(
      `  ✓ Created ${knowledgeItemCount} knowledge items for repositories`
    );

    // Step 6: Create individual users (5 users)
    console.log("📝 Creating individual users...");
    const individualUsers: (typeof users.$inferSelect)[] = [];
    for (let i = 0; i < 5; i++) {
      const email = `individual${i + 1}@example.com`;
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser.length > 0) {
        console.log(`  ✓ User ${email} already exists, skipping...`);
        individualUsers.push(existingUser[0]);
        continue;
      }

      const individualUser = await db
        .insert(users)
        .values({
          email,
          password: hashedPassword,
          name: `Individual User ${i + 1}`,
          firstName: `User${i + 1}`,
          lastName: `Individual`,
          organizationType: "individual",
          role: getRandomElement(["employee", "consultant", "client"]),
          points: getRandomInt(50, 500),
          contributions: getRandomInt(5, 50),
          isActive: true,
        })
        .returning();

      individualUsers.push(individualUser[0]);
      console.log(`  ✓ Created individual user: ${email}`);
    }

    // Step 7: For each individual user, create 10 knowledge items
    console.log("📝 Creating knowledge items for individual users...");
    let individualKnowledgeItemCount = 0;

    // Ensure we have repositories available (use created ones or query existing)
    let availableRepositories =
      allRepositories.length > 0
        ? allRepositories
        : await db.select().from(repositories).limit(100);

    // If still no repositories, create a default one for individual users
    if (availableRepositories.length === 0 && individualUsers.length > 0) {
      console.log(
        "  ⚠️  No repositories found, creating default repository for individual users..."
      );
      const defaultRepo = await db
        .insert(repositories)
        .values({
          name: "Default Individual Repository",
          description: "Default repository for individual user knowledge items",
          ownerId: individualUsers[0].id,
          tags: ["Default", "Individual"],
          itemCount: 0,
          contributorCount: 0,
          isPublic: true,
          encryptionEnabled: true,
          searchIndexStatus: "active",
        })
        .returning();
      availableRepositories = defaultRepo;
    }

    for (const individualUser of individualUsers) {
      // Create exactly 10 knowledge items per individual user
      for (let i = 0; i < 10; i++) {
        const type = getRandomElement(knowledgeTypes);
        const title = `${getRandomElement(knowledgeItemTitles)} - Personal`;
        const description = getRandomElement(knowledgeItemDescriptions);
        const repository =
          availableRepositories.length > 0
            ? getRandomElement(availableRepositories)
            : null;

        // Optionally link to a project if available
        const availableProjects = allProjects.length > 0 ? allProjects : [];
        const originatingProject =
          availableProjects.length > 0 && Math.random() > 0.5
            ? getRandomElement(availableProjects)
            : null;

        if (!repository) {
          console.warn(
            `  ⚠️  No repositories available for individual user ${individualUser.email}, skipping knowledge item`
          );
          continue;
        }

        await db.insert(knowledgeItems).values({
          title,
          description,
          content: generateKnowledgeItemContent(title, type),
          type,
          repositoryId: repository.id,
          authorId: individualUser.id,
          originatingProjectId: originatingProject?.id || null,
          status: getRandomElement(knowledgeStatuses),
          accessLevel: getRandomElement(accessLevels),
          tags: [type, getRandomElement(["Personal", "Reference", "Notes"])],
          views: getRandomInt(0, 200),
          likes: getRandomInt(0, 20),
          isPublished: Math.random() > 0.4, // 60% published
          lifecycleStatus: getRandomElement(["draft", "approved"]),
        });

        individualKnowledgeItemCount++;
      }
    }
    console.log(
      `  ✓ Created ${individualKnowledgeItemCount} knowledge items for individual users`
    );

    console.log("✅ Organizational seeding completed successfully!");
    console.log(`📊 Summary:`);
    console.log(`   - Organizational Users: ${organizationalUsers.length}`);
    console.log(`   - Clients: ${allClients.length}`);
    console.log(`   - Projects: ${allProjects.length}`);
    console.log(`   - Repositories: ${allRepositories.length}`);
    console.log(`   - Knowledge Items (repositories): ${knowledgeItemCount}`);
    console.log(`   - Individual Users: ${individualUsers.length}`);
    console.log(
      `   - Knowledge Items (individual): ${individualKnowledgeItemCount}`
    );
  } catch (error) {
    console.error("❌ Error seeding organizational data:", error);
    throw error;
  }
}

seedOrganizational()
  .then(() => {
    console.log("🎉 Organizational seed script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Organizational seed script failed:", error);
    process.exit(1);
  });
