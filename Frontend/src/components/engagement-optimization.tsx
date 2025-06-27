"use client"

import { engagementPatterns } from "@/lib/psico-agent-data"
import { Clock, Calendar, Target, BarChart3, TrendingUp } from "lucide-react"

export function EngagementOptimization() {
  const getEngagementColor = (rate: number) => {
    if (rate >= 0.85) return "text-green-400"
    if (rate >= 0.70) return "text-yellow-400"
    if (rate >= 0.50) return "text-orange-400"
    return "text-red-400"
  }

  const getEngagementStatus = (rate: number) => {
    if (rate >= 0.85) return "EXCELLENT"
    if (rate >= 0.70) return "GOOD"
    if (rate >= 0.50) return "AVERAGE"
    return "NEEDS IMPROVEMENT"
  }

  const getActivityColor = (activity: number) => {
    if (activity >= 85) return "text-green-400"
    if (activity >= 70) return "text-yellow-400"
    if (activity >= 50) return "text-orange-400"
    return "text-red-400"
  }

  const getEmotionColor = (emotion: string) => {
    const colors = {
      curiosity: "text-blue-400",
      joy: "text-yellow-400",
      motivation: "text-red-400",
      surprise: "text-purple-400",
      excitement: "text-pink-400",
    }
    return colors[emotion.toLowerCase() as keyof typeof colors] || "text-gray-400"
  }

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
            <div className="text-2xl font-bold text-white font-mono">{engagementPatterns.length}</div>
            <div className="text-xs text-green-400 font-mono">identified patterns</div>
          </div>

          <div className="bg-gray-800 border border-gray-700 p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-mono text-gray-400">AVG ENGAGEMENT</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {Math.round(engagementPatterns.reduce((acc, p) => acc + p.engagement_rate, 0) / engagementPatterns.length * 100)}%
            </div>
            <div className="text-xs text-blue-400 font-mono">across all periods</div>
          </div>

          <div className="bg-gray-800 border border-gray-700 p-4">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="h-4 w-4 text-purple-400" />
              <span className="text-xs font-mono text-gray-400">PEAK ACTIVITY</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {Math.max(...engagementPatterns.map(p => p.audience_activity))}%
            </div>
            <div className="text-xs text-purple-400 font-mono">maximum audience</div>
          </div>
        </div>
      </div>

      {/* Time Period Patterns */}
      <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="h-4 w-4 text-blue-400" />
          <h3 className="text-md font-bold text-white font-mono">TIME PERIOD ANALYSIS</h3>
        </div>

        <div className="space-y-4">
          {engagementPatterns.map((pattern, index) => (
            <div key={index} className="bg-gray-800 border border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-3 w-3 text-blue-400" />
                    <span className="text-sm font-mono text-white">{pattern.time_period}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="h-3 w-3 text-green-400" />
                    <span className="text-sm font-mono text-green-400">{pattern.best_posting_time}</span>
                  </div>
                  <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 font-mono">
                    {pattern.content_type.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center space-x-4 text-xs font-mono">
                  <span className={getEngagementColor(pattern.engagement_rate)}>
                    {getEngagementStatus(pattern.engagement_rate)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-gray-400 font-mono mb-1">ENGAGEMENT RATE</div>
                  <div className="flex items-center space-x-2">
                    <div className={`text-sm font-bold font-mono ${getEngagementColor(pattern.engagement_rate)}`}>
                      {Math.round(pattern.engagement_rate * 100)}%
                    </div>
                    <div className="w-20 bg-gray-700 h-1">
                      <div
                        className="h-1 bg-blue-600"
                        style={{ width: `${pattern.engagement_rate * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-400 font-mono mb-1">AUDIENCE ACTIVITY</div>
                  <div className="flex items-center space-x-2">
                    <div className={`text-sm font-bold font-mono ${getActivityColor(pattern.audience_activity)}`}>
                      {pattern.audience_activity}%
                    </div>
                    <div className="w-20 bg-gray-700 h-1">
                      <div
                        className="h-1 bg-green-600"
                        style={{ width: `${pattern.audience_activity}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-400 font-mono mb-1">EMOTIONAL RESPONSE</div>
                  <div className="flex items-center space-x-2">
                    <div className={`text-sm font-bold font-mono ${getEmotionColor(pattern.emotional_response)}`}>
                      {pattern.emotional_response.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="text-xs text-gray-400 font-mono mb-1">OPTIMIZATION RECOMMENDATION:</div>
                <div className="text-xs text-purple-400 font-mono">
                  {pattern.engagement_rate >= 0.85
                    ? `Peak performance window - maintain current ${pattern.content_type.toLowerCase()} strategy`
                    : pattern.engagement_rate >= 0.70
                    ? `Good engagement - consider increasing ${pattern.content_type.toLowerCase()} frequency during ${pattern.best_posting_time}`
                    : `Improvement needed - test different content types or adjust timing around ${pattern.best_posting_time}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="h-4 w-4 text-purple-400" />
          <h3 className="text-md font-bold text-white font-mono">PERFORMANCE INSIGHTS</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-xs text-gray-400 font-mono">BEST PERFORMING PERIOD</div>
            <div className="text-sm font-bold text-green-400 font-mono">
              {engagementPatterns.reduce((best, current) => 
                current.engagement_rate > best.engagement_rate ? current : best
              ).time_period}
            </div>
            <div className="text-xs text-gray-500 font-mono">
              {Math.round(Math.max(...engagementPatterns.map(p => p.engagement_rate)) * 100)}% engagement rate
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-gray-400 font-mono">RECOMMENDED CONTENT TYPE</div>
            <div className="text-sm font-bold text-blue-400 font-mono">
              {engagementPatterns.reduce((best, current) => 
                current.engagement_rate > best.engagement_rate ? current : best
              ).content_type.toUpperCase()}
            </div>
            <div className="text-xs text-gray-500 font-mono">
              Triggers {engagementPatterns.reduce((best, current) => 
                current.engagement_rate > best.engagement_rate ? current : best
              ).emotional_response.toLowerCase()} response
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
