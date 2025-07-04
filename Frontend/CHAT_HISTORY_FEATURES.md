# Chat History Features

## Overview
The chat history system provides comprehensive local storage with automatic backend synchronization and a backend-friendly data structure for managing chat sessions with AI agents.

## Features

### 1. Enhanced Data Structure
- **Message Interface**: Supports metadata including attachments, tags, and priority levels
- **ChatSession Interface**: Includes comprehensive metadata with message counts, timestamps, and versioning
- **Backend-Ready**: Designed for easy integration with database systems

### 2. Dual Storage System
- **LocalStorage**: Immediate local persistence for fast access
- **Automatic Backend Sync**: Every chat session and message is automatically saved to backend files
- **Data Migration**: Handles version updates and data structure changes
- **Error Handling**: Graceful fallbacks for storage failures

### 3. Automatic Backend Storage
- **File-Based Storage**: Chat sessions automatically saved to `chat_sessions/` directory
- **Backup System**: Automatic timestamped backups for every session update
- **Real-Time Sync**: Every new chat and message triggers automatic backend save
- **Storage Monitoring**: Automatic 1GB storage limit checking with warnings

### 4. Session Management
- **Session Statistics**: Real-time display of session counts, message counts, and storage size
- **Clear All**: Option to clear all chat history with confirmation
- **Individual Session Management**: Delete and update individual sessions
- **Storage Optimization**: Automatic cleanup recommendations when storage exceeds 1GB

### 5. UI Integration
- **New Chat Button**: Creates new chat sessions with unique IDs
- **Session Stats**: Display in agent roster sidebar with storage monitoring
- **Management Controls**: Clear button in stats panel
- **Automatic Feedback**: Console logging for backend save operations

## API Endpoints

### GET /api/chats
Retrieve all chat sessions for the current user.

### POST /api/chats
Create or update a chat session.

### PUT /api/chats/[id]
Update a specific chat session.

### DELETE /api/chats/[id]
Delete a specific chat session.

## Data Structure

### Message
```typescript
interface Message {
  id: string
  agentId: string
  content: string
  timestamp: Date
  isUser: boolean
  metadata?: {
    attachments?: Array<{
      name: string
      type: string
      size?: number
    }>
    tags?: string[]
    priority?: 'low' | 'medium' | 'high'
  }
}
```

### ChatSession
```typescript
interface ChatSession {
  id: string
  agents: string[]
  name: string
  createdAt: string
  updatedAt: string
  messages: Message[]
  metadata: {
    tags: string[]
    priority: 'low' | 'medium' | 'high'
    isArchived: boolean
    lastReadAt?: string
    messageCount: number
    userMessageCount: number
    agentMessageCount: number
  }
  version: string
  userId?: string
  projectId?: string
}
```

## Usage

### Create New Chat
1. Select one or more agents using the checkboxes
2. Click the "+" button in the chat header
3. A new chat session will be created with a unique ID
4. The session is automatically saved to both localStorage and backend

### View Session Statistics
- Session count, message count, and storage size are displayed in the agent roster sidebar
- Storage warnings appear in console when approaching 1GB limit

### Clear All History
1. Click "Clear" button in the session stats panel
2. Confirm the action
3. All chat history will be permanently deleted from both localStorage and backend

## Technical Details

### Storage System
- **LocalStorage**: Uses `vhq_chat_sessions_v2` as key with version 2.0.0 data structure
- **Backend Storage**: Files saved to `chat_sessions/` directory in project root
- **Backup System**: Automatic timestamped backups in `chat_sessions/backups/` directory

### File Structure
```
chat_sessions/
├── session_id_1.json          # Current session file
├── session_id_2.json          # Current session file
└── backups/
    ├── session_id_1_timestamp.json  # Backup files
    └── session_id_2_timestamp.json  # Backup files
```

### Automatic Operations
- **New Chat**: Creates unique session ID with timestamp
- **Message Addition**: Auto-saves to both localStorage and backend
- **Session Updates**: Automatic backend synchronization
- **Storage Monitoring**: 1GB limit checking with console warnings

### Error Handling
- Graceful fallbacks for both localStorage and backend failures
- Console logging for debugging backend operations
- Automatic retry mechanisms for failed backend saves

## Future Enhancements

### Planned Features
- **Database Integration**: Replace file-based storage with proper database
- **Search Functionality**: Search through chat history
- **Session Tagging**: Add custom tags to sessions
- **Archive Management**: Archive old sessions
- **Automatic Cleanup**: Smart cleanup of old sessions when storage limit is reached
- **Multi-User Support**: User-specific chat isolation
- **Real-Time Sync**: WebSocket-based real-time synchronization

### Backend Integration
- Database schema ready for implementation
- API endpoints prepared for backend integration
- User authentication support included in data structure
- File-based storage currently implemented as proof of concept 