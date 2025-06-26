"use client"

import { useState } from "react"
import { UnifiedHeader } from "@/components/unified-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Crown, Users, TrendingUp, Calendar, Target, BarChart3, FileText, Activity } from "lucide-react"

export default function CEOAgentPage() {
  const [activeWorkflows, setActiveWorkflows] = useState([
    {
      id: "video-production",
      name: "Producción de Video Completa",
      progress: 75,
      agents: ["05_MEDIA", "04_CLIP", "01_SEO", "03_PSICO", "02_CM"],
      status: "active",
      priority: "high",
    },
    {
      id: "community-management",
      name: "Gestión de Comunidad Reactiva",
      progress: 90,
      agents: ["02_CM", "03_PSICO"],
      status: "active",
      priority: "medium",
    },
    {
      id: "monetization-legal",
      name: "Monetización y Legal",
      progress: 30,
      agents: ["07_CASH", "08_LAW", "02_CM"],
      status: "pending",
      priority: "high",
    },
  ])

  const systemMetrics = {
    totalAgents: 15,
    operationalAgents: 6,
    developmentAgents: 9,
    totalTasks: 1247,
    completedTasks: 1089,
    systemUptime: "99.7%",
    avgResponseTime: "1.2s",
  }

  const recentTasks = [
    { id: 1, task: "Optimize video SEO for latest upload", agent: "01_SEO", status: "completed", time: "2 min ago" },
    { id: 2, task: "Process community comments batch", agent: "02_CM", status: "active", time: "5 min ago" },
    {
      id: 3,
      task: "Generate psychological insights report",
      agent: "03_PSICO",
      status: "completed",
      time: "12 min ago",
    },
    { id: 4, task: "Edit highlight clips for shorts", agent: "04_CLIP", status: "active", time: "18 min ago" },
    { id: 5, task: "Organize media library", agent: "05_MEDIA", status: "completed", time: "25 min ago" },
  ]

  const upcomingDeadlines = [
    { task: "YouTube video upload", date: "Today 18:00", priority: "high" },
    { task: "Social media campaign launch", date: "Tomorrow 10:00", priority: "medium" },
    { task: "Talent collaboration meeting", date: "Dec 28 14:00", priority: "high" },
    { task: "Monthly analytics report", date: "Dec 31 23:59", priority: "low" },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <UnifiedHeader
        title="CEO AGENT - COORDINADOR PRINCIPAL"
        subtitle="Orquestación y supervisión de todos los agentes del sistema VHQ_LAG"
        icon={Crown}
        status="OPERATIONAL"
        agentId="00_CEO_LAG"
      />

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-900 border border-gray-800">
            <TabsTrigger value="dashboard" className="font-mono">
              DASHBOARD
            </TabsTrigger>
            <TabsTrigger value="workflows" className="font-mono">
              WORKFLOWS
            </TabsTrigger>
            <TabsTrigger value="agents" className="font-mono">
              AGENTS
            </TabsTrigger>
            <TabsTrigger value="reports" className="font-mono">
              REPORTS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* System Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-mono text-gray-400">TOTAL AGENTS</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white font-mono">{systemMetrics.totalAgents}</div>
                  <div className="text-xs text-green-400 font-mono">{systemMetrics.operationalAgents} operational</div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-mono text-gray-400">TASK COMPLETION</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white font-mono">
                    {Math.round((systemMetrics.completedTasks / systemMetrics.totalTasks) * 100)}%
                  </div>
                  <Progress value={(systemMetrics.completedTasks / systemMetrics.totalTasks) * 100} className="mt-2" />
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-mono text-gray-400">SYSTEM UPTIME</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400 font-mono">{systemMetrics.systemUptime}</div>
                  <div className="text-xs text-gray-400 font-mono">Last 30 days</div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-mono text-gray-400">AVG RESPONSE</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400 font-mono">{systemMetrics.avgResponseTime}</div>
                  <div className="text-xs text-gray-400 font-mono">Agent response time</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Tasks and Deadlines */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="font-mono text-white flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-red-600" />
                    <span>RECENT TASKS</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {recentTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-3 bg-gray-800 border border-gray-700"
                        >
                          <div className="flex-1">
                            <div className="text-sm font-mono text-white">{task.task}</div>
                            <div className="text-xs text-gray-400 font-mono">
                              {task.agent} • {task.time}
                            </div>
                          </div>
                          <Badge variant={task.status === "completed" ? "default" : "secondary"} className="font-mono">
                            {task.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="font-mono text-white flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-red-600" />
                    <span>UPCOMING DEADLINES</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {upcomingDeadlines.map((deadline, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-800 border border-gray-700"
                        >
                          <div className="flex-1">
                            <div className="text-sm font-mono text-white">{deadline.task}</div>
                            <div className="text-xs text-gray-400 font-mono">{deadline.date}</div>
                          </div>
                          <Badge
                            variant={
                              deadline.priority === "high"
                                ? "destructive"
                                : deadline.priority === "medium"
                                  ? "default"
                                  : "secondary"
                            }
                            className="font-mono"
                          >
                            {deadline.priority}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="workflows" className="space-y-6">
            <div className="grid gap-6">
              {activeWorkflows.map((workflow) => (
                <Card key={workflow.id} className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-mono text-white">{workflow.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant={workflow.status === "active" ? "default" : "secondary"} className="font-mono">
                          {workflow.status}
                        </Badge>
                        <Badge variant={workflow.priority === "high" ? "destructive" : "default"} className="font-mono">
                          {workflow.priority}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm font-mono text-gray-400 mb-2">
                        <span>Progress</span>
                        <span>{workflow.progress}%</span>
                      </div>
                      <Progress value={workflow.progress} className="h-2" />
                    </div>
                    <div>
                      <div className="text-sm font-mono text-gray-400 mb-2">Involved Agents</div>
                      <div className="flex flex-wrap gap-2">
                        {workflow.agents.map((agent) => (
                          <Badge key={agent} variant="outline" className="font-mono text-xs">
                            {agent}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="font-mono">
                        View Details
                      </Button>
                      <Button size="sm" variant="outline" className="font-mono">
                        Modify Priority
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 15 }, (_, i) => {
                const agentNum = i.toString().padStart(2, "0")
                const isOperational = i < 6
                return (
                  <Card key={i} className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="font-mono text-white text-sm">{agentNum}_AGENT_LAG</CardTitle>
                      <CardDescription className="font-mono">
                        <Badge variant={isOperational ? "default" : "secondary"} className="font-mono">
                          {isOperational ? "OPERATIONAL" : "EN DESARROLLO"}
                        </Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-gray-400">Tasks Completed</span>
                          <span className="text-white">{Math.floor(Math.random() * 100)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-gray-400">Response Time</span>
                          <span className="text-green-400">{(Math.random() * 2 + 0.5).toFixed(1)}s</span>
                        </div>
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-gray-400">Success Rate</span>
                          <span className="text-blue-400">{Math.floor(Math.random() * 20 + 80)}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="font-mono text-white flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-red-600" />
                  <span>EXECUTIVE REPORTS</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="font-mono justify-start">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Generate Performance Report
                    </Button>
                    <Button variant="outline" className="font-mono justify-start">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      System Analytics Summary
                    </Button>
                    <Button variant="outline" className="font-mono justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Agent Utilization Report
                    </Button>
                    <Button variant="outline" className="font-mono justify-start">
                      <Target className="h-4 w-4 mr-2" />
                      Goal Achievement Analysis
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
