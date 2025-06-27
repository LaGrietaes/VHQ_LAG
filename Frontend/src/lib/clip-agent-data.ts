export interface VideoTask {
  id: string
  filename: string
  status: "processing" | "completed" | "failed" | "queued"
  progress: number
  input_format: string
  output_format: string
  duration: number
  clips_generated?: number
  created_at: string
  estimated_completion?: string
}

export interface ClipMetrics {
  videos_processed_today: number
  clips_generated_today: number
  total_processing_time: string
  success_rate: number
  queue_length: number
  average_processing_time: string
}

export const clipMetrics: ClipMetrics = {
  videos_processed_today: 12,
  clips_generated_today: 47,
  total_processing_time: "2h 34m",
  success_rate: 91,
  queue_length: 3,
  average_processing_time: "4m 23s",
}

export const videoTasks: VideoTask[] = [
  {
    id: "task_001",
    filename: "podcast_episode_142.mp4",
    status: "processing",
    progress: 67,
    input_format: "16:9 1080p",
    output_format: "9:16 1080p",
    duration: 3420, // seconds
    clips_generated: 3,
    created_at: "2024-01-20T14:30:00Z",
    estimated_completion: "2024-01-20T15:45:00Z",
  },
  {
    id: "task_002",
    filename: "interview_tech_ceo.mov",
    status: "queued",
    progress: 0,
    input_format: "16:9 4K",
    output_format: "9:16 1080p",
    duration: 2100,
    created_at: "2024-01-20T14:45:00Z",
    estimated_completion: "2024-01-20T16:30:00Z",
  },
  {
    id: "task_003",
    filename: "gaming_highlights.mp4",
    status: "completed",
    progress: 100,
    input_format: "16:9 1080p",
    output_format: "9:16 1080p",
    duration: 1800,
    clips_generated: 5,
    created_at: "2024-01-20T13:15:00Z",
  },
  {
    id: "task_004",
    filename: "tutorial_video.mp4",
    status: "failed",
    progress: 23,
    input_format: "16:9 720p",
    output_format: "9:16 1080p",
    duration: 900,
    created_at: "2024-01-20T12:00:00Z",
  },
]

export const reframeOptions = [
  { id: "center", name: "Center Crop", description: "Static center crop" },
  { id: "face", name: "Face Tracking", description: "Follow detected faces" },
  { id: "movement", name: "Movement Tracking", description: "Follow motion in video" },
  { id: "smart", name: "Smart Reframe", description: "AI-powered optimal framing" },
]

export const outputFormats = [
  { id: "tiktok", name: "TikTok", resolution: "1080x1920", fps: 30 },
  { id: "instagram", name: "Instagram Reels", resolution: "1080x1920", fps: 30 },
  { id: "youtube", name: "YouTube Shorts", resolution: "1080x1920", fps: 60 },
  { id: "custom", name: "Custom", resolution: "Custom", fps: "Variable" },
]
