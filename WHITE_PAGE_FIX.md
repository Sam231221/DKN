# Fix: White Page When Clicking "Create Item"

## Problem
When clicking "Create Item" button, the page goes white (blank screen).

## This Usually Means:
A JavaScript error is crashing the React component. The browser console will show the error.

## Quick Fix Steps

### Step 1: Open Browser Console
1. Press `F12` (or `Cmd+Option+I` on Mac)
2. Go to **Console** tab
3. Look for **red error messages**
4. Share the error message with me

### Step 2: Common Issues & Fixes

#### Issue 1: Missing Component Export
**Error:** `Cannot find module './file-upload'` or similar

**Fix:** Check if all component files exist:
- ✅ `file-upload.tsx` 
- ✅ `file-preview.tsx`
- ✅ `duplicate-warning.tsx`
- ✅ `compliance-warning.tsx`
- ✅ `repository-select.tsx`

#### Issue 2: Missing Dependency
**Error:** `Cannot find module 'react-dropzone'` or similar

**Fix:** 
- `FileUpload` doesn't use `react-dropzone` (it's custom)
- No additional dependencies needed

#### Issue 3: API Error
**Error:** `Failed to fetch repositories` or network error

**Fix:**
- Check backend is running (`bun dev` in server directory)
- Check you're logged in (token in localStorage)
- Check `/api/repositories` endpoint works

#### Issue 4: Syntax Error
**Error:** Syntax error in component file

**Fix:** Check for:
- Missing closing brackets `}`
- Missing semicolons
- Typos in import statements

## Debugging Steps

### 1. Check Browser Console
```javascript
// Open DevTools (F12)
// Go to Console tab
// Look for errors
```

### 2. Check Network Tab
- Open DevTools (F12)
- Go to Network tab
- Click "Create Item"
- Look for failed requests (red)
- Check if `/api/repositories` request fails

### 3. Check Component Renders
Add a simple test:
```typescript
// In create-knowledge-dialog.tsx, add at the top of the component:
console.log('CreateKnowledgeDialog rendering', { open });
```

### 4. Check React DevTools
- Install React DevTools extension
- Open DevTools → Components tab
- Check if component is mounting
- Look for error boundaries

## Most Likely Cause

Based on the code, the most likely issues are:

1. **RepositorySelect API call failing**
   - Component tries to fetch repositories on mount
   - If API fails, it might crash
   - Check Network tab for `/api/repositories` request

2. **Missing authentication token**
   - RepositorySelect requires authentication
   - Check localStorage has `dkn_token`

3. **Import error**
   - One of the imported components has an error
   - Check browser console for import errors

## Quick Test

Try temporarily removing RepositorySelect to see if dialog opens:

```typescript
// Comment out RepositorySelect temporarily
{/* <RepositorySelect
  value={repositoryId}
  onValueChange={setRepositoryId}
/> */}
<div className="text-sm text-muted-foreground">
  Repository selection temporarily disabled
</div>
```

If dialog opens, the issue is with RepositorySelect.

## Next Steps

1. **Open browser console** (F12)
2. **Copy the error message**
3. **Share it with me** so I can help fix it

Or try:
1. **Check Network tab** for failed requests
2. **Check if backend is running**
3. **Check if you're logged in**

