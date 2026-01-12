# Database Schema Updates - Projects vs Repositories

## Overview

This document outlines the database schema changes made to properly distinguish between **Projects** (transactional/operational data) and **Repositories** (persistent knowledge storage containers) as described in `ProjectVsRepositories.md`.

## Database Changes

### 1. Projects Table Enhancements

**Added Fields:**
- `project_code` (text, unique) - Project identifier like "PRJ-2024-017"
- `domain` (text) - Project domain/area like "Smart Manufacturing"
- `lead_consultant_id` (text, FK to users) - Lead consultant on the project
- `client_satisfaction_score` (integer) - Client satisfaction rating (0-5 scale)

**Purpose:** Projects represent live client engagements with timelines, assigned consultants, and operational metrics.

### 2. Repositories Table Enhancements

**Added Fields:**
- `repository_code` (text, unique) - Repository identifier like "REP-GLOBAL-01"
- `storage_location` (text) - Storage location like "aws-eu-central-1"
- `encryption_enabled` (boolean, default: true) - Whether encryption is enabled
- `retention_policy` (text) - Retention policy like "7 Years" or "Indefinite"
- `search_index_status` (text, default: "active") - Status of search indexing
- `is_public` (boolean, default: false) - Public/private visibility

**Purpose:** Repositories are persistent storage containers (very few in number, typically 1-3) that store knowledge items.

### 3. KnowledgeItems Table Updates

**Added Fields:**
- `originating_project_id` (text, FK to projects) - Project where the knowledge item was created
- `access_level` (accessLevelEnum, default: "internal") - Access control level
- `lifecycle_status` (text, default: "draft") - Lifecycle status

**Relationship:** KnowledgeItems bridge Projects and Repositories:
- Created inside a project (`originating_project_id`)
- Stored inside a repository (`repository_id`)
- Reused by multiple future projects

### 4. KnowledgeAssets Table Updates

**Updated Fields:**
- Changed `project_id` to `originating_project_id` for clarity
- Ensures `repository_id` relationship is maintained

## Migration Instructions

To apply these changes to your database:

1. **Generate Migration:**
   ```bash
   cd server
   npm run db:generate
   ```

2. **Review Migration:**
   Check the generated migration file in `server/src/db/migrations/`

3. **Apply Migration:**
   ```bash
   npm run db:migrate
   ```

## Frontend Changes

### New Pages Created

1. **Projects Page** (`/dashboard/projects`)
   - Table view with pagination
   - Filter by status
   - Search by name, code, client, or domain
   - Shows: Project Code, Name, Client, Domain, Timeline, Lead Consultant, Status, Satisfaction Score

2. **Repositories Page** (Updated)
   - Shows storage configuration: location, encryption, retention policy, search index status
   - Displays repository code
   - Clear indication these are storage containers (not operational projects)

### Updated Components

1. **Organization Sidebar**
   - Added "Projects" navigation item
   - Separated Projects and Repositories in navigation

2. **Knowledge Items Interface**
   - Added `originatingProjectId` field
   - Added `originatingProject` relation in API response type

## Key Differences

| Aspect | Projects | Repositories |
|--------|----------|--------------|
| Data Type | Transactional/Operational | Structural/Configuration |
| Frequency of Change | High (daily updates) | Very Low (rarely changes) |
| Count | Many (thousands per year) | Very Few (1-3 total) |
| Lifecycle | Temporary (time-bound) | Persistent (long-term) |
| Purpose | Track client work | Store knowledge |

## Relationship Pattern

```
Project (1) ---- (0..*) KnowledgeItem ---- (1) Repository
```

- One project produces many knowledge items
- Each knowledge item belongs to exactly one repository
- Knowledge items survive after projects end
- Knowledge items can be reused by multiple future projects

