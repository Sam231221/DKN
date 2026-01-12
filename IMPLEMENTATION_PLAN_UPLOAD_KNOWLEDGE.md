# Implementation Plan: Use Case 2 - Upload Knowledge Resource

## Overview

This plan outlines the implementation of "Use Case 2: Upload Knowledge Resource" based on the case study requirements. The use case enables consultants to contribute documentation, deliverables, assets, templates, and technical resources to the centralized DKN repository.

## Use Case Details (from Case Study)

**Initiator:** Consultant  
**Goal:** Enable consultants to contribute documentation, deliverables, assets, templates, and technical resources to the centralized DKN repository.

**Main Success Scenario:**

1. Consultant logs into the DKN successfully
2. Navigates to knowledge contribution interface
3. Uploads resource and fills required metadata
4. System validates uploaded information
5. NLP detects redundancies
6. Stored with 'Pending Review' status
7. Notifications sent to contributor and reviewers

**Extensions:**

- Incomplete metadata prompts corrections
- Duplicate content flagged
- Compliance violation flagged
- Large file upload handled
- Contribution tracked for performance

---

## Current State Analysis

### ✅ What's Already Implemented

- Basic knowledge items schema (`knowledge_items` table)
- Knowledge items CRUD endpoints (GET, POST, PATCH, DELETE)
- Basic create knowledge dialog (text-based only)
- Knowledge items listing and filtering
- Status enum includes `pending_review`
- Contributions tracking table
- Authentication middleware
- Role-based access control structure

### ❌ What's Missing

- File upload functionality
- File storage system
- Metadata validation
- NLP/redundancy detection service
- Compliance checking
- Notification system
- File handling in create knowledge dialog
- Status set to `pending_review` on upload
- Large file handling
- Progress indicators for uploads
- File preview/display

---

## Implementation Plan

### Phase 1: Database & Schema Updates

#### 1.1 Add File Storage Fields to Schema

**File:** `server/src/db/schema/index.ts`

**Changes:**

- Add `fileUrl: text("file_url")` to `knowledgeItems` table
- Add `fileName: text("file_name")` to `knowledgeItems` table
- Add `fileSize: integer("file_size")` to `knowledgeItems` table
- Add `fileType: text("file_type")` to `knowledgeItems` table
- Add `metadata: jsonb("metadata")` for additional metadata storage
- Add `complianceChecked: boolean("compliance_checked").default(false)`
- Add `complianceViolations: text("compliance_violations").array()`
- Add `duplicateDetected: boolean("duplicate_detected").default(false)`
- Add `similarItems: text("similar_items").array()` (IDs of similar knowledge items)

**Migration:** Generate new migration after schema changes

---

### Phase 2: Backend Implementation

#### 2.1 File Storage Setup

**File:** `server/src/utils/fileStorage.ts` (new file)

**Tasks:**

- Set up file storage solution (options: AWS S3, local filesystem, or cloud storage)
- Create utility functions:
  - `uploadFile(file: Buffer, fileName: string, mimeType: string): Promise<string>` - Upload file and return URL
  - `deleteFile(fileUrl: string): Promise<void>` - Delete file from storage
  - `validateFileSize(fileSize: number): boolean` - Validate file size (max 50MB default)
  - `validateFileType(mimeType: string): boolean` - Validate allowed file types
  - `generateFileName(originalName: string, userId: string): string` - Generate unique filename

**Dependencies to add:**

- `multer` or `express-fileupload` for file upload handling
- `mime-types` for file type validation
- AWS SDK (if using S3) or `fs-extra` (if using local storage)

#### 2.2 Validation Middleware

**File:** `server/src/middleware/knowledgeValidation.ts` (new file)

**Tasks:**

- Create validation rules using `express-validator`:
  - `validateKnowledgeUpload` - Validate title, description, file, metadata
  - `validateFileUpload` - Validate file size, type, format
  - `validateMetadata` - Validate required metadata fields
  - File size limit: 50MB
  - Allowed file types: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, MD, ZIP, images

#### 2.3 NLP/Redundancy Detection Service

**File:** `server/src/services/nlpService.ts` (new file)

**Tasks:**

- Create NLP service for duplicate detection:
  - `detectDuplicates(title: string, content: string, fileContent?: string): Promise<{isDuplicate: boolean, similarItems: string[]}>`
  - Use text similarity algorithms (cosine similarity, Jaccard similarity)
  - Compare against existing knowledge items
  - Return similarity score and list of similar item IDs
  - **Phase 1:** Simple text comparison (basic implementation)
  - **Phase 2:** Integration with external NLP API (OpenAI, Google NLP, etc.)

**Implementation Options:**

- **Simple:** String similarity using libraries like `string-similarity`
- **Advanced:** Integrate with OpenAI embeddings API or Google NLP API
- **Hybrid:** Use simple similarity for quick checks, advanced NLP for accuracy

#### 2.4 Compliance Checking Service

**File:** `server/src/services/complianceService.ts` (new file)

**Tasks:**

- Create compliance checking service:
  - `checkCompliance(knowledgeItem: KnowledgeItem, userRegion: string): Promise<{compliant: boolean, violations: string[]}>`
  - Check against `compliance_rules` table
  - Validate content against regional data protection laws
  - Check for sensitive information patterns (SSN, credit cards, etc.)
  - Return list of compliance violations if any

**Rules to check:**

- Data protection regulations (GDPR, CCPA, etc.)
- Content restrictions based on region
- Sensitive data patterns
- Access level restrictions

#### 2.5 Notification Service

**File:** `server/src/services/notificationService.ts` (new file)

**Tasks:**

- Create notification service:
  - `sendUploadNotification(userId: string, knowledgeItemId: string): Promise<void>`
  - `sendReviewNotification(reviewerIds: string[], knowledgeItemId: string): Promise<void>`
  - Store notifications in database (new `notifications` table needed)
  - Send email notifications (optional, using Nodemailer or SendGrid)
  - Support in-app notifications

**Database Changes:**

- Create `notifications` table:
  - `id`, `userId`, `type`, `message`, `relatedId`, `read`, `createdAt`

#### 2.6 Enhanced Knowledge Controller

**File:** `server/src/controllers/knowledge.controller.ts`

**Tasks:**

- Update `createKnowledgeItem` function:
  - Handle file uploads using multer/fileupload middleware
  - Upload file to storage
  - Validate file and metadata
  - Call NLP service for duplicate detection
  - Call compliance service for compliance checking
  - Set status to `pending_review` (not `draft`)
  - Store file metadata (URL, name, size, type)
  - Create knowledge item record
  - Send notifications
  - Track contribution
  - Return appropriate error messages for validation failures

**Error Handling:**

- File size exceeded
- Invalid file type
- Missing required metadata
- Duplicate content detected (warn but allow)
- Compliance violations (block or warn based on severity)

#### 2.7 Enhanced Knowledge Routes

**File:** `server/src/routes/knowledge.routes.ts`

**Tasks:**

- Add file upload middleware to POST `/knowledge` route
- Add validation middleware
- Ensure authentication is required
- Add rate limiting for uploads (prevent abuse)

#### 2.8 Contribution Tracking Enhancement

**File:** `server/src/controllers/knowledge.controller.ts`

**Tasks:**

- When knowledge item is created:
  - Create entry in `contributions` table
  - Award points based on item type and quality
  - Update user's contribution count

---

### Phase 3: Frontend Implementation

#### 3.1 File Upload Component

**File:** `client/src/components/knowledge/file-upload.tsx` (new file)

**Tasks:**

- Create reusable file upload component:
  - Drag-and-drop file upload area
  - File selection button
  - File preview (icon based on file type)
  - File size display
  - Progress indicator
  - Remove file option
  - File type validation (client-side)
  - File size validation (client-side)

**Features:**

- Visual feedback during upload
- Support for multiple file types
- File preview before upload
- Error handling and display

#### 3.2 Enhanced Create Knowledge Dialog

**File:** `client/src/components/knowledge/create-knowledge-dialog.tsx`

**Tasks:**

- Integrate file upload component
- Add file upload state management
- Add metadata fields:
  - File upload (required for resources, optional for text-only)
  - Type/category selection
  - Repository selection (fetch from API)
  - Tags input
  - Description
  - Access level (if applicable)
- Add form validation:
  - Required fields validation
  - File validation (size, type)
  - Metadata validation
- Add upload progress indicator
- Handle upload errors gracefully
- Show success/error messages
- Display duplicate warnings (if detected)
- Display compliance warnings (if any)

**Form Fields:**

- Title (required)
- Description (required)
- File upload (required for document/resources)
- Type/Category (required) - dropdown
- Repository (required) - dropdown (fetch from API)
- Tags (optional)
- Content/Summary (optional, for text-only items)

#### 3.3 API Integration

**File:** `client/src/lib/api.ts`

**Tasks:**

- Add `uploadKnowledgeItem` function:
  - Accept FormData with file and metadata
  - Upload with progress tracking
  - Handle multipart/form-data
  - Return uploaded knowledge item
- Add error handling for:
  - File size exceeded
  - Invalid file type
  - Network errors
  - Validation errors
  - Duplicate warnings
  - Compliance warnings

**Function Signature:**

```typescript
export async function uploadKnowledgeItem(
  data: {
    title: string;
    description: string;
    file?: File;
    type: string;
    repositoryId?: string;
    tags?: string[];
    content?: string;
  },
  onProgress?: (progress: number) => void
): Promise<KnowledgeItem>;
```

#### 3.4 Repository Selection Component

**File:** `client/src/components/knowledge/repository-select.tsx` (new file)

**Tasks:**

- Create repository selector component
- Fetch repositories from API
- Display repository list with descriptions
- Allow filtering/searching repositories
- Handle loading and error states

#### 3.5 Error Handling & User Feedback

**File:** `client/src/components/knowledge/create-knowledge-dialog.tsx`

**Tasks:**

- Display validation errors inline
- Show upload progress
- Show duplicate detection warnings
- Show compliance warnings
- Show success message after upload
- Handle network errors gracefully
- Provide clear error messages

#### 3.6 Knowledge Item Display Enhancement

**File:** `client/src/components/knowledge/knowledge-list.tsx`

**Tasks:**

- Display file icon/type for items with files
- Show file download link
- Display status badge (pending_review, approved, etc.)
- Show compliance/duplicate warnings if any

---

### Phase 4: Integration & Testing

#### 4.1 Backend Integration

**Tasks:**

- Integrate file storage with knowledge controller
- Integrate NLP service
- Integrate compliance service
- Integrate notification service
- Test all endpoints
- Test error scenarios
- Test file upload limits
- Test duplicate detection
- Test compliance checking

#### 4.2 Frontend Integration

**Tasks:**

- Connect file upload to API
- Test form validation
- Test file upload with progress
- Test error handling
- Test success flows
- Test duplicate warnings
- Test compliance warnings

#### 4.3 End-to-End Testing

**Tasks:**

- Test complete upload flow
- Test validation errors
- Test file size limits
- Test duplicate detection
- Test compliance checking
- Test notifications
- Test contribution tracking

---

### Phase 5: Advanced Features (Future Enhancements)

#### 5.1 Advanced NLP Integration

- Integrate with external NLP APIs (OpenAI, Google NLP)
- Improved duplicate detection accuracy
- Content summarization
- Automatic tagging
- Content categorization

#### 5.2 Advanced Compliance

- Real-time compliance checking
- Integration with compliance management systems
- Automated compliance reports
- Regional compliance rules management

#### 5.3 Advanced Notifications

- Email notifications
- Push notifications
- Notification preferences
- Notification history

#### 5.4 File Processing

- OCR for images/PDFs
- File content extraction
- Automatic metadata extraction
- File versioning

---

## Technical Stack Additions

### Backend Dependencies

```json
{
  "multer": "^1.4.5-lts.1", // File upload handling
  "@types/multer": "^1.4.11",
  "mime-types": "^2.1.35", // File type detection
  "@types/mime-types": "^2.1.1",
  "string-similarity": "^4.0.4", // Simple duplicate detection
  "nodemailer": "^6.9.8", // Email notifications (optional)
  "@types/nodemailer": "^6.4.14",
  "aws-sdk": "^2.1500.0" // AWS S3 storage (if using S3)
  // OR
  "fs-extra": "^11.2.0", // Local file storage
  "@types/fs-extra": "^11.0.4"
}
```

### Frontend Dependencies

```json
{
  "react-dropzone": "^14.2.3", // File upload UI
  "@tanstack/react-query": "^5.17.0" // API state management (optional)
}
```

---

## Database Migration Plan

### Migration 1: Add File Storage Fields

```sql
ALTER TABLE "knowledge_items" ADD COLUMN "file_url" text;
ALTER TABLE "knowledge_items" ADD COLUMN "file_name" text;
ALTER TABLE "knowledge_items" ADD COLUMN "file_size" integer;
ALTER TABLE "knowledge_items" ADD COLUMN "file_type" text;
ALTER TABLE "knowledge_items" ADD COLUMN "metadata" jsonb;
ALTER TABLE "knowledge_items" ADD COLUMN "compliance_checked" boolean DEFAULT false;
ALTER TABLE "knowledge_items" ADD COLUMN "compliance_violations" text[];
ALTER TABLE "knowledge_items" ADD COLUMN "duplicate_detected" boolean DEFAULT false;
ALTER TABLE "knowledge_items" ADD COLUMN "similar_items" text[];
```

### Migration 2: Create Notifications Table (if needed)

```sql
CREATE TABLE "notifications" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL REFERENCES "users"("id"),
  "type" text NOT NULL,
  "message" text NOT NULL,
  "related_id" text,
  "read" boolean DEFAULT false,
  "created_at" timestamp DEFAULT now() NOT NULL
);
```

---

## API Endpoints

### POST /api/knowledge (Enhanced)

**Request:**

- Method: POST
- Content-Type: multipart/form-data
- Body:
  - `file`: File (optional for text-only items)
  - `title`: string (required)
  - `description`: string (required)
  - `type`: string (required)
  - `repositoryId`: string (optional)
  - `tags`: string[] (optional)
  - `content`: string (optional)

**Response:**

```json
{
  "status": "success",
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "fileUrl": "string",
    "fileName": "string",
    "fileSize": number,
    "fileType": "string",
    "status": "pending_review",
    "duplicateDetected": boolean,
    "similarItems": ["id1", "id2"],
    "complianceChecked": boolean,
    "complianceViolations": [],
    ...
  },
  "warnings": [
    "Duplicate content detected",
    "Compliance warning: ..."
  ]
}
```

**Error Responses:**

- 400: Validation error
- 413: File too large
- 415: Unsupported file type
- 409: Duplicate content (warning, not blocking)

---

## Implementation Timeline

### Week 1: Backend Foundation

- Day 1-2: Database schema updates and migration
- Day 3-4: File storage setup
- Day 5: Validation middleware

### Week 2: Backend Services

- Day 1-2: NLP/duplicate detection service
- Day 3: Compliance checking service
- Day 4: Notification service
- Day 5: Enhanced knowledge controller

### Week 3: Frontend Implementation

- Day 1-2: File upload component
- Day 3: Enhanced create dialog
- Day 4: API integration
- Day 5: Error handling and feedback

### Week 4: Testing & Refinement

- Day 1-2: Backend testing
- Day 3: Frontend testing
- Day 4: End-to-end testing
- Day 5: Bug fixes and refinements

---

## Success Criteria

✅ Consultants can upload files (PDFs, documents, etc.)  
✅ Metadata is validated before submission  
✅ Files are stored securely  
✅ Status is set to `pending_review` automatically  
✅ Duplicate content is detected and warned  
✅ Compliance is checked  
✅ Notifications are sent to relevant parties  
✅ Contributions are tracked  
✅ Large files are handled properly  
✅ Errors are handled gracefully  
✅ User feedback is clear and actionable

---

## Notes

1. **File Storage:** Choose between local filesystem (development) or cloud storage (production). AWS S3 is recommended for production.

2. **NLP Service:** Start with simple text similarity for Phase 1. Integrate advanced NLP APIs in Phase 2.

3. **Compliance:** Begin with basic pattern matching. Enhance with regional rules management later.

4. **Notifications:** Start with in-app notifications. Add email notifications in Phase 2.

5. **Security:** Ensure file uploads are validated, scanned for malware, and stored securely.

6. **Performance:** Consider async processing for NLP and compliance checks for large files.

7. **Scalability:** Use queue system (Bull, BullMQ) for processing large files and NLP checks in the future.

---

## References

- Case Study Document: `casetstudyproject.md`
- Current Schema: `server/src/db/schema/index.ts`
- Current Controller: `server/src/controllers/knowledge.controller.ts`
- Current Routes: `server/src/routes/knowledge.routes.ts`
- Current Frontend: `client/src/components/knowledge/create-knowledge-dialog.tsx`
