export interface SEOProcessedFile {
  id: number
  filename: string
  file_hash: string
  processed_date: string
  transcription_path?: string
  translation_path?: string
  keywords: string[]
  hashtags: string[]
  language_detected: string
  duration_seconds?: number
  file_size_mb: number
  status: "processing" | "completed" | "error"
  processing_time?: number
}

export interface SEOKeyword {
  id: number
  keyword: string
  source_file: string
  category: string
  relevance_score: number
  engagement_rate: number
  created_date: string
  usage_count: number
}

export interface SEOHashtag {
  id: number
  hashtag: string
  source_file: string
  category: string
  trend_score: number
  engagement_rate: number
  created_date: string
  usage_count: number
}

export interface SEOMetrics {
  files_processed: number
  files_with_errors: number
  files_pending: number
  keywords_generated: number
  hashtags_generated: number
  avg_processing_time: number
  success_rate: number
  whisper_model_loaded: boolean
}

// Mock data for demonstration
export const seoProcessedFiles: SEOProcessedFile[] = [
  {
    id: 1,
    filename: "lagrieta_episode_001.mp4",
    file_hash: "a1b2c3d4e5f6",
    processed_date: "2024-01-26T14:30:00Z",
    transcription_path: "/processed/lagrieta_episode_001_transcription.txt",
    translation_path: "/processed/lagrieta_episode_001_translation.txt",
    keywords: ["arte juvenil", "inspiración urbana", "comunidad creativa"],
    hashtags: ["#LaGrieta", "#ArteJuvenil", "#InspiraciónUrbana"],
    language_detected: "en",
    duration_seconds: 1847,
    file_size_mb: 245.7,
    status: "completed",
    processing_time: 127.3,
  },
  {
    id: 2,
    filename: "street_art_documentary.mp4",
    file_hash: "f6e5d4c3b2a1",
    processed_date: "2024-01-26T13:15:00Z",
    keywords: ["arte callejero", "expresión artística", "cultura urbana"],
    hashtags: ["#ArteCallejero", "#CulturaUrbana", "#Expresión"],
    language_detected: "es",
    file_size_mb: 189.2,
    status: "completed",
    processing_time: 89.7,
  },
  {
    id: 3,
    filename: "youth_interview_raw.mp4",
    file_hash: "1a2b3c4d5e6f",
    processed_date: "2024-01-26T15:45:00Z",
    keywords: [],
    hashtags: [],
    language_detected: "unknown",
    file_size_mb: 156.3,
    status: "processing",
  },
]

export const seoKeywords: SEOKeyword[] = [
  {
    id: 1,
    keyword: "arte juvenil",
    source_file: "lagrieta_episode_001.mp4",
    category: "auto_generated",
    relevance_score: 2.5,
    engagement_rate: 0.87,
    created_date: "2024-01-26T14:30:00Z",
    usage_count: 12,
  },
  {
    id: 2,
    keyword: "inspiración urbana",
    source_file: "lagrieta_episode_001.mp4",
    category: "auto_generated",
    relevance_score: 2.0,
    engagement_rate: 0.73,
    created_date: "2024-01-26T14:30:00Z",
    usage_count: 8,
  },
  {
    id: 3,
    keyword: "comunidad creativa",
    source_file: "lagrieta_episode_001.mp4",
    category: "auto_generated",
    relevance_score: 1.8,
    engagement_rate: 0.65,
    created_date: "2024-01-26T14:30:00Z",
    usage_count: 15,
  },
]

export const seoHashtags: SEOHashtag[] = [
  {
    id: 1,
    hashtag: "#LaGrieta",
    source_file: "lagrieta_episode_001.mp4",
    category: "base_hashtag",
    trend_score: 3.0,
    engagement_rate: 0.92,
    created_date: "2024-01-26T14:30:00Z",
    usage_count: 45,
  },
  {
    id: 2,
    hashtag: "#ArteJuvenil",
    source_file: "lagrieta_episode_001.mp4",
    category: "auto_generated",
    trend_score: 2.3,
    engagement_rate: 0.78,
    created_date: "2024-01-26T14:30:00Z",
    usage_count: 23,
  },
]

export const seoMetrics: SEOMetrics = {
  files_processed: 47,
  files_with_errors: 3,
  files_pending: 8,
  keywords_generated: 142,
  hashtags_generated: 89,
  avg_processing_time: 98.5,
  success_rate: 0.94,
  whisper_model_loaded: true,
}
