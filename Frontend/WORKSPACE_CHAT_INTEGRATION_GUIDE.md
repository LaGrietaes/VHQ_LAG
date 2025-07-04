# Workspace-Chat Integration Guide

## Overview

The VHQ_LAG system features a sophisticated integration between the workspace (BookWorkspace) and chat functionality (ChatNotification). This integration allows users to:

1. **Use workspace files as context in chat conversations**
2. **Get real-time updates when workspace files change**
3. **Maintain persistent chat sessions with project context**
4. **Seamlessly switch between workspace and chat modes**

## How It Works

### 🔄 **Event-Driven Communication**

The integration uses a custom event system:

```javascript
// Workspace dispatches events when files change
window.dispatchEvent(new CustomEvent('workspace-refresh', {
  detail: {
    projectId: project?.id,
    projectPath: project?.path,
    timestamp: Date.now()
  }
}));

// Chat system listens for these events
window.addEventListener('workspace-refresh', () => {
  // Refresh project context in chat
  loadProjects();
});
```

### 📁 **Context Selection**

Users can select workspace files as context for chat conversations:

1. **Open the chat drawer** (bottom-right chat icon)
2. **Click "@ Add Context"** in the chat header
3. **Browse projects and files** to select context
4. **Selected context** appears in the chat for AI agents to reference

### 💾 **Persistence**

- **Chat sessions** are saved to `/api/chats` and localStorage
- **Workspace files** are saved to the filesystem with manifest tracking
- **Selected contexts** are persisted in localStorage
- **Project structure** is automatically refreshed when files change

## Testing the Integration

### 🧪 **Automated Test**

Run the integration test by opening the browser console and executing:

```javascript
// Load the test script
fetch('/test-workspace-chat-integration.js')
  .then(response => response.text())
  .then(script => eval(script));
```

### 🔍 **Manual Testing Steps**

1. **Start the development server:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Open the GHOST_AGENT workspace:**
   - Navigate to `/agent/GHOST_AGENT`
   - You should see the BookWorkspace interface

3. **Test file operations:**
   - Create a new file using the "New File" button (📄)
   - Edit the file content
   - Save the changes
   - Verify the file persists after refresh

4. **Test chat integration:**
   - Open the chat drawer (bottom-right icon)
   - Click "@ Add Context" in the chat header
   - Browse and select a project file as context
   - Send a message to the GHOST_AGENT
   - Verify the agent can reference the selected context

5. **Test real-time updates:**
   - Keep the chat drawer open
   - Make changes to workspace files
   - Verify the context options update automatically

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ghost/
│   │   │   └── BookWorkspace.tsx          # Main workspace component
│   │   └── chat-notification.tsx          # Chat drawer component
│   ├── app/
│   │   └── api/
│   │       ├── chats/                     # Chat session management
│   │       ├── projects/                  # Project structure API
│   │       └── workspace/                 # File operations API
│   └── lib/
│       ├── projects-fs.ts                 # File system utilities
│       └── chat-history.ts                # Chat session utilities
├── chat_sessions/                         # Chat session storage
└── GHOST_Proyectos/                       # Workspace file storage
```

## API Endpoints

### Chat Management
- `GET /api/chats` - List all chat sessions
- `POST /api/chats` - Create/update chat session
- `GET /api/chats/[id]` - Get specific chat session
- `PUT /api/chats/[id]` - Update specific chat session
- `DELETE /api/chats/[id]` - Delete specific chat session

### Project Management
- `GET /api/projects` - List all projects
- `GET /api/projects/structure?id=[id]` - Get project structure
- `GET /api/projects/files?path=[path]` - Get project files
- `GET /api/projects/context?id=[id]` - Get project context

### Workspace Operations
- `POST /api/workspace/addItem` - Create new file/folder
- `POST /api/workspace/updateItemContent` - Update file content
- `POST /api/workspace/renameItem` - Rename file/folder
- `POST /api/workspace/deleteItem` - Delete file/folder
- `POST /api/workspace/importFiles` - Import files/folders
- `POST /api/workspace/revealInExplorer` - Open in file explorer

## Troubleshooting

### Common Issues

1. **Development server not running:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Chat drawer not opening:**
   - Check browser console for errors
   - Verify the chat button is visible (bottom-right)
   - Try refreshing the page

3. **Context not updating:**
   - Check if `workspace-refresh` events are being dispatched
   - Verify the ContextFinder component is listening for events
   - Check browser console for errors

4. **Files not persisting:**
   - Check file permissions in the GHOST_Proyectos directory
   - Verify the manifest files are being created
   - Check API endpoint responses

### Debug Commands

```javascript
// Check if workspace refresh events are working
window.addEventListener('workspace-refresh', (e) => {
  console.log('Workspace refresh event:', e.detail);
});

// Manually trigger a workspace refresh
window.dispatchEvent(new CustomEvent('workspace-refresh'));

// Check chat sessions
fetch('/api/chats').then(r => r.json()).then(console.log);

// Check projects
fetch('/api/projects').then(r => r.json()).then(console.log);
```

## Best Practices

1. **Always save files** before switching to chat mode
2. **Use specific file context** for more accurate AI responses
3. **Refresh the workspace** if context seems outdated
4. **Check the console** for any error messages
5. **Use the test file creation** button to verify functionality

## Future Enhancements

- [ ] Real-time collaboration features
- [ ] Cloud sync for chat sessions
- [ ] Advanced context search and filtering
- [ ] Context versioning and history
- [ ] Multi-agent conversations with shared context
- [ ] Context-aware AI suggestions 