import { db } from "./connection.js";
import { users, repositories, knowledgeItems } from "./schema/index.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

async function seed() {
  try {
    console.log("🌱 Starting database seed...");

    const hashedPassword = await bcrypt.hash("password123", 10);

    // Get or create users
    let admin = await db.select().from(users).where(eq(users.email, "admin@velion.com")).limit(1);
    if (admin.length === 0) {
      [admin[0]] = await db
        .insert(users)
        .values({
          email: "admin@velion.com",
          password: hashedPassword,
          name: "Sarah Johnson",
          role: "administrator",
          points: 2500,
          contributions: 142,
        })
        .returning();
    }

    let champion = await db.select().from(users).where(eq(users.email, "champion@velion.com")).limit(1);
    if (champion.length === 0) {
      [champion[0]] = await db
        .insert(users)
        .values({
          email: "champion@velion.com",
          password: hashedPassword,
          name: "Michael Chen",
          role: "knowledge_champion",
          points: 1850,
          contributions: 98,
        })
        .returning();
    }

    let consultant1 = await db.select().from(users).where(eq(users.email, "consultant1@velion.com")).limit(1);
    if (consultant1.length === 0) {
      [consultant1[0]] = await db
        .insert(users)
        .values({
          email: "consultant1@velion.com",
          password: hashedPassword,
          name: "Emma Wilson",
          role: "consultant",
          points: 1200,
          contributions: 56,
        })
        .returning();
    }

    let consultant2 = await db.select().from(users).where(eq(users.email, "john.doe@velion.com")).limit(1);
    if (consultant2.length === 0) {
      [consultant2[0]] = await db
        .insert(users)
        .values({
          email: "john.doe@velion.com",
          password: hashedPassword,
          name: "John Doe",
          role: "consultant",
          points: 850,
          contributions: 42,
        })
        .returning();
    }

    // Get or create repositories
    let repo1 = await db.select().from(repositories).where(eq(repositories.name, "Product Documentation")).limit(1);
    if (repo1.length === 0) {
      [repo1[0]] = await db
        .insert(repositories)
        .values({
          name: "Product Documentation",
          description: "Comprehensive product guides and technical documentation",
          ownerId: admin[0].id,
          itemCount: 0,
          contributorCount: 0,
          tags: ["Documentation", "Product"],
        })
        .returning();
    }

    let repo2 = await db.select().from(repositories).where(eq(repositories.name, "Best Practices")).limit(1);
    if (repo2.length === 0) {
      [repo2[0]] = await db
        .insert(repositories)
        .values({
          name: "Best Practices",
          description: "Organizational standards and recommended workflows",
          ownerId: champion[0].id,
          itemCount: 0,
          contributorCount: 0,
          tags: ["Guidelines", "Standards"],
        })
        .returning();
    }

    let repo3 = await db.select().from(repositories).where(eq(repositories.name, "Training Materials")).limit(1);
    if (repo3.length === 0) {
      [repo3[0]] = await db
        .insert(repositories)
        .values({
          name: "Training Materials",
          description: "Training guides and educational resources",
          ownerId: admin[0].id,
          itemCount: 0,
          contributorCount: 0,
          tags: ["Training", "Education"],
        })
        .returning();
    }

    // Check if knowledge items already exist
    const existingItems = await db.select().from(knowledgeItems).limit(1);
    if (existingItems.length > 0) {
      console.log("ℹ️  Knowledge items already exist, skipping seed");
      return;
    }

    // Create knowledge items
    const seedItems = [
      {
        title: "API Integration Best Practices",
        description: "Comprehensive guide for integrating third-party APIs securely and efficiently",
        content: `# API Integration Best Practices

## Overview
This document outlines the best practices for integrating third-party APIs in our systems.

## Security Considerations
- Always use HTTPS
- Implement proper authentication
- Validate and sanitize all inputs
- Use environment variables for API keys

## Error Handling
- Implement retry logic with exponential backoff
- Log all API errors for monitoring
- Provide meaningful error messages to users

## Performance
- Implement caching where appropriate
- Use connection pooling
- Monitor API response times`,
        type: "technical" as const,
        repositoryId: repo1[0].id,
        authorId: admin[0].id,
        status: "approved" as const,
        tags: ["API", "Security", "Integration", "Backend"],
        views: 342,
        likes: 28,
        isPublished: true,
        validatedBy: champion[0].id,
        validatedAt: new Date(),
      },
      {
        title: "Client Onboarding Checklist",
        description: "Step-by-step process for onboarding new clients and ensuring smooth transitions",
        content: `# Client Onboarding Checklist

## Pre-Onboarding
- [ ] Send welcome email with credentials
- [ ] Schedule kickoff meeting
- [ ] Prepare onboarding materials
- [ ] Set up client accounts

## Onboarding Process
- [ ] Conduct initial meeting
- [ ] Review project scope
- [ ] Assign account manager
- [ ] Provide access to systems

## Post-Onboarding
- [ ] Follow-up survey
- [ ] Schedule check-in meetings
- [ ] Monitor usage metrics`,
        type: "procedure" as const,
        repositoryId: repo2[0].id,
        authorId: consultant1[0].id,
        status: "approved" as const,
        tags: ["Onboarding", "Client", "Process", "Checklist"],
        views: 521,
        likes: 45,
        isPublished: true,
        validatedBy: champion[0].id,
        validatedAt: new Date(),
      },
      {
        title: "Security Incident Response Protocol",
        description: "Detailed procedures for handling security incidents and data breaches",
        content: `# Security Incident Response Protocol

## Incident Classification
1. Critical - Immediate response required
2. High - Response within 1 hour
3. Medium - Response within 4 hours
4. Low - Response within 24 hours

## Response Steps
1. Identify and contain the incident
2. Assess the impact
3. Notify stakeholders
4. Remediate the issue
5. Document and review

## Contact Information
- Security Team: security@velion.com
- Emergency Hotline: +1-XXX-XXX-XXXX`,
        type: "policy" as const,
        repositoryId: repo2[0].id,
        authorId: admin[0].id,
        status: "approved" as const,
        tags: ["Security", "Protocol", "Emergency", "Compliance"],
        views: 289,
        likes: 34,
        isPublished: true,
        validatedBy: champion[0].id,
        validatedAt: new Date(),
      },
      {
        title: "React Component Library Guidelines",
        description: "Standards and best practices for building reusable React components",
        content: `# React Component Library Guidelines

## Component Structure
- Use functional components with hooks
- Follow single responsibility principle
- Keep components small and focused

## Naming Conventions
- Use PascalCase for component names
- Use descriptive prop names
- Prefix utilities with 'use'

## Best Practices
- Use TypeScript for type safety
- Implement proper error boundaries
- Write unit tests for all components
- Document component props and usage`,
        type: "documentation" as const,
        repositoryId: repo1[0].id,
        authorId: consultant2[0].id,
        status: "approved" as const,
        tags: ["React", "Components", "Frontend", "Guidelines"],
        views: 412,
        likes: 52,
        isPublished: true,
        validatedBy: champion[0].id,
        validatedAt: new Date(),
      },
      {
        title: "Database Migration Strategy",
        description: "Guide for planning and executing database schema migrations safely",
        content: `# Database Migration Strategy

## Planning Phase
- Review schema changes thoroughly
- Create migration scripts
- Test in development environment
- Plan rollback strategy

## Execution
- Run migrations during low-traffic periods
- Monitor database performance
- Have rollback plan ready
- Document all changes

## Best Practices
- Never modify existing migrations
- Use transactions when possible
- Test migrations on staging first`,
        type: "technical" as const,
        repositoryId: repo1[0].id,
        authorId: consultant1[0].id,
        status: "pending_review" as const,
        tags: ["Database", "Migration", "Backend", "DevOps"],
        views: 198,
        likes: 19,
        isPublished: false,
      },
      {
        title: "New Employee Training Program",
        description: "Comprehensive training program for new employees covering all essential topics",
        content: `# New Employee Training Program

## Week 1: Orientation
- Company culture and values
- Organizational structure
- Tools and systems overview
- Security policies

## Week 2: Technical Training
- Development environment setup
- Code review process
- Testing standards
- Deployment procedures

## Week 3: Project Work
- Shadow experienced team members
- Complete assigned tasks
- Attend team meetings
- Submit first code review`,
        type: "training" as const,
        repositoryId: repo3[0].id,
        authorId: admin[0].id,
        status: "approved" as const,
        tags: ["Training", "Onboarding", "HR", "Process"],
        views: 312,
        likes: 41,
        isPublished: true,
        validatedBy: champion[0].id,
        validatedAt: new Date(),
      },
      {
        title: "Client Communication Best Practices",
        description: "Guidelines for effective communication with clients and maintaining professional relationships",
        content: `# Client Communication Best Practices

## Communication Channels
- Email for formal communication
- Slack for quick updates
- Meetings for important discussions
- Documentation for references

## Best Practices
- Respond within 24 hours
- Be clear and concise
- Use professional tone
- Document all decisions
- Set expectations clearly

## Escalation Process
1. Team Lead
2. Project Manager
3. Department Head
4. Executive Team`,
        type: "best_practices" as const,
        repositoryId: repo2[0].id,
        authorId: consultant1[0].id,
        status: "approved" as const,
        tags: ["Communication", "Client", "Professional", "Guidelines"],
        views: 425,
        likes: 38,
        isPublished: true,
        validatedBy: champion[0].id,
        validatedAt: new Date(),
      },
      {
        title: "Project Management Methodology",
        description: "Standard project management approach and methodologies used across the organization",
        content: `# Project Management Methodology

## Methodology Overview
We use a hybrid Agile-Waterfall approach tailored to project needs.

## Phases
1. Initiation - Project kickoff and planning
2. Planning - Detailed planning and resource allocation
3. Execution - Development and implementation
4. Monitoring - Progress tracking and adjustments
5. Closure - Delivery and retrospective

## Tools
- Jira for task tracking
- Confluence for documentation
- Slack for communication
- Git for version control`,
        type: "guideline" as const,
        repositoryId: repo2[0].id,
        authorId: admin[0].id,
        status: "approved" as const,
        tags: ["Project Management", "Methodology", "Process"],
        views: 267,
        likes: 29,
        isPublished: true,
        validatedBy: champion[0].id,
        validatedAt: new Date(),
      },
    ];

    for (const item of seedItems) {
      await db.insert(knowledgeItems).values(item);
    }

    console.log("✅ Database seed completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log("🎉 Seed script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Seed script failed:", error);
    process.exit(1);
  });
