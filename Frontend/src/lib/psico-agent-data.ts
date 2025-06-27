export interface TrendAnalysis {
  id: number
  platform: string
  keyword: string
  topic: string
  engagement_score: number
  sentiment_score: number
  growth_rate: number
  peak_hour: string
  analysis_date: string
  trend_topic: string
  audience_interest: number
  competition_level: "high" | "medium" | "low"
  recommendation: string
}

export interface ViralHook {
  id: string
  topic: string
  platform: string
  hook_text: string
  pattern: string
  success_rate: number
  engagement_score: number
  generation_date: string
  usage_count: number
  psychology_trigger: string
  estimated_effectiveness: number
  content_type: string
  target_emotion: string
}

export interface AudienceInsight {
  id: number
  insight_text: string
  confidence_score: number
  category: string
  platform: string
  generation_date: string
  validation_status: string
  demographic: string
  percentage: number
  engagement_level: "high" | "medium" | "low"
  preferred_content: string[]
  behavior_pattern: string
}

export interface EngagementPattern {
  time_period: string
  engagement_rate: number
  best_posting_time: string
  audience_activity: number
  content_type: string
  emotional_response: string
}

export interface PsicoMetrics {
  trends_analyzed: number
  hooks_generated: number
  insights_discovered: number
  patterns_identified: number
  audience_segments: number
  prediction_accuracy: number
  viral_success_rate: number
  optimization_impact: number
}

// Mock data for demonstration
export const trendAnalysis: TrendAnalysis[] = [
  {
    id: 1,
    platform: "tiktok",
    keyword: "arte urbano",
    topic: "street_art",
    engagement_score: 8.7,
    sentiment_score: 0.85,
    growth_rate: 23.4,
    peak_hour: "20:00",
    analysis_date: "2024-01-26T15:30:00Z",
    trend_topic: "AI Content Creation",
    audience_interest: 89,
    competition_level: "high",
    recommendation: "Focus on unique AI use cases"
  },
  {
    id: 2,
    platform: "instagram",
    keyword: "inspiración juvenil",
    topic: "youth_inspiration",
    engagement_score: 7.9,
    sentiment_score: 0.92,
    growth_rate: 18.7,
    peak_hour: "18:30",
    analysis_date: "2024-01-26T14:15:00Z",
    trend_topic: "Behind-the-Scenes",
    audience_interest: 76,
    competition_level: "medium",
    recommendation: "Authentic storytelling approach"
  },
  {
    id: 3,
    platform: "youtube",
    keyword: "proceso creativo",
    topic: "creative_process",
    engagement_score: 9.2,
    sentiment_score: 0.78,
    growth_rate: 31.2,
    peak_hour: "16:00",
    analysis_date: "2024-01-26T13:45:00Z",
    trend_topic: "Educational Shorts",
    audience_interest: 92,
    competition_level: "low",
    recommendation: "High potential, act quickly"
  },
]

export const viralHooks: ViralHook[] = [
  {
    id: "1",
    topic: "street_art",
    platform: "tiktok",
    hook_text: "The secret that changed everything...",
    pattern: "POV + emotional_conflict + visual_art",
    success_rate: 0.89,
    engagement_score: 9.1,
    generation_date: "2024-01-26T16:20:00Z",
    usage_count: 12,
    psychology_trigger: "Curiosity Gap",
    estimated_effectiveness: 87,
    content_type: "Educational",
    target_emotion: "Curiosity"
  },
  {
    id: "2",
    topic: "youth_inspiration",
    platform: "instagram",
    hook_text: "Everyone is doing this wrong, except...",
    pattern: "consequence + creativity_vs_fear + empowerment",
    success_rate: 0.94,
    engagement_score: 8.8,
    generation_date: "2024-01-26T15:45:00Z",
    usage_count: 8,
    psychology_trigger: "Social Proof + Exclusivity",
    estimated_effectiveness: 92,
    content_type: "Tutorial",
    target_emotion: "FOMO"
  },
  {
    id: "3",
    topic: "creative_process",
    platform: "youtube",
    hook_text: "This will make you rethink everything...",
    pattern: "secret_reveal + authority_challenge + curiosity_gap",
    success_rate: 0.87,
    engagement_score: 9.3,
    generation_date: "2024-01-26T14:30:00Z",
    usage_count: 15,
    psychology_trigger: "Cognitive Dissonance",
    estimated_effectiveness: 78,
    content_type: "Opinion",
    target_emotion: "Surprise"
  },
  {
    id: "4",
    topic: "creative_process",
    platform: "youtube",
    hook_text: "The mistake that costs millions...",
    pattern: "secret_reveal + authority_challenge + curiosity_gap",
    success_rate: 0.87,
    engagement_score: 9.3,
    generation_date: "2024-01-26T14:30:00Z",
    usage_count: 15,
    psychology_trigger: "Loss Aversion",
    estimated_effectiveness: 85,
    content_type: "Business",
    target_emotion: "Fear/Urgency"
  },
]

export const audienceInsights: AudienceInsight[] = [
  {
    id: 1,
    insight_text: "La audiencia de LaGrieta responde 67% mejor a contenido que muestra vulnerabilidad auténtica",
    confidence_score: 0.92,
    category: "emotional_triggers",
    platform: "all",
    generation_date: "2024-01-26T12:00:00Z",
    validation_status: "validated",
    demographic: "Gen Z (18-24)",
    percentage: 35,
    engagement_level: "high",
    preferred_content: ["Short videos", "Memes", "Tutorials"],
    behavior_pattern: "Quick consumption, high sharing"
  },
  {
    id: 2,
    insight_text: "Los posts con 'proceso creativo' generan 3x más engagement en horario 16:00-20:00",
    confidence_score: 0.88,
    category: "content_timing",
    platform: "instagram",
    generation_date: "2024-01-26T11:30:00Z",
    validation_status: "testing",
    demographic: "Millennials (25-35)",
    percentage: 42,
    engagement_level: "medium",
    preferred_content: ["Long-form content", "Stories", "Behind-scenes"],
    behavior_pattern: "Thoughtful engagement, comments"
  },
  {
    id: 3,
    insight_text: "La combinación de arte + música urbana aumenta retención en 45% en TikTok",
    confidence_score: 0.85,
    category: "content_combination",
    platform: "tiktok",
    generation_date: "2024-01-26T10:15:00Z",
    validation_status: "validated",
    demographic: "Gen X (36-50)",
    percentage: 18,
    engagement_level: "medium",
    preferred_content: ["Educational", "News", "Professional"],
    behavior_pattern: "Selective sharing, quality focus"
  },
  {
    id: 4,
    insight_text: "The mistake that costs millions...",
    confidence_score: 0.85,
    category: "business_impact",
    platform: "youtube",
    generation_date: "2024-01-26T10:15:00Z",
    validation_status: "validated",
    demographic: "Boomers (50+)",
    percentage: 5,
    engagement_level: "low",
    preferred_content: ["Traditional media", "Family content"],
    behavior_pattern: "Passive consumption"
  },
]

export const engagementPatterns: EngagementPattern[] = [
  {
    time_period: "Morning (6-10 AM)",
    engagement_rate: 0.78,
    best_posting_time: "8:30 AM",
    audience_activity: 85,
    content_type: "Educational",
    emotional_response: "Curiosity"
  },
  {
    time_period: "Afternoon (12-4 PM)",
    engagement_rate: 0.65,
    best_posting_time: "2:15 PM", 
    audience_activity: 72,
    content_type: "Entertainment",
    emotional_response: "Joy"
  },
  {
    time_period: "Evening (6-10 PM)",
    engagement_rate: 0.92,
    best_posting_time: "7:45 PM",
    audience_activity: 94,
    content_type: "Inspirational",
    emotional_response: "Motivation"
  }
]

export const psicoMetrics: PsicoMetrics = {
  trends_analyzed: 247,
  hooks_generated: 89,
  insights_discovered: 34,
  patterns_identified: 156,
  audience_segments: 8,
  prediction_accuracy: 0.87,
  viral_success_rate: 0.73,
  optimization_impact: 0.42,
}

export const platforms = [
  { id: "instagram", name: "Instagram", color: "#E4405F", icon: "📷" },
  { id: "tiktok", name: "TikTok", color: "#000000", icon: "🎵" },
  { id: "youtube", name: "YouTube", color: "#FF0000", icon: "📺" },
  { id: "twitter", name: "Twitter", color: "#1DA1F2", icon: "🐦" },
  { id: "facebook", name: "Facebook", color: "#1877F2", icon: "📘" },
]
