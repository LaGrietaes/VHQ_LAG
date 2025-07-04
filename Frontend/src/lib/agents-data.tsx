import {
  Briefcase,
  Search,
  Users,
  Brain,
  Film,
  Folder,
  Star,
  DollarSign,
  Scale,
  Shield,
  Music,
  TrendingUp,
  Code,
  Megaphone,
  UserCheck,
  Ghost,
} from "lucide-react";
import { ReactNode } from "react";

export interface Agent {
  id: string
  name: string
  role: string
  status: "OPERATIONAL" | "WARNING" | "ERROR" | "INACTIVE"
  performance: number
  tasksCompleted: number
  currentTasks: number
  description: string
  icon: ReactNode
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
  // 00_CEO_LAG
  {
    id: "CEO_AGENT",
    name: "CEO",
    role: "Chief Executive Officer",
    status: "OPERATIONAL",
    performance: 98,
    tasksCompleted: 145,
    currentTasks: 3,
    description: "Strategic planning and decision making",
    icon: <Briefcase />,
    priority: 1,
    capabilities: ["strategic_planning", "decision_making", "coordination"],
    uptime: "24h 15m"
  },
  // 01_SEO_LAG
  {
    id: "SEO_AGENT", 
    name: "SEO",
    role: "Search Engine Optimization",
    status: "OPERATIONAL",
    performance: 95,
    tasksCompleted: 89,
    currentTasks: 5,
    description: "Content optimization and keyword analysis",
    icon: <Search />,
    priority: 2,
    capabilities: ["keyword_analysis", "content_optimization", "ranking_improvement"],
    uptime: "18h 42m"
  },
  // 02_CM_LAG
  {
    id: "CM_AGENT",
    name: "CM RRSS",
    role: "Social Media Management", 
    status: "WARNING",
    performance: 88,
    tasksCompleted: 67,
    currentTasks: 8,
    description: "Social media engagement and content creation",
    icon: <Users />,
    priority: 2,
    capabilities: ["social_media", "community_engagement", "content_creation"],
    uptime: "12h 30m"
  },
  // 03_PSICO_LAG
  {
    id: "PSICO_AGENT",
    name: "Psychology",
    role: "Audience Analysis",
    status: "OPERATIONAL",
    performance: 94,
    tasksCompleted: 78,
    currentTasks: 4,
    description: "User behavior analysis and insights",
    icon: <Brain />,
    priority: 3,
    capabilities: ["behavior_analysis", "user_insights", "psychological_profiling"],
    uptime: "20h 15m"
  },
  // 04_CLIP_LAG
  {
    id: "CLIP_AGENT",
    name: "Clip",
    role: "Video Clip Generation",
    status: "OPERATIONAL",
    performance: 96,
    tasksCompleted: 150,
    currentTasks: 2,
    description: "Generates short video clips from long-form content.",
    icon: <Film />,
    priority: 4,
    capabilities: ["video_processing", "clip_generation", "content_sourcing"],
    uptime: "22h 5m"
  },
  // 05_MEDIA_LAG
  {
    id: "MEDIA_AGENT",
    name: "Media",
    role: "Media Management",
    status: "OPERATIONAL",
    performance: 93,
    tasksCompleted: 210,
    currentTasks: 6,
    description: "Manages and organizes media assets.",
    icon: <Folder />,
    priority: 4,
    capabilities: ["asset_management", "metadata_tagging", "storage_optimization"],
    uptime: "23h 10m"
  },
  // 06_TALENT_LAG
  {
    id: "TALENT_AGENT",
    name: "Talent",
    role: "Talent Acquisition",
    status: "INACTIVE",
    performance: 0,
    tasksCompleted: 0,
    currentTasks: 0,
    description: "Scouts and manages talent for projects.",
    icon: <Star />,
    priority: 5,
    capabilities: ["scouting", "negotiation", "contract_management"],
    uptime: "0h 0m"
  },
  // 07_CASH_LAG
  {
    id: "CASH_AGENT",
    name: "Cash",
    role: "Financial Management",
    status: "OPERATIONAL",
    performance: 99,
    tasksCompleted: 300,
    currentTasks: 1,
    description: "Handles financial transactions and reporting.",
    icon: <DollarSign />,
    priority: 1,
    capabilities: ["transaction_processing", "budgeting", "financial_reporting"],
    uptime: "24h 0m"
  },
  // 08_LAW_LAG
  {
    id: "LAW_AGENT",
    name: "Law",
    role: "Legal Compliance",
    status: "OPERATIONAL",
    performance: 97,
    tasksCompleted: 50,
    currentTasks: 2,
    description: "Ensures legal and ethical compliance.",
    icon: <Scale />,
    priority: 1,
    capabilities: ["compliance_checking", "contract_review", "risk_assessment"],
    uptime: "24h 5m"
  },
  // 09_IT_LAG
  {
    id: "IT_AGENT",
    name: "IT",
    role: "Infrastructure & Security",
    status: "OPERATIONAL",
    performance: 95,
    tasksCompleted: 120,
    currentTasks: 4,
    description: "Maintains system infrastructure and security.",
    icon: <Shield />,
    priority: 2,
    capabilities: ["system_monitoring", "security_audits", "network_management"],
    uptime: "23h 50m"
  },
  // 10_DJ_LAG
  {
    id: "DJ_AGENT",
    name: "DJ",
    role: "Music & Audio Management",
    status: "OPERATIONAL",
    performance: 91,
    tasksCompleted: 85,
    currentTasks: 3,
    description: "Manages audio assets and creates soundscapes.",
    icon: <Music />,
    priority: 4,
    capabilities: ["audio_mixing", "music_curation", "sound_design"],
    uptime: "19h 22m"
  },
  // 11_WPM_LAG
  {
    id: "WPM_AGENT",
    name: "WP Manager",
    role: "Project Management",
    status: "WARNING",
    performance: 85,
    tasksCompleted: 95,
    currentTasks: 10,
    description: "Manages project timelines and workflows.",
    icon: <TrendingUp />,
    priority: 2,
    capabilities: ["task_scheduling", "resource_allocation", "progress_tracking"],
    uptime: "15h 45m"
  },
  // 12_DEV_LAG
  {
    id: "DEV_AGENT",
    name: "Dev",
    role: "Software Development",
    status: "OPERATIONAL",
    performance: 94,
    tasksCompleted: 180,
    currentTasks: 7,
    description: "Develops and maintains software applications.",
    icon: <Code />,
    priority: 3,
    capabilities: ["coding", "debugging", "version_control"],
    uptime: "21h 30m"
  },
  // 13_ADS_LAG
  {
    id: "ADS_AGENT",
    name: "Ads",
    role: "Advertising Campaigns",
    status: "OPERATIONAL",
    performance: 92,
    tasksCompleted: 110,
    currentTasks: 5,
    description: "Manages and optimizes advertising campaigns.",
    icon: <Megaphone />,
    priority: 3,
    capabilities: ["campaign_management", "ad_optimization", "analytics"],
    uptime: "20h 55m"
  },
  // 14_DONNA_LAG
  {
    id: "DONNA_AGENT",
    name: "Donna",
    role: "Executive Assistant",
    status: "OPERATIONAL",
    performance: 99,
    tasksCompleted: 250,
    currentTasks: 2,
    description: "Personal assistant for scheduling and communication.",
    icon: <UserCheck />,
    priority: 1,
    capabilities: ["scheduling", "communication", "task_management"],
    uptime: "24h 0m"
  },
  // 15_GHOST_LAG
  {
    id: "GHOST_AGENT",
    name: "Ghost",
    role: "Content Writer",
    status: "OPERATIONAL",
    performance: 96,
    tasksCompleted: 130,
    currentTasks: 3,
    description: "AI-powered writing assistant for long-form content creation including books, scripts, and blog posts.",
    icon: <Ghost />,
    priority: 1,
    capabilities: ["content_generation", "project_management", "ai_writing", "template_management", "cross_platform_integration"],
    uptime: "24h 0m",
    metrics: {
      files_managed: 45,
      tasks_processed: 5,
      success_rate: 94
    }
  }
];
