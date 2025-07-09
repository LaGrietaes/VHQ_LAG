"use client"

import { Card, CardContent } from "@/components/ui/card"
import { clipMetrics } from "@/lib/clip-agent-data"
import { Activity, Clock, Target, Zap } from "lucide-react"

export function ClipMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-b from-gray-900 to-black border-gray-800">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="h-4 w-4 text-orange-400" />
            <span className="text-xs font-mono text-gray-400">VIDEOS PROCESSED</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{clipMetrics.videos_processed_today}</div>
          <div className="text-xs text-orange-400 font-mono">today</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-b from-gray-900 to-black border-gray-800">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="h-4 w-4 text-blue-400" />
            <span className="text-xs font-mono text-gray-400">CLIPS GENERATED</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{clipMetrics.clips_generated_today}</div>
          <div className="text-xs text-blue-400 font-mono">today</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-b from-gray-900 to-black border-gray-800">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="h-4 w-4 text-green-400" />
            <span className="text-xs font-mono text-gray-400">SUCCESS RATE</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{clipMetrics.success_rate}%</div>
          <div className="text-xs text-green-400 font-mono">last 24h</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-b from-gray-900 to-black border-gray-800">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="h-4 w-4 text-yellow-400" />
            <span className="text-xs font-mono text-gray-400">AVG PROCESSING</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{clipMetrics.average_processing_time}</div>
          <div className="text-xs text-yellow-400 font-mono">per video</div>
        </CardContent>
      </Card>
    </div>
  )
}
