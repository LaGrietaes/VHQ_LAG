"use client"

import { useState } from "react"
import { UnifiedHeader } from "@/components/unified-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Heart, MessageCircle, Share2, TrendingUp } from "lucide-react"

export default function CMAgentPage() {
  const [comments] = useState([
    {
      id: 1,
      platform: "YouTube",
      author: "@user123",
      content: "¡Excelente video! Me ayudó mucho con mi proyecto",
      sentiment: "positive",
      timestamp: "2 min ago",
      replied: false,
    },
    {
      id: 2,
      platform: "Instagram",
      author: "@follower456",
      content: "¿Podrías hacer un tutorial sobre esto?",
      sentiment: "neutral",
      timestamp: "5 min ago",
      replied: true,
    },
    {
      id: 3,
      platform: "Twitter",
      author: "@fan789",
      content: "No me gustó este enfoque, prefiero el anterior",
      sentiment: "negative",
      timestamp: "12 min ago",
      replied: false,
    },
  ])

  const [socialMetrics] = useState({
    youtube: { comments: 1247, likes: 8934, shares: 234 },
    instagram: { comments: 567, likes: 12456, shares: 89 },
    twitter: { comments: 234, likes: 3456, shares: 156 },
    tiktok: { comments: 89, likes: 2345, shares: 67 },
  })

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-400"
      case "negative":
        return "text-red-400"
      default:
        return "text-yellow-400"
    }
  }

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "default"
      case "negative":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <UnifiedHeader
        title="CM AGENT - COMMUNITY MANAGER"
        subtitle="Gestión de comunidad y engagement en redes sociales"
        icon={MessageSquare}
        status="OPERATIONAL"
        agentId="02_CM_LAG"
      />

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="comments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-900 border border-gray-800">
            <TabsTrigger value="comments" className="font-mono">
              COMMENTS
            </TabsTrigger>
            <TabsTrigger value="engagement" className="font-mono">
              ENGAGEMENT
            </TabsTrigger>
            <TabsTrigger value="scheduling" className="font-mono">
              SCHEDULING
            </TabsTrigger>
            <TabsTrigger value="analytics" className="font-mono">
              ANALYTICS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comments" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="font-mono text-white flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5 text-red-600" />
                  <span>RECENT COMMENTS</span>
                </CardTitle>
                <CardDescription className="font-mono text-gray-400">
                  Latest community interactions across all platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="p-4 bg-gray-800 border border-gray-700">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="font-mono text-xs">
                              {comment.platform}
                            </Badge>
                            <span className="text-sm font-mono text-gray-400">{comment.author}</span>
                            <span className="text-xs font-mono text-gray-500">{comment.timestamp}</span>
                          </div>
                          <Badge variant={getSentimentBadge(comment.sentiment)} className="font-mono text-xs">
                            {comment.sentiment}
                          </Badge>
                        </div>
                        <p className="text-sm text-white mb-3">{comment.content}</p>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant={comment.replied ? "default" : "outline"}
                            className="font-mono text-xs"
                          >
                            {comment.replied ? "Replied" : "Reply"}
                          </Button>
                          <Button size="sm" variant="outline" className="font-mono text-xs">
                            Analyze
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(socialMetrics).map(([platform, metrics]) => (
                <Card key={platform} className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-mono text-gray-400 uppercase">{platform}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="h-4 w-4 text-blue-400" />
                        <span className="text-xs font-mono text-gray-400">Comments</span>
                      </div>
                      <span className="text-sm font-mono text-white">{metrics.comments}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Heart className="h-4 w-4 text-red-400" />
                        <span className="text-xs font-mono text-gray-400">Likes</span>
                      </div>
                      <span className="text-sm font-mono text-white">{metrics.likes}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Share2 className="h-4 w-4 text-green-400" />
                        <span className="text-xs font-mono text-gray-400">Shares</span>
                      </div>
                      <span className="text-sm font-mono text-white">{metrics.shares}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="scheduling" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="font-mono text-white">CONTENT SCHEDULING</CardTitle>
                <CardDescription className="font-mono text-gray-400">
                  Automated social media post scheduling
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-400 font-mono">Scheduling interface coming soon...</div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="font-mono text-white flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-red-600" />
                  <span>ENGAGEMENT ANALYTICS</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-400 font-mono">
                  Advanced analytics dashboard coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
