"use client"

import { trendAnalysis, platforms } from "@/lib/psico-agent-data"
import { TrendingUp, Brain, Target, Clock, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TrendAnalysis() {
  const getScoreColor = (score: number) => {
    if (score >= 8.5) return "text-green-400"
    if (score >= 7.0) return "text-yellow-400"
    if (score >= 5.0) return "text-orange-400"
    return "text-red-400"
  }

  const getSentimentColor = (score: number) => {
    if (score >= 0.8) return "text-green-400"
    if (score >= 0.6) return "text-yellow-400"
    return "text-red-400"
  }

  const getPlatformIcon = (platform: string) => {
    const platformData = platforms.find((p) => p.id === platform)
    return platformData?.icon || "🌐"
  }

  const getPlatformColor = (platform: string) => {
    const platformData = platforms.find((p) => p.id === platform)
    return platformData?.color || "#666666"
  }

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-red-600" />
          <h2 className="text-lg font-bold text-white font-mono">PSYCHOLOGICAL TREND ANALYSIS</h2>
        </div>
        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-mono">
          ANALYZE NEW TRENDS
        </Button>
      </div>

      <div className="space-y-4">
        {trendAnalysis.map((trend) => (
          <div key={trend.id} className="bg-gray-800 border border-gray-700 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="text-lg">{getPlatformIcon(trend.platform)}</div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono text-white font-bold">{trend.keyword}</span>
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 font-mono">
                      {trend.topic.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 font-mono mt-1">
                    {trend.platform.toUpperCase()} • {new Date(trend.analysis_date).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-xs font-mono">
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-3 w-3 text-green-400" />
                  <span className="text-green-400">+{trend.growth_rate.toFixed(1)}%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3 text-blue-400" />
                  <span className="text-blue-400">PEAK: {trend.peak_hour}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="bg-gray-900 p-3 border border-gray-700">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="h-3 w-3 text-purple-400" />
                  <span className="text-gray-400">ENGAGEMENT SCORE</span>
                </div>
                <div className={`text-lg font-bold ${getScoreColor(trend.engagement_score)}`}>
                  {trend.engagement_score.toFixed(1)}/10
                </div>
                <div className="w-full bg-gray-800 h-1 mt-1">
                  <div className="h-1 bg-purple-600" style={{ width: `${(trend.engagement_score / 10) * 100}%` }}></div>
                </div>
              </div>

              <div className="bg-gray-900 p-3 border border-gray-700">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="h-3 w-3 text-blue-400" />
                  <span className="text-gray-400">SENTIMENT SCORE</span>
                </div>
                <div className={`text-lg font-bold ${getSentimentColor(trend.sentiment_score)}`}>
                  {(trend.sentiment_score * 100).toFixed(0)}%
                </div>
                <div className="w-full bg-gray-800 h-1 mt-1">
                  <div className="h-1 bg-blue-600" style={{ width: `${trend.sentiment_score * 100}%` }}></div>
                </div>
              </div>

              <div className="bg-gray-900 p-3 border border-gray-700">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-3 w-3 text-green-400" />
                  <span className="text-gray-400">GROWTH RATE</span>
                </div>
                <div className="text-lg font-bold text-green-400">+{trend.growth_rate.toFixed(1)}%</div>
                <div className="text-xs text-gray-400 mt-1">last 7 days</div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-700">
              <div className="text-xs text-gray-400 font-mono mb-1">PSYCHOLOGICAL INSIGHTS:</div>
              <div className="text-sm text-gray-300 font-mono">
                High emotional resonance detected • Peak engagement during evening hours • Strong community response
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
