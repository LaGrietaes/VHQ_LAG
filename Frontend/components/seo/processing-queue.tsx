"use client"

import { seoProcessedFiles } from "@/lib/seo-agent-data"
import { Play, FileText, Clock, CheckCircle, AlertCircle, Languages } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ProcessingQueue() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "processing":
        return <Clock className="h-4 w-4 text-blue-400 glitch-dot" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-400" />
      default:
        return <FileText className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400"
      case "processing":
        return "text-blue-400"
      case "error":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Play className="h-5 w-5 text-red-600" />
          <h2 className="text-lg font-bold text-white font-mono">PROCESSING QUEUE</h2>
        </div>
        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-mono">
          PROCESS ALL
        </Button>
      </div>

      <div className="space-y-3">
        {seoProcessedFiles.map((file) => (
          <div key={file.id} className="bg-gray-800 border border-gray-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                {getStatusIcon(file.status)}
                <span className="text-sm font-mono text-white">{file.filename}</span>
                <span className={`text-xs font-mono ${getStatusColor(file.status)}`}>{file.status.toUpperCase()}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-400 font-mono">
                <Languages className="h-3 w-3" />
                <span>{file.language_detected.toUpperCase()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <span className="text-gray-400">SIZE:</span>
                <span className="text-white ml-1">{file.file_size_mb.toFixed(1)}MB</span>
              </div>
              {file.duration_seconds && (
                <div>
                  <span className="text-gray-400">DURATION:</span>
                  <span className="text-white ml-1">{formatDuration(file.duration_seconds)}</span>
                </div>
              )}
              {file.processing_time && (
                <div>
                  <span className="text-gray-400">PROC TIME:</span>
                  <span className="text-white ml-1">{file.processing_time.toFixed(1)}s</span>
                </div>
              )}
              <div>
                <span className="text-gray-400">KEYWORDS:</span>
                <span className="text-red-400 ml-1">{file.keywords.length}</span>
              </div>
            </div>

            {file.keywords.length > 0 && (
              <div className="mt-3">
                <div className="text-xs text-gray-400 font-mono mb-1">KEYWORDS:</div>
                <div className="flex flex-wrap gap-1">
                  {file.keywords.slice(0, 3).map((keyword, index) => (
                    <span key={index} className="text-xs bg-gray-700 text-green-400 px-2 py-1 font-mono">
                      {keyword}
                    </span>
                  ))}
                  {file.keywords.length > 3 && (
                    <span className="text-xs text-gray-500 font-mono">+{file.keywords.length - 3}</span>
                  )}
                </div>
              </div>
            )}

            {file.hashtags.length > 0 && (
              <div className="mt-2">
                <div className="text-xs text-gray-400 font-mono mb-1">HASHTAGS:</div>
                <div className="flex flex-wrap gap-1">
                  {file.hashtags.map((hashtag, index) => (
                    <span key={index} className="text-xs bg-gray-700 text-blue-400 px-2 py-1 font-mono">
                      {hashtag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
