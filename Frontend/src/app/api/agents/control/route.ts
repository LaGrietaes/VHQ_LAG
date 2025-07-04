import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const { agentId, action } = await request.json()
    
    if (!agentId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing agentId or action' },
        { status: 400 }
      )
    }
    
    // Get the parent directory
    const parentDir = process.cwd().replace(/\\frontend$/, '')
    
    let command = ''
    let agentDir = ''
    
    // Map agent IDs to their directories
    const agentDirectories: Record<string, string> = {
      'CEO_AGENT': '00_CEO_LAG',
      'SEO_AGENT': '01_SEO_LAG',
      'CM_AGENT': '02_CM_LAG',
      'PSICO_AGENT': '03_PSICO_LAG',
      'CLIP_AGENT': '04_CLIP_LAG',
      'MEDIA_AGENT': '05_MEDIA_LAG',
      'TALENT_AGENT': '06_TALENT_LAG',
      'CASH_AGENT': '07_CASH_LAG',
      'LAW_AGENT': '08_LAW_LAG',
      'IT_AGENT': '09_IT_LAG',
      'DJ_AGENT': '10_DJ_LAG',
      'WPM_AGENT': '11_WPM_LAG',
      'DEV_AGENT': '12_DEV_LAG',
      'ADS_AGENT': '13_ADS_LAG',
      'DONNA_AGENT': '14_DONNA_LAG',
      'GHOST_AGENT': '15_GHOST_LAG'
    }
    
    agentDir = agentDirectories[agentId]
    
    if (!agentDir) {
      return NextResponse.json(
        { success: false, error: `Unknown agent: ${agentId}` },
        { status: 400 }
      )
    }
    
    const fullAgentPath = path.join(parentDir, agentDir)
    
    if (action === 'start') {
      // Start the agent
      if (agentId === 'GHOST_AGENT') {
        command = `cd "${fullAgentPath}" && python start_agent.py`
      } else {
        // For other agents, try to find their start script
        command = `cd "${fullAgentPath}" && python start_agent.py`
      }
      
      // Execute the command
      const { stdout, stderr } = await execAsync(command, { 
        cwd: fullAgentPath,
        windowsHide: true 
      })
      
      return NextResponse.json({
        success: true,
        message: `Agent ${agentId} started successfully`,
        stdout,
        stderr
      })
      
    } else if (action === 'stop') {
      // Stop the agent by finding and killing its process
      // This is a simplified approach - you might want to implement a proper shutdown mechanism
      const { stdout } = await execAsync(`tasklist /FI "IMAGENAME eq python.exe" /FO CSV`)
      
      if (stdout.includes('python.exe')) {
        // For now, we'll just return success
        // In a real implementation, you'd want to send a shutdown signal to the specific agent
        return NextResponse.json({
          success: true,
          message: `Agent ${agentId} stop command sent`,
          note: 'Agent processes may still be running. Manual termination may be required.'
        })
      } else {
        return NextResponse.json({
          success: true,
          message: `No Python processes found for agent ${agentId}`
        })
      }
      
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use "start" or "stop"' },
        { status: 400 }
      )
    }
    
  } catch (error) {
    console.error('Error controlling agent:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to control agent',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 