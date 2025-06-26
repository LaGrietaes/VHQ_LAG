"use client"

import { useState } from "react"
import { seoKeywords, seoHashtags } from "@/lib/seo-agent-data"
import { Hash, Tag, TrendingUp, BarChart3, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function KeywordsHashtags() {
  const [activeTab, setActiveTab] = useState<"keywords" | "hashtags">("keywords")

  const getEngagementColor = (rate: number) => {
    if (rate >= 0.8) return "text-green-400"
    if (rate >= 0.6) return "text-yellow-400"
    return "text-red-400"
  }

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Tag className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-bold text-white font-mono">SEO ASSETS</h2>
          </div>
          <div className="flex space-x-0">
            <button
              onClick={() => setActiveTab("keywords")}
              className={`px-4 py-2 font-mono text-sm transition-colors ${
                activeTab === "keywords" ? "text-red-400 border-b-2 border-red-600" : "text-gray-400 hover:text-white"
              }`}
            >
              KEYWORDS
            </button>
            <button
              onClick={() => setActiveTab("hashtags")}
              className={`px-4 py-2 font-mono text-sm transition-colors ${
                activeTab === "hashtags" ? "text-red-400 border-b-2 border-red-600" : "text-gray-400 hover:text-white"
              }`}
            >
              HASHTAGS
            </button>
          </div>
        </div>
        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-mono">
          <Plus className="h-4 w-4 mr-1" />
          ADD
        </Button>
      </div>

      {activeTab === "keywords" && (
        <div className="space-y-3">
          {seoKeywords.map((keyword) => (
            <div key={keyword.id} className="bg-gray-800 border border-gray-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <Tag className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-mono text-white font-bold">{keyword.keyword}</span>
                  <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 font-mono">
                    {keyword.category.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-xs font-mono">
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3 text-blue-400" />
                    <span className="text-blue-400">{keyword.relevance_score.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BarChart3 className="h-3 w-3" />
                    <span className={getEngagementColor(keyword.engagement_rate)}>
                      {(keyword.engagement_rate * 100).toFixed(0)}%
                    </span>
                  </div>
                  <span className="text-gray-400">USED: {keyword.usage_count}</span>
                </div>
              </div>
              <div className="text-xs text-gray-400 font-mono">
                SOURCE: {keyword.source_file} • CREATED: {new Date(keyword.created_date).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "hashtags" && (
        <div className="space-y-3">
          {seoHashtags.map((hashtag) => (
            <div key={hashtag.id} className="bg-gray-800 border border-gray-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <Hash className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-mono text-white font-bold">{hashtag.hashtag}</span>
                  <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 font-mono">
                    {hashtag.category.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-xs font-mono">
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3 text-red-400" />
                    <span className="text-red-400">{hashtag.trend_score.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BarChart3 className="h-3 w-3" />
                    <span className={getEngagementColor(hashtag.engagement_rate)}>
                      {(hashtag.engagement_rate * 100).toFixed(0)}%
                    </span>
                  </div>
                  <span className="text-gray-400">USED: {hashtag.usage_count}</span>
                </div>
              </div>
              <div className="text-xs text-gray-400 font-mono">
                SOURCE: {hashtag.source_file} • CREATED: {new Date(hashtag.created_date).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
