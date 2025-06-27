"use client"

import { audienceInsights } from "@/lib/psico-agent-data"
import { Brain, CheckCircle, Clock, AlertTriangle, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AudienceInsights() {
  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return "text-green-400"
    if (score >= 0.8) return "text-yellow-400"
    if (score >= 0.7) return "text-orange-400"
    return "text-red-400"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "validated":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "testing":
        return <Clock className="h-4 w-4 text-yellow-400" />
      case "hypothesis":
        return <AlertTriangle className="h-4 w-4 text-orange-400" />
      default:
        return <Lightbulb className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "validated":
        return "text-green-400 border-green-600"
      case "testing":
        return "text-yellow-400 border-yellow-600"
      case "hypothesis":
        return "text-orange-400 border-orange-600"
      default:
        return "text-gray-400 border-gray-600"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "emotional_triggers":
        return "text-red-400"
      case "content_timing":
        return "text-blue-400"
      case "content_combination":
        return "text-purple-400"
      case "audience_behavior":
        return "text-green-400"
      default:
        return "text-gray-400"
    }
  }

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-red-600" />
          <h2 className="text-lg font-bold text-white font-mono">AUDIENCE PSYCHOLOGICAL INSIGHTS</h2>
        </div>
        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-mono">
          GENERATE INSIGHTS
        </Button>
      </div>

      <div className="space-y-4">
        {audienceInsights.map((insight) => (
          <div key={insight.id} className="bg-gray-800 border border-gray-700 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                {getStatusIcon(insight.validation_status)}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 border font-mono ${getStatusColor(insight.validation_status)}`}>
                      {insight.validation_status.toUpperCase()}
                    </span>
                    <span className={`text-xs px-2 py-1 font-mono ${getCategoryColor(insight.category)}`}>
                      {insight.category.toUpperCase().replace("_", " ")}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 font-mono mt-1">
                    {insight.platform.toUpperCase()} • {new Date(insight.generation_date).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="text-xs font-mono text-gray-400">CONFIDENCE:</div>
                <div className={`text-sm font-bold font-mono ${getConfidenceColor(insight.confidence_score)}`}>
                  {(insight.confidence_score * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-sm text-white font-mono leading-relaxed bg-gray-900 p-3 border border-gray-700">
                {insight.insight_text}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-xs font-mono">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">CONFIDENCE LEVEL:</span>
                  <div className="w-24 bg-gray-700 h-1">
                    <div
                      className={`h-1 ${
                        insight.confidence_score >= 0.9
                          ? "bg-green-600"
                          : insight.confidence_score >= 0.8
                            ? "bg-yellow-600"
                            : "bg-orange-600"
                      }`}
                      style={{ width: `${insight.confidence_score * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {insight.validation_status === "validated" && (
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs font-mono">
                    APPLY INSIGHT
                  </Button>
                )}
                {insight.validation_status === "testing" && (
                  <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-black text-xs font-mono">
                    VIEW TEST
                  </Button>
                )}
                {insight.validation_status === "hypothesis" && (
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono">
                    START TEST
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
