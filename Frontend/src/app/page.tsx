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

export default function VHQDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-black to-gray-900 border-b border-red-600/30 p-4 shadow-lg shadow-red-600/10">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Full logo for larger screens */}
            <div className="hidden md:block">
              <ThemeAwareLogo 
                className="h-8 w-auto" 
                size="medium" 
                theme="dark"
                variant="full"
              />
            </div>
            {/* Compact logo for mobile */}
            <div className="block md:hidden">
              <ThemeAwareLogo 
                className="h-8 w-auto" 
                size="small" 
                theme="dark"
                variant="compact"
              />
            </div>
            <div className="hidden sm:block">
              <div className="text-xs text-gray-400 font-mono">Virtual Head Quarters</div>
            </div>
          </div>
          <SystemMonitor />
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="container mx-auto p-6 space-y-6">
        {/* Dashboard Overview */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-red-400 font-mono">LA GRIETA COMMAND CENTER</h1>
          <p className="text-gray-400 font-mono">Real-time agent monitoring and system control</p>
        </div>

        {/* Agent Grid */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-white font-mono border-l-4 border-red-600 pl-3">AGENT STATUS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {agentsData.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </section>

        {/* Metrics Dashboard */}
        <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <SEOMetrics />
          </div>
          <div>
            <CalendarWidget />
          </div>
        </section>

        {/* Analytics Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <EngagementOptimization />
          <TrendAnalysis />
        </section>

        {/* Task Management */}
        <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          <TodoList />
          <ProjectTimeline />
          <ProcessingQueue />
        </section>

        {/* Status Bar */}
        <footer className="mt-12 pt-6 border-t border-gray-800">
          <div className="flex items-center justify-between text-xs font-mono text-gray-500">
            <div className="flex items-center space-x-4">
              <span>SYSTEM STATUS: <span className="text-green-400">OPERATIONAL</span></span>
              <span>AGENTS: <span className="text-red-400">{agentsData.length}</span></span>
              <span>UPTIME: <span className="text-blue-400">24h 15m</span></span>
            </div>
            <div className="text-gray-600">
              © 2024 LA GRIETA - Virtual Head Quarters
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
