import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, unlink, access } from 'fs/promises'
import { join } from 'path'

// File-based storage functions
const CHATS_DIR = join(process.cwd(), 'chat_sessions')

async function ensureChatsDirectory() {
  try {
    await access(CHATS_DIR)
  } catch {
    const { mkdir } = await import('fs/promises')
    await mkdir(CHATS_DIR, { recursive: true })
  }
}

async function loadSessionFromFile(sessionId: string) {
  try {
    const sessionFile = join(CHATS_DIR, `${sessionId}.json`)
    const data = await readFile(sessionFile, 'utf-8')
    return JSON.parse(data)
  } catch {
    return null
  }
}

async function saveSessionToFile(session: any) {
  await ensureChatsDirectory()
  
  const sessionFile = join(CHATS_DIR, `${session.id}.json`)
  const sessionData = JSON.stringify(session, null, 2)
  
  await writeFile(sessionFile, sessionData, 'utf-8')
  
  // Also save to a timestamped backup file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupFile = join(CHATS_DIR, 'backups', `${session.id}_${timestamp}.json`)
  const { mkdir } = await import('fs/promises')
  await mkdir(join(CHATS_DIR, 'backups'), { recursive: true })
  await writeFile(backupFile, sessionData, 'utf-8')
  
  console.log(`Session ${session.id} updated and backed up`)
}

async function deleteSessionFile(sessionId: string) {
  try {
    const sessionFile = join(CHATS_DIR, `${sessionId}.json`)
    await unlink(sessionFile)
    console.log(`Session ${sessionId} deleted`)
  } catch (error) {
    console.error(`Failed to delete session ${sessionId}:`, error)
  }
}

// GET /api/chats/[id] - Retrieve specific chat session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params
    const session = await loadSessionFromFile(sessionId)
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Chat session not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: session
    })
  } catch (error) {
    console.error('Failed to retrieve chat session:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve chat session' },
      { status: 500 }
    )
  }
}

// PUT /api/chats/[id] - Update specific chat session
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params
    const body = await request.json()
    const updates = body.updates
    
    // Load existing session
    const existingSession = await loadSessionFromFile(sessionId)
    if (!existingSession) {
      return NextResponse.json(
        { success: false, error: 'Chat session not found' },
        { status: 404 }
      )
    }
    
    // Apply updates
    const updatedSession = { ...existingSession, ...updates, updatedAt: new Date().toISOString() }
    
    // Save updated session
    await saveSessionToFile(updatedSession)
    
    return NextResponse.json({
      success: true,
      data: updatedSession,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params
    
    // Check if session exists
    const existingSession = await loadSessionFromFile(sessionId)
    if (!existingSession) {
      return NextResponse.json(
        { success: false, error: 'Chat session not found' },
        { status: 404 }
      )
    }
    
    // Delete session file
    await deleteSessionFile(sessionId)
    
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