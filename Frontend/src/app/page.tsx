"use client"

import { ThemeAwareLogo } from "@/components/theme-aware-logo"
import { SystemMonitor } from "@/components/system-monitor"
import { AgentCard } from "@/components/agent-card"
import { SEOMetrics } from "@/components/seo-metrics"
import { EngagementOptimization } from "@/components/engagement-optimization"
import { CalendarWidget } from "@/components/calendar-widget"
import { TodoList } from "@/components/todo-list"
import { ProjectTimeline } from "@/components/project-timeline"
import { TrendAnalysis } from "@/components/trend-analysis"
import { ProcessingQueue } from "@/components/processing-queue"
import { agentsData } from "@/lib/agents-data"
import { Sidebar } from "@/components/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ChatNotification } from '@/components/chat-notification'
import { useState } from 'react'
import { cn } from "@/lib/utils"

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-lg font-bold text-primary mb-4 border-b border-primary/20 pb-2">
    {children}
  </h2>
);

export default function VHQDashboard() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const onlineAgents = agentsData.filter(agent => agent.status === "OPERATIONAL").length;
  const totalAgents = agentsData.length;

  return (
    <div className="flex min-h-screen bg-background text-foreground font-mono">
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
          <h1 className="text-xl font-bold tracking-widest text-primary uppercase flex-1 text-center">VHQ_LAG // Dashboard</h1>
          <div className="flex-1 flex justify-end items-center gap-4">
            <SystemMonitor onlineAgents={onlineAgents} totalAgents={totalAgents} />
            <ChatNotification onDrawerStateChange={setIsChatOpen} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <Tabs defaultValue="tasks">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tasks">Schedule & Tasks</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="system">System Queue</TabsTrigger>
            </TabsList>
            <TabsContent value="tasks">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                    <div className="lg:col-span-1">
                        <CalendarWidget />
                    </div>
                    <div className="lg:col-span-1">
                        <TodoList />
                    </div>
                    <div className="lg:col-span-2">
                        <ProjectTimeline />
                    </div>
                </div>
            </TabsContent>
            <TabsContent value="analytics">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                    <div className="lg:col-span-2">
                      <SEOMetrics />
                    </div>
                    <EngagementOptimization />
                    <TrendAnalysis />
                </div>
            </TabsContent>
            <TabsContent value="system">
                <div className="mt-4">
                    <ProcessingQueue />
                </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
