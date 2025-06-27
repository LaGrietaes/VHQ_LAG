// Dashboard data for VHQ components

export interface Project {
  id: string
  name: string
  status: "active" | "completed" | "paused" | "planning" | "on-hold"
  progress: number
  dueDate: string
  team: string[]
  priority: "high" | "medium" | "low"
  description: string
  startDate: string
  endDate: string
  assignedAgents: string[]
}

export interface Agent {
  id: string
  name: string
  role: string
  status: "active" | "inactive" | "busy"
  performance: number
  tasks: number
}

export interface Task {
  id: string
  title: string
  completed: boolean
  priority: "high" | "medium" | "low"
  dueDate: string
  assignedAgent?: string
}

export const tasksData: Task[] = [
  {
    id: "1",
    title: "Update SEO keywords for video content",
    completed: false,
    priority: "high",
    dueDate: "2024-01-15",
    assignedAgent: "SEO_AGENT"
  },
  {
    id: "2", 
    title: "Analyze audience engagement patterns",
    completed: false,
    priority: "medium",
    dueDate: "2024-01-18",
    assignedAgent: "PSICO_AGENT"
  },
  {
    id: "3",
    title: "Generate viral hooks for new content",
    completed: true,
    priority: "high",
    dueDate: "2024-01-12",
    assignedAgent: "CM_AGENT"
  },
  {
    id: "4",
    title: "Process video transcriptions",
    completed: false,
    priority: "medium",
    dueDate: "2024-01-20",
    assignedAgent: "CLIP_AGENT"
  },
  {
    id: "5",
    title: "Review system performance metrics",
    completed: false,
    priority: "low",
    dueDate: "2024-01-25",
    assignedAgent: "CEO_AGENT"
  }
]

export const projectsData: Project[] = [
  {
    id: "1",
    name: "VHQ Dashboard Development",
    status: "active",
    progress: 75,
    dueDate: "2024-02-15",
    team: ["Dev Team", "Design Team"],
    priority: "high",
    description: "Complete frontend dashboard with all agent monitoring capabilities",
    startDate: "2024-01-01",
    endDate: "2024-02-15",
    assignedAgents: ["DEV_AGENT", "UI_AGENT"]
  },
  {
    id: "2", 
    name: "Agent System Integration",
    status: "active",
    progress: 45,
    dueDate: "2024-03-01",
    team: ["Backend Team", "AI Team"],
    priority: "high",
    description: "Integrate all 15 agents with real-time communication and monitoring",
    startDate: "2024-01-15",
    endDate: "2024-03-01",
    assignedAgents: ["CEO_AGENT", "IT_AGENT", "DEV_AGENT"]
  },
  {
    id: "3",
    name: "Security Audit",
    status: "completed",
    progress: 100,
    dueDate: "2024-01-30",
    team: ["Security Team"],
    priority: "medium",
    description: "Comprehensive security review of all agent communications and data handling",
    startDate: "2024-01-10",
    endDate: "2024-01-30",
    assignedAgents: ["LAW_AGENT", "IT_AGENT"]
  },
  {
    id: "4",
    name: "Content Optimization Pipeline",
    status: "planning",
    progress: 15,
    dueDate: "2024-04-01",
    team: ["Content Team", "AI Team"],
    priority: "medium",
    description: "Automated content generation and optimization using AI agents",
    startDate: "2024-02-01",
    endDate: "2024-04-01",
    assignedAgents: ["SEO_AGENT", "CM_AGENT", "PSICO_AGENT"]
  },
  {
    id: "5",
    name: "Performance Monitoring System",
    status: "on-hold",
    progress: 30,
    dueDate: "2024-05-01",
    team: ["Monitoring Team"],
    priority: "low",
    description: "Real-time performance tracking and alerting system for all agents",
    startDate: "2024-01-20",
    endDate: "2024-05-01",
    assignedAgents: ["IT_AGENT", "CEO_AGENT"]
  }
]

export const agentsData: Agent[] = [
  {
    id: "ceo",
    name: "CEO Agent",
    role: "Executive",
    status: "active",
    performance: 95,
    tasks: 12
  },
  {
    id: "seo",
    name: "SEO Agent", 
    role: "Marketing",
    status: "active",
    performance: 88,
    tasks: 8
  },
  {
    id: "cm",
    name: "Community Manager",
    role: "Social",
    status: "busy",
    performance: 92,
    tasks: 15
  }
]

export const systemMetrics = {
  uptime: 99.9,
  cpu: 45,
  memory: 68,
  storage: 35,
  network: 125
} 