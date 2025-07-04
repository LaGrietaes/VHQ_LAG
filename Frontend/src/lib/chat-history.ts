// Shared types and utilities for chat history management

export interface Message {
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

export interface ChatSession {
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
  userId?: string // For future user authentication
  projectId?: string // For project-specific chats
}

export interface ChatHistoryManager {
  saveSession(session: ChatSession): void
  loadSessions(): ChatSession[]
  deleteSession(sessionId: string): void
  updateSession(sessionId: string, updates: Partial<ChatSession>): void
  exportSessions(sessionIds?: string[]): Promise<Blob>
  importSessions(data: string): Promise<ChatSession[]>
  clearAllSessions(): void
  getSessionStats(): {
    totalSessions: number
    totalMessages: number
    totalSize: number
    lastBackup?: string
  }
}

// Utility functions
export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}_${String(d.getHours()).padStart(2,'0')}-${String(d.getMinutes()).padStart(2,'0')}-${String(d.getSeconds()).padStart(2,'0')}`
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export function generateSessionId(agents: string[]): string {
  return `${agents.join('_')}_${Date.now()}`
}

export function getSessionName(agents: string[], agentsData: any[]): string {
  if (agents.length === 1) {
    const agent = agentsData.find(a => a.id === agents[0])
    return agent ? `Chat with ${agent.name}` : `Chat with ${agents[0]}`
  }
  return `Group Chat: ${agents.join(", ")}`
}

// Data migration utilities
export function migrateSession(session: any, version: string = '2.0.0'): ChatSession {
  // Handle version migration
  if (!session.version || session.version === '1.0.0') {
    return {
      ...session,
      metadata: {
        tags: [],
        priority: 'medium',
        isArchived: false,
        messageCount: session.messages?.length || 0,
        userMessageCount: session.messages?.filter((m: any) => m.isUser)?.length || 0,
        agentMessageCount: session.messages?.filter((m: any) => !m.isUser)?.length || 0
      },
      version
    }
  }
  
  return session
}

// Export format generators
export function generateTextExport(session: ChatSession): string {
  return [
    `Chat Session Export`,
    `==================`,
    `Session: ${session.name}`,
    `ID: ${session.id}`,
    `Agents: ${session.agents.join(', ')}`,
    `Created: ${session.createdAt}`,
    `Updated: ${session.updatedAt}`,
    `Messages: ${session.messages.length}`,
    `Tags: ${session.metadata.tags.join(', ')}`,
    `Priority: ${session.metadata.priority}`,
    ``,
    `Messages:`,
    `========`,
    ...session.messages.map((m, i) => [
      `${i + 1}. [${m.timestamp}] ${m.isUser ? 'You' : m.agentId}:`,
      m.content,
      m.metadata?.attachments?.length ? `   Attachments: ${m.metadata.attachments.map(a => a.name).join(', ')}` : '',
      ``
    ].filter(Boolean).join('\n'))
  ].join('\n')
}

// Generate conversation title based on content
export function generateConversationTitle(messages: Message[], maxLength: number = 50): string {
  if (messages.length === 0) {
    return "Empty Chat"
  }

  // Get the first user message or first message
  const firstMessage = messages.find(m => m.isUser) || messages[0]
  if (!firstMessage) {
    return "Empty Chat"
  }

  let title = firstMessage.content.trim()
  
  // Remove common prefixes and clean up
  title = title.replace(/^(hi|hello|hey|greetings|good morning|good afternoon|good evening|can you|please|help me|i need|i want|i would like|i'm looking for|i am looking for)/i, '')
  title = title.replace(/^(write|create|generate|make|build|develop|design|analyze|review|check|examine|study|research|explain|describe|tell me about|what is|how to|how do i|can you explain|please explain)/i, '')
  
  // Clean up extra whitespace and punctuation
  title = title.replace(/^[.,!?;:\s]+/, '').replace(/[.,!?;:\s]+$/, '')
  
  // If still empty or too short, try the first agent message
  if (title.length < 10) {
    const firstAgentMessage = messages.find(m => !m.isUser)
    if (firstAgentMessage) {
      title = firstAgentMessage.content.trim()
      title = title.replace(/^[.,!?;:\s]+/, '').replace(/[.,!?;:\s]+$/, '')
    }
  }
  
  // If still empty, use a generic title
  if (!title || title.length < 5) {
    return `Chat ${new Date(messages[0].timestamp).toLocaleDateString()}`
  }
  
  // Truncate if too long
  if (title.length > maxLength) {
    title = title.substring(0, maxLength - 3) + '...'
  }
  
  return title
}

export function generateCsvExport(session: ChatSession): string {
  const headers = ['Timestamp', 'Sender', 'Content', 'Attachments', 'Tags']
  const rows = session.messages.map(m => [
    m.timestamp,
    m.isUser ? 'User' : m.agentId,
    `"${m.content.replace(/"/g, '""')}"`,
    m.metadata?.attachments?.map(a => a.name).join(';') || '',
    m.metadata?.tags?.join(';') || ''
  ])
  
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
}

// Backend API utilities
export async function syncToBackend(session: ChatSession): Promise<boolean> {
  try {
    const response = await fetch('/api/chats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session })
    })
    
    if (!response.ok) {
      throw new Error('Failed to sync to backend')
    }
    
    return true
  } catch (error) {
    console.error('Backend sync failed:', error)
    return false
  }
}

export async function loadFromBackend(): Promise<ChatSession[]> {
  try {
    const response = await fetch('/api/chats')
    
    if (!response.ok) {
      throw new Error('Failed to load from backend')
    }
    
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Backend load failed:', error)
    return []
  }
} 