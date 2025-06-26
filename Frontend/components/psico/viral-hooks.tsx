"use client"

import { useState } from "react"
import { viralHooks } from "@/lib/psico-agent-data"
import { Zap, Copy, Edit, Trash2, Plus, Target, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ViralHooks() {
  const [selectedTopic, setSelectedTopic] = useState<string>("all")

  const getSuccessColor = (rate: number) => {
    if (rate >= 0.9) return "text-green-400"
    if (rate >= 0.8) return "text-yellow-400"
    if (rate >= 0.7) return "text-orange-400"
    return "text-red-400"
  }

  const getEngagementColor = (score: number) => {
    if (score >= 9.0) return "text-green-400"
    if (score >= 8.0) return "text-yellow-400"
    if (score >= 7.0) return "text-orange-400"
    return "text-red-400"
  }

  const topics = Array.from(new Set(viralHooks.map((hook) => hook.topic)))
  const filteredHooks = selectedTopic === "all" ? viralHooks : viralHooks.filter((hook) => hook.topic === selectedTopic)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-bold text-white font-mono">VIRAL HOOK GENERATOR</h2>
          </div>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white text-xs font-mono px-3 py-1"
          >
            <option value="all">ALL TOPICS</option>
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic.toUpperCase().replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-mono">
          <Plus className="h-4 w-4 mr-1" />
          GENERATE NEW
        </Button>
      </div>

      <div className="space-y-4">
        {filteredHooks.map((hook) => (
          <div key={hook.id} className="bg-gray-800 border border-gray-700 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Zap className="h-4 w-4 text-yellow-400" />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 font-mono">
                      {hook.topic.toUpperCase().replace("_", " ")}
                    </span>
                    <span className="text-xs bg-blue-700 text-blue-300 px-2 py-1 font-mono">
                      {hook.platform.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 font-mono mt-1">
                    Generated: {new Date(hook.generation_date).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-xs font-mono">
                <div className="flex items-center space-x-1">
                  <Target className="h-3 w-3" />
                  <span className={getSuccessColor(hook.success_rate)}>
                    {(hook.success_rate * 100).toFixed(0)}% SUCCESS
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-3 w-3" />
                  <span className={getEngagementColor(hook.engagement_score)}>
                    {hook.engagement_score.toFixed(1)} ENG
                  </span>
                </div>
                <span className="text-gray-400">USED: {hook.usage_count}x</span>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs text-gray-400 font-mono mb-2">VIRAL HOOK:</div>
              <div className="text-sm text-white font-mono bg-gray-900 p-3 border border-gray-700 leading-relaxed">
                {hook.hook_text}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs text-gray-400 font-mono mb-1">PSYCHOLOGICAL PATTERN:</div>
              <div className="text-xs text-purple-400 font-mono bg-gray-900 p-2 border border-gray-700">
                {hook.pattern.replace(/_/g, " ").toUpperCase()}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-full bg-gray-700 h-1 w-32">
                  <div className="h-1 bg-green-600" style={{ width: `${hook.success_rate * 100}%` }}></div>
                </div>
                <span className="text-xs text-gray-400 font-mono">Success Rate</span>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(hook.hook_text)}
                  className="text-gray-400 hover:text-blue-400 p-1"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-yellow-400 p-1">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-400 p-1">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
