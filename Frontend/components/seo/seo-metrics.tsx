"use client"

import { seoMetrics } from "@/lib/seo-agent-data"
import { FileText, Hash, Tag, Clock, CheckCircle, AlertTriangle, Cpu } from "lucide-react"

export function SEOMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-4">
        <div className="flex items-center space-x-2 mb-2">
          <FileText className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-mono text-gray-400">FILES PROCESSED</span>
        </div>
        <div className="text-2xl font-bold text-white font-mono">{seoMetrics.files_processed}</div>
        <div className="text-xs text-blue-400 font-mono">
          {seoMetrics.files_pending} pending • {seoMetrics.files_with_errors} errors
        </div>
      </div>

      <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Tag className="h-4 w-4 text-green-400" />
          <span className="text-xs font-mono text-gray-400">KEYWORDS</span>
        </div>
        <div className="text-2xl font-bold text-white font-mono">{seoMetrics.keywords_generated}</div>
        <div className="text-xs text-green-400 font-mono">auto-generated</div>
      </div>

      <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Hash className="h-4 w-4 text-red-400" />
          <span className="text-xs font-mono text-gray-400">HASHTAGS</span>
        </div>
        <div className="text-2xl font-bold text-white font-mono">{seoMetrics.hashtags_generated}</div>
        <div className="text-xs text-red-400 font-mono">optimized</div>
      </div>

      <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Clock className="h-4 w-4 text-yellow-400" />
          <span className="text-xs font-mono text-gray-400">AVG PROC TIME</span>
        </div>
        <div className="text-2xl font-bold text-white font-mono">{seoMetrics.avg_processing_time.toFixed(1)}s</div>
        <div className="text-xs text-yellow-400 font-mono">per file</div>
      </div>

      <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-4">
        <div className="flex items-center space-x-2 mb-2">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <span className="text-xs font-mono text-gray-400">SUCCESS RATE</span>
        </div>
        <div className="text-2xl font-bold text-white font-mono">{(seoMetrics.success_rate * 100).toFixed(1)}%</div>
        <div className="w-full bg-gray-800 h-1 mt-2">
          <div className="h-1 bg-green-600" style={{ width: `${seoMetrics.success_rate * 100}%` }}></div>
        </div>
      </div>

      <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Cpu className="h-4 w-4 text-purple-400" />
          <span className="text-xs font-mono text-gray-400">WHISPER MODEL</span>
        </div>
        <div className="text-lg font-bold text-white font-mono">
          {seoMetrics.whisper_model_loaded ? "LOADED" : "ERROR"}
        </div>
        <div className={`text-xs font-mono ${seoMetrics.whisper_model_loaded ? "text-green-400" : "text-red-400"}`}>
          {seoMetrics.whisper_model_loaded ? "ready for transcription" : "model not available"}
        </div>
      </div>

      <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-4">
        <div className="flex items-center space-x-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-orange-400" />
          <span className="text-xs font-mono text-gray-400">QUEUE STATUS</span>
        </div>
        <div className="text-2xl font-bold text-white font-mono">{seoMetrics.files_pending}</div>
        <div className="text-xs text-orange-400 font-mono">files waiting</div>
      </div>

      <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-4">
        <div className="flex items-center space-x-2 mb-2">
          <FileText className="h-4 w-4 text-gray-400" />
          <span className="text-xs font-mono text-gray-400">TOTAL ASSETS</span>
        </div>
        <div className="text-2xl font-bold text-white font-mono">
          {seoMetrics.keywords_generated + seoMetrics.hashtags_generated}
        </div>
        <div className="text-xs text-gray-400 font-mono">SEO elements</div>
      </div>
    </div>
  )
}
