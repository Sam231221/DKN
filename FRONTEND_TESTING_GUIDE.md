# Frontend Testing Guide - Upload Knowledge Resource Feature

This guide will help you test the frontend implementation of the Upload Knowledge Resource feature (Phase 1-4).

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Manual Testing Steps](#manual-testing-steps)
3. [Component Testing](#component-testing)
4. [API Integration Testing](#api-integration-testing)
5. [Browser Testing](#browser-testing)
6. [Common Issues & Solutions](#common-issues--solutions)

---

## Prerequisites

Before testing, ensure:

1. **Backend Server is Running**

   ```bash
   cd server
   bun dev
   # Server should run on http://localhost:3000
   ```

2. **Frontend Server is Running**

   ```bash
   cd client
   npm run dev
   # or
   bun dev
   # Frontend should run on http://localhost:5173
   ```

3. **Database is Set Up**

   - Ensure PostgreSQL is running
   - Migrations are applied
   - User account exists for testing

4. **User Authentication**
   - You should be logged in to test protected features
   - Have a valid JWT token in localStorage (`dkn_token`)

---

## Manual Testing Steps

### Test 1: File Upload Component

**Location:** `/explore/knowledge` or wherever `CreateKnowledgeDialog` is used

**Steps:**

1. Click the "Create Knowledge Item" or "Upload Knowledge Resource" button
2. The dialog should open with a file upload area
3. Test drag & drop:
   - Drag a file (PDF, DOC, image) into the upload area
   - The file should be accepted and preview should appear
4. Test click to upload:
   - Click the upload area
   - Select a file from file picker
   - File should be displayed with preview
5. Test file removal:
   - Click the X button on the file preview
   - File should be removed
6. Test invalid file types:
   - Try uploading `.exe`, `.bat`, or other restricted files
   - Should show an error message
7. Test file size limit:
   - Try uploading a file larger than 50MB
   - Should show an error message

**Expected Results:**

- ✅ File upload area is visible
- ✅ Drag & drop works
- ✅ File preview shows correct icon, name, and size
- ✅ Invalid files are rejected with clear error messages
- ✅ Files over 50MB are rejected

---

### Test 2: Form Validation

**Steps:**

1. Open the Create Knowledge Dialog
2. Try submitting without filling any fields
   - Should show "Title is required" error
3. Fill in title only
   - Should show "Description is required" error
4. Fill title and description but no file/content
   - Should show "Either a file or content is required" error
5. Fill all required fields correctly
   - Form should validate successfully

**Expected Results:**

- ✅ Validation errors appear for missing required fields
- ✅ Error messages are clear and actionable
- ✅ Form prevents submission until valid
- ✅ No errors when all required fields are filled

---

### Test 3: Upload Knowledge Item (Happy Path)

**Steps:**

1. Open Create Knowledge Dialog
2. Fill in:
   - **Title:** "Test Knowledge Item"
   - **Description:** "This is a test description"
   - **Type:** Select "Documentation" (or any type)
   - **Repository:** Select a repository (optional)
   - **Content:** Add some content text OR upload a file
   - **Tags:** Add 1-3 tags
3. Click "Upload Knowledge Item"
4. Observe:
   - Progress bar should appear and show upload progress
   - Loading spinner on button
   - Button text changes to "Uploading..."
5. Wait for completion
6. Check results:
   - Success message should appear: "Knowledge item uploaded successfully! Status: Pending Review"
   - Dialog should close after 2 seconds (or 5 seconds if warnings)
   - Form should be reset

**Expected Results:**

- ✅ Progress bar shows upload progress (0-100%)
- ✅ Success message appears
- ✅ Dialog closes automatically
- ✅ Form resets
- ✅ Item appears in knowledge list with status "pending_review"

---

### Test 4: Duplicate Detection Warning

**Steps:**

1. Create a knowledge item with a specific title (e.g., "API Documentation Guide")
2. Try to create another item with a similar title (e.g., "API Documentation Guide - Updated")
3. Fill in the form and submit
4. Observe:
   - Duplicate warning should appear
   - Should show similar items found
   - Should display similarity scores
   - Should have "View" links for similar items

**Expected Results:**

- ✅ Duplicate warning card appears (yellow/amber color)
- ✅ Shows number of similar items
- ✅ Lists top 3 similar items with titles
- ✅ Shows similarity percentage for each
- ✅ "View" button opens similar item in new tab
- ✅ Upload still succeeds (warning, not blocking)

---

### Test 5: Compliance Warning

**Steps:**

1. Create a knowledge item with content that triggers compliance checks:
   - Include text like "SSN: 123-45-6789" (potential SSN)
   - Include multiple email addresses
   - Include phone numbers
   - Include "personal data" without GDPR compliance statement
2. Submit the form
3. Observe:
   - Compliance warning should appear
   - Should list specific violations
   - Should use red/destructive color scheme

**Expected Results:**

- ✅ Compliance warning card appears (red color)
- ✅ Lists specific violations found
- ✅ Clear description of each violation
- ✅ Upload still succeeds (warning, not blocking)

---

### Test 6: Repository Selection

**Steps:**

1. Open Create Knowledge Dialog
2. Check the Repository dropdown:
   - Should load repositories from API
   - Should show loading state initially
   - Should display repository name and description
3. Select a repository
4. Submit the form
5. Verify the item is associated with selected repository

**Expected Results:**

- ✅ Repository dropdown loads successfully
- ✅ Shows loading state while fetching
- ✅ Displays repository names and descriptions
- ✅ Selected repository is saved with knowledge item
- ✅ Item appears under correct repository

---

### Test 7: File Preview Component

**Steps:**

1. Upload a file in the dialog
2. Check file preview displays:
   - File icon (emoji based on type)
   - File name (truncated if too long)
   - File size (formatted: KB or MB)
   - File type badge
   - Download button (if fileUrl exists)
   - Remove button (X icon)
3. Test remove functionality
4. Test download functionality (if applicable)

**Expected Results:**

- ✅ File preview shows all metadata correctly
- ✅ File icon matches file type
- ✅ File size is formatted properly
- ✅ Remove button works
- ✅ Download link works (opens in new tab)

---

### Test 8: Error Handling

**Test Network Errors:**

1. Stop the backend server
2. Try to upload a knowledge item
3. Should show network error message

**Test Server Errors:**

1. Backend running but returns error (e.g., 400, 500)
2. Error message should appear in dialog
3. Form should not close
4. User can retry

**Test File Upload Errors:**

1. Try uploading corrupted file
2. Try uploading file when storage is full
3. Should show appropriate error messages

**Expected Results:**

- ✅ Network errors are caught and displayed
- ✅ Server errors show clear messages
- ✅ Form doesn't close on error
- ✅ User can fix errors and retry
- ✅ Error messages are user-friendly

---

### Test 9: Progress Tracking

**Steps:**

1. Upload a large file (>5MB)
2. Observe upload progress:
   - Progress bar should appear
   - Percentage should update (0% → 100%)
   - Progress bar fills from left to right
3. Test with small files:
   - Progress should update quickly
   - May not see intermediate steps for very small files

**Expected Results:**

- ✅ Progress bar appears during upload
- ✅ Percentage updates smoothly
- ✅ Progress bar fills visually
- ✅ Progress completes at 100%

---

### Test 10: Knowledge List Display

**Steps:**

1. Navigate to knowledge list page
2. Check items with files display:
   - File icon (emoji)
   - Download link
   - File size
   - File type badge
3. Check items with duplicate warnings:
   - "Duplicate detected" badge appears
4. Check items with compliance issues:
   - "Compliance issues" badge appears
5. Test download functionality:
   - Click download link
   - File should download or open in browser

**Expected Results:**

- ✅ File information is displayed correctly
- ✅ Download links work
- ✅ Status badges appear for warnings
- ✅ File icons match file types

---

## Component Testing

### Testing Individual Components

#### FileUpload Component

**Test Cases:**

```typescript
// Test file selection
- onFileSelect callback is called with selected file
- File validation runs before callback
- Invalid files trigger error state
- Drag & drop triggers file selection
- Click triggers file picker

// Test validation
- File size validation (max 50MB)
- File type validation (allowed extensions)
- Error messages are displayed
```

#### FilePreview Component

**Test Cases:**

```typescript
- Displays file name correctly
- Formats file size properly (B, KB, MB)
- Shows correct file icon
- Download link works (if fileUrl provided)
- Remove button calls onRemove callback
- Handles long file names (truncation)
```

#### DuplicateWarning Component

**Test Cases:**

```typescript
- Renders when similarItems.length > 0
- Displays correct number of similar items
- Shows similarity scores with color coding
- onViewItem callback works
- Handles empty array (returns null)
- Limits display to top 3 items
```

#### ComplianceWarning Component

**Test Cases:**

```typescript
- Renders violations when violations.length > 0
- Shows success state when checked && no violations
- Returns null when not checked && no violations
- Lists all violations
- Uses correct color scheme (red for violations, green for success)
```

#### RepositorySelect Component

**Test Cases:**

```typescript
- Fetches repositories on mount
- Shows loading state
- Handles API errors
- Displays repository names and descriptions
- onValueChange callback works
- Handles empty repositories list
```

---

## API Integration Testing

### Test API Calls

#### 1. Upload Knowledge Item API

**Manual Test:**

1. Open browser DevTools (F12)
2. Go to Network tab
3. Upload a knowledge item
4. Check the POST request to `/api/knowledge`:
   - Request method: POST
   - Content-Type: multipart/form-data
   - Body contains: title, description, type, file (if uploaded), tags, etc.
   - Headers include Authorization: Bearer <token>
5. Check response:
   - Status: 201 Created
   - Response body contains `data` with knowledge item
   - May contain `warnings`, `similarItems`, `complianceViolations`

**Expected Request:**

```
POST /api/knowledge
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- title: "Test Item"
- description: "Test description"
- type: "documentation"
- file: <File object>
- tags: ["tag1", "tag2"]
```

**Expected Response:**

```json
{
  "status": "success",
  "data": {
    "id": "...",
    "title": "Test Item",
    "status": "pending_review",
    "fileUrl": "/uploads/...",
    ...
  },
  "warnings": ["Potential duplicate detected..."],
  "similarItems": [...],
  "complianceViolations": [...]
}
```

#### 2. Fetch Repositories API

**Manual Test:**

1. Open Create Knowledge Dialog
2. Check Network tab for GET request to `/api/repositories`
3. Verify:
   - Request includes Authorization header
   - Response contains array of repositories
   - Each repository has: id, name, description

---

## Browser Testing

### Test in Different Browsers

Test the feature in:

- ✅ Chrome/Chromium (latest)
- ✅ Firefox (latest)
- ✅ Safari (if on macOS)
- ✅ Edge (latest)

**Check for:**

- File upload works in all browsers
- Drag & drop works (may vary by browser)
- Progress tracking works
- File preview displays correctly
- Download links work
- Styling is consistent

### Test Responsive Design

**Screen Sizes to Test:**

- Desktop (1920x1080)
- Laptop (1366x768)
- Tablet (768x1024)
- Mobile (375x667, 414x896)

**Check:**

- Dialog is responsive
- File preview adapts to screen size
- Text doesn't overflow
- Buttons are accessible
- Forms are usable on mobile

---

## Common Issues & Solutions

### Issue 1: File Upload Not Working

**Symptoms:**

- Clicking upload area doesn't open file picker
- Files selected but not showing in preview

**Solutions:**

- Check browser console for errors
- Verify `FileUpload` component is imported correctly
- Check file input `accept` attribute
- Ensure file size is within limit (50MB)
- Check file type is allowed

### Issue 2: Upload Progress Not Showing

**Symptoms:**

- Progress bar doesn't appear
- Stuck at 0% or 100%

**Solutions:**

- Check XMLHttpRequest progress events
- Verify `onProgress` callback is being called
- Check network tab for actual upload progress
- May be too fast to see for small files

### Issue 3: Warnings Not Displaying

**Symptoms:**

- Duplicate/compliance warnings don't appear
- Response has warnings but UI doesn't show them

**Solutions:**

- Check response in Network tab for `warnings` field
- Verify `setSimilarItems` and `setComplianceViolations` are called
- Check component render conditions
- Verify components are imported correctly

### Issue 4: Repository Dropdown Not Loading

**Symptoms:**

- Shows "Loading repositories..." indefinitely
- Shows error message

**Solutions:**

- Check backend `/api/repositories` endpoint works
- Verify authentication token is valid
- Check browser console for API errors
- Verify CORS is configured correctly

### Issue 5: Form Not Resetting

**Symptoms:**

- Form fields retain values after submission
- Dialog doesn't close

**Solutions:**

- Check `setTimeout` delay (2-5 seconds)
- Verify all state variables are reset in `handleClose`
- Check for errors preventing form reset
- Verify `onOpenChange(false)` is called

### Issue 6: Download Link Not Working

**Symptoms:**

- Download link appears but doesn't work
- File doesn't download

**Solutions:**

- Check `fileUrl` is correct (starts with `/uploads/`)
- Verify backend serves static files from `/uploads` directory
- Check file exists on server
- Verify CORS allows file downloads
- Check file permissions on server

---

## Quick Testing Checklist

Use this checklist for quick testing:

- [ ] File upload component renders
- [ ] Drag & drop works
- [ ] File validation works (size, type)
- [ ] File preview displays correctly
- [ ] Form validation works (required fields)
- [ ] Upload with file works
- [ ] Upload with content only works
- [ ] Upload progress shows
- [ ] Success message appears
- [ ] Dialog closes after success
- [ ] Form resets correctly
- [ ] Duplicate warning appears (if duplicates exist)
- [ ] Compliance warning appears (if violations exist)
- [ ] Repository selection works
- [ ] Tags can be added/removed
- [ ] Error messages display correctly
- [ ] Network errors are handled
- [ ] Knowledge list shows file information
- [ ] Download links work
- [ ] Status badges display correctly

---

## Automated Testing (Optional)

If you want to set up automated tests:

### Using Vitest (Recommended for Vite projects)

1. **Install Vitest:**

   ```bash
   cd client
   npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
   ```

2. **Create test file:** `client/src/components/knowledge/create-knowledge-dialog.test.tsx`

3. **Example test:**

   ```typescript
   import { describe, it, expect, vi } from "vitest";
   import { render, screen } from "@testing-library/react";
   import { CreateKnowledgeDialog } from "./create-knowledge-dialog";

   describe("CreateKnowledgeDialog", () => {
     it("renders form fields", () => {
       render(<CreateKnowledgeDialog open={true} onOpenChange={vi.fn()} />);
       expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
       expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
     });
   });
   ```

---

## Debugging Tips

1. **Check Browser Console:**

   - Open DevTools (F12)
   - Look for errors or warnings
   - Check Network tab for failed requests

2. **Check React DevTools:**

   - Install React DevTools extension
   - Inspect component state
   - Check props and state values

3. **Add Console Logs:**

   ```typescript
   console.log("File selected:", file);
   console.log("Upload result:", result);
   console.log("Similar items:", similarItems);
   ```

4. **Check localStorage:**

   - Verify `dkn_token` exists
   - Check token is not expired
   - Verify token format

5. **Check Network Requests:**
   - Use Network tab in DevTools
   - Check request headers
   - Check response status and body
   - Look for CORS errors

---

## Next Steps

After testing:

1. **Fix any bugs found**
2. **Document edge cases**
3. **Optimize performance if needed**
4. **Add error boundaries for better error handling**
5. **Consider adding loading skeletons**
6. **Add accessibility improvements (ARIA labels, keyboard navigation)**

---

## Need Help?

If you encounter issues:

1. Check the browser console for errors
2. Check the network tab for failed requests
3. Verify backend is running and accessible
4. Check database connection
5. Review this guide for common issues

Happy Testing! 🧪
