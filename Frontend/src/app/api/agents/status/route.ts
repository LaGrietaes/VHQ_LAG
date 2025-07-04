import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET() {
  try {
    // Get the current working directory and go to parent
    const parentDir = process.cwd().replace(/\\frontend$/, '')
    
    // Check for running Python processes that might be our agents
    const { stdout: pythonProcesses } = await execAsync('tasklist /FI "IMAGENAME eq python.exe" /FO CSV')
    
    // Check for running Ollama processes
    const { stdout: ollamaProcesses } = await execAsync('tasklist /FI "IMAGENAME eq ollama.exe" /FO CSV')
    
    // Parse the processes to see which agents are running
    const runningAgents = new Set<string>()
    
    // Check for specific agent processes (this is a simplified approach)
    // In a real implementation, you'd want to check for specific process names or ports
    if (pythonProcesses.includes('python.exe')) {
      // For now, we'll assume if Python is running, some agents might be active
      // You could enhance this by checking specific process names or ports
      runningAgents.add('CEO_AGENT')
      runningAgents.add('GHOST_AGENT')
    }
    
    if (ollamaProcesses.includes('ollama.exe')) {
      // Ollama is running, which is required for AI agents
      runningAgents.add('GHOST_AGENT')
    }
    
    // Get agent status from the backend state files if they exist
    const agentStates: Record<string, any> = {}
    
    try {
      const fs = require('fs')
      const path = require('path')
      
      // Check for agent state files
      const stateDir = path.join(parentDir, 'Agents_Logs', 'shared_resources', 'state', 'agents')
      if (fs.existsSync(stateDir)) {
        const files = fs.readdirSync(stateDir)
        for (const file of files) {
          if (file.endsWith('.json')) {
            const agentName = file.replace('.json', '')
            const content = fs.readFileSync(path.join(stateDir, file), 'utf8')
            const state = JSON.parse(content)
            agentStates[agentName] = state
          }
        }
      }
    } catch (error) {
      console.log('No agent state files found:', error)
    }
    
    // Return the status
    return NextResponse.json({
      success: true,
      runningAgents: Array.from(runningAgents),
      agentStates,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error getting agent status:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get agent status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 