"use client"

import { ThemeAwareLogo } from "@/components/theme-aware-logo"
import { SystemMonitor } from "@/components/system-monitor"
import { AgentCard } from "@/components/agent-card"
import { SEOMetrics } from "@/components/seo-metrics"
import { EngagementOptimization } from "@/components/engagement-optimization"
import { CalendarWidget } from "@/components/calendar-widget"
import { TodoList } from "@/components/todo-list"
import { InteractiveTodo } from "@/components/interactive-todo"
import { ProjectTimeline } from "@/components/project-timeline"
import { TrendAnalysis } from "@/components/trend-analysis"
import { ProcessingQueue } from "@/components/processing-queue"
import { agentsData } from "@/lib/agents-data"
import { Sidebar } from "@/components/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ChatNotification } from '@/components/chat-notification'
import { SubtleTimerDisplay } from '@/components/subtle-timer-display'
import { useState } from 'react'
import { cn } from "@/lib/utils"
import { DraggableDashboardCards } from "@/components/draggable-dashboard-cards"
import { InteractiveTodoItem } from "@/components/interactive-todo"
import { CalendarEvent } from "@/components/calendar-widget"
import { useTodoContext } from "@/lib/todo-context"

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-lg font-bold text-primary mb-4 border-b border-primary/20 pb-2">
    {children}
  </h2>
);

function VHQDashboardContent() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { todos: personalTodos } = useTodoContext();

  // Map todos with deadlines to calendar events
  const todoEvents: CalendarEvent[] = personalTodos
    .filter(todo => todo.deadline && !todo.done)
    .map(todo => ({ 
      date: todo.deadline!, 
      label: todo.text,
      agent: todo.taggedAgents && todo.taggedAgents.length > 0 ? todo.taggedAgents[0] : undefined
    }));

  return (
    <div className="flex min-h-screen bg-background text-foreground font-mono">
      <Sidebar />
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300 ease-in-out",
        isChatOpen ? "mr-[500px]" : "mr-0"
      )}>
        <div className="sticky top-0 z-30 flex items-center justify-between p-6 pr-10 border-b border-border bg-background/80 backdrop-blur-md h-24 relative">
          <div className="flex-1">
            <Link href="/">
              <ThemeAwareLogo />
            </Link>
          </div>
          <div className="text-xl font-bold tracking-widest text-primary uppercase flex-1 text-center relative">
            Dashboard
            <SubtleTimerDisplay />
          </div>
          <div className="flex-1 flex justify-end items-center gap-8">
            <SystemMonitor />
            <div className="flex-shrink-0">
              <ChatNotification onDrawerStateChange={setIsChatOpen} />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <Tabs defaultValue="tasks">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tasks">Schedule & Tasks</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="system">System Queue</TabsTrigger>
            </TabsList>
            <TabsContent value="tasks">
                <DraggableDashboardCards
                  CalendarWidget={<CalendarWidget events={todoEvents} />}
                  TodoList={<TodoList />}
                  InteractiveTodo={<InteractiveTodo />}
                  ProjectTimeline={<ProjectTimeline />}
                />
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
        </div>
      </div>
    </div>
  )
}

export default function VHQDashboard() {
  return <VHQDashboardContent />;
}
