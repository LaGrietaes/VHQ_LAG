# Unified File Management System

## Overview

The Unified File Management System is a complete rewrite of the file operations infrastructure that addresses all the issues identified in the previous implementation. It provides a single, robust API endpoint for all file and folder operations with consistent error handling and state management.

## Key Improvements

### 1. Single Source of Truth
- **Unified API**: All file operations now go through `/api/unified-file-operations`
- **Filesystem-First**: Always reads from the actual filesystem, no manifest synchronization issues
- **Consistent State**: UI state is always rebuilt from disk, eliminating sync problems

### 2. Robust File Operations
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Validation**: Proper validation of file names, paths, and operations
- **Conflict Resolution**: Handles file/folder name conflicts gracefully
- **Sanitization**: Automatically sanitizes file names to prevent filesystem issues

### 3. Simplified Architecture
- **One API Endpoint**: Replaces multiple overlapping APIs
- **Clear Response Format**: Consistent success/error response structure
- **No Local Storage Dependencies**: State is always fresh from the backend

## API Reference

### Endpoint: `/api/unified-file-operations`

#### GET Request
Get project structure:
```
GET /api/unified-file-operations?projectPath=GHOST_Proyectos/libros/ProjectName
```

#### POST Request
All operations use the same endpoint with different `action` parameters:

```json
{
  "action": "operation_name",
  "projectPath": "GHOST_Proyectos/libros/ProjectName",
  // ... additional parameters
}
```

### Available Actions

#### 1. `getStructure`
Get the complete project structure:
```json
{
  "action": "getStructure",
  "projectPath": "GHOST_Proyectos/libros/ProjectName"
}
```

#### 2. `createFile`
Create a new file:
```json
{
  "action": "createFile",
  "projectPath": "GHOST_Proyectos/libros/ProjectName",
  "fileName": "new-file.md",
  "content": "# File content",
  "parentPath": "optional/parent/folder"
}
```

#### 3. `createFolder`
Create a new folder:
```json
{
  "action": "createFolder",
  "projectPath": "GHOST_Proyectos/libros/ProjectName",
  "folderName": "new-folder",
  "parentPath": "optional/parent/folder"
}
```

#### 4. `updateContent`
Update file content:
```json
{
  "action": "updateContent",
  "projectPath": "GHOST_Proyectos/libros/ProjectName",
  "filePath": "file.md",
  "content": "# Updated content"
}
```

#### 5. `rename`
Rename a file or folder:
```json
{
  "action": "rename",
  "projectPath": "GHOST_Proyectos/libros/ProjectName",
  "oldPath": "old-name.md",
  "newName": "new-name.md"
}
```

#### 6. `delete`
Delete a file or folder:
```json
{
  "action": "delete",
  "projectPath": "GHOST_Proyectos/libros/ProjectName",
  "itemPath": "file-or-folder-to-delete"
}
```

#### 7. `move`
Move an item to a different location:
```json
{
  "action": "move",
  "projectPath": "GHOST_Proyectos/libros/ProjectName",
  "itemPath": "item-to-move",
  "targetParentPath": "destination/folder"
}
```

#### 8. `import`
Import multiple files:
```json
{
  "action": "import",
  "projectPath": "GHOST_Proyectos/libros/ProjectName",
  "files": [
    {
      "name": "file1.md",
      "content": "# Content 1"
    },
    {
      "name": "file2.md", 
      "content": "# Content 2"
    }
  ],
  "parentPath": "optional/parent/folder"
}
```

## Response Format

All API responses follow this consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* operation-specific data */ },
  "updatedStructure": { /* complete project structure */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "User-friendly error message",
  "error": "ERROR_CODE"
}
```

## Error Codes

- `FILE_EXISTS`: File already exists
- `FOLDER_EXISTS`: Folder already exists
- `FILE_NOT_FOUND`: File not found
- `ITEM_NOT_FOUND`: Item not found
- `NOT_A_FILE`: Path is not a file
- `ITEM_EXISTS`: Item already exists at destination
- `TARGET_NOT_FOUND`: Target directory not found
- `CREATE_FAILED`: Failed to create item
- `UPDATE_FAILED`: Failed to update content
- `RENAME_FAILED`: Failed to rename item
- `DELETE_FAILED`: Failed to delete item
- `MOVE_FAILED`: Failed to move item
- `IMPORT_FAILED`: Failed to import files
- `INTERNAL_ERROR`: Internal server error

## Frontend Integration

### BookWorkspace Component Updates

The BookWorkspace component has been updated to use the unified API:

1. **Removed Local Storage Dependencies**: No more caching in localStorage
2. **Unified Error Handling**: Consistent error messages and user feedback
3. **Removed Debug Buttons**: Cleaned up UI by removing test/debug buttons
4. **Improved State Management**: Always loads fresh state from backend

### Key Changes

1. **API Calls**: All operations now use `/api/unified-file-operations`
2. **Error Handling**: Proper error messages shown to users
3. **State Refresh**: Automatic refresh after operations
4. **Drag & Drop**: Improved move operations with better validation

## Migration Guide

### For Developers

1. **Replace Old APIs**: Update any code using the old file operation APIs
2. **Update Error Handling**: Use the new error response format
3. **Remove Manifest Dependencies**: No more manifest file handling needed

### For Users

1. **Cleaner UI**: Removed debug buttons and clutter
2. **Better Error Messages**: Clear feedback when operations fail
3. **More Reliable**: Operations are more consistent and reliable

## Testing

Use the provided test script to verify the API works correctly:

```bash
# Run the test script
node frontend/test-unified-file-manager.js
```

Or run it in the browser console on the frontend page.

## Future Enhancements

1. **Project Renaming**: Implement proper project directory renaming
2. **Project Deletion**: Implement proper project directory deletion
3. **Reveal in Explorer**: Implement proper file explorer integration
4. **File Watching**: Add real-time file change detection
5. **Batch Operations**: Support for bulk file operations

## Troubleshooting

### Common Issues

1. **"Project directory not found"**: Ensure the project path is correct
2. **"File already exists"**: Choose a different name or delete the existing file
3. **"Item not found"**: The file/folder may have been moved or deleted externally

### Debug Mode

Enable debug logging by checking the browser console for detailed operation logs.

## Benefits

1. **Reliability**: No more sync issues between UI and filesystem
2. **Consistency**: All operations use the same API and error handling
3. **Maintainability**: Single codebase for all file operations
4. **User Experience**: Better error messages and more reliable operations
5. **Performance**: No unnecessary local storage operations 