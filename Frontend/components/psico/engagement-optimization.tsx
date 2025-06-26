"use client"

import { engagementPatterns } from "@/lib/psico-agent-data"
import { Clock, Calendar, Target, BarChart3, TrendingUp } from "lucide-react"

export function EngagementOptimization() {
  const getOptimizationColor = (current: number, optimal: number) => {
    const ratio = current / optimal
    if (ratio >= 0.95) return "text-green-400"
    if (ratio >= 0.85) return "text-yellow-400"
    if (ratio >= 0.75) return "text-orange-400"
    return "text-red-400"
  }

  const getOptimizationStatus = (current: number, optimal: number) => {
    const ratio = current / optimal
    if (ratio >= 0.95) return "OPTIMAL"
    if (ratio >= 0.85) return "GOOD"
    if (ratio >= 0.75) return "NEEDS IMPROVEMENT"
    return "POOR"
  }

  const getDayColor = (day: string) => {
    const colors = {
      monday: "text-blue-400",
      tuesday: "text-green-400",
      wednesday: "text-purple-400",
      thursday: "text-yellow-400",
      friday: "text-red-400",
      saturday: "text-pink-400",
      sunday: "text-cyan-400",
    }
    return colors[day as keyof typeof colors] || "text-gray-400"
  }

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, "0")}:00`
  }

  // Group patterns by platform
  const patternsByPlatform = engagementPatterns.reduce(
    (acc, pattern) => {
      if (!acc[pattern.platform]) {
        acc[pattern.platform] = []
      }
      acc[pattern.platform].push(pattern)
      return acc
    },
    {} as Record<string, typeof engagementPatterns>,
  )

  return (
    <div className="space-y-6">
      {/* Optimal Timing Overview */}
      <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Clock className="h-5 w-5 text-red-600" />
          <h2 className="text-lg font-bold text-white font-mono">ENGAGEMENT OPTIMIZATION</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 border border-gray-700 p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="h-4 w-4 text-green-400" />
              <span className="text-xs font-mono text-gray-400">OPTIMAL WINDOWS</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono">12</div>
            <div className="text-xs text-green-400 font-mono">identified this week</div>
          </div>

          <div className="bg-gray-800 border border-gray-700 p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-mono text-gray-400">AVG IMPROVEMENT</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono">+34%</div>
            <div className="text-xs text-blue-400 font-mono">engagement boost</div>
          </div>

          <div className="bg-gray-800 border border-gray-700 p-4">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="h-4 w-4 text-purple-400" />
              <span className="text-xs font-mono text-gray-400">PREDICTION ACCURACY</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono">87%</div>
            <div className="text-xs text-purple-400 font-mono">success rate</div>
          </div>
        </div>
      </div>

      {/* Platform-specific Patterns */}
      {Object.entries(patternsByPlatform).map(([platform, patterns]) => (
        <div key={platform} className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="h-4 w-4 text-blue-400" />
            <h3 className="text-md font-bold text-white font-mono">{platform.toUpperCase()} OPTIMIZATION</h3>
          </div>

          <div className="space-y-3">
            {patterns.map((pattern, index) => (
              <div key={index} className="bg-gray-800 border border-gray-700 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-3 w-3 text-blue-400" />
                      <span className="text-sm font-mono text-white">{formatHour(pattern.hour)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-3 w-3 text-purple-400" />
                      <span className={`text-sm font-mono ${getDayColor(pattern.day_of_week)}`}>
                        {pattern.day_of_week.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 font-mono">
                      {pattern.content_type.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-xs font-mono">
                    <span className={getOptimizationColor(pattern.engagement_score, pattern.optimal_score)}>
                      {getOptimizationStatus(pattern.engagement_score, pattern.optimal_score)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-400 font-mono mb-1">CURRENT PERFORMANCE</div>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm font-bold text-white font-mono">
                        {pattern.engagement_score.toFixed(1)}
                      </div>
                      <div className="w-20 bg-gray-700 h-1">
                        <div
                          className="h-1 bg-blue-600"
                          style={{ width: `${(pattern.engagement_score / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-400 font-mono mb-1">OPTIMAL TARGET</div>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm font-bold text-green-400 font-mono">
                        {pattern.optimal_score.toFixed(1)}
                      </div>
                      <div className="w-20 bg-gray-700 h-1">
                        <div
                          className="h-1 bg-green-600"
                          style={{ width: `${(pattern.optimal_score / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="text-xs text-gray-400 font-mono mb-1">OPTIMIZATION RECOMMENDATION:</div>
                  <div className="text-xs text-purple-400 font-mono">
                    {pattern.engagement_score < pattern.optimal_score
                      ? `Increase posting frequency during this window for +${(((pattern.optimal_score - pattern.engagement_score) / pattern.engagement_score) * 100).toFixed(0)}% improvement`
                      : "Maintain current strategy - performing at optimal level"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
