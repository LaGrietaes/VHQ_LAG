export interface MediaMetrics {
  photos_managed: number
  videos_managed: number
  total_files: number
  library_size_gb: number
  duplicates_found: number
  files_organized: number
  scan_progress: number
  last_scan: string
  health_status: string
}

export interface MediaFile {
  id: string
  name: string
  path: string
  type: "photo" | "video"
  size_mb: number
  created_date: string
  modified_date: string
  resolution?: string
  duration?: string
  status: "organized" | "duplicate" | "pending" | "archived"
}

export interface ScanJob {
  id: string
  drive: string
  status: "running" | "completed" | "failed" | "queued"
  progress: number
  files_found: number
  started_at: string
  completed_at?: string
  error?: string
}

export const mediaMetrics: MediaMetrics = {
  photos_managed: 15847,
  videos_managed: 3291,
  total_files: 19138,
  library_size_gb: 2847.3,
  duplicates_found: 1205,
  files_organized: 18933,
  scan_progress: 0,
  last_scan: "2024-01-26 14:30:22",
  health_status: "HEALTHY",
}

export const recentFiles: MediaFile[] = [
  {
    id: "file_001",
    name: "IMG_20240126_143022.jpg",
    path: "X:\\Media\\Photos\\2024\\01\\IMG_20240126_143022.jpg",
    type: "photo",
    size_mb: 4.2,
    created_date: "2024-01-26 14:30:22",
    modified_date: "2024-01-26 14:30:22",
    resolution: "4032x3024",
    status: "organized",
  },
  {
    id: "file_002",
    name: "VID_20240125_201545.mp4",
    path: "X:\\Media\\Videos\\2024\\01\\VID_20240125_201545.mp4",
    type: "video",
    size_mb: 127.8,
    created_date: "2024-01-25 20:15:45",
    modified_date: "2024-01-25 20:15:45",
    resolution: "1920x1080",
    duration: "00:02:34",
    status: "organized",
  },
  {
    id: "file_003",
    name: "Screenshot_2024-01-24.png",
    path: "X:\\Media\\Screenshots\\Screenshot_2024-01-24.png",
    type: "photo",
    size_mb: 0.8,
    created_date: "2024-01-24 16:22:11",
    modified_date: "2024-01-24 16:22:11",
    resolution: "1920x1080",
    status: "pending",
  },
]

export const activeScanJobs: ScanJob[] = [
  {
    id: "scan_001",
    drive: "D:\\",
    status: "completed",
    progress: 100,
    files_found: 2847,
    started_at: "2024-01-26 09:00:00",
    completed_at: "2024-01-26 09:45:23",
  },
  {
    id: "scan_002",
    drive: "E:\\",
    status: "running",
    progress: 67,
    files_found: 1205,
    started_at: "2024-01-26 14:15:00",
  },
]
