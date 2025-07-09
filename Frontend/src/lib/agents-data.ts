export interface Agent {
  id: string
  name: string
  status: "OPERATIONAL" | "PLANNED" | "WARNING" | "ERROR" | "INACTIVE"
  role: string
  priority: number
  color: string
  icon: string
  capabilities: string[]
  current_tasks?: number
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
  performance?: number
  tasksCompleted?: number
}

export const agentsData: Agent[] = [
  {
    id: "00_CEO_LAG",
    name: "CEO Management Agent",
    status: "OPERATIONAL",
    role: "Central Orchestrator",
    priority: 1,
    color: "#1e40af",
    icon: "👨‍💼",
    capabilities: ["task_delegation", "monitoring", "reporting", "coordination"],
    current_tasks: 5,
    uptime: "2h 30m",
    performance: 87,
    tasksCompleted: 142,
  },
  {
    id: "01_SEO_LAG",
    name: "SEO Optimization Agent",
    status: "PLANNED",
    role: "Content Optimization",
    priority: 2,
    color: "#059669",
    icon: "🔍",
    capabilities: ["keyword_analysis", "title_optimization", "competitor_research"],
    eta: "Week 1",
    performance: 0,
    tasksCompleted: 0,
  },
  {
    id: "02_CM_LAG",
    name: "Community Management Agent",
    status: "PLANNED",
    role: "Social Engagement",
    priority: 2,
    color: "#dc2626",
    icon: "🌐",
    capabilities: ["comment_management", "social_posting", "sentiment_analysis"],
    eta: "Week 1",
    performance: 0,
    tasksCompleted: 0,
  },
  {
    id: "03_PSICO_LAG",
    name: "Psychology & Engagement Agent",
    status: "PLANNED",
    role: "Audience Psychology",
    priority: 3,
    color: "#7c3aed",
    icon: "🧠",
    capabilities: ["audience_analysis", "engagement_prediction", "behavioral_insights"],
    eta: "Week 3",
    performance: 0,
    tasksCompleted: 0,
  },
  {
    id: "04_CLIP_LAG",
    name: "Video Editing Agent",
    status: "OPERATIONAL",
    role: "Content Creation",
    priority: 2,
    color: "#ea580c",
    icon: "🎬",
    capabilities: ["video_editing", "clip_generation", "highlight_detection", "reframing", "face_detection"],
    current_tasks: 2,
    uptime: "3h 15m",
    performance: 91,
    tasksCompleted: 47,
    metrics: {
      videos_processed: 23,
      clips_generated: 89,
      success_rate: 91,
    },
  },
  {
    id: "05_MEDIA_LAG",
    name: "Advanced Media Management",
    status: "PLANNED",
    role: "Media Distribution",
    priority: 3,
    color: "#0891b2",
    icon: "📺",
    capabilities: ["format_optimization", "multi_platform_distribution"],
    eta: "Week 4",
    performance: 0,
    tasksCompleted: 0,
  },
  {
    id: "06_TALENT_LAG",
    name: "Talent Management Agent",
    status: "PLANNED",
    role: "Human Resources",
    priority: 4,
    color: "#be185d",
    icon: "👥",
    capabilities: ["collaboration_management", "scheduling", "talent_analytics"],
    eta: "Week 5",
    performance: 0,
    tasksCompleted: 0,
  },
  {
    id: "07_MEDIA_LAG",
    name: "Media Library Management",
    status: "OPERATIONAL",
    role: "File Organization",
    priority: 2,
    color: "#16a34a",
    icon: "📚",
    capabilities: ["file_organization", "duplicate_detection", "media_ingestion"],
    metrics: {
      files_managed: 9257,
      library_size_gb: 439.75,
      last_scan: "2024-01-20",
    },
    performance: 94,
    tasksCompleted: 2847,
    uptime: "15d 4h",
  },
  {
    id: "08_IT_LAG",
    name: "IT Infrastructure Agent",
    status: "PLANNED",
    role: "System Maintenance",
    priority: 3,
    color: "#4338ca",
    icon: "🔧",
    capabilities: ["wordpress_maintenance", "domain_renewal", "nas_management", "backup_monitoring"],
    eta: "Week 6",
    performance: 0,
    tasksCompleted: 0,
  },
  {
    id: "09_FINANCE_LAG",
    name: "Finance & Affiliates Agent",
    status: "PLANNED",
    role: "Revenue Management",
    priority: 3,
    color: "#059669",
    icon: "💰",
    capabilities: ["affiliate_tracking", "revenue_analysis", "expense_monitoring", "roi_calculation"],
    eta: "Week 7",
    performance: 0,
    tasksCompleted: 0,
  },
]
