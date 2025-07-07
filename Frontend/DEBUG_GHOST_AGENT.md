# Ghost Agent Debug Guide

## Current Issue Fixed

The 500 error was caused by the UnifiedFileManager not being initialized with the correct projects root path.

### What was wrong:
```typescript
// ❌ Wrong - no parameters
const fileManager = new UnifiedFileManager();

// ✅ Fixed - with correct projects root
const fileManager = new UnifiedFileManager(process.env.GHOST_PROJECTS_ROOT || 'GHOST_Proyectos');
```

## Debug Information Added

### 1. API Request Logging
```javascript
console.log('[Ghost Agent API] Received request:', { message, projectPath });
```

### 2. UnifiedFileManager Initialization
```javascript
console.log('[UnifiedFileManager] Initializing with projects root:', projectsRoot);
```

### 3. Path Resolution
```javascript
console.log('[UnifiedFileManager] Resolving project path:', { projectPath, projectsRoot });
console.log('[UnifiedFileManager] Resolved path:', { cleanPath, resolvedPath });
```

### 4. File Content Lookup
```javascript
console.log(`[GhostAgentPanel] Looking for file: ${fileName}, found path: ${fullFilePath}`);
```

## Expected Console Output

When the system works correctly, you should see:

```
[Ghost Agent API] Received request: { message: "Analiza los siguientes archivos...", projectPath: "GHOST_Proyectos/libros/Boceto_101_Tips_para_Hablar_con_la_IA" }
[UnifiedFileManager] Initializing with projects root: GHOST_Proyectos
[UnifiedFileManager] Resolving project path: { projectPath: "GHOST_Proyectos/libros/Boceto_101_Tips_para_Hablar_con_la_IA", projectsRoot: "GHOST_Proyectos" }
[UnifiedFileManager] Resolved path: { cleanPath: "libros/Boceto_101_Tips_para_Hablar_con_la_IA", resolvedPath: "GHOST_Proyectos/libros/Boceto_101_Tips_para_Hablar_con_la_IA" }
[GhostAgentPanel] Looking for file: 01 – BePolite_ Ser educado con la IA.md, found path: Ejemplos e Ideas/01 – BePolite_ Ser educado con la IA.md
```

## Testing Steps

1. **Mark your files** using the hover icons
2. **Open Ghost Agent** panel
3. **Run Analysis** - check console for debug output
4. **Verify no 500 errors** in network tab
5. **Check file content retrieval** works

## Common Issues and Solutions

### Issue: "Project path is required" error
**Cause:** projectPath is undefined
**Solution:** Check that the frontend is passing projectPath correctly

### Issue: "Project directory not found" error
**Cause:** Resolved path doesn't exist
**Solution:** Verify GHOST_PROJECTS_ROOT environment variable

### Issue: "File not found" error
**Cause:** File path resolution issue
**Solution:** Check that files are in the expected subdirectories

## Environment Variables

Make sure these are set correctly:
```bash
GHOST_PROJECTS_ROOT=GHOST_Proyectos
```

## Next Steps

1. Test the system with the debug logging
2. Verify all console messages appear correctly
3. Check that file operations work as expected
4. Remove debug logging once confirmed working

---

**Ready to test the fixed system! 🚀** 