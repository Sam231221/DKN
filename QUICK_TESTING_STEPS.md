# Quick Testing Steps - Frontend Upload Feature

## 🚀 Quick Start

1. **Start Backend:**
   ```bash
   cd server
   bun dev
   # Runs on http://localhost:3000
   ```

2. **Start Frontend:**
   ```bash
   cd client
   npm run dev
   # or bun dev
   # Runs on http://localhost:5173
   ```

3. **Login to the app:**
   - Navigate to http://localhost:5173/login
   - Login with your credentials
   - Token will be stored in localStorage

---

## 📍 How to Access Upload Dialog

1. **Via Knowledge Page:**
   - Navigate to: `/explore/knowledge`
   - Click "Create Item" button (top right)
   - Dialog opens

2. **Via Sidebar:**
   - Click "Create Knowledge" button in sidebar
   - Navigates to `/explore/knowledge`
   - Click "Create Item" button

---

## ✅ Quick Test Checklist

### Test 1: Basic File Upload
- [ ] Open Create Knowledge Dialog
- [ ] Drag a PDF file into upload area
- [ ] File preview appears with icon and size
- [ ] Fill in Title: "Test Document"
- [ ] Fill in Description: "This is a test"
- [ ] Select Type: "Documentation"
- [ ] Click "Upload Knowledge Item"
- [ ] Progress bar shows (0-100%)
- [ ] Success message appears
- [ ] Dialog closes after 2 seconds

### Test 2: Validation
- [ ] Try submitting without title → Shows error
- [ ] Try submitting without description → Shows error
- [ ] Try submitting without file/content → Shows error
- [ ] Fill all required fields → Form validates

### Test 3: File Preview
- [ ] Upload a file
- [ ] Check file preview shows:
  - [ ] File icon (emoji)
  - [ ] File name
  - [ ] File size (KB/MB)
  - [ ] Remove button (X)
- [ ] Click X → File is removed
- [ ] Upload area appears again

### Test 4: Repository Selection
- [ ] Open dialog
- [ ] Repository dropdown loads (may show "Loading...")
- [ ] Select a repository
- [ ] Repository is selected
- [ ] Submit form
- [ ] Item is associated with selected repository

### Test 5: Tags
- [ ] Type a tag in tags input
- [ ] Press Enter or click "Add"
- [ ] Tag appears as badge
- [ ] Click X on tag → Tag is removed
- [ ] Add multiple tags
- [ ] All tags appear

### Test 6: Content Only (No File)
- [ ] Open dialog
- [ ] Don't upload a file
- [ ] Fill in Title, Description
- [ ] Fill in Content text area
- [ ] Submit
- [ ] Upload succeeds

### Test 7: Error Handling
- [ ] Try uploading file > 50MB → Shows error
- [ ] Try uploading invalid file type → Shows error
- [ ] Stop backend server → Network error appears
- [ ] Fix error and retry → Works

---

## 🔍 Browser DevTools Testing

### Open DevTools (F12)

1. **Console Tab:**
   - Check for JavaScript errors
   - Look for red error messages
   - Check for warnings (yellow)

2. **Network Tab:**
   - Upload a file
   - Find POST request to `/api/knowledge`
   - Check:
     - Status: 201 Created
     - Request has `multipart/form-data`
     - Response has `data` object
     - May have `warnings`, `similarItems`, `complianceViolations`

3. **Application Tab:**
   - Check localStorage
   - Verify `dkn_token` exists
   - Verify `dkn_user` exists

---

## 🐛 Common Issues

### Issue: Dialog Doesn't Open
**Solution:**
- Check console for errors
- Verify you're logged in
- Check `/explore/knowledge` route exists

### Issue: File Upload Doesn't Work
**Solution:**
- Check file size < 50MB
- Check file type is allowed (PDF, DOC, images, etc.)
- Check console for errors
- Verify backend is running

### Issue: Repository Dropdown Not Loading
**Solution:**
- Check Network tab for `/api/repositories` request
- Verify backend endpoint works
- Check authentication token is valid

### Issue: Progress Bar Stuck
**Solution:**
- This is normal for small files (may complete too fast)
- For larger files, progress should update
- Check Network tab for actual upload progress

### Issue: Success Message But Item Not Appearing
**Solution:**
- Check Network tab - verify 201 response
- Refresh the knowledge list page
- Check backend logs for errors
- Verify item was saved in database

---

## 🧪 Manual Testing Scenarios

### Scenario 1: Happy Path
1. Login → Navigate to `/explore/knowledge` → Click "Create Item"
2. Upload a PDF file (drag & drop)
3. Fill: Title="API Guide", Description="API documentation"
4. Select Type="Documentation", Repository="Product Documentation"
5. Add tags: "api", "documentation", "guide"
6. Click "Upload Knowledge Item"
7. ✅ Success! Item appears in list with status "pending_review"

### Scenario 2: Duplicate Detection
1. Create item with title "Getting Started Guide"
2. Create another item with similar title "Getting Started Guide v2"
3. Fill form and submit
4. ✅ Duplicate warning appears (yellow card)
5. ✅ Shows similar items found
6. ✅ Upload still succeeds (warning, not blocking)

### Scenario 3: Compliance Warning
1. Create item with content containing "SSN: 123-45-6789"
2. Submit form
3. ✅ Compliance warning appears (red card)
4. ✅ Lists specific violations
5. ✅ Upload still succeeds (warning, not blocking)

### Scenario 4: Content Only (No File)
1. Open dialog
2. Don't upload file
3. Fill: Title, Description, Content (text area)
4. Submit
5. ✅ Upload succeeds with content only

### Scenario 5: Error Handling
1. Try submitting without required fields
2. ✅ Validation errors appear
3. Fill required fields
4. Try uploading file > 50MB
5. ✅ File size error appears
6. Upload valid file
7. ✅ Upload succeeds

---

## 📊 What to Check

After uploading an item:

1. **In Knowledge List:**
   - Item appears in list
   - Shows correct title and description
   - Status shows "pending_review"
   - File icon appears (if file uploaded)
   - Download link works (if file uploaded)
   - File size is displayed (if file uploaded)

2. **In Network Tab:**
   - POST request to `/api/knowledge` succeeded (201)
   - Response contains knowledge item data
   - May contain warnings/similarItems/complianceViolations

3. **In Database:**
   - Item exists in `knowledge_items` table
   - `status` = "pending_review"
   - `fileUrl`, `fileName`, `fileSize`, `fileType` populated (if file uploaded)
   - `duplicateDetected`, `similarItems` populated (if duplicates found)
   - `complianceChecked`, `complianceViolations` populated (if violations found)

---

## 🔗 Quick Links

- **Full Testing Guide:** `FRONTEND_TESTING_GUIDE.md`
- **Implementation Plan:** `IMPLEMENTATION_PLAN_UPLOAD_KNOWLEDGE.md`
- **Knowledge Page:** http://localhost:5173/explore/knowledge
- **Backend API:** http://localhost:3000/api/knowledge

---

## 💡 Tips

1. **Use Browser DevTools:**
   - F12 to open DevTools
   - Console tab for errors
   - Network tab for API requests
   - Application tab for localStorage

2. **Test Different File Types:**
   - PDF files
   - Word documents (DOC, DOCX)
   - Images (JPG, PNG)
   - Text files (TXT)

3. **Test Different File Sizes:**
   - Small files (< 1MB)
   - Medium files (1-10MB)
   - Large files (10-50MB)
   - Files > 50MB (should fail)

4. **Test Error Scenarios:**
   - Network errors (stop backend)
   - Validation errors (missing fields)
   - File errors (invalid type, too large)
   - Server errors (backend returns 500)

5. **Test Warnings:**
   - Create duplicate items (similar titles)
   - Add compliance-violating content (SSN, credit cards)

---

## ✅ Testing Checklist Summary

**Quick Checklist:**
- [ ] File upload works (drag & drop and click)
- [ ] File preview displays correctly
- [ ] Form validation works
- [ ] Upload with file succeeds
- [ ] Upload with content only succeeds
- [ ] Progress bar shows
- [ ] Success message appears
- [ ] Dialog closes after success
- [ ] Item appears in knowledge list
- [ ] Repository selection works
- [ ] Tags can be added/removed
- [ ] Error messages display correctly
- [ ] Duplicate warnings appear (if duplicates exist)
- [ ] Compliance warnings appear (if violations exist)
- [ ] Download links work (for uploaded files)

---

Happy Testing! 🎉

