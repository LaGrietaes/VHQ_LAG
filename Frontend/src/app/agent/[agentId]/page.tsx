"use client"

import { useParams } from 'next/navigation'
import { agentsData, Agent } from '@/lib/agents-data'
import { Sidebar } from '@/components/sidebar'
import { ThemeAwareLogo } from '@/components/theme-aware-logo'
import { SystemMonitor } from '@/components/system-monitor'
import Link from 'next/link'
import { ChatNotification } from '@/components/chat-notification'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { GhostWriterView } from '@/components/ghost'
import { CMWorkspaceView } from '@/components/cm'

export default function AgentDetailPage() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const params = useParams()
  const agentId = params.agentId as string
  const agent = agentsData.find((a) => a.id === agentId)

  if (!agent) {
    return (
      <div className="flex min-h-screen bg-background text-foreground font-mono">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p>Agent not found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background text-foreground font-mono">
      <Sidebar />
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300 ease-in-out",
        isChatOpen ? "mr-[500px]" : "mr-0"
      )}>
        <header className="sticky top-0 z-30 flex items-center justify-between p-6 pr-10 border-b border-border bg-background/80 backdrop-blur-md h-24">
            <div className="flex-1">
                <Link href="/">
                    <ThemeAwareLogo />
                </Link>
            </div>
            <h1 className="text-xl font-bold tracking-widest text-primary uppercase flex-1 text-center">{agent.name.replace("_AGENT", "")}</h1>
            <div className="flex-1 flex justify-end items-center gap-4">
                <SystemMonitor />
                <div className="flex-shrink-0">
                  <ChatNotification onDrawerStateChange={setIsChatOpen} />
                </div>
            </div>
        </header>
        <main className="flex-1 overflow-hidden">
          {agent.id === 'GHOST_AGENT' && <GhostWriterView />}
          {agent.id === 'CM_LAG' && <CMWorkspaceView />}
          {!['GHOST_AGENT', 'CM_LAG'].includes(agent.id) && (
            <div className="h-full overflow-y-auto p-8">
              <p>Workspace not available for this agent yet.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
} 