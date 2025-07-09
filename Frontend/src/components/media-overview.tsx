"use client"

import { mediaMetrics, recentFiles } from "@/lib/media-agent-data"
import { Button } from "@/components/ui/button"
import { HardDrive, ImageIcon, Video, Archive, CheckCircle, Clock, FolderOpen } from "lucide-react"

export function MediaOverview() {
  const formatFileSize = (sizeGb: number) => {
    if (sizeGb >= 1000) {
      return `${(sizeGb / 1000).toFixed(1)}TB`
    }
    return `${sizeGb.toFixed(1)}GB`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Storage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <ImageIcon className="h-4 w-4 text-blue-400" />
            <span className="text-xs font-mono text-gray-400">PHOTOS MANAGED</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{mediaMetrics.photos_managed.toLocaleString()}</div>
          <div className="text-xs text-blue-400 font-mono">organized files</div>
        </div>

        <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Video className="h-4 w-4 text-red-400" />
            <span className="text-xs font-mono text-gray-400">VIDEOS MANAGED</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{mediaMetrics.videos_managed.toLocaleString()}</div>
          <div className="text-xs text-red-400 font-mono">video files</div>
        </div>

        <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <HardDrive className="h-4 w-4 text-green-400" />
            <span className="text-xs font-mono text-gray-400">LIBRARY SIZE</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{formatFileSize(mediaMetrics.library_size_gb)}</div>
          <div className="text-xs text-green-400 font-mono">total storage</div>
        </div>

        <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Archive className="h-4 w-4 text-yellow-400" />
            <span className="text-xs font-mono text-gray-400">DUPLICATES</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {mediaMetrics.duplicates_found.toLocaleString()}
          </div>
          <div className="text-xs text-yellow-400 font-mono">archived files</div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <h2 className="text-lg font-bold text-white font-mono">SYSTEM HEALTH</h2>
          </div>
          <div className="text-xs text-green-400 font-mono">{mediaMetrics.health_status}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-bold text-gray-400 font-mono mb-3">ORGANIZATION STATUS</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-300">Files Organized:</span>
                <span className="text-green-400">{mediaMetrics.files_organized.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-300">Total Files:</span>
                <span className="text-blue-400">{mediaMetrics.total_files.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-800 h-2">
                <div
                  className="h-2 bg-green-600"
                  style={{ width: `${(mediaMetrics.files_organized / mediaMetrics.total_files) * 100}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-400 font-mono">
                {((mediaMetrics.files_organized / mediaMetrics.total_files) * 100).toFixed(1)}% organized
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-400 font-mono mb-3">LAST SCAN</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-mono text-white">{mediaMetrics.last_scan}</span>
              </div>
              <div className="text-xs text-gray-400 font-mono">Scan completed successfully</div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-400 font-mono mb-3">QUICK ACTIONS</h3>
            <div className="space-y-2">
              <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs">
                <HardDrive className="h-3 w-3 mr-1" />
                SCAN DRIVES
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full border-green-600 text-green-400 hover:bg-green-600 hover:text-white font-mono text-xs"
              >
                <FolderOpen className="h-3 w-3 mr-1" />
                ORGANIZE FILES
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Files */}
      <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Clock className="h-5 w-5 text-red-600" />
          <h2 className="text-lg font-bold text-white font-mono">RECENT FILES</h2>
        </div>

        <div className="space-y-3">
          {recentFiles.map((file) => (
            <div key={file.id} className="bg-gray-800 border border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {file.type === "photo" ? (
                    <ImageIcon className="h-5 w-5 text-blue-400" />
                  ) : (
                    <Video className="h-5 w-5 text-red-400" />
                  )}
                  <div>
                    <div className="text-sm font-mono text-white font-bold">{file.name}</div>
                    <div className="text-xs text-gray-400 font-mono">{file.path}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-xs font-mono">
                  <div className="text-gray-400">{file.size_mb}MB</div>
                  <div className="text-gray-400">{file.resolution}</div>
                  {file.duration && <div className="text-gray-400">{file.duration}</div>}
                  <span
                    className={`px-2 py-1 border ${
                      file.status === "organized"
                        ? "text-green-400 border-green-600"
                        : file.status === "pending"
                          ? "text-yellow-400 border-yellow-600"
                          : file.status === "duplicate"
                            ? "text-red-400 border-red-600"
                            : "text-gray-400 border-gray-600"
                    }`}
                  >
                    {file.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
