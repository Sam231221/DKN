import { db } from "./connection.js";
import {
  users,
  clients,
  projects,
  repositories,
  knowledgeItems,
  regions,
  contributions,
  workspaceMembers,
} from "./schema/index.js";
import { eq, count, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

// ============================================================================
// REALISTIC DATA FOR VELION DYNAMICS
// ============================================================================

// Regions data
// name = branch name, region = region name
const regionData = [
  {
    name: "London Office", // Branch name
    region: "Europe", // Region name
    dataProtectionLaws: ["GDPR"],
    connectivityStatus: "online" as const,
  },
  {
    name: "Tokyo Office", // Branch name
    region: "Asia", // Region name
    dataProtectionLaws: ["PDPA", "Data Localization Requirements"],
    connectivityStatus: "limited" as const, // As mentioned in case study
  },
  {
    name: "New York Office", // Branch name
    region: "North America", // Region name
    dataProtectionLaws: ["CCPA", "State Privacy Laws"],
    connectivityStatus: "online" as const,
  },
];

// Velion Dynamics user data - realistic names by region
const velionUsers = {
  europe: [
    {
      firstName: "Sarah",
      lastName: "Johnson",
      role: "administrator" as const,
      email: "sarah.johnson@velion.com",
    },
    {
      firstName: "Michael",
      lastName: "Andersen",
      role: "knowledge_champion" as const,
      email: "michael.andersen@velion.com",
    },
    {
      firstName: "Emma",
      lastName: "Larsen",
      role: "consultant" as const,
      email: "emma.larsen@velion.com",
    },
    {
      firstName: "Thomas",
      lastName: "Hansen",
      role: "consultant" as const,
      email: "thomas.hansen@velion.com",
    },
    {
      firstName: "Sophie",
      lastName: "Nielsen",
      role: "consultant" as const,
      email: "sophie.nielsen@velion.com",
    },
    {
      firstName: "Lucas",
      lastName: "Pedersen",
      role: "consultant" as const,
      email: "lucas.pedersen@velion.com",
    },
    {
      firstName: "Anna",
      lastName: "Christensen",
      role: "consultant" as const,
      email: "anna.christensen@velion.com",
    },
    {
      firstName: "Oliver",
      lastName: "Jensen",
      role: "consultant" as const,
      email: "oliver.jensen@velion.com",
    },
    {
      firstName: "Isabella",
      lastName: "Madsen",
      role: "consultant" as const,
      email: "isabella.madsen@velion.com",
    },
    {
      firstName: "Noah",
      lastName: "Rasmussen",
      role: "consultant" as const,
      email: "noah.rasmussen@velion.com",
    },
    {
      firstName: "Erik",
      lastName: "Sørensen",
      role: "executive_leadership" as const,
      email: "erik.sorensen@velion.com",
    },
    {
      firstName: "Maria",
      lastName: "Olsen",
      role: "knowledge_council_member" as const,
      email: "maria.olsen@velion.com",
    },
  ],
  asia: [
    {
      firstName: "Wei",
      lastName: "Chen",
      role: "knowledge_champion" as const,
      email: "wei.chen@velion.com",
    },
    {
      firstName: "Li",
      lastName: "Wang",
      role: "consultant" as const,
      email: "li.wang@velion.com",
    },
    {
      firstName: "Yuki",
      lastName: "Tanaka",
      role: "consultant" as const,
      email: "yuki.tanaka@velion.com",
    },
    {
      firstName: "Raj",
      lastName: "Kumar",
      role: "consultant" as const,
      email: "raj.kumar@velion.com",
    },
    {
      firstName: "Priya",
      lastName: "Sharma",
      role: "consultant" as const,
      email: "priya.sharma@velion.com",
    },
    {
      firstName: "Min",
      lastName: "Park",
      role: "consultant" as const,
      email: "min.park@velion.com",
    },
    {
      firstName: "Hiroshi",
      lastName: "Yamamoto",
      role: "consultant" as const,
      email: "hiroshi.yamamoto@velion.com",
    },
    {
      firstName: "Mei",
      lastName: "Zhang",
      role: "consultant" as const,
      email: "mei.zhang@velion.com",
    },
    {
      firstName: "Anjali",
      lastName: "Patel",
      role: "consultant" as const,
      email: "anjali.patel@velion.com",
    },
    {
      firstName: "Kenji",
      lastName: "Sato",
      role: "consultant" as const,
      email: "kenji.sato@velion.com",
    },
    {
      firstName: "Hiroshi",
      lastName: "Nakamura",
      role: "executive_leadership" as const,
      email: "hiroshi.nakamura@velion.com",
    },
    {
      firstName: "Xiaoli",
      lastName: "Wu",
      role: "knowledge_council_member" as const,
      email: "xiaoli.wu@velion.com",
    },
  ],
  northAmerica: [
    {
      firstName: "David",
      lastName: "Martinez",
      role: "administrator" as const,
      email: "david.martinez@velion.com",
    },
    {
      firstName: "Jennifer",
      lastName: "Williams",
      role: "knowledge_champion" as const,
      email: "jennifer.williams@velion.com",
    },
    {
      firstName: "James",
      lastName: "Brown",
      role: "consultant" as const,
      email: "james.brown@velion.com",
    },
    {
      firstName: "Emily",
      lastName: "Davis",
      role: "consultant" as const,
      email: "emily.davis@velion.com",
    },
    {
      firstName: "Robert",
      lastName: "Miller",
      role: "consultant" as const,
      email: "robert.miller@velion.com",
    },
    {
      firstName: "Jessica",
      lastName: "Wilson",
      role: "consultant" as const,
      email: "jessica.wilson@velion.com",
    },
    {
      firstName: "Michael",
      lastName: "Moore",
      role: "consultant" as const,
      email: "michael.moore@velion.com",
    },
    {
      firstName: "Amanda",
      lastName: "Taylor",
      role: "consultant" as const,
      email: "amanda.taylor@velion.com",
    },
    {
      firstName: "Christopher",
      lastName: "Anderson",
      role: "consultant" as const,
      email: "christopher.anderson@velion.com",
    },
    {
      firstName: "Michelle",
      lastName: "Thomas",
      role: "consultant" as const,
      email: "michelle.thomas@velion.com",
    },
    {
      firstName: "Robert",
      lastName: "Thompson",
      role: "executive_leadership" as const,
      email: "robert.thompson@velion.com",
    },
    {
      firstName: "Patricia",
      lastName: "Garcia",
      role: "knowledge_council_member" as const,
      email: "patricia.garcia@velion.com",
    },
  ],
};

// External client data - industries from case study
const clientIndustries = [
  "Logistics",
  "Renewable Energy",
  "Smart Manufacturing",
  "Logistics",
  "Renewable Energy",
  "Smart Manufacturing",
  "Logistics",
  "Renewable Energy",
  "Smart Manufacturing",
  "Logistics",
  "Renewable Energy",
  "Smart Manufacturing",
  "Logistics",
  "Renewable Energy",
  "Smart Manufacturing",
];

const clientNames = [
  "Nordic Logistics Solutions",
  "Green Energy Partners",
  "SmartFactory Systems",
  "European Transport Group",
  "SolarTech Industries",
  "Advanced Manufacturing Co",
  "Global Shipping Network",
  "WindPower Solutions",
  "Industrial Automation Ltd",
  "Supply Chain Dynamics",
  "Clean Energy Ventures",
  "Precision Manufacturing Inc",
  "Cargo Express International",
  "Renewable Resources Group",
  "Digital Factory Solutions",
  "Logistics Pro",
  "EcoPower Systems",
  "Smart Production Technologies",
  "Freight Management Corp",
  "Sustainable Energy Partners",
];

// Project types from case study
const projectTypes = [
  "Digital Transformation",
  "IT Integration",
  "Cloud Migration",
  "Smart Manufacturing Implementation",
  "Logistics Optimization",
  "Renewable Energy Integration",
  "Process Automation",
  "Data Analytics Implementation",
  "IoT Integration",
  "Supply Chain Digitalization",
];

const projectStatuses = ["planning", "active", "on_hold", "completed"] as const;
const statusDistribution = {
  active: 0.4,
  completed: 0.3,
  planning: 0.2,
  on_hold: 0.1,
};

// Repository names are defined inline where used

// Knowledge item titles aligned with case study
const knowledgeItemTitles = [
  "Digital Transformation Framework for Logistics",
  "Renewable Energy Integration Best Practices",
  "Smart Manufacturing Implementation Guide",
  "Cross-Office Collaboration Protocols",
  "GDPR Compliance Checklist",
  "Data Localization Requirements in Asian Markets",
  "Cloud Migration Strategy",
  "IT Integration Best Practices",
  "Process Automation Guidelines",
  "Supply Chain Digitalization Framework",
  "Client Onboarding Process",
  "Project Management Methodology",
  "Knowledge Sharing Protocols",
  "Regional Data Protection Compliance",
  "Cross-Functional Team Collaboration",
  "Technical Documentation Standards",
  "Training Program for New Consultants",
  "Quality Assurance Procedures",
  "Client Communication Best Practices",
  "Project Delivery Framework",
];

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

// Helper functions
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

function getProjectStatus(): (typeof projectStatuses)[number] {
  const rand = Math.random();
  if (rand < statusDistribution.active) return "active";
  if (rand < statusDistribution.active + statusDistribution.completed)
    return "completed";
  if (
    rand <
    statusDistribution.active +
      statusDistribution.completed +
      statusDistribution.planning
  )
    return "planning";
  return "on_hold";
}

function generateProjectCode(index: number): string {
  const year = new Date().getFullYear();
  return `PRJ-${year}-${String(index).padStart(3, "0")}`;
}

function getDepartmentForUser(role: string, _regionName: string): string {
  // Derive department from role and region
  // Administrators and Knowledge Champions typically in Engineering or IT
  if (role === "administrator" || role === "knowledge_champion") {
    return getRandomElement(["Engineering", "IT"]);
  }

  // Executive Leadership typically in executive/leadership departments
  if (role === "executive_leadership") {
    return getRandomElement(["Engineering", "Consulting", "Product"]);
  }

  // Knowledge Council Members typically in Engineering or IT (similar to Knowledge Champions)
  if (role === "knowledge_council_member") {
    return getRandomElement(["Engineering", "IT"]);
  }

  // Consultants typically in Consulting or Engineering
  if (role === "consultant") {
    return getRandomElement(["Consulting", "Engineering", "Product"]);
  }

  // Default to Consulting
  return "Consulting";
}

function generateKnowledgeContent(
  title: string,
  type: (typeof knowledgeTypes)[number],
  region?: string
): string {
  const regionContext = region
    ? `\n\n## Regional Considerations\nThis document applies to the ${region} region. Please ensure compliance with local data protection laws and regulations.`
    : "";

  const baseContent = `# ${title}

## Overview
This document provides comprehensive guidance for Velion Dynamics consultants working on ${title.toLowerCase()}. It has been developed based on our experience delivering successful projects across multiple regions.

## Key Principles
- Focus on client value and outcomes
- Ensure compliance with regional regulations
- Promote knowledge sharing across offices
- Maintain high quality standards
- Foster cross-functional collaboration

## Implementation Guidelines
1. **Planning Phase**
   - Assess client requirements
   - Identify regional compliance needs
   - Allocate appropriate resources
   - Set clear milestones

2. **Execution Phase**
   - Follow established best practices
   - Document decisions and changes
   - Communicate regularly with stakeholders
   - Monitor progress and adjust as needed

3. **Completion Phase**
   - Conduct project review
   - Document lessons learned
   - Update knowledge base
   - Share insights with team

## Best Practices
- Always consult with Knowledge Champions for guidance
- Leverage existing knowledge items before creating new ones
- Validate content before publishing
- Update documentation regularly${regionContext}

## Related Resources
- Global Knowledge Repository
- Best Practices Library
- Regional Office Documentation

## Contact
For questions or clarifications, contact your regional Knowledge Champion or the DKN support team.`;

  if (type === "technical") {
    return `${baseContent}

## Technical Specifications
- Architecture requirements
- Integration points and APIs
- Performance benchmarks
- Security considerations
- Scalability guidelines`;
  } else if (type === "procedure") {
    return `${baseContent}

## Step-by-Step Process
1. **Preparation**
   - Gather required information
   - Review relevant documentation
   - Prepare necessary tools

2. **Execution**
   - Follow each step carefully
   - Document any deviations
   - Verify intermediate results

3. **Verification**
   - Validate outcomes
   - Check compliance requirements
   - Obtain necessary approvals

4. **Completion**
   - Finalize documentation
   - Archive project materials
   - Update knowledge base`;
  } else if (type === "training") {
    return `${baseContent}

## Learning Objectives
By the end of this training, participants will:
- Understand key concepts and principles
- Apply knowledge in practical scenarios
- Evaluate outcomes and make improvements
- Contribute to organizational learning

## Training Modules
- **Module 1: Introduction**
  - Overview of concepts
  - Key terminology
  - Context and background

- **Module 2: Core Concepts**
  - Detailed explanations
  - Examples and case studies
  - Hands-on exercises

- **Module 3: Advanced Topics**
  - Complex scenarios
  - Best practices
  - Troubleshooting

## Assessment
- Knowledge check quizzes
- Practical exercises
- Case study analysis`;
  } else if (type === "best_practices") {
    return `${baseContent}

## Recommended Approaches
- Follow industry standards
- Leverage proven methodologies
- Adapt to specific contexts
- Continuously improve processes

## Common Pitfalls to Avoid
- Rushing through planning phase
- Ignoring regional compliance
- Failing to document decisions
- Not leveraging existing knowledge

## Success Factors
- Strong client communication
- Cross-office collaboration
- Knowledge sharing culture
- Continuous learning mindset`;
  }

  return baseContent;
}

// ============================================================================
// MAIN SEEDING FUNCTION
// ============================================================================

async function seedOrganizational() {
  try {
    console.log("🌱 Starting Velion Dynamics database seeding...");
    console.log(
      "📋 This will create realistic data aligned with the case study\n"
    );

    const hashedPassword = await bcrypt.hash("password123", 10);
    const createdRegions: (typeof regions.$inferSelect)[] = [];
    const velionEmployees: (typeof users.$inferSelect)[] = [];
    const externalClients: (typeof clients.$inferSelect)[] = [];
    const allProjects: (typeof projects.$inferSelect)[] = [];
    const allRepositories: (typeof repositories.$inferSelect)[] = [];

    // ========================================================================
    // STEP 1: Create Regions
    // ========================================================================
    console.log("🌍 Step 1: Creating regions...");
    for (const regionInfo of regionData) {
      const existingRegion = await db
        .select()
        .from(regions)
        .where(eq(regions.name, regionInfo.name))
        .limit(1);

      if (existingRegion.length > 0) {
        createdRegions.push(existingRegion[0]);
        console.log(`  ✓ Region "${regionInfo.name}" already exists`);
        continue;
      }

      const [region] = await db
        .insert(regions)
        .values({
          name: regionInfo.name, // Branch name
          region: regionInfo.region, // Region name
          dataProtectionLaws: regionInfo.dataProtectionLaws,
          connectivityStatus: regionInfo.connectivityStatus,
        })
        .returning();

      createdRegions.push(region);
      console.log(
        `  ✓ Created branch: ${regionInfo.name} (${regionInfo.region})`
      );
    }

    const europeRegion = createdRegions.find(
      (r) => r.region === "Europe" || r.name === "London Office"
    )!;
    const asiaRegion = createdRegions.find(
      (r) => r.region === "Asia" || r.name === "Tokyo Office"
    )!;
    const naRegion = createdRegions.find(
      (r) => r.region === "North America" || r.name === "New York Office"
    )!;

    // ========================================================================
    // STEP 2: Create Velion Dynamics Users
    // ========================================================================
    console.log("\n👥 Step 2: Creating Velion Dynamics employees...");

    // Create users by region
    const regionUsers = [
      { users: velionUsers.europe, region: europeRegion },
      { users: velionUsers.asia, region: asiaRegion },
      { users: velionUsers.northAmerica, region: naRegion },
    ];

    for (const { users: regionUserList, region } of regionUsers) {
      for (const userInfo of regionUserList) {
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.email, userInfo.email))
          .limit(1);

        if (existingUser.length > 0) {
          velionEmployees.push(existingUser[0]);
          continue;
        }

        // Calculate points and contributions based on role
        let points = 500;
        let contributions = 20;
        if (userInfo.role === "administrator") {
          points = getRandomInt(2500, 3000);
          contributions = getRandomInt(140, 180);
        } else if (userInfo.role === "knowledge_champion") {
          points = getRandomInt(2000, 2500);
          contributions = getRandomInt(100, 150);
        } else if (userInfo.role === "executive_leadership") {
          points = getRandomInt(2200, 2800);
          contributions = getRandomInt(120, 160);
        } else if (userInfo.role === "knowledge_council_member") {
          points = getRandomInt(1900, 2400);
          contributions = getRandomInt(90, 140);
        } else if (userInfo.role === "consultant") {
          points = getRandomInt(1000, 2000);
          contributions = getRandomInt(50, 100);
        }

        // Get department based on role and region
        const department = getDepartmentForUser(
          userInfo.role,
          region.region || region.name
        );

        const [user] = await db
          .insert(users)
          .values({
            email: userInfo.email,
            password: hashedPassword,
            username: `${userInfo.firstName.toLowerCase()}.${userInfo.lastName.toLowerCase()}`,
            name: `${userInfo.firstName} ${userInfo.lastName}`,
            firstName: userInfo.firstName,
            lastName: userInfo.lastName,
            organizationType: "organizational",
            organizationName: "Velion Dynamics",
            role: userInfo.role,
            regionId: region.id,
            department,
            points,
            contributions,
            isActive: true,
            emailVerified: true,
            hireDate: getRandomDate(
              new Date(2019, 0, 1),
              new Date(2023, 11, 31)
            )
              .toISOString()
              .split("T")[0],
          })
          .returning();

        velionEmployees.push(user);
      }
    }

    console.log(
      `  ✓ Created ${velionEmployees.length} Velion Dynamics employees`
    );

    // ========================================================================
    // STEP 3: Create External Clients
    // ========================================================================
    console.log("\n🏢 Step 3: Creating external clients...");

    // Create client company records (not user accounts - these are external companies)
    for (let i = 0; i < clientNames.length; i++) {
      const clientName = clientNames[i];
      const industry = clientIndustries[i % clientIndustries.length];

      // Assign client to a region (distribute evenly)
      const clientRegion = [europeRegion, asiaRegion, naRegion][i % 3];

      // Check if client already exists
      const existingClient = await db
        .select()
        .from(clients)
        .where(eq(clients.name, clientName))
        .limit(1);

      if (existingClient.length > 0) {
        externalClients.push(existingClient[0]);
        console.log(`  ✓ Client company "${clientName}" already exists`);
        continue;
      }

      // Create the client company record (no user account needed)
      const [client] = await db
        .insert(clients)
        .values({
          name: clientName,
          industry,
          regionId: clientRegion.id,
          userId: null, // No user account for external client companies
        })
        .returning();

      externalClients.push(client);
      console.log(`  ✓ Created client company: ${clientName}`);
    }

    console.log(
      `  ✓ Created ${externalClients.length} external client companies`
    );

    // ========================================================================
    // STEP 4: Create Projects
    // ========================================================================
    console.log("\n📁 Step 4: Creating projects...");

    // Get consultants for assigning to projects
    const consultants = velionEmployees.filter((u) => u.role === "consultant");

    let projectIndex = 1;
    for (const client of externalClients) {
      // Each client gets 2-3 projects
      const numProjects = getRandomInt(2, 3);

      // Find consultants from the same region as the client to manage projects
      const clientRegionConsultants = consultants.filter(
        (c) => c.regionId === client.regionId
      );
      // Fallback to all consultants if no regional match
      const availableConsultants =
        clientRegionConsultants.length > 0
          ? clientRegionConsultants
          : consultants;

      for (let i = 0; i < numProjects; i++) {
        const projectType = getRandomElement(projectTypes);
        const projectName = `${projectType} - ${client.name}`;
        const status = getProjectStatus();

        const startDate = getRandomDate(
          new Date(2022, 0, 1),
          new Date(2024, 11, 31)
        );
        const endDate =
          status === "completed" || status === "active"
            ? getRandomDate(startDate, new Date(2025, 11, 31))
            : null;

        // Assign a consultant from the same region (or any consultant if no regional match)
        const consultant = getRandomElement(availableConsultants);

        const [project] = await db
          .insert(projects)
          .values({
            projectCode: generateProjectCode(projectIndex),
            name: projectName,
            clientId: client.id,
            domain: projectType,
            startDate: startDate.toISOString().split("T")[0],
            endDate: endDate ? endDate.toISOString().split("T")[0] : null,
            status,
            leadConsultantId: consultant.id,
            clientSatisfactionScore:
              status === "completed" ? getRandomInt(4, 5) : null,
          })
          .returning();

        allProjects.push(project);
        projectIndex++;
      }
    }

    console.log(`  ✓ Created ${allProjects.length} projects`);

    // ========================================================================
    // STEP 5: Create Workspaces and Add Members
    // ========================================================================
    console.log("\n👥 Step 5: Creating workspaces and adding members...");

    // Check if workspace_members table exists
    let workspaceMembersTableExists = true;
    try {
      await db.select().from(workspaceMembers).limit(1);
    } catch (error: any) {
      if (
        error?.cause?.code === "42P01" ||
        error?.message?.includes("does not exist")
      ) {
        workspaceMembersTableExists = false;
        console.warn(
          "  ⚠️  workspace_members table does not exist. Skipping workspace members creation."
        );
        console.warn(
          "  💡 To create workspace members, run migrations first: npm run db:migrate"
        );
      }
    }

    let workspaceMemberCount = 0;

    for (const project of allProjects) {
      // Get the lead consultant (project owner)
      const leadConsultant = velionEmployees.find(
        (u) => u.id === project.leadConsultantId
      );

      if (!leadConsultant) {
        console.log(
          `  ⚠️  Skipping workspace for project ${project.name} - lead consultant not found`
        );
        continue;
      }

      // Add lead consultant as workspace owner
      if (workspaceMembersTableExists) {
        try {
          const existingOwner = await db
            .select()
            .from(workspaceMembers)
            .where(
              and(
                eq(workspaceMembers.projectId, project.id),
                eq(workspaceMembers.userId, leadConsultant.id)
              )
            )
            .limit(1);

          if (existingOwner.length === 0) {
            await db.insert(workspaceMembers).values({
              projectId: project.id,
              userId: leadConsultant.id,
              role: "owner",
              joinedAt: project.createdAt
                ? new Date(project.createdAt)
                : new Date(),
            });
            workspaceMemberCount++;
          }
        } catch (error: any) {
          console.error(
            `  ⚠️  Error adding owner to workspace for project ${project.name}:`,
            error
          );
        }
      }

      // Get the client's region to find team members from the same region
      const projectClient = externalClients.find(
        (c) => c.id === project.clientId
      );
      const projectRegionId =
        projectClient?.regionId || leadConsultant.regionId;

      // Get available team members (consultants and knowledge champions from same region)
      const availableTeamMembers = velionEmployees.filter(
        (u) =>
          u.id !== leadConsultant.id && // Exclude the lead consultant (already added)
          (u.regionId === projectRegionId || // Same region
            Math.random() > 0.7) && // 30% chance to include cross-regional members
          (u.role === "consultant" ||
            u.role === "knowledge_champion" ||
            u.role === "administrator")
      );

      // Add 2-5 team members to each workspace
      if (workspaceMembersTableExists) {
        const numMembers = getRandomInt(2, 5);
        const selectedMembers = availableTeamMembers
          .sort(() => Math.random() - 0.5) // Shuffle
          .slice(0, Math.min(numMembers, availableTeamMembers.length));

        for (const member of selectedMembers) {
          try {
            // Check if member already exists
            const existingMember = await db
              .select()
              .from(workspaceMembers)
              .where(
                and(
                  eq(workspaceMembers.projectId, project.id),
                  eq(workspaceMembers.userId, member.id)
                )
              )
              .limit(1);

            if (existingMember.length > 0) {
              continue;
            }

            // Assign role based on member's organizational role
            let workspaceRole = "member";
            if (
              member.role === "knowledge_champion" ||
              member.role === "administrator"
            ) {
              workspaceRole = getRandomElement(["admin", "member"]);
            } else if (member.role === "consultant") {
              workspaceRole = getRandomElement(["member", "viewer"]);
            }

            await db.insert(workspaceMembers).values({
              projectId: project.id,
              userId: member.id,
              role: workspaceRole,
              joinedAt: getRandomDate(
                project.createdAt
                  ? new Date(project.createdAt)
                  : new Date(2023, 0, 1),
                new Date()
              ),
            });
            workspaceMemberCount++;
          } catch (error: any) {
            console.error(
              `  ⚠️  Error adding member ${member.name} to workspace for project ${project.name}:`,
              error
            );
          }
        }
      }
    }

    console.log(
      `  ✓ Created workspaces and added ${workspaceMemberCount} workspace members`
    );

    // ========================================================================
    // STEP 6: Create Repositories
    // ========================================================================
    console.log("\n📚 Step 5: Creating repositories...");

    // Global repository (owned by an administrator)
    const admin = velionEmployees.find((u) => u.role === "administrator")!;
    const [globalRepo] = await db
      .insert(repositories)
      .values({
        name: "Global Knowledge Repository",
        description:
          "Central repository for all Velion Dynamics knowledge assets, accessible across all regional offices",
        ownerId: admin.id,
        tags: ["Global", "Knowledge", "Documentation"],
        itemCount: 0,
        contributorCount: 0,
        isPublic: false,
        encryptionEnabled: true,
        searchIndexStatus: "active",
      })
      .returning();
    allRepositories.push(globalRepo);

    // Regional repositories
    const regionalRepos = [
      { name: "Project Documentation - Europe", region: europeRegion },
      { name: "Project Documentation - Asia", region: asiaRegion },
      { name: "Project Documentation - North America", region: naRegion },
    ];

    for (const repoInfo of regionalRepos) {
      const regionChampion = velionEmployees.find(
        (u) =>
          u.role === "knowledge_champion" && u.regionId === repoInfo.region.id
      )!;

      const [repo] = await db
        .insert(repositories)
        .values({
          name: repoInfo.name,
          description: `Regional project documentation and knowledge assets for ${
            repoInfo.region.region || repoInfo.region.name
          } office`,
          ownerId: regionChampion.id,
          tags: [
            repoInfo.region.region || repoInfo.region.name,
            "Projects",
            "Documentation",
          ],
          itemCount: 0,
          contributorCount: 0,
          isPublic: false,
          encryptionEnabled: true,
          searchIndexStatus: "active",
        })
        .returning();
      allRepositories.push(repo);
    }

    // Additional repositories
    const additionalRepoNames = [
      "Best Practices Library",
      "Client Resources",
      "Technical Documentation",
      "Training Materials",
      "Policy & Guidelines",
      "Cross-Office Collaboration",
    ];

    for (const repoName of additionalRepoNames) {
      const owner = getRandomElement(
        velionEmployees.filter(
          (u) => u.role === "administrator" || u.role === "knowledge_champion"
        )
      );

      const [repo] = await db
        .insert(repositories)
        .values({
          name: repoName,
          description: `Repository for ${repoName.toLowerCase()} at Velion Dynamics`,
          ownerId: owner.id,
          tags: [repoName.split(" ")[0], "Knowledge"],
          itemCount: 0,
          contributorCount: 0,
          isPublic: false,
          encryptionEnabled: true,
          searchIndexStatus: "active",
        })
        .returning();
      allRepositories.push(repo);
    }

    console.log(`  ✓ Created ${allRepositories.length} repositories`);

    // ========================================================================
    // STEP 7: Create Knowledge Items
    // ========================================================================
    console.log("\n📝 Step 6: Creating knowledge items...");

    let knowledgeItemCount = 0;

    // Create knowledge items for each repository
    for (const repository of allRepositories) {
      const owner = velionEmployees.find((u) => u.id === repository.ownerId)!;
      const ownerRegion = createdRegions.find((r) => r.id === owner.regionId);
      const regionName = ownerRegion?.region || ownerRegion?.name; // Use region name, fallback to branch name

      // Get projects related to this repository's region or owner
      const relatedProjects = allProjects.filter((p) => {
        const projectClient = externalClients.find((c) => c.id === p.clientId);
        if (!projectClient) return false;
        return (
          projectClient.regionId === owner.regionId ||
          p.leadConsultantId === owner.id
        );
      });

      // Create 8-15 knowledge items per repository
      const numItems = getRandomInt(8, 15);

      for (let i = 0; i < numItems; i++) {
        const type = getRandomElement([...knowledgeTypes]);
        const title = getRandomElement(knowledgeItemTitles);
        const description = `Comprehensive guide for ${title.toLowerCase()}, developed by Velion Dynamics consultants`;

        const originatingProject =
          relatedProjects.length > 0 && Math.random() > 0.4
            ? getRandomElement(relatedProjects)
            : null;

        // Determine status distribution
        let status: (typeof knowledgeStatuses)[number];
        const statusRand = Math.random();
        if (statusRand < 0.6) status = "approved";
        else if (statusRand < 0.85) status = "pending_review";
        else status = "draft";

        // Get validator for approved items
        const validator =
          status === "approved"
            ? velionEmployees.find((u) => u.role === "knowledge_champion")
            : null;

        await db.insert(knowledgeItems).values({
          title,
          description,
          content: generateKnowledgeContent(
            title,
            type as (typeof knowledgeTypes)[number],
            regionName
          ),
          type: type as (typeof knowledgeTypes)[number],
          repositoryId: repository.id,
          authorId: owner.id,
          originatingProjectId: originatingProject?.id || null,
          status,
          tags: [
            type,
            regionName || "Global",
            getRandomElement(["Important", "Reference", "Best Practice"]),
          ],
          views: getRandomInt(50, 800),
          likes: getRandomInt(5, 80),
          isPublished: status === "approved" && Math.random() > 0.2,
          validatedBy: validator?.id || null,
          validatedAt: validator ? new Date() : null,
          lifecycleStatus: status === "approved" ? "approved" : "draft",
        });

        knowledgeItemCount++;
      }
    }

    console.log(`  ✓ Created ${knowledgeItemCount} knowledge items`);

    // ========================================================================
    // STEP 8: Create Comment Contributions
    // ========================================================================
    console.log("\n💬 Step 7: Creating comment contributions...");

    // Get all knowledge items for commenting
    const allKnowledgeItems = await db
      .select({ id: knowledgeItems.id })
      .from(knowledgeItems);

    let commentCount = 0;

    // Only create comments if we have knowledge items
    if (allKnowledgeItems.length > 0) {
      // Create comments for each user
      for (const employee of velionEmployees) {
        // Calculate number of comments based on role
        let numComments = 0;
        if (employee.role === "administrator") {
          numComments = getRandomInt(60, 100);
        } else if (employee.role === "knowledge_champion") {
          numComments = getRandomInt(50, 90);
        } else if (employee.role === "executive_leadership") {
          numComments = getRandomInt(55, 95);
        } else if (employee.role === "knowledge_council_member") {
          numComments = getRandomInt(45, 85);
        } else if (employee.role === "consultant") {
          numComments = getRandomInt(30, 70);
        }

        // Create comment contributions
        for (let i = 0; i < numComments; i++) {
          const randomKnowledgeItem = getRandomElement(allKnowledgeItems);

          await db.insert(contributions).values({
            userId: employee.id,
            knowledgeItemId: randomKnowledgeItem.id,
            type: "commented",
            points: getRandomInt(5, 15), // Comments give 5-15 points
            createdAt: getRandomDate(new Date(2023, 0, 1), new Date()),
          });

          commentCount++;
        }
      }
    } else {
      console.log("  ⚠️  No knowledge items found, skipping comment creation");
    }

    console.log(`  ✓ Created ${commentCount} comment contributions`);

    // ========================================================================
    // STEP 9: Update Repository Counts
    // ========================================================================
    console.log("\n📊 Step 8: Updating repository counts...");

    // Update itemCount for each repository
    for (const repository of allRepositories) {
      const itemCountResult = await db
        .select({ count: count() })
        .from(knowledgeItems)
        .where(eq(knowledgeItems.repositoryId, repository.id));

      const itemCount = itemCountResult[0]?.count || 0;

      // Get unique contributors for this repository
      // Contributors include both users who made contributions AND authors of knowledge items
      const allContributorsResult = await db
        .select({
          userId: contributions.userId,
        })
        .from(contributions)
        .innerJoin(
          knowledgeItems,
          eq(contributions.knowledgeItemId, knowledgeItems.id)
        )
        .where(eq(knowledgeItems.repositoryId, repository.id));

      const allAuthorsResult = await db
        .select({
          userId: knowledgeItems.authorId,
        })
        .from(knowledgeItems)
        .where(eq(knowledgeItems.repositoryId, repository.id));

      // Combine contributors and authors, removing duplicates
      const contributorIds = new Set([
        ...allContributorsResult.map((r) => r.userId).filter(Boolean),
        ...allAuthorsResult.map((r) => r.userId).filter(Boolean),
      ]);
      const totalContributorCount = contributorIds.size;

      await db
        .update(repositories)
        .set({
          itemCount: itemCount,
          contributorCount: totalContributorCount,
        })
        .where(eq(repositories.id, repository.id));

      console.log(
        `  ✓ Updated ${repository.name}: ${itemCount} items, ${totalContributorCount} contributors`
      );
    }

    // ========================================================================
    // SUMMARY
    // ========================================================================
    console.log("\n✅ Velion Dynamics seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Regions: ${createdRegions.length}`);
    console.log(`   - Velion Employees: ${velionEmployees.length}`);
    console.log(`   - External Clients: ${externalClients.length}`);
    console.log(`   - Projects: ${allProjects.length}`);
    console.log(`   - Workspaces: ${allProjects.length} (one per project)`);
    console.log(`   - Workspace Members: ${workspaceMemberCount}`);
    console.log(`   - Repositories: ${allRepositories.length}`);
    console.log(`   - Knowledge Items: ${knowledgeItemCount}`);
    console.log("\n🎉 Database seeded with realistic Velion Dynamics data!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

seedOrganizational()
  .then(() => {
    console.log("\n🎉 Seed script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Seed script failed:", error);
    process.exit(1);
  });
