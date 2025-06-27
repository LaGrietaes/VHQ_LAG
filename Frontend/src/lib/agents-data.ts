export interface Agent {
  id: string
  name: string
  role: string
  status: "OPERATIONAL" | "WARNING" | "ERROR" | "INACTIVE"
  performance: number
  tasksCompleted: number
  currentTasks: number
  description: string
  icon: string
  priority: number
  capabilities: string[]
  uptime?: string
  eta?: string
  metrics?: {
    files_managed?: number
    library_size_gb?: number
    last_scan?: string
    tasks_processed?: number
    success_rate?: number
    videos_processed?: number
    clips_generated?: number
  }
}

export const agentsData: Agent[] = [
  {
    id: "CEO_AGENT",
    name: "CEO Agent",
    role: "Chief Executive Officer",
    status: "OPERATIONAL",
    performance: 98,
    tasksCompleted: 145,
    currentTasks: 3,
    description: "Strategic planning and decision making",
    icon: "👨‍💼",
    priority: 1,
    capabilities: ["strategic_planning", "decision_making", "coordination"],
    uptime: "24h 15m"
  },
  {
    id: "SEO_AGENT", 
    name: "SEO Agent",
    role: "Search Engine Optimization",
    status: "OPERATIONAL",
    performance: 95,
    tasksCompleted: 89,
    currentTasks: 5,
    description: "Content optimization and keyword analysis",
    icon: "🔍",
    priority: 2,
    capabilities: ["keyword_analysis", "content_optimization", "ranking_improvement"],
    uptime: "18h 42m"
  },
  {
    id: "CM_AGENT",
    name: "Community Manager",
    role: "Social Media Management", 
    status: "WARNING",
    performance: 88,
    tasksCompleted: 67,
    currentTasks: 8,
    description: "Social media engagement and content creation",
    icon: "🌐",
    priority: 2,
    capabilities: ["social_media", "community_engagement", "content_creation"],
    uptime: "12h 30m"
  },
  {
    id: "PSICO_AGENT",
    name: "Psychology Expert",
    role: "Audience Analysis",
    status: "OPERATIONAL",
    performance: 94,
    tasksCompleted: 78,
    currentTasks: 4,
    description: "User behavior analysis and insights",
    icon: "🧠",
    priority: 3,
    capabilities: ["behavior_analysis", "user_insights", "psychological_profiling"],
    uptime: "20h 15m"
  }
]
