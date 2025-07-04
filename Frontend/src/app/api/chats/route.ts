import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, mkdir, access } from 'fs/promises'
import { join } from 'path'

// Backend-friendly chat session interface
interface ChatSessionBackend {
  id: string
  agents: string[]
  name: string
  createdAt: string
  updatedAt: string
  messages: Array<{
    id: string
    agentId: string
    content: string
    timestamp: string
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
  }>
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

// File-based storage functions
const CHATS_DIR = join(process.cwd(), 'chat_sessions')

async function ensureChatsDirectory() {
  try {
    await access(CHATS_DIR)
  } catch {
    await mkdir(CHATS_DIR, { recursive: true })
  }
}

async function saveSessionToFile(session: ChatSessionBackend) {
  await ensureChatsDirectory()
  
  const sessionFile = join(CHATS_DIR, `${session.id}.json`)
  const sessionData = JSON.stringify(session, null, 2)
  
  await writeFile(sessionFile, sessionData, 'utf-8')
  
  // Also save to a timestamped backup file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupFile = join(CHATS_DIR, 'backups', `${session.id}_${timestamp}.json`)
  await mkdir(join(CHATS_DIR, 'backups'), { recursive: true })
  await writeFile(backupFile, sessionData, 'utf-8')
  
  console.log(`Session ${session.id} saved to ${sessionFile} and backup`)
}

async function loadSessionFromFile(sessionId: string): Promise<ChatSessionBackend | null> {
  try {
    const sessionFile = join(CHATS_DIR, `${sessionId}.json`)
    const data = await readFile(sessionFile, 'utf-8')
    return JSON.parse(data)
  } catch {
    return null
  }
}

async function loadAllSessions(): Promise<ChatSessionBackend[]> {
  try {
    await ensureChatsDirectory()
    const { readdir } = await import('fs/promises')
    const files = await readdir(CHATS_DIR)
    
    const sessions: ChatSessionBackend[] = []
    for (const file of files) {
      if (file.endsWith('.json') && !file.includes('_')) {
        const sessionId = file.replace('.json', '')
        const session = await loadSessionFromFile(sessionId)
        if (session) {
          sessions.push(session)
        }
      }
    }
    
    return sessions
  } catch (error) {
    console.error('Failed to load sessions:', error)
    return []
  }
}

// GET /api/chats - Retrieve chat sessions
export async function GET(request: NextRequest) {
  try {
    const sessions = await loadAllSessions()
    
    return NextResponse.json({
      success: true,
      data: sessions,
      count: sessions.length
    })
  } catch (error) {
    console.error('Failed to retrieve chat sessions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve chat sessions' },
      { status: 500 }
    )
  }
}

// POST /api/chats - Create or update chat session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const session: ChatSessionBackend = body.session
    
    await saveSessionToFile(session)
    
    return NextResponse.json({
      success: true,
      data: session,
      message: 'Chat session saved successfully'
    })
  } catch (error) {
    console.error('Failed to save chat session:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save chat session' },
      { status: 500 }
    )
  }
}

// PUT /api/chats/[id] - Update specific chat session
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const updates = body.updates
    
    // TODO: Implement database update
    // For now, just return success
    
    return NextResponse.json({
      success: true,
      message: 'Chat session updated successfully'
    })
  } catch (error) {
    console.error('Failed to update chat session:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update chat session' },
      { status: 500 }
    )
  }
}

// DELETE /api/chats/[id] - Delete specific chat session
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id
    
    // TODO: Implement database delete
    // For now, just return success
    
    return NextResponse.json({
      success: true,
      message: 'Chat session deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete chat session:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete chat session' },
      { status: 500 }
    )
  }
} 