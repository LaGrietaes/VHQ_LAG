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
}

export interface ViralHook {
  id: number
  topic: string
  platform: string
  hook_text: string
  pattern: string
  success_rate: number
  engagement_score: number
  generation_date: string
  usage_count: number
}

export interface AudienceInsight {
  id: number
  insight_text: string
  confidence_score: number
  category: string
  platform: string
  generation_date: string
  validation_status: string
}

export interface EngagementPattern {
  hour: number
  day_of_week: string
  platform: string
  content_type: string
  engagement_score: number
  optimal_score: number
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
  },
]

export const viralHooks: ViralHook[] = [
  {
    id: 1,
    topic: "street_art",
    platform: "tiktok",
    hook_text: "POV: Cuando tu arte urbano se vuelve viral y no sabes si reír o llorar 😭🎨",
    pattern: "POV + emotional_conflict + visual_art",
    success_rate: 0.89,
    engagement_score: 9.1,
    generation_date: "2024-01-26T16:20:00Z",
    usage_count: 12,
  },
  {
    id: 2,
    topic: "youth_inspiration",
    platform: "instagram",
    hook_text: "Esto es lo que pasa cuando dejas que tu creatividad hable más fuerte que tus miedos ✨",
    pattern: "consequence + creativity_vs_fear + empowerment",
    success_rate: 0.94,
    engagement_score: 8.8,
    generation_date: "2024-01-26T15:45:00Z",
    usage_count: 8,
  },
  {
    id: 3,
    topic: "creative_process",
    platform: "youtube",
    hook_text: "Te voy a enseñar el secreto que los artistas no quieren que sepas sobre la inspiración",
    pattern: "secret_reveal + authority_challenge + curiosity_gap",
    success_rate: 0.87,
    engagement_score: 9.3,
    generation_date: "2024-01-26T14:30:00Z",
    usage_count: 15,
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
  },
  {
    id: 2,
    insight_text: "Los posts con 'proceso creativo' generan 3x más engagement en horario 16:00-20:00",
    confidence_score: 0.88,
    category: "content_timing",
    platform: "instagram",
    generation_date: "2024-01-26T11:30:00Z",
    validation_status: "testing",
  },
  {
    id: 3,
    insight_text: "La combinación de arte + música urbana aumenta retención en 45% en TikTok",
    confidence_score: 0.85,
    category: "content_combination",
    platform: "tiktok",
    generation_date: "2024-01-26T10:15:00Z",
    validation_status: "validated",
  },
]

export const engagementPatterns: EngagementPattern[] = [
  {
    hour: 16,
    day_of_week: "monday",
    platform: "instagram",
    content_type: "photo",
    engagement_score: 7.8,
    optimal_score: 8.5,
  },
  {
    hour: 18,
    day_of_week: "tuesday",
    platform: "tiktok",
    content_type: "video",
    engagement_score: 9.2,
    optimal_score: 9.0,
  },
  {
    hour: 20,
    day_of_week: "wednesday",
    platform: "youtube",
    content_type: "video",
    engagement_score: 8.7,
    optimal_score: 8.8,
  },
  {
    hour: 19,
    day_of_week: "thursday",
    platform: "instagram",
    content_type: "story",
    engagement_score: 6.9,
    optimal_score: 7.5,
  },
  {
    hour: 21,
    day_of_week: "friday",
    platform: "tiktok",
    content_type: "video",
    engagement_score: 9.5,
    optimal_score: 9.2,
  },
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
